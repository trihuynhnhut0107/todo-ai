import api from "@/lib/api";
import { ChatMessageReq } from "@/types/chat";

let cachedSession: any = null;

export async function getAIMessage(
  message: string
): Promise<any> {
    try {
        const res=await api.post("/chat/generate", { message });
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getAIMessage2(params:ChatMessageReq): Promise<any> {
    try {
        const res=await api.post("/chat", params);
        return res;
    } catch (error) {
        throw error;
    }
}

export async function createSession(userId:string): Promise<any> {
    try {
        const res=await api.post("/chat/sessions", { userId });
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getOrCreateSession(userId: string): Promise<any> {
  if (!userId) throw new Error("userId is required to create session");
  if (cachedSession && cachedSession.userId === userId) {
    return cachedSession;
  }
  const res = await createSession(userId);
  cachedSession = res?.data ?? res;
  if (!cachedSession.userId) cachedSession.userId = userId;
  return cachedSession;
}

export function getCachedSession() {
  return cachedSession;
}

