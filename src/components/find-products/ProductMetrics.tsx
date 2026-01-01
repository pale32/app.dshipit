"use client";

import { Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TrendDirection = "rising" | "stable" | "falling";

interface ProductMetricsProps {
  orders: number;
  rating?: number;
  reviews?: number;
  showHotBadge?: boolean;
  showTrend?: boolean;
  trendDirection?: TrendDirection;
}

// Thresholds for product velocity classification
const HOT_PRODUCT_THRESHOLD = 1000; // Orders for "Hot" badge
const TRENDING_THRESHOLD = 500; // Orders for trending consideration

/**
 * Determine if a product is "hot" based on order count
 */
export function isHotProduct(orders: number): boolean {
  return orders >= HOT_PRODUCT_THRESHOLD;
}

/**
 * Get velocity classification
 */
export function getVelocityClass(orders: number): "hot" | "trending" | "normal" {
  if (orders >= HOT_PRODUCT_THRESHOLD) return "hot";
  if (orders >= TRENDING_THRESHOLD) return "trending";
  return "normal";
}

/**
 * Hot product badge - shows for high-velocity products
 */
export function HotBadge({ orders }: { orders: number }) {
  if (orders < HOT_PRODUCT_THRESHOLD) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
            <Flame className="h-3 w-3" />
            Hot
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>High demand product ({orders.toLocaleString()}+ orders)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Trend indicator arrow
 */
export function TrendIndicator({ direction }: { direction: TrendDirection }) {
  const config = {
    rising: {
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      label: "Rising demand",
    },
    stable: {
      icon: Minus,
      color: "text-gray-500 dark:text-gray-400",
      label: "Stable demand",
    },
    falling: {
      icon: TrendingDown,
      color: "text-red-500 dark:text-red-400",
      label: "Declining demand",
    },
  };

  const { icon: Icon, color, label } = config[direction];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center ${color}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Combined product metrics display
 */
export function ProductMetrics({
  orders,
  showHotBadge = true,
  showTrend = false,
  trendDirection = "stable",
}: ProductMetricsProps) {
  return (
    <div className="flex items-center gap-2">
      {showHotBadge && <HotBadge orders={orders} />}
      {showTrend && <TrendIndicator direction={trendDirection} />}
    </div>
  );
}

/**
 * Orders display with optional trend
 */
export function OrdersDisplay({
  orders,
  showTrend = false,
  trendDirection = "stable",
}: {
  orders: number;
  showTrend?: boolean;
  trendDirection?: TrendDirection;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-normal text-sm">{orders.toLocaleString()}</span>
      {showTrend && <TrendIndicator direction={trendDirection} />}
    </div>
  );
}
