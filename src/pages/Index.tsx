import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, MessageSquare, BarChart3, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import DataPreview from "@/components/DataPreview";
import ReliabilityReport from "@/components/ReliabilityReport";
import QueryInput from "@/components/QueryInput";
import ChatMessage from "@/components/ChatMessage";
import DownloadOptions from "@/components/DownloadOptions";

interface ChatEntry {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ViewMode = "preview" | "report" | "cleaned";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [cleanedData, setCleanedData] = useState<Record<string, unknown>[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  const handleFileUpload = useCallback((file: File, parsedData: Record<string, unknown>[]) => {
    setUploadedFile(file);
    setData(parsedData);
    setCleanedData([]);
    setViewMode("preview");
    
    setChatHistory((prev) => [
      ...prev,
      {
        type: "assistant",
        content: `Successfully uploaded "${file.name}" with ${parsedData.length} rows and ${Object.keys(parsedData[0] || {}).length} columns. You can now analyze the data or generate a reliability report.`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleClearFile = () => {
    setUploadedFile(null);
    setData([]);
    setCleanedData([]);
    setViewMode("preview");
  };

  const handleQuerySubmit = async (query: string) => {
    setChatHistory((prev) => [
      ...prev,
      { type: "user", content: query, timestamp: new Date() },
    ]);

    setIsProcessing(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerQuery = query.toLowerCase();
    let response = "";

    if (data.length === 0) {
      response = "Please upload a file first before running any analysis.";
    } else if (lowerQuery.includes("reliability report") || lowerQuery.includes("generate report")) {
      setViewMode("report");
      response = "I've generated the Data Reliability Report with KPIs including Accuracy, Completeness, Uniqueness, and Overall Score for each column. You can see the detailed analysis below.";
    } else if (lowerQuery.includes("remove") && (lowerQuery.includes("null") || lowerQuery.includes("empty"))) {
      const cleaned = data.filter((row) => 
        Object.values(row).every((v) => v !== null && v !== undefined && v !== "")
      );
      setCleanedData(cleaned);
      setViewMode("cleaned");
      response = `Removed ${data.length - cleaned.length} rows with null/empty values. The cleaned dataset now has ${cleaned.length} rows. You can download the cleaned data below.`;
    } else if (lowerQuery.includes("analyze") || lowerQuery.includes("summary") || lowerQuery.includes("quality")) {
      setViewMode("report");
      response = "I've analyzed your data for quality and reliability. Check the report below for detailed metrics on each column.";
    } else if (lowerQuery.includes("preview") || lowerQuery.includes("show data")) {
      setViewMode("preview");
      response = "Showing the data preview. You can see the first 10 rows of your uploaded dataset.";
    } else {
      response = "I understand you want to analyze your data. Try commands like:\n• 'Generate data reliability report'\n• 'Remove records with null values'\n• 'Show data quality summary'\n• 'Preview the data'";
    }

    setChatHistory((prev) => [
      ...prev,
      { type: "assistant", content: response, timestamp: new Date() },
    ]);

    setIsProcessing(false);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Upload Section */}
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5 text-primary" />
                Upload Your Data
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload a file (CSV, JSON) and share the intent of the usage of data in the query below.
              </p>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                onClearFile={handleClearFile}
              />
            </CardContent>
          </Card>

          {/* Query Section */}
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
                Query Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QueryInput
                onSubmit={handleQuerySubmit}
                onClear={handleClearHistory}
                isProcessing={isProcessing}
              />

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {chatHistory.map((chat, idx) => (
                      <ChatMessage
                        key={idx}
                        type={chat.type}
                        content={chat.content}
                        timestamp={chat.timestamp}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {data.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {viewMode === "report" ? (
                    <>
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Data Reliability Report
                    </>
                  ) : viewMode === "cleaned" ? (
                    <>
                      <Sparkles className="w-5 h-5 text-success" />
                      Cleaned Data
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Data Preview
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {viewMode === "preview" && <DataPreview data={data} />}
                {viewMode === "report" && <ReliabilityReport data={data} />}
                {viewMode === "cleaned" && (
                  <>
                    <DataPreview data={cleanedData} />
                    <DownloadOptions data={cleanedData} filename="cleaned_data" />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
