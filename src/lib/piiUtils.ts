// PII (Personally Identifiable Information) detection and masking utilities

// Column names that are considered PII for travel/marketing data
const PII_COLUMN_PATTERNS: string[] = [
  "customer_id",
  "age",
  "account_created_date",
  "emotion",
  "Post",
  "URL",
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

  if (lower === "customer_id") {
    // Show first 4 chars, mask rest: CUST**** 
    if (strValue.length <= 4) return "****";
    return strValue.substring(0, 4) + "****";
  }

  if (lower === "age") {
    return "**";
  }

  if (lower === "account_created_date") {
    // Show only year
    const yearMatch = strValue.match(/^\d{4}/);
    return yearMatch ? `${yearMatch[0]}-**-**` : "****-**-**";
  }

  if (lower === "url") {
    return "https://***masked***";
  }

  if (lower === "post") {
    // Show first 10 chars then mask
    if (strValue.length <= 10) return "***";
    return strValue.substring(0, 10) + "***";
  }

  if (lower === "emotion") {
    return "***";
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
