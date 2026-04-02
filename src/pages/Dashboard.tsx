import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedRules } from "@/contexts/SavedRulesContext";
import { useUploadedColumns } from "@/contexts/UploadedColumnsContext";
import { syntheticTestData, dataReliabilityCheckData } from "@/data/syntheticData";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import AppFooter from "@/components/AppFooter";
import DataTable from "@/components/DataTable";
import ReliabilityKPIReport from "@/components/ReliabilityKPIReport";
import CleanedDataView from "@/components/CleanedDataView";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import RuleConfigurator from "@/components/RuleConfigurator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Send, Trash2, CheckCircle2, Loader2, Eye, CloudUpload, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ColumnInfo } from "@/contexts/UploadedColumnsContext";

type QueryMode = "preview" | "kpi_report" | "clean_data" | "mask_pii";
type ActiveView = "data-reliability" | "rule-configurator";

interface ChatMessage {
  query: string;
  mode: QueryMode;
  timestamp: Date;
}

function inferDataType(value: unknown): string {
  if (value === null || value === undefined) return "unknown";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
    if (/^https?:\/\//.test(value)) return "url";
    return "string";
  }
  return "string";
}

function parseCSVHeader(text: string): ColumnInfo[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const firstRow = lines[1].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
  return headers.map((name, i) => {
    const raw = firstRow[i] ?? "";
    let dataType = "string";
    if (raw === "" || raw.toLowerCase() === "null") dataType = "unknown";
    else if (!isNaN(Number(raw))) dataType = "number";
    else if (raw === "true" || raw === "false") dataType = "boolean";
    else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) dataType = "date";
    else if (/^https?:\/\//.test(raw)) dataType = "url";
    return { name, dataType };
  });
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { savedRules, setSavedRules } = useSavedRules();
  const { setUploadedColumns } = useUploadedColumns();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("data-reliability");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSavedRulesDialog, setShowSavedRulesDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column selection for Rule Name column
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // View Saved Rules dialog state
  const [selectedExecutorRuleId, setSelectedExecutorRuleId] = useState<string | null>(null);
  const [showColumnSelectInDialog, setShowColumnSelectInDialog] = useState(false);
  const [tempDialogColumns, setTempDialogColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (showWelcome && user) {
      const displayName = user.role === "admin" ? "Admin" : user.name;
      toast({
        title: "Login successful",
        description: `Welcome ${displayName}!`,
      });
      setShowWelcome(false);
    }
  }, [user, showWelcome, toast]);

  const determineQueryMode = (query: string): QueryMode => {
    const lowerQuery = query.toLowerCase().trim();
    if (lowerQuery.startsWith("please generate data reliability report") || lowerQuery.includes("reliability report")) {
      return "kpi_report";
    } else if (lowerQuery.startsWith("please remove records") || lowerQuery.includes("remove null") || lowerQuery.includes("clean data")) {
      return "clean_data";
    } else if (lowerQuery.includes("mask") && lowerQuery.includes("pii")) {
      return "mask_pii";
    }
    return "preview";
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please upload a file before submitting.", variant: "destructive" });
      return;
    }
    if (!promptText.trim()) {
      toast({ title: "No query entered", description: "Please enter a query before submitting.", variant: "destructive" });
      return;
    }

    const queryText = promptText;
    setPromptText("");
    setIsProcessing(true);

    setProcessingStatus("Processing your query...");
    await sleep(2000);
    setProcessingStatus("Supervisor agent started...");
    await sleep(2000);
    setProcessingStatus("Collaborator agent selected and kicked...");
    await sleep(2000);

    setIsProcessing(false);
    setProcessingStatus("");

    const mode = determineQueryMode(queryText);
    const newMessage: ChatMessage = { query: queryText, mode, timestamp: new Date() };
    setChatHistory((prev) => [...prev, newMessage]);
  };

  const handleClear = () => {
    setPromptText("");
    setChatHistory([]);
  };

  // Extract columns from file and share with context
  const extractAndShareColumns = useCallback((file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext === ".csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const cols = parseCSVHeader(text);
        setUploadedColumns(cols);
      };
      // Read only first 4KB for header + first row
      reader.readAsText(file.slice(0, 4096));
    } else {
      // For non-CSV, extract from synthetic data as fallback
      const sample = syntheticTestData[0];
      if (sample) {
        const cols: ColumnInfo[] = Object.entries(sample).map(([key, val]) => ({
          name: key,
          dataType: inferDataType(val),
        }));
        setUploadedColumns(cols);
      }
    }
  }, [setUploadedColumns]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = [".csv", ".xlsx", ".xls", ".json"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (validTypes.includes(ext)) {
        setSelectedFile(file);
        extractAndShareColumns(file);
        toast({ title: "File uploaded", description: `${file.name} selected successfully.` });
      } else {
        toast({ title: "Invalid file type", description: "Please upload CSV, XLSX, or JSON files.", variant: "destructive" });
      }
    }
  }, [toast, extractAndShareColumns]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      extractAndShareColumns(files[0]);
      toast({ title: "File uploaded", description: `${files[0].name} selected successfully.` });
    }
  }, [toast, extractAndShareColumns]);

  // Computed data
  const allColumnNames = dataReliabilityCheckData.map(r => r.column_name);

  const enhancedReliabilityData = dataReliabilityCheckData.map(row => ({
    column_name: row.column_name,
    data_type: row.data_type,
    null_check_eligibility: row.null_check_eligibility,
    format_check: row.format_check,
    rule_name: selectedColumns.includes(row.column_name) ? "Yes" : "No",
  }));

  // Get executor rules for the popup — must be Active AND have Executor permission
  const executorRules = savedRules.filter((rule) =>
    rule.status === "Active" &&
    rule.permissions.some((p) => p.role === "Executor")
  );

  // Delete rule handler
  const handleDeleteRule = () => {
    if (!selectedExecutorRuleId) {
      toast({ title: "No rule selected", description: "Please open View Saved Rules and select a rule first.", variant: "destructive" });
      return;
    }
    const ruleName = savedRules.find(r => r.id === selectedExecutorRuleId)?.ruleName;
    setSavedRules(prev => prev.filter(r => r.id !== selectedExecutorRuleId));
    setSelectedExecutorRuleId(null);
    toast({ title: "Rule deleted", description: `Rule "${ruleName}" has been deleted.` });
  };

  // View Saved Rules dialog column select handlers
  const handleOpenColumnSelect = () => {
    setTempDialogColumns([...selectedColumns]);
    setShowColumnSelectInDialog(true);
  };

  const handleDialogColumnApply = () => {
    setSelectedColumns([...tempDialogColumns]);
    setShowColumnSelectInDialog(false);
    setShowSavedRulesDialog(false);
    toast({ title: "Columns applied", description: "Column selections have been updated." });
  };

  const handleDialogCancel = () => {
    setShowColumnSelectInDialog(false);
    setShowSavedRulesDialog(false);
  };

  const toggleDialogColumn = (col: string) => {
    setTempDialogColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-14">
      <AppHeader />
      
      <div className="flex flex-1">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        
        {/* Main content - white background with black text */}
        <main className="flex-1 p-6 overflow-auto bg-white text-black">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === "rule-configurator" ? (
              <RuleConfigurator />
            ) : (
              <>
                {/* File Upload Section - Drag & Drop */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-black">
                      <Upload className="w-5 h-5 text-primary" />
                      Please upload a file (CSV, Excel, etc.) and share the intent of the usage of data in the text area.
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Upload your file</p>
                  </CardHeader>
                  <CardContent>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 flex items-center justify-between transition-colors cursor-pointer",
                        isDragOver
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400",
                        selectedFile && "border-green-400 bg-green-50"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex items-center gap-3">
                        <CloudUpload className="w-8 h-8 text-gray-400" />
                        <div>
                          {selectedFile ? (
                            <>
                              <p className="text-sm font-medium text-black">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-gray-700">Drag and drop file here</p>
                              <p className="text-xs text-gray-500">Limit 200MB per file • CSV, XLSX, JSON</p>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.json"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>

                    {selectedFile && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">File selected</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setUploadedColumns([]);
                          }}
                          className="ml-auto text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Prompt Input Section */}
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-black">Please prompt in your request here</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Enter your query... (e.g., 'Analyze the uploaded data for reliability issues')"
                      className="min-h-[100px] resize-none border-gray-300 bg-white text-black placeholder:text-gray-400"
                    />

                    <div className="flex items-center gap-3">
                      <Button onClick={handleSubmit} className="gap-2" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Submit
                      </Button>
                      <Button variant="secondary" onClick={handleClear} className="gap-2" disabled={isProcessing}>
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </Button>
                    </div>

                    {/* Processing Status */}
                    {isProcessing && (
                      <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg animate-fade-in">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-sm font-medium text-primary">{processingStatus}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className="space-y-6">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className="space-y-4 animate-slide-up">
                        {/* User Query */}
                        <Card className="shadow-sm bg-gray-50 border border-gray-200">
                          <CardContent className="pt-4 pb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-black">User Query:</span> {chat.query}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Response based on mode */}
                        {chat.mode === "preview" && (
                          <>
                            <Card className="shadow-sm border border-gray-200 bg-white">
                              <CardContent className="pt-6">
                                <DataTable
                                  title="Preview of Uploaded Data"
                                  data={syntheticTestData}
                                  highlightPII
                                />
                                <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  <span>
                                    <strong>PII Detected:</strong> Columns highlighted in amber contain Personally Identifiable Information (customer_id, age, account_created_date, emotion, Post, URL). To mask PII data in downloads, use the query: <em>"mask the PII data for download"</em>.
                                  </span>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="shadow-sm border border-gray-200 bg-white">
                              <CardContent className="pt-6">
                                <DataTable
                                  title="Data Reliability Check"
                                  data={enhancedReliabilityData}
                                />
                              </CardContent>
                            </Card>

                            {/* Action Buttons: View Saved Rules, Delete */}
                            <div className="flex items-center gap-3 mt-4">
                              <Button
                                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => {
                                  setShowColumnSelectInDialog(false);
                                  setShowSavedRulesDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                View Saved Rules
                              </Button>
                              <Button
                                className="gap-2 bg-red-600 text-white hover:bg-red-700"
                                onClick={handleDeleteRule}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </>
                        )}

                        {chat.mode === "kpi_report" && (
                          <Card className="shadow-sm border border-gray-200 bg-white">
                            <CardContent className="pt-6">
                              <ReliabilityKPIReport
                                data={syntheticTestData}
                                title="Data Reliability KPIs"
                                fileName={selectedFile?.name?.replace(/\.[^/.]+$/, "") || "synthetic_data_for_testing"}
                              />
                            </CardContent>
                          </Card>
                        )}

                        {chat.mode === "clean_data" && (
                          <Card className="shadow-sm border border-gray-200 bg-white">
                            <CardContent className="pt-6">
                              <CleanedDataView
                                originalData={syntheticTestData}
                              />
                            </CardContent>
                          </Card>
                        )}

                        {chat.mode === "mask_pii" && (
                          <>
                            <Card className="shadow-sm border border-gray-200 bg-white">
                              <CardContent className="pt-6">
                                <DataTable
                                  title="Preview of Uploaded Data (PII Masked for Download)"
                                  data={syntheticTestData}
                                  highlightPII
                                  maskPIIDownload
                                />
                                <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                                  <ShieldAlert className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span>
                                    <strong>PII Masking Active:</strong> All PII columns will be masked when you download data from this view.
                                  </span>
                                </div>
                                <CleanedDataView originalData={syntheticTestData} maskPIIDownload />
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* View Saved Rules Dialog */}
      <Dialog open={showSavedRulesDialog} onOpenChange={setShowSavedRulesDialog}>
        <DialogContent className="max-w-3xl bg-white text-black border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">Saved Rules (Executor Access)</DialogTitle>
          </DialogHeader>

          {/* Executor Rules Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12 text-black"></TableHead>
                    <TableHead className="text-black">Rule Name</TableHead>
                    <TableHead className="text-black">DQ Dimension</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black">Created On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executorRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No rules with Executor permissions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    executorRules.map((rule) => (
                      <TableRow
                        key={rule.id}
                        className={cn(
                          "hover:bg-gray-50 cursor-pointer",
                          selectedExecutorRuleId === rule.id && "bg-blue-50"
                        )}
                        onClick={() => setSelectedExecutorRuleId(rule.id)}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            name="executor-rule"
                            checked={selectedExecutorRuleId === rule.id}
                            onChange={() => setSelectedExecutorRuleId(rule.id)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-black">{rule.ruleName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-gray-400 text-gray-800">
                            {rule.dqDimension}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs",
                              rule.status === "Active"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {rule.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {format(rule.createdOn, "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Column Selection Area (toggled by Select Column) */}
          {showColumnSelectInDialog && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-black mb-3">Select Columns</h4>
              <div className="grid grid-cols-3 gap-2">
                {allColumnNames.map((col) => (
                  <label key={col} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <Checkbox
                      checked={tempDialogColumns.includes(col)}
                      onCheckedChange={() => toggleDialogColumn(col)}
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleOpenColumnSelect}
            >
              Select Column
            </Button>
            <Button
              onClick={showColumnSelectInDialog ? handleDialogColumnApply : handleDialogCancel}
            >
              Apply
            </Button>
            <Button
              variant="secondary"
              onClick={handleDialogCancel}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      <AppFooter />
    </div>
  );
};

export default Dashboard;
