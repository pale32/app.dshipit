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
} from "lucide-react";

interface TopNavigationProps {
  onMobileMenuToggle?: () => void;
}

// Mock profit data - in production this would come from context/API
const profitData = {
  todayProfit: 342.50,
  percentChange: 12.5,
  isUp: true,
};

export function TopNavigation({ onMobileMenuToggle }: TopNavigationProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
    <nav className="bg-background border-border fixed top-0 z-50 h-16 w-full border-b shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="h-9 w-9 p-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
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
              width={140}
              height={37}
              className="h-8 w-auto sm:h-9"
              priority
            />
          </button>
        </div>

        {/* Center Section - Profit Ticker (Hidden on mobile) */}
        <div className="hidden items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 md:flex">
          <span className="text-xs text-muted-foreground">Today&apos;s Profit</span>
          <span className="text-lg font-semibold text-foreground">
            ${profitData.todayProfit.toFixed(2)}
          </span>
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              profitData.isUp ? "text-green-600" : "text-red-500"
            }`}
          >
            {profitData.isUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{profitData.percentChange}%</span>
          </div>
        </div>

        {/* Right Section - Help + Settings + Theme + Notifications + User */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/support")}
            className="h-9 w-9 p-0 hover:bg-muted"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-border" />

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="h-9 w-9 p-0 hover:bg-muted"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-border" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 hover:bg-muted"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications Popover */}
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

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 px-2 hover:bg-muted sm:px-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
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
