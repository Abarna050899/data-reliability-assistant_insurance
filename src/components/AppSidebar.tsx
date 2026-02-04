import { useState } from "react";
import { 
  Menu, 
  X, 
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import tcsLogoWhite from "@/assets/tcs-logo-white.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={cn(
        "bg-[hsl(220,40%,13%)] border-r border-border flex flex-col fixed top-14 left-0 h-[calc(100vh-3.5rem-3.5rem)] z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {/* Toggle Button - positioned at corner when expanded */}
      <div className={cn(
        "p-3 border-b border-border",
        !isCollapsed && "flex justify-end"
      )}>
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center rounded-lg hover:bg-muted transition-colors duration-200",
            isCollapsed ? "w-full p-2" : "p-1.5"
          )}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-muted-foreground" />
          ) : (
            <X className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* TCS Logo Area */}
      <div className={cn(
        "p-3 border-b border-border transition-all duration-300",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center p-1 flex-shrink-0">
            <img src={tcsLogoWhite} alt="TCS Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <p className="text-xs text-muted-foreground leading-tight">An Agentic approach for ensuring reliable marketing data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {/* Data Quality Workflow Section */}
        <div className="mb-2">
          {!isCollapsed && (
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-fade-in">
              Data Quality Workflow
            </p>
          )}
          
          {/* Data Quality Workflow - Collapsible Parent */}
          {isCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-full flex items-center justify-center py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card border-border">
                  <p>Data Quality Workflow</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <button
                onClick={() => setIsWorkflowExpanded(!isWorkflowExpanded)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                <span className="flex-1 text-left whitespace-nowrap">Data Quality Workflow</span>
                {isWorkflowExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Child Item - Data Reliability Assistant */}
              {isWorkflowExpanded && (
                <button
                  className="w-full flex items-center gap-3 pl-8 pr-3 py-2.5 text-sm bg-primary/20 text-primary border-l-2 border-primary transition-all duration-200 animate-fade-in"
                >
                  <FileText className="w-4 h-4" />
                  <span className="flex-1 text-left whitespace-nowrap">Data Reliability Assistant</span>
                </button>
              )}
            </>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;