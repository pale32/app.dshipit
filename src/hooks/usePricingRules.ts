"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  calculatePricing,
  calculateShippingCost,
  getPricingRuleForDestination,
  applyPricingRuleToVariants,
  DEFAULT_PRICING_RULES,
  type PricingRule,
  type ProductVariant,
  type PricingCalculationResult,
} from '@/utils/pricingRules';

interface UsePricingRulesProps {
  initialVariants?: ProductVariant[];
  initialDestination?: string;
  initialShippingMethod?: string;
  initialPricingRuleEnabled?: boolean;
  onPricingUpdate?: (variants: ProductVariant[], pricingResults: PricingCalculationResult[]) => void;
}

interface UsePricingRulesReturn {
  variants: ProductVariant[];
  pricingRule: PricingRule | null;
  pricingEnabled: boolean;
  destination: string;
  shippingMethod: string;
  updateDestination: (destination: string) => void;
  updateShippingMethod: (method: string) => void;
  togglePricingRule: (enabled: boolean) => void;
  updateVariants: (variants: ProductVariant[]) => void;
  recalculatePricing: () => void;
  getPricingResults: () => PricingCalculationResult[];
}

/**
 * Custom hook for managing pricing rules and calculations
 * Provides a clean interface for components to handle pricing logic
 */
export function usePricingRules({
  initialVariants = [],
  initialDestination = 'United Arab Emirates',
  initialShippingMethod = 'AliExpress standard shipping',
  initialPricingRuleEnabled = true,
  onPricingUpdate,
}: UsePricingRulesProps = {}): UsePricingRulesReturn {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [destination, setDestination] = useState(initialDestination);
  const [shippingMethod, setShippingMethod] = useState(initialShippingMethod);
  const [pricingEnabled, setPricingEnabled] = useState(initialPricingRuleEnabled);
  const [pricingRule, setPricingRule] = useState<PricingRule | null>(
    initialPricingRuleEnabled ? getPricingRuleForDestination(initialDestination) : null
  );

  // Calculate pricing for all variants
  const calculateAllPricing = useCallback((
    currentVariants: ProductVariant[],
    currentDestination: string,
    currentShippingMethod: string,
    currentPricingRule: PricingRule | null
  ): { updatedVariants: ProductVariant[]; pricingResults: PricingCalculationResult[] } => {
    const pricingResults: PricingCalculationResult[] = [];
    
    const updatedVariants = currentVariants.map(variant => {
      const shippingCost = calculateShippingCost(currentDestination, currentShippingMethod, variant.supplierPrice);
      const pricing = calculatePricing(variant.supplierPrice, shippingCost, currentPricingRule);
      
      pricingResults.push(pricing);
      
      return {
        ...variant,
        currentPrice: pricing.calculatedPrice,
        compareAtPrice: pricing.compareAtPrice,
        profitMargin: pricing.profitMargin,
        shippingCost,
      };
    });

    return { updatedVariants, pricingResults };
  }, []);

  // Update destination and recalculate pricing
  const updateDestination = useCallback((newDestination: string) => {
    setDestination(newDestination);
    
    if (pricingEnabled) {
      const newPricingRule = getPricingRuleForDestination(newDestination);
      setPricingRule(newPricingRule);
      
      const { updatedVariants, pricingResults } = calculateAllPricing(
        variants,
        newDestination,
        shippingMethod,
        newPricingRule
      );
      
      setVariants(updatedVariants);
      onPricingUpdate?.(updatedVariants, pricingResults);
    }
  }, [variants, shippingMethod, pricingEnabled, calculateAllPricing, onPricingUpdate]);

  // Update shipping method and recalculate pricing
  const updateShippingMethod = useCallback((newMethod: string) => {
    setShippingMethod(newMethod);
    
    if (pricingEnabled && pricingRule) {
      const { updatedVariants, pricingResults } = calculateAllPricing(
        variants,
        destination,
        newMethod,
        pricingRule
      );
      
      setVariants(updatedVariants);
      onPricingUpdate?.(updatedVariants, pricingResults);
    }
  }, [variants, destination, pricingEnabled, pricingRule, calculateAllPricing, onPricingUpdate]);

  // Toggle pricing rule on/off
  const togglePricingRule = useCallback((enabled: boolean) => {
    setPricingEnabled(enabled);
    
    if (enabled) {
      const newPricingRule = getPricingRuleForDestination(destination);
      setPricingRule(newPricingRule);
      
      const { updatedVariants, pricingResults } = calculateAllPricing(
        variants,
        destination,
        shippingMethod,
        newPricingRule
      );
      
      setVariants(updatedVariants);
      onPricingUpdate?.(updatedVariants, pricingResults);
    } else {
      setPricingRule(null);
      
      // Revert to original pricing (supplier price + shipping)
      const revertedVariants = variants.map(variant => {
        const shippingCost = calculateShippingCost(destination, shippingMethod, variant.supplierPrice);
        return {
          ...variant,
          currentPrice: variant.supplierPrice + shippingCost,
          compareAtPrice: (variant.supplierPrice + shippingCost) * 1.2,
          profitMargin: 0,
          shippingCost,
        };
      });
      
      setVariants(revertedVariants);
      onPricingUpdate?.(revertedVariants, []);
    }
  }, [variants, destination, shippingMethod, calculateAllPricing, onPricingUpdate]);

  // Update variants (for when new products are loaded from API)
  const updateVariants = useCallback((newVariants: ProductVariant[]) => {
    setVariants(newVariants);
    
    if (pricingEnabled && pricingRule) {
      const { updatedVariants, pricingResults } = calculateAllPricing(
        newVariants,
        destination,
        shippingMethod,
        pricingRule
      );
      
      setVariants(updatedVariants);
      onPricingUpdate?.(updatedVariants, pricingResults);
    }
  }, [destination, shippingMethod, pricingEnabled, pricingRule, calculateAllPricing, onPricingUpdate]);

  // Manually recalculate pricing (useful for API refresh)
  const recalculatePricing = useCallback(() => {
    if (pricingEnabled && pricingRule) {
      const { updatedVariants, pricingResults } = calculateAllPricing(
        variants,
        destination,
        shippingMethod,
        pricingRule
      );
      
      setVariants(updatedVariants);
      onPricingUpdate?.(updatedVariants, pricingResults);
    }
  }, [variants, destination, shippingMethod, pricingEnabled, pricingRule, calculateAllPricing, onPricingUpdate]);

  // Get current pricing results without updating state
  const getPricingResults = useCallback((): PricingCalculationResult[] => {
    if (!pricingEnabled || !pricingRule) return [];
    
    return variants.map(variant => {
      const shippingCost = calculateShippingCost(destination, shippingMethod, variant.supplierPrice);
      return calculatePricing(variant.supplierPrice, shippingCost, pricingRule);
    });
  }, [variants, destination, shippingMethod, pricingEnabled, pricingRule]);

  return {
    variants,
    pricingRule,
    pricingEnabled,
    destination,
    shippingMethod,
    updateDestination,
    updateShippingMethod,
    togglePricingRule,
    updateVariants,
    recalculatePricing,
    getPricingResults,
  };
}

/**
 * Hook for API integration - provides methods to sync with backend
 */
export function usePricingRulesAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing rules from API
  const fetchPricingRules = useCallback(async (): Promise<PricingRule[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/pricing-rules');
      // const rules = await response.json();
      
      // For now, return default rules
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return Object.values(DEFAULT_PRICING_RULES);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing rules');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Save pricing rule to API
  const savePricingRule = useCallback(async (rule: PricingRule): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/pricing-rules', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(rule),
      // });
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pricing rule');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply pricing to products via API
  const applyPricingToProducts = useCallback(async (
    productIds: string[],
    pricingRule: PricingRule
  ): Promise<ProductVariant[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/products/apply-pricing', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productIds, pricingRule }),
      // });
      // const updatedProducts = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return []; // Return updated products from API
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply pricing to products');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPricingRules,
    savePricingRule,
    applyPricingToProducts,
  };
}