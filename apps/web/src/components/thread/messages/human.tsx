import { useStreamContext } from "@/providers/Stream";
import { Message } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { getContentString } from "../utils";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { BranchSwitcher, CommandBar } from "./shared";
import { MessageBubble } from "./message-bubble";

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
        {/* User pill and timestamp for editing mode */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          <div className="inline-flex items-center px-2 py-1 rounded-full border-2 border-user-bubble-border bg-user-bubble">
            <span className="text-xs font-medium text-foreground">user</span>
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
    <div className="flex flex-col gap-2">
      <MessageBubble
        type="user"
        content={contentString}
        timestamp={timestamp}
      />
      
      <div
        className={cn(
          "flex gap-2 items-center ml-auto mr-8 transition-opacity",
          "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
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
