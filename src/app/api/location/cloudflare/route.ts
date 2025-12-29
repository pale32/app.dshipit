/**
 * CloudFlare Location Detection API Route
 * Extracts country information from CloudFlare headers
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // CloudFlare automatically adds these headers when the request passes through their CDN
    const cfCountry = request.headers.get('CF-IPCountry');
    const cfConnectingIp = request.headers.get('CF-Connecting-IP');
    const cfRay = request.headers.get('CF-RAY');

    // Check if CloudFlare headers are present
    if (!cfCountry || cfCountry === 'XX') {
      return NextResponse.json(
        {
          error: 'CloudFlare country detection not available',
          message: 'This endpoint requires CloudFlare CDN with country detection enabled',
          headers: {
            cfCountry,
            cfConnectingIp: cfConnectingIp ? 'present' : 'missing',
            cfRay: cfRay ? 'present' : 'missing'
          }
        },
        { status: 404 }
      );
    }

    // Country code mapping for better country names
    const countryNames: Record<string, string> = {
      'US': 'United States',
      'AU': 'Australia',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'RU': 'Russia',
      'KR': 'South Korea',
      'SG': 'Singapore',
      'HK': 'Hong Kong',
      'TW': 'Taiwan',
      'TH': 'Thailand',
      'MY': 'Malaysia',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'VN': 'Vietnam',
      'NZ': 'New Zealand',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'EG': 'Egypt',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'PT': 'Portugal',
      'GR': 'Greece',
      'TR': 'Turkey',
      'SA': 'Saudi Arabia',
      'AE': 'United Arab Emirates',
      'IL': 'Israel',
      'PK': 'Pakistan',
      'BD': 'Bangladesh',
      'LK': 'Sri Lanka',
      'NP': 'Nepal'
    };

    const countryName = countryNames[cfCountry] || cfCountry;

    return NextResponse.json({
      success: true,
      countryCode: cfCountry,
      country: countryName,
      source: 'cloudflare',
      confidence: 'high',
      metadata: {
        cfRay: cfRay,
        hasConnectingIp: !!cfConnectingIp,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('CloudFlare location detection error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process CloudFlare location headers'
      },
      { status: 500 }
    );
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}