"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResizeImagePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  originalWidth: number;
  originalHeight: number;
  onResize?: (newWidth: number, newHeight: number) => void;
}

export function ResizeImagePopover({
  open,
  onOpenChange,
  trigger,
  originalWidth,
  originalHeight,
  onResize
}: ResizeImagePopoverProps) {
  const [newWidth, setNewWidth] = React.useState(originalWidth.toString());
  const [newHeight, setNewHeight] = React.useState(originalHeight.toString());
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    setNewWidth(originalWidth.toString());
    setNewHeight(originalHeight.toString());
  }, [originalWidth, originalHeight]);

  // Handle clicks outside to close popover
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onOpenChange]);

  const isSaveDisabled = !newWidth || !newHeight || 
    (parseInt(newWidth) === originalWidth && parseInt(newHeight) === originalHeight);

  if (!open) {
    return <div onClick={() => onOpenChange(true)}>{trigger}</div>;
  }

  return (
    <div className="relative inline-block">
      <div onClick={() => onOpenChange(false)}>{trigger}</div>
      
      {/* Popover Content */}
      <div 
        ref={containerRef}
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]"
        style={{
          top: '-8px',
          left: '50%',
          transform: 'translate(-50%, -100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-200"></div>
          <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div className="font-medium text-sm text-gray-900">Resize Image</div>
          
          {/* Original Size Row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Original</span>
            <div className="flex items-center gap-2">
              <Input 
                value={originalWidth.toString()}
                disabled
                className="w-16 h-8 text-center text-xs bg-gray-50 disabled:opacity-50 border-gray-200"
                readOnly
              />
              <span className="text-gray-400 text-xs">x</span>
              <Input 
                value={originalHeight.toString()}
                disabled
                className="w-16 h-8 text-center text-xs bg-gray-50 disabled:opacity-50 border-gray-200"
                readOnly
              />
            </div>
          </div>

          {/* New Size Row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-900">New Size</span>
            <div className="flex items-center gap-2">
              <Input 
                type="number"
                value={newWidth}
                onChange={(e) => setNewWidth(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-16 h-8 text-center text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="1"
                max="5000"
              />
              <span className="text-gray-400 text-xs">x</span>
              <Input 
                type="number"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-16 h-8 text-center text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="1"
                max="5000"
              />
            </div>
          </div>

          {/* Empty space for consistency */}
          <div className="h-2"></div>

          {/* Save button row */}
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                const width = parseInt(newWidth);
                const height = parseInt(newHeight);
                if (!isNaN(width) && !isNaN(height)) {
                  onResize?.(width, height);
                  onOpenChange(false);
                }
              }}
              disabled={isSaveDisabled}
              className="h-8 px-4 text-xs font-medium uppercase bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
              size="sm"
            >
              SAVE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}