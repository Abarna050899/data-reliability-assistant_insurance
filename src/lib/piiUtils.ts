// PII (Personally Identifiable Information) detection and masking utilities

// Column names that are considered PII for insurance/vitality data
const PII_COLUMN_PATTERNS: string[] = [
  "member_id",
  "last_app_login_date",
  "last_claim_date",
  "age",
  "gender",
  "city",
  "marital_status",
  "dependents_count",
];

/**
 * Check if a column name is a PII field
 */
export function isPIIColumn(columnName: string): boolean {
  const lower = columnName.toLowerCase().replace(/\s+/g, "_");
  return PII_COLUMN_PATTERNS.some(
    (pattern) => lower === pattern.toLowerCase()
  );
}

/**
 * Get list of PII columns from a set of column names
 */
export function getPIIColumns(columns: string[]): string[] {
  return columns.filter(isPIIColumn);
}

/**
 * Mask a PII value based on its type
 */
export function maskPIIValue(value: unknown, columnName: string): string {
  if (value === null || value === undefined || value === "") return String(value ?? "");

  const strValue = String(value);
  const lower = columnName.toLowerCase().replace(/\s+/g, "_");

  if (lower === "member_id") {
    if (strValue.length <= 1) return "*";
    return strValue.substring(0, 1) + "***";
  }

  if (lower === "age" || lower === "dependents_count") {
    return "**";
  }

  if (lower === "gender") {
    return "*";
  }

  if (lower === "city" || lower === "marital_status" || lower === "income_band") {
    if (strValue.length <= 2) return "**";
    return strValue.substring(0, 2) + "***";
  }

  // Generic masking
  if (strValue.length <= 2) return "**";
  return strValue.substring(0, 2) + "***";
}

/**
 * Mask PII fields in a data row
 */
export function maskPIIRow(
  row: Record<string, unknown>,
  columns: string[]
): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const col of columns) {
    if (isPIIColumn(col)) {
      masked[col] = maskPIIValue(row[col], col);
    } else {
      masked[col] = row[col];
    }
  }
  return masked;
}

/**
 * Mask PII fields in an entire dataset
 */
export function maskPIIData(
  data: Record<string, unknown>[]
): Record<string, unknown>[] {
  if (data.length === 0) return data;
  const columns = Object.keys(data[0]);
  return data.map((row) => maskPIIRow(row, columns));
}
