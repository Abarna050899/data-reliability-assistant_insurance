import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { syntheticTestData, dataReliabilityCheckData } from "@/data/syntheticData";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import AppFooter from "@/components/AppFooter";
import DataTable from "@/components/DataTable";
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
import { Upload, Send, Trash2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

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

  const handleSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file before submitting.",
        variant: "destructive",
      });
      return;
    }
    setShowResults(true);
  };

  const handleClear = () => {
    setPromptText("");
    setShowResults(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      
      <div className="flex flex-1">
        <AppSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
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
                  <Button onClick={handleSubmit} className="gap-2">
                    <Send className="w-4 h-4" />
                    Submit
                  </Button>
                  <Button variant="secondary" onClick={handleClear} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section - Only shown after Submit */}
            {showResults && (
              <div className="space-y-6 animate-slide-up">
                {/* Preview of Uploaded Data */}
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <DataTable
                      title="Preview of Uploaded Data"
                      data={syntheticTestData}
                    />
                  </CardContent>
                </Card>

                {/* Data Reliability Check */}
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <DataTable
                      title="Data Reliability Check"
                      data={dataReliabilityCheckData}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default Dashboard;
