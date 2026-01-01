"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Full list of countries for Ship To selector
const SHIP_TO_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "Mexico",
  "India",
  "China",
  "South Korea",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Belgium",
  "Switzerland",
  "Austria",
  "Poland",
  "Czech Republic",
  "Hungary",
  "Portugal",
  "Greece",
  "Turkey",
  "Russia",
  "South Africa",
  "Egypt",
  "Israel",
  "UAE",
  "Saudi Arabia",
  "Singapore",
  "Thailand",
  "Vietnam",
  "Philippines",
  "Malaysia",
  "Indonesia",
  "New Zealand",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
];

// Ship From countries (warehouse locations)
const SHIP_FROM_COUNTRIES = [
  { value: "ALL", label: "ALL" },
  { value: "China", label: "China" },
  { value: "France", label: "France" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
];

interface ShipFromSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface ShipToSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Ship From country selector
 * Allows selecting warehouse location for product sourcing
 */
export function ShipFromSelector({ value, onChange, className }: ShipFromSelectorProps) {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <span className="text-base font-medium text-foreground mr-2">Ship from:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] h-8 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHIP_FROM_COUNTRIES.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Ship To country selector
 * Allows selecting destination country for shipping
 */
export function ShipToSelector({ value, onChange, className }: ShipToSelectorProps) {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <span className="text-base font-medium text-foreground mr-2">Ship to:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] h-8 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHIP_TO_COUNTRIES.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Combined shipping selectors with divider
 * Used in the filter bar for both ship from and ship to
 */
interface ShippingSelectorsProps {
  shipFromValue: string;
  onShipFromChange: (value: string) => void;
  shipToValue: string;
  onShipToChange: (value: string) => void;
  showShipFrom?: boolean;
}

export function ShippingSelectors({
  shipFromValue,
  onShipFromChange,
  shipToValue,
  onShipToChange,
  showShipFrom = true,
}: ShippingSelectorsProps) {
  return (
    <div className="flex items-center">
      {showShipFrom && (
        <>
          <ShipFromSelector value={shipFromValue} onChange={onShipFromChange} />
          <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-4"></div>
        </>
      )}
      <ShipToSelector value={shipToValue} onChange={onShipToChange} />
    </div>
  );
}
