// hooks/useCalendarSync.ts
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { addEventToCalendar, getAppCalendarId, removeTodoFromCalendar, updateCalendarEvent } from '@/services/calendar';
import { CalendarDrift } from '@/types/calender';
import * as Calendar from 'expo-calendar';
import { getEvents } from '@/services/event';


// Cấu hình cách thông báo hiển thị khi App đang mở
Notifications.setNotificationHandler({
    handleNotification: async (notification): Promise<Notifications.NotificationBehavior> => {
        // Nếu là silent notification -> Không hiện gì cả
        if (notification.request.content.data.silent) {
            return {
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: false,
                shouldShowBanner: false,
                shouldShowList: false,
            };
        }
        // Nếu là thông báo thường -> Hiện như bình thường
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});



export function useCalendarSync() {
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const [appEvents, setAppEvents] = useState<any[]>([]);
    const [isFetched, setIsFetched] = useState(false); // Flag để biết đã load xong chưa

    // 1. Fetch dữ liệu từ Backend khi mở App
    useEffect(() => {
        let isMounted = true;
        getEvents({})
            .then((events) => {
                if (isMounted) {
                    setAppEvents(events);
                    setIsFetched(true); // Đánh dấu đã load xong
                }
            })
            .catch((err) => {
                console.error("Lỗi lấy danh sách Event từ Backend:", err);
            });

        return () => { isMounted = false; };
    }, []);

    // 2. Logic Sync ngược (Device -> App) chạy khi đã fetch xong
    useEffect(() => {
        const syncDeviceChanges = async () => {
            // Chỉ chạy khi đã lấy được dữ liệu từ Backend (dù rỗng hay có)
            if (!isFetched) return;

            console.log("🔄 Đang kiểm tra đồng bộ ngược (Device -> App)...");

            // Sửa lỗi 2: Xin quyền trước khi quét
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                console.log("⚠️ Không có quyền truy cập lịch để kiểm tra đồng bộ.");
                return;
            }

            const changes = await checkCalendarDrift(appEvents);
            console.log("Phát hiện thay đổi từ Device:", appEvents);

            if (changes.length > 0) {
                console.log("⚠️ Phát hiện thay đổi trên thiết bị:", changes);

                for (const change of changes) {
                    switch (change.type) {
                        case 'MODIFIED_ON_DEVICE':
                            // TODO: Gọi API Backend update
                            console.log(`[API CALL] Update Event ${change.appEventId} theo device data:`, change.diff);
                            break;

                        case 'DELETED_ON_DEVICE':
                            // TODO: Gọi API Backend xóa hoặc bỏ sync
                            console.log(`[API CALL] Xóa Event ${change.appEventId} vì đã mất trên device.`);
                            break;

                        case 'CREATED_ON_DEVICE':
                            // TODO: Gọi API Backend tạo mới
                            console.log(`[API CALL] Import Event mới từ device:`, change.diff?.title);
                            break;
                    }
                }
            } else {
                console.log("✅ Dữ liệu Device và App đã khớp.");
            }
        };

        // Delay nhẹ để UI render xong mới chạy logic nặng
        if (isFetched) {
            const timeout = setTimeout(syncDeviceChanges, 1000);
            return () => clearTimeout(timeout);
        }
    }, [isFetched, appEvents]); // Chạy khi isFetched = true

    useEffect(() => {
        registerForPushNotificationsAsync();

        // LẮNG NGHE THÔNG BÁO ĐẾN
        notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
            const data = notification.request.content.data as Record<string, any>;

            console.log("📩 Nhận thông báo:", data);

            // Kiểm tra xem có phải là lệnh Silent Sync không
            if (data.silent) {
                const { type, event, eventId } = data;

                // --- LOGIC XỬ LÝ LỊCH ---
                try {
                    if (type === 'event_created' && event) {
                        console.log("Xử lý tạo sự kiện lịch:", event);
                        const payload = {
                            title: event.name,
                            description: event.description,
                            startDate: event.start,
                            endDate: event.end,
                            location: event.location,
                        };
                        await addEventToCalendar(payload);
                    }

                    else if (type === 'event_updated' && event) {
                        console.log("Xử lý cập nhật sự kiện lịch:", event);
                        const payload = {
                            id: "382",
                            title: event.name,
                            description: event.description,
                            startDate: event.start,
                            endDate: event.end,
                            location: event.location,
                        };
                        await updateCalendarEvent(payload);
                    }

                    else if (type === 'event_deleted' && eventId) {
                        console.log("Xử lý xóa sự kiện lịch:", eventId);
                        await removeTodoFromCalendar("380");
                    }
                } catch (error) {
                    console.error("Lỗi xử lý Silent Sync:", error);
                }
            }
        });

        return () => {
            notificationListener.current?.remove();
        };
    }, []);
}

// Hàm phụ trợ: Tạo Channel và xin quyền
async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('calendar-sync', {
            name: 'Calendar Sync',
            importance: Notifications.AndroidImportance.LOW,
            showBadge: false,
            sound: null,
            vibrationPattern: [0, 0],
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.log('❌ Không được cấp quyền thông báo!');
        return;
    }

    // Lấy Project ID từ app.json (expo.extra.eas.projectId)
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
        console.warn('⚠️ Không tìm thấy projectId trong app.json (expo.extra.eas.projectId).');
        return;
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        console.log("👉 COPY TOKEN NÀY ĐỂ TEST:", tokenData.data);
        return tokenData.data;
    } catch (error) {
        console.error("❌ Lỗi lấy Token:", error);
    }
}

export async function checkCalendarDrift(
    appEvents: any[] // Thay bằng Interface TodoItem/Event của bạn
): Promise<CalendarDrift[]> {
    try {
        const calendarId = await getAppCalendarId();

        // Khoảng thời gian quét (Ví dụ: -1 tháng đến +3 tháng)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        // Lấy sự kiện từ thiết bị
        const nativeEvents = await Calendar.getEventsAsync(
            [calendarId],
            startDate,
            endDate
        );

        const driftReport: CalendarDrift[] = [];

        // --- A. Kiểm tra sự kiện cũ: So sánh từng trường ---
        for (const appEvent of appEvents) {
            if (!appEvent.calendarEventId) continue;

            const native = nativeEvents.find(n => n.id === appEvent.calendarEventId);

            if (!native) {
                // TRƯỜNG HỢP 1: Đã bị xóa trên máy
                driftReport.push({
                    type: 'DELETED_ON_DEVICE',
                    appEventId: appEvent.id,
                    nativeEventId: appEvent.calendarEventId
                });
            } else {
                // TRƯỜNG HỢP 2: Kiểm tra xem có sửa gì không?
                const diff: CalendarDrift['diff'] = {};
                let hasChange = false;

                // 1. So sánh Title
                // (Dùng || '' để tránh lỗi so sánh null với undefined)
                if ((appEvent.title || '').trim() !== (native.title || '').trim()) {
                    diff.title = native.title;
                    hasChange = true;
                }

                // 2. So sánh Notes (App gọi là description, Native gọi là notes)
                if ((appEvent.description || '').trim() !== (native.notes || '').trim()) {
                    diff.notes = native.notes;
                    hasChange = true;
                }

                // 3. So sánh Location
                if ((appEvent.location || '').trim() !== (native.location || '').trim()) {
                    diff.location = native.location;
                    hasChange = true;
                }

                // 4. So sánh Thời gian (Chênh lệch > 1 phút mới tính)
                const appStart = new Date(appEvent.deadline || appEvent.startDate).getTime();
                const nativeStart = new Date(native.startDate).getTime();

                if (Math.abs(appStart - nativeStart) > 60000) {
                    diff.startDate = native.startDate; // native.startDate là string ISO sẵn
                    diff.endDate = native.endDate;
                    hasChange = true;
                }

                // Nếu phát hiện bất kỳ thay đổi nào -> Đẩy vào báo cáo
                if (hasChange) {
                    driftReport.push({
                        type: 'MODIFIED_ON_DEVICE',
                        appEventId: appEvent.id,
                        nativeEventId: native.id,
                        diff: diff // Trả về object chứa các trường cần update
                    });
                }
            }
        }

        // --- B. Kiểm tra sự kiện mới ---
        const appCalendarIds = new Set(appEvents.map(e => e.calendarEventId));

        for (const native of nativeEvents) {
            if (!appCalendarIds.has(native.id)) {
                // TRƯỜNG HỢP 3: Mới tạo trên máy
                driftReport.push({
                    type: 'CREATED_ON_DEVICE',
                    nativeEventId: native.id,
                    diff: {
                        title: native.title,
                        notes: native.notes,
                        location: native.location,
                        startDate: native.startDate,
                        endDate: native.endDate
                    }
                });
            }
        }

        return driftReport;

    } catch (error) {
        console.error("Lỗi checkCalendarDrift:", error);
        return [];
    }
}
