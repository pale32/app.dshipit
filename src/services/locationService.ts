/**
 * LocationService - Robust global location detection service
 * Uses multiple trusted sources with fallbacks for maximum reliability
 */

interface LocationData {
  country: string;
  countryCode: string;
  source: 'cloudflare' | 'ip-api' | 'ipinfo' | 'browser' | 'default';
  confidence: 'high' | 'medium' | 'low';
}

interface IPApiResponse {
  status: string;
  country: string;
  countryCode: string;
  query: string;
}

interface IPInfoResponse {
  country: string;
  ip: string;
}

class LocationService {
  private cache: LocationData | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Primary method: Detect user location using multiple reliable sources
   */
  async detectUserLocation(): Promise<LocationData> {
    // Check cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      // Method 1: CloudFlare Headers (Most reliable for global apps)
      const cfLocation = await this.getCloudFlareLocation();
      if (cfLocation) {
        this.setCacheAndReturn(cfLocation);
        return cfLocation;
      }

      // Method 2: IP-API.com (Free, reliable, good global coverage)
      const ipApiLocation = await this.getIPApiLocation();
      if (ipApiLocation) {
        this.setCacheAndReturn(ipApiLocation);
        return ipApiLocation;
      }

      // Method 3: IPInfo.io (Fallback)
      const ipInfoLocation = await this.getIPInfoLocation();
      if (ipInfoLocation) {
        this.setCacheAndReturn(ipInfoLocation);
        return ipInfoLocation;
      }

      // Method 4: Browser Geolocation (if user permits)
      const browserLocation = await this.getBrowserLocation();
      if (browserLocation) {
        this.setCacheAndReturn(browserLocation);
        return browserLocation;
      }

    } catch (error) {
      console.warn('Location detection failed:', error);
    }

    // Ultimate fallback: Default to US
    const defaultLocation: LocationData = {
      country: 'United States',
      countryCode: 'US',
      source: 'default',
      confidence: 'low'
    };

    this.setCacheAndReturn(defaultLocation);
    return defaultLocation;
  }

  /**
   * Method 1: CloudFlare Headers (Best for production apps)
   */
  private async getCloudFlareLocation(): Promise<LocationData | null> {
    try {
      // CloudFlare automatically adds CF-IPCountry header
      const response = await fetch('/api/location/cloudflare', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.countryCode && data.countryCode !== 'XX') {
          return {
            country: data.country || this.getCountryName(data.countryCode),
            countryCode: data.countryCode,
            source: 'cloudflare',
            confidence: 'high'
          };
        }
      }
    } catch (error) {
      console.warn('CloudFlare location detection failed:', error);
    }
    return null;
  }

  /**
   * Method 2: IP-API.com (Free, reliable)
   */
  private async getIPApiLocation(): Promise<LocationData | null> {
    try {
      const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,query', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data: IPApiResponse = await response.json();
        if (data.status === 'success' && data.countryCode) {
          return {
            country: data.country,
            countryCode: data.countryCode,
            source: 'ip-api',
            confidence: 'high'
          };
        }
      }
    } catch (error) {
      console.warn('IP-API location detection failed:', error);
    }
    return null;
  }

  /**
   * Method 3: IPInfo.io (Fallback)
   */
  private async getIPInfoLocation(): Promise<LocationData | null> {
    try {
      const response = await fetch('https://ipinfo.io/json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data: IPInfoResponse = await response.json();
        if (data.country) {
          return {
            country: this.getCountryName(data.country),
            countryCode: data.country,
            source: 'ipinfo',
            confidence: 'medium'
          };
        }
      }
    } catch (error) {
      console.warn('IPInfo location detection failed:', error);
    }
    return null;
  }

  /**
   * Method 4: Browser Geolocation API (Requires user permission)
   */
  private async getBrowserLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocoding to get country
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.countryCode) {
                resolve({
                  country: data.countryName || this.getCountryName(data.countryCode),
                  countryCode: data.countryCode,
                  source: 'browser',
                  confidence: 'high'
                });
                return;
              }
            }
          } catch (error) {
            console.warn('Browser geolocation reverse geocoding failed:', error);
          }
          resolve(null);
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * Cache management
   */
  private setCacheAndReturn(location: LocationData): void {
    this.cache = location;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  /**
   * Get country name from country code
   */
  private getCountryName(countryCode: string): string {
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

    return countryNames[countryCode] || countryCode;
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Get cached location without making new requests
   */
  getCachedLocation(): LocationData | null {
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }
    return null;
  }
}

// Export singleton instance
export const locationService = new LocationService();
export type { LocationData };