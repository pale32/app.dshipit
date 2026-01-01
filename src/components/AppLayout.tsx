"use client";

import { useState, useCallback } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { SmartBanner } from "@/components/SmartBanner";
import { Sidebar } from "@/components/Sidebar";
import { ProductCountsProvider } from "@/contexts/ProductCountsContext";
import { UnsavedChangesProvider } from "@/contexts/UnsavedChangesContext";
import { StoreProvider } from "@/contexts/StoreContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <StoreProvider>
      <ProductCountsProvider>
        <UnsavedChangesProvider>
          <div className="min-h-screen w-full overflow-x-clip">
            <TopNavigation onMobileMenuToggle={toggleMobileMenu} />
            <SmartBanner />
            <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
            <main className="pt-16 md:ml-[272px]">{children}</main>
          </div>
        </UnsavedChangesProvider>
      </ProductCountsProvider>
    </StoreProvider>
  );
}
