"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Category types for different filter behaviors
type CategoryType = "ship_from" | "product";

interface Category {
  label: string;
  image: string;
  type: CategoryType;
  value: string; // Country code for ship_from, keyword for product
}

interface CategorySliderProps {
  selectedCategory: string | null;
  onCategorySelect: (category: Category | null) => void;
  categories?: Category[];
}

// Default AliExpress categories - mix of shipping locations and product types
const DEFAULT_CATEGORIES: Category[] = [
  // Ship From categories
  { label: "Ship from USA", image: "/shipFromUSAAliexpress.png", type: "ship_from", value: "US" },
  { label: "Ship from UK", image: "/shipFromUKAliexpress.png", type: "ship_from", value: "GB" },
  { label: "Ship from FR", image: "/shipFromFRAliexpress.png", type: "ship_from", value: "FR" },
  { label: "Ship from DE", image: "/shipFromDEAliexpress.png", type: "ship_from", value: "DE" },
  { label: "Ship from AU", image: "/shipFromAUAliexpress.png", type: "ship_from", value: "AU" },
  { label: "Ship from BR", image: "/shipFromPRAliexpress.png", type: "ship_from", value: "BR" },
  // Product categories
  { label: "Coats", image: "/CoatsAliexpress.png", type: "product", value: "coat jacket" },
  { label: "Dresses", image: "/DressesAliexpress.png", type: "product", value: "dress" },
  { label: "Sunglasses", image: "/sunglassesAliexpress.png", type: "product", value: "sunglasses" },
  { label: "Make Up", image: "/makeUpAliexpress.png", type: "product", value: "makeup cosmetics" },
];

/**
 * Horizontal scrolling category slider
 * Filters products by ship_from country or product keyword
 */
export function CategorySlider({
  selectedCategory,
  onCategorySelect,
  categories = DEFAULT_CATEGORIES,
}: CategorySliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (selectedCategory === category.label) {
      // Deselect if clicking the same category
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <div className="relative group/slider">
      {/* Left Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity"
        onClick={scrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center flex-shrink-0">
            <div
              className="group relative cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="h-[100px] w-[100px] overflow-hidden rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-[289px] will-change-transform">
                <Image
                  src={category.image}
                  alt={category.label}
                  width={289}
                  height={100}
                  className="h-full w-full object-cover object-left transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
                  priority={index < 5}
                />
              </div>

              {/* Selection Indicator */}
              {selectedCategory === category.label && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2" />
              )}
            </div>

            {/* Label */}
            <span className="mt-2 text-sm font-medium text-center whitespace-nowrap">
              {category.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity"
        onClick={scrollRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Export category type for use in parent components
export type { Category, CategoryType };
export { DEFAULT_CATEGORIES };
