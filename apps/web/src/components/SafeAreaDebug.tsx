export function SafeAreaDebug() {
  return (
    <div className="fixed top-0 left-0 bg-red-500 text-white p-2 text-xs z-50 max-w-xs">
      <div>Safe Area Debug:</div>
      <div>Top: <span className="font-mono">env(safe-area-inset-top)</span></div>
      <div>Bottom: <span className="font-mono">env(safe-area-inset-bottom)</span></div>
      <div>Left: <span className="font-mono">env(safe-area-inset-left)</span></div>
      <div>Right: <span className="font-mono">env(safe-area-inset-right)</span></div>
      
      <div className="mt-2">
        <div className="w-4 h-4 bg-blue-500 pt-safe" title="pt-safe test"></div>
        <div className="text-[8px] mt-1">Blue box should have top padding equal to safe area</div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .debug-safe-top::before { content: env(safe-area-inset-top); }
          .debug-safe-bottom::before { content: env(safe-area-inset-bottom); }
          .debug-safe-left::before { content: env(safe-area-inset-left); }
          .debug-safe-right::before { content: env(safe-area-inset-right); }
        `
      }} />
      
      <div className="mt-1">
        Actual values:
        <div>Top: <span className="debug-safe-top font-mono"></span></div>
        <div>Bottom: <span className="debug-safe-bottom font-mono"></span></div>
        <div>Left: <span className="debug-safe-left font-mono"></span></div>
        <div>Right: <span className="debug-safe-right font-mono"></span></div>
      </div>
    </div>
  );
}