import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, LogOut, User } from "lucide-react";

const AppHeader = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.role === "admin" ? "Admin" : user?.name || "User";
  const roleLabel = user?.role === "admin" ? "Administrator" : "Data Analyst";

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-primary">Data Reliability Assistant</h1>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          Prototype
        </span>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          onMouseEnter={() => setShowDropdown(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{displayName}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {showDropdown && (
          <div 
            className="absolute right-0 top-full mt-1 w-56 bg-card rounded-lg shadow-lg border border-border py-2 animate-fade-in"
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Role: {roleLabel}</p>
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
