import { Database } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Data Reliability Assistant
            </h1>
            <p className="text-sm text-muted-foreground italic">
              An Agentic approach for ensuring reliable marketing data
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
