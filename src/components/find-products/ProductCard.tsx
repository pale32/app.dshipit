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
    <Card className="border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 p-0 group relative rounded-lg bg-white dark:bg-card">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
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
            className="h-5 w-5 bg-white/90 backdrop-blur-sm border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white rounded"
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
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex gap-2 justify-center">
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

      {/* Product Info - flex column with distributed spacing */}
      <div className="p-2 flex flex-col">
        {/* Title - 2 lines like AliExpress */}
        <h3
          className="text-sm text-foreground line-clamp-2 leading-snug min-h-[2.5em]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-base font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              ${(product.price / (1 - product.discount / 100)).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stats Row - sold count left, rating right */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>{product.orders.toLocaleString()}+ sold</span>
          <div className="flex items-center gap-0.5">
            {product.rating > 0 ? (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </>
            ) : (
              <span>New</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
