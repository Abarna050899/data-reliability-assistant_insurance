import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  type: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

const ChatMessage = ({ type, content, timestamp }: ChatMessageProps) => {
  const isUser = type === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl animate-fade-in",
        isUser ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {isUser ? "You" : "Assistant"}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="text-foreground whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
