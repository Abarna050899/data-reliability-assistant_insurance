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
  modifiedBy: string;
  status: "Active" | "Draft";
  permissions: Permission[];
  isPublic: boolean;
}

interface SavedRulesContextValue {
  savedRules: SavedRule[];
  setSavedRules: React.Dispatch<React.SetStateAction<SavedRule[]>>;
}

const SavedRulesContext = createContext<SavedRulesContextValue | undefined>(undefined);

const makeDefaultRule = (
  id: string,
  ruleName: string,
  dqDimension: DQDimension,
  comments: string,
  ruleFormula: string
): SavedRule => ({
  id,
  ruleName,
  dqDimension,
  comments,
  ruleFormula,
  createdBy: "John Smith",
  createdOn: new Date("2025-01-15"),
  lastModified: new Date("2025-01-20"),
  modifiedBy: "Admin User",
  status: "Active",
  permissions: [
    { name: "John Smith", role: "Viewer" },
    { name: "Jenkins", role: "Executor" },
  ],
  isPublic: false,
});

const DEFAULT_RULES: SavedRule[] = [
  makeDefaultRule("default-null-check", "Null Check", "Completeness", "Check for null values in critical fields", "IF(column IS NOT NULL) ? TRUE : FALSE"),
  makeDefaultRule("default-duplicate-check", "Duplicate Check", "Uniqueness", "Detect duplicate records on key columns", "IF(COUNT(column) = 1) ? TRUE : FALSE"),
  makeDefaultRule("default-missing-values", "Missing Values Check", "Completeness", "Detect blank or missing field values", "IF(column IS NOT NULL AND TRIM(column) <> '') ? TRUE : FALSE"),
  makeDefaultRule("default-date-format", "Date Format Check", "Validity", "Validate dates against the expected format", "IF(column MATCHES 'YYYY-MM-DD') ? TRUE : FALSE"),
  makeDefaultRule("default-negative-values", "Negative Values Check", "Validity", "Flag numeric columns containing negative values", "IF(column >= 0) ? TRUE : FALSE"),
  makeDefaultRule("default-range-validation", "Range Validation Check", "Accuracy", "Ensure values fall within accepted business range", "IF(column BETWEEN min AND max) ? TRUE : FALSE"),
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
