export interface ChatMessageReq {
  sessionId: string;
  senderId: string;
  content: string;
  senderType: "user";
  metadata: {additionalProp1?: string; additionalProp2?: string; additionalProp3?: string};
}