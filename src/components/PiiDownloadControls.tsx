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
import { maskPIIValue, isPIIColumn } from "@/lib/piiUtils";

interface PiiDownloadControlsProps {
  data: Record<string, unknown>[];
}

const PiiDownloadControls = ({ data }: PiiDownloadControlsProps) => {
  const [downloadFormat, setDownloadFormat] = useState<string>("CSV");

  const handleDownload = () => {
    if (data.length === 0) return;
    const columns = Object.keys(data[0]);

    const downloadFile = (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    };

    if (downloadFormat === "CSV") {
      const headers = columns.join(",");
      const rows = data.map((row) =>
        columns.map((col) => {
          const value = isPIIColumn(col) ? maskPIIValue(row[col], col) : row[col];
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        }).join(",")
      );
      downloadFile([headers, ...rows].join("\n"), "cleaned_masked_data.csv", "text/csv;charset=utf-8;");
    } else if (downloadFormat === "JSON") {
      const maskedData = data.map(row => {
        const masked: Record<string, unknown> = {};
        for (const col of columns) {
          masked[col] = isPIIColumn(col) ? maskPIIValue(row[col], col) : row[col];
        }
        return masked;
      });
      downloadFile(JSON.stringify(maskedData, null, 2), "cleaned_masked_data.json", "application/json");
    } else if (downloadFormat === "XLSX") {
      const headers = columns.join("\t");
      const rows = data.map((row) =>
        columns.map((col) => isPIIColumn(col) ? maskPIIValue(row[col], col) : (row[col] ?? "")).join("\t")
      );
      downloadFile([headers, ...rows].join("\n"), "cleaned_masked_data.tsv", "text/tab-separated-values;charset=utf-8;");
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap mt-4">
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
  );
};

export default PiiDownloadControls;
