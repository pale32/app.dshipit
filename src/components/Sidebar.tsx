"use client";

import { useState, useMemo, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProductCounts } from "@/contexts/ProductCountsContext";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Store,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

// Custom Home icon component
const HomeIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
  </svg>
);

// Custom Analytics icon component
const AnalyticsIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path>
  </svg>
);

// Custom Product Research icon component
const ProductResearchIcon = ({ className }: { className?: string }) => (
  <svg 
    width="24px" 
    height="24px" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 20C4.45 20 3.97917 19.8042 3.5875 19.4125C3.19583 19.0208 3 18.55 3 18V4C3 3.45 3.19583 2.97917 3.5875 2.5875C3.97917 2.19583 4.45 2 5 2H19C19.55 2 20.0208 2.19583 20.4125 2.5875C20.8042 2.97917 21 3.45 21 4V11.1C20.8333 11.0667 20.6708 11.0417 20.5125 11.025C20.3542 11.0083 20.1833 11 20 11H19V4H5V18H8.1C8.16667 18.3667 8.25417 18.7167 8.3625 19.05C8.47083 19.3833 8.61667 19.7 8.8 20H5ZM5 17V18V4V17ZM7 10H11V6H7V10ZM13 10H17V6H13V10Z" fill="currentColor"></path>
    <path d="M11 16H7V12H11V16Z" fill="currentColor"></path>
    <path d="M17 12V16H16L13 13.5V12H17Z" fill="currentColor"></path>
    <path d="M15.9197 17.5307L12.925 15.1472L9 18.5828L10.3613 20L13.0384 17.4663L16.0105 19.8712L20.185 15.9417V17.2945H22V13H17.4625V14.7178H18.8918L15.9197 17.5307Z" fill="currentColor"></path>
  </svg>
);

// Custom Find Products icon component
const FindProductsIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
  </svg>
);

// Custom Supplier Optimizer icon component
const SupplierOptimizerIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
  </svg>
);

// Custom Import List icon component
const ImportListIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0V0z"></path>
    <path d="M11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z"></path>
  </svg>
);

// Custom My Products icon component
const MyProductsIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"></path>
  </svg>
);

// Custom Open Orders icon component
const OpenOrdersIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
  </svg>
);

// Custom Archived Orders icon component
const ArchivedOrdersIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"></path>
  </svg>
);

// Custom Tracking icon component using GIF
const TrackingIcon = ({ className }: { className?: string }) => (
  <img 
    src="/tracking-dshipit.gif" 
    alt="Tracking" 
    className={`h-6 w-6 ${className}`}
  />
);

// Custom Settings icon component
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0V0z"></path>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
  </svg>
);

// Custom Manage Subscription icon component
const ManageSubscriptionIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    className={`h-6 w-6 text-gray-500 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path>
  </svg>
);

const getSidebarItems = (counts: { importList: number; myProducts: number }) => [
  {
    name: "Home",
    value: "home",
    icon: HomeIcon,
    type: "tab",
    href: "/home",
  },
  {
    name: "Analytics",
    value: "analytics",
    icon: AnalyticsIcon,
    type: "tab",
    href: "/analytics",
  },
  { type: "divider" },
  {
    name: "Product Research",
    value: "product-research",
    icon: ProductResearchIcon,
    type: "tab",
    href: "/product-research",
  },
  {
    name: "Find Products",
    value: "find-products",
    icon: FindProductsIcon,
    type: "tab",
    href: "/find-products",
  },
  {
    name: "Supplier Optimizer",
    value: "supplier-optimizer",
    icon: SupplierOptimizerIcon,
    type: "tab",
    href: "/supplier-optimizer",
  },
  { type: "divider" },
  {
    name: "Import List",
    value: "import-list",
    icon: ImportListIcon,
    type: "tab",
    count: counts.importList,
    href: "/import-list",
  },
  {
    name: "My Products",
    value: "my-products",
    icon: MyProductsIcon,
    type: "tab",
    count: counts.myProducts,
    href: "/my-products",
  },
  { type: "divider" },
  {
    name: "Open Orders",
    value: "open-orders",
    icon: OpenOrdersIcon,
    type: "expandable",
    subItems: [
      { name: "AliExpress", value: "open-orders-aliexpress" },
      { name: "Temu", value: "open-orders-temu" },
      { name: "Alibaba", value: "open-orders-alibaba" },
    ],
  },
  {
    name: "Archived Orders",
    value: "archived-orders",
    icon: ArchivedOrdersIcon,
    type: "tab",
    count: 128,
    href: "/archived-orders",
  },
  {
    name: "Tracking",
    value: "tracking",
    icon: TrackingIcon,
    type: "expandable",
    subItems: [
      { name: "Tracking Status", value: "tracking-status" },
      { name: "Tracking Page", value: "tracking-page" },
    ],
  },
  { type: "divider" },
  {
    name: "Settings",
    value: "settings",
    icon: SettingsIcon,
    type: "tab",
    href: "/settings",
  },
  {
    name: "Manage Subscription",
    value: "manage-subscription",
    icon: ManageSubscriptionIcon,
    type: "tab",
    href: "/subscription",
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarComponent = ({ isOpen = false, onClose }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [_activeHomeTab, _setActiveHomeTab] = useState("guide");
  const { counts, hasMounted } = useProductCounts();
  const { checkAndPreventNavigation } = useUnsavedChanges();

  const toggleExpanded = (value: string) => {
    // Check for unsaved changes and prevent expanding if necessary
    if (checkAndPreventNavigation()) {
      return; // Prevent expansion due to unsaved changes
    }

    setExpandedItems(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleTabClick = (item: any) => {
    if (item.href) {
      // Check for unsaved changes and prevent navigation if necessary
      if (checkAndPreventNavigation()) {
        return; // Navigation prevented due to unsaved changes
      }

      // Show loading state immediately
      const targetButton = document.querySelector(`button[data-href="${item.href}"]`);
      if (targetButton) {
        targetButton.classList.add('opacity-50', 'pointer-events-none');
      }
      
      router.push(item.href);
      if (onClose) {
        onClose(); // Close mobile menu after navigation
      }
    }
  };

  const sidebarItems = useMemo(() => getSidebarItems(counts), [counts]);
  
  const _allTabItems = sidebarItems.filter(
    item => item.type === "tab" || item.type === "expandable"
  );

  const renderSidebarItems = (items: typeof sidebarItems) => {
    return items.map((item, index) => {
      if (item.type === "divider") {
        return <div key={index} className="bg-border mx-4 my-2 h-px" />;
      }

      if (item.type === "expandable") {
        const isExpanded = item.value ? expandedItems.includes(item.value) : false;
        return (
          <div key={item.value} className="w-full">
            <button
              onClick={() => item.value && toggleExpanded(item.value)}
              className="hover:bg-accent/50 flex w-full items-center justify-start rounded-none border-l-2 border-transparent px-4 py-3 text-left text-base font-normal transition-all"
            >
              {item.icon && <item.icon className="me-3 h-4 w-4" />}
              {item.name}
              {isExpanded ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {isExpanded && item.subItems && (
              <div className="bg-muted/20">
                {item.subItems.map(subItem => {
                  let href = '';
                  if (subItem.value === 'open-orders-aliexpress') {
                    href = '/open-orders/aliexpress';
                  } else if (subItem.value === 'open-orders-temu') {
                    href = '/open-orders/temu';
                  } else if (subItem.value === 'open-orders-alibaba') {
                    href = '/open-orders/alibaba';
                  } else if (subItem.value === 'tracking-status') {
                    href = '/tracking-status';
                  } else if (subItem.value === 'tracking-page') {
                    href = '/tracking-page';
                  }
                  
                  const isActive = pathname === href;
                  
                  return (
                    <button
                      key={subItem.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (href) {
                          // Check for unsaved changes and prevent navigation if necessary
                          if (checkAndPreventNavigation()) {
                            return; // Navigation prevented due to unsaved changes
                          }
                          
                          router.push(href);
                          if (onClose) {
                            onClose();
                          }
                        }
                      }}
                      className={`hover:bg-accent/50 flex w-full items-center justify-start rounded-none border-t-0 border-r-0 border-b-0 border-l-6 px-4 py-2 pl-12 text-left text-[15px] shadow-none transition-all ${
                        isActive
                          ? "border-l-primary text-primary bg-transparent font-semibold"
                          : "border-l-transparent font-normal"
                      }`}
                    >
                      {subItem.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      const isActive = item.href === pathname;
      return (
        <button
          key={item.value}
          onClick={() => handleTabClick(item)}
          data-href={item.href}
          className={`hover:bg-accent/50 flex w-full items-center justify-start rounded-none border-t-0 border-r-0 border-b-0 border-l-6 px-4 py-3 text-left text-base transition-all ${
            isActive
              ? "border-l-primary text-primary bg-transparent shadow-none font-semibold"
              : "border-l-transparent font-normal"
          }`}
        >
          {item.icon && <item.icon className={`me-3 h-4 w-4 ${isActive ? "text-primary" : ""}`} />}
          <span className="flex-1">{item.name}</span>
          {hasMounted && item.count !== undefined && item.count > 0 && (
            <span className="bg-dsi-gray-200 text-dsi-gray-700 ml-2 rounded-full px-2 py-0.5 text-xs">
              {item.count}
            </span>
          )}
        </button>
      );
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:z-20 md:flex md:translate-x-0`}
      >
        {/* Top spacing for navigation */}
        <div className="absolute top-0 h-16 w-full flex-shrink-0 md:h-28" />

        <div className="flex h-full w-full flex-row items-start pt-16 md:pt-28">
          {/* Sidebar */}
          <div
            className="bg-background border-border flex h-full w-[272px] flex-col border-r overscroll-contain"
          >
            {/* Mobile Close Button */}
            <div className="border-border flex justify-end border-b p-4 md:hidden">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            {/* Single scrollable area containing all content */}
            <div
              className="min-h-0 flex-1 overflow-y-scroll overscroll-contain"
            >
              <div className="grid h-auto w-full grid-cols-1 bg-transparent p-0 pt-4">
                {renderSidebarItems(sidebarItems)}
              </div>

              {/* Link To More Stores button at the bottom of scrollable content */}
              <div className="p-4">
                <Button className="w-full" variant="default">
                  <Store className="me-2 h-4 w-4" />
                  Link To More Stores
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const Sidebar = memo(SidebarComponent);
