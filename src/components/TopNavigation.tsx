"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Sun,
  Moon,
  Globe,
  Sparkles,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  CreditCard,
  Menu,
} from "lucide-react";

interface TopNavigationProps {
  onMobileMenuToggle?: () => void;
}

export function TopNavigation({ onMobileMenuToggle }: TopNavigationProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focus the input when expanding
      setTimeout(() => {
        const searchInput = document.getElementById("search-input");
        searchInput?.focus();
      }, 100);
    }
  };

  const notifications = [
    { id: 1, title: "New shipment arrived", time: "2 min ago", unread: true },
    { id: 2, title: "Delivery completed", time: "1 hour ago", unread: true },
    { id: 3, title: "Payment processed", time: "3 hours ago", unread: false },
  ];

  const whatsNewItems = [
    {
      title: "Enhanced Tracking System",
      description: "Real-time GPS tracking for all shipments",
      isNew: true,
    },
    {
      title: "Mobile App Update",
      description: "New features and improved performance",
      isNew: true,
    },
    {
      title: "API v2.0 Released",
      description: "Faster and more reliable integration",
      isNew: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-background border-border fixed top-0 z-50 h-16 w-full border-b shadow-md">
      <div className="relative flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center">
          {/* Mobile Menu Button - Right next to logo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="mr-2 h-8 w-8 p-0  md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <button
            onClick={() => router.push('/')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image
              src="/dsilogo.webp"
              alt="DShipIt Logo"
              width={140}
              height={37}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </button>
        </div>

        {/* Expandable Search Bar */}
        {isSearchExpanded && (
          <div className="absolute left-1/2 z-10 w-[90vw] -translate-x-1/2 transform sm:w-[32rem]">
            <div className="relative rounded-xl bg-background shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)]">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                id="search-input"
                type="search"
                placeholder="Search shipments, orders, customers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-12 py-4 pr-12 pl-12 text-base rounded-xl border-0 focus-visible:ring-0 shadow-none"
                onBlur={() => {
                  if (!searchQuery) {
                    setIsSearchExpanded(false);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Escape") {
                    setIsSearchExpanded(false);
                    setSearchQuery("");
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 rounded-md hover:bg-muted"
                onClick={() => {
                  setIsSearchExpanded(false);
                  setSearchQuery("");
                }}
              >
                <span className="text-muted-foreground text-sm">✕</span>
              </Button>
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSearch}
            className="h-8 w-8 p-0 hover:bg-muted sm:h-10 sm:w-10"
          >
            <Search
              className={`h-5 w-5 sm:h-6 sm:w-6 ${isSearchExpanded ? "text-primary" : ""}`}
            />
            <span className="sr-only">Search</span>
          </Button>

          {/* Divider - Hidden on mobile */}
          <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />

          {/* Language Dropdown - Hidden on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden h-10 w-10 p-0 hover:bg-muted sm:flex"
              >
                <Globe className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇪🇸</span>
                Español
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇫🇷</span>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇩🇪</span>
                Deutsch
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇨🇳</span>
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider - Hidden on mobile */}
          <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />

          {/* Whats New Popover - Hidden on mobile */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative hidden h-10 w-10 p-0 hover:bg-muted sm:flex"
              >
                <Sparkles className="h-5 w-5" />
                <span className="sr-only">What&apos;s new</span>
                <Badge className="absolute -top-1 -right-1 h-2 w-2 bg-[var(--dsi-orange)] p-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">What&apos;s New at DShipIt</h4>
                  <p className="text-muted-foreground text-sm">Latest updates and features</p>
                </div>
                <div className="space-y-3">
                  {whatsNewItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{item.title}</p>
                          {item.isNew && (
                            <Badge className="bg-[var(--dsi-orange)] text-xs text-white">New</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" size="sm" variant="outline">
                  View All Updates
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider - Hidden on mobile */}
          <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0 hover:bg-muted sm:h-10 sm:w-10"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-[var(--dsi-red)] text-xs text-white sm:h-5 sm:w-5">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">Notifications</h4>
                  <p className="text-muted-foreground text-sm">
                    You have {unreadCount} unread notifications
                  </p>
                </div>
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div key={notification.id} className="flex items-start space-x-3">
                      <div
                        className={`mt-2 h-2 w-2 rounded-full ${
                          notification.unread ? "bg-[var(--dsi-orange)]" : "bg-muted"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-muted-foreground text-xs">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
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

          {/* Divider - Hidden on mobile */}
          <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />

          {/* Theme Toggle - Hidden on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hidden h-10 w-10 p-0 hover:bg-muted sm:flex"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Divider - Hidden on mobile */}
          <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-600" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted sm:h-10 sm:w-10"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-muted-foreground text-xs">john.doe@dshipit.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
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
