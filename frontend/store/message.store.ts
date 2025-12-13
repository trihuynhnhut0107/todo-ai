import { create } from 'zustand';

// 1. Cập nhật Interface cho Message, ID bây giờ là number
interface Message {
  id: number;
  text: string;
  author: string | null | undefined;
  timestamp: number;
}

// 2. Cập nhật Interface cho State (thêm nextId) và Action
interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  nextId: number; // Biến đếm ID

  // Action bây giờ nhận text và author, không nhận cả object Message
  addMessage: (text: string, author: string | null | undefined) => void;
  resetMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  // 3. Cập nhật State ban đầu
  messages: [],
  isLoading: false,
  error: null,
  nextId: 1, // Bắt đầu đếm từ 1

  // 4. Cập nhật Action `addMessage`
  addMessage: (text, author) =>
    set((state) => {
      // Tạo tin nhắn mới với ID từ "biến đếm"
      const newMessage: Message = {
        id: state.nextId, // Lấy ID hiện tại
        text: text,
        author: author,
        timestamp: Date.now(),
      };

      // Trả về state mới
      return {
        messages: [...state.messages, newMessage], // Thêm tin nhắn mới
        nextId: state.nextId + 1, // Tăng biến đếm lên 1 cho lần sau
      };
    }),

  resetMessages: () =>
    set({ messages: [], nextId: 1 }), // Reset cả messages và nextId
  
  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error: error }),
}));