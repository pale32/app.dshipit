"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { UpgradePlanDialog } from "@/components/UpgradePlanDialog";

const trackingTabs = [
  { id: "10", label: "All", count: 0 },
  { id: "1", label: "Pending", count: 0 },
  { id: "2", label: "In transit", count: 0 },
  { id: "4", label: "Pick up", count: 0 },
  { id: "6", label: "Delivered", count: 0 },
  { id: "3", label: "Expired", count: 0 },
  { id: "9", label: "Attention", count: 0 },
];

export default function TrackingStatusPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("order-no");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("10");
  const searchRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("30days");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [timeZoneSearch, setTimeZoneSearch] = useState("");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(true);

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
            <span className="text-foreground text-4xl font-medium">Tracking status</span>
            
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
                    <SheetTitle className="text-xl font-semibold">Filter Tracking Status</SheetTitle>
                    <SheetClose className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </SheetClose>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="px-6 space-y-6">
                      <Accordion type="multiple" defaultValue={["marketplace", "date", "timezone"]} className="space-y-6">
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

                        <AccordionItem value="timezone" className="border-b-0">
                          <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium hover:no-underline text-lg">
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
                        setSelectedTimeZone("");
                        setTimeZoneSearch("");
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

        <Alert className="mb-6" style={{
          borderColor: 'rgba(69, 196, 249, 0.2)',
          backgroundColor: 'rgba(125, 9, 255, 0.05)'
        }}>
          <AlertDescription>
            <div className="space-y-2">
              <div>
                <div 
                  className="rounded-[12.5rem] inline-block transition-all duration-200"
                  style={{
                    background: 'linear-gradient(56deg, #45c4f9, #7d09ff 50.33%, #ff0be5)',
                    boxShadow: '0 4px 4px 0 rgba(87, 75, 172, .15)',
                    padding: '0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(56deg, #3aa5d1, #6507d9 50.33%, #d108c1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(56deg, #45c4f9, #7d09ff 50.33%, #ff0be5)';
                  }}
                >
                  <Button 
                    onClick={() => setShowUpgradeDialog(true)} 
                    variant="ghost"
                    className="rounded-[12.5rem] text-white px-8 py-2 h-10 border-0 font-bold bg-transparent hover:bg-transparent hover:text-white"
                  >
                    UPGRADE NOW
                  </Button>
                </div>
              </div>
              <p className="text-base font-light text-muted-foreground leading-relaxed">
                Tracking is a paid feature. Please upgrade your plan to activate it. Activate Tracking to trace the tracking status of orders that have been shipped.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4">
            <TabsList className="h-10 bg-transparent gap-1.5 p-0 flex justify-between w-full">
              {trackingTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-[15px] px-3 py-2 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem] font-medium min-h-[40px] flex items-center justify-center"
                >
                  {tab.label} <span className="ml-2 opacity-70 text-xs font-light">({tab.count})</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {trackingTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <div className="rounded-md min-h-96">
                <div className="flex items-start justify-center py-12 px-8">
                  <div className="flex items-center gap-8 max-w-4xl">
                    <div className="space-y-4 flex-1">
                      <h3 className="text-xl font-medium text-foreground">Accurately know the tracking status.</h3>
                      <div className="space-y-2 text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <span className="font-medium">1.</span>
                          <span>Timely access to package status.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium">2.</span>
                          <span>Reduce delivery delays.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium">3.</span>
                          <span>Give feedback to customers in time.</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <img 
                        src="/tracking_no_data.png" 
                        alt="No tracking data" 
                        className="w-80 h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

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
                <SelectItem value="20">20/ page</SelectItem>
                <SelectItem value="40">40/ page</SelectItem>
                <SelectItem value="60">60/ page</SelectItem>
                <SelectItem value="100">100/ page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <UpgradePlanDialog 
          isOpen={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="Tracking"
        />
      </div>
    </div>
  );
}