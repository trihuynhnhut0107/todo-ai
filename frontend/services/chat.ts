import api from "@/lib/api";
import { ChatMessageReq } from "@/types/chat";

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


