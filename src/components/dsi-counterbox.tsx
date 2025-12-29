"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DsiCounterboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DsiCounterbox({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = "",
  id,
}: DsiCounterboxProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only valid number formats
    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const incrementValue = () => {
    if (disabled) return;
    const current = parseFloat(value) || 0;
    onChange((current + 1).toFixed(2));
  };

  const decrementValue = () => {
    if (disabled) return;
    const current = parseFloat(value) || 0;
    if (current > 0) {
      onChange(Math.max(0, current - 1).toFixed(2));
    }
  };

  return (
    <div 
      className={`relative flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent shadow-xs transition-all outline-none hover:border-[#ffa929] focus-within:border-[#ffb04d] focus-within:shadow-[0_0_0_2px_rgba(255,143,0,.2)] ${className}`}
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-full h-10 px-3 border-none rounded-md focus:outline-none pr-8 disabled:bg-gray-50 disabled:text-gray-500 bg-transparent"
        placeholder={placeholder}
      />
      <div className="absolute right-0 top-0 h-10 w-8 flex flex-col">
        <button
          type="button"
          onClick={incrementValue}
          disabled={disabled}
          className="flex-1 flex items-center justify-center border-l border-gray-300 focus:outline-none disabled:cursor-not-allowed rounded-tr-md"
        >
          <ChevronUp className="h-4 w-4 text-gray-400 hover:text-green-400 focus:text-green-400 disabled:text-gray-300" />
        </button>
        <button
          type="button"
          onClick={decrementValue}
          disabled={disabled}
          className="flex-1 flex items-center justify-center border-l border-t border-gray-300 focus:outline-none disabled:cursor-not-allowed rounded-br-md"
        >
          <ChevronDown className="h-4 w-4 text-gray-400 hover:text-red-400 focus:text-red-400 disabled:text-gray-300" />
        </button>
      </div>
    </div>
  );
}