import { v4 as uuidv4 } from "uuid";
import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { AssistantMessage, AssistantMessageLoading } from "./messages/ai";
import { HumanMessage } from "./messages/human";
import {
  DO_NOT_RENDER_ID_PREFIX,
  ensureToolCallsHaveResponses,
} from "@/lib/ensure-tool-responses";
import { LangGraphLogoSVG } from "../icons/langgraph";
import { TooltipIconButton } from "./tooltip-icon-button";
import {
  ArrowDownToLine,
  ArrowUp,
  LoaderCircle,
  Menu,
  SquarePen,
  Plus,
} from "lucide-react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import SiteMenu from "./site-menu";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFileUpload } from "@/hooks/useFileUpload";
import { MultimodalPreview } from "./multimodal-preview";

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={props.className}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200",
        props.className
      )}
      onClick={() => scrollToBottom()}
    >
      <ArrowDownToLine className="w-5 h-5" />
    </Button>
  );
}


export function Thread() {
  const [threadId, setThreadId] = useQueryState("threadId");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );
  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  
  const {
    contentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    resetBlocks,
    dragOver,
    handlePaste,
  } = useFileUpload();

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;

  const lastError = useRef<string | undefined>(undefined);

  // Load background image from localStorage on mount
  useEffect(() => {
    const savedBackgroundUrl = localStorage.getItem("backgroundImageUrl");
    if (savedBackgroundUrl) {
      document.documentElement.style.setProperty(
        "--background-image-url", 
        `url('${savedBackgroundUrl}')`
      );
    }
  }, []);

  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      return;
    }
    try {
      const message = (stream.error as any).message;
      if (!message || lastError.current === message) {
        // Message has already been logged. do not modify ref, return early.
        return;
      }

      // Message is defined, and it has not been logged yet. Save it, and send the error
      lastError.current = message;
      toast.error("An error occurred. Please try again.", {
        description: (
          <p>
            <strong>Error:</strong> <code>{message}</code>
          </p>
        ),
        richColors: true,
        closeButton: true,
      });
    } catch {
      // no-op
    }
  }, [stream.error]);

  // TODO: this should be part of the useStream hook
  const prevMessageLength = useRef(0);
  useEffect(() => {
    if (
      messages.length !== prevMessageLength.current &&
      messages?.length &&
      messages[messages.length - 1].type === "ai"
    ) {
      setFirstTokenReceived(true);
    }

    prevMessageLength.current = messages.length;
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && contentBlocks.length === 0) || isLoading) return;
    setFirstTokenReceived(false);

    // Create message content - can be string or array with content blocks
    const messageContent = contentBlocks.length > 0 
      ? [{ type: "text", text: input }, ...contentBlocks] as any
      : input;

    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: messageContent,
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    stream.submit(
      { messages: [...toolMessages, newHumanMessage] },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );

    setInput("");
    resetBlocks();
  };

  const handleRegenerate = (
    parentCheckpoint: Checkpoint | null | undefined,
  ) => {
    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };

  const chatStarted = !!threadId || !!messages.length;
  const hasNoAIOrToolMessages = !messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );

  return (
    <div 
      ref={dropRef}
      className={cn(
        "flex w-full h-screen overflow-hidden transition-colors",
        dragOver && "bg-accent/20"
      )}
    >
      <div className="relative lg:flex hidden">
        <motion.div
          className="absolute h-full border-r overflow-hidden z-20"
          style={{ width: 300 }}
          animate={
            isLargeScreen
              ? { x: chatHistoryOpen ? 0 : -300 }
              : { x: chatHistoryOpen ? 0 : -300 }
          }
          initial={{ x: -300 }}
          transition={
            isLargeScreen
              ? { type: "spring", stiffness: 300, damping: 30 }
              : { duration: 0 }
          }
        >
          <div className="relative h-full" style={{ width: 300 }}>
            <SiteMenu />
          </div>
        </motion.div>
      </div>
      <motion.div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden relative",
          !chatStarted && "grid-rows-[1fr]",
        )}
        layout={isLargeScreen}
        animate={{
          marginLeft: chatHistoryOpen ? (isLargeScreen ? 300 : 0) : 0,
          width: chatHistoryOpen
            ? isLargeScreen
              ? "calc(100% - 300px)"
              : "100%"
            : "100%",
        }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
      >
        {!chatStarted && (
          <div className="absolute top-0 left-0 w-full flex items-center justify-between gap-3 p-2 pl-4 z-10">
            <div>
              {(!chatHistoryOpen || !isLargeScreen) && (
                <TooltipIconButton
                  tooltip="Open sidebar"
                  variant="ghost"
                  onClick={() => setChatHistoryOpen((p) => !p)}
                >
                  <Menu className="size-5" />
                </TooltipIconButton>
              )}
            </div>
          </div>
        )}
        {chatStarted && (
          <div className="flex items-center justify-between gap-3 p-2 z-10 relative">
            <div className="flex items-center justify-start gap-2 relative">
              <div className="absolute left-0 z-10">
                {(!chatHistoryOpen || !isLargeScreen) && (
                  <TooltipIconButton
                    tooltip="Open sidebar"
                    variant="ghost"
                    onClick={() => setChatHistoryOpen((p) => !p)}
                  >
                    <Menu className="size-5" />
                  </TooltipIconButton>
                )}
              </div>
              <div></div>
            </div>

            <div className="flex items-center gap-4">
              <TooltipIconButton
                size="lg"
                className="p-4"
                tooltip="New thread"
                variant="ghost"
                onClick={() => setThreadId(null)}
              >
                <SquarePen className="size-5" />
              </TooltipIconButton>
            </div>

            <div className="absolute inset-x-0 top-full h-5 bg-gradient-to-b from-background to-background/0" />
          </div>
        )}

        <StickToBottom 
          className="relative flex-1 overflow-hidden"
          style={{
            backgroundImage: "var(--background-image-url, none)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed"
          }}
        >
          <StickyToBottomContent
            className={cn(
              "absolute px-4 inset-0 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
              !chatStarted && "flex flex-col items-stretch mt-[25vh]"
            )}
            contentClassName="pt-8 pb-4 max-w-3xl mx-auto flex flex-col gap-2 w-full"
            content={
              <>
                {!chatStarted && (
                  <div className="flex gap-3 items-center justify-center mb-8">
                    <LangGraphLogoSVG className="flex-shrink-0 h-8" />
                    <h1 className="text-2xl font-semibold tracking-tight">
                      glyphrunner.ai
                    </h1>
                  </div>
                )}
                {messages
                  .filter((m) => !m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX))
                  .map((message, index) =>
                    message.type === "human" ? (
                      <HumanMessage
                        key={message.id || `${message.type}-${index}`}
                        message={message}
                        isLoading={isLoading}
                      />
                    ) : (
                      <AssistantMessage
                        key={message.id || `${message.type}-${index}`}
                        message={message}
                        isLoading={isLoading}
                        handleRegenerate={handleRegenerate}
                      />
                    ),
                  )}
                {/* Special rendering case where there are no AI/tool messages, but there is an interrupt.
                    We need to render it outside of the messages list, since there are no messages to render */}
                {hasNoAIOrToolMessages && !!stream.interrupt && (
                  <AssistantMessage
                    key="interrupt-msg"
                    message={undefined}
                    isLoading={isLoading}
                    handleRegenerate={handleRegenerate}
                  />
                )}
                {isLoading && !firstTokenReceived && (
                  <AssistantMessageLoading />
                )}
              </>
            }
          />

          <ScrollToBottom className="absolute bottom-4 right-4 animate-in fade-in-0 zoom-in-95" />
        </StickToBottom>

        {/* Bottom Bar */}
        <div className="relative border-t bg-background z-10">
          <div className="absolute inset-x-0 bottom-full h-5 bg-gradient-to-t from-background to-background/0" />
          
          <div className="p-4">
            <div className="relative mx-auto w-full max-w-3xl">
              {/* Background layer with 100% opacity */}
              <div className="absolute inset-0 bg-background rounded-3xl border-2 border-user-bubble-border shadow-xs z-40" />
              
              {/* Compose dialog with 50% opacity on top */}
              <div className="relative border-user-bubble-border bg-user-bubble rounded-3xl border-2 shadow-xs z-50">
                {/* File previews */}
                {contentBlocks.length > 0 && (
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex flex-wrap gap-2">
                      {contentBlocks.map((block, index) => (
                        <MultimodalPreview
                          key={index}
                          block={block}
                          removable
                          onRemove={() => removeBlock(index)}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <form
                  onSubmit={handleSubmit}
                  className="flex items-end gap-2 p-3 max-w-3xl mx-auto"
                >
                  {/* Hidden file input */}
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    onChange={handleFileUpload}
                  />
                  
                  {/* File upload button */}
                  <TooltipIconButton
                    type="button"
                    tooltip="Upload files (images, PDFs)"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Plus className="w-4 h-4" />
                  </TooltipIconButton>

                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.metaKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        const el = e.target as HTMLElement | undefined;
                        const form = el?.closest("form");
                        form?.requestSubmit();
                      }
                    }}
                    onPaste={handlePaste}
                    placeholder="Type your message"
                    className="flex-1 border-none bg-transparent field-sizing-content shadow-none ring-0 outline-none focus:outline-none focus:ring-0 resize-none min-h-[20px] max-h-32"
                  />

                  {stream.isLoading ? (
                    <TooltipIconButton
                      key="stop"
                      tooltip="Cancel"
                      variant="ghost"
                      size="sm"
                      onClick={() => stream.stop()}
                    >
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    </TooltipIconButton>
                  ) : (
                    <TooltipIconButton
                      type="submit"
                      tooltip="Send"
                      variant="primary"
                      size="sm"
                      disabled={isLoading || (!input.trim() && contentBlocks.length === 0)}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </TooltipIconButton>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
