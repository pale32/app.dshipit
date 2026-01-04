"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, ChevronDown, CheckIcon, ArrowUp, ArrowDown, Loader2, Camera, Settings, X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { IncrementButton } from "@/components/ui/increment-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { searchProducts, transformProductForDisplay, getShippingCost, getProductDetails, type AliExpressProduct } from "@/lib/aliexpress-api";
import { addToImportList, isInImportList, type ImportListItem } from "@/lib/import-list-storage";
import { useProductCounts } from "@/contexts/ProductCountsContext";
import type { DisplayProduct } from "@/types/find-products";
import { ProductCard } from "@/components/find-products";

export default function FindProductsPage() {
  const { refreshImportListCount } = useProductCounts();
  const [activeTab, setActiveTab] = useState("aliexpress");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(0);
  const totalProducts = 20;
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minPrice, setMinPrice] = useState(0.00);
  const [maxPrice, setMaxPrice] = useState(0.00);
  const [shipToCountry, setShipToCountry] = useState("United States");
  const [shipFromCountry, setShipFromCountry] = useState("ALL");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Orders");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isManageSuppliersOpen, setIsManageSuppliersOpen] = useState(false);

  // Set mounted state after hydration to avoid hydration mismatch with portals
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Geolocation detection for Ship To filter
  useEffect(() => {
    const detectUserCountry = async () => {
      setIsDetectingLocation(true);
      try {
        // Use IP-based geolocation API (free, no API key needed)
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          const countryName = data.country_name;

          // Map common country names to our dropdown values
          const countryMapping: Record<string, string> = {
            'United States': 'United States',
            'Canada': 'Canada',
            'United Kingdom': 'United Kingdom',
            'Australia': 'Australia',
            'Germany': 'Germany',
            'France': 'France',
            'Japan': 'Japan',
            'Brazil': 'Brazil',
            'Mexico': 'Mexico',
            'India': 'India',
            'China': 'China',
            'South Korea': 'South Korea',
            'Italy': 'Italy',
            'Spain': 'Spain',
            'Netherlands': 'Netherlands',
            'Sweden': 'Sweden',
            'Norway': 'Norway',
            'Denmark': 'Denmark',
            'Finland': 'Finland',
            'Belgium': 'Belgium',
            'Switzerland': 'Switzerland',
            'Austria': 'Austria',
            'Poland': 'Poland',
            'Czech Republic': 'Czech Republic',
            'Hungary': 'Hungary',
            'Portugal': 'Portugal',
            'Greece': 'Greece',
            'Turkey': 'Turkey',
            'Russia': 'Russia',
            'South Africa': 'South Africa',
            'Egypt': 'Egypt',
            'Israel': 'Israel',
            'United Arab Emirates': 'UAE',
            'Saudi Arabia': 'Saudi Arabia',
            'Singapore': 'Singapore',
            'Thailand': 'Thailand',
            'Vietnam': 'Vietnam',
            'Philippines': 'Philippines',
            'Malaysia': 'Malaysia',
            'Indonesia': 'Indonesia',
            'New Zealand': 'New Zealand',
            'Argentina': 'Argentina',
            'Chile': 'Chile',
            'Colombia': 'Colombia',
            'Peru': 'Peru',
          };

          const mappedCountry = countryMapping[countryName];
          if (mappedCountry) {
            setShipToCountry(mappedCountry);
          }
        }
      } catch (error) {
        // Silent fail - keep default United States
        if (process.env.NODE_ENV === 'development') {
          console.log('Geolocation detection failed, using default');
        }
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectUserCountry();
  }, []); // Only run once on mount
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  // AliExpress API state
  const [aliExpressProducts, setAliExpressProducts] = useState<DisplayProduct[]>([]);
  const [isLoadingAliExpress, setIsLoadingAliExpress] = useState(false);
  const [aliExpressError, setAliExpressError] = useState<string | null>(null);
  const [totalAliExpressProducts, setTotalAliExpressProducts] = useState(0);

  // Country code mapping for API
  const getCountryCode = (countryName: string): string => {
    const countryMap: Record<string, string> = {
      'United States': 'US',
      'Canada': 'CA',
      'United Kingdom': 'GB',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Japan': 'JP',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'India': 'IN',
      'China': 'CN',
      'South Korea': 'KR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'ALL': 'ALL',
    };
    return countryMap[countryName] || 'US';
  };

  // Sort mapping for API
  const getSortParam = (sortOption: string): string => {
    const sortMap: Record<string, string> = {
      'Default': 'default',
      'Orders': 'orders_desc',
      'Newest': 'newest',
      'Price Low to High': 'price_asc',
      'Price High to Low': 'price_desc',
    };
    return sortMap[sortOption] || 'default';
  };

  // Product keywords that return real products with orders
  const defaultSearchTerms = ['phone case', 'earbuds', 'watch', 'bag', 'shoes', 'dress', 'jewelry', 'led lights'];
  const getRandomDefaultTerm = () => defaultSearchTerms[Math.floor(Math.random() * defaultSearchTerms.length)];

  // Track the current search term for pagination
  const [currentSearchTerm, setCurrentSearchTerm] = useState(() => getRandomDefaultTerm());
  const [hasMoreAliExpressProducts, setHasMoreAliExpressProducts] = useState(true);
  const [isLoadingMoreAliExpress, setIsLoadingMoreAliExpress] = useState(false);

  // Clear selections when tab or search/filters change (not when loading more via infinite scroll)
  useEffect(() => {
    setSelectedProductIds([]);
    setSelectedProducts(0);
    setIsChecked(false);
  }, [activeTab, currentSearchTerm, shipToCountry, shipFromCountry, sortBy, minPrice, maxPrice]);

  // Products per load - must be consistent for pagination to work correctly
  const PRODUCTS_PER_PAGE = 20;

  // Fetch AliExpress products - supports both initial load and infinite scroll
  const fetchAliExpressProducts = useCallback(async (query: string, page: number = 1, append: boolean = false) => {
    if (activeTab !== 'aliexpress') return;

    if (append) {
      setIsLoadingMoreAliExpress(true);
    } else {
      setIsLoadingAliExpress(true);
    }
    setAliExpressError(null);

    try {
      const searchKeywords = query || getRandomDefaultTerm();
      const shipTo = getCountryCode(shipToCountry);
      const shipFrom = getCountryCode(shipFromCountry);
      const sort = getSortParam(sortBy);

      const { products, totalCount, hasMore } = await searchProducts(
        searchKeywords,
        page,
        PRODUCTS_PER_PAGE,
        sort,
        shipTo,
        shipFrom !== 'ALL' ? shipFrom : undefined,
        minPrice > 0 ? minPrice : undefined,
        maxPrice > 0 ? maxPrice : undefined
      );

      const displayProducts: DisplayProduct[] = products.map(p => {
        const transformed = transformProductForDisplay(p);
        // Check if product is already in import list
        transformed.isImported = isInImportList(transformed.id);
        return transformed;
      });

      // Batch state updates together - React 18+ auto-batches but explicit is clearer
      if (append) {
        // Append to existing products for infinite scroll, deduplicating by ID
        setAliExpressProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = displayProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      } else {
        // Replace products for new search/filter
        setAliExpressProducts(displayProducts);
      }
      // These are batched by React 18+ automatic batching
      setTotalAliExpressProducts(totalCount);
      setHasMoreAliExpressProducts(hasMore);
    } catch (error) {
      // Silent fail in production - error is handled gracefully
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching AliExpress products:', error);
      }
      setAliExpressProducts(prev => append ? prev : []);
      setAliExpressError(null);
      setHasMoreAliExpressProducts(false);
    } finally {
      setIsLoadingAliExpress(false);
      setIsLoadingMoreAliExpress(false);
    }
  }, [activeTab, shipToCountry, shipFromCountry, sortBy, minPrice, maxPrice]);

  // Initial load and search term change
  useEffect(() => {
    if (activeTab === 'aliexpress') {
      setCurrentPage(1);
      setHasMoreAliExpressProducts(true);
      fetchAliExpressProducts(currentSearchTerm, 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentSearchTerm, shipToCountry, shipFromCountry, sortBy, minPrice, maxPrice, fetchAliExpressProducts]);

  // Ref for intersection observer sentinel
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading - loads when sentinel row comes into view
  useEffect(() => {
    if (activeTab !== 'aliexpress') return;

    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingAliExpress && !isLoadingMoreAliExpress && hasMoreAliExpressProducts) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchAliExpressProducts(currentSearchTerm, nextPage, true);
        }
      },
      {
        root: null,
        rootMargin: '100px', // Load when sentinel is 100px from viewport
        threshold: 0
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [activeTab, currentPage, currentSearchTerm, isLoadingAliExpress, isLoadingMoreAliExpress, hasMoreAliExpressProducts, fetchAliExpressProducts]);

  // Note: Filter changes (shipToCountry, shipFromCountry, sortBy) are handled by
  // the fetchAliExpressProducts dependency on these values - no separate useEffect needed

  // Shipping costs cache
  const [shippingCosts, setShippingCosts] = useState<Record<string, number>>({});
  const shippingFetchedRef = useRef<Set<string>>(new Set());

  // Fetch shipping costs for products that don't have shipping data from the search API
  // This is a fallback - the new API should include shipping in search results
  useEffect(() => {
    if (activeTab !== 'aliexpress' || aliExpressProducts.length === 0) return;

    const fetchShippingForProducts = async () => {
      // Only fetch for products where shipping is -1 (not available from search API)
      // and we haven't already fetched it
      const productsNeedingShipping = aliExpressProducts.filter(
        p => p.shipping === -1 && !p.freeShipping && !shippingFetchedRef.current.has(p.id)
      );

      if (productsNeedingShipping.length === 0) return;

      // Fetch shipping for each product (limit concurrent requests)
      const batchSize = 5;
      for (let i = 0; i < productsNeedingShipping.length; i += batchSize) {
        const batch = productsNeedingShipping.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(async (product) => {
            shippingFetchedRef.current.add(product.id);
            const shipping = await getShippingCost(product.id, getCountryCode(shipToCountry));
            return { id: product.id, cost: shipping?.shippingCost ?? -1 };
          })
        );

        // Update shipping costs state
        const newCosts: Record<string, number> = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            newCosts[result.value.id] = result.value.cost;
          }
        });

        if (Object.keys(newCosts).length > 0) {
          setShippingCosts(prev => ({ ...prev, ...newCosts }));
        }
      }
    };

    fetchShippingForProducts();
  }, [aliExpressProducts, activeTab, shipToCountry]);

  // Filter state for actual filtering logic
  const [priceFilter, setPriceFilter] = useState({ min: 0.00, max: 0.00 });
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("United States");
  const [shipFromFilter, setShipFromFilter] = useState("ALL");

  // Supplier authentication data
  const supplierAuthData = [
    { 
      name: 'AliExpress', 
      connected: true, 
      icon: '/aliexpressQualityControl.png' 
    },
    { 
      name: 'Temu', 
      connected: true, 
      icon: '/temuQualityControl.jfif' 
    },
    { 
      name: 'Alibaba', 
      connected: false, 
      icon: '/alibabaQualityControl.jfif' 
    },
    { 
      name: 'Banggood', 
      connected: true, 
      icon: '/banggoodQualityControl.png' 
    }
  ];

  // Apply filters function - sync local filter state for UI display
  const applyFilters = () => {
    setPriceFilter({ min: minPrice, max: maxPrice });
    setDeliveryFilter(deliveryTime);
    setCountryFilter(shipToCountry);
    setShipFromFilter(shipFromCountry);
    // Note: Actual API filtering is handled by the useEffect watching these values
  };

  // Sync filter state when values change (for UI display purposes)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, deliveryTime, shipToCountry, shipFromCountry]);

  // Load more products function
  const loadMoreProducts = () => {
    if (isLoadingMore || !hasMoreProducts) return;
    
    setIsLoadingMore(true);
    
    // Mock API call delay
    setTimeout(() => {
      const allMockProducts = [...temuSampleProducts, ...sampleProducts, ...sampleProductsPage2];
      
      setTemuProducts(prev => {
        const currentLength = prev.length;
        const nextProducts = allMockProducts.slice(currentLength, currentLength + 10);
        
        if (nextProducts.length > 0) {
          return [...prev, ...nextProducts];
        }
        
        return prev;
      });
      
      setTemuProducts(prev => {
        // Check if we have more products to load
        if (prev.length >= allMockProducts.length) {
          setHasMoreProducts(false);
        }
        return prev;
      });
      
      setIsLoadingMore(false);
    }, 1500); // 1.5 second delay to simulate network request
  };

  // Infinite scroll effect
  useEffect(() => {
    if (activeTab !== "temu") return;

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoadingMore) {
        return;
      }
      loadMoreProducts();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, isLoadingMore, hasMoreProducts]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Placeholder for image matching logic
      console.log("Image uploaded:", file.name);
      // TODO: Implement image matching logic
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = () => {
    const term = searchQuery.trim() || getRandomDefaultTerm();
    setCurrentSearchTerm(term);
    setCurrentPage(1);
  };


  // Sample product data
  const sampleProducts = [
    {
      id: "1",
      title: "Stainless Steel French Fries Slicer Vegetable Food Cut Pieces Machine Heavy Duty Cutter For Potato Kitchen Gadgets Potato Slicer",
      price: 24.99,
      endPrice: 29.99,
      discount: 50,
      orders: 1247,
      shipping: 3.99,
      rating: 4.5,
      reviews: 523,
      image: "https://ae01.alicdn.com/kf/Sd7713777c39b4fff96c60c9bb5cd8c2eI.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "2",
      title: "LNGXO Thick Warm Fleece Hiking Pants Men Winter Waterproof Windproof Outdoor Soft Shell Rain Trousers Trekking Camping Ski Pants",
      price: 39.99,
      endPrice: 45.99,
      discount: 50,
      orders: 856,
      shipping: 0,
      rating: 4.2,
      reviews: 342,
      image: "https://ae01.alicdn.com/kf/H03c8b3b9c3734cf7aaaeab266dc69ecfU.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "3",
      title: "6Pcs Step Drill Bit Saw Drill Bit Set Titanium Milling Cutter 4-12 4-20 4-32mm 3 6 8mm For Woodworking Metal Core Hole Opener",
      price: 18.99,
      endPrice: 24.99,
      discount: 47,
      orders: 2134,
      shipping: 2.50,
      rating: 4.7,
      reviews: 789,
      image: "https://ae01.alicdn.com/kf/Sa17c533fc83447359d556d89221b7da6j.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "4",
      title: "Mini Electric Drill USB Rechargeable Cordless Engraving Pen Dremel Tools Rotary Tool Cordless Hand Drill Mini Polisher for Hand",
      price: 12.99,
      endPrice: 16.99,
      discount: 43,
      orders: 3421,
      shipping: 1.99,
      rating: 4.3,
      reviews: 1156,
      image: "https://ae01.alicdn.com/kf/Sc7a1a1ebf80643608ef3cd376f741273o.png",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "5",
      title: "Multifunction Potato Cutter Stainless Steel Cut Manual Vegetable Cutter Tool Fast Cutting With 2 Blades Manual Fries Machine",
      price: 29.99,
      endPrice: 34.99,
      discount: 50,
      orders: 678,
      shipping: 4.99,
      rating: 4.6,
      reviews: 287,
      image: "https://ae01.alicdn.com/kf/Scdf5799d015e4acabdf1d2e9e7901073Q.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "6",
      title: "Wireless Bluetooth Earbuds TWS 5.0 Stereo Sound Noise Cancelling Headphones with Charging Case Waterproof Sports Earphones",
      price: 15.99,
      endPrice: 19.99,
      discount: 45,
      orders: 4521,
      shipping: 0,
      rating: 4.4,
      reviews: 1823,
      image: "https://ae01.alicdn.com/kf/Sd7713777c39b4fff96c60c9bb5cd8c2eI.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "7",
      title: "Smart Watch Fitness Tracker Heart Rate Monitor Sleep Tracking Waterproof Sports Smartwatch for Android iOS",
      price: 45.99,
      endPrice: 59.99,
      discount: 52,
      orders: 2876,
      shipping: 2.99,
      rating: 4.1,
      reviews: 967,
      image: "https://ae01.alicdn.com/kf/H03c8b3b9c3734cf7aaaeab266dc69ecfU.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "8",
      title: "LED Strip Lights RGB Color Changing 16.4ft Flexible Light Strip with Remote Control for Bedroom Room Decoration",
      price: 22.99,
      endPrice: 28.99,
      discount: 48,
      orders: 1654,
      shipping: 1.50,
      rating: 4.6,
      reviews: 743,
      image: "https://ae01.alicdn.com/kf/Sa17c533fc83447359d556d89221b7da6j.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "9",
      title: "Portable Phone Stand Adjustable Desktop Holder for iPhone iPad Tablet Universal Mobile Phone Accessories",
      price: 8.99,
      endPrice: 12.99,
      discount: 41,
      orders: 5432,
      shipping: 0,
      rating: 4.8,
      reviews: 2156,
      image: "https://ae01.alicdn.com/kf/Sc7a1a1ebf80643608ef3cd376f741273o.png",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    },
    {
      id: "10",
      title: "Car Phone Mount Dashboard Windshield Holder 360 Degree Rotation Universal Car Accessories for GPS Navigation",
      price: 16.99,
      endPrice: 21.99,
      discount: 44,
      orders: 3287,
      shipping: 3.50,
      rating: 4.3,
      reviews: 1098,
      image: "https://ae01.alicdn.com/kf/Scdf5799d015e4acabdf1d2e9e7901073Q.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080"
    }
  ];

  // Temu-specific sample products
  const temuSampleProducts = [
    {
      id: "temu-1",
      title: "Women's casual home clothes",
      price: 5.38,
      endPrice: 7.05,
      discount: 0,
      orders: 1000000,
      shipping: 0,
      rating: 0,
      reviews: 0,
      image: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/304795be9074ac653f8f991cd3380f04.jpg",
      productUrl: "https://www.temu.com/item/1005008941079543.html",
      isImported: false
    },
    ...sampleProducts.slice(1, 10).map(product => ({...product, id: `temu-${product.id}`}))
  ];

  // Mock data for page 2
  const sampleProductsPage2 = [
    {
      id: "11",
      title: "Wireless Gaming Mouse RGB LED Backlit 6400 DPI Adjustable Optical Gaming Mice for PC Laptop Computer",
      price: 19.99,
      endPrice: 24.99,
      discount: 42,
      orders: 3876,
      shipping: 0,
      rating: 4.4,
      reviews: 1542,
      image: "https://ae01.alicdn.com/kf/Sd7713777c39b4fff96c60c9bb5cd8c2eI.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "12",
      title: "Bluetooth 5.0 Wireless Headphones Over Ear Hi-Fi Stereo Foldable Headset with Microphone Support TF Card",
      price: 32.99,
      endPrice: 39.99,
      discount: 46,
      orders: 2154,
      shipping: 2.99,
      rating: 4.6,
      reviews: 876,
      image: "https://ae01.alicdn.com/kf/H03c8b3b9c3734cf7aaaeab266dc69ecfU.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "13",
      title: "USB C Hub 7 in 1 Type C Adapter with 4K HDMI USB 3.0 Ports SD/TF Card Reader for MacBook Pro Air",
      price: 25.99,
      endPrice: 31.99,
      discount: 48,
      orders: 1987,
      shipping: 1.50,
      rating: 4.3,
      reviews: 654,
      image: "https://ae01.alicdn.com/kf/Sa17c533fc83447359d556d89221b7da6j.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "14",
      title: "Mechanical Gaming Keyboard RGB Backlit 87 Keys Blue Switch Wired USB Gaming Keyboard for PC Gamer",
      price: 45.99,
      endPrice: 55.99,
      discount: 51,
      orders: 1432,
      shipping: 3.99,
      rating: 4.7,
      reviews: 743,
      image: "https://ae01.alicdn.com/kf/Sc7a1a1ebf80643608ef3cd376f741273o.png",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "15",
      title: "Portable External Hard Drive 1TB 2TB USB 3.0 HDD Storage Device for PC Mac Laptop Desktop",
      price: 89.99,
      endPrice: 109.99,
      discount: 44,
      orders: 876,
      shipping: 0,
      rating: 4.5,
      reviews: 432,
      image: "https://ae01.alicdn.com/kf/Scdf5799d015e4acabdf1d2e9e7901073Q.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "16",
      title: "Wireless Charging Pad 15W Fast Qi Wireless Charger for iPhone Samsung Galaxy AirPods Pro",
      price: 16.99,
      endPrice: 21.99,
      discount: 43,
      orders: 2987,
      shipping: 1.99,
      rating: 4.2,
      reviews: 1098,
      image: "https://ae01.alicdn.com/kf/Sd7713777c39b4fff96c60c9bb5cd8c2eI.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "17",
      title: "4K Webcam with Microphone HD Web Camera USB Plug and Play for PC Laptop Desktop Video Calling",
      price: 28.99,
      endPrice: 35.99,
      discount: 47,
      orders: 1654,
      shipping: 2.50,
      rating: 4.4,
      reviews: 567,
      image: "https://ae01.alicdn.com/kf/H03c8b3b9c3734cf7aaaeab266dc69ecfU.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "18",
      title: "Laptop Stand Adjustable Aluminum Alloy Notebook Holder Ergonomic Cooling Pad for MacBook Pro Air",
      price: 22.99,
      endPrice: 28.99,
      discount: 45,
      orders: 2341,
      shipping: 0,
      rating: 4.6,
      reviews: 891,
      image: "https://ae01.alicdn.com/kf/Sa17c533fc83447359d556d89221b7da6j.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "19",
      title: "USB Flash Drive 128GB 256GB High Speed USB 3.0 Pen Drive Memory Stick for Computer Laptop",
      price: 12.99,
      endPrice: 16.99,
      discount: 41,
      orders: 4521,
      shipping: 1.50,
      rating: 4.3,
      reviews: 1876,
      image: "https://ae01.alicdn.com/kf/Sc7a1a1ebf80643608ef3cd376f741273o.png",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    },
    {
      id: "20",
      title: "Bluetooth Speaker Portable Wireless Speaker with Deep Bass Stereo Sound 24H Playtime for Outdoor",
      price: 35.99,
      endPrice: 42.99,
      discount: 49,
      orders: 1987,
      shipping: 2.99,
      rating: 4.5,
      reviews: 743,
      image: "https://ae01.alicdn.com/kf/Scdf5799d015e4acabdf1d2e9e7901073Q.jpg",
      productUrl: "https://www.aliexpress.com/item/1005008941079543.html?supplyId=159831080",
      isImported: false
    }
  ];

  // Initialize Temu products state
  const [temuProducts, setTemuProducts] = useState(() => temuSampleProducts);

  // Get current page products
  const getCurrentPageProducts = () => {
    return currentPage === 1 ? sampleProducts : sampleProductsPage2;
  };

  // Get current products based on active tab
  const getCurrentProducts = () => {
    if (activeTab === "temu") {
      return temuProducts;
    }
    if (activeTab === "aliexpress") {
      return aliExpressProducts.length > 0 ? aliExpressProducts : getCurrentPageProducts();
    }
    return getCurrentPageProducts();
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    const currentProducts = getCurrentProducts();
    if (checked) {
      setSelectedProductIds(prev => {
        const newIds = [...prev, productId];
        // Update isChecked state based on whether all products are selected
        setIsChecked(newIds.length === currentProducts.length);
        setSelectedProducts(newIds.length);
        return newIds;
      });
    } else {
      setSelectedProductIds(prev => {
        const newIds = prev.filter(id => id !== productId);
        // Update isChecked state - false if no products selected OR not all selected
        setIsChecked(newIds.length === currentProducts.length);
        setSelectedProducts(newIds.length);
        return newIds;
      });
    }
  };

  // Convert DisplayProduct to ImportListItem format
  const convertToImportListItem = (product: DisplayProduct, vendor: string = 'AliExpress'): ImportListItem => {
    return {
      id: product.id,
      name: product.title,
      supplier: vendor,
      supplierLogo: vendor === 'AliExpress' ? '/aliexpressQualityControl.png' :
                    vendor === 'Temu' ? '/temuQualityControl.jfif' : '/aliexpressQualityControl.png',
      price: `$${product.price.toFixed(2)}`,
      originalPrice: `$${product.endPrice.toFixed(2)}`,
      discount: product.discount > 0 ? `${product.discount}%` : '',
      rating: product.rating,
      reviews: product.reviews || 0,
      image: product.image,
      images: product.images || [product.image], // All product images
      category: 'General',
      addedDate: new Date().toISOString(),
      status: 'pending',
      stock: 999,
      minOrder: 1,
      weight: { value: 0.1, unit: 'kg' },
      dimensions: { length: 10, width: 10, height: 5, unit: 'cm' },
      productUrl: product.productUrl,
      shippingCost: product.shipping >= 0 ? product.shipping : undefined,
    };
  };

  // Handle importing selected products to import list
  const handleImportProducts = async () => {
    if (selectedProductIds.length === 0) return;

    const currentProducts = getCurrentProducts();
    const selectedProducts = currentProducts.filter(p => selectedProductIds.includes(p.id));

    // For AliExpress products, fetch full details for all selected products in parallel
    let productsWithFullImages = selectedProducts;
    if (activeTab === 'aliexpress') {
      const detailsPromises = selectedProducts.map(async (product) => {
        try {
          const productDetails = await getProductDetails(product.id, shipToCountry);
          if (productDetails?.images && productDetails.images.length > 0) {
            return { ...product, images: productDetails.images };
          }
        } catch (error) {
          console.error(`Failed to fetch details for product ${product.id}:`, error);
        }
        return product;
      });
      productsWithFullImages = await Promise.all(detailsPromises);
    }

    const productsToImport = productsWithFullImages.map(p =>
      convertToImportListItem(p, activeTab === 'temu' ? 'Temu' : 'AliExpress')
    );

    addToImportList(productsToImport);

    // Refresh the sidebar count immediately
    refreshImportListCount();

    // Update products to show as imported
    if (activeTab === 'aliexpress') {
      setAliExpressProducts(prev =>
        prev.map(p => selectedProductIds.includes(p.id) ? { ...p, isImported: true } : p)
      );
    } else if (activeTab === 'temu') {
      setTemuProducts(prev =>
        prev.map(p => selectedProductIds.includes(p.id) ? { ...p, isImported: true } : p)
      );
    }

    // Clear selection
    setSelectedProductIds([]);
    setSelectedProducts(0);
    setIsChecked(false);
  };

  // Handle single product import
  const handleSingleImport = async (product: DisplayProduct) => {
    if (product.isImported) return;

    // For AliExpress products, fetch full product details to get all images
    let fullImages = product.images || [product.image];
    if (activeTab === 'aliexpress') {
      try {
        const productDetails = await getProductDetails(product.id, shipToCountry);
        if (productDetails?.images && productDetails.images.length > 0) {
          fullImages = productDetails.images;
        }
      } catch (error) {
        console.error('Failed to fetch full product details, using search images:', error);
      }
    }

    // Create import item with full images
    const productWithFullImages = { ...product, images: fullImages };
    const importItem = convertToImportListItem(productWithFullImages, activeTab === 'temu' ? 'Temu' : 'AliExpress');
    addToImportList([importItem]);

    // Refresh the sidebar count immediately
    refreshImportListCount();

    // Update product to show as imported
    if (activeTab === 'aliexpress') {
      setAliExpressProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, isImported: true } : p)
      );
    } else if (activeTab === 'temu') {
      setTemuProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, isImported: true } : p)
      );
    }

    // Remove from selection if it was selected
    if (selectedProductIds.includes(product.id)) {
      setSelectedProductIds(prev => prev.filter(id => id !== product.id));
      setSelectedProducts(prev => Math.max(0, prev - 1));
    }

    console.log(`Successfully imported product: ${product.title.substring(0, 50)}...`);
  };

  const vendorLogos = {
    aliexpress: '/aliexpressFindProducts.png',
    temu: '/temuFindProducts.jfif',
    alibaba: '/alibabaFindProducts.jfif',
    banggood: '/banggoodFindProducts.png',
  };

  const renderSearchBar = (vendor: string, logoSrc: string) => (
    <div className="flex items-center gap-1.5 md:gap-2">
      {/* Mobile: Vendor Logo Selector Dropdown */}
      <div className="md:hidden flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 px-2 gap-1">
              <Image
                src={logoSrc}
                alt={`${vendor} logo`}
                width={70}
                height={24}
                className="h-5 w-auto object-contain"
                priority
                unoptimized
              />
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem onClick={() => setActiveTab("aliexpress")} className={activeTab === "aliexpress" ? "bg-muted" : ""}>
              <Image src={vendorLogos.aliexpress} alt="AliExpress" width={80} height={24} className="h-5 w-auto object-contain" unoptimized />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("temu")} className={activeTab === "temu" ? "bg-muted" : ""}>
              <Image src={vendorLogos.temu} alt="Temu" width={80} height={24} className="h-5 w-auto object-contain" unoptimized />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("alibaba")} className={activeTab === "alibaba" ? "bg-muted" : ""}>
              <Image src={vendorLogos.alibaba} alt="Alibaba" width={80} height={24} className="h-5 w-auto object-contain" unoptimized />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab("banggood")} className={activeTab === "banggood" ? "bg-muted" : ""}>
              <Image src={vendorLogos.banggood} alt="Banggood" width={80} height={24} className="h-5 w-auto object-contain" unoptimized />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsManageSuppliersOpen(true)} className="gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Manage Suppliers</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: Static Vendor Logo */}
      <div className="hidden md:flex flex-shrink-0">
        <Image
          src={logoSrc}
          alt={`${vendor} logo`}
          width={80}
          height={28}
          className="h-7 w-auto object-contain"
          priority
          unoptimized
        />
      </div>

      {/* Search Input - ShadCN */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 md:h-10 pl-8 md:pl-9 pr-9 md:pr-10 rounded-lg text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        {vendor !== "Temu" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCameraClick}
            className="absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2 h-7 w-7 md:h-8 md:w-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground md:size-[22px]">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      {vendor !== "Temu" && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      )}

      {/* Search Button - smaller on mobile */}
      <Button onClick={handleSearch} size="icon" className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );

  // Gray bar content component (shared between in-flow and fixed versions)
  const GrayBarContent = () => {
    const currentProducts = getCurrentProducts();
    const hasSelection = selectedProductIds.length > 0;

    return (
      <div className="flex items-center gap-1.5 md:gap-2 w-full p-1.5 md:p-2 md:rounded-xl bg-muted md:bg-card md:border">
        {/* Left: Checkbox + Import button (when nothing selected) OR Checkbox + count (when selected) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Checkbox
            checked={selectedProductIds.length === currentProducts.length && currentProducts.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setIsChecked(true);
                setSelectedProducts(currentProducts.length);
                setSelectedProductIds(currentProducts.map(p => p.id));
              } else {
                setIsChecked(false);
                setSelectedProducts(0);
                setSelectedProductIds([]);
              }
            }}
            className="h-4 w-4"
          />
          {hasSelection ? (
            <span className="text-xs font-medium text-primary whitespace-nowrap">
              {selectedProductIds.length}
            </span>
          ) : (
            <Button
              size="sm"
              disabled
              className="h-7 px-2 md:px-3 text-xs font-medium gap-1 bg-muted text-muted-foreground hover:bg-muted"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border flex-shrink-0"></div>

        {/* Center: Filters */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide min-w-0">
          <Select value={shipFromCountry} onValueChange={setShipFromCountry}>
            <SelectTrigger size="sm" className="h-7 w-auto min-w-0 px-1.5 md:px-2 py-0 text-xs border bg-background rounded-md gap-1">
              <span className="text-muted-foreground text-xs">From</span>
              <span className="font-medium">{shipFromCountry === 'ALL' ? 'ALL' : shipFromCountry.slice(0, 2).toUpperCase()}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Countries</SelectItem>
              <SelectItem value="China">China</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
            </SelectContent>
          </Select>

          <Select value={shipToCountry} onValueChange={setShipToCountry}>
            <SelectTrigger size="sm" className="h-7 w-auto min-w-0 px-1.5 md:px-2 py-0 text-xs border bg-background rounded-md gap-1">
              <span className="text-muted-foreground text-xs">To</span>
              <span className="font-medium">{shipToCountry.slice(0, 2).toUpperCase()}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="Brazil">Brazil</SelectItem>
              <SelectItem value="Mexico">Mexico</SelectItem>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Sheet Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-1.5 md:px-2 gap-1">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span className="hidden sm:inline text-xs">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] sm:max-w-[400px] px-4 py-4">
              <SheetHeader className="space-y-2 pb-4 w-full">
                <SheetTitle className="text-2xl font-semibold text-left w-full">Filter Products</SheetTitle>
                <SheetDescription className="text-sm text-left text-foreground w-full">
                  Refine your product search with these filters.
                </SheetDescription>
              </SheetHeader>
              <Accordion type="multiple" className="w-full px-5">
                  <AccordionItem value="delivery-time" className="border-0 py-2">
                    <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
                      Delivery Time
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1">
                      <div className="space-y-4">
                        <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime} className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="3-days" id="3-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                            <Label htmlFor="3-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                              Within 3 Days
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="5-days" id="5-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                            <Label htmlFor="5-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                              Within 5 Days
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="7-days" id="7-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                            <Label htmlFor="7-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                              Within 7 Days
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="10-days" id="10-days" className="h-5 w-5 border-solid border-2 focus:border-primary transition-all duration-200" />
                            <Label htmlFor="10-days" className="text-base font-normal cursor-pointer transition-colors duration-200">
                              Within 10 Days
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <div className="h-[1px] bg-border w-full"></div>
                  <AccordionItem value="purchase-price" className="border-0 py-2">
                    <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
                      Purchase Price
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between py-1 px-1">
                          <IncrementButton
                            value={minPrice}
                            onChange={setMinPrice}
                            label="Lowest Price"
                            symbol="$"
                            symbolPosition="left"
                            showDecimals={true}
                            decimalPlaces={2}
                            min={0}
                            max={999999}
                            step={1}
                            width="w-[130px]"
                            className="text-base"
                            showLabel={true}
                            showSymbol={true}
                          />

                          {/* Horizontal Line */}
                          <div className="h-[1px] w-[14px] bg-gray-700 dark:bg-gray-400 mx-2 mt-5"></div>

                          <IncrementButton
                            value={maxPrice}
                            onChange={setMaxPrice}
                            label="Highest Price"
                            symbol="$"
                            symbolPosition="left"
                            showDecimals={true}
                            decimalPlaces={2}
                            min={minPrice}
                            max={999999}
                            step={1}
                            width="w-[130px]"
                            className="text-base"
                            showLabel={true}
                            showSymbol={true}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
              </Accordion>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right: Import Button (transforms based on selection) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsChecked(false);
                setSelectedProducts(0);
                setSelectedProductIds([]);
              }}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleImportProducts}
            disabled={!hasSelection}
            className={`h-7 px-2 md:px-3 text-xs font-medium gap-1 transition-all ${
              hasSelection
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-muted text-muted-foreground hover:bg-muted'
            }`}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Import</span>
            {hasSelection && (
              <span className="text-[10px] font-bold">{selectedProductIds.length}</span>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Gray bar - in document flow, sticks when scrolled
  const renderGrayBar = () => {
    return (
      <div className="sticky top-[150px] md:top-[280px] z-20 bg-background pb-[10px]">
        <GrayBarContent />
      </div>
    );
  };

  const renderTemuGrayBar = () => {
    const currentProducts = temuProducts;
    return (
    <div className="mb-3 w-full bg-background py-1 border-0 sticky z-20" style={{ top: 'calc(14rem + 5rem)' }}>
      <div className="space-y-3">
        {/* Import List Row */}
        <div className="flex items-center justify-between h-16 w-full px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-background">
          <div className="flex items-center space-x-3">
            <div
              className="relative h-5 w-5 cursor-pointer"
              onClick={() => {
                if (selectedProductIds.length === currentProducts.length && selectedProductIds.length > 0) {
                  // Unselect all products
                  setIsChecked(false);
                  setSelectedProducts(0);
                  setSelectedProductIds([]);
                } else {
                  // Select all products
                  setIsChecked(true);
                  setSelectedProducts(currentProducts.length);
                  setSelectedProductIds(currentProducts.map(p => p.id));
                }
              }}
            >
              <div
                className={`
                  peer w-5 h-5 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none
                  flex items-center justify-center
                  ${selectedProductIds.length === 0
                    ? 'border-input dark:bg-input/30'
                    : 'bg-primary text-primary-foreground border-primary dark:bg-primary'
                  }
                `}
              >
                {selectedProductIds.length === 0 && ''}
                {selectedProductIds.length > 0 && selectedProductIds.length < currentProducts.length && '−'}
                {selectedProductIds.length === currentProducts.length && selectedProductIds.length > 0 && (
                  <CheckIcon className="size-3.5" />
                )}
              </div>
            </div>
            <Button
              variant="default"
              onClick={handleImportProducts}
              disabled={selectedProductIds.length === 0}
              className={selectedProductIds.length > 0 ? "bg-primary hover:bg-[linear-gradient(90deg,#42A5F5_0%,#64B5F6_100%)]" : "bg-gray-200 hover:bg-gray-200 text-gray-600"}
            >
              Add to Import List ({selectedProductIds.length}/{currentProducts.length})
            </Button>
          </div>

          <div className="flex items-center">
            {/* Ship To Selector */}
            <div className="flex items-center">
              <span className="text-base font-medium text-foreground mr-2">Ship to:</span>
              <Select value={shipToCountry} onValueChange={setShipToCountry}>
                <SelectTrigger className="w-[160px] h-8 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="South Korea">South Korea</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Norway">Norway</SelectItem>
                  <SelectItem value="Denmark">Denmark</SelectItem>
                  <SelectItem value="Finland">Finland</SelectItem>
                  <SelectItem value="Belgium">Belgium</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Austria">Austria</SelectItem>
                  <SelectItem value="Poland">Poland</SelectItem>
                  <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                  <SelectItem value="Hungary">Hungary</SelectItem>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="Greece">Greece</SelectItem>
                  <SelectItem value="Turkey">Turkey</SelectItem>
                  <SelectItem value="Russia">Russia</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="Israel">Israel</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Thailand">Thailand</SelectItem>
                  <SelectItem value="Vietnam">Vietnam</SelectItem>
                  <SelectItem value="Philippines">Philippines</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Chile">Chile</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Peru">Peru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filter and Sort Row */}
        <div className="flex items-center justify-between h-12 w-full px-4">
          <div className="flex items-center">
            <span className="text-base font-medium text-foreground">All Categories</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-base font-medium text-foreground mr-2">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-8 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Default">Default</SelectItem>
                <SelectItem value="Orders">Orders</SelectItem>
                <SelectItem value="Newest">Newest</SelectItem>
                <SelectItem value="Price Low to High">
                  <div className="flex items-center">
                    Price
                    <ArrowUp className="ml-1 h-3 w-3" />
                  </div>
                </SelectItem>
                <SelectItem value="Price High to Low">
                  <div className="flex items-center">
                    Price
                    <ArrowDown className="ml-1 h-3 w-3" />
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderTemuProductGrid = () => (
    <div className="py-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
        {temuProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProductIds.includes(product.id)}
            onSelect={handleProductSelect}
            onImport={handleSingleImport}
            onSupplierOptimizer={(id) => console.log('Supplier Optimizer clicked for product:', id)}
            shippingCost={shippingCosts[product.id]}
          />
        ))}
      </div>

      {/* Loading Spinner */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* End of products message */}
      {!hasMoreProducts && temuProducts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No more products to load</p>
        </div>
      )}
    </div>
  );

  const renderProductGrid = () => {
    // Get the products to display based on the active tab
    const productsToDisplay = activeTab === 'aliexpress' && aliExpressProducts.length > 0
      ? aliExpressProducts
      : getCurrentPageProducts();

    return (
    <div className="pt-2 pb-6 md:py-6">
      {/* Loading State */}
      {isLoadingAliExpress && activeTab === 'aliexpress' && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading products from AliExpress...</p>
        </div>
      )}

      {/* Error State */}
      {aliExpressError && activeTab === 'aliexpress' && !isLoadingAliExpress && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-500 mb-4">{aliExpressError}</p>
          <Button onClick={() => fetchAliExpressProducts(searchQuery, currentPage)}>
            Try Again
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {((!isLoadingAliExpress && aliExpressProducts.length > 0) || activeTab !== 'aliexpress') && !(aliExpressError && activeTab === 'aliexpress') && (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
        {productsToDisplay.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProductIds.includes(product.id)}
            onSelect={handleProductSelect}
            onImport={handleSingleImport}
            onSupplierOptimizer={(id) => console.log('Supplier Optimizer clicked for product:', id)}
            shippingCost={shippingCosts[product.id]}
          />
        ))}
      </div>
      )}

      {/* Intersection Observer Sentinel - triggers loading when visible */}
      {activeTab === 'aliexpress' && hasMoreAliExpressProducts && !isLoadingAliExpress && (
        <div ref={loadMoreSentinelRef} className="h-1 w-full" />
      )}

      {/* Infinite Scroll Loading Indicator */}
      {isLoadingMoreAliExpress && activeTab === 'aliexpress' && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* End of products message */}
      {!hasMoreAliExpressProducts && aliExpressProducts.length > 0 && activeTab === 'aliexpress' && !isLoadingAliExpress && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No more products to load</p>
        </div>
      )}
    </div>
  );
  };

  const renderPagination = () => (
    <div className="py-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );

  // Search bar header - not memoized to ensure ref works properly
  const getVendorData = () => {
    switch (activeTab) {
      case 'aliexpress': return { vendor: 'AliExpress', logoSrc: '/aliexpressFindProducts.png' };
      case 'temu': return { vendor: 'Temu', logoSrc: '/temuFindProducts.jfif' };
      case 'alibaba': return { vendor: 'Alibaba', logoSrc: '/alibabaFindProducts.jfif' };
      case 'banggood': return { vendor: 'Banggood', logoSrc: '/banggoodFindProducts.png' };
      default: return { vendor: 'AliExpress', logoSrc: '/aliexpressFindProducts.png' };
    }
  };
  const { vendor: currentVendor, logoSrc: currentLogoSrc } = getVendorData();

  const searchBarHeaderContent = (
    <div
      className="fixed z-40 bg-background left-0 right-0 md:left-[272px] top-[104px] md:top-56 h-[46px] md:h-14 flex items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-2 md:px-4">
        {renderSearchBar(currentVendor, currentLogoSrc)}
      </div>
    </div>
  );

  const TabsHeader = () => (
    <div
      className="fixed z-30 bg-background hidden md:block md:top-28 left-0 right-0 md:left-[272px] overflow-visible md:h-auto"
    >
      <div className="mx-auto w-full max-w-6xl px-2 md:px-4 py-1 md:py-6">
        <div className="flex items-center h-10 md:h-16">
          {/* Mobile: Dropdown selector */}
          <div className="md:hidden flex-1">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-9 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aliexpress">AliExpress</SelectItem>
                <SelectItem value="temu">Temu</SelectItem>
                <SelectItem value="alibaba">Alibaba</SelectItem>
                <SelectItem value="banggood">Banggood</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Horizontal tabs */}
          <div className="hidden md:flex items-center flex-1 gap-2">
            <button
              onClick={() => setActiveTab("aliexpress")}
              className={`flex-shrink-0 text-base font-medium px-5 py-2 rounded-3xl transition-colors ${
                activeTab === "aliexpress"
                  ? "bg-foreground text-background dark:bg-slate-700 dark:text-white"
                  : "bg-transparent text-muted-foreground border border-muted-foreground/25 hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              AliExpress
            </button>
            <button
              onClick={() => setActiveTab("temu")}
              className={`flex-shrink-0 text-base font-medium px-5 py-2 rounded-3xl transition-colors ${
                activeTab === "temu"
                  ? "bg-foreground text-background dark:bg-slate-700 dark:text-white"
                  : "bg-transparent text-muted-foreground border border-muted-foreground/25 hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Temu
            </button>
            <button
              onClick={() => setActiveTab("alibaba")}
              className={`flex-shrink-0 text-base font-medium px-5 py-2 rounded-3xl transition-colors ${
                activeTab === "alibaba"
                  ? "bg-foreground text-background dark:bg-slate-700 dark:text-white"
                  : "bg-transparent text-muted-foreground border border-muted-foreground/25 hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Alibaba
            </button>
            <button
              onClick={() => setActiveTab("banggood")}
              className={`flex-shrink-0 text-base font-medium px-5 py-2 rounded-3xl transition-colors ${
                activeTab === "banggood"
                  ? "bg-foreground text-background dark:bg-slate-700 dark:text-white"
                  : "bg-transparent text-muted-foreground border border-muted-foreground/25 hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Banggood
            </button>
          </div>

          {/* Add Supplier Platform Menu - Hidden on mobile */}
          <div className="hidden md:flex ml-4 items-center h-12 flex-shrink-0 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200 select-none whitespace-nowrap relative">
                  Add Supplier Platform
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 z-50">
                <div className="px-3 py-2 border-b">
                  <h4 className="font-semibold text-sm">Add Supplier Platform</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect to supplier marketplaces
                  </p>
                </div>
                <div className="p-2">
                  {supplierAuthData.map((supplier) => (
                    <DropdownMenuItem key={supplier.name} className="flex items-center justify-between p-4 h-16 rounded-lg hover:!bg-[var(--dsi-blue-200)] cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                          <Image
                            src={supplier.icon}
                            alt={`${supplier.name} icon`}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{supplier.name}</div>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={supplier.connected ? "default" : "outline"}
                              size="sm"
                              className={`h-7 text-sm px-3 ml-2 ${
                                supplier.connected 
                                  ? 'bg-emerald-700 text-white border-emerald-700 font-normal shadow-sm' 
                                  : 'hover:!bg-green-500 hover:!text-white hover:!border-green-500 transition-all duration-200'
                              }`}
                              disabled={supplier.connected}
                            >
                              {supplier.connected ? 'Connected' : 'Connect'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{supplier.connected ? `Your ${supplier.name} account is connected` : `You have not linked your ${supplier.name} account, click here to link`}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMounted && createPortal(<TabsHeader />, document.body)}
      {isMounted && createPortal(searchBarHeaderContent, document.body)}
      <div className="h-full w-full pt-[46px] md:pt-44">
        <div className="mx-auto w-full max-w-6xl px-2 md:px-4">
          {/* Tab Content */}
          {activeTab === "aliexpress" && (
            <>
              {renderGrayBar()}
              {renderProductGrid()}
            </>
          )}

          {activeTab === "temu" && (
            <>
              {renderTemuGrayBar()}
              {renderTemuProductGrid()}
            </>
          )}

          {activeTab === "alibaba" && (
            <>
              {renderGrayBar()}
              {renderProductGrid()}
              {renderPagination()}
            </>
          )}

          {activeTab === "banggood" && (
            <>
              {renderGrayBar()}
              {renderProductGrid()}
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* Mobile: Manage Suppliers Sheet */}
      <Sheet open={isManageSuppliersOpen} onOpenChange={setIsManageSuppliersOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl md:hidden">
          <SheetHeader className="pb-4">
            <SheetTitle>Manage Suppliers</SheetTitle>
            <SheetDescription>
              Connect to supplier marketplaces
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2 pb-6">
            {supplierAuthData.map((supplier) => (
              <div key={supplier.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                    <Image
                      src={supplier.icon}
                      alt={`${supplier.name} icon`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{supplier.name}</span>
                </div>
                <Button
                  variant={supplier.connected ? "default" : "outline"}
                  size="sm"
                  className={`h-8 px-4 ${
                    supplier.connected
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'hover:bg-green-500 hover:text-white hover:border-green-500'
                  }`}
                  disabled={supplier.connected}
                >
                  {supplier.connected ? 'Connected' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}