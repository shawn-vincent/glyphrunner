import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Wrench } from "lucide-react";

interface MessageBubbleProps {
  type: "user" | "assistant" | "tool";
  content: ReactNode;
  timestamp: string;
  toolName?: string;
  toolId?: string;
  isEditing?: boolean;
  className?: string;
}

export function MessageBubble({ 
  type, 
  content, 
  timestamp, 
  toolName,
  toolId,
  isEditing = false,
  className 
}: MessageBubbleProps) {
  const isUser = type === "user";
  const isTool = type === "tool";
  
  // Base styles
  const containerClass = cn(
    "flex flex-col gap-1 group",
    isUser ? "ml-auto ml-8" : "mr-8",
    isEditing && "w-full max-w-xl",
    className
  );
  
  const pillAndBubbleContainer = cn(
    "flex flex-col gap-1",
    isUser ? "items-end" : "items-start"
  );
  
  const pillContainer = "flex items-center gap-2";
  
  const pillClass = cn(
    "inline-flex items-center gap-2 px-3 py-1 rounded-full",
    "bg-white dark:bg-black border border-border"
  );
  
  const bubbleClass = cn(
    "px-4 py-2 rounded-3xl border-2 w-fit whitespace-pre-wrap text-foreground backdrop-blur-sm",
    isUser 
      ? "border-user-bubble-border bg-user-bubble"
      : isTool
      ? "border-assistant-bubble-border bg-assistant-bubble"
      : "border-assistant-bubble-border bg-assistant-bubble"
  );
  
  return (
    <div className={containerClass}>
      <div className={pillAndBubbleContainer}>
        {/* Pill with username and timestamp */}
        <div className={pillContainer}>
          {isUser ? (
            <div className={pillClass}>
              <span className="text-xs font-medium" style={{ color: 'var(--user-bubble-border)' }}>user</span>
              <span className="text-xs text-muted-foreground/70">{timestamp}</span>
            </div>
          ) : isTool ? (
            <div className={pillClass}>
              <Wrench className="w-3 h-3" style={{ color: 'var(--user-bubble-border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--user-bubble-border)' }}>{toolName || "tool"}</span>
              <span className="text-xs text-muted-foreground/70">{timestamp}</span>
            </div>
          ) : (
            <div className={pillClass}>
              <span className="text-xs font-medium" style={{ color: 'var(--assistant-bubble-border)' }}>assistant</span>
              <span className="text-xs text-muted-foreground/70">{timestamp}</span>
            </div>
          )}
        </div>
        
        {/* Message bubble */}
        <div className={bubbleClass}>
          <div className="relative">
            {content}
            {isTool && toolId && (
              <div className="flex justify-end mt-3 pt-2 border-t border-border">
                <code className="text-xs text-muted-foreground/70 font-mono">{toolId}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}