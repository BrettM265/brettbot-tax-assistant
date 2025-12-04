"use client";

import { useState, useEffect } from "react";
import ChatHeader from "../components/chatheader";
import ChatMessages from "../components/chatmessages";


// Button label to userMessage defined
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

function keepLastTwoMessages(newMessages) {
  return newMessages.slice(-2);
}


// Centralized prompt builder (cost-safe + structured)
function buildEngineeredPrompt({ userMessage, intent, taxData }) {
  const base =
    "You are a US income tax estimation assistant. Never ask for SSN, address, employer names, or bank data. Give rough estimates only. Use conservative assumptions. Keep answers brief and to the point. If you don't know, say 'I don't know'. Always assume the user is an individual filer with standard deductions unless told otherwise. You have a 100 token limit for your response, don't end trailing off finish your sentence before you reach the limit. THIS IS FOR 2026 TAX YEAR ONLY.";

  const known = `Known: income=${taxData.income || "?"}, state=${taxData.state || "?"}, dependents=${taxData.dependents || "?"}`;

  // more defined intents for buttons
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
  if (!taxData.income || !taxData.state || isLoading) return;

  const userText = `My income is ${taxData.income}, I live in ${taxData.state}, and I have ${taxData.dependents || 0} dependents.`;

  // ✅ Add user message, keep last 2
  setMessages((prev) =>
    keepLastTwoMessages([...prev, { role: "user", content: userText }])
  );

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

    // ✅ Add assistant reply, keep last 2
    setMessages((prev) =>
      keepLastTwoMessages([
        ...prev,
        { role: "assistant", content: data.reply || data.error || "No response." },
      ])
    );
  } catch (err) {
    setMessages((prev) =>
      keepLastTwoMessages([
        ...prev,
        {
          role: "assistant",
          content: "Network error talking to the tax assistant.",
        },
      ])
    );
  } finally {
    setIsLoading(false);
  }
};

  // Button-driven intent (example: Deductions)
const handleButtonClick = async (label) => {
  // ✅ Add user message, keep last 2
  setMessages((prev) =>
    keepLastTwoMessages([...prev, { role: "user", content: label }])
  );

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

    // ✅ Add assistant reply, keep last 2
    setMessages((prev) =>
      keepLastTwoMessages([
        ...prev,
        { role: "assistant", content: data.reply || data.error || "No response." },
      ])
    );
  } catch (err) {
    setMessages((prev) =>
      keepLastTwoMessages([
        ...prev,
        { role: "assistant", content: "Network error." },
      ])
    );
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


        {/* Tax Data Input Panel - Single Row */}
<div className="p-1 pl-3 pr-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <div className="flex gap-2">

    {/* Annual Income */}
    <input
        type="text"
        inputMode="numeric"
        placeholder="Income"
        value={taxData.income || ""}
        onChange={(e) => {
          const rawValue = e.target.value;

          // Remove commas, spaces, and anything that is NOT a number
          const cleanedValue = rawValue.replace(/[^0-9]/g, "");

          setTaxData((prev) => ({
            ...prev,
            income: cleanedValue,
          }));
        }}
        className="w-1/3 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                  text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
      />


    {/* State Dropdown */}
    <select
      value={taxData.state || ""}
      onChange={(e) =>
        setTaxData((prev) => ({ ...prev, state: e.target.value }))
      }
      className="w-1/4 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">State</option>
      {[
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
        "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
        "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
        "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
        "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
      ].map((state) => (
        <option key={state} value={state}>{state}</option>
      ))}
    </select>

    {/* Dependents Dropdown */}
    <select
      value={taxData.dependents ?? ""}
      onChange={(e) =>
        setTaxData((prev) => ({ ...prev, dependents: e.target.value }))
      }
      className="w-1/4 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">Dependants</option>
      {Array.from({ length: 13 }, (_, i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>

    {/* Submit Button */}
    <button
      onClick={handleSend}
      disabled={isLoading || !taxData.income || !taxData.state}
      className="w-1/5 bg-blue-500 dark:bg-blue-600 text-white py-2 rounded-lg 
                 text-[11px] font-medium active:scale-95 disabled:opacity-50"
    >
      {isLoading ? "..." : "Go"}
    </button>

  </div>
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
