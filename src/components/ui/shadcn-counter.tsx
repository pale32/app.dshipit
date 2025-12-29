"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShadcnCounterProps {
  value: number;
  onValueChange: (value: number) => void;
  unit?: string;
  onUnitChange?: (unit: string) => void;
  units?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
  decimals?: number;
}

export function ShadcnCounter({
  value,
  onValueChange,
  unit,
  onUnitChange,
  units,
  min = 0,
  max = 999999,
  step = 1,
  placeholder = "0.00",
  label,
  className = "",
  labelClassName = "",
  labelStyle,
  decimals = 2
}: ShadcnCounterProps) {
  const formatValue = (val: number): string => {
    return val.toFixed(decimals);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onValueChange(0);
      return;
    }
    const numValue = parseFloat(val);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      onValueChange(clampedValue);
    }
  };

  const increment = () => {
    const newValue = Math.min(value + step, max);
    onValueChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onValueChange(newValue);
  };

  return (
    <div className={className}>
      {label && (
        <label className={cn("text-sm text-foreground", labelClassName)} style={labelStyle}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <motion.div 
          layout
          transition={{ type: 'spring', bounce: 0, stiffness: 300, damping: 30 }}
          className="flex items-center gap-0 border border-input rounded-md flex-1"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              size="icon"
              onClick={decrement}
              disabled={value <= min}
              className={cn(
                "h-10 w-9 rounded-r-none bg-red-50 border-0 text-black hover:bg-red-50",
                "hover:shadow-[0_0_0_1px_rgb(254,215,170)] focus-visible:shadow-[0_0_0_1px_rgb(254,215,170),0_0_0_2px_rgb(254,240,138)]",
                "focus-visible:outline-none disabled:bg-muted disabled:text-muted-foreground",
                "disabled:hover:shadow-none disabled:focus-visible:shadow-none"
              )}
            >
              <Minus className="h-4 w-4 text-black" />
            </Button>
          </motion.div>
          
          <Input
            type="number"
            value={formatValue(value)}
            onChange={handleInputChange}
            min={min}
            max={max}
            step="any"
            placeholder={placeholder}
            className="rounded-none border-0 text-center min-w-[80px] flex-1 h-10 bg-transparent text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-0 focus-visible:outline-none shadow-none"
          />
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              size="icon"
              onClick={increment}
              disabled={value >= max}
              className={cn(
                "h-10 w-9 rounded-l-none bg-green-50 border-0 text-black hover:bg-green-50",
                "hover:shadow-[0_0_0_1px_rgb(254,215,170)] focus-visible:shadow-[0_0_0_1px_rgb(254,215,170),0_0_0_2px_rgb(254,240,138)]",
                "focus-visible:outline-none disabled:bg-muted disabled:text-muted-foreground",
                "disabled:hover:shadow-none disabled:focus-visible:shadow-none"
              )}
            >
              <Plus className="h-4 w-4 text-black" />
            </Button>
          </motion.div>
        </motion.div>
        
        {units && onUnitChange && (
          <div className="w-20">
            <Select value={unit} onValueChange={onUnitChange}>
              <SelectTrigger className="!h-[42px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((unitOption) => (
                  <SelectItem key={unitOption.value} value={unitOption.value}>
                    {unitOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}