import { useThreads } from "@/providers/Thread";
import { useEffect, useState } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, Settings } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TooltipIconButton } from "../tooltip-icon-button";
import { ScrollingThreadList } from "./scrolling-thread-list";
import { SettingsDrawer } from "./settings-drawer";



export default function SiteMenu() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setThreadsLoading(false));
  }, []);

  return (
    <>
      <div className="hidden lg:flex flex-col border-r-[1px] border-slate-300 items-start justify-start gap-6 h-screen w-[300px] shrink-0 shadow-inner-right">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full pt-1.5 px-4 pb-4">
            <div className="flex items-center">
              <TooltipIconButton
                tooltip="Close sidebar"
                variant="ghost"
                onClick={() => setChatHistoryOpen((p) => !p)}
              >
                <X className="size-5" />
              </TooltipIconButton>
              <h1 className="text-xl text-cyan-400 ml-3" style={{ fontFamily: 'Zen Dots, cursive' }}>
                glyphrunner.ai
              </h1>
            </div>
            <TooltipIconButton
              tooltip="Settings"
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="size-5" />
            </TooltipIconButton>
          </div>
        </div>
        <ScrollingThreadList 
          threads={threads} 
          threadsLoading={threadsLoading} 
        />
      </div>
      <div className="lg:hidden">
        <Sheet
          open={!!chatHistoryOpen && !isLargeScreen}
          onOpenChange={(open) => {
            if (isLargeScreen) return;
            setChatHistoryOpen(open);
          }}
        >
          <SheetContent side="left" className="lg:hidden flex [&>button]:hidden">
            <div className="flex flex-col w-full h-full">
              <div className="flex items-center justify-between w-full pt-2 pb-4">
                <div className="flex items-center">
                  <TooltipIconButton
                    tooltip="Close sidebar"
                    variant="ghost"
                    onClick={() => setChatHistoryOpen(false)}
                  >
                    <X className="size-5" />
                  </TooltipIconButton>
                  <h1 className="text-xl text-cyan-400 ml-3" style={{ fontFamily: 'Zen Dots, cursive' }}>
                    glyphrunner.ai
                  </h1>
                </div>
                <TooltipIconButton
                  tooltip="Settings"
                  variant="ghost"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="size-5" />
                </TooltipIconButton>
              </div>
              <div className="flex-1 overflow-hidden">
                <ScrollingThreadList
                  threads={threads}
                  threadsLoading={threadsLoading}
                  onThreadClick={() => setChatHistoryOpen((o) => !o)}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  );
}
