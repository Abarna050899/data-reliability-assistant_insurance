import { useState } from "react";
import { Download, Search, ZoomIn, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isPIIColumn, maskPIIValue } from "@/lib/piiUtils";

interface DataTableProps {
  title: string;
  data: Record<string, unknown>[];
  className?: string;
  highlightPII?: boolean;
  maskPIIDownload?: boolean;
}

const DataTable = ({ title, data, className, highlightPII = false, maskPIIDownload = false }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const piiColumns = highlightPII ? columns.filter(isPIIColumn) : [];

  const handleDownloadCSV = () => {
    const headers = columns.join(",");
    const rows = filteredData.map((row) =>
      columns.map((col) => {
        const rawValue = row[col];
        // Only mask PII in downloads when explicitly requested
        const value = maskPIIDownload && isPIIColumn(col) ? maskPIIValue(rawValue, col) : rawValue;
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, "_").toLowerCase()}.csv`;
    link.click();
  };

  const TableContent = ({ zoomed = false }: { zoomed?: boolean }) => (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden bg-white", zoomed && "h-full")}>
      <div className={cn("w-full overflow-x-auto overflow-y-auto", zoomed ? "h-[70vh]" : "h-[350px]")}>
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead className="w-12 font-semibold text-gray-900 sticky left-0 bg-gray-200 z-10">#</TableHead>
                {columns.map((col) => {
                  const isPII = piiColumns.includes(col);
                  return (
                    <TableHead 
                      key={col} 
                      className={cn(
                        "font-semibold min-w-[120px] whitespace-nowrap",
                        isPII ? "bg-amber-100 text-amber-900" : "text-gray-900 bg-gray-200"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        {isPII && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 inline-block flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-amber-50 text-amber-900 border-amber-200 text-xs">
                              PII Field – Masked in downloads
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="text-gray-600 font-mono text-sm sticky left-0 bg-white z-10">
                    {idx + 1}
                  </TableCell>
                    {columns.map((col) => {
                      const isPII = piiColumns.includes(col);
                      return (
                        <TableCell 
                          key={col} 
                          className={cn(
                            "min-w-[150px] max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis",
                            isPII ? "bg-amber-50 text-amber-800" : "text-gray-800"
                          )}
                        >
                          {row[col] === null || row[col] === undefined ? (
                            <span className="text-red-500 italic text-sm">null</span>
                          ) : (
                            <span className="block truncate" title={String(row[col])}>
                              {String(row[col])}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-3 animate-fade-in", className)}>
      {/* Header with title and controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="flex items-center gap-1 animate-fade-in">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 h-8 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
          >
            <Search className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsZoomed(true)}
            title="Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownloadCSV}
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground ml-2">
            {filteredData.length} of {data.length} records
          </span>
        </div>
      </div>

      {/* Table */}
      <TableContent />

      {/* Zoom Dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <TableContent zoomed />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataTable;
