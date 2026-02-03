import { useState } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DownloadOptionsProps {
  data: Record<string, unknown>[];
  filename?: string;
}

const DownloadOptions = ({ data, filename = "data_export" }: DownloadOptionsProps) => {
  const [format, setFormat] = useState<"csv" | "json">("csv");

  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => {
          const value = row[h];
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const handleDownload = () => {
    if (format === "csv") {
      downloadCSV();
    } else {
      downloadJSON();
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
      <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "json")}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </div>
          </SelectItem>
          <SelectItem value="json">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              JSON
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleDownload} className="gap-2">
        <Download className="w-4 h-4" />
        Download {format.toUpperCase()}
      </Button>

      <span className="text-sm text-muted-foreground">
        {data.length} rows
      </span>
    </div>
  );
};

export default DownloadOptions;
