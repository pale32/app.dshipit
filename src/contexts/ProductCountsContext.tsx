"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

const IMPORT_LIST_STORAGE_KEY = 'dshipit_import_list';

interface ProductCounts {
  importList: number;
  myProducts: number;
}

interface ProductCountsContextType {
  counts: ProductCounts;
  hasMounted: boolean;
  updateImportListCount: (count: number) => void;
  updateMyProductsCount: (count: number) => void;
  refreshImportListCount: () => void;
}

const ProductCountsContext = createContext<ProductCountsContextType | undefined>(undefined);

// Helper function to get import list count from localStorage
function getImportListCountFromStorage(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(IMPORT_LIST_STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      return Array.isArray(items) ? items.length : 0;
    }
  } catch {
    // Ignore errors
  }
  return 0;
}

export function ProductCountsProvider({ children }: { children: ReactNode }) {
  // Initialize with 0 to avoid hydration mismatch, then load from localStorage
  const [counts, setCounts] = useState<ProductCounts>({
    importList: 0,
    myProducts: 0,
  });

  // Track if component has mounted (client-side)
  const [hasMounted, setHasMounted] = useState(false);

  // Load count from localStorage after hydration
  useEffect(() => {
    const initialCount = getImportListCountFromStorage();
    setCounts(prev => ({ ...prev, importList: initialCount }));
    setHasMounted(true);
  }, []);

  // Listen for storage events to update count in real-time (cross-tab and same-tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Handle both cross-tab events (with key) and same-tab dispatched events
      if (e.key === IMPORT_LIST_STORAGE_KEY || e.key === null) {
        const newCount = getImportListCountFromStorage();
        setCounts(prev => ({ ...prev, importList: newCount }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateImportListCount = useCallback((count: number) => {
    setCounts(prev => ({ ...prev, importList: count }));
  }, []);

  const updateMyProductsCount = useCallback((count: number) => {
    setCounts(prev => ({ ...prev, myProducts: count }));
  }, []);

  // Manual refresh function to get latest count from localStorage
  const refreshImportListCount = useCallback(() => {
    const count = getImportListCountFromStorage();
    setCounts(prev => ({ ...prev, importList: count }));
  }, []);

  return (
    <ProductCountsContext.Provider value={{
      counts,
      hasMounted,
      updateImportListCount,
      updateMyProductsCount,
      refreshImportListCount,
    }}>
      {children}
    </ProductCountsContext.Provider>
  );
}

export function useProductCounts() {
  const context = useContext(ProductCountsContext);
  if (context === undefined) {
    throw new Error('useProductCounts must be used within a ProductCountsProvider');
  }
  return context;
}