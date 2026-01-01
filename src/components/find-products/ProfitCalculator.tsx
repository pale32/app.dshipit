"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  calculateProfit,
  getSuggestedPrices,
  getPreferredMargin,
  savePreferredMargin,
  formatCurrency,
  getProfitStatus,
} from "@/lib/profit-calculator";

interface ProfitCalculatorProps {
  productPrice: number;
  shippingCost: number;
  productTitle?: string;
}

/**
 * Profit calculator dialog for product cards
 * Shows margin calculations and suggested pricing
 */
export function ProfitCalculator({
  productPrice,
  shippingCost,
  productTitle,
}: ProfitCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const preferredMargin = getPreferredMargin();
  const totalCost = productPrice + (shippingCost > 0 ? shippingCost : 0);
  const margin = preferredMargin / 100;
  const initialPrice = Math.round((totalCost / (1 - margin)) * 100) / 100;

  const [sellingPrice, setSellingPrice] = useState<number>(initialPrice);

  const effectiveShipping = shippingCost > 0 ? shippingCost : 0;
  const calculation = calculateProfit(productPrice, effectiveShipping, sellingPrice);
  const suggestions = getSuggestedPrices(productPrice, effectiveShipping);
  const profitStatus = getProfitStatus(calculation.marginPercent);

  const handleSuggestionClick = (price: number) => {
    setSellingPrice(price);
  };

  const handleSavePreference = () => {
    savePreferredMargin(calculation.marginPercent);
  };

  const statusColors = {
    good: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    poor: "text-red-600 dark:text-red-400",
  };

  const statusBg = {
    good: "bg-emerald-50 dark:bg-emerald-950/30",
    warning: "bg-amber-50 dark:bg-amber-950/30",
    poor: "bg-red-50 dark:bg-red-950/30",
  };

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-md"
        title="Calculate Profit"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-emerald-600"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="10" x2="8" y2="10.01" />
          <line x1="12" y1="10" x2="12" y2="10.01" />
          <line x1="16" y1="10" x2="16" y2="10.01" />
          <line x1="8" y1="14" x2="8" y2="14.01" />
          <line x1="12" y1="14" x2="12" y2="14.01" />
          <line x1="16" y1="14" x2="16" y2="14.01" />
          <line x1="8" y1="18" x2="8" y2="18.01" />
          <line x1="12" y1="18" x2="16" y2="18" />
        </svg>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profit Calculator</DialogTitle>
            {productTitle && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {productTitle}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {/* Cost Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Cost</span>
                <span className="font-medium">{formatCurrency(productPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {effectiveShipping > 0 ? formatCurrency(effectiveShipping) : "Free"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Cost</span>
                <span className="font-semibold">
                  {formatCurrency(productPrice + effectiveShipping)}
                </span>
              </div>
            </div>

            {/* Selling Price Input */}
            <div className="space-y-2">
              <Label htmlFor="selling-price" className="text-sm">
                Your Selling Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="selling-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>

            {/* Suggested Prices */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Set</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => handleSuggestionClick(suggestions.conservative)}
                >
                  20% ({formatCurrency(suggestions.conservative)})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => handleSuggestionClick(suggestions.standard)}
                >
                  35% ({formatCurrency(suggestions.standard)})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => handleSuggestionClick(suggestions.aggressive)}
                >
                  50% ({formatCurrency(suggestions.aggressive)})
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className={`rounded-lg p-3 space-y-2 ${statusBg[profitStatus]}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profit</span>
                <span className={`font-bold ${statusColors[profitStatus]}`}>
                  {formatCurrency(calculation.profit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Margin</span>
                <span className={`font-bold ${statusColors[profitStatus]}`}>
                  {calculation.marginPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ROI</span>
                <span className={`font-bold ${statusColors[profitStatus]}`}>
                  {calculation.roi.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Save Preference */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={handleSavePreference}
            >
              Save {calculation.marginPercent.toFixed(0)}% as my default margin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
