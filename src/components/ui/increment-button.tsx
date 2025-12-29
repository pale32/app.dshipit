"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown } from "lucide-react";

interface IncrementButtonProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  label?: string;
  symbol?: string;
  symbolPosition?: "left" | "right";
  showDecimals?: boolean;
  decimalPlaces?: number;
  min?: number;
  max?: number;
  step?: number;
  width?: string;
  height?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showLabel?: boolean;
  showSymbol?: boolean;
}

export function IncrementButton({
  value,
  onChange,
  onBlur,
  label,
  symbol,
  symbolPosition = "left",
  showDecimals = true,
  decimalPlaces = 2,
  min = 0,
  max = 999999,
  step = 1,
  width = "w-[124px]",
  height = "h-10",
  disabled = false,
  placeholder,
  className = "",
  showLabel = false,
  showSymbol = false,
}: IncrementButtonProps) {
  const formatValue = (val: number): string => {
    // If value is 0 and we have a placeholder, show empty string to display placeholder
    if (val === 0 && placeholder) {
      return "";
    }
    if (showDecimals) {
      return val.toFixed(decimalPlaces);
    }
    return val.toString();
  };

  const [inputValue, setInputValue] = useState(formatValue(value));

  useEffect(() => {
    setInputValue(formatValue(value));
  }, [value, showDecimals, decimalPlaces, placeholder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const num = parseFloat(newValue);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    // Reset display value to properly formatted value on blur
    // But if input is empty and we have placeholder, keep it empty to show placeholder
    if (inputValue === "" && placeholder && value === 0) {
      setInputValue("");
    } else {
      setInputValue(formatValue(value));
    }

    // Call the external onBlur callback if provided
    if (onBlur) {
      onBlur();
    }
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    const roundedValue = Math.round(newValue * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    onChange(roundedValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    const roundedValue = Math.round(newValue * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    onChange(roundedValue);
  };

  const renderSymbol = () => {
    if (!symbol) return null;
    return (
      <div className="flex items-center justify-center px-2 text-sm font-medium text-muted-foreground bg-gray-50 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-600">
        {symbol}
      </div>
    );
  };

  const renderSymbolRight = () => {
    if (!symbol) return null;
    return (
      <div className="flex items-center justify-center px-2 text-sm font-medium text-muted-foreground bg-gray-50 dark:bg-gray-900">
        {symbol}
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`flex ${width} ${height} border border-gray-300 dark:border-gray-600 rounded-lg bg-background hover:border-orange-400 focus-within:border-orange-400 focus-within:shadow-[0_0_0_2px_rgba(255,165,0,0.3)] transition-all duration-200 overflow-hidden`} style={{borderRadius: '8px'}}>

        {/* Left Symbol */}
        {showSymbol && symbol && symbolPosition === "left" && renderSymbol()}

        {/* Input Field */}
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="increment-button-input flex-1 h-full text-center border-0 bg-transparent focus:ring-0 focus:outline-none focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Right Symbol */}
        {showSymbol && symbol && symbolPosition === "right" && renderSymbolRight()}

        {/* Increment/Decrement Buttons */}
        <div className="flex flex-col w-7 bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={increment}
            disabled={disabled || value >= max}
            className="flex-1 w-full p-0 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 rounded-none border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-50 dark:disabled:hover:bg-green-950"
          >
            <ChevronUp className="h-3 w-3 text-gray-500" />
          </Button>
          <div className="h-[1px] w-full bg-gray-300 dark:bg-gray-600"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={decrement}
            disabled={disabled || value <= min}
            className="flex-1 w-full p-0 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 rounded-none border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50 dark:disabled:hover:bg-red-950"
          >
            <ChevronDown className="h-3 w-3 text-gray-500" />
          </Button>
        </div>
      </div>
      {showLabel && label && (
        <Label className="text-xs text-muted-foreground mt-1.5 font-light text-[0.8rem]">{label}</Label>
      )}
    </div>
  );
}