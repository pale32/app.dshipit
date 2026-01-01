"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Store types
export type StorePlatform = "shopify" | "ebay" | "woocommerce" | "amazon" | "etsy";

export interface Store {
  id: string;
  name: string;
  platform: StorePlatform;
  url?: string;
  isConnected: boolean;
  connectedAt?: string;
}

interface StoreContextType {
  stores: Store[];
  activeStore: Store | null;
  isLoading: boolean;
  setActiveStore: (store: Store) => void;
  addStore: (store: Store) => void;
  removeStore: (storeId: string) => void;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ACTIVE_STORE_KEY = "dshipit_active_store";

// Mock stores for development - replace with API call in production
const mockStores: Store[] = [
  {
    id: "store_1",
    name: "My Shopify Store",
    platform: "shopify",
    url: "mystore.myshopify.com",
    isConnected: true,
    connectedAt: "2025-12-15T10:30:00Z",
  },
  {
    id: "store_2",
    name: "eBay Business",
    platform: "ebay",
    isConnected: true,
    connectedAt: "2025-12-20T14:45:00Z",
  },
];

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStoreState] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stores and active store from storage on mount
  useEffect(() => {
    const loadStores = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/stores');
        // const data = await response.json();
        // setStores(data.stores);

        // Using mock data for now
        setStores(mockStores);

        // Restore active store from localStorage
        const savedActiveStoreId = localStorage.getItem(ACTIVE_STORE_KEY);
        if (savedActiveStoreId) {
          const savedStore = mockStores.find(s => s.id === savedActiveStoreId);
          if (savedStore) {
            setActiveStoreState(savedStore);
          } else {
            // If saved store not found, use first store
            setActiveStoreState(mockStores[0] || null);
          }
        } else {
          // Default to first store
          setActiveStoreState(mockStores[0] || null);
        }
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
        setActiveStoreState(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, []);

  // Set active store and persist to localStorage
  const setActiveStore = useCallback((store: Store) => {
    setActiveStoreState(store);
    localStorage.setItem(ACTIVE_STORE_KEY, store.id);
  }, []);

  // Add a new store
  const addStore = useCallback((store: Store) => {
    setStores(prev => {
      // Check if store already exists
      if (prev.some(s => s.id === store.id)) {
        return prev;
      }
      const updated = [...prev, store];
      // If this is the first store, set it as active
      if (updated.length === 1) {
        setActiveStore(store);
      }
      return updated;
    });
  }, [setActiveStore]);

  // Remove a store
  const removeStore = useCallback((storeId: string) => {
    setStores(prev => {
      const updated = prev.filter(s => s.id !== storeId);
      // If we removed the active store, switch to first remaining store
      if (activeStore?.id === storeId) {
        const newActive = updated[0] || null;
        if (newActive) {
          setActiveStore(newActive);
        } else {
          setActiveStoreState(null);
          localStorage.removeItem(ACTIVE_STORE_KEY);
        }
      }
      return updated;
    });
  }, [activeStore, setActiveStore]);

  // Refresh stores from API
  const refreshStores = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/stores');
      // const data = await response.json();
      // setStores(data.stores);

      // Using mock data for now
      setStores(mockStores);
    } catch (error) {
      console.error("Failed to refresh stores:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: StoreContextType = {
    stores,
    activeStore,
    isLoading,
    setActiveStore,
    addStore,
    removeStore,
    refreshStores,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use the store context
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

// Platform display info helper
export const platformInfo: Record<StorePlatform, { label: string; color: string }> = {
  shopify: { label: "Shopify", color: "bg-green-500" },
  ebay: { label: "eBay", color: "bg-blue-500" },
  woocommerce: { label: "WooCommerce", color: "bg-purple-500" },
  amazon: { label: "Amazon", color: "bg-orange-500" },
  etsy: { label: "Etsy", color: "bg-orange-400" },
};
