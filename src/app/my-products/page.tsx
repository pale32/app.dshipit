"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProductCounts } from "@/contexts/ProductCountsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Search,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Settings,
  EyeOff
} from "lucide-react";

export default function MyProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedSearchType, setSelectedSearchType] = useState("store-product");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAll, setSelectedAll] = useState(false);
  const [sortBy, setSortBy] = useState("push-time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { updateMyProductsCount } = useProductCounts();

  // Dynamic store name - replace with actual connected store
  const connectedStoreName = "eBay"; // This should come from user's connected stores/context

  // Mock pushed products data - replace with actual data
  const pushedProducts: any[] = []; // These are products already pushed to user's store
  const hasProducts = pushedProducts.length > 0;

  // Update sidebar count when component mounts or data changes
  useEffect(() => {
    updateMyProductsCount(pushedProducts.length);
  }, [pushedProducts.length, updateMyProductsCount]);

  // Mock data - replace with actual data
  const productCounts = {
    all: pushedProducts.length,
    aliexpress: 0,
    temu: 0,
    alibaba: 0,
    unmapped: 0
  };

  const handleSelectAll = () => {
    if (hasProducts) {
      setSelectedAll(!selectedAll);
      if (!selectedAll) {
        // Select all products
        setSelectedItems(pushedProducts.map((_, index) => index));
      } else {
        // Deselect all products
        setSelectedItems([]);
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  return (
    <div className="h-full w-full px-8 py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-medium text-foreground">My Products</h1>
            
            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Search Container - Fixed dimensions to prevent any layout shift */}
              <div className="flex items-center justify-end w-[550px] h-12" ref={searchRef}>
                {!isSearchExpanded ? (
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchExpanded(true)}
                    className="flex items-center gap-2 px-3 bg-transparent hover:bg-gray-100 rounded-lg transition-colors text-lg font-light h-12"
                  >
                    <Search className="h-8 w-8" />
                    <span>Search Product</span>
                  </Button>
                ) : (
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm pr-1 h-12">
                    <Select value={selectedSearchType} onValueChange={setSelectedSearchType}>
                      <SelectTrigger className="w-[170px] border-none bg-yellow-50 rounded-none h-12">
                        <SelectValue placeholder="Search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="store-product">Store Product</SelectItem>
                        <SelectItem value="mapping-product">Mapping Product</SelectItem>
                        <SelectItem value="supplier-store-name">Supplier Store Name</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      placeholder="Search My product here"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-none min-w-[300px] focus-visible:ring-0 rounded-none h-12"
                    />
                    
                    <Button 
                      onClick={() => {
                        console.log('Searching for:', searchQuery, 'Type:', selectedSearchType);
                        // Optionally collapse after search
                        // setIsSearchExpanded(false);
                      }}
                    >
                      OK
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mb-6 mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="h-10 bg-transparent gap-2.5 p-0">
                <TabsTrigger 
                  value="all" 
                  className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
                >
                  All <span className="ml-1 opacity-70">({productCounts.all})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="aliexpress"
                  className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
                >
                  AliExpress <span className="ml-1 opacity-70">({productCounts.aliexpress})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="temu"
                  className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
                >
                  Temu <span className="ml-1 opacity-70">({productCounts.temu})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="alibaba"
                  className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
                >
                  Alibaba <span className="ml-1 opacity-70">({productCounts.alibaba})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="unmapped"
                  className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
                >
                  Unmapped <span className="ml-1 opacity-70">({productCounts.unmapped})</span>
                </TabsTrigger>
              </TabsList>
              
              <Button className="uppercase font-medium">
                Import Products From {connectedStoreName}
              </Button>
            </div>
            
            {/* Selection Ribbon */}
            <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 mb-4 h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedAll} 
                    onCheckedChange={handleSelectAll}
                    disabled={!hasProducts}
                    className="h-5 w-5"
                  />
                  <span className="text-lg font-normal">Select All</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={selectedItems.length === 0}
                  className="text-lg font-normal hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                
                <div className="w-px h-6 bg-gray-300" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer p-2">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M255.8 218c-21 0-38 17-38 38s17 38 38 38 38-17 38-38-17-38-38-38zM102 218c-21 0-38 17-38 38s17 38 38 38 38-17 38-38-17-38-38-38zM410 218c-21 0-38 17-38 38s17 38 38 38 38-17 38-38-17-38-38-38z"></path>
                      </svg>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem disabled={!hasProducts} className="text-lg font-normal">
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!hasProducts} className="text-lg font-normal">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-5 mb-5">
              <span className="text-lg text-muted-foreground">Sort by:</span>
              
              <Button
                variant="ghost"
                onClick={() => handleSort("cost")}
                className={`flex items-center gap-2 text-lg font-normal hover:bg-gray-100 ${
                  sortBy === "cost" ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <span>Cost</span>
                <div className="flex flex-col">
                  <ChevronUp className={`h-4 w-4 ${sortBy === "cost" && sortOrder === "asc" ? "text-foreground" : "text-gray-300"}`} />
                  <ChevronDown className={`h-4 w-4 ${sortBy === "cost" && sortOrder === "desc" ? "text-foreground" : "text-gray-300"}`} />
                </div>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleSort("push-time")}
                className={`flex items-center gap-2 text-lg font-normal hover:bg-gray-100 ${
                  sortBy === "push-time" ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <span>Push time</span>
                <div className="flex flex-col">
                  <ChevronUp className={`h-4 w-4 ${sortBy === "push-time" && sortOrder === "asc" ? "text-foreground" : "text-gray-300"}`} />
                  <ChevronDown className={`h-4 w-4 ${sortBy === "push-time" && sortOrder === "desc" ? "text-foreground" : "text-gray-300"}`} />
                </div>
              </Button>
            </div>

            {/* Tab Content */}
            <TabsContent value="all" className="mt-0">
              {hasProducts ? (
                // Products List - Display products according to sorting options
                <div className="space-y-4">
                  {pushedProducts.map((product, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      {/* Product card content would go here */}
                      <p>Product {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="flex items-center justify-center py-16">
                  <div className="max-w-4xl w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-6">Import your first item</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="text-lg font-medium">1.</span>
                            <span className="text-base text-muted-foreground">
                              Click 'Import Ebay product' in the upper right corner to import Ebay products into DShipIt
                            </span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-lg font-medium">2.</span>
                            <span className="text-base text-muted-foreground">
                              Map the imported products so that you can process orders faster
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-12">
                        <img 
                          src="/myproductlist_empty.png" 
                          alt="Import products illustration"
                          className="w-80 md:w-96 h-auto object-contain rounded-xl"
                          style={{ boxShadow: '0 0 3px rgba(156, 163, 175, 0.5)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="aliexpress" className="mt-0">
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-lg">No AliExpress products found</p>
              </div>
            </TabsContent>

            <TabsContent value="temu" className="mt-0">
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-lg">No Temu products found</p>
              </div>
            </TabsContent>

            <TabsContent value="alibaba" className="mt-0">
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-lg">No Alibaba products found</p>
              </div>
            </TabsContent>

            <TabsContent value="unmapped" className="mt-0">
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-lg">No unmapped products found</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" className="pointer-events-none opacity-50" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}