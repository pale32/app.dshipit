"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { IncrementButton } from "@/components/ui/increment-button";

interface ProductFiltersSheetProps {
  deliveryTime: string;
  onDeliveryTimeChange: (value: string) => void;
  minPrice: number;
  onMinPriceChange: (value: number) => void;
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
  children?: React.ReactNode; // For custom trigger
}

/**
 * Product filters sheet with delivery time and price range filters
 * Slides in from the right side
 */
export function ProductFiltersSheet({
  deliveryTime,
  onDeliveryTimeChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  children,
}: ProductFiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <button className="p-0 border-0 bg-transparent hover:bg-transparent">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg" className="text-dsi-gray-600">
              <path d="M10 14L4 5V3H20V5L14 14V20L10 22V14Z"></path>
            </svg>
            <span className="sr-only">Filter products</span>
          </button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] max-w-[400px] min-w-[400px] px-4 py-4">
        <SheetHeader className="space-y-2 pb-4 w-full">
          <SheetTitle className="text-2xl font-semibold text-left w-full">Filter Products</SheetTitle>
          <SheetDescription className="text-sm text-left text-foreground w-full">
            Refine your product search with these filters.
          </SheetDescription>
        </SheetHeader>
        <Accordion type="multiple" className="w-full px-5">
          <AccordionItem value="delivery-time" className="border-0 py-2">
            <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
              Delivery Time
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
              <div className="space-y-4">
                <RadioGroup value={deliveryTime} onValueChange={onDeliveryTimeChange} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="3-days" id="3-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                    <Label htmlFor="3-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                      Within 3 Days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="5-days" id="5-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                    <Label htmlFor="5-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                      Within 5 Days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="7-days" id="7-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                    <Label htmlFor="7-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                      Within 7 Days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="10-days" id="10-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                    <Label htmlFor="10-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                      Within 10 Days
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
          <div className="h-[1px] bg-border w-full"></div>
          <AccordionItem value="purchase-price" className="border-0 py-2">
            <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
              Purchase Price
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
              <div className="space-y-4">
                <div className="flex items-start justify-between py-1 px-1">
                  <IncrementButton
                    value={minPrice}
                    onChange={onMinPriceChange}
                    label="Lowest Price"
                    symbol="$"
                    symbolPosition="left"
                    showDecimals={true}
                    decimalPlaces={2}
                    min={0}
                    max={999999}
                    step={1}
                    width="w-[130px]"
                    className="text-base"
                    showLabel={true}
                    showSymbol={true}
                  />

                  {/* Horizontal Line */}
                  <div className="h-[1px] w-[14px] bg-gray-700 dark:bg-gray-400 mx-2 mt-5"></div>

                  <IncrementButton
                    value={maxPrice}
                    onChange={onMaxPriceChange}
                    label="Highest Price"
                    symbol="$"
                    symbolPosition="left"
                    showDecimals={true}
                    decimalPlaces={2}
                    min={minPrice}
                    max={999999}
                    step={1}
                    width="w-[130px]"
                    className="text-base"
                    showLabel={true}
                    showSymbol={true}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SheetContent>
    </Sheet>
  );
}
