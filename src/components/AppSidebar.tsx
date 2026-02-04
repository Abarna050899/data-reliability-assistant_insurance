import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Menu, 
  X, 
  Database, 
  FileCheck,
  Settings,
  BarChart3,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import tcsLogoWhite from "@/assets/tcs-logo-white.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon, label, active, onClick, collapsed }: SidebarItemProps) => {
  const content = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200",
        active 
          ? "bg-primary/20 text-primary border-l-3 border-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <div className={cn(
        "flex items-center justify-center",
        active && "text-primary"
      )}>
        {icon}
      </div>
      {!collapsed && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-card border-border">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const AppSidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState("data-reliability");

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
      {/* Toggle Button */}
      <div className="p-3 border-b border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors duration-200"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-muted-foreground" />
          ) : (
            <X className="w-5 h-5 text-muted-foreground" />
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
              <p className="text-sm font-semibold text-foreground">Data Reliability Assistant</p>
              <p className="text-xs text-muted-foreground leading-tight">An Agentic approach for ensuring reliable marketing data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {/* Admin Section - Only visible to admins */}
        {isAdmin && !isCollapsed && (
          <div className="mb-2 animate-fade-in">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
          </div>
        )}

        {/* Data Quality Workflow Section */}
        <div className="mb-2">
          {!isCollapsed && (
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-fade-in">
              Data Quality Workflow
            </p>
          )}
          
          <SidebarItem 
            icon={<Database className="w-5 h-5" />} 
            label="Data Quality Workflow"
            collapsed={isCollapsed}
            active={activeItem === "data-quality"}
            onClick={() => setActiveItem("data-quality")}
          />
          
          <SidebarItem 
            icon={<FileCheck className="w-5 h-5" />} 
            label="Data Reliability Assistant"
            active={activeItem === "data-reliability"}
            collapsed={isCollapsed}
            onClick={() => setActiveItem("data-reliability")}
          />

          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="User Management"
            collapsed={isCollapsed}
            active={activeItem === "users"}
            onClick={() => setActiveItem("users")}
          />

          <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Settings"
            collapsed={isCollapsed}
            active={activeItem === "settings"}
            onClick={() => setActiveItem("settings")}
          />

          <SidebarItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Analytics"
            collapsed={isCollapsed}
            active={activeItem === "analytics"}
            onClick={() => setActiveItem("analytics")}
          />
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
