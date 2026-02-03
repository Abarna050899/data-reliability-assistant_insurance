import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Shield, 
  Users, 
  Settings,
  BarChart3,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}

const SidebarItem = ({ icon, label, active, onClick, children, defaultExpanded = false }: SidebarItemProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = !!children;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onClick?.();
        }}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
          active 
            ? "bg-primary/10 text-primary font-medium border-l-3 border-primary" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {hasChildren && (
          expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {hasChildren && expanded && (
        <div className="ml-4 border-l border-border">
          {children}
        </div>
      )}
    </div>
  );
};

const AppSidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-[calc(100vh-3.5rem-3.5rem)]">
      {/* TCS Logo Area */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TCS</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">TCS Data Discovery</p>
            <p className="text-xs text-muted-foreground">Enterprise Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <div className="mb-2">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            <SidebarItem 
              icon={<Users className="w-4 h-4" />} 
              label="User Management" 
            />
            <SidebarItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Access Control" 
            />
            <SidebarItem 
              icon={<Settings className="w-4 h-4" />} 
              label="Settings" 
            />
          </div>
        )}

        {/* Data Quality Workflow Section */}
        <div className="mb-2">
          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Data Quality Workflow
          </p>
          <SidebarItem 
            icon={<Database className="w-4 h-4" />} 
            label="Data Quality Workflow"
            defaultExpanded={true}
          >
            <SidebarItem 
              icon={<FileCheck className="w-4 h-4" />} 
              label="Data Reliability Assistant"
              active={true}
            />
            <SidebarItem 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Quality Reports"
            />
          </SidebarItem>
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
