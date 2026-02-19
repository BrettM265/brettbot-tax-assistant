// /hooks/useChatHistory.ts
import { useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function useChatHistory(initialMessage: ChatMessage) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  function keepLastTwo(list: ChatMessage[]) {
    return list.slice(-2);
  }

  function addUserMessage(content: string) {
    setMessages((prev) =>
      keepLastTwo([...prev, { role: "user", content }])
    );
  }

  function addAssistantMessage(content: string) {
    setMessages((prev) =>
      keepLastTwo([...prev, { role: "assistant", content }])
    );
  }

  function updateLastAssistantMessage(newContent: string) {
  setMessages((prev) => {
    const copy = [...prev];
    for (let i = copy.length - 1; i >= 0; i--) {
      if (copy[i].role === "assistant") {
        copy[i] = { ...copy[i], content: newContent };
        break;
      }
    }
    return keepLastTwo(copy);
  });
}


  function resetChat() {
    setMessages([initialMessage]);
  }

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    resetChat,
    updateLastAssistantMessage,
  };
}
