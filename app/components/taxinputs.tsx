"use client";

type TaxData = {
  income: string | null;
  state: string | null;
  dependents: string | number | null;
};

type TaxProfileInputsProps = {
  taxData: TaxData;
  setTaxData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: () => void;
  isLoading: boolean;
};

export default function TaxProfileInputs({
  taxData,
  setTaxData,
  onSubmit,
  isLoading,
}: TaxProfileInputsProps) {
  return (
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
            const cleanedValue = rawValue.replace(/[^0-9]/g, "");

            setTaxData((prev: any) => ({
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
            setTaxData((prev: any) => ({ ...prev, state: e.target.value }))
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
            setTaxData((prev: any) => ({ ...prev, dependents: e.target.value }))
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
          onClick={onSubmit}
          disabled={isLoading || !taxData.income || !taxData.state}
          className="w-1/5 bg-blue-500 dark:bg-blue-600 text-white py-2 rounded-lg 
                     text-[11px] font-medium active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "..." : "Send"}
        </button>

      </div>
    </div>
  );
}
