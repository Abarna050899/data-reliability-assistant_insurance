import { useState } from "react";
import { Download } from "lucide-react";
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
}

const CleanedDataView = ({ originalData }: CleanedDataViewProps) => {
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
            const value = row[col];
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
      const json = JSON.stringify(cleanedData, null, 2);
      downloadFile(json, "cleaned_dqdata.json", "application/json");
    } else if (downloadFormat === "XLSX") {
      // For XLSX, we'll create a simple TSV that can be opened in Excel
      const headers = columns.join("\t");
      const rows = cleanedData.map((row) =>
        columns.map((col) => row[col] ?? "").join("\t")
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
