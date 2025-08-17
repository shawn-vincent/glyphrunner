import { AIMessage, ToolMessage } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { cn } from "@/lib/utils";
import { JsonHighlighter } from "../json-highlighter";

function isComplexValue(value: any): boolean {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

// Unified component that combines tool call and result in a single bubble
export function ToolCallWithResult({ 
  toolCall, 
  toolResult 
}: { 
  toolCall: AIMessage["tool_calls"][0]; 
  toolResult?: ToolMessage;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get current time for timestamp
  const timestamp = new Date().toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase().replace(' ', '');

  const args = toolCall.args as Record<string, any>;
  const hasArgs = Object.keys(args).length > 0;

  // Parse tool result if available
  let parsedResult: any;
  let isJsonResult = false;
  let resultContent = "";
  
  if (toolResult) {
    try {
      if (typeof toolResult.content === "string") {
        parsedResult = JSON.parse(toolResult.content);
        isJsonResult = true;
      }
    } catch {
      parsedResult = toolResult.content;
    }
    
    resultContent = isJsonResult
      ? JSON.stringify(parsedResult, null, 2)
      : String(toolResult.content);
  }

  const shouldTruncateResult = resultContent.length > 500 || resultContent.split("\n").length > 4;
  const displayedResult = shouldTruncateResult && !isExpanded
    ? resultContent.length > 500
      ? resultContent.slice(0, 500) + "..."
      : resultContent.split("\n").slice(0, 4).join("\n") + "\n..."
    : resultContent;

  const unifiedContent = (
    <div className="space-y-4">
      {/* Tool Input Section */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
          Input
        </h4>
        {hasArgs ? (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-border">
              <tbody className="divide-y divide-border">
                {Object.entries(args).map(([key, value], argIdx) => (
                  <tr key={argIdx} className="hover:bg-muted/50">
                    <td className="px-3 py-2 text-sm font-medium text-foreground whitespace-nowrap align-top text-right w-1">
                      {key}:
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground align-top text-left">
                      <div className="bg-background rounded border border-border overflow-hidden">
                        <JsonHighlighter>
                          {isComplexValue(value) ? JSON.stringify(value, null, 2) : JSON.stringify(value)}
                        </JsonHighlighter>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <code className="text-sm block p-3 bg-muted rounded text-muted-foreground">{"{}"}</code>
        )}
      </div>

      {/* Tool Result Section */}
      {toolResult && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Result
          </h4>
          <motion.div
            initial={false}
            animate={{ height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isExpanded ? "expanded" : "collapsed"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {isJsonResult ? (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-border">
                      <tbody className="divide-y divide-border">
                        {(Array.isArray(parsedResult)
                          ? isExpanded
                            ? parsedResult
                            : parsedResult.slice(0, 5)
                          : Object.entries(parsedResult)
                        ).map((item, argIdx) => {
                          const [key, value] = Array.isArray(parsedResult)
                            ? [argIdx, item]
                            : [item[0], item[1]];
                          return (
                            <tr key={argIdx} className="hover:bg-muted/50">
                              <td className="px-3 py-2 text-sm font-medium text-foreground whitespace-nowrap align-top text-right w-1">
                                {key}:
                              </td>
                              <td className="px-3 py-2 text-sm text-muted-foreground align-top text-left">
                                <div className="bg-background rounded border border-border overflow-hidden">
                                  <JsonHighlighter>
                                    {isComplexValue(value) ? JSON.stringify(value, null, 2) : JSON.stringify(value)}
                                  </JsonHighlighter>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-background rounded border border-border overflow-hidden">
                    <JsonHighlighter>
                      {displayedResult}
                    </JsonHighlighter>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {((shouldTruncateResult && !isJsonResult) ||
              (isJsonResult &&
                Array.isArray(parsedResult) &&
                parsedResult.length > 5)) && (
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "w-full py-2 flex items-center justify-center border-t border-border mt-2",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  "transition-all ease-in-out duration-200 cursor-pointer rounded-b-lg"
                )}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );

  return (
    <MessageBubble
      type="tool"
      toolName={toolCall.name}
      toolId={toolCall.id}
      content={unifiedContent}
      timestamp={timestamp}
    />
  );
}