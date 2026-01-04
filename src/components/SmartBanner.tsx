"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, Gift, Zap, Clock, Trophy, Percent, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UpgradePlanDialog } from "@/components/UpgradePlanDialog";

type UpgradePlanDialogFeature = "orders" | "products" | "analytics" | "automation" | "suppliers" | "support";

// Banner types for different promotional contexts
type BannerType = "promo" | "announcement" | "reward" | "urgency" | "info";

interface BannerConfig {
  id: string;
  type: BannerType;
  headline: string;
  subtext?: string;
  value?: string; // e.g., "$5,000", "50%", "14 days"
  valueLabel?: string; // e.g., "worth", "off", "free"
  ctaText: string;
  ctaLink: string;
  secondaryCta?: {
    text: string;
    link: string;
  };
  icon: keyof typeof iconMap;
  theme: keyof typeof themeMap;
  startDate: string;
  endDate: string;
  showCountdown: boolean;
  dismissible: boolean;
  termsText?: string;
  priority: number; // Higher = shows first when multiple active
}

const iconMap = {
  sparkles: Sparkles,
  gift: Gift,
  zap: Zap,
  clock: Clock,
  trophy: Trophy,
  percent: Percent,
  info: Info,
};

const themeMap = {
  purple: {
    bg: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600",
    text: "text-white",
    accent: "bg-white/20",
    cta: "bg-indigo-900 text-white hover:bg-indigo-950 border border-white/20",
    secondaryCta: "bg-white/20 border-white/40 text-white hover:bg-white/30",
  },
  emerald: {
    bg: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600",
    text: "text-white",
    accent: "bg-white/20",
    cta: "bg-emerald-900 text-white hover:bg-emerald-950 border border-white/20",
    secondaryCta: "bg-white/20 border-white/40 text-white hover:bg-white/30",
  },
  amber: {
    bg: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500",
    text: "text-white",
    accent: "bg-white/20",
    cta: "bg-amber-900 text-white hover:bg-amber-950 border border-white/20",
    secondaryCta: "bg-white/20 border-white/40 text-white hover:bg-white/30",
  },
  dark: {
    bg: "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900",
    text: "text-white",
    accent: "bg-white/10",
    cta: "bg-gray-700 text-white hover:bg-gray-600 border border-white/20",
    secondaryCta: "bg-white/15 border-white/30 text-white hover:bg-white/25",
  },
  blue: {
    bg: "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600",
    text: "text-white",
    accent: "bg-white/20",
    cta: "bg-blue-900 text-white hover:bg-blue-950 border border-white/20",
    secondaryCta: "bg-white/20 border-white/40 text-white hover:bg-white/30",
  },
  rose: {
    bg: "bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600",
    text: "text-white",
    accent: "bg-white/20",
    cta: "bg-rose-900 text-white hover:bg-rose-950 border border-white/20",
    secondaryCta: "bg-white/20 border-white/40 text-white hover:bg-white/30",
  },
};

// Configure active promotions - easily editable for year-round campaigns
const bannerConfigs: BannerConfig[] = [
  // 2026 Campaigns
  {
    id: "new-year-2026",
    type: "promo",
    headline: "New Year, New Business!",
    subtext: "Launch your dropshipping empire with our best deal ever",
    value: "30%",
    valueLabel: "off first 3 months",
    ctaText: "Claim Offer",
    ctaLink: "/pricing",
    secondaryCta: {
      text: "Learn More",
      link: "/features",
    },
    icon: "sparkles",
    theme: "purple",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    showCountdown: true,
    dismissible: false,
    termsText: "Valid for new accounts only. Cannot be combined with other offers.",
    priority: 100,
  },
  {
    id: "free-trial-2026",
    type: "announcement",
    headline: "Start Free, Scale Fast",
    subtext: "No credit card required",
    value: "14",
    valueLabel: "days free trial",
    ctaText: "Start Now",
    ctaLink: "/signup",
    icon: "zap",
    theme: "emerald",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    showCountdown: false,
    dismissible: true,
    priority: 10, // Lower priority - shows if no other active promos
  },
  {
    id: "valentines-2026",
    type: "promo",
    headline: "Love Your Profits",
    subtext: "Valentine's Day Special",
    value: "25%",
    valueLabel: "off annual plans",
    ctaText: "Get Deal",
    ctaLink: "/pricing",
    icon: "gift",
    theme: "rose",
    startDate: "2026-02-10",
    endDate: "2026-02-16",
    showCountdown: true,
    dismissible: true,
    termsText: "Annual plans only. Offer ends Feb 16.",
    priority: 90,
  },
  {
    id: "spring-sale-2026",
    type: "promo",
    headline: "Spring into Savings",
    subtext: "Limited time offer",
    value: "20%",
    valueLabel: "off all plans",
    ctaText: "Shop Now",
    ctaLink: "/pricing",
    icon: "percent",
    theme: "emerald",
    startDate: "2026-03-20",
    endDate: "2026-04-05",
    showCountdown: true,
    dismissible: true,
    priority: 80,
  },
  {
    id: "summer-giveaway-2026",
    type: "reward",
    headline: "Win Big This Summer!",
    subtext: "Weekly prizes worth $1,000 each",
    value: "$5,000",
    valueLabel: "in prizes",
    ctaText: "Enter Now",
    ctaLink: "/giveaway",
    secondaryCta: {
      text: "See Rules",
      link: "/giveaway/rules",
    },
    icon: "trophy",
    theme: "amber",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    showCountdown: false,
    dismissible: true,
    termsText: "No purchase necessary. See rules for details.",
    priority: 95,
  },
  {
    id: "black-friday-2026",
    type: "urgency",
    headline: "Black Friday Mega Sale",
    subtext: "Our biggest discount ever",
    value: "50%",
    valueLabel: "off everything",
    ctaText: "Shop Now",
    ctaLink: "/pricing",
    icon: "zap",
    theme: "dark",
    startDate: "2026-11-27",
    endDate: "2026-11-30",
    showCountdown: true,
    dismissible: false, // Important sale - don't allow dismiss
    termsText: "Limited time only. While supplies last.",
    priority: 100,
  },
  {
    id: "cyber-monday-2026",
    type: "urgency",
    headline: "Cyber Monday Extended",
    subtext: "Last chance for 50% off",
    value: "24h",
    valueLabel: "left",
    ctaText: "Don't Miss Out",
    ctaLink: "/pricing",
    icon: "clock",
    theme: "blue",
    startDate: "2026-11-30",
    endDate: "2026-12-01",
    showCountdown: true,
    dismissible: false,
    priority: 100,
  },
  {
    id: "holiday-2026",
    type: "promo",
    headline: "Holiday Season Special",
    subtext: "Gift yourself success",
    value: "40%",
    valueLabel: "off annual plans",
    ctaText: "Unwrap Deal",
    ctaLink: "/pricing",
    icon: "gift",
    theme: "rose",
    startDate: "2026-12-15",
    endDate: "2026-12-31",
    showCountdown: true,
    dismissible: true,
    priority: 85,
  },
];

function getActiveBanner(): BannerConfig | null {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Filter active banners and sort by priority
  const activeBanners = bannerConfigs
    .filter(banner => banner.startDate <= today && today <= banner.endDate)
    .sort((a, b) => b.priority - a.priority);

  return activeBanners[0] || null;
}

function calculateTimeRemaining(endDate: string): { days: number; hours: number; minutes: number } | null {
  const end = new Date(endDate + "T23:59:59");
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

export function SmartBanner() {
  const [activeBanner, setActiveBanner] = useState<BannerConfig | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  // Update countdown every minute
  const updateCountdown = useCallback(() => {
    if (activeBanner?.showCountdown) {
      setTimeRemaining(calculateTimeRemaining(activeBanner.endDate));
    }
  }, [activeBanner]);

  useEffect(() => {
    const banner = getActiveBanner();
    if (banner) {
      const dismissedBanners = sessionStorage.getItem("dismissedBanners");
      const dismissed = dismissedBanners ? JSON.parse(dismissedBanners) : [];
      if (!dismissed.includes(banner.id)) {
        setActiveBanner(banner);
        if (banner.showCountdown) {
          setTimeRemaining(calculateTimeRemaining(banner.endDate));
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!activeBanner?.showCountdown) return;

    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeBanner, updateCountdown]);

  const handleDismiss = () => {
    if (activeBanner) {
      const dismissedBanners = sessionStorage.getItem("dismissedBanners");
      const dismissed = dismissedBanners ? JSON.parse(dismissedBanners) : [];
      dismissed.push(activeBanner.id);
      sessionStorage.setItem("dismissedBanners", JSON.stringify(dismissed));
    }
    setIsDismissed(true);
  };

  if (!activeBanner || isDismissed) {
    return null;
  }

  const theme = themeMap[activeBanner.theme];
  const IconComponent = iconMap[activeBanner.icon];

  return (
    <>
    {/* Spacer to push content down when banner is visible */}
    <div className="h-10 sm:h-11" />
    <div className={`fixed top-16 z-40 w-full ${theme.bg}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1.5 sm:gap-4 sm:px-4 sm:py-2">
        {/* Left: Icon + Message (single row) */}
        <div className="flex flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          {/* Animated Icon */}
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${theme.accent} sm:h-8 sm:w-8`}>
            <IconComponent className={`h-3 w-3 animate-pulse sm:h-4 sm:w-4 ${theme.text}`} />
          </div>

          {/* Message - single line */}
          <div className="flex items-center gap-2 overflow-hidden sm:gap-3">
            <span className={`truncate text-sm font-semibold ${theme.text}`}>
              {activeBanner.headline}
            </span>
            {activeBanner.subtext && (
              <span className={`hidden text-sm opacity-90 md:inline ${theme.text}`}>
                — {activeBanner.subtext}
              </span>
            )}
            {/* Value Badge */}
            {activeBanner.value && (
              <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold sm:inline-flex ${theme.accent} ${theme.text}`}>
                {activeBanner.value}
                {activeBanner.valueLabel && (
                  <span className="font-medium opacity-90">{activeBanner.valueLabel}</span>
                )}
              </span>
            )}
            {/* Countdown Timer */}
            {activeBanner.showCountdown && timeRemaining && (
              <div className={`hidden items-center gap-1 text-xs lg:flex ${theme.text}`}>
                <Clock className="h-3 w-3" />
                <span className="font-medium">
                  {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                  {timeRemaining.hours}h {timeRemaining.minutes}m
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: CTAs + Dismiss */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Secondary CTA */}
          {activeBanner.secondaryCta && (
            <Button
              size="sm"
              variant="outline"
              className={`hidden h-8 border px-3 text-xs font-medium sm:inline-flex ${theme.secondaryCta}`}
              onClick={() => window.location.href = activeBanner.secondaryCta!.link}
            >
              {activeBanner.secondaryCta.text}
            </Button>
          )}

          {/* Primary CTA */}
          <Button
            size="sm"
            className={`h-7 gap-1 px-3 text-xs font-semibold shadow-md transition-transform hover:scale-105 sm:h-8 sm:gap-1.5 sm:px-4 ${theme.cta}`}
            onClick={() => setIsUpgradeDialogOpen(true)}
          >
            {activeBanner.ctaText}
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>

          {/* Terms Info */}
          {activeBanner.termsText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className={`hidden h-6 w-6 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 sm:flex ${theme.accent} ${theme.text}`}>
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  {activeBanner.termsText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Dismiss Button */}
          {activeBanner.dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className={`h-6 w-6 p-0 opacity-70 transition-opacity hover:opacity-100 ${theme.text} hover:bg-white/10`}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </div>
      </div>
    </div>

    {/* Upgrade Plan Dialog */}
    <UpgradePlanDialog
      isOpen={isUpgradeDialogOpen}
      onClose={() => setIsUpgradeDialogOpen(false)}
      feature="orders"
    />
    </>
  );
}
