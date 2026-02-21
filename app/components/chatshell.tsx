"use client";
import { useState, useEffect, useRef } from "react";
import ChatHeader from "../components/chatheader";
import ChatMessages from "../components/chatmessages";
import TaxProfileInputs from "../components/taxinputs";
import IntentButtons from "../components/intentbuttons";
import { INTENTS, buildEngineeredPrompt } from "../../lib/promptEngine";
import { sendChatMessage } from "../../services/chatservice";
import { useChatHistory } from "../hooks/usechathistory";

export default function ChatShell() {

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
  messages,
  addUserMessage,
  addAssistantMessage,
  resetChat,
  updateLastAssistantMessage,
} = useChatHistory({
  role: "assistant",
  content:
    "Hello! To get started, please provide an annual income, state, and number of dependants.",
});

  // Structured tax data
  const [taxData, setTaxData] = useState({
    income: null,
    state: null,
    dependents: null,
    w2: null,
    i1099: null,
    deductions: null,
    credits: null,
  });

  const buttons = [
    "Credits",
    "Crypto",
    "Deductables",
    "Dependents",
    "Federal Tax",
    "Filing Status",
    "Gambling",
    "Investments",
    "Mortgage Interest",
    "Property Tax",
    "State Tax",
  ];

  // onDelta callback to receive streaming responses from API
  const streamedTextRef = useRef("");
  const onDelta = (chunk: string) => {
  streamedTextRef.current += chunk;
  updateLastAssistantMessage(streamedTextRef.current);
};


  // Send typed message to API with engineered prompt
const handleSend = async () => {
  if (!taxData.income || !taxData.state || isLoading) return;

  const userText = `My income is ${taxData.income}, I live in ${taxData.state}, and I have ${taxData.dependents || 0} dependents.`;

  addUserMessage(userText);
  setIsLoading(true);
  streamedTextRef.current = "";
  addAssistantMessage("");

  const engineeredPrompt = buildEngineeredPrompt({
    userMessage: userText,
    taxData,
  });

  try {
  await sendChatMessage(engineeredPrompt, onDelta);
} catch {
  addAssistantMessage("Network error talking to the tax assistant.");
} finally {
  setIsLoading(false);
}
};

  // Button-driven intent (example: Deductions)
const handleButtonClick = async (label: string) => {
  addUserMessage(label);
  setIsLoading(true);
  streamedTextRef.current = "";
  addAssistantMessage("");

  const intent = INTENTS[label];

  const engineeredPrompt = buildEngineeredPrompt({
  userMessage: label,
  taxData,
  intentKey: INTENTS[label].key,
  intentHint: INTENTS[label].hint,
});


  try {
  await sendChatMessage(engineeredPrompt, onDelta);
} catch {
  addAssistantMessage("Network error.");
} finally {
  setIsLoading(false);
}

  console.log("BUTTON:", label);
  console.log("INTENT:", intent);
};

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [darkMode]);


return (
    <div className="flex flex-col h-[700px] w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-blue-100">

      {/* Chat Header */}
      <ChatHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      {/* Chat Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />
      {/* Tax Input Fields */}
      <TaxProfileInputs
        taxData={taxData}
        setTaxData={setTaxData}
        onSubmit={handleSend}
        isLoading={isLoading}
      />
      {/* Intent Buttons */}
      <IntentButtons
        buttons={buttons}
        onClick={handleButtonClick}
        onReset={resetChat}
      />

    </div>
);
}