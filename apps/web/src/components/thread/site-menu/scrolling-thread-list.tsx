import { Button } from "@/components/ui/button";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import { Skeleton } from "@/components/ui/skeleton";
import { getContentString } from "../utils";

interface ScrollingThreadListProps {
  threads: Thread[];
  threadsLoading: boolean;
  onThreadClick?: (threadId: string) => void;
}

function ThreadListContent({
  threads,
  onThreadClick,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");

  return (
    <>
      {threads.map((t) => {
        // Format updated_at timestamp
        const updatedAt = new Date(t.updated_at);
        const now = new Date();
        const diffMs = now.getTime() - updatedAt.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let timeDisplay: string;
        if (diffMins < 1) timeDisplay = 'now';
        else if (diffMins < 60) timeDisplay = `${diffMins}m`;
        else if (diffHours < 24) timeDisplay = `${diffHours}h`;
        else if (diffDays < 7) timeDisplay = `${diffDays}d`;
        else timeDisplay = updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let itemText = t.thread_id;
        if (
          typeof t.values === "object" &&
          t.values &&
          "messages" in t.values &&
          Array.isArray(t.values.messages) &&
          t.values.messages?.length > 0
        ) {
          const firstMessage = t.values.messages[0];
          itemText = getContentString(firstMessage.content);
        }
        return (
          <div key={t.thread_id} className="w-full px-1">
            <Button
              variant="ghost"
              className="text-left items-start justify-between font-normal w-[280px] h-auto py-2"
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;
                setThreadId(t.thread_id);
              }}
            >
              <p className="truncate text-ellipsis flex-1 mr-2">{itemText}</p>
              <span className="text-xs text-muted-foreground flex-shrink-0">{timeDisplay}</span>
            </Button>
          </div>
        );
      })}
    </>
  );
}

function ThreadListLoading() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton key={`skeleton-${i}`} className="w-[280px] h-10" />
      ))}
    </>
  );
}

export function ScrollingThreadList({ threads, threadsLoading, onThreadClick }: ScrollingThreadListProps) {
  return (
    <div className="h-full flex flex-col w-full gap-2 items-start justify-start overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {threadsLoading ? (
        <ThreadListLoading />
      ) : (
        <ThreadListContent threads={threads} onThreadClick={onThreadClick} />
      )}
    </div>
  );
}