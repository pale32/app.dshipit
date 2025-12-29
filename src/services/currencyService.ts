/**
 * CurrencyService - Comprehensive currency management service
 * Handles currency mapping, exchange rates, and formatting
 */

interface ExchangeRates {
  [currencyCode: string]: number;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimal_digits: number;
}

interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  conversion_rates: ExchangeRates;
  time_last_update_unix: number;
}

class CurrencyService {
  private exchangeRatesCache: { [baseCurrency: string]: { rates: ExchangeRates; timestamp: number } } = {};
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly API_BASE_URL = 'https://api.frankfurter.dev'; // Free API, no key required

  // Comprehensive country to currency mapping
  private readonly COUNTRY_TO_CURRENCY: Record<string, string> = {
    // Major economies
    'US': 'USD', 'AU': 'AUD', 'GB': 'GBP', 'CA': 'CAD', 'JP': 'JPY',
    'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'RU': 'RUB', 'KR': 'KRW',
    'MX': 'MXN', 'ID': 'IDR', 'TR': 'TRY', 'SA': 'SAR', 'CH': 'CHF',

    // European Union (Euro)
    'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
    'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'GR': 'EUR', 'IE': 'EUR',
    'FI': 'EUR', 'LU': 'EUR', 'SI': 'EUR', 'SK': 'EUR', 'EE': 'EUR',
    'LV': 'EUR', 'LT': 'EUR', 'CY': 'EUR', 'MT': 'EUR',

    // Asia Pacific
    'SG': 'SGD', 'HK': 'HKD', 'TW': 'TWD', 'TH': 'THB', 'MY': 'MYR',
    'PH': 'PHP', 'VN': 'VND', 'NZ': 'NZD', 'PK': 'PKR', 'BD': 'BDT',
    'LK': 'LKR', 'NP': 'NPR', 'MM': 'MMK', 'KH': 'KHR', 'LA': 'LAK',

    // Middle East & Africa
    'AE': 'AED', 'IL': 'ILS', 'ZA': 'ZAR', 'EG': 'EGP', 'NG': 'NGN',
    'KE': 'KES', 'GH': 'GHS', 'MA': 'MAD', 'TN': 'TND', 'DZ': 'DZD',
    'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD', 'OM': 'OMR', 'JO': 'JOD',
    'LB': 'LBP', 'IQ': 'IQD', 'IR': 'IRR',

    // Americas
    'AR': 'ARS', 'CL': 'CLP', 'CO': 'COP', 'PE': 'PEN', 'UY': 'UYU',
    'VE': 'VES', 'EC': 'USD', 'PA': 'PAB', 'CR': 'CRC', 'GT': 'GTQ',
    'DO': 'DOP', 'JM': 'JMD', 'TT': 'TTD', 'BB': 'BBD',

    // Europe (Non-Euro)
    'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK',
    'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK', 'RS': 'RSD',
    'UA': 'UAH', 'BY': 'BYN', 'MD': 'MDL', 'GE': 'GEL', 'AM': 'AMD',
    'AZ': 'AZN', 'KZ': 'KZT', 'UZ': 'UZS', 'TM': 'TMT', 'KG': 'KGS',
    'TJ': 'TJS', 'MN': 'MNT', 'IS': 'ISK',

    // Pacific
    'FJ': 'FJD', 'PG': 'PGK', 'SB': 'SBD', 'VU': 'VUV', 'TO': 'TOP',
    'WS': 'WST', 'PW': 'USD', 'MH': 'USD', 'FM': 'USD', 'KI': 'AUD',
    'NR': 'AUD', 'TV': 'AUD'
  };

  // Currency information database - comprehensive list for ALL world currencies
  private readonly CURRENCY_INFO: Record<string, CurrencyInfo> = {
    // Major currencies
    'USD': { code: 'USD', name: 'US Dollar', symbol: '$', decimal_digits: 2 },
    'EUR': { code: 'EUR', name: 'Euro', symbol: '€', decimal_digits: 2 },
    'GBP': { code: 'GBP', name: 'British Pound', symbol: '£', decimal_digits: 2 },
    'JPY': { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal_digits: 0 },
    'CNY': { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimal_digits: 2 },
    'CHF': { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimal_digits: 2 },

    // Americas
    'CAD': { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal_digits: 2 },
    'MXN': { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimal_digits: 2 },
    'BRL': { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimal_digits: 2 },
    'ARS': { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', decimal_digits: 2 },
    'CLP': { code: 'CLP', name: 'Chilean Peso', symbol: 'CL$', decimal_digits: 0 },
    'COP': { code: 'COP', name: 'Colombian Peso', symbol: 'CO$', decimal_digits: 0 },
    'PEN': { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimal_digits: 2 },
    'BOB': { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', decimal_digits: 2 },
    'PYG': { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', decimal_digits: 0 },
    'UYU': { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', decimal_digits: 2 },
    'VES': { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', decimal_digits: 2 },
    'CRC': { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', decimal_digits: 2 },
    'GTQ': { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', decimal_digits: 2 },
    'HNL': { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', decimal_digits: 2 },
    'NIO': { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', decimal_digits: 2 },
    'PAB': { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', decimal_digits: 2 },
    'DOP': { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', decimal_digits: 2 },
    'CUP': { code: 'CUP', name: 'Cuban Peso', symbol: '₱', decimal_digits: 2 },
    'HTG': { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', decimal_digits: 2 },
    'JMD': { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', decimal_digits: 2 },
    'TTD': { code: 'TTD', name: 'Trinidad Dollar', symbol: 'TT$', decimal_digits: 2 },
    'BSD': { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', decimal_digits: 2 },
    'BBD': { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', decimal_digits: 2 },
    'BZD': { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', decimal_digits: 2 },
    'GYD': { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', decimal_digits: 2 },
    'SRD': { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$', decimal_digits: 2 },
    'AWG': { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', decimal_digits: 2 },
    'ANG': { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ', decimal_digits: 2 },
    'KYD': { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', decimal_digits: 2 },
    'BMD': { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$', decimal_digits: 2 },
    'FKP': { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', decimal_digits: 2 },
    'XCD': { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', decimal_digits: 2 },

    // Asia Pacific
    'AUD': { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal_digits: 2 },
    'NZD': { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimal_digits: 2 },
    'INR': { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimal_digits: 2 },
    'KRW': { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimal_digits: 0 },
    'KPW': { code: 'KPW', name: 'North Korean Won', symbol: '₩', decimal_digits: 0 },
    'SGD': { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimal_digits: 2 },
    'HKD': { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimal_digits: 2 },
    'TWD': { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', decimal_digits: 0 },
    'THB': { code: 'THB', name: 'Thai Baht', symbol: '฿', decimal_digits: 2 },
    'MYR': { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimal_digits: 2 },
    'IDR': { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimal_digits: 0 },
    'PHP': { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimal_digits: 2 },
    'VND': { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimal_digits: 0 },
    'PKR': { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimal_digits: 2 },
    'BDT': { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimal_digits: 2 },
    'LKR': { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimal_digits: 2 },
    'NPR': { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', decimal_digits: 2 },
    'MMK': { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', decimal_digits: 0 },
    'KHR': { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', decimal_digits: 0 },
    'LAK': { code: 'LAK', name: 'Lao Kip', symbol: '₭', decimal_digits: 0 },
    'BND': { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', decimal_digits: 2 },
    'MNT': { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', decimal_digits: 0 },
    'MOP': { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', decimal_digits: 2 },
    'BTN': { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', decimal_digits: 2 },
    'MVR': { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', decimal_digits: 2 },
    'AFN': { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', decimal_digits: 2 },

    // Europe
    'SEK': { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimal_digits: 2 },
    'NOK': { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimal_digits: 2 },
    'DKK': { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimal_digits: 2 },
    'PLN': { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimal_digits: 2 },
    'CZK': { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimal_digits: 2 },
    'HUF': { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimal_digits: 0 },
    'RON': { code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimal_digits: 2 },
    'BGN': { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', decimal_digits: 2 },
    'ISK': { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', decimal_digits: 0 },
    'TRY': { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimal_digits: 2 },
    'RUB': { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimal_digits: 2 },
    'UAH': { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', decimal_digits: 2 },
    'BYN': { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', decimal_digits: 2 },
    'MDL': { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', decimal_digits: 2 },
    'RSD': { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', decimal_digits: 2 },
    'MKD': { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', decimal_digits: 2 },
    'ALL': { code: 'ALL', name: 'Albanian Lek', symbol: 'L', decimal_digits: 2 },
    'BAM': { code: 'BAM', name: 'Bosnia-Herzegovina Mark', symbol: 'KM', decimal_digits: 2 },
    'GEL': { code: 'GEL', name: 'Georgian Lari', symbol: '₾', decimal_digits: 2 },
    'AMD': { code: 'AMD', name: 'Armenian Dram', symbol: '֏', decimal_digits: 2 },
    'AZN': { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', decimal_digits: 2 },
    'GIP': { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', decimal_digits: 2 },

    // Central Asia
    'KZT': { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', decimal_digits: 2 },
    'UZS': { code: 'UZS', name: 'Uzbekistani Som', symbol: 'сўм', decimal_digits: 2 },
    'KGS': { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'сом', decimal_digits: 2 },
    'TJS': { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', decimal_digits: 2 },
    'TMT': { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm', decimal_digits: 2 },

    // Middle East
    'AED': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimal_digits: 2 },
    'SAR': { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimal_digits: 2 },
    'QAR': { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimal_digits: 2 },
    'KWD': { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimal_digits: 3 },
    'BHD': { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', decimal_digits: 3 },
    'OMR': { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', decimal_digits: 3 },
    'ILS': { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimal_digits: 2 },
    'JOD': { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', decimal_digits: 3 },
    'LBP': { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', decimal_digits: 2 },
    'IQD': { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', decimal_digits: 3 },
    'IRR': { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', decimal_digits: 2 },
    'SYP': { code: 'SYP', name: 'Syrian Pound', symbol: '£S', decimal_digits: 2 },
    'YER': { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', decimal_digits: 2 },

    // Africa
    'ZAR': { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimal_digits: 2 },
    'NGN': { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimal_digits: 2 },
    'EGP': { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimal_digits: 2 },
    'KES': { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimal_digits: 2 },
    'GHS': { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', decimal_digits: 2 },
    'MAD': { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', decimal_digits: 2 },
    'DZD': { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', decimal_digits: 2 },
    'TND': { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimal_digits: 3 },
    'LYD': { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', decimal_digits: 3 },
    'SDG': { code: 'SDG', name: 'Sudanese Pound', symbol: '£SD', decimal_digits: 2 },
    'SSP': { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', decimal_digits: 2 },
    'ETB': { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimal_digits: 2 },
    'TZS': { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimal_digits: 2 },
    'UGX': { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimal_digits: 0 },
    'RWF': { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimal_digits: 0 },
    'BIF': { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', decimal_digits: 0 },
    'CDF': { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', decimal_digits: 2 },
    'AOA': { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', decimal_digits: 2 },
    'MZN': { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', decimal_digits: 2 },
    'ZMW': { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', decimal_digits: 2 },
    'ZWL': { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$', decimal_digits: 2 },
    'BWP': { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', decimal_digits: 2 },
    'NAD': { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', decimal_digits: 2 },
    'SZL': { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', decimal_digits: 2 },
    'LSL': { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', decimal_digits: 2 },
    'MWK': { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', decimal_digits: 2 },
    'MGA': { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', decimal_digits: 2 },
    'MUR': { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', decimal_digits: 2 },
    'SCR': { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', decimal_digits: 2 },
    'KMF': { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', decimal_digits: 0 },
    'DJF': { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', decimal_digits: 0 },
    'ERN': { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', decimal_digits: 2 },
    'SOS': { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', decimal_digits: 2 },
    'GMD': { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', decimal_digits: 2 },
    'GNF': { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', decimal_digits: 0 },
    'SLE': { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', decimal_digits: 2 },
    'LRD': { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', decimal_digits: 2 },
    'CVE': { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', decimal_digits: 2 },
    'STN': { code: 'STN', name: 'São Tomé Dobra', symbol: 'Db', decimal_digits: 2 },
    'MRU': { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', decimal_digits: 2 },
    'SHP': { code: 'SHP', name: 'Saint Helena Pound', symbol: '£', decimal_digits: 2 },

    // CFA Franc zones
    'XOF': { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', decimal_digits: 0 },
    'XAF': { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', decimal_digits: 0 },

    // Pacific
    'TOP': { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', decimal_digits: 2 },
    'FJD': { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', decimal_digits: 2 },
    'WST': { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', decimal_digits: 2 },
    'VUV': { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', decimal_digits: 0 },
    'SBD': { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', decimal_digits: 2 },
    'PGK': { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', decimal_digits: 2 },
    'XPF': { code: 'XPF', name: 'CFP Franc', symbol: '₣', decimal_digits: 0 },
  };

  // Country name to currency mapping (for full country names)
  // This maps ALL country names (as they appear in the UI) to their currency codes
  private readonly COUNTRY_NAME_TO_CURRENCY: Record<string, string> = {
    // A
    'Afghanistan': 'AFN',
    'Albania': 'ALL',
    'Algeria': 'DZD',
    'American Samoa': 'USD',
    'Andorra': 'EUR',
    'Angola': 'AOA',
    'Anguilla': 'XCD',
    'Antarctica': 'USD',
    'Antigua and Barbuda': 'XCD',
    'Argentina': 'ARS',
    'Armenia': 'AMD',
    'Aruba': 'AWG',
    'Australia': 'AUD',
    'Austria': 'EUR',
    'Azerbaijan': 'AZN',
    'Åland Islands': 'EUR',

    // B
    'Bahamas': 'BSD',
    'Bahrain': 'BHD',
    'Bangladesh': 'BDT',
    'Barbados': 'BBD',
    'Belarus': 'BYN',
    'Belgium': 'EUR',
    'Belize': 'BZD',
    'Benin': 'XOF',
    'Bermuda': 'BMD',
    'Bhutan': 'BTN',
    'Bolivia': 'BOB',
    'Bosnia and Herzegovina': 'BAM',
    'Botswana': 'BWP',
    'Bouvet Island': 'NOK',
    'Brazil': 'BRL',
    'British Indian Ocean Territory': 'USD',
    'British Virgin Islands': 'USD',
    'Brunei': 'BND',
    'Bulgaria': 'BGN',
    'Burkina Faso': 'XOF',
    'Burundi': 'BIF',

    // C
    'Cambodia': 'KHR',
    'Cameroon': 'XAF',
    'Canada': 'CAD',
    'Cape Verde': 'CVE',
    'Caribbean Netherlands': 'USD',
    'Cayman Islands': 'KYD',
    'Central African Republic': 'XAF',
    'Chad': 'XAF',
    'Chile': 'CLP',
    'China': 'CNY',
    'Christmas Island': 'AUD',
    'Cocos Islands': 'AUD',
    'Colombia': 'COP',
    'Comoros': 'KMF',
    'Cook Islands': 'NZD',
    'Costa Rica': 'CRC',
    'Croatia': 'EUR',
    'Cuba': 'CUP',
    'Curaçao': 'ANG',
    'Cyprus': 'EUR',
    'Czech Republic': 'CZK',
    'Czechia': 'CZK',
    'Côte d\'Ivoire': 'XOF',

    // D
    'Democratic Republic of the Congo': 'CDF',
    'Denmark': 'DKK',
    'Djibouti': 'DJF',
    'Dominica': 'XCD',
    'Dominican Republic': 'DOP',

    // E
    'Ecuador': 'USD',
    'Egypt': 'EGP',
    'El Salvador': 'USD',
    'Equatorial Guinea': 'XAF',
    'Eritrea': 'ERN',
    'Estonia': 'EUR',
    'Eswatini': 'SZL',
    'Ethiopia': 'ETB',

    // F
    'Falkland Islands': 'FKP',
    'Faroe Islands': 'DKK',
    'Fiji': 'FJD',
    'Finland': 'EUR',
    'France': 'EUR',
    'French Guiana': 'EUR',
    'French Polynesia': 'XPF',
    'French Southern Territories': 'EUR',

    // G
    'Gabon': 'XAF',
    'Gambia': 'GMD',
    'Georgia': 'GEL',
    'Germany': 'EUR',
    'Ghana': 'GHS',
    'Gibraltar': 'GIP',
    'Greece': 'EUR',
    'Greenland': 'DKK',
    'Grenada': 'XCD',
    'Guadeloupe': 'EUR',
    'Guam': 'USD',
    'Guatemala': 'GTQ',
    'Guernsey': 'GBP',
    'Guinea': 'GNF',
    'Guinea-Bissau': 'XOF',
    'Guyana': 'GYD',

    // H
    'Haiti': 'HTG',
    'Heard Island': 'AUD',
    'Honduras': 'HNL',
    'Hong Kong': 'HKD',
    'Hungary': 'HUF',

    // I
    'Iceland': 'ISK',
    'India': 'INR',
    'Indonesia': 'IDR',
    'Iran': 'IRR',
    'Iraq': 'IQD',
    'Ireland': 'EUR',
    'Isle of Man': 'GBP',
    'Israel': 'ILS',
    'Italy': 'EUR',

    // J
    'Jamaica': 'JMD',
    'Japan': 'JPY',
    'Jersey': 'GBP',
    'Jordan': 'JOD',

    // K
    'Kazakhstan': 'KZT',
    'Kenya': 'KES',
    'Kiribati': 'AUD',
    'Kosovo': 'EUR',
    'Kuwait': 'KWD',
    'Kyrgyzstan': 'KGS',

    // L
    'Laos': 'LAK',
    'Latvia': 'EUR',
    'Lebanon': 'LBP',
    'Lesotho': 'LSL',
    'Liberia': 'LRD',
    'Libya': 'LYD',
    'Liechtenstein': 'CHF',
    'Lithuania': 'EUR',
    'Luxembourg': 'EUR',

    // M
    'Macao': 'MOP',
    'Madagascar': 'MGA',
    'Malawi': 'MWK',
    'Malaysia': 'MYR',
    'Maldives': 'MVR',
    'Mali': 'XOF',
    'Malta': 'EUR',
    'Marshall Islands': 'USD',
    'Martinique': 'EUR',
    'Mauritania': 'MRU',
    'Mauritius': 'MUR',
    'Mayotte': 'EUR',
    'Mexico': 'MXN',
    'Micronesia': 'USD',
    'Moldova': 'MDL',
    'Monaco': 'EUR',
    'Mongolia': 'MNT',
    'Montenegro': 'EUR',
    'Montserrat': 'XCD',
    'Morocco': 'MAD',
    'Mozambique': 'MZN',
    'Myanmar': 'MMK',

    // N
    'Namibia': 'NAD',
    'Nauru': 'AUD',
    'Nepal': 'NPR',
    'Netherlands': 'EUR',
    'New Caledonia': 'XPF',
    'New Zealand': 'NZD',
    'Nicaragua': 'NIO',
    'Niger': 'XOF',
    'Nigeria': 'NGN',
    'Niue': 'NZD',
    'Norfolk Island': 'AUD',
    'North Korea': 'KPW',
    'North Macedonia': 'MKD',
    'Northern Mariana Islands': 'USD',
    'Norway': 'NOK',

    // O
    'Oman': 'OMR',

    // P
    'Pakistan': 'PKR',
    'Palau': 'USD',
    'Palestine': 'ILS',
    'Panama': 'PAB',
    'Papua New Guinea': 'PGK',
    'Paraguay': 'PYG',
    'Peru': 'PEN',
    'Philippines': 'PHP',
    'Pitcairn Islands': 'NZD',
    'Poland': 'PLN',
    'Portugal': 'EUR',
    'Puerto Rico': 'USD',

    // Q
    'Qatar': 'QAR',

    // R
    'Romania': 'RON',
    'Russia': 'RUB',
    'Rwanda': 'RWF',
    'Republic of the Congo': 'XAF',
    'Réunion': 'EUR',

    // S
    'Saint Barthélemy': 'EUR',
    'Saint Helena': 'SHP',
    'Saint Kitts and Nevis': 'XCD',
    'Saint Lucia': 'XCD',
    'Saint Martin': 'EUR',
    'Saint Pierre and Miquelon': 'EUR',
    'Saint Vincent and the Grenadines': 'XCD',
    'Samoa': 'WST',
    'San Marino': 'EUR',
    'Saudi Arabia': 'SAR',
    'Senegal': 'XOF',
    'Serbia': 'RSD',
    'Seychelles': 'SCR',
    'Sierra Leone': 'SLE',
    'Singapore': 'SGD',
    'Sint Maarten': 'ANG',
    'Slovakia': 'EUR',
    'Slovenia': 'EUR',
    'Solomon Islands': 'SBD',
    'Somalia': 'SOS',
    'South Africa': 'ZAR',
    'South Georgia': 'GBP',
    'South Korea': 'KRW',
    'South Sudan': 'SSP',
    'Spain': 'EUR',
    'Sri Lanka': 'LKR',
    'Sudan': 'SDG',
    'Suriname': 'SRD',
    'Svalbard and Jan Mayen': 'NOK',
    'Sweden': 'SEK',
    'Switzerland': 'CHF',
    'Syria': 'SYP',
    'São Tomé and Príncipe': 'STN',

    // T
    'Taiwan': 'TWD',
    'Tajikistan': 'TJS',
    'Tanzania': 'TZS',
    'Thailand': 'THB',
    'Timor-Leste': 'USD',
    'Togo': 'XOF',
    'Tokelau': 'NZD',
    'Tonga': 'TOP',
    'Trinidad and Tobago': 'TTD',
    'Tunisia': 'TND',
    'Turkey': 'TRY',
    'Turkmenistan': 'TMT',
    'Turks and Caicos Islands': 'USD',
    'Tuvalu': 'AUD',

    // U
    'Uganda': 'UGX',
    'Ukraine': 'UAH',
    'United Arab Emirates': 'AED',
    'United Kingdom': 'GBP',
    'United States': 'USD',
    'United States of America': 'USD',
    'U.S. Minor Outlying Islands': 'USD',
    'U.S. Virgin Islands': 'USD',
    'Uruguay': 'UYU',
    'Uzbekistan': 'UZS',

    // V
    'Vanuatu': 'VUV',
    'Vatican City': 'EUR',
    'Venezuela': 'VES',
    'Vietnam': 'VND',

    // W
    'Wallis and Futuna': 'XPF',
    'Western Sahara': 'MAD',

    // Y
    'Yemen': 'YER',

    // Z
    'Zambia': 'ZMW',
    'Zimbabwe': 'ZWL',
  };

  /**
   * Get currency code by country code
   */
  getCurrencyByCountry(countryCode: string): string {
    return this.COUNTRY_TO_CURRENCY[countryCode] || 'USD';
  }

  /**
   * Get currency code by country name
   */
  getCurrencyByCountryName(countryName: string): string {
    return this.COUNTRY_NAME_TO_CURRENCY[countryName] || 'USD';
  }

  /**
   * Get currency information
   */
  getCurrencyInfo(currencyCode: string): CurrencyInfo {
    return this.CURRENCY_INFO[currencyCode] || this.CURRENCY_INFO['USD'];
  }

  /**
   * Get exchange rates for a base currency
   */
  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    const cacheKey = baseCurrency;
    const cached = this.exchangeRatesCache[cacheKey];

    // Check cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rates;
    }

    try {
      // Try primary API (ExchangeRate-API)
      const rates = await this.fetchExchangeRatesAPI(baseCurrency);
      if (rates) {
        this.exchangeRatesCache[cacheKey] = {
          rates,
          timestamp: Date.now()
        };
        return rates;
      }

      // Fallback to static rates (for development/offline)
      const fallbackRates = this.getFallbackExchangeRates(baseCurrency);
      console.warn('Using fallback exchange rates due to API failure');
      return fallbackRates;

    } catch (error) {
      console.error('Exchange rate API failed:', error);

      // Return cached data if available, even if expired
      if (cached) {
        console.warn('Using expired exchange rate cache');
        return cached.rates;
      }

      // Ultimate fallback
      return this.getFallbackExchangeRates(baseCurrency);
    }
  }

  /**
   * Fetch exchange rates from Frankfurter API (free, no API key required)
   */
  private async fetchExchangeRatesAPI(baseCurrency: string): Promise<ExchangeRates | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/latest?base=${baseCurrency}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rates) {
          // Add base currency with rate 1
          return { [baseCurrency]: 1, ...data.rates };
        }
      }
    } catch (error) {
      console.warn('Frankfurter API request failed:', error);
    }
    return null;
  }

  /**
   * Fallback exchange rates (approximate, for development/offline use)
   * These rates are updated periodically and used when the API is unavailable
   */
  private getFallbackExchangeRates(baseCurrency: string): ExchangeRates {
    const fallbackRates: Record<string, ExchangeRates> = {
      'USD': {
        'USD': 1,
        // Major currencies
        'AUD': 1.55,
        'EUR': 0.92,
        'GBP': 0.79,
        'CAD': 1.36,
        'JPY': 149.50,
        'CNY': 7.24,
        'INR': 83.50,
        'BRL': 4.97,
        'KRW': 1320,
        'MXN': 17.15,
        // Asian currencies
        'SGD': 1.34,
        'HKD': 7.82,
        'TWD': 31.50,
        'THB': 35.50,
        'MYR': 4.72,
        'IDR': 15850,
        'PHP': 56.50,
        'VND': 24500,
        'PKR': 278,
        'BDT': 110,
        'LKR': 325,
        'NPR': 133,
        // European currencies
        'CHF': 0.88,
        'SEK': 10.50,
        'NOK': 10.70,
        'DKK': 6.90,
        'PLN': 4.05,
        'CZK': 23.20,
        'HUF': 360,
        'RON': 4.60,
        'BGN': 1.80,
        'ISK': 138,
        'TRY': 32.50,
        'RUB': 92,
        'UAH': 37,
        // Middle Eastern currencies
        'AED': 3.67,
        'SAR': 3.75,
        'ILS': 3.70,
        'QAR': 3.64,
        'KWD': 0.31,
        'BHD': 0.38,
        'OMR': 0.38,
        // African currencies
        'ZAR': 18.50,
        'NGN': 1550,
        'EGP': 30.90,
        'KES': 153,
        'GHS': 12.50,
        'MAD': 10.10,
        // South American currencies
        'ARS': 870,
        'CLP': 920,
        'COP': 4050,
        'PEN': 3.75,
        // Oceania & Pacific
        'NZD': 1.65,
        'TOP': 2.35,
        'FJD': 2.25,
        'WST': 2.75,
        'VUV': 120,
        'SBD': 8.50,
        'PGK': 3.85,
        'XPF': 110,
      }
    };

    if (baseCurrency === 'USD') {
      return fallbackRates['USD'];
    }

    // Convert from USD to other base currency
    const usdRates = fallbackRates['USD'];
    const baseRate = usdRates[baseCurrency];

    if (!baseRate) {
      return usdRates; // Fallback to USD if base currency not found
    }

    const convertedRates: ExchangeRates = {};
    for (const [currency, rate] of Object.entries(usdRates)) {
      convertedRates[currency] = rate / baseRate;
    }

    return convertedRates;
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates(fromCurrency);
    const rate = rates[toCurrency];

    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      return amount; // Return original amount if conversion fails
    }

    return amount * rate;
  }

  /**
   * Format currency amount with proper symbol and decimals
   */
  formatCurrency(amount: number, currencyCode: string, locale: string = 'en-US'): string {
    const currencyInfo = this.getCurrencyInfo(currencyCode);

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currencyInfo.decimal_digits,
        maximumFractionDigits: currencyInfo.decimal_digits
      }).format(amount);
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      const symbol = currencyInfo.symbol;
      const formattedAmount = amount.toFixed(currencyInfo.decimal_digits);
      return `${symbol}${formattedAmount}`;
    }
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): CurrencyInfo[] {
    return Object.values(this.CURRENCY_INFO);
  }

  /**
   * Clear exchange rate cache
   */
  clearCache(): void {
    this.exchangeRatesCache = {};
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();
export type { ExchangeRates, CurrencyInfo };