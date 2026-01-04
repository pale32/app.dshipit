"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  CreditCard,
  Menu,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Plus,
  Check,
  Package,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useStore, platformInfo } from "@/contexts/StoreContext";
import { useDashboardStats } from "@/contexts/DashboardStatsContext";

interface TopNavigationProps {
  onMobileMenuToggle?: () => void;
}

export function TopNavigation({ onMobileMenuToggle }: TopNavigationProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { stores, activeStore, setActiveStore, isLoading } = useStore();
  const { stats, isLoading: statsLoading } = useDashboardStats();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const notifications = [
    { id: 1, title: "New order received", time: "2 min ago", unread: true },
    { id: 2, title: "Shipment delivered", time: "1 hour ago", unread: true },
    { id: 3, title: "Payment processed", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-background fixed top-0 z-50 h-16 w-full border-b-0 md:border-b md:border-border shadow-none md:shadow-sm">
      <div className="flex h-full items-center justify-between px-2 sm:px-6">
        {/* Left Section - Hamburger + Logo (fixed) */}
        <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
          {/* Mobile Only: Menu Button (left side) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="h-9 w-9 p-0 sm:hidden"
          >
            <Menu style={{ width: 22, height: 22, strokeWidth: 1.2 }} />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image
              src="/dsilogo.webp"
              alt="DShipIt Logo"
              width={80}
              height={21}
              className="w-[90px] sm:w-[120px]"
              priority
            />
          </button>
        </div>

        {/* Middle Section - Store Switcher + Revenue (share available space) */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-1 min-w-0 px-2">
          {/* Store Switcher */}
          {!isLoading && stores.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex h-7 sm:h-9 gap-1 sm:gap-2 border-border bg-background px-1.5 sm:px-3 hover:bg-muted flex-shrink min-w-0"
                >
                  {activeStore && (
                    <>
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${platformInfo[activeStore.platform].color}`}
                      />
                      <span className="truncate text-xs sm:text-sm font-medium">
                        {activeStore.name.replace(/^My\s+/i, '').replace(/\s+Store$/i, '')}
                      </span>
                    </>
                  )}
                  <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Switch Store
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {stores.map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    className="cursor-pointer gap-3"
                    onClick={() => setActiveStore(store)}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${platformInfo[store.platform].color}`}
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{store.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {platformInfo[store.platform].label}
                      </span>
                    </div>
                    {activeStore?.id === store.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-primary"
                  onClick={() => router.push("/settings/stores")}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Store</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Revenue - always show fully */}
          {!statsLoading && stats && (
            <div className="flex sm:hidden items-center flex-shrink-0">
              <div className="flex flex-col items-start px-1 py-0.5 rounded-md hover:bg-muted/50 cursor-pointer leading-tight" onClick={() => router.push("/analytics")}>
                <span className="text-[9px] uppercase tracking-wide text-green-600 font-medium">Revenue</span>
                <span className="text-xs font-semibold whitespace-nowrap -mt-0.5">${stats.revenue.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Only: Center Section - Stats Ticker */}
        <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {statsLoading || !stats ? (
            <div className="flex items-center gap-6 px-3 py-1.5">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Revenue */}
              <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push("/analytics")}>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">${stats.revenue.value.toLocaleString()}</span>
                    <span className={`flex items-center text-[10px] font-medium ${stats.revenue.isUp ? "text-green-600" : "text-red-500"}`}>
                      {stats.revenue.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stats.revenue.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              {/* Profit */}
              <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push("/analytics")}>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Profit</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-green-600">${stats.profit.value.toLocaleString()}</span>
                    <span className={`flex items-center text-[10px] font-medium ${stats.profit.isUp ? "text-green-600" : "text-red-500"}`}>
                      {stats.profit.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stats.profit.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              {/* Orders Today */}
              <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push("/orders")}>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Orders</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{stats.orders.value}</span>
                    <span className={`flex items-center text-[10px] font-medium ${stats.orders.isUp ? "text-green-600" : "text-red-500"}`}>
                      {stats.orders.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stats.orders.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              {/* Pending Shipments */}
              <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push("/orders?status=pending")}>
                <Package className={`h-4 w-4 ${stats.pending.isUrgent ? "text-amber-500" : "text-muted-foreground"}`} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Pending</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-semibold ${stats.pending.isUrgent ? "text-amber-500" : ""}`}>{stats.pending.value}</span>
                    {stats.pending.isUrgent && <AlertCircle className="h-3 w-3 text-amber-500" />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Desktop Only: Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/support")}
            className="hidden h-9 w-9 p-0 hover:bg-muted sm:flex"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>

          {/* Desktop Only: Vertical Divider */}
          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* Desktop Only: Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="hidden h-9 w-9 p-0 hover:bg-muted sm:flex"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* Desktop Only: Vertical Divider */}
          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* Desktop Only: Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hidden h-9 w-9 p-0 hover:bg-muted sm:flex"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications Popover - Always visible */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 hover:bg-muted"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-destructive p-0 text-[10px] text-white">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 rounded-lg p-2 transition-colors ${
                        notification.unread ? "bg-muted/50" : ""
                      }`}
                    >
                      <div
                        className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                          notification.unread ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" variant="outline">
                    Mark All Read
                  </Button>
                  <Button className="flex-1" size="sm" variant="outline">
                    View All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Desktop Only: User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden h-9 gap-2 px-2 hover:bg-muted sm:flex sm:px-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john.doe@dshipit.com</p>
                  <Badge variant="secondary" className="mt-1 w-fit text-xs">
                    Pro Plan
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}
