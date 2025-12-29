"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnitCounterProps {
  value: number;
  onValueChange: (value: number) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
  units: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function UnitCounter({
  value,
  onValueChange,
  unit,
  onUnitChange,
  units,
  min = 0,
  max = 999999,
  step = 1,
  className = ""
}: UnitCounterProps) {
  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - step);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={`flex items-center border border-input bg-background ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 rounded-l hover:bg-accent rounded-r-none border-r-0"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="h-10 w-20 text-center border-0 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={min}
        max={max}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 hover:bg-accent rounded-none border-r-0 border-l-0"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value)}
        className="h-10 w-16 px-2 border-l border-input rounded-r text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {units.map((unitOption) => (
          <option key={unitOption.value} value={unitOption.value}>
            {unitOption.label}
          </option>
        ))}
      </select>
    </div>
  );
}