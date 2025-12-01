export interface ChatMessageReq {
  sessionId: string;
  senderId: string;
  content: string;
  senderType: "user"
}