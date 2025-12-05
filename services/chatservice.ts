// /services/chatService.ts

type ChatResponse = {
  reply?: string;
  error?: string;
};

export async function sendChatMessage(prompt: string): Promise<ChatResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    return await res.json();
  } catch (err) {
    return { error: "Network error talking to the tax assistant." };
  }
}
