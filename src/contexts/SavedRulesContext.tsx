import { createContext, useContext, useState, ReactNode } from "react";

export type DQDimension = "Accuracy" | "Completeness" | "Uniqueness" | "Consistency" | "Timeliness" | "Validity";

export interface Permission {
  name: string;
  role: "Viewer" | "Editor" | "Executor";
}

export interface SavedRule {
  id: string;
  ruleName: string;
  dqDimension: DQDimension;
  comments: string;
  ruleFormula: string;
  createdBy: string;
  createdOn: Date;
  lastModified: Date;
  status: "Active" | "Draft";
  permissions: Permission[];
  isPublic: boolean;
}

interface SavedRulesContextValue {
  savedRules: SavedRule[];
  setSavedRules: React.Dispatch<React.SetStateAction<SavedRule[]>>;
}

const SavedRulesContext = createContext<SavedRulesContextValue | undefined>(undefined);

const DEFAULT_RULES: SavedRule[] = [
  {
    id: "default-null-check",
    ruleName: "Null check",
    dqDimension: "Accuracy",
    comments: "Check for null values in critical fields",
    ruleFormula: "SELECT * FROM table WHERE column IS NULL",
    createdBy: "System",
    createdOn: new Date("2025-01-15"),
    lastModified: new Date("2025-01-15"),
    status: "Active",
    permissions: [
      { name: "Analyst User", role: "Viewer" },
      { name: "Data Quality User", role: "Executor" },
    ],
    isPublic: false,
  },
];

export const SavedRulesProvider = ({ children }: { children: ReactNode }) => {
  const [savedRules, setSavedRules] = useState<SavedRule[]>(DEFAULT_RULES);

  return (
    <SavedRulesContext.Provider value={{ savedRules, setSavedRules }}>
      {children}
    </SavedRulesContext.Provider>
  );
};

export const useSavedRules = () => {
  const ctx = useContext(SavedRulesContext);
  if (!ctx) throw new Error("useSavedRules must be used within SavedRulesProvider");
  return ctx;
};
