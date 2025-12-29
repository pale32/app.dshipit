import { NextRequest, NextResponse } from 'next/server';

// AliExpress Dropshipping App credentials
const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '523178';

/**
 * GET /api/oauth/aliexpress/authorize
 * Redirects user to AliExpress OAuth authorization page
 */
export async function GET(request: NextRequest) {
  // Determine callback URL based on the current host
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const CALLBACK_URL = process.env.ALIEXPRESS_CALLBACK_URL || `${protocol}://${host}/api/oauth/aliexpress/callback`;

  const authUrl = new URL('https://api-sg.aliexpress.com/oauth/authorize');

  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', APP_KEY);
  authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
  authUrl.searchParams.set('force_auth', 'true');
  authUrl.searchParams.set('sp', 'ae'); // AliExpress site

  console.log('Redirecting to AliExpress OAuth with callback:', CALLBACK_URL);

  return NextResponse.redirect(authUrl.toString());
}
