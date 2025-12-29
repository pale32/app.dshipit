/**
 * Storage service for Supplier Optimizer
 * Used to pass image URL from Import List to Supplier Optimizer page
 */

const STORAGE_KEY = 'dshipit_supplier_optimizer_image';

export interface SupplierOptimizerData {
  imageUrl: string;
  productId?: string;
  productName?: string;
  timestamp: number;
}

/**
 * Set the image URL for supplier optimizer search
 */
export function setSupplierOptimizerImage(data: Omit<SupplierOptimizerData, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const storageData: SupplierOptimizerData = {
    ...data,
    timestamp: Date.now(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
}

/**
 * Get the pending image URL for supplier optimizer search
 * Returns null if no image is pending or if data is stale (> 5 minutes old)
 */
export function getSupplierOptimizerImage(): SupplierOptimizerData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: SupplierOptimizerData = JSON.parse(stored);

    // Data expires after 5 minutes
    const MAX_AGE_MS = 5 * 60 * 1000;
    if (Date.now() - data.timestamp > MAX_AGE_MS) {
      clearSupplierOptimizerImage();
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Clear the pending image URL
 */
export function clearSupplierOptimizerImage(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
