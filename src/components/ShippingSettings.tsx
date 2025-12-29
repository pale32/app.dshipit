"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, X, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShippingSettingsProps {
  setShowUpgradeDialog: (show: boolean) => void;
  shouldShakeSettingsButtons?: boolean;
}

export default function ShippingSettings({ setShowUpgradeDialog, shouldShakeSettingsButtons }: ShippingSettingsProps) {
  const [shippingMethodType, setShippingMethodType] = useState("global");
  const [originalShippingMethodType, setOriginalShippingMethodType] = useState("global");
  const [hasShippingChanges, setHasShippingChanges] = useState(false);
  const [globalShippingRows, setGlobalShippingRows] = useState<any[]>([]);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [trackingAvailable, setTrackingAvailable] = useState(true);
  const [deliveryPeriod, setDeliveryPeriod] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [advancedPreference, setAdvancedPreference] = useState("less-cost");

  // Ref for measuring content width and position
  const contentRef = useRef<HTMLDivElement>(null);
  const [footerStyle, setFooterStyle] = useState<React.CSSProperties>({});

  // Update footer position and width based on content
  useEffect(() => {
    const updateFooterPosition = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        setFooterStyle({
          left: `${rect.left}px`,
          width: `${rect.width}px`,
        });
      }
    };

    updateFooterPosition();
    window.addEventListener('resize', updateFooterPosition);

    return () => {
      window.removeEventListener('resize', updateFooterPosition);
    };
  }, []);

  // Detect shipping changes
  useEffect(() => {
    const hasChanges = shippingMethodType !== originalShippingMethodType;
    setHasShippingChanges(hasChanges);
  }, [shippingMethodType, originalShippingMethodType]);

  // Handle save shipping changes
  const handleSaveShippingChanges = () => {
    setOriginalShippingMethodType(shippingMethodType);
    setHasShippingChanges(false);
    // Here you would typically save to backend
  };

  // Handle discard shipping changes
  const handleDiscardShippingChanges = () => {
    setShippingMethodType(originalShippingMethodType);
    setHasShippingChanges(false);
  };

  const addGlobalShippingRow = (value: string) => {
    // Add logic here
  };

  // Shipping methods data
  const SHIPPING_METHODS = [
    { value: "aliexpress-standard-be", label: "AliExpress Standard Shipping" },
    { value: "aliexpress-premium", label: "AliExpress Premium Shipping" },
    { value: "epacket", label: "ePacket" },
    { value: "dhl", label: "DHL Express" },
    { value: "fedex", label: "FedEx International" },
  ];

  const countries = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
  ];

  return (
    <div ref={contentRef} className={`px-6 space-y-6 pb-12 ${hasShippingChanges ? 'pb-24' : 'pb-12'}`}>
      {/* Tracking Section */}
      <Accordion type="single" collapsible defaultValue="tracking" className="w-full">
        <AccordionItem value="tracking" className="border-none">
          <AccordionTrigger className="text-xl font-bold hover:no-underline px-0 py-0">
            <div>
              <div className="text-left">Tracking</div>
              <div className="text-base text-muted-foreground font-normal mt-2">
                Activate this feature to trace the tracking status of orders that have been shipped.
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0 pt-3">
            <div className="border rounded-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/ebayicon.jfif"
                    alt="Spiderco"
                    className="w-6 h-6"
                  />
                  <span className="font-medium">spiderco</span>
                </div>
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setShowUpgradeDialog(true);
                    }
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Shipping Section */}
      <Accordion type="single" collapsible defaultValue="shipping" className="w-full">
        <AccordionItem value="shipping" className="border-none">
          <AccordionTrigger className="text-xl font-bold hover:no-underline px-0 py-0">
            <div>
              <div className="text-left">Shipping</div>
              <div className="text-base text-muted-foreground font-normal mt-2">
                Set up your default shipping method for specific country.
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0 pt-3">
            {/* Supplier Tabs */}
            <Tabs defaultValue="aliexpress" className="w-full">
              <TabsList className="inline-flex bg-transparent p-0 gap-2 border-0">
                <TabsTrigger
                  value="aliexpress"
                  className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
                >
                  AliExpress
                </TabsTrigger>
                <TabsTrigger
                  value="temu"
                  className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
                >
                  Temu
                </TabsTrigger>
                <TabsTrigger
                  value="alibaba"
                  className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
                >
                  Alibaba
                </TabsTrigger>
              </TabsList>

              <TabsContent value="aliexpress" className="mt-6">
                <RadioGroup value={shippingMethodType} onValueChange={setShippingMethodType} className="space-y-6">
                  {/* Global Shipping Method Option */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="global" id="global" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="global" className="text-[1.1rem] font-semibold cursor-pointer">
                          Add Global shipping method card
                        </Label>
                        <p className="text-[0.95rem] text-muted-foreground mt-1">
                          Set up your default shipping method for global countries.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Option */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="advanced" id="advanced" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="advanced" className="text-[1.1rem] font-semibold cursor-pointer">
                          Advanced
                        </Label>
                        <p className="text-[0.95rem] text-muted-foreground mt-1">
                          Set up your default shipping method by price range and delivery date range.
                        </p>

                        {/* Advanced Method Accordion */}
                        <div className="mt-4">
                          <Accordion
                            type="single"
                            collapsible
                            defaultValue={shippingMethodType === "advanced" ? "advanced-1" : undefined}
                            className={`w-full border rounded-lg ${shippingMethodType !== "advanced" ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <AccordionItem value="advanced-1" className="border-none">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <Select defaultValue="global">
                                    <SelectTrigger className="w-[404px] text-[0.925rem]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="global">Global</SelectItem>
                                      <SelectItem value="us">United States</SelectItem>
                                      <SelectItem value="uk">United Kingdom</SelectItem>
                                      <SelectItem value="ca">Canada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-6">
                                  {/* Tracking Information Available */}
                                  <div className="flex items-center justify-between">
                                    <div className="text-base">Tracking information Available</div>
                                    <Switch
                                      checked={trackingAvailable}
                                      onCheckedChange={setTrackingAvailable}
                                    />
                                  </div>

                                  {/* Form Fields */}
                                  <div className="space-y-4">
                                    {/* Delivery Period */}
                                    <div className="flex items-center gap-4">
                                      <Label className="w-32 text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="italic">Delivery period</span>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <HelpCircle className="w-4 h-4 cursor-pointer text-muted-foreground" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Estimated delivery time in days</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      </Label>
                                      <div className="relative w-[140px]">
                                        <Input
                                          type="number"
                                          min={0}
                                          max={999}
                                          value={deliveryPeriod}
                                          onChange={(e) => setDeliveryPeriod(Number(e.target.value))}
                                          className="pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                          days
                                        </span>
                                      </div>
                                    </div>

                                    {/* Shipping Cost */}
                                    <div className="flex items-center gap-4">
                                      <Label className="w-32 text-sm">Shipping cost</Label>
                                      <div className="relative w-[140px]">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                          $
                                        </span>
                                        <Input
                                          type="number"
                                          min={0}
                                          max={9999}
                                          step={0.01}
                                          value={shippingCost}
                                          onChange={(e) => setShippingCost(Number(e.target.value))}
                                          className="pl-7"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Radio Group */}
                                  <RadioGroup value={advancedPreference} onValueChange={setAdvancedPreference} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="less-day" id="adv-less-day" />
                                      <Label htmlFor="adv-less-day" className="text-[0.95rem] cursor-pointer font-normal">
                                        When multiple options meet my conditions, I need less day
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="less-cost" id="adv-less-cost" />
                                      <Label htmlFor="adv-less-cost" className="text-[0.95rem] cursor-pointer font-normal">
                                        When multiple options meet my conditions, I need less cost
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </TabsContent>

              <TabsContent value="temu" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Temu shipping settings will be configured here.
                </div>
              </TabsContent>

              <TabsContent value="alibaba" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Alibaba shipping settings will be configured here.
                </div>
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Add Global shipping method based on product Section */}
      <div className="space-y-4">
        <div>
          <div className="text-xl font-bold">Add Global shipping method based on product</div>
          <div className="text-base text-muted-foreground mt-2">
            Set up your default shipping method for specific AliExpress product. Product based setting has higher priority compared to setting based on country. You can have quick access to this feature by going to Mapping - More action.
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-base">Applicable Platform:</span>
            <div className="flex items-center gap-2">
              <img src="/aliexpressproductsettingsIcon.png" alt="AliExpress" className="w-6 h-6" />
              <img src="/temuProductSettingsIcon.jfif" alt="Temu" className="w-6 h-6" />
              <img src="/1688icon.png" alt="Alibaba" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <button
            onClick={() => setIsProductSheetOpen(true)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <div className="text-base font-medium text-foreground">Search by supplier product title</div>
                <p className="text-sm text-muted-foreground mt-1">You can have quick access to this feature by going to Mapping - More action</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Product Shipping Method Sheet */}
      <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
        <SheetContent className="!w-[868px] !max-w-[868px] p-0 flex flex-col sm:!w-[868px] sm:!max-w-[868px]">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-xl font-semibold">Select product and set up shipping method</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-6 py-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search by keywords of supplier product title"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Product List Area */}
            <div className="space-y-2">
              <div className="text-center py-12 text-muted-foreground">
                <p>No products found. Use the search to find products.</p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t flex-row justify-start gap-2">
            <Button
              variant="outline"
              className="uppercase"
              onClick={() => setIsProductSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="uppercase"
              onClick={() => {
                // Save logic here
                setIsProductSheetOpen(false);
              }}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sticky Footer - Fixed to viewport bottom, matches content width */}
      {hasShippingChanges && (
        <div
          className="fixed bottom-0 border-t bg-background shadow-lg z-50"
          style={footerStyle}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-600">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
                </svg>
                <span className="text-sm">Unsaved changes</span>
              </div>
              <div
                className="flex items-center gap-3"
                style={shouldShakeSettingsButtons ? {
                  animation: 'shake 0.15s ease-in-out infinite',
                  animationIterationCount: '6'
                } : {}}
              >
                {shouldShakeSettingsButtons && (
                  <style dangerouslySetInnerHTML={{
                    __html: "@keyframes shake { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(-2px); } }"
                  }}/>
                )}
                <Button
                  variant="outline"
                  onClick={handleDiscardShippingChanges}
                >
                  DISCARD
                </Button>
                <Button
                  onClick={handleSaveShippingChanges}
                >
                  SAVE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
