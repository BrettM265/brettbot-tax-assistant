export type TaxData = {
  income: string | null;
  state: string | null;
  dependents: string | number | null;
  w2: string | null;
  i1099: string | null;
  deductions: string | null;
  credits: string | null;
};

//  Single source for buttons & intent & hint
export const INTENTS: Record<
  string,
  { key: string; hint: string }
> = {
  Deductables: {
    key: "deductions",
    hint: "Common US deductions only.",
  },
  "W2 Income": {
    key: "w2",
    hint: "W2 wages and employers.",
  },
  "1099 Income": {
    key: "i1099",
    hint: "1099 income and expenses.",
  },
  Dependents: {
    key: "dependents",
    hint: "Child and dependent eligibility.",
  },
  "State Tax": {
    key: "state",
    hint: "State tax basics only.",
  },
  "Federal Tax": {
    key: "federal",
    hint: "Federal return basics only.",
  },
  Credits: {
    key: "credits",
    hint: "Tax credits only.",
  },
  "Filing Status": {
    key: "filing_status",
    hint: "Correct filing status.",
  },
  "Property Tax": {
    key: "property_tax",
    hint: "Home and property tax.",
  },
  "Mortgage Interest": {
    key: "mortgage_interest",
    hint: "Mortgage interest paid.",
  },
  Investments: {
    key: "investments",
    hint: "Capital gains and dividends.",
  },
};

//  Centralized prompt builder
export function buildEngineeredPrompt({
  userMessage,
  taxData,
  intentKey,
  intentHint,
}: {
  userMessage: string;
  taxData: TaxData;
  intentKey?: string;
  intentHint?: string;
}) {
  const base =
    `You are a US income tax estimate assistant (2026 only).
Rules:
- Never request SSN, address, bank, or employer data.
- Give conservative estimates only.
- Keep replies under 100 tokens.
- End early if reaching the limit but DO NOT trail off without finishing your thought.
- If unsure, say "I don't know".
- Assume individual filer with standard deduction unless you recommend something different based on user inputs.
`;

  const known = `Known:
- Income: ${taxData.income || "?"}
- State: ${taxData.state || "?"}
- Dependents: ${taxData.dependents ?? "?"}`;

  const topicLine = intentHint
    ? `Topic Focus: ${intentHint}`
    : intentKey
    ? `Topic Focus: ${intentKey}`
    : "Topic Focus: General tax question";

  return `${base}

${known}
${topicLine}

User says: ${userMessage}`;
}
