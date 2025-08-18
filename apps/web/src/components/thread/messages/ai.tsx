import { parsePartialJson } from "@langchain/core/output_parsers";
import { useStreamContext } from "@/providers/Stream";
import { AIMessage, Checkpoint, Message } from "@langchain/langgraph-sdk";
import { getContentString } from "../utils";
import { BranchSwitcher, CommandBar } from "./shared";
import { MarkdownText } from "../markdown-text";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";
import { cn } from "@/lib/utils";
import { ToolCallWithResult } from "./tool-calls";
import { MessageContentComplex } from "@langchain/core/messages";
import { Fragment } from "react/jsx-runtime";
import { isAgentInboxInterruptSchema } from "@/lib/agent-inbox-interrupt";
import { ThreadView } from "../agent-inbox";
import { useQueryState, parseAsBoolean } from "nuqs";
import { GenericInterruptView } from "./generic-interrupt";
import { MessageBubble } from "./message-bubble";

function CustomComponent({
  message,
  thread,
}: {
  message: Message;
  thread: ReturnType<typeof useStreamContext>;
}) {
  const { values } = useStreamContext();
  const customComponents = values.ui?.filter(
    (ui) => ui.metadata?.message_id === message.id,
  );

  if (!customComponents?.length) return null;
  return (
    <Fragment key={message.id}>
      {customComponents.map((customComponent) => (
        <LoadExternalComponent
          key={customComponent.id}
          stream={thread}
          message={customComponent}
          meta={{ ui: customComponent }}
        />
      ))}
    </Fragment>
  );
}

function parseAnthropicStreamedToolCalls(
  content: MessageContentComplex[],
): AIMessage["tool_calls"] {
  const toolCallContents = content.filter((c) => c.type === "tool_use" && c.id);

  return toolCallContents.map((tc) => {
    const toolCall = tc as Record<string, any>;
    let json: Record<string, any> = {};
    if (toolCall?.input) {
      try {
        json = parsePartialJson(toolCall.input) ?? {};
      } catch {
        // Pass
      }
    }
    return {
      name: toolCall.name ?? "",
      id: toolCall.id ?? "",
      args: json,
      type: "tool_call",
    };
  });
}

export function AssistantMessage({
  message,
  isLoading,
  handleRegenerate,
}: {
  message: Message | undefined;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}) {
  const content = message?.content ?? [];
  const contentString = getContentString(content);
  const [hideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false),
  );

  const thread = useStreamContext();
  const isLastMessage =
    thread.messages[thread.messages.length - 1].id === message?.id;
  const hasNoAIOrToolMessages = !thread.messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );
  const meta = message ? thread.getMessagesMetadata(message) : undefined;
  const threadInterrupt = thread.interrupt;

  // Helper function to find tool results for tool calls
  const findToolResults = (toolCalls: AIMessage["tool_calls"]) => {
    if (!toolCalls || !thread.messages) return [];
    
    return toolCalls.map(toolCall => {
      const toolResult = thread.messages.find(
        (msg) => 
          msg.type === "tool" && 
          "tool_call_id" in msg && 
          msg.tool_call_id === toolCall.id
      ) as ToolMessage | undefined;
      
      return { toolCall, toolResult };
    });
  };

  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;
  const anthropicStreamedToolCalls = Array.isArray(content)
    ? parseAnthropicStreamedToolCalls(content)
    : undefined;

  const hasToolCalls =
    message &&
    "tool_calls" in message &&
    message.tool_calls &&
    message.tool_calls.length > 0;
  const toolCallsHaveContents =
    hasToolCalls &&
    message.tool_calls?.some(
      (tc) => tc.args && Object.keys(tc.args).length > 0,
    );
  const hasAnthropicToolCalls = !!anthropicStreamedToolCalls?.length;
  const isToolResult = message?.type === "tool";

  if (isToolResult && hideToolCalls) {
    return null;
  }

  // Hide tool result messages that are already included in unified tool call bubbles
  if (isToolResult) {
    // Find the AI message that contains the tool call for this result
    const correspondingAIMessage = thread.messages.find(
      (msg) => 
        msg.type === "ai" && 
        "tool_calls" in msg && 
        msg.tool_calls?.some(tc => tc.id === (message as ToolMessage).tool_call_id)
    );
    
    // If we found the corresponding AI message, don't render this tool result separately
    if (correspondingAIMessage) {
      return null;
    }
  }

  // Get current time for timestamp
  const timestamp = new Date().toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase().replace(' ', '');

  if (isToolResult) {
    return (
      <div className="flex items-start mr-auto gap-2 group">
        <ToolResult message={message} />
      </div>
    );
  }

  return (
    <div className="flex flex-col group">
      {contentString.length > 0 && (
        <MessageBubble
          type="assistant"
          content={<MarkdownText>{contentString}</MarkdownText>}
          timestamp={timestamp}
        />
      )}

      {!hideToolCalls && (
        <div className="mr-8 space-y-4">
          {hasToolCalls && message.tool_calls && (
            <>
              {findToolResults(message.tool_calls).map(({ toolCall, toolResult }, idx) => (
                <ToolCallWithResult
                  key={`${toolCall.id}-${idx}`}
                  toolCall={toolCall}
                  toolResult={toolResult}
                />
              ))}
            </>
          )}
          {hasAnthropicToolCalls && anthropicStreamedToolCalls && (
            <>
              {findToolResults(anthropicStreamedToolCalls).map(({ toolCall, toolResult }, idx) => (
                <ToolCallWithResult
                  key={`${toolCall.id}-${idx}`}
                  toolCall={toolCall}
                  toolResult={toolResult}
                />
              ))}
            </>
          )}
        </div>
      )}

      {message && <CustomComponent message={message} thread={thread} />}
      
      {isAgentInboxInterruptSchema(threadInterrupt?.value) &&
        (isLastMessage || hasNoAIOrToolMessages) && (
          <ThreadView interrupt={threadInterrupt.value} />
        )}
        
      {threadInterrupt?.value &&
      !isAgentInboxInterruptSchema(threadInterrupt.value) &&
      isLastMessage ? (
        <GenericInterruptView interrupt={threadInterrupt.value} />
      ) : null}
      
      <div
        className={cn(
          "flex gap-2 items-center mr-8 transition-opacity",
          meta?.branchOptions && meta.branchOptions.length > 1 
            ? "opacity-100" 
            : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
        )}
      >
        <BranchSwitcher
          branch={meta?.branch}
          branchOptions={meta?.branchOptions}
          onSelect={(branch) => thread.setBranch(branch)}
          isLoading={isLoading}
        />
        <CommandBar
          content={contentString}
          isLoading={isLoading}
          isAiMessage={true}
          handleRegenerate={() => handleRegenerate(parentCheckpoint)}
        />
      </div>
    </div>
  );
}

export function AssistantMessageLoading() {
  return (
    <div className="flex items-start mr-auto gap-2">
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2 h-8">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_0.5s_infinite]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_1s_infinite]"></div>
      </div>
    </div>
  );
}
