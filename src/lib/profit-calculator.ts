"use client";

/**
 * Profit calculation utilities for dropshipping
 * Handles margin, ROI, and suggested pricing calculations
 */

export interface ProfitCalculation {
  costPrice: number;
  shippingCost: number;
  sellingPrice: number;
  profit: number;
  marginPercent: number;
  roi: number;
}

export interface PricingSuggestion {
  conservative: number; // 20% margin
  standard: number;     // 35% margin
  aggressive: number;   // 50% margin
}

// Default margin preferences (can be customized per user)
const DEFAULT_MARGINS = {
  conservative: 0.20,
  standard: 0.35,
  aggressive: 0.50,
};

// Storage key for user's preferred margin
const MARGIN_PREFERENCE_KEY = "dshipit_preferred_margin";

/**
 * Calculate profit metrics from cost and selling price
 */
export function calculateProfit(
  costPrice: number,
  shippingCost: number,
  sellingPrice: number
): ProfitCalculation {
  const totalCost = costPrice + shippingCost;
  const profit = sellingPrice - totalCost;
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    costPrice,
    shippingCost,
    sellingPrice,
    profit: Math.round(profit * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
    roi: Math.round(roi * 10) / 10,
  };
}

/**
 * Calculate suggested selling prices based on target margins
 */
export function getSuggestedPrices(
  costPrice: number,
  shippingCost: number
): PricingSuggestion {
  const totalCost = costPrice + shippingCost;

  // Price = Cost / (1 - margin)
  return {
    conservative: Math.round((totalCost / (1 - DEFAULT_MARGINS.conservative)) * 100) / 100,
    standard: Math.round((totalCost / (1 - DEFAULT_MARGINS.standard)) * 100) / 100,
    aggressive: Math.round((totalCost / (1 - DEFAULT_MARGINS.aggressive)) * 100) / 100,
  };
}

/**
 * Calculate selling price for a target margin percentage
 */
export function getPriceForMargin(
  costPrice: number,
  shippingCost: number,
  targetMarginPercent: number
): number {
  const totalCost = costPrice + shippingCost;
  const margin = targetMarginPercent / 100;

  if (margin >= 1) return totalCost * 10; // Cap at 10x for 100%+ margins
  return Math.round((totalCost / (1 - margin)) * 100) / 100;
}

/**
 * Calculate margin percentage for a given selling price
 */
export function getMarginForPrice(
  costPrice: number,
  shippingCost: number,
  sellingPrice: number
): number {
  if (sellingPrice <= 0) return 0;
  const totalCost = costPrice + shippingCost;
  const profit = sellingPrice - totalCost;
  return Math.round((profit / sellingPrice) * 1000) / 10;
}

/**
 * Save user's preferred margin percentage
 */
export function savePreferredMargin(marginPercent: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MARGIN_PREFERENCE_KEY, marginPercent.toString());
}

/**
 * Get user's preferred margin percentage (default: 35%)
 */
export function getPreferredMargin(): number {
  if (typeof window === "undefined") return 35;
  const stored = localStorage.getItem(MARGIN_PREFERENCE_KEY);
  return stored ? parseFloat(stored) : 35;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/**
 * Get profit status color based on margin
 */
export function getProfitStatus(marginPercent: number): "good" | "warning" | "poor" {
  if (marginPercent >= 30) return "good";
  if (marginPercent >= 15) return "warning";
  return "poor";
}
