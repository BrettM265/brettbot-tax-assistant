"use client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatMessagesProps = {
  messages: Message[];
  isLoading: boolean;
};

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 
                    bg-white dark:bg-gray-900 
                    border-b border-gray-300 dark:border-gray-700 
                    relative">

      {messages.map((m, i) =>
        m.role === "user" ? (
          <div key={i} className="flex justify-end">
            <div className="max-w-xs p-2 rounded-2xl 
                            bg-blue-400 dark:bg-blue-600 
                            text-white text-xs sm:text-sm leading-snug">
              {m.content}
            </div>
          </div>
        ) : (
          <div key={i} className="flex items-start gap-3">
            <div className="relative max-w-xs p-2 ml-3 rounded-2xl 
                bg-green-200 dark:bg-green-800 
                text-gray-900 dark:text-gray-100 
                text-xs sm:text-sm leading-snug
                after:content-[''] 
                after:absolute 
                after:right-1 
                after:bottom-[-3px]
                after:w-0 after:h-0
                after:border-l-[10px]
                after:border-l-transparent
                after:border-t-[10px]
                after:border-t-green-200
                dark:after:border-t-green-800">
  {m.content}
</div>

          </div>
        )
      )}

      {/* Thinking Indicator */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="max-w-xs p-2 ml-3 rounded-2xl 
                          bg-gray-200 dark:bg-gray-700 
                          text-gray-700 dark:text-gray-200 
                          text-xs italic animate-pulse">
            Thinking...
          </div>
        </div>
      )}

      {/* Taxman Avatar */}
      <img
        src="/taxman.png"
        alt="Mr taxman"
        className="absolute right-0 bottom-0 
                   w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 
                   object-contain opacity-90
                   pointer-events-none"
      />
    </div>
  );
}
