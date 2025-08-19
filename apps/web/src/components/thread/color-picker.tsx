import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "./tooltip-icon-button";

interface ColorOption {
  name: string;
  value: string;
  class: string;
}

const COLOR_WHEEL: ColorOption[] = [
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Yellow", value: "#f59e0b", class: "bg-yellow-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
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
  const currentColor = COLOR_WHEEL.find(color => color.value === value) || COLOR_WHEEL.find(c => c.value === "#3b82f6");

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