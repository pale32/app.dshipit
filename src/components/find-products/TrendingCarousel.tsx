"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Award, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TrendingProduct } from "@/hooks/useTrendingProducts";
import type { DisplayProduct } from "@/types/find-products";

interface TrendingCarouselProps {
  products: TrendingProduct[];
  isLoading: boolean;
  onProductClick?: (product: DisplayProduct) => void;
  onImport?: (product: DisplayProduct) => void;
  onRefresh?: () => void;
}

/**
 * Get trend badge config based on trend type
 */
function getTrendBadge(type: "hot" | "rising" | "top_seller") {
  switch (type) {
    case "hot":
      return {
        icon: Flame,
        label: "Hot",
        color: "text-orange-500",
        bg: "bg-orange-100 dark:bg-orange-900/40",
      };
    case "top_seller":
      return {
        icon: Award,
        label: "Top Seller",
        color: "text-amber-500",
        bg: "bg-amber-100 dark:bg-amber-900/40",
      };
    case "rising":
    default:
      return {
        icon: TrendingUp,
        label: "Rising",
        color: "text-emerald-500",
        bg: "bg-emerald-100 dark:bg-emerald-900/40",
      };
  }
}

/**
 * Trending Products Carousel
 * Displays hot/trending products in a horizontal scrollable carousel
 */
export function TrendingCarousel({
  products,
  isLoading,
  onProductClick,
  onImport,
  onRefresh,
}: TrendingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Trending Now</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-48 bg-muted/30 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Trending Now</h2>
          <span className="text-sm text-muted-foreground">
            ({products.length} products)
          </span>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => {
            const badge = getTrendBadge(product.trendType);
            const BadgeIcon = badge.icon;

            return (
              <Card
                key={product.id}
                className="flex-shrink-0 w-[200px] border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => onProductClick?.(product)}
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />

                  {/* Trend Badge */}
                  <div
                    className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg}`}
                  >
                    <BadgeIcon className={`h-3 w-3 ${badge.color}`} />
                    <span className={`text-[10px] font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Quick Import Button */}
                  {onImport && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="default"
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onImport(product);
                            }}
                          >
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth="0"
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path fill="none" d="M0 0h24v24H0V0z" />
                              <path d="M11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z" />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add to Import List</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  {/* Title */}
                  <h3
                    className="text-sm font-medium line-clamp-2 h-10 leading-5"
                    title={product.title}
                  >
                    {product.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${product.endPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{product.orders.toLocaleString()} orders</span>
                    {product.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <svg
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {product.rating}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
