// Test script for AliExpress Image Search API
const crypto = require('crypto');

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '516642';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'HeOYk0WvOImESDCI1EGarg7NXxSwXrHY';
const ACCESS_TOKEN = process.env.ALIEXPRESS_ACCESS_TOKEN;
const API_BASE_URL = 'https://api-sg.aliexpress.com/sync';

// Test image URL - using a publicly accessible image
// You can replace this with any valid product image URL
const TEST_IMAGE_URL = process.argv[2] || 'https://picsum.photos/400/400';

function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  const bookendString = APP_SECRET + signString + APP_SECRET;
  const hash = crypto.createHash('md5').update(bookendString, 'utf8').digest('hex');
  return hash.toUpperCase();
}

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function fetchImageAsBuffer(imageUrl) {
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
  const urlPath = new URL(imageUrl).pathname;
  const filename = urlPath.split('/').pop() || 'image.jpg';

  return { buffer, filename };
}

async function testImageSearchAPI(imageUrl) {
  if (!ACCESS_TOKEN) {
    console.error('ERROR: ALIEXPRESS_ACCESS_TOKEN environment variable is not set');
    console.log('Please set it using: set ALIEXPRESS_ACCESS_TOKEN=your_token_here');
    return;
  }

  console.log('=== AliExpress Image Search API Test ===');
  console.log('APP_KEY:', APP_KEY);
  console.log('ACCESS_TOKEN:', ACCESS_TOKEN.substring(0, 20) + '...');
  console.log('Image URL:', imageUrl);
  console.log('');

  try {
    // Fetch image
    console.log('Fetching image...');
    const { buffer: imageBuffer, filename: imageName } = await fetchImageAsBuffer(imageUrl);
    console.log('Image fetched:', imageName, 'Size:', imageBuffer.length, 'bytes');

    const method = 'aliexpress.ds.image.search';
    const timestamp = getTimestamp();

    const systemParams = {
      app_key: APP_KEY,
      method: method,
      sign_method: 'md5',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      access_token: ACCESS_TOKEN,
    };

    const businessParams = {
      shpt_to: 'US',
      target_currency: 'USD',
      target_language: 'EN',
    };

    const signParams = { ...systemParams, ...businessParams };
    const signature = generateSignature(signParams);

    console.log('');
    console.log('System Params:', systemParams);
    console.log('Business Params:', businessParams);
    console.log('Signature:', signature);
    console.log('');

    // Build multipart form data
    const boundary = `----FormBoundary${Date.now()}`;
    const parts = [];

    for (const [key, value] of Object.entries(systemParams)) {
      parts.push(`--${boundary}`);
      parts.push(`Content-Disposition: form-data; name="${key}"`);
      parts.push('');
      parts.push(value);
    }

    for (const [key, value] of Object.entries(businessParams)) {
      parts.push(`--${boundary}`);
      parts.push(`Content-Disposition: form-data; name="${key}"`);
      parts.push('');
      parts.push(value);
    }

    parts.push(`--${boundary}`);
    parts.push('Content-Disposition: form-data; name="sign"');
    parts.push('');
    parts.push(signature);

    const stringPart = parts.join('\r\n') + '\r\n';
    const imagePartHeader = `--${boundary}\r\nContent-Disposition: form-data; name="image_file_bytes"; filename="${imageName}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
    const imagePartFooter = `\r\n--${boundary}--\r\n`;

    const stringBuffer = Buffer.from(stringPart, 'utf-8');
    const headerBuffer = Buffer.from(imagePartHeader, 'utf-8');
    const footerBuffer = Buffer.from(imagePartFooter, 'utf-8');

    const body = Buffer.concat([stringBuffer, headerBuffer, imageBuffer, footerBuffer]);

    console.log('Making API request...');
    console.log('URL:', API_BASE_URL);
    console.log('Content-Type:', `multipart/form-data; boundary=${boundary}`);
    console.log('Body size:', body.length, 'bytes');
    console.log('');

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      },
      body: body,
    });

    console.log('Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('');
    console.log('=== API Response ===');

    try {
      const json = JSON.parse(responseText);
      console.log(JSON.stringify(json, null, 2));

      if (json.error_response) {
        console.log('');
        console.log('ERROR:', json.error_response.msg);
        console.log('Code:', json.error_response.code);
        console.log('Sub Code:', json.error_response.sub_code);
        console.log('Sub Msg:', json.error_response.sub_msg);
      }
    } catch (e) {
      console.log('Raw response:', responseText);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run test
testImageSearchAPI(TEST_IMAGE_URL);
