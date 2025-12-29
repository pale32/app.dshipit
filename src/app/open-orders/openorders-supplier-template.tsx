"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  ClipboardList,
  Ticket,
  Grid3X3,
  List,
  CreditCard,
  Archive,
  Repeat,
  ArrowRightSquare
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// Custom SVG component for Place order to Supplier
const PlaceOrderIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 1024 1024" 
    height="3em" 
    width="3em" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zm18.6-251.7L765 393.7c-5.3-4.2-13-.4-13 6.3v76H438c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z"></path>
  </svg>
);

// Custom CloseCircle SVG component
const CloseCircleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="64 64 896 896" 
    focusable="false" 
    data-icon="close-circle" 
    width="1em" 
    height="1em" 
    fill="currentColor" 
    aria-hidden="true"
    className={className}
  >
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
  </svg>
);

interface SupplierOrdersPageProps {
  supplierName: string;
  supplierDisplayName: string;
}

export default function SupplierOrdersPage({ 
  supplierName = "aliexpress", 
  supplierDisplayName = "AliExpress" 
}: SupplierOrdersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchType, setSelectedSearchType] = useState("Order No");
  const [activeStatusTab, setActiveStatusTab] = useState("awaiting_order");
  const [selectedAll, setSelectedAll] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("detail"); // "detail" or "compact"
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("30days");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isStatusHovered, setIsStatusHovered] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [canceledByFilter, setCanceledByFilter] = useState<string>("");
  const [isCanceledByHovered, setIsCanceledByHovered] = useState(false);
  const [isCanceledByDropdownOpen, setIsCanceledByDropdownOpen] = useState(false);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isStatusDropdownOpen && !target.closest('.status-dropdown-container')) {
        setIsStatusDropdownOpen(false);
      }
      if (isCanceledByDropdownOpen && !target.closest('.canceled-by-dropdown-container')) {
        setIsCanceledByDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isStatusDropdownOpen, isCanceledByDropdownOpen]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [timeZoneSearch, setTimeZoneSearch] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [orderMethod, setOrderMethod] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortField, setSortField] = useState("date"); // default sort field
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock orders data - replace with actual data
  const orders: any[] = [];
  const hasOrders = orders.length > 0;

  // Mock data for order counts by status
  const orderStatusCounts = {
    pending: 0,
    awaiting_order: 0,
    awaiting_payment: 0,
    awaiting_shipment: 0,
    awaiting_fulfillment: 0,
    fulfilled: 0,
    canceled: 0,
    failed: 0
  };

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll);
  };

  const handleSort = (direction: "asc" | "desc") => {
    setSortDirection(direction);
    // Here you would implement the actual sorting logic
    // Example: sortOrders(orders, sortField, direction);
    console.log(`Sorting ${direction} by ${sortField}`);
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
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-4xl font-medium text-foreground flex-shrink-0">{supplierDisplayName}</h1>
            
            {/* Header Actions */}
            <div className="flex items-center gap-4 flex-1 justify-end min-w-[600px]">
              {/* Search Container */}
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
                    <Select value={selectedSearchType} onValueChange={setSelectedSearchType}>
                      <SelectTrigger className="w-[170px] border-none bg-yellow-50 rounded-none h-12">
                        <SelectValue placeholder="Search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Order No">Order No</SelectItem>
                        <SelectItem value="Note">Note</SelectItem>
                        <SelectItem value={`${supplierDisplayName} Order No`}>{supplierDisplayName} Order No</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="E-mail">E-mail</SelectItem>
                        <SelectItem value="Customer Name">Customer Name</SelectItem>
                        <SelectItem value="Tracking No">Tracking No</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      placeholder="Choose option for precise search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-none min-w-[240px] focus-visible:ring-0 rounded-none h-12"
                    />
                    
                    <Button 
                      onClick={() => {
                        console.log('Searching for:', searchQuery, 'Type:', selectedSearchType);
                      }}
                    >
                      OK
                    </Button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* Filter Button */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-lg font-light h-12">
                    <Filter className="h-5 w-5" />
                    <span>Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:max-w-none flex flex-col">
                  <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b mb-6 sticky top-0 bg-background z-10 px-6">
                    <SheetTitle className="text-lg font-semibold">Filter Order</SheetTitle>
                    <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </SheetClose>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="px-6 space-y-6">
                    <Accordion type="multiple" defaultValue={["date", "country", "timezone", "flags", "order-method", "account-id"]} className="space-y-6">
                      {/* Date Filter */}
                      <AccordionItem value="date" className="border-b border-gray-200">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-base">
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

                      {/* Country Filter */}
                      <AccordionItem value="country" className="border-b border-gray-200">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-base">
                          <span>Country</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 pl-4">
                        <div className="relative">
                          <Input
                            placeholder="Input store name to search"
                            className="w-full h-10 pr-10"
                            value={accountSearch}
                            onChange={(e) => setAccountSearch(e.target.value)}
                          />
                          {accountSearch && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setAccountSearch("")}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-3 border border-gray-100 rounded-md p-3">
                          {["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"].filter(country => 
                            country.toLowerCase().includes(accountSearch.toLowerCase())
                          ).map((country) => (
                            <div key={country} className="flex items-center space-x-2">
                              <Checkbox
                                id={country}
                                checked={selectedCountries.includes(country)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCountries([...selectedCountries, country]);
                                  } else {
                                    setSelectedCountries(selectedCountries.filter(c => c !== country));
                                  }
                                }}
                              />
                              <Label htmlFor={country} className="text-base font-normal cursor-pointer">{country}</Label>
                            </div>
                          ))}
                        </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Time Zone Filter */}
                      <AccordionItem value="timezone" className="border-b border-gray-200">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-base">
                          <span>Time Zone</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 pl-4">
                        <div className="relative">
                          <Input
                            placeholder="Please select"
                            className="w-full h-10 pr-10"
                            value={timeZoneSearch}
                            onChange={(e) => setTimeZoneSearch(e.target.value)}
                          />
                          {timeZoneSearch && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setTimeZoneSearch("")}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-3 border border-gray-100 rounded-md p-3">
                          <RadioGroup value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
                            {[
                              { value: "Etc/GMT+12", label: "(GMT-12:00) International Date Line West" },
                              { value: "US/Samoa", label: "(GMT-11:00) Samoa" },
                              { value: "Pacific/Niue", label: "(GMT-11:00) Niue" },
                              { value: "Pacific/Midway", label: "(GMT-11:00) Midway Island" },
                              { value: "Etc/GMT+11", label: "(GMT-11:00) GMT+11" },
                              { value: "Pacific/Pago_Pago", label: "(GMT-11:00) American Samoa" },
                              { value: "Pacific/Tahiti", label: "(GMT-10:00) Tahiti" },
                              { value: "Pacific/Rarotonga", label: "(GMT-10:00) Rarotonga" },
                              { value: "Pacific/Johnston", label: "(GMT-10:00) Johnston" },
                              { value: "Pacific/Honolulu", label: "(GMT-10:00) Honolulu" },
                              { value: "US/Hawaii", label: "(GMT-10:00) Hawaii" },
                              { value: "HST", label: "(GMT-10:00) HST" },
                              { value: "Etc/GMT+10", label: "(GMT-10:00) GMT+10" },
                              { value: "America/Atka", label: "(GMT-10:00) Atka" },
                              { value: "US/Aleutian", label: "(GMT-10:00) Aleutian" },
                              { value: "America/Adak", label: "(GMT-10:00) Adak" },
                              { value: "Pacific/Norfolk", label: "(GMT+11:00) Norfolk" },
                              { value: "Pacific/Pohnpei", label: "(GMT+11:00) Pohnpei" },
                              { value: "Pacific/Ponape", label: "(GMT+11:00) Ponape" },
                              { value: "Asia/Sakhalin", label: "(GMT+11:00) Sakhalin" },
                              { value: "Pacific/Guadalcanal", label: "(GMT+11:00) Solomon Is." },
                              { value: "Asia/Srednekolymsk", label: "(GMT+11:00) Srednekolymsk" },
                              { value: "Asia/Anadyr", label: "(GMT+12:00) Anadyr" },
                              { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland, Wellington" },
                              { value: "Pacific/Fiji", label: "(GMT+12:00) Fiji" },
                              { value: "Pacific/Funafuti", label: "(GMT+12:00) Funafuti" },
                              { value: "Etc/GMT-12", label: "(GMT+12:00) GMT-12" },
                              { value: "Asia/Kamchatka", label: "(GMT+12:00) Kamchatka" },
                              { value: "Pacific/Kwajalein", label: "(GMT+12:00) Kwajalein" },
                              { value: "Pacific/Majuro", label: "(GMT+12:00) Marshall Is." },
                              { value: "Antarctica/McMurdo", label: "(GMT+12:00) McMurdo" },
                              { value: "NZ", label: "(GMT+12:00) NZ" },
                              { value: "Pacific/Nauru", label: "(GMT+12:00) Nauru" },
                              { value: "Antarctica/South_Pole", label: "(GMT+12:00) South_Pole" },
                              { value: "Pacific/Tarawa", label: "(GMT+12:00) Tarawa" },
                              { value: "Pacific/Wake", label: "(GMT+12:00) Wake" },
                              { value: "Pacific/Wallis", label: "(GMT+12:00) Wallis" },
                              { value: "Pacific/Chatham", label: "(GMT+12:45) Chatham Is." },
                              { value: "NZ-CHAT", label: "(GMT+12:45) NZ-CHAT" },
                              { value: "Pacific/Enderbury", label: "(GMT+13:00) Enderbury" },
                              { value: "Etc/GMT-13", label: "(GMT+13:00) GMT-13" },
                              { value: "Pacific/Kanton", label: "(GMT+13:00) Kanton" },
                              { value: "Pacific/Tongatapu", label: "(GMT+13:00) Nuku'alofa" },
                              { value: "Pacific/Apia", label: "(GMT+13:00) Samoa" },
                              { value: "Pacific/Fakaofo", label: "(GMT+13:00) Tokelau Is." },
                              { value: "Etc/GMT-14", label: "(GMT+14:00) GMT-14" },
                              { value: "Pacific/Kiritimati", label: "(GMT+14:00) Kiritimati" }
                            ].filter(timezone => 
                              timezone.label.toLowerCase().includes(timeZoneSearch.toLowerCase())
                            ).map((timezone) => (
                              <div key={timezone.value} className="flex items-center space-x-2 py-1.5">
                                <RadioGroupItem value={timezone.value} id={timezone.value} />
                                <Label htmlFor={timezone.value} className="text-base font-normal cursor-pointer">{timezone.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Flags Filter */}
                      <AccordionItem value="flags" className="border-b border-gray-200">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-base">
                          <span>Flags</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 pl-4">
                        <div className="space-y-3">
                          {[
                            { value: "none", label: "None", image: "/noneflag.png" },
                            { value: "grey", label: "Grey", image: "/greyFlag.png" },
                            { value: "blue", label: "Blue", image: "/blueFlag.png" },
                            { value: "green", label: "Green", image: "/greenFlag.png" },
                            { value: "yellow", label: "Yellow", image: "/yellowFlag.png" },
                            { value: "red", label: "Red", image: "/redFlag.png" }
                          ].map((flag) => (
                            <div key={flag.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={flag.value}
                                checked={selectedFlags.includes(flag.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedFlags([...selectedFlags, flag.value]);
                                  } else {
                                    setSelectedFlags(selectedFlags.filter(f => f !== flag.value));
                                  }
                                }}
                              />
                              <img src={flag.image} alt={flag.label} className="w-8 h-6 object-contain mr-2" />
                              <Label htmlFor={flag.value} className="text-base font-normal cursor-pointer">{flag.label}</Label>
                            </div>
                          ))}
                        </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Order Method Filter */}
                      <AccordionItem value="order-method" className="border-b border-gray-200">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-base">
                          <span>Order Method</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 pl-4">
                        <RadioGroup value={orderMethod} onValueChange={setOrderMethod} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="api" id="api" />
                            <Label htmlFor="api" className="text-base font-normal cursor-pointer">Placed by API</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manually" id="manually" />
                            <Label htmlFor="manually" className="text-base font-normal cursor-pointer">Placed by Manually</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="extension" id="extension" />
                            <Label htmlFor="extension" className="text-base font-normal cursor-pointer">Placed by DShipIt extension</Label>
                          </div>
                        </RadioGroup>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Supplier Account ID Filter */}
                      <AccordionItem value="account-id">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-base">
                          <span>{supplierDisplayName} Account ID</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 pl-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="relative">
                                <Input
                                  placeholder="Input store name to search"
                                  className="w-full h-10 pr-10"
                                  value={accountSearch}
                                  onChange={(e) => setAccountSearch(e.target.value)}
                                />
                                <Button
                                  type="button"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-10 p-0"
                                >
                                  <Search className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <img 
                                src="/brush_import.png" 
                                alt="Import brush" 
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            {/* Account list would be populated here */}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 left-0 right-0 p-6 border-t bg-background flex gap-3 shadow-lg z-10">
                    <Button 
                      variant="outline" 
                      className="flex-1 uppercase"
                      onClick={() => {
                        // Clear all filters
                        setDateFilter("30days");
                        setFromDate(undefined);
                        setToDate(undefined);
                        setSelectedCountries([]);
                        setSelectedTimeZone("");
                        setTimeZoneSearch("");
                        setSelectedFlags([]);
                        setOrderMethod("");
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

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* Sync Supplier Order Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-lg font-light h-12">
                    <span>Sync {supplierDisplayName} Order</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[504px] h-[147px] flex flex-col justify-between py-1 overflow-hidden">
                  <DropdownMenuItem className="text-base font-normal px-4 flex-1 flex items-center">Sync via DShipIt Chrome Extension</DropdownMenuItem>
                  <DropdownMenuItem className="text-base font-normal px-4 flex-1 flex items-center">Sync the latest Tracking Number with the Chrome Extension</DropdownMenuItem>
                  <DropdownMenuItem className="text-base font-normal whitespace-normal px-4 flex-1 flex items-center">Sync via API (You can manually sync from {supplierDisplayName} 5 time(s) today, it will refresh at GMT 0:00)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* View Toggle Switches */}
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => setViewMode("detail")}
                        className={`cursor-pointer p-1 rounded transition-colors ${
                          viewMode === "detail" 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <List className="h-6 w-6" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detail View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => setViewMode("compact")}
                        className={`cursor-pointer p-1 rounded transition-colors ${
                          viewMode === "compact" 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Grid3X3 className="h-6 w-6" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compact View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>


        {/* Order Status Tabs */}
        <div className="mb-6 mt-12">
          <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="w-full">
            <div className="mb-4">
              <TabsList className="h-10 bg-transparent gap-1.5 p-0">
                <TabsTrigger 
                  value="pending" 
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'pending' ? 'font-bold' : 'font-light'}`}
                >
                  Pending <span className={`-ml-0.5 opacity-70 text-xs ${activeStatusTab === 'pending' ? 'font-light' : ''}`}>({orderStatusCounts.pending})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting_order"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'awaiting_order' ? 'font-bold' : 'font-light'}`}
                >
                  Awaiting order <span className={`-ml-0.5 opacity-70 text-xs ${activeStatusTab === 'awaiting_order' ? 'font-light' : ''}`}>({orderStatusCounts.awaiting_order})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting_payment"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'awaiting_payment' ? 'font-bold' : 'font-light'}`}
                >
                  Awaiting payment <span className={`-ml-0.5 opacity-70 text-xs ${activeStatusTab === 'awaiting_payment' ? 'font-light' : ''}`}>({orderStatusCounts.awaiting_payment})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting_shipment"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'awaiting_shipment' ? 'font-bold' : 'font-light'}`}
                >
                  Awaiting shipment <span className={`-ml-0.5 opacity-70 text-xs ${activeStatusTab === 'awaiting_shipment' ? 'font-light' : ''}`}>({orderStatusCounts.awaiting_shipment})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting_fulfillment"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'awaiting_fulfillment' ? 'font-bold' : 'font-light'}`}
                >
                  Awaiting fulfillment <span className={`-ml-0.5 opacity-70 text-xs ${activeStatusTab === 'awaiting_fulfillment' ? 'font-light' : ''}`}>({orderStatusCounts.awaiting_fulfillment})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="fulfilled"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'fulfilled' ? 'font-bold' : 'font-light'}`}
                >
                  Fulfilled <span className={`-ml-0.5 opacity-70 text-xs ${activeStatusTab === 'fulfilled' ? 'font-light' : ''}`}>({orderStatusCounts.fulfilled})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="canceled"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'canceled' ? 'font-bold' : 'font-light'}`}
                >
                  Canceled <span className={`-ml-0.5 opacity-70 text-xs text-orange-500 ${activeStatusTab === 'canceled' ? 'font-light' : ''}`}>({orderStatusCounts.canceled})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="failed"
                  className={`text-[15px] px-3 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] ${activeStatusTab === 'failed' ? 'font-bold' : 'font-light'}`}
                >
                  Failed orders <span className={`-ml-0.5 opacity-70 text-xs text-red-500 ${activeStatusTab === 'failed' ? 'font-light' : ''}`}>({orderStatusCounts.failed})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 mb-4 h-16">
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={selectedAll} 
                  onCheckedChange={handleSelectAll}
                  disabled={!hasOrders}
                  className="h-5 w-5"
                />
                {activeStatusTab === "awaiting_payment" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <div className="absolute inset-0 z-10 cursor-not-allowed" />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={!hasOrders}
                            className="text-base font-normal hover:bg-gray-100 text-gray-600 cursor-not-allowed"
                          >
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                              <path d="M12.0049 22.0029C6.48204 22.0029 2.00488 17.5258 2.00488 12.0029C2.00488 6.48008 6.48204 2.00293 12.0049 2.00293C17.5277 2.00293 22.0049 6.48008 22.0049 12.0029C22.0049 17.5258 17.5277 22.0029 12.0049 22.0029ZM8.50488 14.0029V16.0029H11.0049V18.0029H13.0049V16.0029H14.0049C15.3856 16.0029 16.5049 14.8836 16.5049 13.5029C16.5049 12.1222 15.3856 11.0029 14.0049 11.0029H10.0049C9.72874 11.0029 9.50488 10.7791 9.50488 10.5029C9.50488 10.2268 9.72874 10.0029 10.0049 10.0029H15.5049V8.00293H13.0049V6.00293H11.0049V8.00293H10.0049C8.62417 8.00293 7.50488 9.12222 7.50488 10.5029C7.50488 11.8836 8.62417 13.0029 10.0049 13.0029H14.0049C14.281 13.0029 14.5049 13.2268 14.5049 13.5029C14.5049 13.7791 14.281 14.0029 14.0049 14.0029H8.50488Z"></path>
                            </svg>
                            Make Payment
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <h3 className="font-semibold">Make your payments on {supplierDisplayName}<br />Official website to complete your orders.</h3>
                          <h4 className="font-medium">What happens for overdue payment?</h4>
                          <div className="space-y-1 text-sm">
                            <p>1. Your orders might get canceled</p>
                            <p>2. Your account might experience payment failure</p>
                          </div>
                          <h5 className="font-medium text-sm">Please complete your payment asap to satisfy<br />your customers!</h5>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {activeStatusTab === "canceled" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!hasOrders}
                    className="text-base font-normal hover:bg-gray-100 text-gray-600"
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Place order again
                  </Button>
                )}
                {activeStatusTab === "awaiting_order" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!hasOrders}
                    className="text-base font-normal hover:bg-gray-100 text-gray-600"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                      <path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zm18.6-251.7L765 393.7c-5.3-4.2-13-.4-13 6.3v76H438c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z"></path>
                    </svg>
                    Place order to {supplierDisplayName}
                  </Button>
                )}
                {activeStatusTab === "failed" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!hasOrders}
                    className="text-base font-normal hover:bg-gray-100 text-gray-600"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                      <path d="M888.3 757.4h-53.8c-4.2 0-7.7 3.5-7.7 7.7v61.8H197.1V197.1h629.8v61.8c0 4.2 3.5 7.7 7.7 7.7h53.8c4.2 0 7.7-3.4 7.7-7.7V158.7c0-17-13.7-30.7-30.7-30.7H158.7c-17 0-30.7 13.7-30.7 30.7v706.6c0 17 13.7 30.7 30.7 30.7h706.6c17 0 30.7-13.7 30.7-30.7V765.1c0-4.3-3.5-7.7-7.7-7.7zm18.6-251.7L765 393.7c-5.3-4.2-13-.4-13 6.3v76H438c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z"></path>
                    </svg>
                    Place order to {supplierDisplayName}
                  </Button>
                )}
              </div>
              
                
                <div className="flex items-center gap-4">
                {/* Status dropdown for fulfilled tab - first in right side, outside opacity logic */}
                {activeStatusTab === "fulfilled" && (
                  <div className="relative status-dropdown-container">
                    <button
                      className="flex items-center justify-between gap-2 w-auto min-w-[120px] whitespace-nowrap text-base font-normal cursor-pointer px-3 py-2 rounded"
                      style={{ color: '#000', backgroundColor: 'transparent' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsStatusDropdownOpen(!isStatusDropdownOpen);
                      }}
                      onMouseEnter={() => statusFilter && setIsStatusHovered(true)}
                      onMouseLeave={() => setIsStatusHovered(false)}
                    >
                      <span style={{ color: '#000' }}>
                        {statusFilter ? 
                          (statusFilter === 'fulfilled-tracking' ? 'Fulfilled with a tracking number' :
                           statusFilter === 'fulfilled-ebay' ? 'Fulfilled by Ebay' :
                           statusFilter === 'fulfilled-manually' ? 'Fulfilled manually on DShipIt' :
                           statusFilter === `canceled-${supplierName}` ? `Canceled by ${supplierDisplayName}` : 'Status') 
                          : 'Status'}
                      </span>
                      {statusFilter && isStatusHovered ? (
                        <X className="h-4 w-4" style={{ color: '#000' }} onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter('');
                          setIsStatusHovered(false);
                        }} />
                      ) : (
                        <ChevronDown className="h-4 w-4" style={{ color: '#000' }} />
                      )}
                    </button>
                    
                    {isStatusDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-max bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div
                          className="px-3 py-2.5 text-base font-normal hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          style={{ color: '#000' }}
                          onClick={() => {
                            setStatusFilter('fulfilled-tracking');
                            setIsStatusDropdownOpen(false);
                          }}
                        >
                          Fulfilled with a tracking number
                        </div>
                        <div
                          className="px-3 py-2.5 text-base font-normal hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          style={{ color: '#000' }}
                          onClick={() => {
                            setStatusFilter('fulfilled-ebay');
                            setIsStatusDropdownOpen(false);
                          }}
                        >
                          Fulfilled by Ebay
                        </div>
                        <div
                          className="px-3 py-2.5 text-base font-normal hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          style={{ color: '#000' }}
                          onClick={() => {
                            setStatusFilter('fulfilled-manually');
                            setIsStatusDropdownOpen(false);
                          }}
                        >
                          Fulfilled manually on DShipIt
                        </div>
                        <div
                          className="px-3 py-2.5 text-base font-normal hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          style={{ color: '#000' }}
                          onClick={() => {
                            setStatusFilter(`canceled-${supplierName}`);
                            setIsStatusDropdownOpen(false);
                          }}
                        >
                          Canceled by {supplierDisplayName}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Canceled by dropdown for canceled tab - first in right side, outside opacity logic */}
                {activeStatusTab === "canceled" && (
                  <div className="relative canceled-by-dropdown-container">
                    <button
                      className="flex items-center justify-between gap-2 w-auto min-w-[120px] whitespace-nowrap text-base font-normal cursor-pointer px-3 py-2 rounded"
                      style={{ color: '#000', backgroundColor: 'transparent' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCanceledByDropdownOpen(!isCanceledByDropdownOpen);
                      }}
                      onMouseEnter={() => canceledByFilter && setIsCanceledByHovered(true)}
                      onMouseLeave={() => setIsCanceledByHovered(false)}
                    >
                      <span style={{ color: '#000' }}>
                        {canceledByFilter ? 
                          (canceledByFilter === supplierName ? supplierDisplayName :
                           canceledByFilter === 'ebay' ? 'eBay' : 'Canceled by') 
                          : 'Canceled by'}
                      </span>
                      {canceledByFilter && isCanceledByHovered ? (
                        <X className="h-4 w-4" style={{ color: '#000' }} onClick={(e) => {
                          e.stopPropagation();
                          setCanceledByFilter('');
                          setIsCanceledByHovered(false);
                        }} />
                      ) : (
                        <ChevronDown className="h-4 w-4" style={{ color: '#000' }} />
                      )}
                    </button>
                    
                    {isCanceledByDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-max bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div
                          className="px-3 py-2.5 text-base font-normal hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          style={{ color: '#000' }}
                          onClick={() => {
                            setCanceledByFilter(supplierName);
                            setIsCanceledByDropdownOpen(false);
                          }}
                        >
                          {supplierDisplayName}
                        </div>
                        <div
                          className="px-3 py-2.5 text-base font-normal hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          style={{ color: '#000' }}
                          onClick={() => {
                            setCanceledByFilter('ebay');
                            setIsCanceledByDropdownOpen(false);
                          }}
                        >
                          eBay
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-4" style={{ opacity: hasOrders ? 1 : 0.5 }}>
                  {activeStatusTab === "pending" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                      </svg>
                      Fulfill Orders Manually
                    </Button>
                  </>
                ) : activeStatusTab === "awaiting_order" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                      </svg>
                      Fulfill Orders Manually
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path d="M11.0049 20.9995C11.0049 20.1711 10.3333 19.4995 9.50488 19.4995C8.67646 19.4995 8.00488 20.1711 8.00488 20.9995H3.00488C2.4526 20.9995 2.00488 20.5518 2.00488 19.9995V3.99951C2.00488 3.44723 2.4526 2.99951 3.00488 2.99951H8.00488C8.00488 3.82794 8.67646 4.49951 9.50488 4.49951C10.3333 4.49951 11.0049 3.82794 11.0049 2.99951H21.0049C21.5572 2.99951 22.0049 3.44723 22.0049 3.99951V9.49951C20.6242 9.49951 19.5049 10.6188 19.5049 11.9995C19.5049 13.3802 20.6242 14.4995 22.0049 14.4995V19.9995C22.0049 20.5518 21.5572 20.9995 21.0049 20.9995H11.0049ZM9.50488 10.4995C10.3333 10.4995 11.0049 9.82794 11.0049 8.99951C11.0049 8.17108 10.3333 7.49951 9.50488 7.49951C8.67646 7.49951 8.00488 8.17108 8.00488 8.99951C8.00488 9.82794 8.67646 10.4995 9.50488 10.4995ZM9.50488 16.4995C10.3333 16.4995 11.0049 15.8279 11.0049 14.9995C11.0049 14.1711 10.3333 13.4995 9.50488 13.4995C8.67646 13.4995 8.00488 14.1711 8.00488 14.9995C8.00488 15.8279 8.67646 16.4995 9.50488 16.4995Z"></path>
                      </svg>
                      Coupons
                    </Button>
                  </>
                ) : activeStatusTab === "fulfilled" ? (
                  <>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 512 512" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                        style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}
                      >
                        <path d="M453.594 100.001l-32.353-39.299C415.469 52.627 405.083 48 394.664 48H117.335c-10.416 0-20.801 4.627-26.576 12.702l-32.351 39.299C51.468 106.923 48 117.335 48 128.886v288.89C48 443.2 68.8 464 94.225 464h323.553C443.202 464 464 443.2 464 417.775v-288.89c0-11.55-3.463-21.962-10.406-28.884zM256 383.109L128.89 256h80.89v-46.224h92.443V256h80.89L256 383.109zM96.534 94.221L115.02 71.11h277.331l21.965 23.111H96.534z"></path>
                      </svg>
                      Archive
                    </Button>
                  </>
                ) : activeStatusTab === "canceled" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                      </svg>
                      Fulfill Orders Manually
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path d="M11.0049 20.9995C11.0049 20.1711 10.3333 19.4995 9.50488 19.4995C8.67646 19.4995 8.00488 20.1711 8.00488 20.9995H3.00488C2.4526 20.9995 2.00488 20.5518 2.00488 19.9995V3.99951C2.00488 3.44723 2.4526 2.99951 3.00488 2.99951H8.00488C8.00488 3.82794 8.67646 4.49951 9.50488 4.49951C10.3333 4.49951 11.0049 3.82794 11.0049 2.99951H21.0049C21.5572 2.99951 22.0049 3.44723 22.0049 3.99951V9.49951C20.6242 9.49951 19.5049 10.6188 19.5049 11.9995C19.5049 13.3802 20.6242 14.4995 22.0049 14.4995V19.9995C22.0049 20.5518 21.5572 20.9995 21.0049 20.9995H11.0049ZM9.50488 10.4995C10.3333 10.4995 11.0049 9.82794 11.0049 8.99951C11.0049 8.17108 10.3333 7.49951 9.50488 7.49951C8.67646 7.49951 8.00488 8.17108 8.00488 8.99951C8.00488 9.82794 8.67646 10.4995 9.50488 10.4995ZM9.50488 16.4995C10.3333 16.4995 11.0049 15.8279 11.0049 14.9995C11.0049 14.1711 10.3333 13.4995 9.50488 13.4995C8.67646 13.4995 8.00488 14.1711 8.00488 14.9995C8.00488 15.8279 8.67646 16.4995 9.50488 16.4995Z"></path>
                      </svg>
                      Coupons
                    </Button>
                  </>
                ) : activeStatusTab === "failed" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                      </svg>
                      Fulfill Orders Manually
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path d="M11.0049 20.9995C11.0049 20.1711 10.3333 19.4995 9.50488 19.4995C8.67646 19.4995 8.00488 20.1711 8.00488 20.9995H3.00488C2.4526 20.9995 2.00488 20.5518 2.00488 19.9995V3.99951C2.00488 3.44723 2.4526 2.99951 3.00488 2.99951H8.00488C8.00488 3.82794 8.67646 4.49951 9.50488 4.49951C10.3333 4.49951 11.0049 3.82794 11.0049 2.99951H21.0049C21.5572 2.99951 22.0049 3.44723 22.0049 3.99951V9.49951C20.6242 9.49951 19.5049 10.6188 19.5049 11.9995C19.5049 13.3802 20.6242 14.4995 22.0049 14.4995V19.9995C22.0049 20.5518 21.5572 20.9995 21.0049 20.9995H11.0049ZM9.50488 10.4995C10.3333 10.4995 11.0049 9.82794 11.0049 8.99951C11.0049 8.17108 10.3333 7.49951 9.50488 7.49951C8.67646 7.49951 8.00488 8.17108 8.00488 8.99951C8.00488 9.82794 8.67646 10.4995 9.50488 10.4995ZM9.50488 16.4995C10.3333 16.4995 11.0049 15.8279 11.0049 14.9995C11.0049 14.1711 10.3333 13.4995 9.50488 13.4995C8.67646 13.4995 8.00488 14.1711 8.00488 14.9995C8.00488 15.8279 8.67646 16.4995 9.50488 16.4995Z"></path>
                      </svg>
                      Coupons
                    </Button>
                  </>
                ) : activeStatusTab === "awaiting_payment" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                      </svg>
                      Fulfill Orders Manually
                    </Button>
                  </>
                ) : activeStatusTab === "awaiting_shipment" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!hasOrders}
                      className="text-base font-normal hover:bg-gray-100 text-gray-600"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2" style={{ height: "24px", width: "24px", minHeight: "24px", minWidth: "24px" }}>
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                      </svg>
                      Fulfill Orders Manually
                    </Button>
                  </>
                ) : null}
                




                {activeStatusTab !== "failed" && (
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col items-center">
                      <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 1024 1024" 
                        height="1.1em" 
                        width="1.1em" 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="text-gray-600"
                        style={{ opacity: sortDirection === "asc" ? 1 : 0.24, cursor: "pointer" }}
                        onClick={() => handleSort("asc")}
                      >
                        <path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z"></path>
                      </svg>
                      <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 1024 1024" 
                        height="1.1em" 
                        width="1.1em" 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="text-gray-600"
                        style={{ opacity: sortDirection === "desc" ? 1 : 0.24, cursor: "pointer" }}
                        onClick={() => handleSort("desc")}
                      >
                        <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
                      </svg>
                    </div>
                  </div>
                )}

                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" fontSize="20" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
                </svg>
                </div>
                
              </div>
            </div>

            {/* Tab Content */}
            <TabsContent value="pending" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Pending Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/orders-pending-no-data.png" 
                              alt="No pending orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Pending orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Pending tab are orders for which the payment from your customers has not yet been captured in Ebay. Click{" "}
                              <a 
                                href="#" 
                                target="_blank" 
                                className="text-blue-500 hover:underline"
                              >
                                here
                              </a>{" "}
                              to learn more about orders in the Pending tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="awaiting_order" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Awaiting Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/open-orders-pending-orders.png" 
                              alt="No awaiting orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Orders awaiting to be placed will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Awaiting order tab are orders for which the payment from your customers has been captured on Ebay and are waiting to be processed to {supplierDisplayName}. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Awaiting order tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Other status tabs */}
            <TabsContent value="awaiting_payment" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Awaiting Payment Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/awaitingpayment.png" 
                              alt="No awaiting payment orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Awaiting payment orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Awaiting payment tab are orders that have been placed on {supplierDisplayName} but not paid yet. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Awaiting payment tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="awaiting_shipment" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Awaiting Shipment Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/openorders-awaitshipment.png" 
                              alt="No awaiting shipment orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Awaiting shipment orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Awaiting shipment tab are orders that have been paid on {supplierDisplayName} but have not been shipped yet. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Awaiting shipment tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="awaiting_fulfillment" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Awaiting Fulfillment Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/awaitingFulfillment.png" 
                              alt="No awaiting fulfillment orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Awaiting fulfillment orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Awaiting fulfillment tab are orders only partially fulfilled. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Awaiting fulfillment tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fulfilled" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Fulfilled Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/fulfilled.png" 
                              alt="No fulfilled orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Fulfilled orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Fulfilled tab are orders that have been shipped out by your {supplierDisplayName} supplier and orders that were automatically or manually fulfilled. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Fulfilled tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="canceled" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Canceled Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/cancelledOrders.png" 
                              alt="No canceled orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Canceled orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Canceled tab are orders that have been (partially) canceled / (partially) refunded on {supplierDisplayName} or Ebay. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Canceled tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="failed" className="mt-0 min-h-[400px]">
              {hasOrders ? (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p>Failed Order {index + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <div className="w-full">
                      <div className="flex items-center justify-center pt-4">
                        <div className="flex items-center gap-8 max-w-5xl w-full">
                          <div className="flex-shrink-0">
                            <img 
                              src="/open-orders-failed.png" 
                              alt="No failed orders illustration"
                              className="w-80 h-auto object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-lg font-semibold mb-4">Failed orders will be displayed here</div>
                            <div className="text-base text-muted-foreground">
                              Orders in the Failed tab are orders which could not be placed to {supplierDisplayName} successfully due to errors or restrictions. Click{" "}
                              <a href="#" target="_blank" className="text-blue-500 hover:underline">
                                here
                              </a>{" "}
                              to learn more about orders in the Failed tab.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            {activeStatusTab === "awaiting_payment" ? (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Awaiting payment tab.
              </>
            ) : activeStatusTab === "awaiting_shipment" ? (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Awaiting shipment tab.
              </>
            ) : activeStatusTab === "awaiting_fulfillment" ? (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Awaiting fulfillment tab.
              </>
            ) : activeStatusTab === "fulfilled" ? (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Fulfilled tab.
              </>
            ) : activeStatusTab === "canceled" ? (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Canceled tab.
              </>
            ) : activeStatusTab === "failed" ? (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Failed tab.
              </>
            ) : (
              <>
                Click{" "}
                <a href="#" target="_blank" className="text-blue-500 hover:underline">
                  here
                </a>{" "}
                to learn more about orders in the Awaiting order tab.
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8 gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled className="text-xs">
              <ChevronUp className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" disabled className="text-xs">
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          </div>
          <Select defaultValue="40">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20/ page</SelectItem>
              <SelectItem value="40">40/ page</SelectItem>
              <SelectItem value="60">60/ page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}