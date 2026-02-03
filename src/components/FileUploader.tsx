import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileUpload: (file: File, data: Record<string, unknown>[]) => void;
  uploadedFile: File | null;
  onClearFile: () => void;
}

const FileUploader = ({ onFileUpload, uploadedFile, onClearFile }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows: Record<string, unknown>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        const value = values[index] || "";
        // Try to parse as number
        const numValue = parseFloat(value);
        row[header] = !isNaN(numValue) && value !== "" ? numValue : value;
      });
      rows.push(row);
    }
    return rows;
  };

  const parseJSON = (text: string): Record<string, unknown>[] => {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      let data: Record<string, unknown>[] = [];

      if (file.name.endsWith(".csv")) {
        data = parseCSV(text);
      } else if (file.name.endsWith(".json")) {
        data = parseJSON(text);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setError("Excel files require additional processing. Please use CSV or JSON for now.");
        setIsProcessing(false);
        return;
      } else {
        setError("Unsupported file format. Please upload CSV or JSON files.");
        setIsProcessing(false);
        return;
      }

      if (data.length === 0) {
        setError("No data found in the file.");
        setIsProcessing(false);
        return;
      }

      onFileUpload(file, data);
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (uploadedFile) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">{uploadedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFile}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div>
            <p className="font-medium text-foreground">
              {isProcessing ? "Processing..." : "Drop your file here or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports CSV and JSON files
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
