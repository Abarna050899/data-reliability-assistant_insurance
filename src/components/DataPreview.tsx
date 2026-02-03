import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DataPreviewProps {
  data: Record<string, unknown>[];
  maxRows?: number;
}

const DataPreview = ({ data, maxRows = 10 }: DataPreviewProps) => {
  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const displayData = data.slice(0, maxRows);

  const getDataType = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "string") {
      // Check if it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
      // Check if it looks like an email
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "email";
    }
    return "string";
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "number":
        return "default";
      case "date":
        return "secondary";
      case "email":
        return "outline";
      case "null":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Data Preview</h3>
        <span className="text-sm text-muted-foreground">
          Showing {displayData.length} of {data.length} rows • {columns.length} columns
        </span>
      </div>

      <ScrollArea className="w-full rounded-lg border border-border">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 font-semibold text-foreground">#</TableHead>
                {columns.map((col) => (
                  <TableHead key={col} className="font-semibold text-foreground min-w-[120px]">
                    <div className="flex flex-col gap-1">
                      <span>{col}</span>
                      <Badge variant={getTypeBadgeVariant(getDataType(data[0][col]))} className="w-fit text-xs">
                        {getDataType(data[0][col])}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {idx + 1}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className="max-w-[200px] truncate">
                      {row[col] === null || row[col] === undefined ? (
                        <span className="text-muted-foreground italic">null</span>
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
      </ScrollArea>

      {data.length > maxRows && (
        <p className="text-sm text-muted-foreground text-center">
          ... and {data.length - maxRows} more rows
        </p>
      )}
    </div>
  );
};

export default DataPreview;
