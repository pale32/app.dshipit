"use client";

import { Button } from "@/components/ui/button";

type WarehouseRegion = "ALL" | "US" | "EU" | "CN";

interface WarehouseFilterProps {
  value: WarehouseRegion;
  onChange: (region: WarehouseRegion) => void;
}

const regions: { value: WarehouseRegion; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "US", label: "US" },
  { value: "EU", label: "EU" },
  { value: "CN", label: "China" },
];

/**
 * Quick filter buttons for warehouse regions
 * Allows filtering products by shipping origin
 */
export function WarehouseFilter({ value, onChange }: WarehouseFilterProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
      {regions.map((region) => (
        <Button
          key={region.value}
          variant={value === region.value ? "default" : "ghost"}
          size="sm"
          className={`h-7 px-3 text-xs font-medium ${
            value === region.value
              ? ""
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onChange(region.value)}
        >
          {region.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Map warehouse filter region to ship from countries
 * Returns array of country names for API filtering
 */
export function getShipFromCountriesForRegion(region: WarehouseRegion): string[] {
  switch (region) {
    case "US":
      return ["United States"];
    case "EU":
      return ["France", "Germany", "Spain", "Italy", "Poland", "Netherlands", "Belgium", "Czech Republic"];
    case "CN":
      return ["China"];
    case "ALL":
    default:
      return [];
  }
}

/**
 * Get primary ship from value for API (single value)
 */
export function getShipFromForRegion(region: WarehouseRegion): string {
  switch (region) {
    case "US":
      return "United States";
    case "EU":
      return "France"; // Primary EU warehouse
    case "CN":
      return "China";
    case "ALL":
    default:
      return "ALL";
  }
}
