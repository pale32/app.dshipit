"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search,
  Star,
  ChevronUp,
  ChevronDown,
  Loader2,
  Copy,
  Plus,
} from "lucide-react";
import { getSupplierOptimizerImage, clearSupplierOptimizerImage } from "@/lib/supplier-optimizer-storage";
import { addToImportList, type ImportListItem } from "@/lib/import-list-storage";

// Countries for ship from/to selectors
const COUNTRIES = [
  { code: "cn", name: "China" },
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "ru", name: "Russia" },
  { code: "br", name: "Brazil" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "in", name: "India" },
  { code: "mx", name: "Mexico" },
] as const;

interface SupplierProduct {
  product_id: string;
  product_title: string;
  product_main_image_url: string;
  target_sale_price: string;
  target_original_price: string;
  discount: string;
  evaluate_rate: string;
  orders_count: number;
  product_detail_url: string;
  supplier: string;
  shop_url: string;
  seller_id: string;
}

type SortField = 'price' | 'sales' | 'discount' | 'rating' | 'supplier' | 'shipping';
type SortDirection = 'asc' | 'desc';

export default function SupplierOptimizerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipFromCountry, setShipFromCountry] = useState("cn");
  const [shipToCountry, setShipToCountry] = useState("us");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hasCheckedPending, setHasCheckedPending] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const searchFileInputRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const handleImageSearch = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return;

    setIsLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch('/api/aliexpress/image-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          shipToCountry: shipToCountry.toUpperCase(),
          shipFromCountry: shipFromCountry.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search by image');
      }

      setProducts(data.products || []);
      setSourceImageUrl(data.sourceImageUrl || imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [shipFromCountry, shipToCountry]);

  // Check for pending image from Import List on mount
  useEffect(() => {
    if (hasCheckedPending) return;

    const pendingData = getSupplierOptimizerImage();
    if (pendingData?.imageUrl) {
      setSourceImageUrl(pendingData.imageUrl);
      setSearchQuery(pendingData.imageUrl);
      // Clear the stored data
      clearSupplierOptimizerImage();
      // Auto-trigger search
      handleImageSearch(pendingData.imageUrl);
    }
    setHasCheckedPending(true);
  }, [hasCheckedPending, handleImageSearch]);

  const handleSearchImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we need to upload to a temporary URL or use base64
      // This is a placeholder - in production, upload to cloud storage first
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSearchQuery(dataUrl);
        setSourceImageUrl(dataUrl);
        // Note: Base64 URLs may not work with AliExpress API - need proper image hosting
        setError("File uploads require image hosting. Please use an image URL instead.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    searchFileInputRef.current?.click();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Check if it's a URL
      if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
        handleImageSearch(searchQuery);
      } else {
        setError("Please enter a valid image URL starting with http:// or https://");
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;

    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'price':
        return (parseFloat(a.target_sale_price) - parseFloat(b.target_sale_price)) * multiplier;
      case 'sales':
        return (a.orders_count - b.orders_count) * multiplier;
      case 'discount':
        return (parseFloat(a.discount) - parseFloat(b.discount)) * multiplier;
      case 'rating':
        return (parseFloat(a.evaluate_rate) - parseFloat(b.evaluate_rate)) * multiplier;
      case 'supplier':
        return a.supplier.localeCompare(b.supplier) * multiplier;
      case 'shipping':
        // Shipping data not available in API, maintain original order
        return 0;
      default:
        return 0;
    }
  });

  const copyProductId = (productId: string) => {
    navigator.clipboard.writeText(productId);
  };

  const convertToImportListItem = (product: SupplierProduct): ImportListItem => {
    const salePrice = parseFloat(product.target_sale_price) || 0;
    const originalPrice = parseFloat(product.target_original_price) || salePrice;
    const discount = parseFloat(product.discount) || 0;

    return {
      id: product.product_id,
      name: product.product_title,
      supplier: 'AliExpress',
      supplierLogo: '/aliexpressQualityControl.png',
      price: `$${salePrice.toFixed(2)}`,
      originalPrice: `$${originalPrice.toFixed(2)}`,
      discount: discount > 0 ? `${Math.round(discount)}%` : '',
      rating: parseFloat(product.evaluate_rate) || 0,
      reviews: 0,
      image: product.product_main_image_url,
      category: 'General',
      addedDate: new Date().toISOString(),
      status: 'pending',
      stock: 999,
      minOrder: 1,
      weight: { value: 0.1, unit: 'kg' },
      dimensions: { length: 10, width: 10, height: 5, unit: 'cm' },
      productUrl: product.product_detail_url,
      shippingCost: undefined,
    };
  };

  const handleAddToImportList = (product: SupplierProduct) => {
    const importItem = convertToImportListItem(product);
    addToImportList([importItem]);
  };

  // Handle scroll to show/hide sticky column shadows
  const handleTableScroll = useCallback(() => {
    const scrollContainer = tableScrollRef.current;
    if (!scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    // Show left shadow when scrolled right (content is hidden on the left)
    setShowLeftShadow(scrollLeft > 0);
    // Show right shadow when there's more content on the right
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Set up scroll listener and initial shadow state
  useEffect(() => {
    const scrollContainer = tableScrollRef.current;
    if (!scrollContainer) return;

    // Check initial state
    handleTableScroll();

    scrollContainer.addEventListener('scroll', handleTableScroll);
    window.addEventListener('resize', handleTableScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleTableScroll);
      window.removeEventListener('resize', handleTableScroll);
    };
  }, [handleTableScroll, products]);

  return (
    <div className="h-full w-full px-8 py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center space-x-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-6 w-6" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="m2 17 10 5 10-5"></path>
                <path d="m2 12 10 5 10-5"></path>
              </svg>
            </div>
            <h1 className="text-foreground text-4xl font-medium">Supplier Optimizer</h1>
          </div>
          <p className="text-muted-foreground">
            You can find similar products by uploading an image or entering the product URL link,{" "}
            <a href="#" className="text-primary hover:underline">
              click here to learn more
            </a>
            .
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-6 w-full">
          <div className="mb-0 bg-background py-1 pb-4 border-0">
            <div className="flex items-center w-full">
              <div className="flex-1 w-full">
                <div className="relative w-full rounded-xl shadow-[0_0_0_1px_rgba(60,66,87,0.16)] hover:shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)] focus-within:shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)] transition-shadow">
                  {isLoading ? (
                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                  ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  )}
                  <Input
                    type="search"
                    placeholder="Search for the same products by using a product link or an image link."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-12 pr-14 border-0 text-[17px] placeholder:text-[17px] placeholder:text-muted-foreground/70 focus-visible:ring-0 focus:outline-none w-full shadow-none rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />

                  {/* Camera Button - positioned inside input */}
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
                </div>

                <input
                  ref={searchFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSearchImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Results Section */}
        {products.length > 0 && (
          <div className="space-y-4">
            {/* Shipping Info Bar */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              {/* Ship From */}
              <div className="flex items-center gap-2">
                <Select value={shipFromCountry} onValueChange={setShipFromCountry}>
                  <SelectTrigger className="w-[180px] h-10">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${shipFromCountry}.svg`}
                          className="w-6 h-6"
                          alt="Ship from flag"
                        />
                        <span>{COUNTRIES.find(c => c.code === shipFromCountry)?.name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${country.code}.svg`}
                            className="w-5 h-5"
                            alt={`${country.name} flag`}
                          />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arrow */}
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                <path d="M873.1 596.2l-164-208A32 32 0 0 0 684 376h-64.8c-6.7 0-10.4 7.7-6.3 13l144.3 183H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h695.9c26.8 0 41.7-30.8 25.2-51.8z"></path>
              </svg>

              {/* Ship To */}
              <div className="flex items-center gap-2">
                <Select value={shipToCountry} onValueChange={setShipToCountry}>
                  <SelectTrigger className="w-[180px] h-10">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${shipToCountry}.svg`}
                          className="w-6 h-6"
                          alt="Ship to flag"
                        />
                        <span>{COUNTRIES.find(c => c.code === shipToCountry)?.name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${country.code}.svg`}
                            className="w-5 h-5"
                            alt={`${country.name} flag`}
                          />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto text-sm text-muted-foreground">
                {products.length} similar products found
              </div>
            </div>

            {/* Results Table */}
            <div className="border rounded-xl overflow-hidden bg-background">
              <div ref={tableScrollRef} className="w-full scrollbar-show-x" style={{ overflowX: 'auto' }}>
                <table className="w-full border-collapse" style={{ minWidth: '1400px' }}>
                  <thead>
                    <tr className="bg-muted/50">
                      {/* Image - Sticky Left */}
                      <th
                        className="sticky left-0 z-20 bg-muted px-4 py-3 text-left text-sm font-medium text-foreground whitespace-nowrap border-b transition-shadow"
                        style={{ minWidth: '88px', boxShadow: showLeftShadow ? 'inset -10px 0 8px -8px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Image
                      </th>
                      {/* Product */}
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground whitespace-nowrap border-b" style={{ minWidth: '240px' }}>
                      </th>
                      {/* Copy */}
                      <th className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b" style={{ minWidth: '60px' }}>
                        Copy
                      </th>
                      {/* Supplier - Sortable */}
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b cursor-pointer hover:bg-muted/70 transition-colors"
                        style={{ minWidth: '100px' }}
                        onClick={() => handleSort('supplier')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Supplier</span>
                          <div className="flex flex-col -space-y-1">
                            <ChevronUp className={`h-3 w-3 ${sortField === 'supplier' && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            <ChevronDown className={`h-3 w-3 ${sortField === 'supplier' && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </div>
                        </div>
                      </th>
                      {/* Price - Sortable */}
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b cursor-pointer hover:bg-muted/70 transition-colors"
                        style={{ minWidth: '130px' }}
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Price</span>
                          <div className="flex flex-col -space-y-1">
                            <ChevronUp className={`h-3 w-3 ${sortField === 'price' && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            <ChevronDown className={`h-3 w-3 ${sortField === 'price' && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </div>
                        </div>
                      </th>
                      {/* Shipping - Sortable */}
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b cursor-pointer hover:bg-muted/70 transition-colors"
                        style={{ minWidth: '100px' }}
                        onClick={() => handleSort('shipping')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Shipping</span>
                          <div className="flex flex-col -space-y-1">
                            <ChevronUp className={`h-3 w-3 ${sortField === 'shipping' && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            <ChevronDown className={`h-3 w-3 ${sortField === 'shipping' && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </div>
                        </div>
                      </th>
                      {/* Sales - Sortable */}
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b cursor-pointer hover:bg-muted/70 transition-colors"
                        style={{ minWidth: '90px' }}
                        onClick={() => handleSort('sales')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Sales</span>
                          <div className="flex flex-col -space-y-1">
                            <ChevronUp className={`h-3 w-3 ${sortField === 'sales' && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            <ChevronDown className={`h-3 w-3 ${sortField === 'sales' && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </div>
                        </div>
                      </th>
                      {/* Accuracy - Seller accuracy score */}
                      <th className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b" style={{ minWidth: '90px' }}>
                        Accuracy
                      </th>
                      {/* Response - Seller response score */}
                      <th className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b" style={{ minWidth: '90px' }}>
                        Response
                      </th>
                      {/* On-Time - Seller on-time shipping rate */}
                      <th className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b" style={{ minWidth: '90px' }}>
                        On-Time
                      </th>
                      {/* ETA - Estimated time of arrival */}
                      <th className="px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b" style={{ minWidth: '70px' }}>
                        ETA
                      </th>
                      {/* Rating - Sticky Right */}
                      <th
                        className="sticky right-0 z-20 bg-muted px-4 py-3 text-center text-sm font-medium text-foreground whitespace-nowrap border-b cursor-pointer hover:bg-muted/90 transition-shadow"
                        style={{ minWidth: '140px', boxShadow: showRightShadow ? 'inset 10px 0 8px -8px rgba(0,0,0,0.1)' : 'none' }}
                        onClick={() => handleSort('rating')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Rating</span>
                          <div className="flex flex-col -space-y-1">
                            <ChevronUp className={`h-3 w-3 ${sortField === 'rating' && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            <ChevronDown className={`h-3 w-3 ${sortField === 'rating' && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedProducts.map((product) => (
                      <tr key={product.product_id} className="hover:bg-muted/30 transition-colors">
                        {/* Image - Sticky Left */}
                        <td
                          className="sticky left-0 z-10 bg-background px-4 py-3 transition-shadow"
                          style={{ boxShadow: showLeftShadow ? 'inset -10px 0 8px -8px rgba(0,0,0,0.08)' : 'none' }}
                        >
                          <div className="w-16 h-16 overflow-hidden rounded border bg-muted/20 flex-shrink-0">
                            <img
                              src={product.product_main_image_url}
                              alt={product.product_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        {/* Product */}
                        <td className="px-4 py-3">
                          <a
                            href={product.product_detail_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-primary cursor-pointer line-clamp-2 transition-colors"
                            title={product.product_title}
                          >
                            {product.product_title}
                          </a>
                        </td>
                        {/* Copy */}
                        <td className="px-4 py-3 text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => copyProductId(product.product_id)}
                                >
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Copy Product ID</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        {/* Supplier */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm">{product.supplier}</span>
                        </td>
                        {/* Price */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm">
                            US $ {product.target_sale_price}
                            {parseFloat(product.target_original_price) > parseFloat(product.target_sale_price) && (
                              <>~{product.target_original_price}</>
                            )}
                          </span>
                        </td>
                        {/* Shipping */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>
                        {/* Sales */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm">{product.orders_count > 0 ? product.orders_count.toLocaleString() : '-'}</span>
                        </td>
                        {/* Accuracy */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm">{product.evaluate_rate && parseFloat(product.evaluate_rate) > 0 ? `${product.evaluate_rate}%` : '-'}</span>
                        </td>
                        {/* Response */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>
                        {/* On-Time */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>
                        {/* ETA */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>
                        {/* Rating - Sticky Right */}
                        <td
                          className="sticky right-0 z-10 bg-background px-4 py-3 transition-shadow"
                          style={{ boxShadow: showRightShadow ? 'inset 10px 0 8px -8px rgba(0,0,0,0.08)' : 'none' }}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-1 w-12">
                              <div className="w-4 h-4 flex-shrink-0">
                                {parseFloat(product.evaluate_rate) > 0 && (
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                              <span className="text-sm font-medium flex-shrink-0">{parseFloat(product.evaluate_rate) > 0 ? product.evaluate_rate : '-'}</span>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleAddToImportList(product)}
                                  >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                                      <path fill="none" d="M0 0h24v24H0V0z"></path>
                                      <path d="M11 7h6v2h-6zm0 4h6v2h-6zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z"></path>
                                    </svg>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Add to Import List</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Searching for similar products...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && !error && (
          <div className="-mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Search for quality suppliers
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="text-base">
                    1. Enter the URL you want in the search box or use an image.
                  </p>
                  <p className="text-base">
                    2. In the search results, you can choose a better supplier according to your needs.
                  </p>
                  <p className="text-sm italic">
                    We are adjusting the Supplier Optimizer feature and some data may be incorrect.
                    We are working hard to fix it. Thank you for your understanding and patience.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full max-w-md min-h-[300px]">
                  <Image
                    src="/supplier_optimizer_empty.webp"
                    alt="Supplier Optimizer Empty State"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
