import { useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./DataTable";

interface ReliabilityKPIReportProps {
  data: Record<string, unknown>[];
  title?: string;
}

interface KPIRecord {
  column: string;
  accuracy: number;
  completeness: number;
  uniqueness_dup_count: number;
  overall_score: number;
}

const ReliabilityKPIReport = ({ data, title = "Data Reliability KPIs" }: ReliabilityKPIReportProps) => {
  const kpiData = useMemo(() => {
    if (data.length === 0) return [];

    const columns = Object.keys(data[0]);
    const totalRows = data.length;

    return columns.map((col) => {
      // Count non-null values
      const nonNullCount = data.filter(
        (row) => row[col] !== null && row[col] !== undefined && row[col] !== ""
      ).length;
      const nonNullPct = (nonNullCount / totalRows) * 100;

      // Accuracy: 100 if complete, otherwise percentage
      const accuracyScore = nonNullPct === 100 ? 100 : Math.round(nonNullPct * 100) / 100;

      // Completeness
      const nullCount = totalRows - nonNullCount;

      // Uniqueness: count duplicates
      const values = data.map((row) => String(row[col]));
      const uniqueValues = new Set(values);
      const duplicateCount = values.length - uniqueValues.size;

      // Overall quality score with weighting
      const qualityScore = 100 - (nullCount / totalRows) * 100 * 0.5;

      return {
        column: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        accuracy: accuracyScore,
        completeness: Math.round(nonNullPct * 100) / 100,
        uniqueness_dup_count: duplicateCount,
        overall_score: Math.round(qualityScore * 100) / 100,
      };
    });
  }, [data]);

  const sortedKpiData = useMemo(() => {
    return [...kpiData].sort((a, b) => b.overall_score - a.overall_score);
  }, [kpiData]);

  const handleDownloadPDF = () => {
    // Create a simple text-based report (PDF generation would require a library)
    const headers = ["Column", "Accuracy", "Completeness (%)", "Uniqueness (Dup count)", "Overall Score"];
    const rows = sortedKpiData.map((row) => [
      row.column,
      row.accuracy,
      row.completeness,
      row.uniqueness_dup_count,
      row.overall_score,
    ]);

    const content = [
      "Data Reliability KPIs Report",
      "=" .repeat(50),
      "",
      headers.join(" | "),
      "-".repeat(80),
      ...rows.map((row) => row.join(" | ")),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_reliability_report.txt";
    link.click();
  };

  // Transform for DataTable display
  const tableData = sortedKpiData.map((row) => ({
    Column: row.column,
    Accuracy: row.accuracy,
    "Completeness (%)": row.completeness,
    "Uniqueness (Dup count)": row.uniqueness_dup_count,
    "Overall Score": row.overall_score,
  }));

  return (
    <div className="space-y-4">
      <DataTable title={title} data={tableData} />
      <Button onClick={handleDownloadPDF} className="gap-2">
        <Download className="w-4 h-4" />
        Download Data Reliability Report
      </Button>
    </div>
  );
};

export default ReliabilityKPIReport;
