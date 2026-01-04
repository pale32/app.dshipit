"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Plus, Search, Truck } from "lucide-react";
import { ProfitCalculator } from "./ProfitCalculator";
import type { DisplayProduct } from "@/types/find-products";

interface ProductCardProps {
  product: DisplayProduct;
  isSelected: boolean;
  onSelect: (productId: string, selected: boolean) => void;
  onImport: (product: DisplayProduct) => void;
  onSupplierOptimizer?: (productId: string) => void;
  shippingCost?: number;
}

/**
 * Product card component - AliExpress-inspired clean design
 * Image-focused with actions revealed on hover
 */
export function ProductCard({
  product,
  isSelected,
  onSelect,
  onImport,
  onSupplierOptimizer,
  shippingCost,
}: ProductCardProps) {
  return (
    <Card className="w-full border-0 shadow-none hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-all duration-300 p-2 gap-0 group relative rounded-none bg-white dark:bg-card">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />

        {/* Selection Checkbox - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(product.id, checked === true)}
            className="h-5 w-5 bg-white/90 backdrop-blur-sm border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white rounded"
          />
        </div>

        {/* Discount Badge - Top Right */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Action Buttons - Bottom of Image on Hover */}
        <div className="absolute bottom-2 left-0 right-0 px-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex gap-1.5 justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-md"
                    onClick={() => onSupplierOptimizer?.(product.id)}
                  >
                    <Search className="h-4 w-4 text-gray-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Find Similar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    disabled={product.isImported}
                    className={`h-9 w-9 rounded-full shadow-md ${
                      product.isImported
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                    onClick={() => onImport(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {product.isImported ? 'Already Imported' : 'Import Product'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ProfitCalculator
              productPrice={product.price}
              shippingCost={shippingCost ?? product.shipping}
              productTitle={product.title}
            />
          </div>
        </div>
      </div>
      {/* Product Info */}
      <div className="pt-2 flex flex-col gap-1">
        {/* Title - 1 line */}
        <h3 className="text-sm text-foreground truncate" title={product.title}>
          {product.title}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline">
          <span className="text-xl font-bold text-[#ED383F] mr-2">${product.price.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-[#979797] line-through decoration-[#979797]">
              ${(product.price / (1 - product.discount / 100)).toFixed(2)}
            </span>
          )}
        </div>

        {/* Shipping */}
        <div className="text-xs text-muted-foreground">
          {(shippingCost !== undefined ? shippingCost : product.shipping) > 0 ? (
            <span>+${(shippingCost !== undefined ? shippingCost : product.shipping).toFixed(2)} shipping</span>
          ) : (
            <span className="text-green-600 font-medium">Free shipping</span>
          )}
        </div>

        {/* Rating | Sold Row */}
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {product.rating > 0 ? (
              <>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium">{product.rating}</span>
              </>
            ) : (
              <span>New</span>
            )}
          </div>
          <span className="mx-2 w-px h-3 bg-border"></span>
          <span>{product.orders.toLocaleString()} sold</span>
        </div>
      </div>
    </Card>
  );
}
