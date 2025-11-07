export async function getAIMessage(
  message: string
): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("This is a dummy AI response.");
        }, 3000);
    });
}
