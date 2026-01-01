"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { searchProducts, transformProductForDisplay, getShippingCost } from '@/lib/aliexpress-api';
import { isInImportList } from '@/lib/import-list-storage';
import type { DisplayProduct } from '@/types/find-products';

interface UseAliExpressProductsProps {
  enabled?: boolean;
  productsPerPage?: number;
}

interface UseAliExpressProductsReturn {
  products: DisplayProduct[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalProducts: number;
  hasMore: boolean;
  currentPage: number;
  currentSearchTerm: string;
  shippingCosts: Record<string, number>;
  search: (query: string) => void;
  loadMore: () => void;
  refresh: () => void;
  updateFilters: (filters: FilterParams) => void;
}

interface FilterParams {
  shipToCountry?: string;
  shipFromCountry?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Country code mapping for API
const COUNTRY_CODE_MAP: Record<string, string> = {
  'United States': 'US',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Japan': 'JP',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'India': 'IN',
  'China': 'CN',
  'South Korea': 'KR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'ALL': 'ALL',
};

// Sort mapping for API
const SORT_PARAM_MAP: Record<string, string> = {
  'Default': 'default',
  'Orders': 'orders_desc',
  'Newest': 'newest',
  'Price Low to High': 'price_asc',
  'Price High to Low': 'price_desc',
};

// Popular search terms for variety
const DEFAULT_SEARCH_TERMS = [
  'phone case', 'summer', 'gift', 'accessories',
  'jewelry', 'electronics', 'home decor', 'beauty'
];

const getRandomDefaultTerm = () =>
  DEFAULT_SEARCH_TERMS[Math.floor(Math.random() * DEFAULT_SEARCH_TERMS.length)];

const getCountryCode = (countryName: string): string =>
  COUNTRY_CODE_MAP[countryName] || 'US';

const getSortParam = (sortOption: string): string =>
  SORT_PARAM_MAP[sortOption] || 'default';

/**
 * Custom hook for managing AliExpress product search and listing
 * Handles fetching, pagination, filtering, and shipping cost lookups
 */
export function useAliExpressProducts({
  enabled = true,
  productsPerPage = 20,
}: UseAliExpressProductsProps = {}): UseAliExpressProductsReturn {
  // Product state
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Search and filter state
  const [currentSearchTerm, setCurrentSearchTerm] = useState(() => getRandomDefaultTerm());
  const [filters, setFilters] = useState<FilterParams>({
    shipToCountry: 'United States',
    shipFromCountry: 'ALL',
    sortBy: 'Default',
    minPrice: 0,
    maxPrice: 0,
  });

  // Shipping costs cache
  const [shippingCosts, setShippingCosts] = useState<Record<string, number>>({});
  const shippingFetchedRef = useRef<Set<string>>(new Set());

  // Fetch products from API
  const fetchProducts = useCallback(async (
    query: string,
    page: number = 1,
    append: boolean = false
  ) => {
    if (!enabled) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const searchKeywords = query || getRandomDefaultTerm();
      const shipTo = getCountryCode(filters.shipToCountry || 'United States');
      const shipFrom = getCountryCode(filters.shipFromCountry || 'ALL');
      const sort = getSortParam(filters.sortBy || 'Default');

      const { products: apiProducts, totalCount, hasMore: moreAvailable } = await searchProducts(
        searchKeywords,
        page,
        productsPerPage,
        sort,
        shipTo,
        shipFrom !== 'ALL' ? shipFrom : undefined,
        (filters.minPrice ?? 0) > 0 ? filters.minPrice : undefined,
        (filters.maxPrice ?? 0) > 0 ? filters.maxPrice : undefined
      );

      const displayProducts: DisplayProduct[] = apiProducts.map(p => {
        const transformed = transformProductForDisplay(p);
        transformed.isImported = isInImportList(transformed.id);
        return transformed;
      });

      if (append) {
        // Append to existing products for infinite scroll, deduplicating by ID
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = displayProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      } else {
        // Replace products for new search/filter
        setProducts(displayProducts);
      }

      setTotalProducts(totalCount);
      setHasMore(moreAvailable);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching AliExpress products:', err);
      }
      if (!append) {
        setProducts([]);
      }
      setError(null); // Silent fail for better UX
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [enabled, filters, productsPerPage]);

  // Initial load and filter changes
  useEffect(() => {
    if (enabled) {
      setCurrentPage(1);
      setHasMore(true);
      fetchProducts(currentSearchTerm, 1, false);
    }
  }, [enabled, currentSearchTerm, filters, fetchProducts]);

  // Fetch shipping costs for products without shipping data
  useEffect(() => {
    if (!enabled || products.length === 0) return;

    const fetchShippingForProducts = async () => {
      const productsNeedingShipping = products.filter(
        p => p.shipping === -1 && !p.freeShipping && !shippingFetchedRef.current.has(p.id)
      );

      if (productsNeedingShipping.length === 0) return;

      const batchSize = 5;
      for (let i = 0; i < productsNeedingShipping.length; i += batchSize) {
        const batch = productsNeedingShipping.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(async (product) => {
            shippingFetchedRef.current.add(product.id);
            const shipping = await getShippingCost(
              product.id,
              getCountryCode(filters.shipToCountry || 'United States')
            );
            return { id: product.id, cost: shipping?.shippingCost ?? -1 };
          })
        );

        const newCosts: Record<string, number> = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            newCosts[result.value.id] = result.value.cost;
          }
        });

        if (Object.keys(newCosts).length > 0) {
          setShippingCosts(prev => ({ ...prev, ...newCosts }));
        }
      }
    };

    fetchShippingForProducts();
  }, [enabled, products, filters.shipToCountry]);

  // Search function
  const search = useCallback((query: string) => {
    const term = query.trim() || getRandomDefaultTerm();
    setCurrentSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(currentSearchTerm, nextPage, true);
  }, [isLoading, isLoadingMore, hasMore, currentPage, currentSearchTerm, fetchProducts]);

  // Refresh current search
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(currentSearchTerm, 1, false);
  }, [currentSearchTerm, fetchProducts]);

  // Update filters
  const updateFilters = useCallback((newFilters: FilterParams) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    products,
    isLoading,
    isLoadingMore,
    error,
    totalProducts,
    hasMore,
    currentPage,
    currentSearchTerm,
    shippingCosts,
    search,
    loadMore,
    refresh,
    updateFilters,
  };
}
