import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory cache for image search results
interface CacheEntry {
  data: any;
  timestamp: number;
}

const imageSearchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache for image searches
const MAX_CACHE_SIZE = 500;

function getCachedResponse(cacheKey: string): any | null {
  const entry = imageSearchCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    imageSearchCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

function setCachedResponse(cacheKey: string, data: any): void {
  if (imageSearchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = imageSearchCache.keys().next().value;
    if (firstKey) imageSearchCache.delete(firstKey);
  }

  imageSearchCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

// AliExpress Dropshipping App credentials
const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '516642';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'HeOYk0WvOImESDCI1EGarg7NXxSwXrHY';
const API_BASE_URL = 'https://api-sg.aliexpress.com/sync';

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
 * Call AliExpress API with multipart/form-data for image upload
 * The image search API requires file upload via multipart, not URL-encoded params
 */
async function callImageSearchAPI(
  accessToken: string,
  imageBuffer: Buffer,
  imageName: string,
  businessParams: Record<string, string> = {}
): Promise<any> {
  const method = 'aliexpress.ds.image.search';
  const timestamp = getTimestamp();

  // System parameters that go into signature
  const systemParams: Record<string, string> = {
    app_key: APP_KEY,
    method: method,
    sign_method: 'md5',
    timestamp: timestamp,
    format: 'json',
    v: '2.0',
    access_token: accessToken,
  };

  // Combine system + business params for signature (excluding image_file_bytes)
  const signParams: Record<string, string> = { ...systemParams, ...businessParams };
  const signature = generateSignature(signParams);

  // Build multipart form data
  const boundary = `----FormBoundary${Date.now()}`;
  const parts: string[] = [];

  // Add all system params
  for (const [key, value] of Object.entries(systemParams)) {
    parts.push(`--${boundary}`);
    parts.push(`Content-Disposition: form-data; name="${key}"`);
    parts.push('');
    parts.push(value);
  }

  // Add business params
  for (const [key, value] of Object.entries(businessParams)) {
    parts.push(`--${boundary}`);
    parts.push(`Content-Disposition: form-data; name="${key}"`);
    parts.push('');
    parts.push(value);
  }

  // Add signature
  parts.push(`--${boundary}`);
  parts.push('Content-Disposition: form-data; name="sign"');
  parts.push('');
  parts.push(signature);

  // Build the string part
  const stringPart = parts.join('\r\n') + '\r\n';

  // Build the image part header
  const imagePartHeader = `--${boundary}\r\nContent-Disposition: form-data; name="image_file_bytes"; filename="${imageName}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const imagePartFooter = `\r\n--${boundary}--\r\n`;

  // Combine all parts into a single buffer
  const stringBuffer = Buffer.from(stringPart, 'utf-8');
  const headerBuffer = Buffer.from(imagePartHeader, 'utf-8');
  const footerBuffer = Buffer.from(imagePartFooter, 'utf-8');

  const body = Buffer.concat([stringBuffer, headerBuffer, imageBuffer, footerBuffer]);

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length.toString(),
    },
    body: body,
  });

  if (!response.ok) {
    throw new Error(`AliExpress API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch image from URL and return as Buffer
 */
async function fetchImageAsBuffer(imageUrl: string): Promise<{ buffer: Buffer; filename: string }> {
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract filename from URL or use default
  const urlPath = new URL(imageUrl).pathname;
  const filename = urlPath.split('/').pop() || 'image.jpg';

  return { buffer, filename };
}

/**
 * POST /api/aliexpress/image-search
 * Search for similar products using an image URL
 */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('aliexpress_access_token')?.value
    || process.env.ALIEXPRESS_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not connected to AliExpress', requiresAuth: true },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { imageUrl, shipToCountry = 'US', shipFromCountry = 'CN' } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Generate cache key from image URL hash
    const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 16);
    const cacheKey = `img:${urlHash}:${shipToCountry}:${shipFromCountry}`;

    // Check cache first
    const cachedResult = getCachedResponse(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Fetch image as buffer for multipart upload
    let imageBuffer: Buffer;
    let imageName: string;
    try {
      const imageData = await fetchImageAsBuffer(imageUrl);
      imageBuffer = imageData.buffer;
      imageName = imageData.filename;
    } catch (imgError) {
      return NextResponse.json(
        { error: 'Failed to fetch image from URL' },
        { status: 400 }
      );
    }

    // Call AliExpress image search API with multipart/form-data
    // API requires: image_file_bytes (file upload), shpt_to (mandatory), target_currency, target_language
    const businessParams: Record<string, string> = {
      shpt_to: shipToCountry,
      target_currency: 'USD',
      target_language: 'EN',
    };

    const response = await callImageSearchAPI(
      accessToken,
      imageBuffer,
      imageName,
      businessParams
    );

    // Check for error response
    if (response.error_response) {
      if (process.env.NODE_ENV === 'development') {
        console.error('AliExpress Image Search API error:', response.error_response);
      }
      return NextResponse.json(
        { error: response.error_response.msg || 'Image search failed', code: response.error_response.code },
        { status: 400 }
      );
    }

    // Parse response - structure: aliexpress_ds_image_search_response.data.products.traffic_image_product_d_t_o
    const searchResponse = response.aliexpress_ds_image_search_response;
    const data = searchResponse?.data;
    // API returns products under traffic_image_product_d_t_o key
    const productList = data?.products?.traffic_image_product_d_t_o;

    if (productList && Array.isArray(productList)) {
      const products = productList.map((item: any) => {
        // Parse prices - API returns target_sale_price and target_original_price in USD
        const salePrice = parseFloat(item.target_sale_price) || parseFloat(item.sale_price) || 0;
        const originalPrice = parseFloat(item.target_original_price) || parseFloat(item.original_price) || salePrice;

        // Parse discount - API returns as "82%" string or calculate from prices
        let discount = 0;
        if (item.discount) {
          discount = parseInt(item.discount.replace('%', '')) || 0;
        } else if (originalPrice > salePrice) {
          discount = Math.round((1 - salePrice / originalPrice) * 100);
        }

        // Parse rating - API returns as "96.0%" string
        let rating = 0;
        if (item.evaluate_rate) {
          rating = parseFloat(item.evaluate_rate.replace('%', '')) / 20 || 0; // Convert to 5-star scale
        }

        // Parse orders - lastest_volume is a string like "43"
        const ordersCount = parseInt(item.lastest_volume) || 0;

        return {
          product_id: item.product_id?.toString() || '',
          product_title: item.product_title || 'Untitled Product',
          product_main_image_url: item.product_main_image_url || '',
          target_sale_price: salePrice.toFixed(2),
          target_original_price: originalPrice.toFixed(2),
          discount: discount.toString(),
          evaluate_rate: rating.toFixed(1),
          orders_count: ordersCount,
          product_detail_url: item.product_detail_url || `https://www.aliexpress.com/item/${item.product_id}.html`,
          supplier: 'AliExpress',
          shop_url: item.shop_url || '',
          seller_id: item.seller_id?.toString() || '',
        };
      });

      const result = {
        products,
        totalCount: data?.total_record_count || products.length,
        sourceImageUrl: imageUrl,
      };

      // Cache the successful response
      setCachedResponse(cacheKey, result);

      return NextResponse.json(result, {
        headers: { 'X-Cache': 'MISS' },
      });
    }

    return NextResponse.json({ products: [], totalCount: 0, sourceImageUrl: imageUrl });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Image Search API error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to search by image' },
      { status: 500 }
    );
  }
}
