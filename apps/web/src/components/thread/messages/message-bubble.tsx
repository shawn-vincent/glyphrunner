import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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
    "inline-flex items-center px-2 py-1 rounded-full border-2",
    isUser 
      ? "border-user-bubble-border bg-user-bubble"
      : isTool
      ? "border-assistant-bubble-border bg-assistant-bubble"
      : "border-assistant-bubble-border bg-assistant-bubble"
  );
  
  const bubbleClass = cn(
    "px-4 py-2 rounded-3xl border-2 w-fit whitespace-pre-wrap text-foreground",
    isUser 
      ? "border-user-bubble-border bg-user-bubble"
      : isTool
      ? "border-assistant-bubble-border bg-assistant-bubble"
      : "border-assistant-bubble-border bg-assistant-bubble"
  );
  
  return (
    <div className={containerClass}>
      <div className={pillAndBubbleContainer}>
        {/* Pill and timestamp */}
        <div className={pillContainer}>
          {isUser ? (
            <>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
              <div className={pillClass}>
                <span className="text-xs font-medium text-foreground">user</span>
              </div>
            </>
          ) : isTool ? (
            <>
              <div className={pillClass}>
                <span className="text-xs font-medium text-foreground">Tool {toolName || "tool"}</span>
                {toolId && (
                  <code className="ml-1 text-xs opacity-70 font-mono">{toolId}</code>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </>
          ) : (
            <>
              <div className={pillClass}>
                <span className="text-xs font-medium text-foreground">assistant</span>
              </div>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </>
          )}
        </div>
        
        {/* Message bubble */}
        <div className={bubbleClass}>
          {content}
        </div>
      </div>
    </div>
  );
}