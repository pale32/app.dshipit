"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService, LocationData } from '@/services/locationService';
import { currencyService, ExchangeRates, CurrencyInfo } from '@/services/currencyService';

interface CurrencyContextType {
  // Current currency state
  currency: string;
  currencyInfo: CurrencyInfo;
  exchangeRates: ExchangeRates;

  // Detection and override state
  detectedCurrency: string | null;
  isManualOverride: boolean;
  locationData: LocationData | null;

  // Loading states
  isLoading: boolean;
  isExchangeRatesLoading: boolean;

  // Actions
  setCurrency: (currencyCode: string, isManual?: boolean) => void;
  resetToDetectedCurrency: () => void;
  refreshExchangeRates: () => Promise<void>;
  convertToUserCurrency: (amount: number, fromCurrency: string) => Promise<number>;
  formatCurrency: (amount: number, currencyCode?: string) => string;

  // Error handling
  error: string | null;
  clearError: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: string;
}

export function CurrencyProvider({ children, defaultCurrency = 'USD' }: CurrencyProviderProps) {
  // Core state
  const [currency, setCurrencyState] = useState<string>(defaultCurrency);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExchangeRatesLoading, setIsExchangeRatesLoading] = useState<boolean>(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const currencyInfo = currencyService.getCurrencyInfo(currency);

  /**
   * Initialize currency detection on mount
   */
  useEffect(() => {
    initializeCurrency();
  }, []);

  /**
   * Load exchange rates when currency changes
   */
  useEffect(() => {
    if (currency) {
      loadExchangeRates(currency);
    }
  }, [currency]);

  /**
   * Load currency from localStorage on mount
   */
  useEffect(() => {
    const savedCurrency = localStorage.getItem('dshipit-user-currency');
    const savedIsManual = localStorage.getItem('dshipit-currency-manual') === 'true';

    if (savedCurrency && savedIsManual) {
      setCurrencyState(savedCurrency);
      setIsManualOverride(true);
    }
  }, []);

  /**
   * Initialize currency detection
   */
  const initializeCurrency = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Detect user location
      const location = await locationService.detectUserLocation();
      setLocationData(location);

      // Get currency for detected location
      const detectedCurrencyCode = currencyService.getCurrencyByCountry(location.countryCode);
      setDetectedCurrency(detectedCurrencyCode);

      // Check if user has manually overridden currency
      const savedCurrency = localStorage.getItem('dshipit-user-currency');
      const savedIsManual = localStorage.getItem('dshipit-currency-manual') === 'true';

      if (savedCurrency && savedIsManual) {
        // Use manual override
        setCurrencyState(savedCurrency);
        setIsManualOverride(true);
      } else {
        // Use detected currency
        setCurrencyState(detectedCurrencyCode);
        setIsManualOverride(false);

        // Save detected currency to localStorage (but not as manual)
        localStorage.setItem('dshipit-user-currency', detectedCurrencyCode);
        localStorage.setItem('dshipit-currency-manual', 'false');
      }

    } catch (err) {
      console.error('Currency initialization failed:', err);
      setError('Failed to detect currency. Using default USD.');
      setCurrencyState(defaultCurrency);
      setDetectedCurrency(defaultCurrency);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load exchange rates for given currency
   */
  const loadExchangeRates = async (baseCurrency: string) => {
    try {
      setIsExchangeRatesLoading(true);
      const rates = await currencyService.getExchangeRates(baseCurrency);
      setExchangeRates(rates);
    } catch (err) {
      console.error('Failed to load exchange rates:', err);
      setError('Failed to load exchange rates');
    } finally {
      setIsExchangeRatesLoading(false);
    }
  };

  /**
   * Set currency (with manual override option)
   */
  const setCurrency = (currencyCode: string, isManual: boolean = true) => {
    setCurrencyState(currencyCode);
    setIsManualOverride(isManual);
    setError(null);

    // Save to localStorage
    localStorage.setItem('dshipit-user-currency', currencyCode);
    localStorage.setItem('dshipit-currency-manual', isManual.toString());

    // Log currency change for analytics (optional)
    console.log(`Currency ${isManual ? 'manually' : 'automatically'} set to: ${currencyCode}`);
  };

  /**
   * Reset to detected currency (remove manual override)
   */
  const resetToDetectedCurrency = () => {
    if (detectedCurrency) {
      setCurrency(detectedCurrency, false);
    }
  };

  /**
   * Refresh exchange rates
   */
  const refreshExchangeRates = async () => {
    currencyService.clearCache();
    await loadExchangeRates(currency);
  };

  /**
   * Convert amount to user's currency
   */
  const convertToUserCurrency = async (amount: number, fromCurrency: string): Promise<number> => {
    try {
      return await currencyService.convertCurrency(amount, fromCurrency, currency);
    } catch (err) {
      console.error('Currency conversion failed:', err);
      return amount; // Return original amount if conversion fails
    }
  };

  /**
   * Format currency amount
   */
  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const targetCurrency = currencyCode || currency;
    return currencyService.formatCurrency(amount, targetCurrency);
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const contextValue: CurrencyContextType = {
    // Current currency state
    currency,
    currencyInfo,
    exchangeRates,

    // Detection and override state
    detectedCurrency,
    isManualOverride,
    locationData,

    // Loading states
    isLoading,
    isExchangeRatesLoading,

    // Actions
    setCurrency,
    resetToDetectedCurrency,
    refreshExchangeRates,
    convertToUserCurrency,
    formatCurrency,

    // Error handling
    error,
    clearError
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Custom hook to use currency context
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

/**
 * Higher-order component for currency-aware components
 */
export function withCurrency<P extends object>(Component: React.ComponentType<P>) {
  return function CurrencyAwareComponent(props: P) {
    const currencyContext = useCurrency();
    return <Component {...props} currency={currencyContext} />;
  };
}

export type { CurrencyContextType };