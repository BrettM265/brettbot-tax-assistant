"use client";

export default function ChatShell() {
  const handleRefresh = () => {
    window.location.reload();
  };

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

  return (
    <div className="flex flex-col h-[700px] w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
      {/* Title (hidden on mobile) */}
      <h1 className="hidden sm:block text-2xl md:text-3xl font-semibold text-blue-700 mb-2 text-center">
        Tax Chat Assistant
      </h1>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 bg-white border-b border-gray-300 relative">
        {/* Example User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs p-3 rounded-2xl bg-blue-500 text-white">
            Example user message
          </div>
        </div>

        {/* Example GPT Message */}
        <div className="flex items-start gap-3">
          <div className="max-w-xs p-3 rounded-2xl bg-gray-200 text-gray-900">
            Example GPT response
          </div>
        </div>

        {/* Avatar pinned bottom-left of chat area */}
        <img
          src="/taxman.png"
          alt="Mr taxman"
          className="
            absolute
            left-3 bottom-0
            w-24 h-24             /* mobile */
            sm:w-28 sm:h-28       /* tablet */
            md:w-32 md:h-32       /* desktop/laptop */
            object-contain 
            opacity-90
            scale-x-[-1]
            pointer-events-none
          "
        />
      </div>

      {/* iMessage-style Input Bar */}
      <div className="flex items-center gap-2 p-3 bg-white border-t border-gray-200">
        <input
          type="text"
          placeholder="Type a message..."
          className="
            flex-1
            px-4 py-2
            rounded-full
            border border-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-blue-400
            text-sm
          "
        />
        <button
          className="
            bg-blue-500
            text-white
            px-4 py-2
            rounded-full
            font-medium
            active:scale-95
          "
        >
          Send
        </button>
      </div>

      {/* Button Grid */}
      <div className="bg-gray-50">
        <div className="grid grid-cols-4 gap-2 p-3">
          {buttons.map((label) => (
            <button
              key={label}
              className="py-3 px-2 bg-white shadow rounded-xl text-xs sm:text-sm text-center font-medium border border-gray-200 active:scale-95"
            >
              {label}
            </button>
          ))}

          {/* Reset button that refreshes the page */}
          <button
            className="py-3 px-2 bg-white shadow rounded-xl text-xs sm:text-sm text-center font-medium border border-gray-200 active:scale-95"
            onClick={handleRefresh}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
