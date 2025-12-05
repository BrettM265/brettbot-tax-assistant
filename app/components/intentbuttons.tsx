"use client";

type IntentButtonsProps = {
  buttons: string[];
  onClick: (label: string) => void;
  onReset: () => void;
};

export default function IntentButtons({
  buttons,
  onClick,
  onReset,
}: IntentButtonsProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800">
      <div className="grid grid-cols-4 gap-2 p-3">

        {buttons.map((label) => (
          <button
            key={label}
            onClick={() => onClick(label)}
            className="py-3 px-2 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-white 
                       shadow rounded-xl text-xs sm:text-sm 
                       text-center font-medium 
                       border border-gray-200 dark:border-gray-600 
                       active:scale-95"
          >
            {label}
          </button>
        ))}

        {/* Reset Button */}
        <button
          className="py-3 px-2 bg-red-200 dark:bg-red-700 
                     text-gray-900 dark:text-white 
                     shadow rounded-xl text-xs sm:text-sm 
                     text-center font-medium 
                     border border-gray-200 dark:border-gray-600 
                     active:scale-95"
          onClick={onReset}
        >
          Reset
        </button>

      </div>
    </div>
  );
}
