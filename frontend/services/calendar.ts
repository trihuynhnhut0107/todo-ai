import { AddCalenderReq, CalendarEvent } from '@/types/calender';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';



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

// /**
//  * Hàm chính: Sync Todo sang Calendar (Tạo mới hoặc Cập nhật)
//  * @param todo Đối tượng Todo cần sync
//  * @returns Trả về eventId (string) nếu thành công, hoặc null nếu lỗi
//  */
// export async function syncTodoToCalendar(todo: TodoItem): Promise<string | null> {
//   try {
//     // 1. Kiểm tra quyền
//     const { status } = await Calendar.requestCalendarPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền Lịch để sử dụng tính năng này.');
//       return null;
//     }

//     // 2. Lấy ID lịch
//     const calendarId = await getAppCalendarId();

//     // 3. Chuẩn bị dữ liệu sự kiện
//     const startDate = new Date(todo.startDate);
//     const endDate = new Date(todo.endDate);

//     const eventConfig:Partial<Calendar.Event> = {
//       title: `[Todo] ${todo.title}`,
//       startDate: startDate,
//       endDate: endDate,
//       timeZone: 'Asia/Ho_Chi_Minh', // Hoặc dùng Localization.timezone
//       notes: todo.description || 'Được tạo từ ứng dụng Todo AI',
//       alarms: [{ relativeOffset: -15 }], // Nhắc trước 15 phút
//     };

//     // 4. Logic Sync (Update hoặc Create)
//     if (todo.calendarEventId) {
//       try {
//         // Kiểm tra xem event cũ còn tồn tại không
//         const existingEvent = await Calendar.getEventAsync(todo.calendarEventId);
        
//         if (existingEvent) {
//           // Nếu còn -> Update
//           await Calendar.updateEventAsync(todo.calendarEventId, eventConfig);
//           console.log(`[Calendar] Updated event: ${todo.calendarEventId}`);
//           return todo.calendarEventId;
//         }
//       } catch (error) {
//         console.warn('[Calendar] Event cũ không tìm thấy, sẽ tạo mới...');
//       }
//     }

//     // Nếu chưa có ID hoặc event cũ bị xóa -> Tạo mới
//     const newEventId = await Calendar.createEventAsync(calendarId, eventConfig);
//     console.log(`[Calendar] Created new event: ${newEventId}`);
//     return newEventId;

//   } catch (error) {
//     console.error('[Calendar] Sync Error:', error);
//     Alert.alert('Lỗi', 'Không thể đồng bộ lịch.');
//     return null;
//   }
// }

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

export async function addEventToCalendar(req: AddCalenderReq): Promise<string | null> {
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
    const startDateObj = new Date(req.startDate);
    const endDateObj = new Date(req.endDate);

    // 4. Cấu hình sự kiện (Sử dụng Partial<Calendar.Event> để tránh lỗi TS)
    const eventDetails: Partial<Calendar.Event> = {
      title: req.title,
      startDate: startDateObj,
      endDate: endDateObj,
      notes: req.description,
      timeZone: 'Asia/Ho_Chi_Minh', // Quan trọng cho Android
      location: req.location || 'Trên ứng dụng Todo AI',
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

/**
 * Hàm cập nhật sự kiện đã có trên lịch
 * @param calendarEventId ID của sự kiện cần sửa (Bắt buộc)
 * @param title Tiêu đề mới
 * @param notes Ghi chú mới
 * @param date Thời gian bắt đầu mới
 * @returns Trả về true nếu thành công, false nếu thất bại
 */
export async function updateCalendarEvent(req:CalendarEvent): Promise<boolean> {
  // Kiểm tra đầu vào cơ bản
  if (!req.id) {
    console.warn('[Calendar] Không có ID sự kiện để cập nhật');
    return false;
  }

  try {
    // 1. Xin quyền truy cập (Luôn cần thiết để đảm bảo app không bị crash)
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thiếu quyền', 'Cần quyền truy cập lịch để cập nhật sự kiện.');
      return false;
    }

    // 2. Kiểm tra xem sự kiện này còn tồn tại trên điện thoại không
    // (Phòng trường hợp người dùng đã xóa tay trong ứng dụng Lịch)
    let existingEvent;
    try {
      existingEvent = await Calendar.getEventAsync(req.id);
    } catch (e) {
      console.warn('[Calendar] Không tìm thấy sự kiện gốc, có thể đã bị xóa.');
      existingEvent = null;
    }

    if (!existingEvent) {
      Alert.alert('Lỗi', 'Sự kiện này không còn tồn tại trên lịch.');
      return false;
    }

    // 3. Xử lý thời gian
    const startDate = new Date(req.startDate);
    // Giữ nguyên logic cũ: sự kiện kéo dài 1 tiếng
    const endDate = new Date(req.endDate); 

    // 4. Cấu hình thông tin mới
    const eventDetails: Partial<Calendar.Event> = {
      title: req.title,
      startDate: startDate,
      endDate: endDate,
      timeZone: 'Asia/Ho_Chi_Minh', // Đảm bảo múi giờ không bị lệch trên Android
      notes: req.description,
      // Nếu muốn giữ nguyên báo thức cũ thì không cần truyền alarms, 
      // hoặc truyền mới để ghi đè:
      alarms: [{ relativeOffset: -10 }], 
    };

    // 5. Gọi API cập nhật
    await Calendar.updateEventAsync(req.id, eventDetails);
    
    console.log(`[Calendar] Đã cập nhật thành công sự kiện: ${req.id}`);
    return true;

  } catch (error) {
    console.error('[Calendar] Lỗi khi cập nhật:', error);
    Alert.alert('Lỗi', 'Không thể cập nhật sự kiện này.');
    return false;
  }
}

/**
 * Hàm chỉ cập nhật riêng trường Location (Địa điểm)
 * @param calendarEventId ID của sự kiện cần sửa
 * @param newLocation Địa điểm mới (Ví dụ: "Phòng họp 1" hoặc Link Google Maps)
 */
export async function updateEventLocation(
  calendarEventId: string,
  newLocation: string
): Promise<boolean> {
  
  if (!calendarEventId) {
    console.warn('[Calendar] Không có ID để cập nhật location');
    return false;
  }

  try {
    // 1. Vẫn cần kiểm tra quyền để tránh crash
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập lịch để cập nhật địa điểm.');
      return false;
    }

    // 2. Gọi hàm update với object chỉ chứa location
    // Các thông tin khác (title, startDate, endDate...) sẽ KHÔNG bị mất
    await Calendar.updateEventAsync(calendarEventId, {
      location: newLocation
    });

    console.log(`[Calendar] Đã cập nhật location cho event ${calendarEventId}`);
    return true;

  } catch (error) {
    console.error('[Calendar] Lỗi cập nhật location:', error);
    // Trường hợp hay gặp nhất là ID không còn tồn tại
    return false;
  }
}