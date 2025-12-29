import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// AliExpress Dropshipping App credentials
const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '516642';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'HeOYk0WvOImESDCI1EGarg7NXxSwXrHY';

/**
 * Generate HMAC-SHA256 signature for AliExpress API
 */
function generateSignature(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  return crypto.createHmac('sha256', APP_SECRET).update(signString).digest('hex').toUpperCase();
}

/**
 * GET /api/oauth/aliexpress/callback
 * Receives authorization code from AliExpress and exchanges it for access token
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle error from AliExpress
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Unknown error';
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  // No code received
  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=No authorization code received', request.url)
    );
  }

  try {
    // Exchange code for access token using REST endpoint
    const params: Record<string, string> = {
      app_key: APP_KEY,
      sign_method: 'hmac',
      timestamp: Date.now().toString(),
      code: code,
    };

    // Generate HMAC-SHA256 signature (sign_method=hmac uses sha256)
    const sortedKeys = Object.keys(params).sort();
    let signContent = '';
    for (const key of sortedKeys) {
      signContent += key + params[key];
    }
    params.sign = crypto.createHmac('sha256', APP_SECRET).update(signContent).digest('hex').toUpperCase();

    const tokenUrl = 'https://api-sg.aliexpress.com/rest/auth/token/create';
    const queryString = new URLSearchParams(params).toString();

    console.log('Token request URL:', `${tokenUrl}?${queryString}`);

    const response = await fetch(`${tokenUrl}?${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();
    console.log('Token response:', JSON.stringify(data, null, 2));

    if (data.error_response) {
      console.error('AliExpress token error:', data.error_response);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(data.error_response.msg || 'Token exchange failed')}`, request.url)
      );
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expireTime = data.expire_time;
    const userId = data.user_id;
    const userNick = data.user_nick;

    // Display the tokens for admin to copy
    return new NextResponse(
      `<html>
        <head><title>AliExpress OAuth Success</title></head>
        <body style="font-family: system-ui; padding: 40px; max-width: 900px; margin: 0 auto;">
          <h1 style="color: #16a34a;">✓ OAuth Success!</h1>
          <p>Connected as: <strong>${userNick || 'Unknown'}</strong> (ID: ${userId || 'N/A'})</p>

          <h2>Add these to your .env.local file:</h2>
          <pre style="background: #f0fdf4; padding: 20px; border-radius: 8px; overflow: auto; border: 1px solid #86efac; user-select: all;">
ALIEXPRESS_APP_KEY=${APP_KEY}
ALIEXPRESS_APP_SECRET=${APP_SECRET}
ALIEXPRESS_ACCESS_TOKEN=${accessToken}
ALIEXPRESS_REFRESH_TOKEN=${refreshToken}
          </pre>

          <h3>Token Details:</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; font-weight: bold;">Access Token</td>
              <td style="padding: 8px; word-break: break-all; font-family: monospace; font-size: 12px;">${accessToken}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; font-weight: bold;">Refresh Token</td>
              <td style="padding: 8px; word-break: break-all; font-family: monospace; font-size: 12px;">${refreshToken}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; font-weight: bold;">Expires</td>
              <td style="padding: 8px;">${expireTime ? new Date(parseInt(expireTime)).toLocaleString() : 'N/A'}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;"><a href="/find-products" style="color: #2563eb;">← Go to Find Products</a></p>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent('Failed to connect to AliExpress')}`, request.url)
    );
  }
}
