import { useState } from "react";
import { Download } from "lucide-react";
import { maskPIIValue, isPIIColumn } from "@/lib/piiUtils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "./DataTable";

interface CleanedDataViewProps {
  originalData: Record<string, unknown>[];
  maskPIIDownload?: boolean;
}

const CleanedDataView = ({ originalData, maskPIIDownload = false }: CleanedDataViewProps) => {
  const [downloadFormat, setDownloadFormat] = useState<string>("CSV");

  // Clean data: remove rows with null/empty values
  const cleanedData = originalData.filter((row) => {
    return Object.values(row).every(
      (value) => value !== null && value !== undefined && value !== ""
    );
  });

  const handleDownload = () => {
    const columns = Object.keys(cleanedData[0] || {});

    if (downloadFormat === "CSV") {
      const headers = columns.join(",");
      const rows = cleanedData.map((row) =>
        columns
          .map((col) => {
            const rawValue = row[col];
            const value = maskPIIDownload && isPIIColumn(col) ? maskPIIValue(rawValue, col) : rawValue;
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? "";
          })
          .join(",")
      );
      const csv = [headers, ...rows].join("\n");
      downloadFile(csv, "cleaned_dqdata.csv", "text/csv;charset=utf-8;");
    } else if (downloadFormat === "JSON") {
      // Mask PII in JSON export
      const maskedData = cleanedData.map(row => {
        const masked: Record<string, unknown> = {};
        for (const col of columns) {
          masked[col] = maskPIIDownload && isPIIColumn(col) ? maskPIIValue(row[col], col) : row[col];
        }
        return masked;
      });
      const json = JSON.stringify(maskedData, null, 2);
      downloadFile(json, "cleaned_dqdata.json", "application/json");
    } else if (downloadFormat === "XLSX") {
      const headers = columns.join("\t");
      const rows = cleanedData.map((row) =>
        columns.map((col) => {
          const rawValue = row[col];
          return maskPIIDownload && isPIIColumn(col) ? maskPIIValue(rawValue, col) : (rawValue ?? "");
        }).join("\t")
      );
      const tsv = [headers, ...rows].join("\n");
      downloadFile(tsv, "cleaned_dqdata.tsv", "text/tab-separated-values;charset=utf-8;");
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
        <p className="text-sm text-gray-800 font-medium">
          Removed rows with null values. Cleaned data preview ({cleanedData.length} of {originalData.length} rows)
        </p>
      </div>

      <DataTable title="Cleaned Data Preview" data={cleanedData} />

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={downloadFormat} onValueChange={setDownloadFormat}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="XLSX">Excel (TSV)</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download Cleaned {downloadFormat}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CleanedDataView;
