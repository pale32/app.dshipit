"use client";

import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ReactNode } from 'react';

interface CurrencyProviderWrapperProps {
  children: ReactNode;
}

export function CurrencyProviderWrapper({ children }: CurrencyProviderWrapperProps) {
  return (
    <CurrencyProvider defaultCurrency="USD">
      {children}
    </CurrencyProvider>
  );
}