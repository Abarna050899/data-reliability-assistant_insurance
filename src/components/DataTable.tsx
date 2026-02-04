import { useState } from "react";
import { Download, Search, ZoomIn, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface DataTableProps {
  title: string;
  data: Record<string, unknown>[];
  className?: string;
}

const DataTable = ({ title, data, className }: DataTableProps) => {
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

  const handleDownloadCSV = () => {
    const headers = columns.join(",");
    const rows = filteredData.map((row) =>
      columns.map((col) => {
        const value = row[col];
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
    <div className={cn("border border-border rounded-lg overflow-hidden", zoomed && "h-full")}>
      <div className={cn("w-full overflow-x-auto overflow-y-auto", zoomed ? "h-[70vh]" : "h-[350px]")}>
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead className="w-12 font-semibold text-foreground sticky left-0 bg-primary/5 z-10">#</TableHead>
                {columns.map((col) => (
                  <TableHead 
                    key={col} 
                    className="font-semibold text-foreground min-w-[120px] whitespace-nowrap"
                  >
                    {col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground font-mono text-sm sticky left-0 bg-card z-10">
                    {idx + 1}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className="max-w-[200px] whitespace-nowrap">
                      {row[col] === null || row[col] === undefined ? (
                        <span className="text-destructive/60 italic text-sm">null</span>
                      ) : (
                        String(row[col])
                      )}
                    </TableCell>
                  ))}
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
        <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        
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
