"use client";

import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { format } from "date-fns";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  Calendar,
  BarChart3,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Sample data for today's analytics
const todayData = {
  totalOrders: 142,
  totalOrdersChange: 12.5, // +12.5% from yesterday
  grossRevenue: 24567.89,
  grossRevenueChange: 8.3, // +8.3% from yesterday
  totalCosts: 12834.56,
  netProfitChange: -2.1, // -2.1% from yesterday
  storeBreakdown: [
    {
      name: "Shopify Store",
      orders: 89,
      revenue: 15234.56,
      costs: 8200.32,
      profit: 7034.24,
    },
    {
      name: "eBay Store",
      orders: 53,
      revenue: 9333.33,
      costs: 4634.24,
      profit: 4699.09,
    },
  ],
};

// Sample historical data for date range analytics
const getHistoricalData = (dateRange: any) => {
  if (!dateRange?.from || !dateRange?.to) return null;

  // Mock data based on date range - in real app, this would come from API
  const daysDiff =
    Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    totalOrders: daysDiff * 95,
    totalOrdersChange: 8.7,
    grossRevenue: daysDiff * 18450.33,
    grossRevenueChange: 12.4,
    totalCosts: daysDiff * 9234.78,
    netProfitChange: 15.2,
    storeBreakdown: [
      {
        name: "Shopify Store",
        orders: daysDiff * 58,
        revenue: daysDiff * 11290.45,
        costs: daysDiff * 5623.12,
        profit: daysDiff * 5667.33,
      },
      {
        name: "eBay Store",
        orders: daysDiff * 37,
        revenue: daysDiff * 7159.88,
        costs: daysDiff * 3611.66,
        profit: daysDiff * 3548.22,
      },
    ],
  };
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const totalProfit = useMemo(() => 
    todayData.grossRevenue - todayData.totalCosts, []
  );
  
  const _profitMargin = useMemo(() => 
    ((totalProfit / todayData.grossRevenue) * 100).toFixed(1), [totalProfit]
  );

  const historicalData = useMemo(() => 
    getHistoricalData(dateRange), [dateRange]
  );
  
  const historicalTotalProfit = useMemo(() => 
    historicalData ? historicalData.grossRevenue - historicalData.totalCosts : 0, 
    [historicalData]
  );

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  // Helper function to get trend icon and color
  const getTrendDisplay = (change: number) => {
    if (change > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        text: `+${change}%`,
      };
    } else if (change < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        text: `${change}%`,
      };
    } else {
      return {
        icon: Minus,
        color: "text-gray-500",
        text: "0%",
      };
    }
  };

  return (
    <div className="h-full w-full px-8 py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center space-x-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-6 w-6" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="m2 17 10 5 10-5"></path>
                <path d="m2 12 10 5 10-5"></path>
              </svg>
            </div>
            <h1 className="text-foreground text-4xl font-medium">Supplier Optimizer</h1>
          </div>
          <p className="text-muted-foreground">
            You can find similar products by uploading an image or entering the product URL link, <a href="#" className="text-primary hover:underline">click here</a> to learn more.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="mb-0 bg-background py-1 pb-4 border-0">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-end w-[550px] h-12" ref={searchRef}>
                  {!isSearchExpanded ? (
                    <Button
                      variant="ghost"
                      onClick={() => setIsSearchExpanded(true)}
                      className="flex items-center gap-2 px-3 bg-transparent hover:bg-gray-100 rounded-lg transition-colors text-lg font-light h-12"
                    >
                      <Search className="h-8 w-8" />
                      <span>Search Product</span>
                    </Button>
                  ) : (
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm pr-1 h-12">
                      <Input 
                        placeholder="Search for the same products by using a product link or an image link."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none min-w-[400px] focus-visible:ring-0 rounded-none h-12"
                      />
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded transition-colors" 
                          title="Upload image to find similar products"
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80zM512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160 160 71.6 160 160-71.6 160-160 160zm-96-160a96 96 0 1 0 192 0 96 96 0 1 0-192 0z"></path>
                          </svg>
                        </button>
                        <Button 
                          onClick={() => {
                            console.log('Searching for:', searchQuery);
                          }}
                        >
                          OK
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="-mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Search for quality suppliers
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-base">
                  1. Enter the URL you want in the search box or use an image.
                </p>
                <p className="text-base">
                  2. In the search results, you can choose a better supplier according to your needs.
                </p>
                <p className="text-sm italic">
                  We are adjusting the Supplier Optimizer feature and some data may be incorrect. 
                  We are working hard to fix it. Thank you for your understanding and patience.
                </p>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <img 
                  alt="Supplier Optimizer Empty State" 
                  width="400" 
                  height="300" 
                  decoding="async" 
                  data-nimg="1" 
                  className="w-full h-auto object-contain" 
                  srcSet="/_next/image?url=%2Fsupplier_optimizer_empty.webp&w=640&q=75 1x, /_next/image?url=%2Fsupplier_optimizer_empty.webp&w=828&q=75 2x" 
                  src="/_next/image?url=%2Fsupplier_optimizer_empty.webp&w=828&q=75" 
                  style={{color: 'transparent'}}
                />
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
