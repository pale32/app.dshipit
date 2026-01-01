"use client";

import type { DisplayProduct } from "@/types/find-products";

// Cache configuration
const CACHE_KEY_PREFIX = "dshipit_product_cache_";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes default TTL

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ProductSearchResult {
  products: DisplayProduct[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Generate a cache key from search parameters
 */
function generateCacheKey(
  searchTerm: string,
  page: number,
  filters: {
    shipTo?: string;
    shipFrom?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): string {
  const key = [
    searchTerm.toLowerCase().trim(),
    `p${page}`,
    filters.shipTo || "US",
    filters.shipFrom || "ALL",
    filters.sortBy || "default",
    filters.minPrice || 0,
    filters.maxPrice || 0,
  ].join("_");

  return CACHE_KEY_PREFIX + key;
}

/**
 * Check if a cache entry is still valid
 */
function isValidEntry<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  if (!entry) return false;
  const now = Date.now();
  return now - entry.timestamp < entry.ttl;
}

/**
 * Get cached product search results
 */
export function getCachedProducts(
  searchTerm: string,
  page: number,
  filters: {
    shipTo?: string;
    shipFrom?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): ProductSearchResult | null {
  if (typeof window === "undefined") return null;

  try {
    const key = generateCacheKey(searchTerm, page, filters);
    const stored = sessionStorage.getItem(key);

    if (!stored) return null;

    const entry: CacheEntry<ProductSearchResult> = JSON.parse(stored);

    if (!isValidEntry(entry)) {
      sessionStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Cache product search results
 */
export function cacheProducts(
  searchTerm: string,
  page: number,
  filters: {
    shipTo?: string;
    shipFrom?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
  },
  data: ProductSearchResult,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  if (typeof window === "undefined") return;

  try {
    const key = generateCacheKey(searchTerm, page, filters);
    const entry: CacheEntry<ProductSearchResult> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Session storage might be full or disabled
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to cache products:", error);
    }
    // Try to clear old entries if storage is full
    clearExpiredCache();
  }
}

/**
 * Clear all expired cache entries
 */
export function clearExpiredCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(stored);
            if (!isValidEntry(entry)) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Clear all product cache entries
 */
export function clearAllProductCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Shipping cost cache for individual products
 */
const SHIPPING_CACHE_KEY = "dshipit_shipping_cache";
const SHIPPING_TTL_MS = 30 * 60 * 1000; // 30 minutes for shipping costs

interface ShippingCacheData {
  [productId: string]: {
    cost: number;
    deliveryDays?: string;
    timestamp: number;
  };
}

/**
 * Get cached shipping cost for a product
 */
export function getCachedShippingCost(
  productId: string,
  shipTo: string
): { cost: number; deliveryDays?: string } | null {
  if (typeof window === "undefined") return null;

  try {
    const cacheKey = `${SHIPPING_CACHE_KEY}_${shipTo}`;
    const stored = sessionStorage.getItem(cacheKey);

    if (!stored) return null;

    const cache: ShippingCacheData = JSON.parse(stored);
    const entry = cache[productId];

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > SHIPPING_TTL_MS) {
      return null;
    }

    return { cost: entry.cost, deliveryDays: entry.deliveryDays };
  } catch {
    return null;
  }
}

/**
 * Cache shipping cost for a product
 */
export function cacheShippingCost(
  productId: string,
  shipTo: string,
  cost: number,
  deliveryDays?: string
): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = `${SHIPPING_CACHE_KEY}_${shipTo}`;
    const stored = sessionStorage.getItem(cacheKey);
    const cache: ShippingCacheData = stored ? JSON.parse(stored) : {};

    cache[productId] = {
      cost,
      deliveryDays,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Preload cache for commonly searched terms
 * Can be called on page load for frequently searched items
 */
export function preloadCache(
  searchTerms: string[],
  fetchFn: (term: string) => Promise<ProductSearchResult>
): void {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback for non-blocking preload
  const preload = () => {
    searchTerms.forEach((term) => {
      const cached = getCachedProducts(term, 1, {});
      if (!cached) {
        // Fetch and cache in background
        fetchFn(term).then((result) => {
          cacheProducts(term, 1, {}, result);
        }).catch(() => {
          // Ignore preload errors
        });
      }
    });
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(preload);
  } else {
    setTimeout(preload, 1000);
  }
}
