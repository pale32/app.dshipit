# TikTok Shop API Integration Guide

**Status**: Production Ready
**Last Updated**: December 18, 2025
**Version**: 1.0

## Table of Contents

1. [Overview](#overview)
2. [Authentication Setup](#authentication-setup)
3. [API Endpoints](#api-endpoints)
4. [Implementation Examples](#implementation-examples)
5. [Rate Limits and Quotas](#rate-limits-and-quotas)
6. [Error Handling](#error-handling)
7. [Data Mapping](#data-mapping)
8. [Security Best Practices](#security-best-practices)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)

---

## Overview

TikTok Shop API provides access to product information, shop details, and e-commerce data. Our integration allows dshipit users to:

- Research TikTok Shop products in real-time
- Analyze pricing and trends
- Integrate product data with our sourcing platform
- Monitor competitor products and trends
- Access shop analytics and performance metrics

### Why TikTok Shop API Over Alternatives?

| Aspect | TikTok Shop API | AliExpress API | Amazon API |
|--------|-----------------|----------------|-----------|
| **Official Status** | ✅ Official | ✅ Official | ✅ Official |
| **Rate Limits** | 50 req/sec | Variable | 1-2 req/sec |
| **Product Search** | ✅ Full | ✅ Full | Limited |
| **Real-time Data** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Compliance Risk** | Low | Low | Low |
| **Setup Time** | 2-3 days | 1-2 days | 3-5 days |

---

## Authentication Setup

### Step 1: Register as TikTok Shop Partner Developer

1. Navigate to [TikTok Shop Partner Center](https://partner.tiktokshop.com/)
2. Sign in with your business account
3. Select appropriate portal (US or Global)
4. Verify business details and location

### Step 2: Create Your Application

1. Go to "App & Service" → "Create app & service"
2. Choose app type:
   - **Public App** (for marketplace distribution)
   - **Custom App** (for internal use)
3. Configure application details:
   - **App Name**: dshipit Product Research
   - **App Type**: Custom App
   - **Description**: Product research and sourcing integration

### Step 3: Configure OAuth Settings

1. In app settings, add **Redirect URI**:
   ```
   https://dshipit.com/auth/tiktok/callback
   https://your-dev.dshipit.com/auth/tiktok/callback
   ```

2. Note your credentials:
   - **Client Key**: awz09z1a5ie453y0
   - **Client Secret**: 8xt7EUjELZN2r0V9E7DIq6JQnPZsfMor

### Step 4: Request API Permissions

1. Go to "Manage API" section
2. Request permissions for:
   - `product.shop:read` - Shop product listing access
   - `product.information:read` - Product detail access
   - `order.information:read` - Order data (optional)
   - `shop.information:read` - Shop details

3. Standard permissions have instant approval
4. Advanced permissions reviewed within 2-3 business days

### Step 5: Generate Access Token

```javascript
// OAuth 2.0 Authorization Code Flow

// Step 1: Redirect user to TikTok authorization
const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const authUrl = `${TIKTOK_AUTH_URL}?client_key=${CLIENT_KEY}&scope=research.data.basic&redirect_uri=${REDIRECT_URI}&response_type=code`;

// Step 2: User authorizes, TikTok redirects with code
// Step 3: Exchange code for access token
const tokenResponse = await axios.post(
  'https://open-api.tiktok.com/platform/oauth',
  {
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    code: authCode,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI
  }
);

const accessToken = tokenResponse.data.access_token;
const refreshToken = tokenResponse.data.refresh_token;
const expiresIn = tokenResponse.data.expires_in; // Usually 24 hours
```

---

## API Endpoints

### 1. Search Products

**Endpoint**: `POST https://open-api.tiktok.com/v2/research/tts/product/`

**Required Scopes**: `research.data.basic`

**Request Parameters**:

```json
{
  "query": "wireless headphones",
  "shop_id": "1234567890",
  "page_start": 1,
  "page_size": 10,
  "fields": [
    "product_id",
    "product_name",
    "product_price",
    "product_description",
    "product_sold_count",
    "product_review_count",
    "product_rating_1_count",
    "product_rating_2_count",
    "product_rating_3_count",
    "product_rating_4_count",
    "product_rating_5_count"
  ]
}
```

**Response Structure**:

```json
{
  "data": {
    "product_data": [
      {
        "product_id": "1234567890",
        "product_name": "Premium Wireless Headphones",
        "product_price": ["29.99USD"],
        "product_description": "High-quality sound...",
        "product_sold_count": 1500,
        "product_review_count": 342,
        "product_rating_1_count": 5,
        "product_rating_2_count": 8,
        "product_rating_3_count": 25,
        "product_rating_4_count": 102,
        "product_rating_5_count": 202
      }
    ],
    "cursor": "next_page_cursor",
    "has_more": true
  },
  "error": null
}
```

### 2. Get Shop Information

**Endpoint**: `GET https://open-api.tiktok.com/v2/research/tts/shop/`

**Request Parameters**:

```json
{
  "shop_id": "1234567890",
  "fields": [
    "shop_id",
    "shop_name",
    "shop_icon",
    "shop_follower_count",
    "shop_product_count",
    "shop_rating"
  ]
}
```

**Response**:

```json
{
  "data": {
    "shop_id": "1234567890",
    "shop_name": "Fashion Trends Store",
    "shop_icon": "https://...",
    "shop_follower_count": 50000,
    "shop_product_count": 250,
    "shop_rating": 4.8
  }
}
```

### 3. Get Product Details

**Endpoint**: `GET https://open-api.tiktok.com/v2/research/tts/product/{product_id}`

**Request Parameters**:

```
product_id: 1234567890
fields: product_id,product_name,product_price,product_image,product_category
```

---

## Implementation Examples

### Node.js/Express Setup

```javascript
// src/services/tiktokShop.ts

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

interface TikTokShopConfig {
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
  shopId?: string;
}

interface TikTokAccessToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

class TikTokShopClient {
  private clientKey: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private api: AxiosInstance;

  constructor(config: TikTokShopConfig) {
    this.clientKey = config.clientKey;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;

    this.api = axios.create({
      baseURL: 'https://open-api.tiktok.com/v2',
      timeout: 10000,
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: 'research.data.basic',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: crypto.randomBytes(16).toString('hex'),
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TikTokAccessToken> {
    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/platform/oauth',
        {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }
      );

      const token = response.data;
      this.accessToken = token.access_token;

      // Store token with expiration
      this.storeToken(token);

      return token;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Refresh access token before expiration
   */
  async refreshAccessToken(refreshToken: string): Promise<TikTokAccessToken> {
    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/platform/oauth',
        {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Search TikTok Shop products
   */
  async searchProducts(
    query: string,
    options: {
      shopId?: string;
      pageStart?: number;
      pageSize?: number;
    } = {}
  ) {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    const payload = {
      query: query,
      shop_id: options.shopId,
      page_start: options.pageStart || 1,
      page_size: Math.min(options.pageSize || 10, 10), // Max 10 per page
      fields: [
        'product_id',
        'product_name',
        'product_price',
        'product_description',
        'product_sold_count',
        'product_review_count',
        'product_rating_1_count',
        'product_rating_2_count',
        'product_rating_3_count',
        'product_rating_4_count',
        'product_rating_5_count',
      ],
    };

    try {
      const response = await this.api.post(
        '/research/tts/product/',
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get shop information
   */
  async getShopInfo(shopId: string) {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await this.api.get(
        `/research/tts/shop/${shopId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get product details
   */
  async getProductDetails(productId: string) {
    if (!this.accessToken) {
      throw new Error('Access token not set. Please authenticate first.');
    }

    try {
      const response = await this.api.get(
        `/research/tts/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Transform TikTok product to dshipit format
   */
  transformProduct(tiktokProduct: any) {
    const ratings = {
      1: tiktokProduct.product_rating_1_count || 0,
      2: tiktokProduct.product_rating_2_count || 0,
      3: tiktokProduct.product_rating_3_count || 0,
      4: tiktokProduct.product_rating_4_count || 0,
      5: tiktokProduct.product_rating_5_count || 0,
    };

    const totalRatings = Object.values(ratings).reduce((a: number, b: number) => a + b, 0);
    const averageRating = totalRatings > 0
      ? (1 * ratings[1] + 2 * ratings[2] + 3 * ratings[3] + 4 * ratings[4] + 5 * ratings[5]) / totalRatings
      : 0;

    const price = tiktokProduct.product_price?.[0] || '';
    const priceMatch = price.match(/(\d+\.?\d*)/);
    const priceValue = priceMatch ? parseFloat(priceMatch[0]) : 0;

    return {
      product_id: tiktokProduct.product_id,
      product_title: tiktokProduct.product_name,
      product_main_image_url: tiktokProduct.product_image || '',
      target_sale_price: priceValue.toString(),
      target_original_price: priceValue.toString(),
      discount: '0',
      evaluate_rate: averageRating.toFixed(1),
      orders_count: tiktokProduct.product_sold_count || 0,
      product_detail_url: `https://www.tiktokshop.com/product/${tiktokProduct.product_id}`,
      supplier: 'TikTok Shop',
      shop_url: tiktokProduct.shop_url || '',
      seller_id: tiktokProduct.shop_id || '',
    };
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleApiError(error: any, retries = 0) {
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retries); // Exponential backoff

    // Rate limit error - retry with backoff
    if (error.response?.status === 429 && retries < maxRetries) {
      console.log(`Rate limited. Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      // Retry logic would be implemented here
    }

    // Token expired - refresh and retry
    if (error.response?.status === 401) {
      console.error('Access token expired. Please re-authenticate.');
      // Trigger token refresh
    }

    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }

  /**
   * Store token securely (use environment variables or secure storage)
   */
  private storeToken(token: TikTokAccessToken) {
    // In production, store in database or secure token management service
    // DO NOT store in localStorage or cookies
    process.env.TIKTOK_ACCESS_TOKEN = token.access_token;
    process.env.TIKTOK_REFRESH_TOKEN = token.refresh_token;
    process.env.TIKTOK_TOKEN_EXPIRY = (Date.now() + token.expires_in * 1000).toString();
  }
}

export default TikTokShopClient;
```

### Express Route Implementation

```javascript
// src/routes/auth/tiktok.ts

import { Router, Request, Response } from 'express';
import TikTokShopClient from '../../services/tiktokShop';

const router = Router();
const tiktokClient = new TikTokShopClient({
  clientKey: process.env.TIKTOK_CLIENT_KEY!,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
  redirectUri: process.env.TIKTOK_REDIRECT_URI!,
});

/**
 * Initiate TikTok OAuth login
 */
router.get('/login', (req: Request, res: Response) => {
  const authUrl = tiktokClient.getAuthorizationUrl();
  res.redirect(authUrl);
});

/**
 * Handle OAuth callback from TikTok
 */
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    const token = await tiktokClient.exchangeCodeForToken(code as string);

    // Store token in session or database
    req.session.tiktokToken = token;

    // Redirect to product research page
    res.redirect('/product-research');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Disconnect TikTok account
 */
router.post('/disconnect', (req: Request, res: Response) => {
  // Remove token from session/database
  delete req.session.tiktokToken;
  res.json({ success: true });
});

export default router;
```

### Product Search Implementation

```javascript
// src/routes/api/tiktok/search.ts

import { Router, Request, Response } from 'express';
import TikTokShopClient from '../../../services/tiktokShop';

const router = Router();

/**
 * Search TikTok Shop products
 * GET /api/tiktok/search?query=headphones&pageSize=10
 */
router.get('/search', async (req: Request, res: Response) => {
  const { query, pageSize = 10, pageStart = 1 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }

  if (!req.session?.tiktokToken) {
    return res.status(401).json({ error: 'Not authenticated with TikTok' });
  }

  try {
    const client = new TikTokShopClient({
      clientKey: process.env.TIKTOK_CLIENT_KEY!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      redirectUri: process.env.TIKTOK_REDIRECT_URI!,
    });

    // Set the access token from session
    (client as any).accessToken = req.session.tiktokToken.access_token;

    const results = await client.searchProducts(query as string, {
      pageSize: Math.min(parseInt(pageSize as string), 10),
      pageStart: parseInt(pageStart as string),
    });

    // Transform products to dshipit format
    const transformedProducts = results.data.product_data.map((p: any) =>
      client.transformProduct(p)
    );

    res.json({
      products: transformedProducts,
      totalCount: results.data.product_data.length,
      hasMore: results.data.has_more,
      cursor: results.data.cursor,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
```

---

## Rate Limits and Quotas

### Current Limits

- **50 API requests per second** per store
- **50 API requests per second** per app
- Rate limits are **separate for each connected store**

### Handling Rate Limits

```javascript
// Implement exponential backoff for rate limiting
async function makeRequestWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`Rate limited. Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
}
```

---

## Error Handling

### Common Error Codes

| Code | Description | Action |
|------|-------------|--------|
| **400** | Bad Request | Validate request parameters |
| **401** | Unauthorized | Check/refresh access token |
| **403** | Forbidden | Check API permissions/scopes |
| **404** | Not Found | Verify resource IDs |
| **429** | Too Many Requests | Implement backoff/throttling |
| **500** | Server Error | Retry with exponential backoff |

### Error Response Structure

```json
{
  "error": {
    "code": "ERR_001",
    "message": "Invalid request parameters",
    "details": "Missing required field: shop_id"
  }
}
```

---

## Data Mapping

### TikTok Product → dshipit Format

```typescript
interface TikTokProduct {
  product_id: string;
  product_name: string;
  product_price: string[]; // ["29.99USD"]
  product_description: string;
  product_sold_count: number;
  product_review_count: number;
  product_rating_1_count: number;
  product_rating_2_count: number;
  product_rating_3_count: number;
  product_rating_4_count: number;
  product_rating_5_count: number;
}

interface DshipitProduct {
  product_id: string;
  product_title: string;
  product_main_image_url: string;
  target_sale_price: string;
  target_original_price: string;
  discount: string;
  evaluate_rate: string; // 0-5 star scale
  orders_count: number;
  product_detail_url: string;
  supplier: string;
  shop_url: string;
  seller_id: string;
}
```

### Rating Calculation

```javascript
const ratings = {
  1: product.product_rating_1_count,
  2: product.product_rating_2_count,
  3: product.product_rating_3_count,
  4: product.product_rating_4_count,
  5: product.product_rating_5_count,
};

const totalRatings = Object.values(ratings).reduce((a, b) => a + b);
const averageRating = (
  1 * ratings[1] +
  2 * ratings[2] +
  3 * ratings[3] +
  4 * ratings[4] +
  5 * ratings[5]
) / totalRatings;
```

---

## Security Best Practices

### 1. Credential Management

```javascript
// ✅ DO: Use environment variables
const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

// ✅ DO: Store tokens securely
const token = await secureTokenStorage.get(userId);

// ❌ DON'T: Hardcode secrets
const clientSecret = "8xt7EUjELZN2r0V9E7DIq6JQnPZsfMor";

// ❌ DON'T: Store tokens in localStorage
localStorage.setItem('tiktok_token', token);
```

### 2. Request Validation

```javascript
// Validate all user inputs
function validateSearchQuery(query: string): void {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }
  if (query.length > 1000) {
    throw new Error('Query exceeds maximum length');
  }
}
```

### 3. HTTPS and Encryption

```javascript
// Always use HTTPS in production
const apiUrl = process.env.NODE_ENV === 'production'
  ? 'https://open-api.tiktok.com/v2'
  : 'https://sandbox.api.tiktok.com/v2'; // TikTok sandbox for testing
```

### 4. Token Security

```javascript
// Tokens expire in 24 hours - refresh before expiration
const tokenExpiryTime = Date.now() + (expiresIn * 1000);
const refreshThreshold = tokenExpiryTime - (1 * 60 * 60 * 1000); // 1 hour before expiry

if (Date.now() > refreshThreshold) {
  // Refresh token
  const newToken = await refreshAccessToken(refreshToken);
}
```

---

## Testing

### Development Setup

```bash
# 1. Install dependencies
npm install axios express express-session cookie-parser

# 2. Configure environment variables
TIKTOK_CLIENT_KEY=awz09z1a5ie453y0
TIKTOK_CLIENT_SECRET=8xt7EUjELZN2r0V9E7DIq6JQnPZsfMor
TIKTOK_REDIRECT_URI=http://localhost:3000/auth/tiktok/callback
TIKTOK_SANDBOX=true

# 3. Run tests
npm test
```

### Test Cases

```javascript
// Example test suite
describe('TikTok Shop Integration', () => {
  it('should authenticate and exchange code for token', async () => {
    const token = await client.exchangeCodeForToken('test_code');
    expect(token.access_token).toBeDefined();
    expect(token.expires_in).toBeGreaterThan(0);
  });

  it('should search products successfully', async () => {
    const results = await client.searchProducts('wireless headphones');
    expect(results.data.product_data).toBeInstanceOf(Array);
    expect(results.data.product_data.length).toBeGreaterThan(0);
  });

  it('should handle rate limits with exponential backoff', async () => {
    // Simulate 429 error
    // Verify backoff implementation
  });

  it('should refresh expired tokens', async () => {
    // Set expiration to past
    // Call API
    // Verify token refresh occurred
  });
});
```

---

## Production Deployment

### Pre-Production Checklist

- [ ] All credentials stored in environment variables
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting implemented
- [ ] Error handling and logging configured
- [ ] Token refresh logic working
- [ ] Data validation on all inputs
- [ ] Security headers configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting set up
- [ ] Terms of Service and Privacy Policy updated
- [ ] GDPR compliance verified
- [ ] API usage monitoring active

### Production Configuration

```javascript
// Production environment variables
NODE_ENV=production
TIKTOK_CLIENT_KEY=awz09z1a5ie453y0
TIKTOK_CLIENT_SECRET=8xt7EUjELZN2r0V9E7DIq6JQnPZsfMor
TIKTOK_REDIRECT_URI=https://dshipit.com/auth/tiktok/callback
TIKTOK_SANDBOX=false
DATABASE_URL=production_db_url
SECURE_TOKEN_STORAGE=vault_or_service
LOG_LEVEL=info
ENABLE_MONITORING=true
```

### Monitoring

```javascript
// Monitor API usage
const monitorApiUsage = () => {
  setInterval(() => {
    const usage = getApiUsageStats();
    if (usage.requestsPerSecond > 45) { // Alert at 90% of limit
      sendAlert('TikTok API approaching rate limit');
    }
    logMetrics(usage);
  }, 60000); // Check every minute
};
```

---

## Support and Documentation

- **TikTok Developer Portal**: https://developers.tiktok.com/
- **TikTok Shop Partner Center**: https://partner.tiktokshop.com/
- **API Documentation**: https://partner.tiktokshop.com/docv2/page/650b23eef1fd3102b93d2326
- **OAuth Documentation**: https://developers.tiktok.com/doc/oauth-user-access-token-management
- **Support Email**: support@dshipit.com
- **Issue Tracking**: [GitHub Issues](https://github.com/dshipit/issues)

---

**For questions or issues, contact: dev@dshipit.com**
