import { useMemo, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "./DataTable";
import SpeedometerChart from "./SpeedometerChart";

interface DQReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiData: {
    Column: string;
    Accuracy: number;
    "Completeness (%)": number;
    "Uniqueness (Dup count)": number;
    "Overall Score": number;
  }[];
  fileName: string;
}

const DQ_DIMENSIONS = [
  "Accuracy",
  "Completeness",
  "Uniqueness",
  "Consistency",
  "Timeliness",
  "Validity",
] as const;

function getISTDateTime(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

const DQReportDialog = ({
  open,
  onOpenChange,
  kpiData,
  fileName,
}: DQReportDialogProps) => {
  const dimensionScores = useMemo(() => {
    if (kpiData.length === 0)
      return { Accuracy: null, Completeness: null, Uniqueness: null, Consistency: null, Timeliness: null, Validity: null };

    // Average across all columns for each available dimension
    const accuracy =
      kpiData.reduce((s, r) => s + r.Accuracy, 0) / kpiData.length;
    const completeness =
      kpiData.reduce((s, r) => s + r["Completeness (%)"], 0) / kpiData.length;

    // Uniqueness: convert dup count to a percentage score
    // Lower dup count = better uniqueness
    const totalRows = kpiData.length;
    const avgDupCount =
      kpiData.reduce((s, r) => s + r["Uniqueness (Dup count)"], 0) / kpiData.length;
    // Simple heuristic: uniqueness% = max(0, 100 - avgDupCount * scaling)
    const uniqueness = Math.max(0, Math.min(100, 100 - avgDupCount * 2));

    return {
      Accuracy: Math.round(accuracy * 100) / 100,
      Completeness: Math.round(completeness * 100) / 100,
      Uniqueness: Math.round(uniqueness * 100) / 100,
      Consistency: null as number | null,
      Timeliness: null as number | null,
      Validity: null as number | null,
    };
  }, [kpiData]);

  const overallScore = useMemo(() => {
    const available = Object.values(dimensionScores).filter(
      (v): v is number => v !== null
    );
    if (available.length === 0) return null;
    return Math.round((available.reduce((a, b) => a + b, 0) / available.length) * 100) / 100;
  }, [dimensionScores]);

  const naCount = Object.values(dimensionScores).filter((v) => v === null).length;

  const handleDownloadReport = () => {
    const headers = [
      "Column",
      "Accuracy",
      "Completeness (%)",
      "Uniqueness (Dup count)",
      "Overall Score",
    ];
    const rows = kpiData.map((row) => [
      row.Column,
      row.Accuracy,
      row["Completeness (%)"],
      row["Uniqueness (Dup count)"],
      row["Overall Score"],
    ]);

    const lines: string[] = [
      "Data Quality Report",
      "=" .repeat(60),
      `File: ${fileName}`,
      `Generated: ${getISTDateTime()} (IST)`,
      "",
      "--- Data Reliability KPIs ---",
      "",
      headers.join(" | "),
      "-".repeat(80),
      ...rows.map((row) => row.join(" | ")),
      "",
      "--- Overall DQ Score ---",
      `Overall Score: ${overallScore ?? "NA"}`,
      `(Excludes ${naCount} NA dimension${naCount !== 1 ? "s" : ""})`,
      "",
      "--- Individual DQ Dimensions ---",
      ...DQ_DIMENSIONS.map(
        (d) =>
          `${d}: ${dimensionScores[d] !== null ? dimensionScores[d] : "NA"}`
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_quality_report.txt";
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full overflow-y-auto bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Data Quality Report
          </DialogTitle>
        </DialogHeader>

        {/* Top row: file name left, date + download right */}
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <span className="text-sm text-gray-500">Dataset:</span>{" "}
            <span className="text-sm font-semibold text-gray-800">
              {fileName}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm text-gray-600">{getISTDateTime()} (IST)</span>
            <Button
              size="sm"
              className="gap-2"
              onClick={handleDownloadReport}
            >
              <Download className="w-4 h-4" />
              Download DQ Report
            </Button>
          </div>
        </div>

        {/* KPI Table */}
        <div className="mt-4">
          <DataTable title="Data Reliability KPIs" data={kpiData} />
        </div>

        {/* Overall DQ Score */}
        <div className="mt-6 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Overall DQ Score
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Average of available dimensions ({naCount} NA dimension
            {naCount !== 1 ? "s" : ""} excluded)
          </p>
          <SpeedometerChart
            value={overallScore}
            title=""
            size={240}
          />
        </div>

        {/* Individual Dimension Gauges */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Individual DQ Dimensions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {DQ_DIMENSIONS.map((dim) => (
              <SpeedometerChart
                key={dim}
                value={dimensionScores[dim]}
                title={dim}
                size={200}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DQReportDialog;
