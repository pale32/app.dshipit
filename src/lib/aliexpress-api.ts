// AliExpress API Integration via Official Dropshipping API
// Uses internal API route: /api/aliexpress/search

export interface AliExpressProduct {
  product_id: string;
  product_title: string;
  product_main_image_url: string;
  product_small_image_urls?: string[];
  target_sale_price: string;
  target_sale_price_currency: string;
  target_original_price: string;
  target_original_price_currency: string;
  discount: string;
  evaluate_rate: string;
  orders_count: number;
  ship_to_days: string;
  lastest_volume?: number;
  product_detail_url: string;
  // Extended fields
  freeShipping?: boolean;
  shippingCost?: number;
  shipFrom?: string;
  storeName?: string;
  maxPrice?: number;
}

/**
 * Map UI sort options to official AliExpress API sort values
 * Available sorts: SALE_PRICE_ASC, SALE_PRICE_DESC, LAST_VOLUME_DESC
 */
function mapSortToApiSort(sortBy: string): string {
  const sortMap: Record<string, string> = {
    'default': 'LAST_VOLUME_DESC', // Default to popular products for variety
    'price_asc': 'SALE_PRICE_ASC',
    'price_desc': 'SALE_PRICE_DESC',
    'orders_desc': 'LAST_VOLUME_DESC',
    'newest': 'LAST_VOLUME_DESC', // Show popular products as there's no "newest" sort
  };
  return sortMap[sortBy] || 'LAST_VOLUME_DESC';
}

/**
 * Search for products on AliExpress using official Dropshipping API
 * @param keywords - Search keywords
 * @param page - Page number (default 1)
 * @param pageSize - Number of products per page (default 20, max 50)
 * @param sortBy - Sort option: default, price_asc, price_desc, orders_desc
 * @param shipToCountry - Country code for shipping (e.g., 'US', 'GB')
 * @param shipFromCountry - Country code for ship from (e.g., 'CN', 'US')
 * @param minPrice - Minimum price filter
 * @param maxPrice - Maximum price filter
 */
export async function searchProducts(
  keywords: string,
  page: number = 1,
  pageSize: number = 20,
  sortBy: string = 'default',
  shipToCountry: string = 'US',
  shipFromCountry?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<{ products: AliExpressProduct[]; totalCount: number; hasMore: boolean }> {
  try {
    // Build query params for the internal API route
    const params = new URLSearchParams({
      keyword: keywords,
      page: page.toString(),
      pageSize: Math.min(pageSize, 50).toString(),
      sort: mapSortToApiSort(sortBy),
      shipToCountry: shipToCountry,
    });

    if (shipFromCountry && shipFromCountry !== 'ALL') {
      params.append('shipFromCountry', shipFromCountry);
    }

    // Add price filters if provided
    if (minPrice && minPrice > 0) {
      params.append('minPrice', minPrice.toString());
    }
    if (maxPrice && maxPrice > 0) {
      params.append('maxPrice', maxPrice.toString());
    }

    // Call internal API route which handles the official AliExpress API
    const response = await fetch(`/api/aliexpress/search?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AliExpress API error:', errorData);

      // If auth is required, we still return empty to avoid breaking the UI
      if (errorData.requiresAuth) {
        console.warn('AliExpress authentication required. Please connect your account.');
      }

      return { products: [], totalCount: 0, hasMore: false };
    }

    const data = await response.json();

    if (data.products && Array.isArray(data.products)) {
      return {
        products: data.products,
        totalCount: data.totalCount || 0,
        hasMore: data.hasMore !== undefined ? data.hasMore : data.products.length > 0,
      };
    }

    return { products: [], totalCount: 0, hasMore: false };
  } catch (error) {
    console.error('Error fetching products from AliExpress:', error);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

/**
 * Get shipping cost for a product using official Dropshipping API
 * @param productId - AliExpress product ID
 * @param shipToCountry - Country code (e.g., 'US', 'GB')
 * @param quantity - Quantity of items (default 1)
 */
export async function getShippingCost(
  productId: string,
  shipToCountry: string = 'US',
  quantity: number = 1
): Promise<{ shippingCost: number; deliveryDays: string; shippingMethod: string } | null> {
  try {
    // Build query params for the internal shipping API route
    const params = new URLSearchParams({
      productId,
      shipToCountry,
      quantity: quantity.toString(),
    });

    const response = await fetch(`/api/aliexpress/shipping?${params.toString()}`);

    if (!response.ok) {
      console.error('Shipping API error:', await response.text());
      return null;
    }

    const data = await response.json();

    // The shipping route returns: shippingCost, freeShipping, deliveryDays, shippingMethod
    if (data.shippingCost !== undefined && data.shippingCost !== -1) {
      return {
        shippingCost: data.freeShipping ? 0 : data.shippingCost,
        deliveryDays: data.deliveryDays || '',
        shippingMethod: data.shippingMethod || 'Standard',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching shipping cost:', error);
    return null;
  }
}

/**
 * Get hot/trending products from AliExpress
 * @param categoryId - Optional category ID
 * @param page - Page number
 * @param pageSize - Number of products
 */
export async function getHotProducts(
  categoryId?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ products: AliExpressProduct[]; totalCount: number }> {
  // Use search with popular keywords for hot products, sorted by volume
  return searchProducts('trending bestseller', page, pageSize, 'orders_desc');
}

/**
 * Get similar products by product ID
 * Note: Official API doesn't have a direct similar products endpoint,
 * so we search using the product title keywords
 * @param productId - AliExpress product ID
 */
export async function getSimilarProducts(productId: string): Promise<AliExpressProduct[]> {
  try {
    // For similar products, we'd need to first get the product details,
    // then search for similar items. For now, return empty array
    // as the official API doesn't have a direct similar products endpoint.
    console.warn('Similar products feature not available with official API');
    return [];
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }
}

/**
 * Transform AliExpress product to display format matching the existing UI
 */
export function transformProductForDisplay(product: AliExpressProduct) {
  const salePrice = parseFloat(product.target_sale_price) || 0;
  const originalPrice = parseFloat(product.target_original_price) || salePrice;
  // Use original price as endPrice for showing discount (crossed out price)
  const endPrice = originalPrice > salePrice ? originalPrice : salePrice;
  const discount = originalPrice > 0 ? Math.round((1 - salePrice / originalPrice) * 100) : 0;

  // Determine shipping value:
  // - 0 = free shipping
  // - positive number = actual shipping cost
  // - -1 = shipping cost not available
  let shippingValue: number;
  if (product.freeShipping) {
    shippingValue = 0;
  } else if (product.shippingCost !== undefined && product.shippingCost >= 0) {
    shippingValue = product.shippingCost;
  } else {
    shippingValue = -1; // Not available
  }

  // Collect all images: main image + small images array
  const allImages: string[] = [product.product_main_image_url];
  if (product.product_small_image_urls && product.product_small_image_urls.length > 0) {
    // Add small images, avoiding duplicates
    product.product_small_image_urls.forEach(img => {
      if (!allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  return {
    id: product.product_id,
    title: product.product_title,
    price: salePrice,
    endPrice: endPrice,
    discount: discount > 0 ? discount : parseInt(product.discount) || 0,
    orders: product.orders_count || product.lastest_volume || 0,
    shipping: shippingValue,
    freeShipping: product.freeShipping || false,
    rating: parseFloat(product.evaluate_rate) || 0,
    reviews: 0, // Not available in search results
    image: product.product_main_image_url,
    images: allImages,
    productUrl: product.product_detail_url,
    isImported: false,
    // Extended data from API
    shipFrom: product.shipFrom || '',
    storeName: product.storeName || '',
    deliveryDays: product.ship_to_days || '',
  };
}

/**
 * Get full product details including all images
 * @param productId - AliExpress product ID
 * @param shipToCountry - Country code (e.g., 'US', 'GB')
 * @returns Full product details with all images
 */
export async function getProductDetails(
  productId: string,
  shipToCountry: string = 'US'
): Promise<{ images: string[]; title?: string; description?: string } | null> {
  try {
    const params = new URLSearchParams({
      productId,
      shipToCountry,
    });

    const response = await fetch(`/api/aliexpress/product?${params.toString()}`);

    if (!response.ok) {
      console.error('Product details API error:', await response.text());
      return null;
    }

    const data = await response.json();

    if (data.images && Array.isArray(data.images)) {
      return {
        images: data.images,
        title: data.title,
        description: data.description,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}

/**
 * Category IDs for common dropshipping categories
 */
export const ALIEXPRESS_CATEGORIES = {
  electronics: '44',
  fashion: '3',
  homeGarden: '15',
  beauty: '66',
  sports: '18',
  toys: '26',
  jewelry: '36',
  automotive: '34',
  pets: '100007522',
  babyKids: '1501',
};
