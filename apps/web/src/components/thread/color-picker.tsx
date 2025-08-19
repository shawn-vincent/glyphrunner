import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "./tooltip-icon-button";

interface ColorOption {
  name: string;
  value: string;
  class: string;
}

const TAILWIND_COLORS: ColorOption[] = [
  // Slate
  { name: "Slate 50", value: "#f8fafc", class: "bg-slate-50" },
  { name: "Slate 100", value: "#f1f5f9", class: "bg-slate-100" },
  { name: "Slate 200", value: "#e2e8f0", class: "bg-slate-200" },
  { name: "Slate 300", value: "#cbd5e1", class: "bg-slate-300" },
  { name: "Slate 400", value: "#94a3b8", class: "bg-slate-400" },
  { name: "Slate 500", value: "#64748b", class: "bg-slate-500" },
  { name: "Slate 600", value: "#475569", class: "bg-slate-600" },
  { name: "Slate 700", value: "#334155", class: "bg-slate-700" },
  { name: "Slate 800", value: "#1e293b", class: "bg-slate-800" },
  { name: "Slate 900", value: "#0f172a", class: "bg-slate-900" },
  
  // Red
  { name: "Red 50", value: "#fef2f2", class: "bg-red-50" },
  { name: "Red 100", value: "#fee2e2", class: "bg-red-100" },
  { name: "Red 200", value: "#fecaca", class: "bg-red-200" },
  { name: "Red 300", value: "#fca5a5", class: "bg-red-300" },
  { name: "Red 400", value: "#f87171", class: "bg-red-400" },
  { name: "Red 500", value: "#ef4444", class: "bg-red-500" },
  { name: "Red 600", value: "#dc2626", class: "bg-red-600" },
  { name: "Red 700", value: "#b91c1c", class: "bg-red-700" },
  { name: "Red 800", value: "#991b1b", class: "bg-red-800" },
  { name: "Red 900", value: "#7f1d1d", class: "bg-red-900" },
  
  // Orange
  { name: "Orange 50", value: "#fff7ed", class: "bg-orange-50" },
  { name: "Orange 100", value: "#ffedd5", class: "bg-orange-100" },
  { name: "Orange 200", value: "#fed7aa", class: "bg-orange-200" },
  { name: "Orange 300", value: "#fdba74", class: "bg-orange-300" },
  { name: "Orange 400", value: "#fb923c", class: "bg-orange-400" },
  { name: "Orange 500", value: "#f97316", class: "bg-orange-500" },
  { name: "Orange 600", value: "#ea580c", class: "bg-orange-600" },
  { name: "Orange 700", value: "#c2410c", class: "bg-orange-700" },
  { name: "Orange 800", value: "#9a3412", class: "bg-orange-800" },
  { name: "Orange 900", value: "#7c2d12", class: "bg-orange-900" },
  
  // Yellow
  { name: "Yellow 50", value: "#fefce8", class: "bg-yellow-50" },
  { name: "Yellow 100", value: "#fef3c7", class: "bg-yellow-100" },
  { name: "Yellow 200", value: "#fde68a", class: "bg-yellow-200" },
  { name: "Yellow 300", value: "#fcd34d", class: "bg-yellow-300" },
  { name: "Yellow 400", value: "#fbbf24", class: "bg-yellow-400" },
  { name: "Yellow 500", value: "#f59e0b", class: "bg-yellow-500" },
  { name: "Yellow 600", value: "#d97706", class: "bg-yellow-600" },
  { name: "Yellow 700", value: "#b45309", class: "bg-yellow-700" },
  { name: "Yellow 800", value: "#92400e", class: "bg-yellow-800" },
  { name: "Yellow 900", value: "#78350f", class: "bg-yellow-900" },
  
  // Green
  { name: "Green 50", value: "#f0fdf4", class: "bg-green-50" },
  { name: "Green 100", value: "#dcfce7", class: "bg-green-100" },
  { name: "Green 200", value: "#bbf7d0", class: "bg-green-200" },
  { name: "Green 300", value: "#86efac", class: "bg-green-300" },
  { name: "Green 400", value: "#4ade80", class: "bg-green-400" },
  { name: "Green 500", value: "#22c55e", class: "bg-green-500" },
  { name: "Green 600", value: "#16a34a", class: "bg-green-600" },
  { name: "Green 700", value: "#15803d", class: "bg-green-700" },
  { name: "Green 800", value: "#166534", class: "bg-green-800" },
  { name: "Green 900", value: "#14532d", class: "bg-green-900" },
  
  // Blue
  { name: "Blue 50", value: "#eff6ff", class: "bg-blue-50" },
  { name: "Blue 100", value: "#dbeafe", class: "bg-blue-100" },
  { name: "Blue 200", value: "#bfdbfe", class: "bg-blue-200" },
  { name: "Blue 300", value: "#93c5fd", class: "bg-blue-300" },
  { name: "Blue 400", value: "#60a5fa", class: "bg-blue-400" },
  { name: "Blue 500", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Blue 600", value: "#2563eb", class: "bg-blue-600" },
  { name: "Blue 700", value: "#1d4ed8", class: "bg-blue-700" },
  { name: "Blue 800", value: "#1e40af", class: "bg-blue-800" },
  { name: "Blue 900", value: "#1e3a8a", class: "bg-blue-900" },
  
  // Indigo
  { name: "Indigo 50", value: "#eef2ff", class: "bg-indigo-50" },
  { name: "Indigo 100", value: "#e0e7ff", class: "bg-indigo-100" },
  { name: "Indigo 200", value: "#c7d2fe", class: "bg-indigo-200" },
  { name: "Indigo 300", value: "#a5b4fc", class: "bg-indigo-300" },
  { name: "Indigo 400", value: "#818cf8", class: "bg-indigo-400" },
  { name: "Indigo 500", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Indigo 600", value: "#4f46e5", class: "bg-indigo-600" },
  { name: "Indigo 700", value: "#4338ca", class: "bg-indigo-700" },
  { name: "Indigo 800", value: "#3730a3", class: "bg-indigo-800" },
  { name: "Indigo 900", value: "#312e81", class: "bg-indigo-900" },
  
  // Purple
  { name: "Purple 50", value: "#faf5ff", class: "bg-purple-50" },
  { name: "Purple 100", value: "#f3e8ff", class: "bg-purple-100" },
  { name: "Purple 200", value: "#e9d5ff", class: "bg-purple-200" },
  { name: "Purple 300", value: "#d8b4fe", class: "bg-purple-300" },
  { name: "Purple 400", value: "#c084fc", class: "bg-purple-400" },
  { name: "Purple 500", value: "#a855f7", class: "bg-purple-500" },
  { name: "Purple 600", value: "#9333ea", class: "bg-purple-600" },
  { name: "Purple 700", value: "#7c3aed", class: "bg-purple-700" },
  { name: "Purple 800", value: "#6b21a8", class: "bg-purple-800" },
  { name: "Purple 900", value: "#581c87", class: "bg-purple-900" },
  
  // Pink
  { name: "Pink 50", value: "#fdf2f8", class: "bg-pink-50" },
  { name: "Pink 100", value: "#fce7f3", class: "bg-pink-100" },
  { name: "Pink 200", value: "#fbcfe8", class: "bg-pink-200" },
  { name: "Pink 300", value: "#f9a8d4", class: "bg-pink-300" },
  { name: "Pink 400", value: "#f472b6", class: "bg-pink-400" },
  { name: "Pink 500", value: "#ec4899", class: "bg-pink-500" },
  { name: "Pink 600", value: "#db2777", class: "bg-pink-600" },
  { name: "Pink 700", value: "#be185d", class: "bg-pink-700" },
  { name: "Pink 800", value: "#9d174d", class: "bg-pink-800" },
  { name: "Pink 900", value: "#831843", class: "bg-pink-900" },
  
  // Cyan (cyber theme)
  { name: "Cyan 50", value: "#ecfeff", class: "bg-cyan-50" },
  { name: "Cyan 100", value: "#cffafe", class: "bg-cyan-100" },
  { name: "Cyan 200", value: "#a5f3fc", class: "bg-cyan-200" },
  { name: "Cyan 300", value: "#67e8f9", class: "bg-cyan-300" },
  { name: "Cyan 400", value: "#22d3ee", class: "bg-cyan-400" },
  { name: "Cyan 500", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Cyan 600", value: "#0891b2", class: "bg-cyan-600" },
  { name: "Cyan 700", value: "#0e7490", class: "bg-cyan-700" },
  { name: "Cyan 800", value: "#155e75", class: "bg-cyan-800" },
  { name: "Cyan 900", value: "#164e63", class: "bg-cyan-900" },
];

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  description?: string;
}

export function ColorPicker({ value = "#3b82f6", onChange, label = "Color", description }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Find current color option or default
  const currentColor = TAILWIND_COLORS.find(color => color.value === value) || TAILWIND_COLORS.find(c => c.value === "#3b82f6");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleColorSelect = (color: ColorOption) => {
    onChange?.(color.value);
    setIsOpen(false);
  };

  const ColorSwatch = ({ color, isSelected, onClick }: { color: ColorOption; isSelected: boolean; onClick: () => void }) => (
    <button
      className={`relative w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring ${
        isSelected ? 'border-foreground ring-2 ring-ring' : 'border-border hover:border-foreground'
      } ${color.class}`}
      onClick={onClick}
      title={color.name}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="w-4 h-4 text-white drop-shadow-lg" />
        </div>
      )}
    </button>
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {/* Color Display Button */}
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-12"
        onClick={() => setIsOpen(true)}
      >
        <div 
          className="w-6 h-6 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span>{currentColor?.name || 'Custom Color'}</span>
        </div>
      </Button>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Bottom Drawer */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-[201] bg-background border-t shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Choose Color</h3>
                <TooltipIconButton
                  tooltip="Close color picker"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </TooltipIconButton>
              </div>
              
              {/* Color Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto">
                  {/* Group colors by base name */}
                  {['slate', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'cyan'].map(colorBase => (
                    <div key={colorBase} className="mb-6">
                      <h4 className="text-sm font-medium mb-3 capitalize">{colorBase}</h4>
                      <div className="grid grid-cols-10 gap-2">
                        {TAILWIND_COLORS
                          .filter(color => color.name.toLowerCase().includes(colorBase))
                          .map(color => (
                            <ColorSwatch
                              key={color.value}
                              color={color}
                              isSelected={value === color.value}
                              onClick={() => handleColorSelect(color)}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}