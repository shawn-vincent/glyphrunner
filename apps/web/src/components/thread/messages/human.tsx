import { useStreamContext } from "@/providers/Stream";
import { Message } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { getContentString } from "../utils";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { BranchSwitcher, CommandBar } from "./shared";
import { MessageBubble } from "./message-bubble";
import { MultimodalPreview } from "../multimodal-preview";
import type { Base64ContentBlock } from "@langchain/core/messages";

function EditableContent({
  value,
  setValue,
  onSubmit,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className="focus-visible:ring-0"
    />
  );
}

function renderMultimodalContent(content: Message["content"]) {
  if (typeof content === "string") {
    return content;
  }

  const textParts = content.filter((c: any): c is { type: "text"; text: string } => c.type === "text");
  const contentBlocks = content.filter((c: any): c is Base64ContentBlock => 
    c.type === "image" || c.source_type === "base64"
  );

  return (
    <div className="flex flex-col gap-2">
      {textParts.length > 0 && (
        <div>{textParts.map(part => part.text).join(" ")}</div>
      )}
      {contentBlocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contentBlocks.map((block: any, index: number) => (
            <MultimodalPreview
              key={index}
              block={block as Base64ContentBlock}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HumanMessage({
  message,
  isLoading,
}: {
  message: Message;
  isLoading: boolean;
}) {
  const thread = useStreamContext();
  const meta = thread.getMessagesMetadata(message);
  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const contentString = getContentString(message.content);

  // Get current time for timestamp (since message doesn't have created_at)
  const timestamp = new Date().toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase().replace(' ', '');

  const handleSubmitEdit = () => {
    setIsEditing(false);

    const newMessage: Message = { type: "human", content: value };
    thread.submit(
      { messages: [newMessage] },
      {
        checkpoint: parentCheckpoint,
        streamMode: ["values"],
        optimisticValues: (prev) => {
          const values = meta?.firstSeenState?.values;
          if (!values) return prev;

          return {
            ...values,
            messages: [...(values.messages ?? []), newMessage],
          };
        },
      },
    );
  };

  if (isEditing) {
    return (
      <div className={cn("flex flex-col items-end ml-auto gap-1 group ml-8 w-full max-w-xl")}>
        {/* User pill with timestamp for editing mode */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-black border border-border">
            <span className="text-xs font-medium" style={{ color: 'var(--user-bubble-border)' }}>user</span>
            <span className="text-xs text-muted-foreground/70">{timestamp}</span>
          </div>
        </div>
        
        <EditableContent
          value={value}
          setValue={setValue}
          onSubmit={handleSubmitEdit}
        />
        
        <div
          className={cn(
            "flex gap-2 items-center ml-auto transition-opacity opacity-100",
          )}
        >
          <BranchSwitcher
            branch={meta?.branch}
            branchOptions={meta?.branchOptions}
            onSelect={(branch) => thread.setBranch(branch)}
            isLoading={isLoading}
          />
          <CommandBar
            isLoading={isLoading}
            content={contentString}
            isEditing={isEditing}
            setIsEditing={(c) => {
              if (c) {
                setValue(contentString);
              }
              setIsEditing(c);
            }}
            handleSubmitEdit={handleSubmitEdit}
            isHumanMessage={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col group">
      <MessageBubble
        type="user"
        content={renderMultimodalContent(message.content)}
        timestamp={timestamp}
      />
      
      <div
        className={cn(
          "flex gap-2 items-center ml-auto transition-opacity",
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
          isLoading={isLoading}
          content={contentString}
          isEditing={isEditing}
          setIsEditing={(c) => {
            if (c) {
              setValue(contentString);
            }
            setIsEditing(c);
          }}
          handleSubmitEdit={handleSubmitEdit}
          isHumanMessage={true}
        />
      </div>
    </div>
  );
}
