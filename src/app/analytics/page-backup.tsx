"use client";

import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  Calendar,
  BarChart3,
} from "lucide-react";

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
              <BarChart3 className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-foreground text-4xl font-medium">Today's Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Track your daily orders, gross revenue, and profit from your stores
          </p>
        </div>

        {/* Main Metrics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Total Orders */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            <div className="relative flex items-center space-x-3 px-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold tracking-tight text-black dark:text-white">
                    {todayData.totalOrders}
                  </p>
                  {(() => {
                    const trend = getTrendDisplay(todayData.totalOrdersChange);
                    const Icon = trend.icon;
                    return (
                      <div className={`flex items-center space-x-1 ${trend.color}`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-semibold">{trend.text}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </Card>

          {/* Total Sales */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
            <div className="relative flex items-center space-x-3 px-4">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Sales</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold tracking-tight text-black dark:text-white">
                    ${todayData.grossRevenue.toLocaleString()}
                  </p>
                  {(() => {
                    const trend = getTrendDisplay(todayData.grossRevenueChange);
                    const Icon = trend.icon;
                    return (
                      <div className={`flex items-center space-x-1 ${trend.color}`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-semibold">{trend.text}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </Card>

          {/* Net Profit */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
            <div className="relative flex items-center space-x-3 px-4">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Net Profit</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold tracking-tight text-black dark:text-white">
                    ${totalProfit.toLocaleString()}
                  </p>
                  {(() => {
                    const trend = getTrendDisplay(todayData.netProfitChange);
                    const Icon = trend.icon;
                    return (
                      <div className={`flex items-center space-x-1 ${trend.color}`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-semibold">{trend.text}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Store Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {todayData.storeBreakdown.map((store, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-500/5 via-slate-500/2 to-transparent transition-all duration-200 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/3 to-transparent" />
              <div className="relative px-6 py-1">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`rounded-lg p-2 ${index === 0 ? "bg-green-500/10" : "bg-blue-500/10"}`}
                    >
                      <Store
                        className={`h-4 w-4 ${index === 0 ? "text-green-600" : "text-blue-600"}`}
                      />
                    </div>
                    <div className="text-base font-semibold">{store.name}</div>
                  </div>
                  <div className="text-muted-foreground text-xs">Today</div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="rounded-lg p-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">Orders Today</p>
                      <p className="text-lg font-bold text-black dark:text-white">{store.orders}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="rounded-lg p-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Revenue Today
                      </p>
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${(store.revenue / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="rounded-lg p-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">Costs Today</p>
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${(store.costs / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="rounded-lg p-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">Profit Today</p>
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${(store.profit / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:from-slate-800 dark:to-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm font-medium">
                      Today's Profit Margin
                    </span>
                    <span className="text-sm font-bold text-black dark:text-white">
                      {((store.profit / store.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Date Range Analytics Section */}
        <div className="mt-12 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Calendar className="text-primary h-6 w-6" />
              </div>
              <h2 className="text-foreground text-2xl font-semibold">Date Range Analytics</h2>
            </div>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder="Select date range"
            />
          </div>

          {!historicalData ? (
            <Card className="border-dashed bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center dark:from-slate-800 dark:to-slate-700">
              <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-medium">Select Date Range</h3>
              <p className="text-muted-foreground">
                Choose a date range above to view historical analytics and performance metrics
              </p>
            </Card>
          ) : (
            <>
              {/* Historical Main Metrics Cards */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Historical Total Orders */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                  <div className="relative flex items-center space-x-3 px-4">
                    <div className="rounded-lg bg-orange-500/10 p-2">
                      <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold tracking-tight text-black dark:text-white">
                          {historicalData.totalOrders}
                        </p>
                        {(() => {
                          const trend = getTrendDisplay(historicalData.totalOrdersChange);
                          const Icon = trend.icon;
                          return (
                            <div className={`flex items-center space-x-1 ${trend.color}`}>
                              <Icon className="h-3 w-3" />
                              <span className="text-xs font-semibold">{trend.text}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Historical Total Sales */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                  <div className="relative flex items-center space-x-3 px-4">
                    <div className="rounded-lg bg-cyan-500/10 p-2">
                      <DollarSign className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total Sales</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold tracking-tight text-black dark:text-white">
                          ${historicalData.grossRevenue.toLocaleString()}
                        </p>
                        {(() => {
                          const trend = getTrendDisplay(historicalData.grossRevenueChange);
                          const Icon = trend.icon;
                          return (
                            <div className={`flex items-center space-x-1 ${trend.color}`}>
                              <Icon className="h-3 w-3" />
                              <span className="text-xs font-semibold">{trend.text}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Historical Net Profit */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent" />
                  <div className="relative flex items-center space-x-3 px-4">
                    <div className="rounded-lg bg-pink-500/10 p-2">
                      <TrendingUp className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Net Profit</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold tracking-tight text-black dark:text-white">
                          ${historicalTotalProfit.toLocaleString()}
                        </p>
                        {(() => {
                          const trend = getTrendDisplay(historicalData.netProfitChange);
                          const Icon = trend.icon;
                          return (
                            <div className={`flex items-center space-x-1 ${trend.color}`}>
                              <Icon className="h-3 w-3" />
                              <span className="text-xs font-semibold">{trend.text}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Historical Store Breakdown */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {historicalData.storeBreakdown.map((store, index) => (
                  <Card
                    key={index}
                    className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-500/5 via-slate-500/2 to-transparent transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/3 to-transparent" />
                    <div className="relative px-6 py-1">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`rounded-lg p-2 ${index === 0 ? "bg-green-500/10" : "bg-blue-500/10"}`}
                          >
                            <Store
                              className={`h-4 w-4 ${index === 0 ? "text-green-600" : "text-blue-600"}`}
                            />
                          </div>
                          <div className="text-base font-semibold">{store.name}</div>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {dateRange?.from && dateRange?.to && (
                            <span>
                              {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="rounded-lg p-3">
                            <p className="text-muted-foreground mb-1 text-xs font-medium">Orders</p>
                            <p className="text-lg font-bold text-black dark:text-white">
                              {store.orders}
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="rounded-lg p-3">
                            <p className="text-muted-foreground mb-1 text-xs font-medium">
                              Revenue
                            </p>
                            <p className="text-lg font-bold text-black dark:text-white">
                              ${(store.revenue / 1000).toFixed(0)}k
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="rounded-lg p-3">
                            <p className="text-muted-foreground mb-1 text-xs font-medium">Costs</p>
                            <p className="text-lg font-bold text-black dark:text-white">
                              ${(store.costs / 1000).toFixed(0)}k
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="rounded-lg p-3">
                            <p className="text-muted-foreground mb-1 text-xs font-medium">Profit</p>
                            <p className="text-lg font-bold text-black dark:text-white">
                              ${(store.profit / 1000).toFixed(0)}k
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:from-slate-800 dark:to-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            Profit Margin
                          </span>
                          <span className="text-sm font-bold text-black dark:text-white">
                            {((store.profit / store.revenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
