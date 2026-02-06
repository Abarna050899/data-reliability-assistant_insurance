import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Send, Trash2, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QueryMode = "preview" | "kpi_report" | "clean_data";
type ActiveView = "data-reliability" | "rule-configurator";

interface ChatMessage {
  query: string;
  mode: QueryMode;
  timestamp: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("data-reliability");
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
    }
    return "preview";
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!promptText.trim()) {
      toast({
        title: "No query entered",
        description: "Please enter a query before submitting.",
        variant: "destructive",
      });
      return;
    }

    const queryText = promptText;
    setPromptText("");
    setIsProcessing(true);

    // Processing your query...
    setProcessingStatus("Processing your query...");
    await sleep(2000);

    // Supervisor agent started...
    setProcessingStatus("Supervisor agent started...");
    await sleep(2000);

    // Collaborator agent selected and kicked...
    setProcessingStatus("Collaborator agent selected and kicked...");
    await sleep(2000);

    setIsProcessing(false);
    setProcessingStatus("");

    const mode = determineQueryMode(queryText);
    const newMessage: ChatMessage = {
      query: queryText,
      mode,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, newMessage]);
  };

  const handleClear = () => {
    setPromptText("");
    setChatHistory([]);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-14">
      <AppHeader />
      
      <div className="flex flex-1">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        
        {/* Main content - uses flex layout, sidebar pushes content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === "rule-configurator" ? (
              <RuleConfigurator />
            ) : (
              <>
            {/* File Upload Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5 text-primary" />
                  Please upload a file (CSV, Excel, etc.)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select value={selectedFile || ""} onValueChange={setSelectedFile}>
                    <SelectTrigger className="w-80">
                      <SelectValue placeholder="Select a file..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synthetic_data_for_testing.csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-success" />
                          Synthetic_data_for_testing.csv
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-lg animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">File selected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prompt Input Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Please prompt in your request here</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your query... (e.g., 'Analyze the uploaded data for reliability issues')"
                  className="min-h-[100px] resize-none"
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

            {/* Chat History - Append responses below each other */}
            {chatHistory.length > 0 && (
              <div className="space-y-6">
                {chatHistory.map((chat, index) => (
                  <div key={index} className="space-y-4 animate-slide-up">
                    {/* User Query */}
                    <Card className="shadow-sm bg-muted/30">
                      <CardContent className="pt-4 pb-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">User Query:</span> {chat.query}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Response based on mode */}
                    {chat.mode === "preview" && (
                      <>
                        <Card className="shadow-sm">
                          <CardContent className="pt-6">
                            <DataTable
                              title="Preview of Uploaded Data"
                              data={syntheticTestData}
                            />
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                          <CardContent className="pt-6">
                            <DataTable
                              title="Data Reliability Check"
                              data={dataReliabilityCheckData}
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {chat.mode === "kpi_report" && (
                      <Card className="shadow-sm">
                        <CardContent className="pt-6">
                          <ReliabilityKPIReport
                            data={syntheticTestData}
                            title="Data Reliability KPIs"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {chat.mode === "clean_data" && (
                      <Card className="shadow-sm">
                        <CardContent className="pt-6">
                          <CleanedDataView
                            originalData={syntheticTestData}
                          />
                        </CardContent>
                      </Card>
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

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      <AppFooter />
    </div>
  );
};

export default Dashboard;
