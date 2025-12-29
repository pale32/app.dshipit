import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// AliExpress Dropshipping App credentials
const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '523178';
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'G2PFNLOcCDuCB5sb7VJh4qLtvlSVApgR';

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
 * GET /api/oauth/aliexpress/token
 * Returns the current access token status (not the token itself for security)
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('aliexpress_access_token')?.value;
  const userId = request.cookies.get('aliexpress_user_id')?.value;
  const userNick = request.cookies.get('aliexpress_user_nick')?.value;

  return NextResponse.json({
    connected: !!accessToken,
    userId: userId || null,
    userNick: userNick || null,
  });
}

/**
 * POST /api/oauth/aliexpress/token
 * Refresh the access token using the refresh token
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('aliexpress_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token available' },
      { status: 401 }
    );
  }

  try {
    const params: Record<string, string> = {
      app_key: APP_KEY,
      sign_method: 'md5',
      timestamp: getTimestamp(),
      refresh_token: refreshToken,
    };

    params.sign = generateSignature(params);

    const tokenUrl = new URL('https://api-sg.aliexpress.com/auth/token/refresh');
    for (const [key, value] of Object.entries(params)) {
      tokenUrl.searchParams.set(key, value);
    }

    const response = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const data = await response.json();

    if (data.error_response) {
      console.error('Token refresh error:', data.error_response);
      return NextResponse.json(
        { error: data.error_response.msg || 'Token refresh failed' },
        { status: 400 }
      );
    }

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    const jsonResponse = NextResponse.json({ success: true });

    // Update cookies with new tokens
    jsonResponse.cookies.set('aliexpress_access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    jsonResponse.cookies.set('aliexpress_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 180,
      path: '/',
    });

    return jsonResponse;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/oauth/aliexpress/token
 * Disconnect AliExpress account (clear tokens)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('aliexpress_access_token');
  response.cookies.delete('aliexpress_refresh_token');
  response.cookies.delete('aliexpress_user_id');
  response.cookies.delete('aliexpress_user_nick');

  return response;
}
