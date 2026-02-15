import { useMemo, useRef, useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const reportRef = useRef<HTMLDivElement>(null);

  const dimensionScores = useMemo(() => {
    if (kpiData.length === 0)
      return { Accuracy: null, Completeness: null, Uniqueness: null, Consistency: null, Timeliness: null, Validity: null };

    const accuracy =
      kpiData.reduce((s, r) => s + r.Accuracy, 0) / kpiData.length;
    const completeness =
      kpiData.reduce((s, r) => s + r["Completeness (%)"], 0) / kpiData.length;

    const avgDupCount =
      kpiData.reduce((s, r) => s + r["Uniqueness (Dup count)"], 0) / kpiData.length;
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

  const handleDownloadReport = useCallback(async () => {
    if (!reportRef.current) return;

    // Build an HTML document containing the KPI table + the visual report
    const kpiTableHTML = buildKPITableHTML(kpiData);
    const chartsHTML = reportRef.current.innerHTML;

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Data Quality Report</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 40px; color: #1a1a1a; }
    h1 { font-size: 24px; color: #1e3a5f; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #e5e7eb; padding: 8px 12px; text-align: left; font-size: 13px; font-weight: 600; border: 1px solid #d1d5db; }
    td { padding: 8px 12px; font-size: 13px; border: 1px solid #d1d5db; }
    tr:nth-child(even) { background: #f9fafb; }
    .charts-section { margin-top: 20px; }
    .charts-section h3 { color: #1e3a5f; }
  </style>
</head>
<body>
  <h1>Data Quality Report</h1>
  <div class="meta">
    <div>Dataset: <strong>${fileName}</strong></div>
    <div>Generated: ${getISTDateTime()} (IST)</div>
  </div>
  <h3>Data Reliability KPIs</h3>
  ${kpiTableHTML}
  <div class="charts-section">
    ${chartsHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_quality_report.html";
    link.click();
  }, [kpiData, fileName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full overflow-y-auto bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
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

        {/* Visual report content (also used for download) */}
        <div ref={reportRef}>
          {/* Overall DQ Score */}
          <div className="mt-6 flex flex-col items-center">
            <h3 className="text-lg font-bold mb-1" style={{ color: "#1e3a5f" }}>
              Overall DQ Score
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Average of available dimensions ({naCount} NA dimension
              {naCount !== 1 ? "s" : ""} excluded)
            </p>
            <SpeedometerChart
              value={overallScore}
              title=""
              size={260}
            />
          </div>

          {/* Individual Dimension Gauges */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4 text-center" style={{ color: "#1e3a5f" }}>
              Individual DQ Dimensions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {DQ_DIMENSIONS.map((dim) => (
                <SpeedometerChart
                  key={dim}
                  value={dimensionScores[dim]}
                  title={dim}
                  size={220}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function buildKPITableHTML(kpiData: DQReportDialogProps["kpiData"]): string {
  const headers = ["#", "Column", "Accuracy", "Completeness (%)", "Uniqueness (Dup count)", "Overall Score"];
  const headerRow = headers.map((h) => `<th>${h}</th>`).join("");
  const bodyRows = kpiData
    .map(
      (row, i) =>
        `<tr><td>${i + 1}</td><td>${row.Column}</td><td>${row.Accuracy}</td><td>${row["Completeness (%)"]}</td><td>${row["Uniqueness (Dup count)"]}</td><td>${row["Overall Score"]}</td></tr>`
    )
    .join("");
  return `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

export default DQReportDialog;
