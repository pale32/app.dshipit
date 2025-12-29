"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { countries } from "@/lib/countries";

interface WarehouseLocation {
  id: string;
  locationName: string;
  contactName: string;
  country: string;
  tel: string;
  address: string;
  email: string;
  address2: string;
  company: string;
  province: string;
  city: string;
  postCode: string;
  acceptSeaFreight: string;
  deliveryTimeframe: string;
}

export default function FulfillmentSettings() {
  const [fulfillmentMode, setFulfillmentMode] = useState("bulk");
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Global"]);
  const [currentCountry, setCurrentCountry] = useState("Global");
  const [shippingCarrier, setShippingCarrier] = useState("other");
  const [trackingUrlType, setTrackingUrlType] = useState("custom");
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const countryListRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const accordionContentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);
  const [accordionMeasured, setAccordionMeasured] = useState(false);
  const [trackingUrlDialogOpen, setTrackingUrlDialogOpen] = useState(false);
  const [customTrackingUrl, setCustomTrackingUrl] = useState("https://global.cainiao.com/newDetail.htm?mailNoList=%s");
  const [editingTrackingUrl, setEditingTrackingUrl] = useState("");

  const handleAddCountry = (country: string) => {
    if (!selectedCountries.includes(country)) {
      setSelectedCountries([...selectedCountries, country]);
      setCurrentCountry(country);
    }
  };

  const handleRemoveCountry = (country: string) => {
    if (country !== "Global") {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
      if (currentCountry === country) {
        setCurrentCountry("Global");
      }
    }
  };

  const handleCountryBadgeClick = (country: string) => {
    setCurrentCountry(country);
  };

  const handleOpenTrackingUrlDialog = () => {
    setEditingTrackingUrl(customTrackingUrl);
    setTrackingUrlDialogOpen(true);
  };

  const handleSaveTrackingUrl = () => {
    setCustomTrackingUrl(editingTrackingUrl);
    setTrackingUrlDialogOpen(false);
  };

  const handleCancelTrackingUrl = () => {
    setTrackingUrlDialogOpen(false);
  };

  // Measure the right column height on initial render to set the constraint for the country list
  useEffect(() => {
    const measureRightColumn = () => {
      if (rightColumnRef.current && !accordionMeasured) {
        const rightColumnHeight = rightColumnRef.current.offsetHeight;
        // Use 70% of the right column height as max height for country list
        setMaxHeight(Math.floor(rightColumnHeight * 0.7));
        setAccordionMeasured(true);
      }
    };

    // Measure after a delay to ensure content is rendered
    const timer = setTimeout(measureRightColumn, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [accordionMeasured]);

  const createEmptyLocation = (): WarehouseLocation => ({
    id: Date.now().toString(),
    locationName: "",
    contactName: "",
    country: "Afghanistan",
    tel: "",
    address: "",
    email: "",
    address2: "",
    company: "",
    province: "",
    city: "",
    postCode: "",
    acceptSeaFreight: "",
    deliveryTimeframe: "",
  });

  const handleAddLocation = () => {
    const newLocation = createEmptyLocation();
    setLocations([...locations, newLocation]);
    setEditingLocationId(newLocation.id);
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
    if (editingLocationId === id) {
      setEditingLocationId(null);
    }
  };

  const handleLocationChange = (id: string, field: keyof WarehouseLocation, value: string) => {
    setLocations(locations.map(loc =>
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };

  const handleSaveLocation = () => {
    setEditingLocationId(null);
  };

  return (
    <TooltipProvider>
      <div className="px-6 pb-32">
        <div className="space-y-6 w-full">
          {/* Manage Warehouse Location */}
          <Accordion type="single" collapsible defaultValue="warehouse" className="border rounded-lg">
            <AccordionItem value="warehouse" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <div className="text-base font-semibold">Manage Warehouse Location</div>
                  <div className="text-sm text-muted-foreground font-normal mt-1">
                    Manage Location, used for selecting destinations for bulk purchase orders.
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  {/* Existing Locations */}
                  {locations.map((location) => (
                    <Accordion key={location.id} type="single" collapsible defaultValue={location.id} className="border-none">
                      <AccordionItem value={location.id} className="border-none">
                        <AccordionTrigger className="px-0 py-3 hover:no-underline border-none">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground rotate-90" />
                            <span className="text-base">{location.locationName || "location"}</span>
                          </div>
                          <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                            <Edit
                              className="h-4 w-4 cursor-pointer hover:text-primary"
                              onClick={() => setEditingLocationId(location.id)}
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer hover:text-destructive"
                              style={{ marginLeft: '24px' }}
                            />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-4">
                          <div className="space-y-4 mt-5" style={{ width: '98%' }}>
                            {/* Location Name */}
                            <div className="relative w-full">
                              <Input
                                type="text"
                                value={location.locationName}
                                onChange={(e) => handleLocationChange(location.id, "locationName", e.target.value)}
                                className="h-10"
                              />
                              {!location.locationName && (
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                  Location name:
                                </span>
                              )}
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Contact Name */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.contactName}
                                  onChange={(e) => handleLocationChange(location.id, "contactName", e.target.value)}
                                  className="h-10"
                                />
                                {!location.contactName && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Contact Name:
                                  </span>
                                )}
                              </div>

                              {/* Country */}
                              <div className="relative">
                                <Select
                                  value={location.country}
                                  onValueChange={(value) => handleLocationChange(location.id, "country", value)}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Country" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countries.map((country) => (
                                      <SelectItem key={country} value={country}>
                                        {country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Tel */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.tel}
                                  onChange={(e) => handleLocationChange(location.id, "tel", e.target.value)}
                                  className="h-10"
                                />
                                {!location.tel && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Tel:
                                  </span>
                                )}
                              </div>

                              {/* Address */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.address}
                                  onChange={(e) => handleLocationChange(location.id, "address", e.target.value)}
                                  className="h-10"
                                />
                                {!location.address && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Address:
                                  </span>
                                )}
                              </div>

                              {/* Email */}
                              <div className="relative">
                                <Input
                                  type="email"
                                  value={location.email}
                                  onChange={(e) => handleLocationChange(location.id, "email", e.target.value)}
                                  className="h-10"
                                />
                                {!location.email && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    E-mail:
                                  </span>
                                )}
                              </div>

                              {/* Address2 */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.address2}
                                  onChange={(e) => handleLocationChange(location.id, "address2", e.target.value)}
                                  className="h-10"
                                />
                                {!location.address2 && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Address2:
                                  </span>
                                )}
                              </div>

                              {/* Company */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.company}
                                  onChange={(e) => handleLocationChange(location.id, "company", e.target.value)}
                                  className="h-10"
                                />
                                {!location.company && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Company:
                                  </span>
                                )}
                              </div>

                              {/* Province */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.province}
                                  onChange={(e) => handleLocationChange(location.id, "province", e.target.value)}
                                  className="h-10"
                                />
                                {!location.province && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Province:
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Full Width Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* City */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.city}
                                  onChange={(e) => handleLocationChange(location.id, "city", e.target.value)}
                                  className="h-10"
                                />
                                {!location.city && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    City:
                                  </span>
                                )}
                              </div>

                              {/* Post Code */}
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={location.postCode}
                                  onChange={(e) => handleLocationChange(location.id, "postCode", e.target.value)}
                                  className="h-10"
                                />
                                {!location.postCode && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    Post code:
                                  </span>
                                )}
                              </div>

                              {/* Accept Sea Freight */}
                              <div className="relative">
                                <Select
                                  value={location.acceptSeaFreight}
                                  onValueChange={(value) => handleLocationChange(location.id, "acceptSeaFreight", value)}
                                >
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span className="absolute -top-2 left-2 px-1 bg-background text-xs text-muted-foreground">
                                  Do you accept sea freight?
                                </span>
                              </div>
                            </div>

                            {/* Delivery Timeframe - Full Width */}
                            <div className="relative">
                              <Select
                                value={location.deliveryTimeframe}
                                onValueChange={(value) => handleLocationChange(location.id, "deliveryTimeframe", value)}
                              >
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3-7 days">3-7 days</SelectItem>
                                  <SelectItem value="7-14 days">7-14 days</SelectItem>
                                  <SelectItem value="14-30 days">14-30 days</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="absolute -top-2 left-2 px-1 bg-background text-xs text-muted-foreground">
                                What delivery timeframe do you accept?
                              </span>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-start mt-4">
                              <Button
                                onClick={handleSaveLocation}
                                className="uppercase"
                                disabled={!location.locationName || !location.contactName}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}

                  {/* Add Location Button */}
                  <div
                    onClick={handleAddLocation}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      <span>Add location</span>
                    </div>
                    <Plus
                      className="h-5 w-5"
                      style={{ cursor: locations.length > 0 ? 'pointer' : 'no-drop' }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Fulfillment Settings */}
          <Accordion type="single" collapsible defaultValue="fulfillment" className="border rounded-lg">
            <AccordionItem value="fulfillment" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <div className="text-base font-semibold">Fulfillment Settings</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-8">
                  {/* eBay Tab Content */}
                  <div className="space-y-6">
                    {/* Fulfill Items Section */}
                    <div className="space-y-4">
                      <div className="text-base font-semibold">Fulfill items</div>

                      <RadioGroup value={fulfillmentMode} onValueChange={setFulfillmentMode} className="space-y-4">
                        {/* Fulfill items Separately - Disabled */}
                        <div className="flex items-start gap-3 opacity-50">
                          <RadioGroupItem value="separately" id="separately" disabled className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="separately" className="text-base font-medium cursor-not-allowed">
                              Fulfill items Separately
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">
                                After activating this feature, DShipIt will fulfill each product in the orders separately and trigger store shipping confirmation email
                              </p>
                              <Tooltip>
                                <TooltipTrigger>
                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground">
                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Information about separate fulfillment</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        {/* Fulfill items in bulk */}
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="bulk" id="bulk" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="bulk" className="text-base font-medium cursor-pointer">
                              Fulfill items in bulk
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              After activating this feature, DShipIt will fulfill an order only after all products of the order got tracking numbers and trigger store to send only one email to your customer.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Email Settings Section */}
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <div className="text-base font-semibold">Email Settings</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          After this feature is turned on, when all products of an order are shipped, a shipping confirmation email will be sent automatically to your clients according to the email template.
                        </div>
                      </div>

                      {/* Store Configuration */}
                      <Accordion type="single" collapsible defaultValue="store-config" className="border rounded-lg mt-4">
                        <AccordionItem value="store-config" className="border-0">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center gap-3">
                              <img
                                src="/images/ui/info-tooltip.png"
                                alt="Store"
                                className="w-6 h-6"
                              />
                              <span className="text-base">spiderco</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent ref={accordionContentRef} className="px-6 pb-4" style={{ maxHeight: '500px', overflow: 'hidden' }}>
                            <div className="space-y-6">
                              {/* Include tracking information toggle - Full Width */}
                              <div className="flex items-center justify-between py-2">
                                <div className="text-base">Include tracking information in the email.</div>
                                <Switch
                                  checked={trackingEnabled}
                                  onCheckedChange={setTrackingEnabled}
                                />
                              </div>

                              {/* Ship to country heading - Full Width */}
                              <div className="flex items-center gap-2">
                                <span className="text-base font-medium">Ship to country</span>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                      <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                    </svg>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">Global settings will be applied to all countries by default. If you need to configure settings for specific countries, please add the country and set it up below. These country-specific settings will take priority over the global settings.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              {/* Two Column Layout */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ alignItems: 'start' }}>
                                {/* Left Column - Country selections (1/3 width) */}
                                <div className="md:col-span-1">
                                  {/* Country selector */}
                                  <div className="mb-3">
                                    <Select value={currentCountry} onValueChange={handleAddCountry}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Global" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Global">Global</SelectItem>
                                        {countries.map((country) => (
                                          <SelectItem key={country} value={country}>
                                            {country}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {/* Selected countries list */}
                                  <div
                                    ref={countryListRef}
                                    style={{
                                      maxHeight: maxHeight > 0 ? `${maxHeight}px` : '180px',
                                      overflowY: 'auto',
                                      overflowX: 'hidden'
                                    }}
                                  >
                                    {selectedCountries.map((country) => (
                                      <div
                                        key={country}
                                        className={`flex items-center justify-between px-3 py-2 rounded text-sm cursor-pointer mb-2 ${
                                          country === currentCountry
                                            ? "bg-orange-50 text-orange-600 font-medium"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                        onClick={() => handleCountryBadgeClick(country)}
                                      >
                                        <span>{country}</span>
                                        {country !== "Global" && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveCountry(country);
                                            }}
                                            className="hover:text-destructive"
                                          >
                                            <svg
                                              stroke="currentColor"
                                              fill="currentColor"
                                              strokeWidth="0"
                                              viewBox="0 0 1024 1024"
                                              className="h-4 w-4"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path d="M328 544h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"></path>
                                              <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Column - Shipping settings (2/3 width) */}
                                <div ref={rightColumnRef} className="space-y-6 md:col-span-2">
                                {/* Shipping carrier */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src="/images/ui/shipping-carrier.png"
                                      alt="Shipping carrier"
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">Shipping carrier</span>
                                    <div className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                                      Other
                                    </div>
                                  </div>
                                  <Select value={shippingCarrier} onValueChange={setShippingCarrier}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="other">Other</SelectItem>
                                      <SelectItem value="usps">USPS</SelectItem>
                                      <SelectItem value="fedex">FedEx</SelectItem>
                                      <SelectItem value="ups">UPS</SelectItem>
                                      <SelectItem value="dhl">DHL</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Custom Tracking URL */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <img
                                        src="/images/ui/custom-tracking.png"
                                        alt="Custom tracking"
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm font-medium whitespace-nowrap">Custom Tracking Url</span>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path>
                                          </svg>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p className="text-sm">Please note: We will dynamically add a tracking code to the end of this URL. If you want to use URL http://www.17track.net/en/track?nums=1234567 enter only http://www.17track.net/en/track?nums=</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <div className="px-2 py-1 bg-muted rounded text-sm flex items-center gap-1 min-w-0 flex-1">
                                      <span className="truncate">{customTrackingUrl}</span>
                                      <svg
                                        onClick={handleOpenTrackingUrlDialog}
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 24 24"
                                        className="h-3 w-3 cursor-pointer hover:text-primary flex-shrink-0"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                                      </svg>
                                    </div>
                                  </div>
                                  <Select value={trackingUrlType} onValueChange={setTrackingUrlType}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="custom">Custom</SelectItem>
                                      <SelectItem value="carrier">Use Carrier URL</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Custom Tracking URL Edit Dialog */}
      <Dialog open={trackingUrlDialogOpen} onOpenChange={setTrackingUrlDialogOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Custom Tracking Url</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-4">
            <Input
              placeholder="Please enter tracking url."
              value={editingTrackingUrl}
              onChange={(e) => setEditingTrackingUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter className="px-6 pb-6 pt-0 sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancelTrackingUrl}
              className="uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTrackingUrl}
              className="uppercase"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
