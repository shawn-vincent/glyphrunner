import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MessageBubbleProps {
  type: "user" | "assistant";
  content: ReactNode;
  timestamp: string;
  isEditing?: boolean;
  className?: string;
}

export function MessageBubble({ 
  type, 
  content, 
  timestamp, 
  isEditing = false,
  className 
}: MessageBubbleProps) {
  const isUser = type === "user";
  
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
      : "border-assistant-bubble-border bg-assistant-bubble"
  );
  
  const bubbleClass = cn(
    "px-4 py-2 rounded-3xl border-2 w-fit whitespace-pre-wrap text-foreground",
    isUser 
      ? "border-user-bubble-border bg-user-bubble"
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