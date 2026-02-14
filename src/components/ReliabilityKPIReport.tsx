import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./DataTable";
import DQReportDialog from "./DQReportDialog";

interface ReliabilityKPIReportProps {
  data: Record<string, unknown>[];
  title?: string;
  fileName?: string;
}

const ReliabilityKPIReport = ({
  data,
  title = "Data Reliability KPIs",
  fileName = "synthetic_data_for_testing",
}: ReliabilityKPIReportProps) => {
  const [showDQReport, setShowDQReport] = useState(false);

  const kpiData = useMemo(() => {
    if (data.length === 0) return [];

    const columns = Object.keys(data[0]);
    const totalRows = data.length;

    return columns.map((col) => {
      const nonNullCount = data.filter(
        (row) => row[col] !== null && row[col] !== undefined && row[col] !== ""
      ).length;
      const nonNullPct = (nonNullCount / totalRows) * 100;
      const accuracyScore = nonNullPct === 100 ? 100 : Math.round(nonNullPct * 100) / 100;
      const nullCount = totalRows - nonNullCount;
      const values = data.map((row) => String(row[col]));
      const uniqueValues = new Set(values);
      const duplicateCount = values.length - uniqueValues.size;
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
      <Button onClick={() => setShowDQReport(true)} className="gap-2">
        <Eye className="w-4 h-4" />
        View Data Reliability Report
      </Button>

      <DQReportDialog
        open={showDQReport}
        onOpenChange={setShowDQReport}
        kpiData={tableData}
        fileName={fileName}
      />
    </div>
  );
};

export default ReliabilityKPIReport;
