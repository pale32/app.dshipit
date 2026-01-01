"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Camera, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star, CheckIcon, ArrowUp, ArrowDown, Loader2, Settings } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { IncrementButton } from "@/components/ui/increment-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { searchProducts, transformProductForDisplay, getShippingCost, getProductDetails, type AliExpressProduct } from "@/lib/aliexpress-api";
import { addToImportList, isInImportList, type ImportListItem } from "@/lib/import-list-storage";
import { useProductCounts } from "@/contexts/ProductCountsContext";

// Product display type
interface DisplayProduct {
  id: string;
  title: string;
  price: number;
  endPrice: number;
  discount: number;
  orders: number;
  shipping: number;
  freeShipping?: boolean;
  rating: number;
  reviews: number;
  image: string;
  images?: string[]; // All product images
  productUrl: string;
  isImported?: boolean;
  // Extended fields from API
  shipFrom?: string;
  storeName?: string;
  deliveryDays?: string;
}

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("Default");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Popular search terms for variety - rotates on each page load
  const defaultSearchTerms = ['phone case', 'summer', 'gift', 'accessories', 'jewelry', 'electronics', 'home decor', 'beauty'];
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
  const sliderRef = useRef<HTMLDivElement>(null);

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
    const inputValue = searchInputRef.current?.value || '';
    console.log("Searching for:", inputValue);
    if (activeTab === 'aliexpress') {
      const term = inputValue.trim() || getRandomDefaultTerm();
      setCurrentSearchTerm(term);
      setCurrentPage(1);
    }
  };

  const getSuggestedSearches = (vendor: string): string[] => {
    const suggestions: Record<string, string[]> = {
      "AliExpress": ["phone cases", "led strips", "bluetooth earbuds", "smart watch", "car accessories"],
      "Temu": ["home decor", "kitchen gadgets", "pet supplies", "beauty tools", "fitness gear"],
      "Alibaba": ["wholesale electronics", "packaging supplies", "industrial parts", "textile materials", "machinery"],
      "Banggood": ["rc drones", "3d printer parts", "electronic components", "outdoor gear", "tools"]
    };
    return suggestions[vendor] || [];
  };

  const getBannerImage = (vendor: string): string => {
    const banners: Record<string, string> = {
      "AliExpress": "/bannerAliexpressFindProducts.png",
      "Temu": "/bannerAliexpressFindProducts.png", // Using same for now
      "Alibaba": "/bannerAliexpressFindProducts.png", // Using same for now
      "Banggood": "/bannerAliexpressFindProducts.png" // Using same for now
    };
    return banners[vendor] || "/bannerAliexpressFindProducts.png";
  };

  const aliexpressCategories = [
    { label: "Ship from USA", image: "/shipFromUSAAliexpress.png" },
    { label: "Ship From BR", image: "/shipFromPRAliexpress.png" },
    { label: "Ship from AU", image: "/shipFromAUAliexpress.png" },
    { label: "Ship from UK", image: "/shipFromUKAliexpress.png" },
    { label: "Ship from FR", image: "/shipFromFRAliexpress.png" },
    { label: "Ship from DE", image: "/shipFromDEAliexpress.png" },
    { label: "Coats", image: "/CoatsAliexpress.png" },
    { label: "Dresses", image: "/DressesAliexpress.png" },
    { label: "Sunglasses", image: "/sunglassesAliexpress.png" },
    { label: "Make Up", image: "/makeUpAliexpress.png" },
    { label: "Jewelry", image: "/jewelryAliexpress.png" },
    { label: "Nail Kits", image: "/nailKitsAliexpress.png" },
    { label: "Hats", image: "/hatsAliexpress.png" },
    { label: "Party Supplies", image: "/partySuppliesAliexpress.png" },
    { label: "Pet Supplies", image: "/petSuppliesAliexpress.png" },
    { label: "Tech Accessories", image: "/techAccessoriesAliexpress.png" },
    { label: "Home Décor", image: "/homeDecorAliexpress.png" },
    { label: "Oversize", image: "/oversizeAliexpress.png" }
  ];

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

  const handleCategorySelect = (categoryLabel: string) => {
    setSelectedCategory(prev => {
      if (prev === categoryLabel) {
        // If clicking the same category, deselect it
        return null;
      } else {
        // Select the new category (deselecting any previous one)
        return categoryLabel;
      }
    });
    
    // TODO: Wire this to API filtering when real products are available
    // This will be used to filter products based on the selected category
    console.log('Category filter changed:', categoryLabel === selectedCategory ? null : categoryLabel);
  };


  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 350;
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      
      // Enhanced smooth scrolling with custom easing
      sliderRef.current.scrollBy({ 
        left: scrollLeft, 
        behavior: 'smooth'
      });
      
      // Add a subtle visual feedback during scroll
      const container = sliderRef.current;
      container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
  };

  const renderBanner = (vendor: string) => (
    <Card className="mb-0 overflow-hidden rounded-xl border-0 p-0">
      <div className="relative h-48 w-full sm:h-56 md:h-64">
        <Image
          src={getBannerImage(vendor)}
          alt={`${vendor} promotional banner`}
          fill
          className="object-cover"
          priority
        />
      </div>
    </Card>
  );

  const renderAliexpressBanner = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="mb-6 overflow-hidden rounded-xl border-0 p-0 cursor-pointer" onClick={() => handleCategorySelect("Hot Girl More")}>
            <div className="relative h-48 w-full sm:h-56 md:h-64">
              <Image
                src="/bannerAliexpressFindProducts.png"
                alt="AliExpress Hot Girl More category"
                fill
                className="object-cover object-top"
                priority
              />
              
              {/* Checkbox Overlay */}
              {selectedCategory === "Hot Girl More" && (
                <div className="absolute top-0 left-0 w-[55px] h-[55px] bg-white rounded-tl-xl shadow-sm border-l border-t border-gray-300" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}>
                  <svg fill="currentColor" viewBox="0 0 24 24" height="32px" width="32px" xmlns="http://www.w3.org/2000/svg" className="text-green-600 font-bold absolute top-[1px] left-[1px]">
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
                  </svg>
                </div>
              )}
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="px-3 py-2 text-base font-normal rounded-xl shadow-xl"
        >
          <p>Hot Girl More</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderCategorySlider = () => (
    <div className="mb-6 relative">
      {/* Left Navigation Button - Outside content width */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-6 top-1/2 z-5 h-10 w-10 -translate-y-1/2 rounded-full bg-teal-50 dark:bg-teal-900 border-teal-200 dark:border-teal-700 shadow-lg hover:bg-teal-100 dark:hover:bg-teal-800 text-teal-700 dark:text-teal-300"
        onClick={() => scrollSlider('left')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Categories Slider Container */}
      <div className="overflow-hidden">
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth transition-all duration-700 ease-in-out [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scroll-behavior:smooth]"
        >
          {aliexpressCategories.map((category, index) => (
            <div key={index} className="flex flex-col items-center flex-shrink-0">
              <div className="group relative cursor-pointer" onClick={() => handleCategorySelect(category.label)}>
                <div className="h-[100px] w-[100px] overflow-hidden rounded-xl transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-[289px] will-change-transform">
                  <Image
                    src={category.image}
                    alt={category.label}
                    width={289}
                    height={100}
                    className="h-full w-full object-cover object-left transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
                    priority
                  />
                  
                  {/* Checkbox Overlay */}
                  {selectedCategory === category.label && (
                    <div className="absolute top-0 left-0 w-[43px] h-[43px] bg-white rounded-tl-xl shadow-sm border-l border-t border-gray-300" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}>
                      <svg fill="currentColor" viewBox="0 0 24 24" height="26px" width="26px" xmlns="http://www.w3.org/2000/svg" className="text-green-600 font-bold absolute top-[1px] left-[1px]">
                        <path fill="none" d="M0 0h24v24H0V0z"></path>
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-center text-sm font-thin text-black dark:text-black whitespace-nowrap transition-opacity duration-400 ease-out group-hover:opacity-90">
                {category.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Navigation Button - Outside content width */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-6 top-1/2 z-5 h-10 w-10 -translate-y-1/2 rounded-full bg-teal-50 dark:bg-teal-900 border-teal-200 dark:border-teal-700 shadow-lg hover:bg-teal-100 dark:hover:bg-teal-800 text-teal-700 dark:text-teal-300"
        onClick={() => scrollSlider('right')}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  const renderSearchBar = (vendor: string, logoSrc: string) => (
    <div className="mb-0 bg-background py-1 pb-4 border-0">
      <div className="flex items-center gap-4">
        {/* Vendor Logo with DShipIt Premium Selection */}
        <div className="flex-shrink-0">
          <div className="flex flex-col items-center justify-center">
            <Image
              src={logoSrc}
              alt={`${vendor} logo`}
              width={120}
              height={80}
              className="h-12 w-auto object-contain"
              priority
              unoptimized
            />
            <h3 className="text-sm font-bold text-foreground whitespace-nowrap mt-0">
              DShipIt Premium Selection
            </h3>
          </div>
        </div>

        {/* Search Bar - Stripe style */}
        <div className="flex-1">
          <div className="relative rounded-xl shadow-[0_0_0_1px_rgba(60,66,87,0.16)] hover:shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)] focus-within:shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)] transition-shadow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder={`Search ${vendor} products...`}
              defaultValue={searchQuery}
              className={`flex h-12 w-full border-0 bg-transparent pl-12 ${vendor !== "Temu" ? "pr-14" : "pr-4"} py-1 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const term = searchInputRef.current?.value.trim() || getRandomDefaultTerm();
                  setCurrentSearchTerm(term);
                  setCurrentPage(1);
                }
              }}
            />

            {/* Camera Button - positioned inside input, only for non-Temu */}
            {vendor !== "Temu" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCameraClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
                style={{ height: '44px', width: '44px' }}
                title="Upload image to find similar products"
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="!w-8 !h-8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80zM512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160 160 71.6 160 160-71.6 160-160 160zm-96-160a96 96 0 1 0 192 0 96 96 0 1 0-192 0z"></path>
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
        </div>
      </div>
    </div>
  );

  // Gray bar content component (shared between in-flow and fixed versions)
  const GrayBarContent = () => {
    const currentProducts = getCurrentProducts();
    return (
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
          {/* Ship From Selector */}
          <div className="flex items-center">
            <span className="text-base font-medium text-foreground mr-2">Ship from:</span>
            <Select value={shipFromCountry} onValueChange={setShipFromCountry}>
              <SelectTrigger className="w-[140px] h-8 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-4"></div>

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

          {/* Vertical Divider */}
          <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-4"></div>

          {/* Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-0 border-0 bg-transparent hover:bg-transparent">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg" className="text-dsi-gray-600">
                  <path d="M10 14L4 5V3H20V5L14 14V20L10 22V14Z"></path>
                </svg>
                <span className="sr-only">Filter products</span>
              </button>
            </SheetTrigger>
            <SheetContent className="w-[400px] max-w-[400px] min-w-[400px] px-4 py-4">
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
      </div>
    );
  };

  // Gray bar - in document flow, sticks at top-[320px] when scrolled
  const renderGrayBar = () => {
    return (
      <div className="sticky top-[320px] z-30 py-1 pb-4 -mx-4 px-4 bg-background">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {temuProducts.map((product) => (
          <Card key={product.id} className="border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-200 p-0 group relative overflow-hidden h-[390px] rounded-xl">
            <div className="relative">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-xl">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedProductIds.includes(product.id)}
                  onCheckedChange={(checked) => handleProductSelect(product.id, checked === true)}
                  className="h-5 w-5 bg-white border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                />
              </div>

              {/* Hover Buttons */}
              <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 translate-y-16 opacity-0 group-hover:translate-y-1/2 group-hover:opacity-100 transition-all duration-500 ease-out z-10 px-4 py-2">
                <div className="flex gap-6 justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          className="rounded-full w-10 h-10 cursor-pointer hover:cursor-pointer"
                          onClick={() => console.log('Supplier Optimizer clicked for product:', product.id)}
                        >
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                            <path d="M21 21l-6 -6"></path>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Supplier Optimizer
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          disabled={product.isImported}
                          className={`rounded-full w-10 h-10 ${product.isImported ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 hover:cursor-not-allowed' : 'cursor-pointer hover:cursor-pointer'}`}
                          onClick={() => handleSingleImport(product)}
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z"></path>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {product.isImported ? 'Imported' : 'Add To Import List'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="px-3 pb-4 -mt-4 flex flex-col h-[170px] relative overflow-hidden">
              {/* Movable Content */}
              <div className="group-hover:translate-y-6 transition-all duration-500 ease-out">
                {/* Title */}
                <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-shrink-0 cursor-pointer">
                          <Image
                            src="/aliexpressQualityControl.png"
                            alt="Temu Quality Control"
                            width={14}
                            height={14}
                            className="flex-shrink-0"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="px-3 py-2 text-xs font-normal rounded-md shadow-lg"
                      >
                        <p>Temu Quality Control</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <h3 
                    className="text-sm font-normal text-foreground truncate leading-tight cursor-default min-w-0 flex-1"
                    title={product.title}
                  >
                    {product.title}
                  </h3>

                  <CopyButton text={product.productUrl} />
                </div>

                {/* Price with Discount Badge */}
                <div className="flex items-center gap-2 leading-none mt-2">
                  <span className="text-lg font-bold text-black dark:text-white leading-none">
                    US ${product.price.toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <span className="bg-gradient-to-r from-[#1E88E5] to-[#42A5F5] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md leading-none shadow-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Temu Badges */}
                <div className="flex gap-2 mt-2 mb-2">
                  <span className="bg-teal-100 text-teal-800 text-[9.5px] font-semibold px-2.5 py-0.5 rounded-lg leading-none">
                    For US
                  </span>
                  <span className="bg-teal-100 text-teal-800 text-[9.5px] font-semibold px-2.5 py-0.5 rounded-lg leading-none">
                    Free Return
                  </span>
                </div>
              </div>

              {/* Spacer to push bottom content down */}
              <div className="flex-1"></div>

              {/* Fixed Bottom Content - Orders Only */}
              <div className="space-y-px">
                {/* Orders */}
                <div className="flex justify-between items-center text-sm text-muted-foreground leading-none py-2">
                  <span>Orders</span>
                  <span className="font-normal text-sm">{product.orders.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
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
    <div className="py-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productsToDisplay.map((product) => (
          <Card key={product.id} className="border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-200 p-0 group relative overflow-hidden h-[390px] rounded-xl">
            <div className="relative">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-xl">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedProductIds.includes(product.id)}
                  onCheckedChange={(checked) => handleProductSelect(product.id, checked === true)}
                  className="h-5 w-5 bg-white border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                />
              </div>

              {/* Hover Buttons */}
              <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 translate-y-16 opacity-0 group-hover:translate-y-1/2 group-hover:opacity-100 transition-all duration-500 ease-out z-10 px-4 py-2">
                <div className="flex gap-6 justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          className="rounded-full w-10 h-10 cursor-pointer hover:cursor-pointer"
                          onClick={() => console.log('Supplier Optimizer clicked for product:', product.id)}
                        >
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                            <path d="M21 21l-6 -6"></path>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Supplier Optimizer
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          disabled={product.isImported}
                          className={`rounded-full w-10 h-10 ${product.isImported ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 hover:cursor-not-allowed' : 'cursor-pointer hover:cursor-pointer'}`}
                          onClick={() => handleSingleImport(product)}
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg">
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z"></path>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {product.isImported ? 'Imported' : 'Add To Import List'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="px-3 pb-4 -mt-4 flex flex-col h-[170px] group-hover:translate-y-6 transition-all duration-500 ease-out relative overflow-hidden">
              {/* Title */}
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-shrink-0 cursor-pointer">
                        <Image
                          src="/aliexpressQualityControl.png"
                          alt="AliExpress Quality Control"
                          width={14}
                          height={14}
                          className="flex-shrink-0"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="px-3 py-2 text-xs font-normal rounded-md shadow-lg"
                    >
                      <p>AliExpress Quality Control</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <h3 
                  className="text-sm font-normal text-foreground truncate leading-tight cursor-default min-w-0 flex-1"
                  title={product.title}
                >
                  {product.title}
                </h3>

                <CopyButton text={product.productUrl} />
              </div>

              {/* Price with Discount Badge */}
              <div className="flex items-center gap-2 leading-none mt-2">
                <span className="text-lg font-bold text-black dark:text-white leading-none">
                  US ${product.price.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="bg-gradient-to-r from-[#1E88E5] to-[#42A5F5] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md leading-none shadow-sm">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Spacer for consistent card height */}
              <div className="h-[18px]"></div>

              {/* Spacer to push bottom content down */}
              <div className="flex-1"></div>

              {/* Bottom Content */}
              <div className="space-y-px">
                {/* Orders */}
                <div className="flex justify-between items-center text-sm text-muted-foreground leading-none py-0">
                  <span>Orders</span>
                  <span className="font-normal text-sm">{product.orders.toLocaleString()}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center text-sm text-muted-foreground leading-none py-0">
                  <span>Shipping</span>
                  <span className="font-normal text-sm">
                    {('freeShipping' in product && product.freeShipping) || product.shipping === 0
                      ? "Free"
                      : product.shipping > 0
                        ? `$${product.shipping.toFixed(2)}`
                        : shippingCosts[product.id] !== undefined
                          ? shippingCosts[product.id] === 0
                            ? "Free"
                            : shippingCosts[product.id] > 0
                              ? `$${shippingCosts[product.id].toFixed(2)}`
                              : "-"
                          : "-"
                    }
                  </span>
                </div>

                {/* Rating */}
                <div className="flex justify-between items-center leading-none py-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                  <div className="flex items-center">
                    {product.rating > 0 ? (
                      [...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">New</span>
                    )}
                  </div>
                  <span className="font-normal text-sm text-muted-foreground">
                    {product.rating > 0 ? `${product.rating}` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
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

  // Memoized search bar header to prevent remounting on every keystroke
  const searchBarHeaderContent = useMemo(() => {
    const getVendorData = () => {
      switch (activeTab) {
        case 'aliexpress': return { vendor: 'AliExpress', logoSrc: '/aliexpressFindProducts.png' };
        case 'temu': return { vendor: 'Temu', logoSrc: '/temuFindProducts.jfif' };
        case 'alibaba': return { vendor: 'Alibaba', logoSrc: '/alibabaFindProducts.jfif' };
        case 'banggood': return { vendor: 'Banggood', logoSrc: '/banggoodFindProducts.png' };
        default: return { vendor: 'AliExpress', logoSrc: '/aliexpressFindProducts.png' };
      }
    };
    const { vendor, logoSrc } = getVendorData();

    return (
      <div
        className="fixed z-[25] bg-background border-b-0 left-0 right-0 md:left-[272px] top-56 h-24"
      >
        <div className="mx-auto w-full max-w-6xl px-4">
          {renderSearchBar(vendor, logoSrc)}
        </div>
      </div>
    );
  }, [activeTab]);

  const TabsHeader = () => (
    <div
      className="fixed z-30 bg-background top-28 left-0 right-0 md:left-[272px] overflow-visible"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex items-center h-16">
          <div className="flex items-center flex-1 gap-2">
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
          
          {/* Add Supplier Platform Menu */}
          <div className="ml-4 flex items-center h-12 flex-shrink-0 relative">
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
      <div className="h-full w-full pt-52">
        <div className="mx-auto w-full max-w-6xl">
          {/* Tab Content */}
          {activeTab === "aliexpress" && (
            <div className="bg-transparent">
            <div className="m-0">
              {renderAliexpressBanner()}
              {renderCategorySlider()}
              {renderGrayBar()}
              {renderProductGrid()}
            </div>
          </div>
          )}

          {activeTab === "temu" && (
            <div className="bg-transparent">
            <div className="m-0">
              {renderTemuGrayBar()}
              {renderTemuProductGrid()}
            </div>
          </div>
          )}

          {activeTab === "alibaba" && (
            <div className="bg-transparent">
            <div className="m-0">
              {renderAliexpressBanner()}
              {renderCategorySlider()}
              {renderGrayBar()}
              {renderProductGrid()}
              {renderPagination()}
            </div>
          </div>
          )}

          {activeTab === "banggood" && (
            <div className="bg-transparent">
            <div className="m-0">
              {renderAliexpressBanner()}
              {renderCategorySlider()}
              {renderGrayBar()}
              {renderProductGrid()}
              {renderPagination()}
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}