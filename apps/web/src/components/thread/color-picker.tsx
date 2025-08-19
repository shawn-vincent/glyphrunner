import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "./tooltip-icon-button";

interface ColorConfig {
  name: string;
  value: string;
  class: string;
  colorFamily: string;
  complementary: string;
}

const COLOR_WHEEL: ColorConfig[] = [
  { name: "Red", value: "#ef4444", class: "bg-red-500", colorFamily: "red", complementary: "green" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500", colorFamily: "orange", complementary: "blue" },
  { name: "Yellow", value: "#f59e0b", class: "bg-yellow-500", colorFamily: "yellow", complementary: "purple" },
  { name: "Green", value: "#22c55e", class: "bg-green-500", colorFamily: "green", complementary: "red" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500", colorFamily: "cyan", complementary: "orange" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500", colorFamily: "blue", complementary: "orange" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500", colorFamily: "indigo", complementary: "yellow" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500", colorFamily: "purple", complementary: "green" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500", colorFamily: "pink", complementary: "green" },
];

// Tailwind color values for dynamic CSS variable updates (comma-separated for rgba)
const TAILWIND_COLORS = {
  red: { 50: "254, 242, 242", 500: "239, 68, 68", 600: "220, 38, 38", 800: "153, 27, 27", 900: "127, 29, 29" },
  orange: { 50: "255, 247, 237", 500: "249, 115, 22", 600: "234, 88, 12", 800: "154, 52, 18", 900: "124, 45, 18" },
  yellow: { 50: "254, 252, 232", 500: "245, 158, 11", 600: "217, 119, 6", 800: "146, 64, 14", 900: "120, 53, 15" },
  green: { 50: "240, 253, 244", 500: "34, 197, 94", 600: "22, 163, 74", 800: "22, 101, 52", 900: "20, 83, 45" },
  cyan: { 50: "236, 254, 255", 500: "6, 182, 212", 600: "8, 145, 178", 800: "21, 94, 117", 900: "22, 78, 99" },
  blue: { 50: "239, 246, 255", 500: "59, 130, 246", 600: "37, 99, 235", 800: "30, 64, 175", 900: "30, 58, 138" },
  indigo: { 50: "238, 242, 255", 500: "99, 102, 241", 600: "79, 70, 229", 800: "55, 48, 163", 900: "49, 46, 129" },
  purple: { 50: "250, 245, 255", 500: "168, 85, 247", 600: "147, 51, 234", 800: "107, 33, 168", 900: "88, 28, 135" },
  pink: { 50: "253, 242, 248", 500: "236, 72, 153", 600: "219, 39, 119", 800: "157, 23, 77", 900: "131, 24, 67" },
} as const;

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  description?: string;
}

function updateCSSVariables(primaryColor: string, complementaryColor: string) {
  const root = document.documentElement;
  const primaryColors = TAILWIND_COLORS[primaryColor as keyof typeof TAILWIND_COLORS];
  const complementaryColors = TAILWIND_COLORS[complementaryColor as keyof typeof TAILWIND_COLORS];
  
  if (!primaryColors || !complementaryColors) return;
  
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    // Dark mode
    root.style.setProperty('--primary', `rgb(${primaryColors[600]})`);
    root.style.setProperty('--accent', `rgb(${primaryColors[600]})`);
    root.style.setProperty('--sidebar-accent', `rgb(${primaryColors[600]})`);
    root.style.setProperty('--user-bubble-border', `rgb(${primaryColors[600]})`);
    
    // Dark mode bubble backgrounds (reduced opacity for more transparency)
    root.style.setProperty('--user-bubble', `rgba(${primaryColors[900]}, 0.7)`);
    root.style.setProperty('--assistant-bubble', `rgba(${complementaryColors[800]}, 0.7)`);
  } else {
    // Light mode
    root.style.setProperty('--primary', `rgb(${primaryColors[500]})`);
    root.style.setProperty('--accent', `rgb(${primaryColors[500]})`);
    root.style.setProperty('--sidebar-accent', `rgb(${primaryColors[500]})`);
    root.style.setProperty('--user-bubble-border', `rgb(${primaryColors[500]})`);
    
    // Light mode bubble backgrounds (reduced opacity for more transparency)
    root.style.setProperty('--user-bubble', `rgba(${primaryColors[50]}, 0.6)`);
    root.style.setProperty('--assistant-bubble', `rgba(${complementaryColors[50]}, 0.6)`);
  }
  
  // Update complementary colors (same for both modes)
  root.style.setProperty('--assistant-bubble-border', `rgb(${complementaryColors[500]})`);
}

export function ColorPicker({ value = "#a855f7", onChange, label = "Color", description }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Find current color option or default to purple (current system default)
  const currentColor = COLOR_WHEEL.find(color => color.value === value) || COLOR_WHEEL.find(c => c.colorFamily === "purple");

  // Initialize color system and handle theme changes
  useEffect(() => {
    setMounted(true);
    
    // Initialize with current color (purple by default)
    const initColor = COLOR_WHEEL.find(color => color.value === value) || COLOR_WHEEL.find(c => c.colorFamily === "purple");
    if (initColor) {
      updateCSSVariables(initColor.colorFamily, initColor.complementary);
    }
    
    // Listen for theme changes to update colors appropriately
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const currentColor = COLOR_WHEEL.find(color => color.value === value) || COLOR_WHEEL.find(c => c.colorFamily === "purple");
          if (currentColor) {
            updateCSSVariables(currentColor.colorFamily, currentColor.complementary);
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [value]);

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

  const handleColorSelect = (color: ColorConfig) => {
    // Update CSS variables according to color palette system
    updateCSSVariables(color.colorFamily, color.complementary);
    
    // Call the onChange callback
    onChange?.(color.value);
    setIsOpen(false);
  };

  const ColorWheel = () => {
    const centerX = 120;
    const centerY = 120;
    const radius = 100;
    const innerRadius = 50;
    const centerRadius = 46.25;
    const selectedColor = currentColor || COLOR_WHEEL[0];
    
    return (
      <div className="flex items-center justify-center">
        <svg width="240" height="240" className="drop-shadow-lg">
          {COLOR_WHEEL.map((color, index) => {
            const angle = (index * 360) / COLOR_WHEEL.length;
            const startAngle = angle - (360 / COLOR_WHEEL.length) / 2;
            const endAngle = angle + (360 / COLOR_WHEEL.length) / 2;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const isSelected = value === color.value;
            
            // For selected wedge, extend to center
            const wedgeInnerRadius = isSelected ? 0 : innerRadius;
            
            const x1 = centerX + wedgeInnerRadius * Math.cos(startAngleRad);
            const y1 = centerY + wedgeInnerRadius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(startAngleRad);
            const y2 = centerY + radius * Math.sin(startAngleRad);
            
            const x3 = centerX + radius * Math.cos(endAngleRad);
            const y3 = centerY + radius * Math.sin(endAngleRad);
            const x4 = centerX + wedgeInnerRadius * Math.cos(endAngleRad);
            const y4 = centerY + wedgeInnerRadius * Math.sin(endAngleRad);
            
            const largeArcFlag = 360 / COLOR_WHEEL.length > 180 ? 1 : 0;
            
            let pathData;
            if (isSelected) {
              // Selected wedge extends to center
              pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x2} ${y2}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
                'Z'
              ].join(' ');
            } else {
              // Normal ring wedge
              pathData = [
                `M ${x1} ${y1}`,
                `L ${x2} ${y2}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
                `L ${x4} ${y4}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
                'Z'
              ].join(' ');
            }
            
            return (
              <g key={color.name}>
                <path
                  d={pathData}
                  fill={color.value}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                  className="cursor-pointer transition-all hover:brightness-110 hover:scale-105"
                  style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                  onClick={() => handleColorSelect(color)}
                />
              </g>
            );
          })}
          
          {/* Center circle with selected color background */}
          <circle
            cx={centerX}
            cy={centerY}
            r={centerRadius}
            fill={selectedColor.value}
            className="drop-shadow-md"
          />
          
          {/* Color name text */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium fill-white drop-shadow-sm pointer-events-none"
            style={{ fontSize: '14px' }}
          >
            {selectedColor.name}
          </text>
        </svg>
      </div>
    );
  };

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
          className="w-6 h-6 rounded-full border border-border flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <span>{currentColor?.name || 'Custom Color'}</span>
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
              
              {/* Color Wheel */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-md mx-auto">
                  <ColorWheel />
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