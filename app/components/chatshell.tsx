"use client";

import { useState, useEffect } from "react";

// Button label to intent mapping
const INTENT_MAP = {
  Deductables: "deductions",
  "W2 Income": "w2",
  "1099 Income": "i1099",
  Dependents: "dependents",
  "State Tax": "state",
  "Federal Tax": "federal",
  Credits: "credits",
  "Filing Status": "filing_status",
  "Property Tax": "property_tax",
  "Mortgage Interest": "mortgage_interest",
  Investments: "investments",
};

// Centralized prompt builder (cost-safe + structured)
function buildEngineeredPrompt({ userMessage, intent, taxData }) {
  const base =
    "You are a US income tax estimation assistant. Never ask for SSN, address, employer names, or bank data. Give rough estimates only. Keep replies under 3 sentences and ask at most 1–2 short questions.";

  const known = `Known: income=${taxData.income || "?"}, state=${taxData.state || "?"}, dependents=${taxData.dependents || "?"}`;

  const intentHints = {
    deductions: "Common US deductions only.",
    w2: "W2 wages and employers.",
    i1099: "1099 income and expenses.",
    dependents: "Child and dependent eligibility.",
    state: "State tax basics only.",
    federal: "Federal return basics only.",
    credits: "Tax credits only.",
    filing_status: "Correct filing status.",
    property_tax: "Home and property tax.",
    mortgage_interest: "Mortgage interest paid.",
    investments: "Capital gains and dividends.",
  };


  return `${base}
${known}
Topic: ${intentHints[intent] || "General tax question."}
User: ${userMessage}`;
}

export default function ChatShell() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! To get started, please provide an annual income, state, and number of dependants.",
    },
  ]);

  // Structured tax intake state (this makes prompts accurate)
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
    "Deductables",
    "W2 Income",
    "1099 Income",
    "Dependents",
    "State Tax",
    "Federal Tax",
    "Credits",
    "Filing Status",
    "Property Tax",
    "Mortgage Interest",
    "Investments",
  ];

  // Send typed message to API with engineered prompt
const handleSend = async () => {
  if (!input.trim() || isLoading) return;

  const userText = input.trim();

  // ✅ REPLACE chat with only the new user message
  setMessages([{ role: "user", content: userText }]);
  setInput("");
  setIsLoading(true);

  const engineeredPrompt = buildEngineeredPrompt({
    userMessage: userText,
    taxData,
  });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: engineeredPrompt }),
    });

    const data = await res.json();

    // ✅ REPLACE chat with only the assistant reply
    setMessages([
      { role: "assistant", content: data.reply || data.error || "No response." },
    ]);
  } catch (err) {
    setMessages([
      {
        role: "assistant",
        content: "Network error talking to the tax assistant.",
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};


  // Button-driven intent (example: Deductions)
const handleButtonClick = async (label) => {
  // REPLACE chat immediately with the button label
  setMessages([{ role: "user", content: label }]);
  setIsLoading(true);

  const intent = INTENT_MAP[label];

  const engineeredPrompt = buildEngineeredPrompt({
    userMessage: label,
    taxData,
    intent,
  });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: engineeredPrompt }),
    });

    const data = await res.json();

    //  REPLACE chat with only the assistant reply
    setMessages([
      { role: "assistant", content: data.reply || data.error || "No response." },
    ]);
  } catch (err) {
    setMessages([{ role: "assistant", content: "Network error." }]);
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

      <div className="px-3 pt-2 pb-3 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-blue-900">

  <h1 className="hidden sm:block text-xl md:text-2xl font-semibold 
                 text-blue-700 dark:text-blue-300 
                 mb-1 text-center">
    BrettBot Tax Estimator
  </h1>

  {/* Dark mode toggle */}
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="hidden sm:block mx-auto mb-1 px-3 py-0.5 text-[11px] rounded-full 
               bg-gray-200 dark:bg-gray-600 dark:text-white"
  >
    {darkMode ? "Light Mode" : "Dark Mode"}
  </button>

  {/* Safety Warning */}
  <div className="mx-1 mt-1 px-2 py-1.5 rounded-lg 
                  bg-yellow-100 dark:bg-yellow-900 
                  border border-yellow-300 dark:border-yellow-700
                  text-yellow-900 dark:text-yellow-200 
                  text-[10px] sm:text-[11px] leading-tight text-center">
    ⚠️ Never enter personal or private information.  
    Estimates only — not financial or legal advice.
  </div>

</div>


      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 relative">

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-xs p-2 rounded-2xl bg-blue-400 dark:bg-blue-600 text-white text-xs sm:text-sm leading-snug">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <div className="max-w-xs p-2 ml-3 rounded-2xl bg-green-200 dark:bg-green-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm leading-snug">
                {m.content}
              </div>
            </div>
          )
        )}

        <img
          src="/taxman.png"
          alt="Mr taxman"
          className="absolute left-3 bottom-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain opacity-70 scale-x-[-1] pointer-events-none"
        />
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">

        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        />

        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-full font-medium active:scale-95 disabled:opacity-60"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>

      {/* Button Grid */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-4 gap-2 p-3">

          {buttons.map((label) => (
            <button
              key={label}
              onClick={() => handleButtonClick(label)}
              className="py-3 px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow rounded-xl text-xs sm:text-sm text-center font-medium border border-gray-200 dark:border-gray-600 active:scale-95"
            >
              {label}
            </button>
          ))}

          <button
            className="py-3 px-2 bg-red-200 dark:bg-red-700 text-gray-900 dark:text-white shadow rounded-xl text-xs sm:text-sm text-center font-medium border border-gray-200 dark:border-gray-600 active:scale-95"
            onClick={handleRefresh}
          >
            Reset
          </button>

        </div>
      </div>

    </div>
);

}
