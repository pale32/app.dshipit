"use client";

// Import list item structure (matches import-list page structure)
export interface ImportListItem {
  id: string;
  name: string;
  supplier: string;
  supplierLogo: string;
  price: string;
  originalPrice: string;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[]; // Array of all product images for editing
  category: string;
  addedDate: string;
  status: string;
  stock: number;
  minOrder: number;
  weight: { value: number; unit: string };
  dimensions: { length: number; width: number; height: number; unit: string };
  productUrl?: string;
  shippingCost?: number;
  description?: string; // Product description for editing
  variants?: Array<{
    id: string;
    sku: string;
    option: string;
    price: number;
    compareAtPrice: number;
    stock: number;
    image?: string;
  }>;
}

const STORAGE_KEY = 'dshipit_import_list';

/**
 * Get all items from the import list
 */
export function getImportList(): ImportListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add items to the import list
 */
export function addToImportList(items: ImportListItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getImportList();
    const existingIds = new Set(existing.map(item => item.id));
    // Only add items that aren't already in the list
    const newItems = items.filter(item => !existingIds.has(item.id));
    const updated = [...existing, ...newItems];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch storage event for other tabs/components
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (error) {
    console.error('Failed to save to import list:', error);
  }
}

/**
 * Remove items from the import list
 */
export function removeFromImportList(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getImportList();
    const idsToRemove = new Set(ids);
    const updated = existing.filter(item => !idsToRemove.has(item.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (error) {
    console.error('Failed to remove from import list:', error);
  }
}

/**
 * Check if a product is already in the import list
 */
export function isInImportList(productId: string): boolean {
  const list = getImportList();
  return list.some(item => item.id === productId);
}

/**
 * Update a single item in the import list
 */
export function updateImportListItem(updatedItem: ImportListItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getImportList();
    const updatedList = existing.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (error) {
    console.error('Failed to update import list item:', error);
  }
}

/**
 * Clear the entire import list
 */
export function clearImportList(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}
