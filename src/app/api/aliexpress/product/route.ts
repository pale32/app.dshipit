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
 * GET /api/aliexpress/product
 * Get product details including SKU information
 *
 * Query params:
 * - productId: AliExpress product ID (required)
 * - shipToCountry: Country code (default: US)
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

  if (!productId) {
    return NextResponse.json(
      { error: 'productId is required' },
      { status: 400 }
    );
  }

  try {
    // Use aliexpress.ds.product.get to get product details
    const response = await callDropshippingAPI(
      'aliexpress.ds.product.get',
      accessToken,
      {
        product_id: productId,
        ship_to_country: shipToCountry,
        target_currency: 'USD',
        target_language: 'EN',
      }
    );

    // Log full response for debugging
    console.log('Product details response:', JSON.stringify(response, null, 2));

    // Check for error response
    if (response.error_response) {
      console.error('AliExpress Product API error:', response.error_response);
      return NextResponse.json(
        { error: response.error_response.msg || 'API error', code: response.error_response.code },
        { status: 400 }
      );
    }

    // Parse response - structure: aliexpress_ds_product_get_response.result
    const result = response.aliexpress_ds_product_get_response?.result;

    if (result) {
      // Extract SKU information - note: key uses underscores ae_item_sku_info_d_t_o
      const skuList = result.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o || [];
      const firstSku = skuList[0];

      // Get freight info if available in product details
      const freightInfo = result.ae_store_info?.logistics_servicd_detail;

      // Extract all product images from multimedia info
      const mainImage = result.ae_item_base_info_dto?.product_main_image_url || '';
      let allImages: string[] = mainImage ? [mainImage] : [];

      // ae_multimedia_info_dto contains image_urls as a comma-separated string or array
      const multimediaInfo = result.ae_multimedia_info_dto;
      if (multimediaInfo?.image_urls) {
        let imageUrls: string[] = [];
        if (typeof multimediaInfo.image_urls === 'string') {
          // Sometimes it's a semicolon or comma separated string
          imageUrls = multimediaInfo.image_urls.split(/[;,]/).map((url: string) => url.trim()).filter(Boolean);
        } else if (Array.isArray(multimediaInfo.image_urls)) {
          imageUrls = multimediaInfo.image_urls;
        }
        // Add images avoiding duplicates
        imageUrls.forEach((img: string) => {
          if (img && !allImages.includes(img)) {
            allImages.push(img);
          }
        });
      }

      // Also check ae_item_base_info_dto for product_small_image_urls
      const smallImageUrls = result.ae_item_base_info_dto?.product_small_image_urls;
      if (smallImageUrls) {
        let smallImages: string[] = [];
        if (typeof smallImageUrls === 'string') {
          smallImages = smallImageUrls.split(/[;,]/).map((url: string) => url.trim()).filter(Boolean);
        } else if (Array.isArray(smallImageUrls)) {
          smallImages = smallImageUrls;
        } else if (smallImageUrls.string) {
          smallImages = Array.isArray(smallImageUrls.string) ? smallImageUrls.string : [smallImageUrls.string];
        }
        smallImages.forEach((img: string) => {
          if (img && !allImages.includes(img)) {
            allImages.push(img);
          }
        });
      }

      // Extract SKU-specific images (variant images)
      if (skuList && skuList.length > 0) {
        skuList.forEach((sku: any) => {
          // Check for sku_image or image_url in SKU data
          const skuImage = sku.sku_image || sku.image_url;
          if (skuImage && !allImages.includes(skuImage)) {
            allImages.push(skuImage);
          }
          // Also check ae_sku_property_dtos for property images
          const skuProperties = sku.ae_sku_property_dtos?.ae_sku_property_dto;
          if (skuProperties && Array.isArray(skuProperties)) {
            skuProperties.forEach((prop: any) => {
              if (prop.sku_image && !allImages.includes(prop.sku_image)) {
                allImages.push(prop.sku_image);
              }
              if (prop.property_value_definition_name_image && !allImages.includes(prop.property_value_definition_name_image)) {
                allImages.push(prop.property_value_definition_name_image);
              }
            });
          }
        });
      }

      return NextResponse.json({
        productId: result.ae_item_base_info_dto?.product_id || productId,
        title: result.ae_item_base_info_dto?.subject || '',
        price: result.ae_item_base_info_dto?.sale_price || '',
        originalPrice: result.ae_item_base_info_dto?.market_price || '',
        currency: result.ae_item_base_info_dto?.currency_code || 'USD',
        mainImage: mainImage,
        images: allImages,
        skuId: firstSku?.sku_id || '',
        skuList: skuList.map((sku: any) => ({
          skuId: sku.sku_id,
          price: sku.sku_price,
          stock: sku.sku_stock === 'true' || sku.sku_stock === true,
          attributes: sku.ae_sku_property_dtos?.ae_sku_property_dto || [],
        })),
        hasShippingInfo: !!freightInfo,
      });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product details', details: (error as Error).message },
      { status: 500 }
    );
  }
}
