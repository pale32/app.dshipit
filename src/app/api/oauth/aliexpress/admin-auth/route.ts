import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// AliExpress Dropshipping App credentials
const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '523178';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'G2PFNLOcCDuCB5sb7VJh4qLtvlSVApgR';

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
 * GET /api/oauth/aliexpress/admin-auth
 *
 * Step 1: No code param - redirects to AliExpress OAuth
 * Step 2: With code param - exchanges for token and displays it
 *
 * This is for admin to get the access token to store in env vars
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  // Step 1: Redirect to AliExpress OAuth
  if (!code) {
    // Must use the exact callback URL registered in AliExpress app
    const callbackUrl = 'https://app.dshipit.com/api/oauth/aliexpress/callback';
    const authUrl = new URL('https://api-sg.aliexpress.com/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', APP_KEY);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('force_auth', 'true');
    authUrl.searchParams.set('sp', 'ae');

    return NextResponse.redirect(authUrl.toString());
  }

  // Step 2: Exchange code for token
  try {
    const params: Record<string, string> = {
      app_key: APP_KEY,
      sign_method: 'sha256',
      timestamp: Date.now().toString(),
      code: code,
    };

    params.sign = generateSignature(params);

    const tokenUrl = new URL('https://api-sg.aliexpress.com/auth/token/create');
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${tokenUrl.toString()}?${queryString}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (data.error_response) {
      return new NextResponse(
        `<html>
          <head><title>AliExpress OAuth Error</title></head>
          <body style="font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #dc2626;">OAuth Error</h1>
            <pre style="background: #fee; padding: 20px; border-radius: 8px; overflow: auto;">
${JSON.stringify(data.error_response, null, 2)}
            </pre>
            <p><a href="/api/oauth/aliexpress/admin-auth">Try Again</a></p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Success! Display the tokens
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expireTime = data.expire_time;
    const userId = data.user_id;
    const userNick = data.user_nick;

    return new NextResponse(
      `<html>
        <head><title>AliExpress OAuth Success</title></head>
        <body style="font-family: system-ui; padding: 40px; max-width: 900px; margin: 0 auto;">
          <h1 style="color: #16a34a;">OAuth Success!</h1>
          <p>Connected as: <strong>${userNick}</strong> (ID: ${userId})</p>

          <h2>Add these to your .env.local file:</h2>
          <pre style="background: #f0fdf4; padding: 20px; border-radius: 8px; overflow: auto; border: 1px solid #86efac;">
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
              <td style="padding: 8px;">${new Date(parseInt(expireTime)).toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 8px; font-weight: bold;">User ID</td>
              <td style="padding: 8px;">${userId}</td>
            </tr>
          </table>

          <h3 style="margin-top: 30px;">Full Response:</h3>
          <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow: auto; font-size: 12px;">
${JSON.stringify(data, null, 2)}
          </pre>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    return new NextResponse(
      `<html>
        <head><title>Error</title></head>
        <body style="font-family: system-ui; padding: 40px;">
          <h1 style="color: #dc2626;">Error</h1>
          <pre>${(error as Error).message}</pre>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
