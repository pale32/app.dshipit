"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type WarehouseRegion = "US" | "EU" | "CN" | "OTHER";

interface WarehouseBadgeProps {
  shipFrom?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

// Map country names/codes to warehouse regions
const WAREHOUSE_REGION_MAP: Record<string, WarehouseRegion> = {
  // US Warehouses
  "United States": "US",
  "US": "US",
  "USA": "US",

  // EU Warehouses
  "France": "EU",
  "FR": "EU",
  "Germany": "EU",
  "DE": "EU",
  "Spain": "EU",
  "ES": "EU",
  "Italy": "EU",
  "IT": "EU",
  "Poland": "EU",
  "PL": "EU",
  "Netherlands": "EU",
  "NL": "EU",
  "Belgium": "EU",
  "BE": "EU",
  "Czech Republic": "EU",
  "CZ": "EU",

  // China Warehouses
  "China": "CN",
  "CN": "CN",
  "Hong Kong": "CN",
  "HK": "CN",

  // UK (post-Brexit, separate from EU)
  "United Kingdom": "OTHER",
  "UK": "OTHER",
  "GB": "OTHER",

  // Other regions
  "Russia": "OTHER",
  "RU": "OTHER",
  "Brazil": "OTHER",
  "BR": "OTHER",
  "Australia": "OTHER",
  "AU": "OTHER",
};

/**
 * Get warehouse region from ship from location
 */
export function getWarehouseRegion(shipFrom?: string): WarehouseRegion {
  if (!shipFrom) return "CN"; // Default to China
  return WAREHOUSE_REGION_MAP[shipFrom] || "OTHER";
}

/**
 * Get shipping speed estimate based on region
 */
export function getShippingSpeed(region: WarehouseRegion): "fast" | "standard" | "slow" {
  switch (region) {
    case "US":
    case "EU":
      return "fast";
    case "CN":
      return "slow";
    default:
      return "standard";
  }
}

const regionConfig: Record<WarehouseRegion, { label: string; color: string; bg: string; description: string }> = {
  US: {
    label: "US",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    description: "Ships from US warehouse (2-7 days)",
  },
  EU: {
    label: "EU",
    color: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    description: "Ships from EU warehouse (3-10 days)",
  },
  CN: {
    label: "CN",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    description: "Ships from China (10-25 days)",
  },
  OTHER: {
    label: "INT",
    color: "text-gray-700 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800",
    description: "International warehouse",
  },
};

/**
 * Warehouse location badge showing shipping origin
 */
export function WarehouseBadge({
  shipFrom,
  showLabel = true,
  size = "sm",
}: WarehouseBadgeProps) {
  const region = getWarehouseRegion(shipFrom);
  const config = regionConfig[region];

  const sizeClasses = size === "sm"
    ? "text-[9px] px-1.5 py-0.5"
    : "text-xs px-2 py-1";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`
              inline-flex items-center font-semibold rounded-md
              ${config.bg} ${config.color} ${sizeClasses}
            `}
          >
            {showLabel ? config.label : region}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{config.description}</p>
          {shipFrom && <p className="text-muted-foreground mt-1">From: {shipFrom}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Shipping speed indicator
 */
export function ShippingSpeedBadge({ shipFrom }: { shipFrom?: string }) {
  const region = getWarehouseRegion(shipFrom);
  const speed = getShippingSpeed(region);

  const speedConfig = {
    fast: {
      label: "Fast",
      color: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    standard: {
      label: "Standard",
      color: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    slow: {
      label: "Standard",
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800",
    },
  };

  const config = speedConfig[speed];

  return (
    <span
      className={`
        inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded-md
        ${config.bg} ${config.color}
      `}
    >
      {config.label}
    </span>
  );
}
