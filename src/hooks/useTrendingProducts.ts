"use client";

import { useState, useEffect, useCallback } from "react";
import type { DisplayProduct } from "@/types/find-products";
import { searchProducts, transformProductForDisplay } from "@/lib/aliexpress-api";

export interface TrendingProduct extends DisplayProduct {
  trendScore: number;
  trendType: "hot" | "rising" | "top_seller";
}

interface UseTrendingProductsResult {
  products: TrendingProduct[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// Cache key and TTL for trending products
const CACHE_KEY = "dshipit_trending_products";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedData {
  products: TrendingProduct[];
  timestamp: number;
}

/**
 * Hook to fetch and cache trending/hot products
 * Uses high-order products sorted by volume as trending indicators
 */
export function useTrendingProducts(
  shipToCountry: string = "US"
): UseTrendingProductsResult {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh && typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const data: CachedData = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_TTL) {
            setProducts(data.products);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Cache read failed, continue to fetch
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch popular products using trending search terms
      const trendingTerms = ["trending", "best seller", "hot deals"];
      const randomTerm = trendingTerms[Math.floor(Math.random() * trendingTerms.length)];

      const { products: rawProducts } = await searchProducts(
        randomTerm,
        1,
        20, // Fetch 20 products
        "orders_desc", // Sort by orders (most popular)
        shipToCountry
      );

      // Transform and score products
      const trendingProducts: TrendingProduct[] = rawProducts
        .map((p) => {
          const display = transformProductForDisplay(p);
          const orders = display.orders || 0;

          // Calculate trend score based on orders and rating
          let trendScore = 0;
          let trendType: "hot" | "rising" | "top_seller" = "rising";

          if (orders >= 5000) {
            trendScore = 100;
            trendType = "hot";
          } else if (orders >= 1000) {
            trendScore = 75 + (orders - 1000) / 160; // 75-100 range
            trendType = "top_seller";
          } else if (orders >= 500) {
            trendScore = 50 + (orders - 500) / 20; // 50-75 range
            trendType = "rising";
          } else {
            trendScore = Math.min(50, orders / 10);
            trendType = "rising";
          }

          // Boost score for high ratings
          if (display.rating >= 4.5) {
            trendScore += 10;
          }

          return {
            ...display,
            trendScore: Math.min(100, Math.round(trendScore)),
            trendType,
          };
        })
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 12); // Keep top 12

      setProducts(trendingProducts);

      // Cache results
      if (typeof window !== "undefined") {
        try {
          const cacheData: CachedData = {
            products: trendingProducts,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch {
          // Cache write failed, ignore
        }
      }
    } catch (err) {
      console.error("Failed to fetch trending products:", err);
      setError("Failed to load trending products");
    } finally {
      setIsLoading(false);
    }
  }, [shipToCountry]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const refresh = useCallback(() => {
    fetchTrending(true);
  }, [fetchTrending]);

  return { products, isLoading, error, refresh };
}
