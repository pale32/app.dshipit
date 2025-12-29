"use client";

// Tag structure
export interface Tag {
  id: string;
  name: string;
  productCount: number;
  productIds: string[]; // IDs of products that have this tag
  createdAt: string;
}

const STORAGE_KEY = 'dshipit_tags';

/**
 * Get all tags
 */
export function getTags(): Tag[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new tag
 */
export function addTag(name: string): Tag | null {
  if (typeof window === 'undefined') return null;
  try {
    const existing = getTags();
    // Check if tag with same name already exists (case-insensitive)
    if (existing.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      return null;
    }
    const newTag: Tag = {
      id: Date.now().toString(),
      name: name.trim(),
      productCount: 0,
      productIds: [],
      createdAt: new Date().toISOString()
    };
    const updated = [...existing, newTag];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    return newTag;
  } catch (error) {
    console.error('Failed to add tag:', error);
    return null;
  }
}

/**
 * Update a tag's name
 */
export function updateTagName(tagId: string, newName: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const existing = getTags();
    // Check if another tag with same name already exists (case-insensitive)
    if (existing.some(tag => tag.id !== tagId && tag.name.toLowerCase() === newName.toLowerCase())) {
      return false;
    }
    const updated = existing.map(tag =>
      tag.id === tagId ? { ...tag, name: newName.trim() } : tag
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    return true;
  } catch (error) {
    console.error('Failed to update tag:', error);
    return false;
  }
}

/**
 * Delete a tag
 */
export function deleteTag(tagId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTags();
    const updated = existing.filter(tag => tag.id !== tagId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (error) {
    console.error('Failed to delete tag:', error);
  }
}

/**
 * Apply tags to products
 */
export function applyTagsToProducts(tagIds: string[], productIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTags();
    const updated = existing.map(tag => {
      if (tagIds.includes(tag.id)) {
        // Add products to this tag (avoid duplicates)
        const newProductIds = [...new Set([...tag.productIds, ...productIds])];
        return {
          ...tag,
          productIds: newProductIds,
          productCount: newProductIds.length
        };
      }
      return tag;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (error) {
    console.error('Failed to apply tags to products:', error);
  }
}

/**
 * Remove tags from products
 */
export function removeTagsFromProducts(tagIds: string[], productIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTags();
    const productIdSet = new Set(productIds);
    const updated = existing.map(tag => {
      if (tagIds.includes(tag.id)) {
        const newProductIds = tag.productIds.filter(id => !productIdSet.has(id));
        return {
          ...tag,
          productIds: newProductIds,
          productCount: newProductIds.length
        };
      }
      return tag;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (error) {
    console.error('Failed to remove tags from products:', error);
  }
}

/**
 * Get tags for a specific product
 */
export function getTagsForProduct(productId: string): Tag[] {
  const tags = getTags();
  return tags.filter(tag => tag.productIds.includes(productId));
}

/**
 * Clear all tags
 */
export function clearAllTags(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}
