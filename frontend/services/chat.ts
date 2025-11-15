import api from "@/lib/api";

export async function getAIMessage(
  message: string
): Promise<any> {
    try {
        const res=await api.post("/chat/generate", { message });
        console.log("AI Response:", res);   
        return res;
    } catch (error) {
        throw error;
    }
}

