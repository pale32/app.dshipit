"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useStore } from "@/contexts/StoreContext";

export interface DashboardStats {
  revenue: { value: number; change: number; isUp: boolean };
  profit: { value: number; change: number; isUp: boolean };
  orders: { value: number; change: number; isUp: boolean };
  pending: { value: number; isUrgent: boolean };
}

interface CachedStats {
  data: DashboardStats;
  timestamp: number;
  storeId: string;
}

interface DashboardStatsContextType {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRevalidating: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  lastUpdated: Date | null;
}

const DashboardStatsContext = createContext<DashboardStatsContextType | undefined>(undefined);

// Cache configuration
const CACHE_KEY = "dshipit_stats_cache";
const STALE_TIME = 30000; // 30 seconds - data considered fresh
const CACHE_TIME = 300000; // 5 minutes - max cache lifetime
const REVALIDATE_INTERVAL = 60000; // 60 seconds - background refresh

// Mock stats generator - in production, replace with actual API call
function generateMockStatsForStore(storeId: string): DashboardStats {
  // Generate consistent but different stats based on store ID
  const seed = storeId.charCodeAt(storeId.length - 1);
  const multiplier = (seed % 5) + 1;

  return {
    revenue: {
      value: 847.50 + (multiplier * 200),
      change: 5.2 + (multiplier * 1.5),
      isUp: multiplier % 2 === 0,
    },
    profit: {
      value: 242.30 + (multiplier * 50),
      change: 8.7 + (multiplier * 2),
      isUp: true,
    },
    orders: {
      value: 12 + (multiplier * 5),
      change: multiplier > 2 ? 3.5 : -2.1,
      isUp: multiplier > 2,
    },
    pending: {
      value: 3 + multiplier,
      isUrgent: multiplier > 3,
    },
  };
}

// Cache helpers
function getCachedStats(storeId: string): CachedStats | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedStats = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;

    // Return null if cache is expired or for different store
    if (age > CACHE_TIME || parsed.storeId !== storeId) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function setCachedStats(storeId: string, data: DashboardStats): void {
  if (typeof window === "undefined") return;
  try {
    const cached: CachedStats = {
      data,
      timestamp: Date.now(),
      storeId,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore storage errors
  }
}

function isCacheStale(cached: CachedStats): boolean {
  return Date.now() - cached.timestamp > STALE_TIME;
}

interface DashboardStatsProviderProps {
  children: ReactNode;
}

export function DashboardStatsProvider({ children }: DashboardStatsProviderProps) {
  const { activeStore } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track in-flight requests to prevent duplicates
  const fetchingRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Core fetch function with retry logic
  const fetchStatsFromAPI = useCallback(async (storeId: string): Promise<DashboardStats> => {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/stores/${storeId}/stats`);
    // if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // return response.json();

    // Simulate API delay (remove when using real API)
    await new Promise(resolve => setTimeout(resolve, 200));
    return generateMockStatsForStore(storeId);
  }, []);

  // Fetch with stale-while-revalidate pattern
  const fetchStats = useCallback(async (storeId: string, options?: { forceRefresh?: boolean }) => {
    // Prevent duplicate requests
    if (fetchingRef.current === storeId && !options?.forceRefresh) return;

    const cached = getCachedStats(storeId);

    // If we have fresh cache, use it immediately
    if (cached && !isCacheStale(cached) && !options?.forceRefresh) {
      setStats(cached.data);
      setLastUpdated(new Date(cached.timestamp));
      setIsLoading(false);
      setError(null);
      return;
    }

    // If we have stale cache, show it while revalidating
    if (cached && !options?.forceRefresh) {
      setStats(cached.data);
      setLastUpdated(new Date(cached.timestamp));
      setIsLoading(false);
      setIsRevalidating(true);
    } else {
      setIsLoading(true);
    }

    setError(null);
    fetchingRef.current = storeId;

    try {
      const freshData = await fetchStatsFromAPI(storeId);

      if (!mountedRef.current) return;

      setCachedStats(storeId, freshData);
      setStats(freshData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;

      console.error("Failed to fetch dashboard stats:", err);

      // On error, keep showing stale data if available
      if (!cached) {
        setError("Failed to load stats");
        setStats(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRevalidating(false);
        fetchingRef.current = null;
      }
    }
  }, [fetchStatsFromAPI]);

  // Mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch stats when active store changes
  useEffect(() => {
    if (activeStore?.id) {
      fetchStats(activeStore.id);
    } else {
      setStats(null);
      setIsLoading(false);
      setLastUpdated(null);
    }
  }, [activeStore?.id, fetchStats]);

  // Background revalidation interval
  useEffect(() => {
    if (!activeStore?.id) return;

    const interval = setInterval(() => {
      // Only revalidate if tab is visible
      if (document.visibilityState === "visible") {
        fetchStats(activeStore.id);
      }
    }, REVALIDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [activeStore?.id, fetchStats]);

  // Revalidate when tab becomes visible (if data is stale)
  useEffect(() => {
    if (!activeStore?.id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const cached = getCachedStats(activeStore.id);
        if (!cached || isCacheStale(cached)) {
          fetchStats(activeStore.id);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeStore?.id, fetchStats]);

  const refreshStats = useCallback(async () => {
    if (activeStore?.id) {
      await fetchStats(activeStore.id, { forceRefresh: true });
    }
  }, [activeStore?.id, fetchStats]);

  const value: DashboardStatsContextType = {
    stats,
    isLoading,
    isRevalidating,
    error,
    refreshStats,
    lastUpdated,
  };

  return (
    <DashboardStatsContext.Provider value={value}>
      {children}
    </DashboardStatsContext.Provider>
  );
}

export function useDashboardStats() {
  const context = useContext(DashboardStatsContext);
  if (context === undefined) {
    throw new Error("useDashboardStats must be used within a DashboardStatsProvider");
  }
  return context;
}
