// Find Products page types
// Extracted for modular architecture and reusability

/**
 * Product displayed in the Find Products search results
 * Transformed from AliExpressProduct for consistent UI rendering
 */
export interface DisplayProduct {
  id: string;
  title: string;
  price: number;
  endPrice: number;
  discount: number;
  orders: number;
  shipping: number;
  freeShipping?: boolean;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  productUrl: string;
  isImported?: boolean;
  shipFrom?: string;
  storeName?: string;
  deliveryDays?: string;
}

/**
 * Filter state for product search
 */
export interface ProductFilterState {
  minPrice: number;
  maxPrice: number;
  deliveryTime: string;
  shipToCountry: string;
  shipFromCountry: string;
  sortBy: SortOption;
  category: string | null;
}

/**
 * Sort options for product listing
 */
export type SortOption =
  | 'Default'
  | 'Price: Low to High'
  | 'Price: High to Low'
  | 'Orders: High to Low'
  | 'Newest';

/**
 * Supplier/vendor tabs available in Find Products
 */
export type SupplierTab = 'aliexpress' | 'temu' | 'alibaba' | 'cj';

/**
 * Supplier authentication status for connected accounts
 */
export interface SupplierAuthStatus {
  name: string;
  connected: boolean;
  icon: string;
}

/**
 * Pagination state for product listings
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  productsPerPage: number;
  hasMore: boolean;
}

/**
 * Product selection state for bulk actions
 */
export interface SelectionState {
  selectedProductIds: string[];
  selectedCount: number;
  isAllSelected: boolean;
}

/**
 * Shipping cost lookup result
 */
export interface ShippingCostResult {
  productId: string;
  cost: number;
  deliveryDays?: string;
  shippingMethod?: string;
}

/**
 * Country option for ship to/from dropdowns
 */
export interface CountryOption {
  code: string;
  name: string;
  flag?: string;
}

/**
 * Search state for the main search functionality
 */
export interface SearchState {
  query: string;
  currentSearchTerm: string;
  isSearching: boolean;
}

/**
 * Loading states for various async operations
 */
export interface LoadingStates {
  isLoadingProducts: boolean;
  isLoadingMore: boolean;
  isLoadingShipping: boolean;
  isDetectingLocation: boolean;
}

/**
 * Error state for product fetch operations
 */
export interface ProductFetchError {
  message: string;
  code?: string;
  requiresAuth?: boolean;
}
