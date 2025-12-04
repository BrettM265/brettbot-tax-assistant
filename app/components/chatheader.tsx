"use client";

type ChatHeaderProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export default function ChatHeader({ darkMode, setDarkMode }: ChatHeaderProps) {
  return (
    <div className="px-3 pt-2 pb-3 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-blue-900">

      <h1 className="block text-lg sm:text-xl md:text-2xl font-semibold 
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
        ⚠️ Estimates only - not financial or legal advice.
      </div>

    </div>
  );
}
