import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory cache for search results (scales with serverless instances)
// For 1M+ users, consider Redis/Memcached in production
interface CacheEntry {
  data: any;
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const MAX_CACHE_SIZE = 1000; // Limit cache entries to prevent memory issues

/**
 * Get cached response or null if expired/missing
 */
function getCachedResponse(cacheKey: string): any | null {
  const entry = searchCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    searchCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

/**
 * Store response in cache with LRU-style eviction
 */
function setCachedResponse(cacheKey: string, data: any): void {
  // Evict oldest entries if cache is full
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }

  searchCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Generate cache key from search parameters
 */
function generateCacheKey(params: Record<string, string | null>): string {
  const normalized = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `search:${normalized}`;
}

// AliExpress Dropshipping App credentials
const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '516642';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'HeOYk0WvOImESDCI1EGarg7NXxSwXrHY';
const API_BASE_URL = 'https://api-sg.aliexpress.com/sync';

/**
 * Generate MD5 signature for AliExpress API
 */
function generateSignature(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  const bookendString = APP_SECRET + signString + APP_SECRET;
  const hash = crypto.createHash('md5').update(bookendString, 'utf8').digest('hex');
  return hash.toUpperCase();
}

/**
 * Get current timestamp in AliExpress format
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Call AliExpress Dropshipping API
 */
async function callDropshippingAPI(
  method: string,
  accessToken: string,
  businessParams: Record<string, any> = {}
): Promise<any> {
  const systemParams: Record<string, string> = {
    app_key: APP_KEY,
    method: method,
    sign_method: 'md5',
    timestamp: getTimestamp(),
    format: 'json',
    v: '2.0',
    access_token: accessToken,
  };

  const allParams: Record<string, string> = { ...systemParams };
  for (const [key, value] of Object.entries(businessParams)) {
    if (value !== undefined && value !== null && value !== '') {
      allParams[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
  }

  allParams.sign = generateSignature(allParams);

  const queryString = new URLSearchParams(allParams).toString();
  const url = `${API_BASE_URL}?${queryString}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(`AliExpress API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/aliexpress/search
 * Search for products using Dropshipping API
 */
export async function GET(request: NextRequest) {
  // Try cookies first, then fall back to environment variable
  const accessToken = request.cookies.get('aliexpress_access_token')?.value
    || process.env.ALIEXPRESS_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not connected to AliExpress', requiresAuth: true },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword') || 'trending';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const sort = searchParams.get('sort') || 'LAST_VOLUME_DESC';
  const shipToCountry = searchParams.get('shipToCountry') || 'US';
  const shipFromCountry = searchParams.get('shipFromCountry');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  // Generate cache key for this search
  const cacheKey = generateCacheKey({
    keyword,
    page: page.toString(),
    pageSize: pageSize.toString(),
    sort,
    shipToCountry,
    shipFromCountry,
    minPrice,
    maxPrice,
  });

  // Check cache first - prevents redundant API calls for same searches
  const cachedResult = getCachedResponse(cacheKey);
  if (cachedResult) {
    return NextResponse.json(cachedResult, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=300', // Browser cache 5 min
      },
    });
  }

  try {
    // Use aliexpress.ds.text.search for Dropshipping API
    const params: Record<string, any> = {
      keyWord: keyword,
      pageIndex: page,
      pageSize: Math.min(pageSize, 50),
      currency: 'USD',
      local: 'en_US',
      countryCode: shipToCountry,
      sort: sort,
    };

    if (shipFromCountry && shipFromCountry !== 'ALL') {
      params.ship_from_country = shipFromCountry;
    }

    // Add price filters if provided (AliExpress API supports min/max price)
    if (minPrice && parseFloat(minPrice) > 0) {
      params.minPrice = minPrice;
    }
    if (maxPrice && parseFloat(maxPrice) > 0) {
      params.maxPrice = maxPrice;
    }

    const response = await callDropshippingAPI(
      'aliexpress.ds.text.search',
      accessToken,
      params
    );

    // Check for error response
    if (response.error_response) {
      if (process.env.NODE_ENV === 'development') {
        console.error('AliExpress API error:', response.error_response);
      }
      return NextResponse.json(
        { error: response.error_response.msg || 'API error', code: response.error_response.code },
        { status: 400 }
      );
    }

    // Parse response - structure: aliexpress_ds_text_search_response.data.products.selection_search_product
    const searchResponse = response.aliexpress_ds_text_search_response;
    const data = searchResponse?.data;
    const productList = data?.products?.selection_search_product;

    if (productList && Array.isArray(productList)) {
      // Debug: log first product to see field names
      if (productList[0]) {
        console.log('AliExpress product fields:', Object.keys(productList[0]));
        console.log('Sample product:', JSON.stringify(productList[0], null, 2));
      }
      const unfilteredCount = productList.length;

      // Filter and map products - include products with 3+ star rating OR no rating (new products)
      const products = productList
        .filter((item: any) => {
          const score = item.score;
          // Include if: no score (new product), or score >= 3.0
          if (score === undefined || score === null || score === '') {
            return true; // Include products without ratings
          }
          const rating = parseFloat(score) || 0;
          return rating >= 3.0;
        })
        .map((item: any) => {
          const salePrice = parseFloat(item.targetSalePrice) || parseFloat(item.salePrice) || 0;
          const originalPrice = parseFloat(item.targetOriginalPrice) || parseFloat(item.originalPrice) || salePrice;
          const discountStr = item.discount?.replace('%', '') || '0';
          const discount = parseInt(discountStr, 10) || 0;

          // Parse orders/volume count - AliExpress uses 'volume' field for sales count
          const ordersRaw = item.volume || item.orders || item.tradeCount || item.saleCount || '0';
          const ordersStr = String(ordersRaw).replace(/[^0-9]/g, '') || '0';
          const ordersCount = parseInt(ordersStr, 10) || 0;

          // Rating: score is like "4.7"
          const rating = parseFloat(item.score) || 0;

          // Parse small images if available (may come as string, array, or object with string property)
          let smallImages: string[] = [];
          if (item.itemSmallPics) {
            if (typeof item.itemSmallPics === 'string') {
              // Single image as string
              smallImages = [item.itemSmallPics];
            } else if (Array.isArray(item.itemSmallPics)) {
              smallImages = item.itemSmallPics;
            } else if (item.itemSmallPics.string) {
              // AliExpress sometimes wraps arrays in { string: [...] }
              smallImages = Array.isArray(item.itemSmallPics.string)
                ? item.itemSmallPics.string
                : [item.itemSmallPics.string];
            }
          }

          return {
            product_id: item.itemId?.toString() || '',
            product_title: item.title || 'Untitled Product',
            product_main_image_url: item.itemMainPic || '',
            product_small_image_urls: smallImages,
            target_sale_price: salePrice.toString(),
            target_sale_price_currency: 'USD',
            target_original_price: originalPrice.toString(),
            target_original_price_currency: 'USD',
            discount: discount.toString(),
            evaluate_rate: rating.toString(),
            orders_count: ordersCount,
            ship_to_days: '',
            product_detail_url: item.itemUrl ? `https:${item.itemUrl}` : `https://www.aliexpress.com/item/${item.itemId}.html`,
            freeShipping: false,
            shippingCost: -1,
            shipFrom: '',
            storeName: '',
            maxPrice: salePrice,
          };
        });

      // Sort products by the requested order
      if (sort === 'LAST_VOLUME_DESC') {
        products.sort((a: any, b: any) => b.orders_count - a.orders_count);
      } else if (sort === 'SALE_PRICE_ASC') {
        products.sort((a: any, b: any) => parseFloat(a.target_sale_price) - parseFloat(b.target_sale_price));
      } else if (sort === 'SALE_PRICE_DESC') {
        products.sort((a: any, b: any) => parseFloat(b.target_sale_price) - parseFloat(a.target_sale_price));
      }

      // If API returned fewer products than requested, we've reached the end
      const apiTotalCount = data?.totalCount || 0;
      const hasMoreFromApi = unfilteredCount >= pageSize;

      const result = {
        products,
        totalCount: apiTotalCount,
        hasMore: hasMoreFromApi && products.length > 0,
        returnedCount: products.length,
      };

      // Cache the successful response
      setCachedResponse(cacheKey, result);

      return NextResponse.json(result, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const emptyResult = { products: [], totalCount: 0 };
    setCachedResponse(cacheKey, emptyResult);
    return NextResponse.json(emptyResult);

  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Search API error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
