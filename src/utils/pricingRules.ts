// Pricing Rule Types
export interface PricingRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'formula';
  profitMarginPercentage?: number;
  fixedMarkup?: number;
  minimumPrice?: number;
  maximumPrice?: number;
  compareAtPriceMultiplier?: number;
  enabled: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  supplierPrice: number;
  currentPrice: number;
  compareAtPrice?: number;
  profitMargin?: number;
  shippingCost?: number;
}

export interface PricingCalculationResult {
  originalPrice: number;
  calculatedPrice: number;
  compareAtPrice: number;
  profitMargin: number;
  profitAmount: number;
  markup: number;
}

// Default pricing rules for different scenarios
export const DEFAULT_PRICING_RULES: Record<string, PricingRule> = {
  standard: {
    id: 'standard',
    name: 'Standard Dropshipping Rule',
    type: 'percentage',
    profitMarginPercentage: 40, // 40% profit margin
    compareAtPriceMultiplier: 1.3, // 30% higher compare-at price
    minimumPrice: 5.00,
    enabled: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium Product Rule',
    type: 'percentage',
    profitMarginPercentage: 60, // 60% profit margin
    compareAtPriceMultiplier: 1.5, // 50% higher compare-at price
    minimumPrice: 10.00,
    enabled: true,
  },
  competitive: {
    id: 'competitive',
    name: 'Competitive Pricing Rule',
    type: 'percentage',
    profitMarginPercentage: 25, // 25% profit margin
    compareAtPriceMultiplier: 1.2, // 20% higher compare-at price
    minimumPrice: 3.00,
    enabled: true,
  },
};

/**
 * Calculate pricing based on supplier price and pricing rule
 */
export function calculatePricing(
  supplierPrice: number,
  shippingCost: number = 0,
  pricingRule: PricingRule | null = null
): PricingCalculationResult {
  const baseCost = supplierPrice + shippingCost;
  
  // If no pricing rule is applied, return original pricing
  if (!pricingRule || !pricingRule.enabled) {
    return {
      originalPrice: supplierPrice,
      calculatedPrice: baseCost,
      compareAtPrice: baseCost * 1.2, // Default 20% higher
      profitMargin: 0,
      profitAmount: 0,
      markup: 0,
    };
  }

  let calculatedPrice = baseCost;
  
  // Apply pricing rule based on type
  switch (pricingRule.type) {
    case 'percentage':
      if (pricingRule.profitMarginPercentage) {
        // Calculate price to achieve desired profit margin
        // Formula: Price = Cost / (1 - ProfitMargin%)
        calculatedPrice = baseCost / (1 - pricingRule.profitMarginPercentage / 100);
      }
      break;
      
    case 'fixed':
      if (pricingRule.fixedMarkup) {
        calculatedPrice = baseCost + pricingRule.fixedMarkup;
      }
      break;
      
    case 'formula':
      // Custom formula can be implemented here
      calculatedPrice = baseCost * 1.4; // Default 40% markup
      break;
  }

  // Apply minimum and maximum price constraints
  if (pricingRule.minimumPrice && calculatedPrice < pricingRule.minimumPrice) {
    calculatedPrice = pricingRule.minimumPrice;
  }
  
  if (pricingRule.maximumPrice && calculatedPrice > pricingRule.maximumPrice) {
    calculatedPrice = pricingRule.maximumPrice;
  }

  // Calculate compare-at price
  const compareAtPrice = calculatedPrice * (pricingRule.compareAtPriceMultiplier || 1.3);
  
  // Calculate profit metrics
  const profitAmount = calculatedPrice - baseCost;
  const profitMargin = (profitAmount / calculatedPrice) * 100;
  const markup = (profitAmount / baseCost) * 100;

  return {
    originalPrice: supplierPrice,
    calculatedPrice: Math.round(calculatedPrice * 100) / 100, // Round to 2 decimal places
    compareAtPrice: Math.round(compareAtPrice * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
    profitAmount: Math.round(profitAmount * 100) / 100,
    markup: Math.round(markup * 100) / 100,
  };
}

/**
 * Apply pricing rule to multiple product variants
 */
export function applyPricingRuleToVariants(
  variants: ProductVariant[],
  pricingRule: PricingRule | null,
  shippingCost: number = 0
): ProductVariant[] {
  return variants.map(variant => {
    const pricing = calculatePricing(variant.supplierPrice, shippingCost, pricingRule);
    
    return {
      ...variant,
      currentPrice: pricing.calculatedPrice,
      compareAtPrice: pricing.compareAtPrice,
      profitMargin: pricing.profitMargin,
    };
  });
}

/**
 * Get pricing rule by shipping destination and product category
 */
export function getPricingRuleForDestination(
  destination: string,
  productCategory?: string
): PricingRule {
  // This can be expanded to include destination-specific rules
  // For now, return standard rule
  return DEFAULT_PRICING_RULES.standard;
}

/**
 * Calculate shipping cost based on destination and shipping method
 */
export function calculateShippingCost(
  destination: string,
  shippingMethod: string,
  productWeight?: number
): number {
  // Simplified shipping cost calculation
  // In real implementation, this would call shipping API
  const shippingRates: Record<string, Record<string, number>> = {
    'AliExpress standard shipping': {
      'United States': 2.50,
      'United Kingdom': 3.00,
      'Australia': 3.50,
      'Canada': 2.75,
      'default': 4.00,
    },
    'DHL': {
      'United States': 8.50,
      'United Kingdom': 9.00,
      'Australia': 10.50,
      'Canada': 8.75,
      'default': 12.00,
    },
    'FedEx IP': {
      'United States': 7.50,
      'United Kingdom': 8.00,
      'Australia': 9.50,
      'Canada': 7.75,
      'default': 10.00,
    },
  };

  const methodRates = shippingRates[shippingMethod] || shippingRates['AliExpress standard shipping'];
  return methodRates[destination] || methodRates['default'];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate profit metrics for reporting
 */
export function calculateProfitMetrics(variants: ProductVariant[]): {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageProfitMargin: number;
} {
  const totals = variants.reduce(
    (acc, variant) => {
      const cost = variant.supplierPrice + (variant.shippingCost || 0);
      const revenue = variant.currentPrice;
      const profit = revenue - cost;
      
      return {
        totalRevenue: acc.totalRevenue + revenue,
        totalCost: acc.totalCost + cost,
        totalProfit: acc.totalProfit + profit,
      };
    },
    { totalRevenue: 0, totalCost: 0, totalProfit: 0 }
  );

  const averageProfitMargin = totals.totalRevenue > 0 
    ? (totals.totalProfit / totals.totalRevenue) * 100 
    : 0;

  return {
    ...totals,
    averageProfitMargin: Math.round(averageProfitMargin * 100) / 100,
  };
}