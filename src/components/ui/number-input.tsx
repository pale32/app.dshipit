"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface NumberInputProps {
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
  decimals?: number;
}

export function NumberInput({
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
  decimals = 2
}: NumberInputProps) {
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
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-[38px] w-9 rounded-r-none border-r-0 bg-red-50 border-red-200 text-red-600 hover:shadow-[0_0_0_1px_rgb(254,215,170)] focus-visible:shadow-[0_0_0_1px_rgb(254,215,170),0_0_0_2px_rgb(254,240,138)] focus-visible:outline-none disabled:bg-muted disabled:border-input disabled:text-muted-foreground disabled:hover:shadow-none disabled:focus-visible:shadow-none"
              onClick={decrement}
              disabled={value <= min}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={formatValue(value)}
              onChange={handleInputChange}
              min={min}
              max={max}
              step="any"
              placeholder={placeholder}
              className="rounded-none border-x-0 text-center min-w-[80px] flex-1 h-[38px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-[38px] w-9 rounded-l-none border-l-0 bg-green-50 border-green-200 text-green-600 hover:shadow-[0_0_0_1px_rgb(254,215,170)] focus-visible:shadow-[0_0_0_1px_rgb(254,215,170),0_0_0_2px_rgb(254,240,138)] focus-visible:outline-none disabled:bg-muted disabled:border-input disabled:text-muted-foreground disabled:hover:shadow-none disabled:focus-visible:shadow-none"
              onClick={increment}
              disabled={value >= max}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {units && onUnitChange && (
          <div className="w-20">
            <Select value={unit} onValueChange={onUnitChange}>
              <SelectTrigger className="h-[38px]">
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