type ChatResponse = {
  reply?: string;
  error?: string;
};

/**
  sendChatMessage
  Now supports streaming.
  onDelta gets called every time new text arrives from the AI.
 */
export async function sendChatMessage(
  prompt: string,
  onDelta: (deltaText: string) => void
): Promise<ChatResponse> {
  try {
    const res = await fetch(`${window.location.origin}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    // If server returned JSON error (500 etc)
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      if (contentType.includes("application/json")) {
        const data = await res.json();
        return { error: data?.error || "Request failed" };
      }

      const text = await res.text();
      return { error: text || "Request failed" };
    }

    // If no stream body, something is wrong
    if (!res.body) {
      return { error: "No response body from server." };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let fullReply = "";
    let buffer = ""; // holds partial stream lines

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // decode chunk
      buffer += decoder.decode(value, { stream: true });

      // split by line
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.replace(/^data:\s*/, "");
        if (!dataStr || dataStr === "[DONE]") continue;

        try {
          const evt = JSON.parse(dataStr);

          // OpenAI streaming text delta event
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            fullReply += evt.delta;

            // This is how text appears live
            onDelta(evt.delta);
          }
        } catch {
          // ignore partial JSON
        }
      }
    }

    return { reply: fullReply };
  } catch {
    return { error: "Network error talking to the tax assistant." };
  }
}
