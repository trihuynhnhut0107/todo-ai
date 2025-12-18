import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

// 1. Định nghĩa Interface cho Todo của bạn
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  deadline: string | Date; // Hỗ trợ cả string ISO hoặc Date object
  isCompleted: boolean;
  calendarEventId?: string; // ID lưu trữ liên kết với Calendar
}

// Tên hiển thị của lịch trong ứng dụng Lịch (Google Calendar / Apple Calendar)
const CALENDAR_TITLE = 'Todo AI Calendar';
const CALENDAR_COLOR = '#2196F3';

/**
 * Hàm trợ giúp để lấy Source lịch mặc định (Cần thiết cho iOS)
 */
async function getDefaultCalendarSource(): Promise<Calendar.Source> {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

/**
 * Hàm lấy ID của lịch 'Todo AI'. Nếu chưa có sẽ tự tạo mới.
 */
export async function getAppCalendarId(): Promise<string> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // Tìm xem lịch của App đã tồn tại chưa
  const existingCalendar = calendars.find((c) => c.title === CALENDAR_TITLE);
  
  if (existingCalendar) {
    return existingCalendar.id;
  }

  // Nếu chưa có, tạo cấu hình Source (Nguồn lưu trữ lịch)
  let source: Calendar.Source;

  if (Platform.OS === 'ios') {
    source = await getDefaultCalendarSource();
  } else {
    // Android: Tạo một local calendar
    source = {
      isLocalAccount: true,
      name: 'Todo AI Local',
      type: Calendar.SourceType.LOCAL,
    };
  }

  // Tạo lịch mới
  const newCalendarId = await Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: CALENDAR_COLOR,
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: source.id,
    source: source,
    name: 'todoAiCalendarInternal',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return newCalendarId;
}

/**
 * Hàm chính: Sync Todo sang Calendar (Tạo mới hoặc Cập nhật)
 * @param todo Đối tượng Todo cần sync
 * @returns Trả về eventId (string) nếu thành công, hoặc null nếu lỗi
 */
export async function syncTodoToCalendar(todo: TodoItem): Promise<string | null> {
  try {
    // 1. Kiểm tra quyền
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền Lịch để sử dụng tính năng này.');
      return null;
    }

    // 2. Lấy ID lịch
    const calendarId = await getAppCalendarId();

    // 3. Chuẩn bị dữ liệu sự kiện
    const deadlineDate = new Date(todo.deadline);
    // Tạo thời gian kết thúc (Mặc định là deadline + 1 tiếng)
    const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000);

    const eventConfig:Partial<Calendar.Event> = {
      title: `[Todo] ${todo.title}`,
      startDate: deadlineDate,
      endDate: endDate,
      timeZone: 'Asia/Ho_Chi_Minh', // Hoặc dùng Localization.timezone
      notes: todo.description || 'Được tạo từ ứng dụng Todo AI',
      alarms: [{ relativeOffset: -15 }], // Nhắc trước 15 phút
    };

    // 4. Logic Sync (Update hoặc Create)
    if (todo.calendarEventId) {
      try {
        // Kiểm tra xem event cũ còn tồn tại không
        const existingEvent = await Calendar.getEventAsync(todo.calendarEventId);
        
        if (existingEvent) {
          // Nếu còn -> Update
          await Calendar.updateEventAsync(todo.calendarEventId, eventConfig);
          console.log(`[Calendar] Updated event: ${todo.calendarEventId}`);
          return todo.calendarEventId;
        }
      } catch (error) {
        console.warn('[Calendar] Event cũ không tìm thấy, sẽ tạo mới...');
      }
    }

    // Nếu chưa có ID hoặc event cũ bị xóa -> Tạo mới
    const newEventId = await Calendar.createEventAsync(calendarId, eventConfig);
    console.log(`[Calendar] Created new event: ${newEventId}`);
    return newEventId;

  } catch (error) {
    console.error('[Calendar] Sync Error:', error);
    Alert.alert('Lỗi', 'Không thể đồng bộ lịch.');
    return null;
  }
}

/**
 * Hàm xóa sự kiện khỏi lịch
 */
export async function removeTodoFromCalendar(calendarEventId?: string): Promise<void> {
  if (!calendarEventId) return;

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return;

    await Calendar.deleteEventAsync(calendarEventId);
    console.log(`[Calendar] Deleted event: ${calendarEventId}`);
  } catch (error) {
    console.log('[Calendar] Không thể xóa (có thể đã bị xóa trước đó)');
  }
}

export async function addEventToCalendar(
  title: string,
  notes: string,
  date: string | Date
): Promise<string | null> {
  try {
    // 1. Xin quyền truy cập
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thiếu quyền', 'Cần quyền truy cập lịch để thêm sự kiện.');
      return null;
    }

    // 2. Lấy ID của quyển lịch 'Todo AI'
    const calendarId = await getAppCalendarId();

    // 3. Xử lý thời gian
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Mặc định sự kiện dài 1 tiếng

    // 4. Cấu hình sự kiện (Sử dụng Partial<Calendar.Event> để tránh lỗi TS)
    const eventDetails: Partial<Calendar.Event> = {
      title: title,
      startDate: startDate,
      endDate: endDate,
      timeZone: 'Asia/Ho_Chi_Minh', // Quan trọng cho Android
      location: 'Trên ứng dụng Todo AI',
      notes: notes,
      alarms: [{ relativeOffset: -10 }], // Nhắc trước 10 phút
    };

    // 5. Gọi API tạo sự kiện
    const newEventId = await Calendar.createEventAsync(calendarId, eventDetails);
    
    console.log(`Đã tạo sự kiện mới với ID: ${newEventId}`);
    return newEventId; // Trả về ID để bạn lưu vào Database

  } catch (error) {
    console.error('Lỗi khi thêm lịch:', error);
    Alert.alert('Lỗi', 'Không thể thêm vào lịch.');
    return null;
  }
}