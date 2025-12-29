import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
 * GET /api/aliexpress/shipping
 * Get shipping cost for a product using Dropshipping API
 *
 * Query params:
 * - productId: AliExpress product ID (required)
 * - shipToCountry: Country code e.g. "US" (default: US)
 * - quantity: Number of items (default: 1)
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
  const productId = searchParams.get('productId');
  const shipToCountry = searchParams.get('shipToCountry') || 'US';
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);

  if (!productId) {
    return NextResponse.json(
      { error: 'productId is required' },
      { status: 400 }
    );
  }

  try {
    // First, get the product details to get a valid SKU ID
    const productResponse = await callDropshippingAPI(
      'aliexpress.ds.product.get',
      accessToken,
      {
        product_id: productId,
        ship_to_country: shipToCountry,
        target_currency: 'USD',
        target_language: 'EN',
      }
    );

    // Get SKU ID from product details - note the key uses underscores: ae_item_sku_info_d_t_o
    const productResult = productResponse.aliexpress_ds_product_get_response?.result;
    const skuList = productResult?.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || [];
    const firstSku = skuList[0];
    const skuId = firstSku?.sku_id || '';

    console.log('Product SKU info:', { productId, skuId, skuListLength: skuList.length });

    if (!skuId) {
      console.log('No SKU found for product, cannot get shipping');
      return NextResponse.json({
        shippingCost: -1,
        freeShipping: false,
        deliveryDays: '',
        shippingMethod: '',
        allOptions: [],
      });
    }

    // Call freight query with correct parameter format - queryDeliveryReq as JSON with camelCase params
    const queryDeliveryReq = {
      productId: productId,
      shipToCountry: shipToCountry,
      quantity: quantity,
      locale: 'en_US',
      currency: 'USD',
      language: 'EN',
      selectedSkuId: skuId,
    };

    const response = await callDropshippingAPI(
      'aliexpress.ds.freight.query',
      accessToken,
      { queryDeliveryReq: JSON.stringify(queryDeliveryReq) }
    );

    console.log('Freight query response:', JSON.stringify(response, null, 2));

    // Parse response - new structure uses delivery_options.delivery_option_d_t_o
    const result = response.aliexpress_ds_freight_query_response?.result;

    if (result?.delivery_options?.delivery_option_d_t_o) {
      const deliveryOptions = result.delivery_options.delivery_option_d_t_o;

      // Sort by price to get cheapest option first
      const sortedOptions = deliveryOptions.sort((a: any, b: any) => {
        const priceA = parseFloat(a.shipping_fee_cent || '999');
        const priceB = parseFloat(b.shipping_fee_cent || '999');
        return priceA - priceB;
      });

      const cheapestOption = sortedOptions[0];
      const shippingCost = parseFloat(cheapestOption.shipping_fee_cent || '0');

      // Check if free shipping
      const isFreeShipping = cheapestOption.free_shipping === true || shippingCost === 0;

      return NextResponse.json({
        shippingCost: isFreeShipping ? 0 : shippingCost,
        freeShipping: isFreeShipping,
        deliveryDays: cheapestOption.delivery_date_desc || `${cheapestOption.min_delivery_days}-${cheapestOption.max_delivery_days} days`,
        shippingMethod: cheapestOption.company || 'Standard Shipping',
        allOptions: sortedOptions.map((opt: any) => ({
          serviceName: opt.company || 'Shipping',
          cost: parseFloat(opt.shipping_fee_cent || '0'),
          deliveryDays: opt.delivery_date_desc || `${opt.min_delivery_days}-${opt.max_delivery_days} days`,
          trackingAvailable: opt.tracking === true,
        })),
      });
    }

    // No shipping info available
    return NextResponse.json({
      shippingCost: -1,
      freeShipping: false,
      deliveryDays: '',
      shippingMethod: '',
      allOptions: [],
    });

  } catch (error) {
    console.error('Shipping API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping info', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aliexpress/shipping/batch
 * Get shipping costs for multiple products at once
 */
export async function POST(request: NextRequest) {
  // Try cookies first, then fall back to environment variable
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
    const { productIds, shipToCountry = 'US', quantity = 1 } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'productIds array is required' },
        { status: 400 }
      );
    }

    // Fetch shipping for each product (limit to 10 at a time)
    const limitedIds = productIds.slice(0, 10);
    const results: Record<string, any> = {};

    await Promise.all(
      limitedIds.map(async (productId: string) => {
        try {
          // First get product details for SKU ID
          const productResponse = await callDropshippingAPI(
            'aliexpress.ds.product.get',
            accessToken,
            {
              product_id: productId,
              ship_to_country: shipToCountry,
              target_currency: 'USD',
              target_language: 'EN',
            }
          );

          const productResult = productResponse.aliexpress_ds_product_get_response?.result;
          // Note: SKU key uses underscores: ae_item_sku_info_d_t_o
          const skuList = productResult?.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || [];
          const firstSku = skuList[0];
          const skuId = firstSku?.sku_id || '';

          if (!skuId) {
            results[productId] = { shippingCost: -1, freeShipping: false };
            return;
          }

          // Call freight query with correct camelCase params
          const queryDeliveryReq = {
            productId: productId,
            shipToCountry: shipToCountry,
            quantity: quantity,
            locale: 'en_US',
            currency: 'USD',
            language: 'EN',
            selectedSkuId: skuId,
          };

          const response = await callDropshippingAPI(
            'aliexpress.ds.freight.query',
            accessToken,
            { queryDeliveryReq: JSON.stringify(queryDeliveryReq) }
          );

          const result = response.aliexpress_ds_freight_query_response?.result;

          if (result?.delivery_options?.delivery_option_d_t_o?.length > 0) {
            const deliveryOptions = result.delivery_options.delivery_option_d_t_o;
            const sortedOptions = deliveryOptions.sort((a: any, b: any) => {
              const priceA = parseFloat(a.shipping_fee_cent || '999');
              const priceB = parseFloat(b.shipping_fee_cent || '999');
              return priceA - priceB;
            });

            const cheapestOption = sortedOptions[0];
            const shippingCost = parseFloat(cheapestOption.shipping_fee_cent || '0');
            const isFreeShipping = cheapestOption.free_shipping === true || shippingCost === 0;

            results[productId] = {
              shippingCost: isFreeShipping ? 0 : shippingCost,
              freeShipping: isFreeShipping,
              deliveryDays: cheapestOption.delivery_date_desc || '',
              shippingMethod: cheapestOption.company || 'Standard',
            };
          } else {
            results[productId] = { shippingCost: -1, freeShipping: false };
          }
        } catch (err) {
          console.error(`Shipping error for ${productId}:`, err);
          results[productId] = { shippingCost: -1, freeShipping: false, error: true };
        }
      })
    );

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Batch shipping API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping info', details: (error as Error).message },
      { status: 500 }
    );
  }
}
