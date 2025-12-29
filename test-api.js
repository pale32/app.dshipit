const crypto = require('crypto');

const APP_KEY = '516642';
const APP_SECRET = 'HeOYk0WvOImESDCI1EGarg7NXxSwXrHY';
const ACCESS_TOKEN = '50000300722dx0Lcr8LEpYpSa84Ftiivc01e32223brGcgBQ5kUyDgGJm1Ba48Tgd3Yh';
const API_BASE_URL = 'https://api-sg.aliexpress.com/sync';

function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  const bookendString = APP_SECRET + signString + APP_SECRET;
  return crypto.createHash('md5').update(bookendString, 'utf8').digest('hex').toUpperCase();
}

function getTimestamp() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
}

async function callAPI(method, businessParams = {}) {
  const systemParams = {
    app_key: APP_KEY,
    method: method,
    sign_method: 'md5',
    timestamp: getTimestamp(),
    format: 'json',
    v: '2.0',
    access_token: ACCESS_TOKEN,
  };

  const allParams = { ...systemParams };
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
  });

  return response.json();
}

async function main() {
  // Search for products
  const searchResult = await callAPI('aliexpress.ds.text.search', {
    keyWord: 'bluetooth earbuds',
    pageIndex: 1,
    pageSize: 3,
    currency: 'USD',
    local: 'en_US',
    countryCode: 'US',
    sort: 'LAST_VOLUME_DESC',
  });

  const products = searchResult.aliexpress_ds_text_search_response?.data?.products?.selection_search_product || [];

  console.log('=== SEARCH RESULT FIELDS ===\n');

  if (products.length > 0) {
    console.log('All fields in first product:');
    console.log(JSON.stringify(products[0], null, 2));

    console.log('\n=== KEY PRICE FIELDS ===');
    products.forEach((p, i) => {
      console.log(`\nProduct ${i + 1}: ${p.title?.substring(0, 50)}...`);
      console.log('  targetSalePrice:', p.targetSalePrice);
      console.log('  targetOriginalPrice:', p.targetOriginalPrice);
      console.log('  salePrice:', p.salePrice);
      console.log('  originalPrice:', p.originalPrice);
      console.log('  minPrice:', p.minPrice);
      console.log('  maxPrice:', p.maxPrice);
      console.log('  salePriceRange:', p.salePriceRange);
      console.log('  priceRange:', p.priceRange);
      console.log('  score:', p.score);
      console.log('  orders:', p.orders);
      console.log('  discount:', p.discount);
    });
  }
}

main().catch(console.error);
