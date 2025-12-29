"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, FileText, Filter, CalendarIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function ArchivedOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("order-no");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("30days");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [accountSearch, setAccountSearch] = useState("");

  const handleSearch = () => {
    console.log("Searching:", { searchQuery, searchType });
  };

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-4xl font-medium">Archived orders</span>
            
            <div className="flex items-center gap-4 flex-1 justify-end min-w-[600px]">
              <div className="flex items-center justify-end w-[450px] h-12" ref={searchRef}>
                {!isSearchExpanded ? (
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchExpanded(true)}
                    className="flex items-center gap-2 px-3 bg-transparent hover:bg-gray-100 rounded-lg transition-colors text-lg font-light h-12"
                  >
                    <Search className="h-8 w-8" />
                    <span>Search Order</span>
                  </Button>
                ) : (
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm pr-1 h-12">
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger className="w-[170px] border-none bg-yellow-50 rounded-none h-12">
                        <SelectValue placeholder="Search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order-no">Order No</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="customer-name">Customer Name</SelectItem>
                        <SelectItem value="tracking-no">Tracking No</SelectItem>
                        <SelectItem value="supplier-order-no">Supplier Order No</SelectItem>
                      </SelectContent>
                    </Select>
                      
                    <Input
                      placeholder="Choose option for precise search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-none min-w-[240px] focus-visible:ring-0 rounded-none h-12"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                      
                    <Button onClick={handleSearch}>
                      OK
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="w-px h-8 bg-gray-200" />

              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-lg font-light h-12">
                    <Filter className="h-5 w-5" />
                    <span>Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:max-w-none flex flex-col">
                  <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b mb-6 sticky top-0 bg-background z-10 px-6">
                    <SheetTitle className="text-xl font-semibold">Filter Archived Orders</SheetTitle>
                    <SheetClose className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </SheetClose>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="px-6 space-y-6">
                      <Accordion type="multiple" defaultValue={["marketplace", "date"]} className="space-y-6">
                        <AccordionItem value="marketplace" className="border-b border-gray-200">
                          <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-lg">
                            <span>Filter by Market Place</span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 pl-4">
                            <div className="space-y-0">
                              <RadioGroup value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="aliexpress" id="aliexpress" />
                                    <Label htmlFor="aliexpress" className="cursor-pointer text-base font-normal flex items-center gap-2">
                                      <img
                                        src="/images/icons/order-sync-icon.png"
                                        alt="AliExpress"
                                        className="w-6 h-6"
                                      />
                                      <span style={{width: '250px', overflowWrap: 'break-word'}}>AliExpress</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="temu" id="temu" />
                                    <Label htmlFor="temu" className="cursor-pointer text-base font-normal flex items-center gap-2">
                                      <img
                                        src="/images/icons/order-fulfill-icon.png"
                                        alt="Temu"
                                        className="w-6 h-6"
                                      />
                                      <span style={{width: '250px', overflowWrap: 'break-word'}}>Temu</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="alibaba" id="alibaba" />
                                    <Label htmlFor="alibaba" className="cursor-pointer text-base font-normal flex items-center gap-2">
                                      <img
                                        src="/images/icons/order-track-icon.png"
                                        alt="Alibaba"
                                        className="w-6 h-6"
                                      />
                                      <span style={{width: '250px', overflowWrap: 'break-word'}}>Alibaba</span>
                                    </Label>
                                  </div>
                                </div>
                              </RadioGroup>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="date" className="border-b border-gray-200">
                          <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-lg">
                            <span>Date</span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 pl-4">
                            <div className="space-y-0">
                              <RadioGroup value={dateFilter} onValueChange={setDateFilter}>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="today" id="today" />
                                    <Label htmlFor="today" className="cursor-pointer text-base font-normal">Today</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="7days" id="7days" />
                                    <Label htmlFor="7days" className="cursor-pointer text-base font-normal">Last 7 days</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="30days" id="30days" />
                                    <Label htmlFor="30days" className="cursor-pointer text-base font-normal">Last 30 days</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="90days" id="90days" />
                                    <Label htmlFor="90days" className="cursor-pointer text-base font-normal">Last 90 days</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="180days" id="180days" />
                                    <Label htmlFor="180days" className="cursor-pointer text-base font-normal">Last 180 days</Label>
                                  </div>
                                  <div className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value="custom" id="custom" />
                                    <Label htmlFor="custom" className="cursor-pointer text-base font-normal">Custom</Label>
                                  </div>
                                </div>
                              </RadioGroup>
                              
                              {dateFilter === "custom" && (
                                <div className="mt-4 space-y-3">
                                  <div>
                                    <div className="text-base mb-2">From</div>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          disabled={dateFilter !== "custom"}
                                          className={`w-full justify-start text-left font-normal h-10 text-base ${!fromDate && "text-muted-foreground"} ${dateFilter !== "custom" ? "bg-gray-50" : ""}`}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {fromDate ? format(fromDate, "yyyy-MM-dd") : "Select date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div>
                                    <div className="text-base mb-2">To</div>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          disabled={dateFilter !== "custom"}
                                          className={`w-full justify-start text-left font-normal h-10 text-base ${!toDate && "text-muted-foreground"} ${dateFilter !== "custom" ? "bg-gray-50" : ""}`}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {toDate ? format(toDate, "yyyy-MM-dd") : "Select date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>

                  <div className="flex gap-3 p-6 border-t bg-background">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => {
                        setDateFilter("30days");
                        setFromDate(undefined);
                        setToDate(undefined);
                        setMarketplaceFilter("");
                        setAccountSearch("");
                      }}
                    >
                      Clear All Filters
                    </Button>
                    <Button className="flex-1 uppercase" onClick={() => setFilterOpen(false)}>
                      Confirm
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="mb-6 text-sm text-muted-foreground">
          Orders that have not been processed for more than a year will automatically be placed in the Archived Orders menu. You can still un-archive orders to perform more operations.{" "}
          <a
            href="/help/archived-orders"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Click here
          </a>{" "}
          to learn more.
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead className="w-32">Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-40">Shipping</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="w-40">Supplier Order No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="h-96">
                  <div className="flex items-start justify-center py-8 gap-6">
                    <FileText className="h-36 w-36 text-muted-foreground/50 flex-shrink-0" />
                    <div className="space-y-1.5 text-muted-foreground text-left">
                      <div className="font-medium text-base mb-2">Your search may have no result for one of the following reason:</div>
                      <p className="text-base">1. If you Archived the order on Store, please check the Archived menu in DShipIt to find the order</p>
                      <p className="text-base">2. The information you entered is inaccurate</p>
                      <p className="text-base">3. The search is not within the currently set time range</p>
                      <p className="text-base">4. The search may include a Hidden product</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={true}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 items</SelectItem>
                <SelectItem value="40">40 items</SelectItem>
                <SelectItem value="60">60 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}