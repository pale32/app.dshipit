"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { DisplayProduct } from "@/types/find-products";

interface ProductGridProps {
  products: DisplayProduct[];
  selectedProductIds: string[];
  onProductSelect: (productId: string, selected: boolean) => void;
  onProductImport: (product: DisplayProduct) => void;
  onSupplierOptimizer?: (productId: string) => void;
  shippingCosts?: Record<string, number>;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  loadingMessage?: string;
}

/**
 * Product grid with infinite scroll support
 * Uses Intersection Observer for efficient lazy loading
 */
export function ProductGrid({
  products,
  selectedProductIds,
  onProductSelect,
  onProductImport,
  onSupplierOptimizer,
  shippingCosts = {},
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = "No products found",
  loadingMessage = "Loading products...",
}: ProductGridProps) {
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading || isLoadingMore) return;

    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading, isLoadingMore]);

  // Initial loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  // Empty state
  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProductIds.includes(product.id)}
            onSelect={onProductSelect}
            onImport={onProductImport}
            onSupplierOptimizer={onSupplierOptimizer}
            shippingCost={shippingCosts[product.id]}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {hasMore && !isLoading && (
        <div ref={loadMoreSentinelRef} className="h-1 w-full" />
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* End of Products */}
      {!hasMore && products.length > 0 && !isLoading && !isLoadingMore && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No more products to load</p>
        </div>
      )}
    </div>
  );
}
