import { useState } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  onClear: () => void;
  isProcessing: boolean;
}

const QueryInput = ({ onSubmit, onClear, isProcessing }: QueryInputProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const suggestions = [
    "Analyze the uploaded data for reliability issues",
    "Generate data reliability report",
    "Remove records with null values",
    "Show data quality summary",
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your query... (e.g., 'Generate data reliability report')"
          className="min-h-[120px] pr-4 resize-none text-base bg-card border-border focus:ring-2 focus:ring-primary/20"
          disabled={isProcessing}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(suggestion)}
            className="px-3 py-1.5 text-sm bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full transition-colors"
            disabled={isProcessing}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onClear}
          className="gap-2"
          disabled={isProcessing}
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </Button>

        <span className="text-xs text-muted-foreground ml-auto">
          Press ⌘+Enter to submit
        </span>
      </div>
    </div>
  );
};

export default QueryInput;
