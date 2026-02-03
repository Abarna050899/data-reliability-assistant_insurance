import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReliabilityReportProps {
  data: Record<string, unknown>[];
}

interface ColumnMetrics {
  column: string;
  accuracy: number;
  completeness: number;
  uniqueness: number;
  duplicateCount: number;
  overallScore: number;
  dataType: string;
}

const ReliabilityReport = ({ data }: ReliabilityReportProps) => {
  const metrics = useMemo(() => {
    if (data.length === 0) return [];

    const columns = Object.keys(data[0]);
    const totalRows = data.length;

    return columns.map((col): ColumnMetrics => {
      const values = data.map((row) => row[col]);
      const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "");
      const nonNullCount = nonNullValues.length;
      const completeness = (nonNullCount / totalRows) * 100;

      // Count duplicates
      const valueSet = new Set(nonNullValues.map(String));
      const duplicateCount = nonNullCount - valueSet.size;
      const uniqueness = nonNullCount > 0 ? ((valueSet.size / nonNullCount) * 100) : 100;

      // Determine data type
      const sampleValue = nonNullValues[0];
      let dataType = "string";
      if (typeof sampleValue === "number") {
        dataType = "numeric";
      } else if (typeof sampleValue === "boolean") {
        dataType = "boolean";
      } else if (typeof sampleValue === "string") {
        if (/^\d{4}-\d{2}-\d{2}/.test(sampleValue)) {
          dataType = "datetime";
        }
      }

      // Accuracy (simplified - based on non-null percentage)
      const accuracy = completeness;

      // Overall score (weighted average)
      const overallScore = accuracy * 0.4 + completeness * 0.4 + uniqueness * 0.2;

      return {
        column: col,
        accuracy: Math.round(accuracy * 100) / 100,
        completeness: Math.round(completeness * 100) / 100,
        uniqueness: Math.round(uniqueness * 100) / 100,
        duplicateCount,
        overallScore: Math.round(overallScore * 100) / 100,
        dataType,
      };
    });
  }, [data]);

  const averageScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + m.overallScore, 0) / metrics.length);
  }, [metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (score >= 70) return <AlertCircle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-warning";
    return "bg-destructive";
  };

  if (data.length === 0) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", getScoreColor(averageScore))}>
              {averageScore}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.length.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Quality Columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {metrics.filter((m) => m.overallScore >= 90).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Data Reliability KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Column</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Accuracy</TableHead>
                <TableHead className="font-semibold">Completeness</TableHead>
                <TableHead className="font-semibold">Uniqueness</TableHead>
                <TableHead className="font-semibold">Duplicates</TableHead>
                <TableHead className="font-semibold">Overall Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((metric) => (
                  <TableRow key={metric.column} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{metric.column}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {metric.dataType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={metric.accuracy}
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{metric.accuracy}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={metric.completeness}
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{metric.completeness}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={metric.uniqueness}
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{metric.uniqueness}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={metric.duplicateCount > 0 ? "destructive" : "secondary"}>
                        {metric.duplicateCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(metric.overallScore)}
                        <span className={cn("font-semibold", getScoreColor(metric.overallScore))}>
                          {metric.overallScore}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReliabilityReport;
