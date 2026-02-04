import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

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

  const displayName = user?.role === "admin" ? "Admin User" : user?.name || "Analyst User";
  const roleLabel = user?.role === "admin" ? "Administrator" : "Data Analyst";

  return (
    <header className="h-14 bg-[hsl(220,40%,13%)] border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-primary italic">Data Reliability Assistant</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Logged in: <span className="font-semibold text-foreground">{displayName}</span></span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              logout();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
