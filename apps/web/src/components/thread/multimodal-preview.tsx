import React from "react";
import { File, X as XIcon, FileText } from "lucide-react";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { cn } from "@/lib/utils";

export interface MultimodalPreviewProps {
  block: Base64ContentBlock;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MultimodalPreview: React.FC<MultimodalPreviewProps> = ({
  block,
  removable = false,
  onRemove,
  className,
  size = "md",
}) => {
  // Image block handling
  if (
    block.type === "image" &&
    block.source_type === "base64" &&
    typeof block.mime_type === "string" &&
    block.mime_type.startsWith("image/")
  ) {
    const url = `data:${block.mime_type};base64,${block.data}`;
    let imgClass: string = "rounded-md object-cover h-16 w-16";
    if (size === "sm") imgClass = "rounded-md object-cover h-10 w-10";
    if (size === "lg") imgClass = "rounded-md object-cover h-24 w-24";

    return (
      <div className={cn("relative inline-block", className)}>
        <img
          src={url}
          alt={String(block.metadata?.name || "uploaded image")}
          className={imgClass}
        />
        {removable && (
          <button
            type="button"
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
            onClick={onRemove}
            aria-label="Remove image"
          >
            <XIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // PDF and other document handling
  if (
    block.source_type === "base64" &&
    typeof block.mime_type === "string" &&
    (block.mime_type === "application/pdf" || block.type === "file")
  ) {
    const fileName = String(block.metadata?.name || "document");
    const fileSize = block.metadata?.size 
      ? `${(Number(block.metadata.size) / 1024).toFixed(1)}KB`
      : "";
    
    let containerClass = "flex items-center gap-2 p-2 border rounded-md bg-muted/50";
    let iconSize = "w-4 h-4";
    let textSize = "text-sm";
    
    if (size === "sm") {
      containerClass = "flex items-center gap-1 p-1 border rounded text-xs";
      iconSize = "w-3 h-3";
      textSize = "text-xs";
    }
    if (size === "lg") {
      containerClass = "flex items-center gap-3 p-3 border rounded-lg";
      iconSize = "w-5 h-5";
      textSize = "text-base";
    }

    return (
      <div className={cn(containerClass, className)}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {block.mime_type === "application/pdf" ? (
            <FileText className={cn(iconSize, "text-red-600 flex-shrink-0")} />
          ) : (
            <File className={cn(iconSize, "text-muted-foreground flex-shrink-0")} />
          )}
          <div className="flex flex-col min-w-0">
            <span className={cn(textSize, "font-medium truncate")}>{fileName}</span>
            {fileSize && size !== "sm" && (
              <span className="text-xs text-muted-foreground">{fileSize}</span>
            )}
          </div>
        </div>
        {removable && (
          <button
            type="button"
            className="ml-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            onClick={onRemove}
            aria-label={`Remove ${fileName}`}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Fallback for unknown content types
  return (
    <div className={cn("flex items-center gap-2 p-2 border rounded-md bg-muted/50", className)}>
      <File className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">
        {String(block.metadata?.name || "Unknown file")}
      </span>
      {removable && (
        <button
          type="button"
          className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
          onClick={onRemove}
          aria-label="Remove file"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};