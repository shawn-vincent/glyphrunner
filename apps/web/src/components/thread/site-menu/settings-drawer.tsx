import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Monitor, Sun, Moon, ChevronDown, Check, Image } from "lucide-react";
import { useTheme } from "next-themes";
import { TooltipIconButton } from "../tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "../color-picker";
import { useQueryState, parseAsBoolean } from "nuqs";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hideToolCalls, setHideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false),
  );
  const [accentColor, setAccentColor] = useState("#a855f7");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [imagePreviewState, setImagePreviewState] = useState<"none" | "loading" | "success" | "error">("none");

  const themeOptions = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  // Avoid hydration mismatch and load persisted settings
  useEffect(() => {
    setMounted(true);
    const savedBackgroundUrl = localStorage.getItem("backgroundImageUrl");
    if (savedBackgroundUrl) {
      setBackgroundImageUrl(savedBackgroundUrl);
      validateImageUrl(savedBackgroundUrl);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Image validation function
  const validateImageUrl = (url: string) => {
    if (!url.trim()) {
      setImagePreviewState("none");
      return;
    }
    
    setImagePreviewState("loading");
    const img = new window.Image();
    img.onload = () => setImagePreviewState("success");
    img.onerror = () => setImagePreviewState("error");
    img.src = url;
  };

  // Handle background image URL changes
  const handleBackgroundImageChange = (url: string) => {
    setBackgroundImageUrl(url);
    localStorage.setItem("backgroundImageUrl", url);
    validateImageUrl(url);
    
    // Apply to document root
    document.documentElement.style.setProperty(
      "--background-image-url", 
      url.trim() ? `url('${url}')` : "none"
    );
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-0 z-[101] bg-background shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-safe px-safe border-b">
            <h2 className="text-xl font-semibold">Settings</h2>
            <TooltipIconButton
              tooltip="Close settings"
              variant="ghost"
              onClick={onClose}
            >
              <X className="size-5" />
            </TooltipIconButton>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 px-safe pb-safe">
            <div className="space-y-6 max-w-2xl">
              {/* Theme Setting */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CurrentIcon className="size-4" />
                      <span>{currentTheme.label}</span>
                    </div>
                    <ChevronDown className="size-4" />
                  </Button>
                  
                  {dropdownOpen && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {themeOptions.map((option) => {
                        const IconComponent = option.icon;
                        const isSelected = theme === option.value;
                        return (
                          <button
                            key={option.value}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted text-left"
                            onClick={() => {
                              setTheme(option.value);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent className="size-4" />
                              <span>{option.label}</span>
                            </div>
                            {isSelected && <Check className="size-4" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose how the interface appears. System follows your device settings.
                </p>
              </div>
              
              {/* Color Setting */}
              <div className="space-y-2">
                <ColorPicker
                  label="Accent Color"
                  value={accentColor}
                  onChange={setAccentColor}
                  description="Choose your preferred accent color for the interface."
                />
              </div>

              {/* Background Image Setting */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Image</label>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="Enter image URL..."
                    value={backgroundImageUrl}
                    onChange={(e) => handleBackgroundImageChange(e.target.value)}
                    className="pr-12"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {imagePreviewState === "loading" && (
                      <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                    {imagePreviewState === "success" && backgroundImageUrl && (
                      <div 
                        className="w-6 h-6 rounded border border-border bg-cover bg-center cursor-pointer transition-all duration-200 hover:scale-[2.5] hover:z-50 relative hover:shadow-lg"
                        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(backgroundImageUrl, '_blank');
                        }}
                        title="Click to open image in new tab"
                      />
                    )}
                    {imagePreviewState === "error" && (
                      <div className="w-6 h-6 rounded border border-destructive bg-destructive/10 flex items-center justify-center">
                        <Image className="w-3 h-3 text-destructive" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a URL to set a background image behind the chat interface.
                </p>
              </div>
              
              {/* Hide Tool Calls Setting */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hide Tool Calls</label>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span className="text-sm">Hide tool call details from conversation</span>
                  <Switch
                    id="hide-tool-calls"
                    checked={hideToolCalls ?? false}
                    onCheckedChange={setHideToolCalls}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, tool call details are hidden from the conversation view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}