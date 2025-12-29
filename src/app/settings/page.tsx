"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import { Settings, Bell, Grid3X3, Package, DollarSign, GitBranch, ClipboardList, Truck, FileText, Search, Plus, Eye, Copy, ChevronLeft, User, MapPin, MessageSquare, Edit, Trash2, Check, Clipboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { IncrementButton } from "@/components/ui/increment-button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpgradePlanDialog } from "@/components/UpgradePlanDialog";
import AutomatedMapping from "@/components/AutomatedMapping";
import OrderSettings from "@/components/OrderSettings";
import ShippingSettings from "@/components/ShippingSettings";
import FulfillmentSettings from "@/components/FulfillmentSettings";

interface DynamicRow {
  id: string;
  rangeStart: string | number;
  rangeEnd: string | number;
  operationValue1: number;
  operationValue2: number;
  checkboxChecked: boolean;
  hasInheritedCheckbox: boolean;
}

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 512 512" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M413.967 276.8c1.06-6.235 1.06-13.518 1.06-20.8s-1.06-13.518-1.06-20.8l44.667-34.318c4.26-3.118 5.319-8.317 2.13-13.518L418.215 115.6c-2.129-4.164-8.507-6.235-12.767-4.164l-53.186 20.801c-10.638-8.318-23.394-15.601-36.16-20.801l-7.448-55.117c-1.06-4.154-5.319-8.318-10.638-8.318h-85.098c-5.318 0-9.577 4.164-10.637 8.318l-8.508 55.117c-12.767 5.2-24.464 12.482-36.171 20.801l-53.186-20.801c-5.319-2.071-10.638 0-12.767 4.164L49.1 187.365c-2.119 4.153-1.061 10.399 2.129 13.518L96.97 235.2c0 7.282-1.06 13.518-1.06 20.8s1.06 13.518 1.06 20.8l-44.668 34.318c-4.26 3.118-5.318 8.317-2.13 13.518L92.721 396.4c2.13 4.164 8.508 6.235 12.767 4.164l53.187-20.801c10.637 8.318 23.394 15.601 36.16 20.801l8.508 55.117c1.069 5.2 5.318 8.318 10.637 8.318h85.098c5.319 0 9.578-4.164 10.638-8.318l8.518-55.117c12.757-5.2 24.464-12.482 36.16-20.801l53.187 20.801c5.318 2.071 10.637 0 12.767-4.164l42.549-71.765c2.129-4.153 1.06-10.399-2.13-13.518l-46.8-34.317zm-158.499 52c-41.489 0-74.46-32.235-74.46-72.8s32.971-72.8 74.46-72.8 74.461 32.235 74.461 72.8-32.972 72.8-74.461 72.8z"></path>
  </svg>
);

const NotificationIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 16 16" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"></path>
  </svg>
);

const ProductIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 18H9V20H2V18ZM2 11H11V13H2V11ZM2 4H22V6H2V4ZM20.674 13.0251L21.8301 12.634L22.8301 14.366L21.914 15.1711C21.9704 15.4386 22 15.7158 22 16C22 16.2842 21.9704 16.5614 21.914 16.8289L22.8301 17.634L21.8301 19.366L20.674 18.9749C20.2635 19.3441 19.7763 19.6295 19.2391 19.8044L19 21H17L16.7609 19.8044C16.2237 19.6295 15.7365 19.3441 15.326 18.9749L14.1699 19.366L13.1699 17.634L14.086 16.8289C14.0296 16.5614 14 16.2842 14 16C14 15.7158 14.0296 15.4386 14.086 15.1711L13.1699 14.366L14.1699 12.634L15.326 13.0251C15.7365 12.6559 16.2237 12.3705 16.7609 12.1956L17 11H19L19.2391 12.1956C19.7763 12.3705 20.2635 12.6559 20.674 13.0251ZM18 17C18.5523 17 19 16.5523 19 16C19 15.4477 18.5523 15 18 15C17.4477 15 17 15.4477 17 16C17 16.5523 17.4477 17 18 17Z"></path>
  </svg>
);

const ApplicationIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zM4 21h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm13 0c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4z"></path>
  </svg>
);

const MappingIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 256 256" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M152,96V80h-8a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h8V160a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16v48a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V192h-8a32,32,0,0,1-32-32V136H80v8a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V112A16,16,0,0,1,32,96H64a16,16,0,0,1,16,16v8h32V96a32,32,0,0,1,32-32h8V48a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V96a16,16,0,0,1-16,16H168A16,16,0,0,1,152,96Z"></path>
  </svg>
);

const OrderIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
  </svg>
);

const PricingIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.00488 3.00293H21.0049C21.5572 3.00293 22.0049 3.45064 22.0049 4.00293V20.0029C22.0049 20.5552 21.5572 21.0029 21.0049 21.0029H3.00488C2.4526 21.0029 2.00488 20.5552 2.00488 20.0029V4.00293C2.00488 3.45064 2.4526 3.00293 3.00488 3.00293ZM8.50488 14.0029V16.0029H11.0049V18.0029H13.0049V16.0029H14.0049C15.3856 16.0029 16.5049 14.8836 16.5049 13.5029C16.5049 12.1222 15.3856 11.0029 14.0049 11.0029H10.0049C9.72874 11.0029 9.50488 10.7791 9.50488 10.5029C9.50488 10.2268 9.72874 10.0029 10.0049 10.0029H15.5049V8.00293H13.0049V6.00293H11.0049V8.00293H10.0049C8.62417 8.00293 7.50488 9.12222 7.50488 10.5029C7.50488 11.8836 8.62417 13.0029 10.0049 13.0029H14.0049C14.281 13.0029 14.5049 13.2268 14.5049 13.5029C14.5049 13.7791 14.281 14.0029 14.0049 14.0029H8.50488Z"></path>
  </svg>
);

const ShippingIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 640 512" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M112 0C85.5 0 64 21.5 64 48V96H16c-8.8 0-16 7.2-16 16s7.2 16 16 16H64 272c8.8 0 16 7.2 16 16s-7.2 16-16 16H64 48c-8.8 0-16 7.2-16 16s7.2 16 16 16H64 240c8.8 0 16 7.2 16 16s-7.2 16-16 16H64 16c-8.8 0-16 7.2-16 16s7.2 16 16 16H64 208c8.8 0 16 7.2 16 16s-7.2 16-16 16H64V416c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H112zM544 237.3V256H416V160h50.7L544 237.3zM160 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm272 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0z"></path>
  </svg>
);

const FulfillmentIcon = ({ className }: { className?: string }) => (
  <svg stroke="#6b7280" fill="#6b7280" strokeWidth="0" viewBox="0 0 512 512" style={{ width: '24px', height: '24px' }} className="mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M124 80v322c0 7.7-6.3 14-14 14s-14-6.3-14-14V112H80c-17.7 0-32 14.3-32 32v288c0 17.7 14.3 32 32 32h353.1c17 0 30.9-13.8 30.9-30.9V80c0-17.7-14.3-32-32-32l-278 2c-17.7 0-30 12.3-30 30zm66 32h84c7.7 0 14 6.3 14 14s-6.3 14-14 14h-84c-7.7 0-14-6.3-14-14s6.3-14 14-14zm0 160h148c7.7 0 14 6.3 14 14s-6.3 14-14 14H190c-7.7 0-14-6.3-14-14s6.3-14 14-14zm196 108H190c-7.7 0-14-6.3-14-14s6.3-14 14-14h196c7.7 0 14 6.3 14 14s-6.3 14-14 14zm0-160H190c-7.7 0-14-6.3-14-14s6.3-14 14-14h196c7.7 0 14 6.3 14 14s-6.3 14-14 14z"></path>
  </svg>
);

const settingsData = [
  { id: "general", label: "User Management", icon: SettingsIcon },
  { id: "notification", label: "Alerts", icon: NotificationIcon },
  { id: "application", label: "Stores & Suppliers", icon: ApplicationIcon },
  { id: "product", label: "Product Settings", icon: ProductIcon },
  { id: "pricing", label: "Pricing & Currencies", icon: PricingIcon },
  { id: "mapping", label: "Automated Mapping", icon: MappingIcon },
  { id: "order", label: "Order Settings", icon: OrderIcon },
  { id: "shipping", label: "Shipping Settings", icon: ShippingIcon },
  { id: "fulfillment", label: "Fulfillment Settings", icon: FulfillmentIcon }
];

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Currency context for global currency management
  const {
    currency,
    currencyInfo,
    detectedCurrency,
    isManualOverride,
    locationData,
    isLoading: isCurrencyLoading,
    setCurrency: updateCurrency,
    error: currencyError
  } = useCurrency();

  // Debug currency detection
  useEffect(() => {
    console.log('🌍 Currency Debug Info:');
    console.log('Currency:', currency);
    console.log('Detected Currency:', detectedCurrency);
    console.log('Location Data:', locationData);
    console.log('Is Manual Override:', isManualOverride);
    console.log('Is Loading:', isCurrencyLoading);
    console.log('Error:', currencyError);
  }, [currency, detectedCurrency, locationData, isManualOverride, isCurrencyLoading, currencyError]);

  // Handle URL search params for deep linking to specific tabs/sections
  useEffect(() => {
    const tab = searchParams.get('tab');
    const section = searchParams.get('section');

    if (tab) {
      // Validate that the tab exists in settingsData
      const validTabs = ['general', 'notification', 'application', 'product', 'pricing', 'mapping', 'order', 'shipping', 'fulfillment'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }

    if (section === 'multilingual-product') {
      setMultilingualAccordionValue('multilingual-product');
    }
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState("notification");
  const [multilingualAccordionValue, setMultilingualAccordionValue] = useState<string | undefined>(undefined);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPricingRuleDialog, setShowPricingRuleDialog] = useState(false);
  const [shippingMethodType, setShippingMethodType] = useState("global");
  const [originalShippingMethodType, setOriginalShippingMethodType] = useState("global");
  const [hasShippingChanges, setHasShippingChanges] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [globalShippingRows, setGlobalShippingRows] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [exchangeRateManual, setExchangeRateManual] = useState(false);
  const [pricingRuleEnabled, setPricingRuleEnabled] = useState(false);
  const [pricingRuleType, setPricingRuleType] = useState("PricingRankBasic");
  const [basicPricingCost, setBasicPricingCost] = useState("Product Cost");
  const [basicPricingPattern, setBasicPricingPattern] = useState("+");
  const [basicPricingValue, setBasicPricingValue] = useState(0);
  const [comparedPricingEnabled, setComparedPricingEnabled] = useState(false);
  const [comparedPricingCost, setComparedPricingCost] = useState("Product Cost");
  const [comparedPricingPattern, setComparedPricingPattern] = useState("+");
  const [comparedPricingValue, setComparedPricingValue] = useState(0);
  const [priceChangesEnabled, setPriceChangesEnabled] = useState(false);

  // Standard Pricing Rule ranges state
  const [standardRange1Start, setStandardRange1Start] = useState(0.00);
  const [standardRange1End, setStandardRange1End] = useState(10.00);
  const [standardRange2Start, setStandardRange2Start] = useState(10.01);
  const [standardRange2End, setStandardRange2End] = useState("");
  const [range1Visible, setRange1Visible] = useState(true);
  const [range2Visible, setRange2Visible] = useState(true);
  const [range2Deletable, setRange2Deletable] = useState(false);

  // Dynamic rows management
  const [dynamicRows, setDynamicRows] = useState<DynamicRow[]>([]);
  const [operationValue1, setOperationValue1] = useState(1.00);
  const [operationValue2, setOperationValue2] = useState(2.00);
  const [operationValue3, setOperationValue3] = useState(3.00);
  const [operationValue4, setOperationValue4] = useState(4.00);
  const [operationValue5, setOperationValue5] = useState(5.00);
  const [operationValue6, setOperationValue6] = useState(6.00);

  // Checkbox states
  const [mainComparedPriceChecked, setMainComparedPriceChecked] = useState(false);
  const [row2Checked, setRow2Checked] = useState(false);
  const [row3Checked, setRow3Checked] = useState(false);
  const [row4Checked, setRow4Checked] = useState(false);

  // Range validation states
  const [range1Error, setRange1Error] = useState(false);
  const [range2Error, setRange2Error] = useState(false);
  const [rangeOverlapError, setRangeOverlapError] = useState(false);
  const [dynamicRowError, setDynamicRowError] = useState(false);

  const SHIPPING_METHODS = [
    { value: "cainiao-standard-delivery", label: "(Cainiao) Standard Delivery" },
    { value: "139express", label: "139EXPRESS" },
    { value: "360lion-standard-packet", label: "360Lion Standard Packet" },
    { value: "3pl-br-local", label: "3PL_BR_LOCAL" },
    { value: "4px-correos-paq24", label: "4PX CORREOS PAQ24" },
    { value: "4px-cz-dhl-european-first-zone", label: "4PX CZ DHL European First Zone Delivery" },
    { value: "4px-cz-dhl-european-second-zone", label: "4PX CZ DHL European Second Zone Delivery" },
    { value: "4px-de-dhl-inland-delivery", label: "4PX DE DHL Inland Delivery" },
    { value: "4px-de-dhl-inland-delivery-cz", label: "4PX DE DHL Inland Delivery-CZ" },
    { value: "4px-de-dhl-european-first-zone", label: "4PX DE DHL European First Zone Delivery" },
    { value: "4px-rm", label: "4PX RM" },
    { value: "4px-royal-mail-tracked48", label: "4PX Royal Mail Tracked48" },
    { value: "4px-seur-24-hours", label: "4PX SEUR 24 Hours Delivery" },
    { value: "4px-singapore-post-om-pro", label: "4PX Singapore Post OM Pro" },
    { value: "4px-tr72-packet", label: "4PX TR72-Packet" },
    { value: "4px-tr72-packet-packet", label: "4PX TR72-Packet - Packet" },
    { value: "4px-tr72-packet-by-zone", label: "4PX TR72-Packet By Zone" },
    { value: "4px-us-expedited-big-packet", label: "4PX US Expedited Big Packet" },
    { value: "4px-us-expedited-smart-packet", label: "4PX US Expedited Smart Packet" },
    { value: "4px-us-fedex-inland-post", label: "4PX US FedEx Inland Post Office Delivery" },
    { value: "4px-us-ground-smart-packet", label: "4PX US Ground Smart Packet" },
    { value: "4px-us-ground-big-packet", label: "4PX US Ground Big Packet" },
    { value: "4px-usps-small-package", label: "4PX USPS Small Package Inland Delivery" },
    { value: "4pxes-espost-eu", label: "4PXES_ESPOST_EU" },
    { value: "4pxes-espost-eu-es", label: "4PXES_ESPOST_EU - ES" },
    { value: "4pxes-glseu-large", label: "4PXES_GLSEU_LARGE" },
    { value: "4pxes-glseu-small", label: "4PXES_GLSEU_SMALL" },
    { value: "4pxes-glseu-small-es", label: "4PXES_GLSEU_SMALL - ES" },
    { value: "4pxes-postpy-es", label: "4PXES_POSTPY_ES" },
    { value: "aliexpress-standard-oversized", label: "AliExpress Standard Shipping For Oversized Goods" },
    { value: "aliexpress-standard-mx", label: "AliExpress Standard Shipping MX" },
    { value: "aliexpress-standard-aebigsto", label: "AliExpress Standard Shipping_AEBIGSTO" },
    { value: "aliexpress-standard-htb2", label: "AliExpress Standard Shipping_HTB2" },
    { value: "aliexpress-standard-be", label: "AliExpress Standard-BE" },
    { value: "aliexpress-standard", label: "AliExpress Standard Shipping" },
    { value: "aliexpress-post-office", label: "AliExpress: To Post Office" },
    { value: "aliexpress-courier", label: "AliExpress: By Courier" },
    { value: "aliexpress-saver", label: "AliExpress Saver Shipping" },
    { value: "aliexpress-direct-ae", label: "AliExpress Direct_AE" },
    { value: "aliexpress-direct-bh", label: "AliExpress Direct_BH" },
    { value: "aliexpress-direct-br", label: "AliExpress Direct_BR" },
    { value: "aliexpress-direct-om", label: "AliExpress Direct_OM" },
    { value: "aliexpress-direct-qa", label: "AliExpress Direct_QA" },
    { value: "aliexpress-direct-sa", label: "AliExpress Direct_SA" },
    { value: "aliexpress-selection-economy-special", label: "Aliexpress Selection Economy For Special Goods" },
    { value: "aliexpress-selection-economy-es", label: "Aliexpress Selection Economy-ES" },
    { value: "aliexpress-selection-premium", label: "Aliexpress Selection Premium Shipping" },
    { value: "aliexpress-selection-saver", label: "Aliexpress Selection Saver" },
    { value: "aliexpress-selection-saver-special", label: "Aliexpress Selection Saver For Special Goods" },
    { value: "aliexpress-selection-standard-special", label: "Aliexpress Selection Standard For Special Goods" },
    { value: "aliexpress-selection-super-economy", label: "Aliexpress Selection Super Economy" },
    { value: "aliexpress-selection-super-economy-global", label: "Aliexpress Selection Super Economy Global" },
    { value: "aramex", label: "Aramex" },
    { value: "aramex-fastway-au", label: "Aramex (Fastway AU)" },
    { value: "asendia", label: "Asendia" },
    { value: "asendia-us", label: "Asendia_US" },
    { value: "be-post-be", label: "BE_POST_BE" },
    { value: "big", label: "BIG" },
    { value: "blue-cl", label: "BLUE_CL" },
    { value: "br-correios-by-state", label: "BR Correios by STATE" },
    { value: "br-jt-by-state", label: "BR JT by STATE" },
    { value: "br-jadlog-by-state", label: "BR Jadlog by STATE" },
    { value: "br-sedex-by-state", label: "BR Sedex by STATE" },
    { value: "br-local-3pl-jt-commercial", label: "BR local 3PL Standard Delivery (J&T-Commercial)" },
    { value: "br-local-3pl-sislogica-commercial", label: "BR local 3PL Standard Delivery (Sislogica-Commercial)" },
    { value: "br-local-3pl-sislogica-correios", label: "BR local 3PL Standard Delivery (Sislogica-Correios)" },
    { value: "br-local-3pl-imile-commercial", label: "BR local 3PL Standard Delivery (iMile-Commercial)" },
    { value: "brt-dpd", label: "BRT (DPD)" },
    { value: "bsc-special-economy", label: "BSC Special Economy" },
    { value: "bsc-special-standard", label: "BSC Special Standard" },
    { value: "battery-standard-delivery", label: "Battery Standard Delivery" },
    { value: "bpost-international", label: "Bpost International" },
    { value: "cainiao-consolidation-sa", label: "CAINIAO Consolidation_SA" },
    { value: "cainiao-fulfillment-seco-sg", label: "CAINIAO Fulfillment SECO_SG" },
    { value: "cainiao-fulfillment-e-eco", label: "CAINIAO Fulfillment E_ECO" },
    { value: "cainiao-g2g-directship-standard", label: "CAINIAO G2G Directship Standard" },
    { value: "cainiao-home-delivery", label: "CAINIAO Home Delivery" },
    { value: "cainiao-large-parcel", label: "CAINIAO Large Parcel" },
    { value: "cainiao-overseas-warehouse-return-eu", label: "CAINIAO Overseas Warehouse Return - EU" },
    { value: "cainiao-small-parcel", label: "CAINIAO Small Parcel" },
    { value: "cainiao-to-shop-il-pd", label: "CAINIAO To Shop_IL_PD" },
    { value: "cainiao-to-shop-uae-pd", label: "CAINIAO To Shop_UAE_PD" },
    { value: "cainiao-ts90-standard", label: "CAINIAO TS90 Standard Shipping" },
    { value: "cainiao-warehouse-express-be", label: "CAINIAO Warehouse Express Shipping_BE" },
    { value: "cainiao-warehouse-express-choice-cn-pl", label: "CAINIAO Warehouse Express Shipping_Choice_CN_PL" },
    { value: "cainiao-warehouse-express-es", label: "CAINIAO Warehouse Express Shipping_ES" },
    { value: "cainiao-warehouse-express-es-cn-eu", label: "CAINIAO Warehouse Express Shipping_ES/CN_EU" },
    { value: "cainiao-warehouse-express-es-es", label: "CAINIAO Warehouse Express Shipping_ES_ES" },
    { value: "cainiao-warehouse-express-express-es", label: "CAINIAO Warehouse Express Shipping_Express_ES" },
    { value: "cainiao-warehouse-express-fr", label: "CAINIAO Warehouse Express Shipping_FR" },
    { value: "cainiao-warehouse-express-it", label: "CAINIAO Warehouse Express Shipping_IT" },
    { value: "cainiao-warehouse-express-pl", label: "CAINIAO Warehouse Express Shipping_PL" },
    { value: "cainiao-warehouse-oversize-es", label: "CAINIAO Warehouse Oversize Shipping_ES" },
    { value: "cainiao-warehouse-oversize-es-cn-eu", label: "CAINIAO Warehouse Oversize Shipping_ES/CN_EU" },
    { value: "cainiao-warehouse-oversize-fr", label: "CAINIAO Warehouse Oversize Shipping_FR" },
    { value: "cainiao-warehouse-oversize-uk", label: "CAINIAO Warehouse Oversize Shipping_UK" },
    { value: "cainiao-warehouse-srm-shipping", label: "CAINIAO Warehouse SRM Shipping" },
    { value: "cainiao-warehouse-srm-shipping-srmeu", label: "CAINIAO Warehouse SRM Shipping - SRMEU" },
    { value: "cainiao-warehouse-srm-shipping-cn-mx", label: "CAINIAO Warehouse SRM Shipping_CN/MX" },
    { value: "cainiao-warehouse-srm-shipping-es", label: "CAINIAO Warehouse SRM Shipping_ES" },
    { value: "cainiao-warehouse-srm-shipping-es-cn-eu", label: "CAINIAO Warehouse SRM Shipping_ES/CN_EU" },
    { value: "cainiao-warehouse-srm-shipping-fr", label: "CAINIAO Warehouse SRM Shipping_FR" },
    { value: "cainiao-warehouse-standard-shipping", label: "CAINIAO Warehouse Standard Shipping" },
    { value: "cainiao-overseas-wh-srmfr", label: "CAINIAO_OVERSEAS_WH_SRMFR" },
    { value: "cniao-mex-estafeta-express", label: "CNIAO_MEX_ESTAFETA_EXPRESS" },
    { value: "cainiao-overseas-wh-stdbe", label: "CAINIAO_OVERSEAS_WH_STDBE" },
    { value: "cainiao-warehouse-standard-shipping-be", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_BE" },
    { value: "cainiao-warehouse-standard-shipping-choice-cn-pl", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_CHOICE_CN_PL" },
    { value: "cainiao-warehouse-standard-shipping-cz", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_CZ" },
    { value: "cainiao-warehouse-standard-shipping-de", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_DE" },
    { value: "cainiao-warehouse-standard-shipping-es", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_ES" },
    { value: "cainiao-warehouse-standard-shipping-es-cn-es-new", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_ES/CN_ES_NEW" },
    { value: "cainiao-warehouse-standard-shipping-es-cn-eu", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_ES/CN_EU" },
    { value: "cainiao-warehouse-standard-shipping-es-es", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_ES_ES" },
    { value: "cainiao-warehouse-standard-shipping-fr", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_FR" },
    { value: "cainiao-warehouse-standard-shipping-fr-cn-eu", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_FR/CN_EU" },
    { value: "cainiao-warehouse-standard-shipping-fr-cn-fr", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_FR/CN_FR" },
    { value: "cainiao-warehouse-standard-shipping-pl", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_PL" },
    { value: "cainiao-warehouse-standard-shipping-uae", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_UAE" },
    { value: "cainiao-warehouse-standard-shipping-uk", label: "CAINIAO WAREHOUSE STANDARD SHIPPING_UK" },
    { value: "cainiao-fulfillment-std-large", label: "CAINIAO_FULFILLMENT_STD_LARGE" },
    { value: "cainiao-seleopen-pre-ae", label: "CAINIAO_SELEOPEN_PRE_AE" },
    { value: "cainiao-seleopen-std-ae", label: "CAINIAO_SELEOPEN_STD_AE" },
    { value: "cainiao-wh-es-std", label: "CAINIAO_WH_ES_STD" },
    { value: "cainiao-wh-fr-std", label: "CAINIAO_WH_FR_STD" },
    { value: "capost", label: "CAPOST" },
    { value: "cdek", label: "CDEK" },
    { value: "cdek-ru", label: "CDEK_RU" },
    { value: "ceva-truck-delivery", label: "CEVA Truck Delivery" },
    { value: "choice", label: "CHOICE" },
    { value: "chronopost-domestic", label: "CHRONOPOST-Domestic" },
    { value: "citirans-saudi-last-mile", label: "CITIRANS Saudi last mile" },
    { value: "cititrans-ae", label: "CITITRANS_AE" },
    { value: "cj-express", label: "CJ EXPRESS" },
    { value: "cj-oversea", label: "CJ Oversea" },
    { value: "cj-logistics", label: "CJ_LOGISTICS" },
    { value: "clpost", label: "CLPOST" },
    { value: "cne-express", label: "CNE Express" },
    { value: "cnos-expes", label: "CNOS_EXPES" },
    { value: "cnos-expfr-local", label: "CNOS_EXPFR_LOCAL" },
    { value: "cnos-exppl", label: "CNOS_EXPPL" },
    { value: "cnos-stdde", label: "CNOS_STDDE" },
    { value: "cnos-stdfr-local", label: "CNOS_STDFR_LOCAL" },
    { value: "cn-eu-standard", label: "CN_EU_STANDARD" },
    { value: "cn-iml-express-ru", label: "CN_IML_EXPRESS_RU" },
    { value: "cn-jnet-express-ru", label: "CN_JNET_EXPRESS_RU" },
    { value: "cn-overseas-wh-stdes-new", label: "CN_OVERSEAS_WH_STDES_NEW" },
    { value: "cn-oversea-gd-ru", label: "CN_OVERSEA_GD_RU" },
    { value: "cn-oversea-gd-ru-prov", label: "CN_OVERSEA_GD_RU_PROV" },
    { value: "cn-oversea-od", label: "CN_OVERSEA_OD" },
    { value: "cn-oversea-od-ru-prov", label: "CN_OVERSEA_OD_RU_PROV" },
    { value: "cn-rue-express-ru", label: "CN_RUE_EXPRESS_RU" },
    { value: "colissimo-domestic", label: "COLISSIMO-Domestic" },
    { value: "colissimo-be", label: "COLISSIMO_BE" },
    { value: "correos-paq-72", label: "CORREOS PAQ 72" },
    { value: "correosexpress-es-islands", label: "CORREOSEXPRESS_ES_ISLANDS" },
    { value: "cse", label: "CSE" },
    { value: "cttexpress", label: "CTTEXPRESS" },
    { value: "cainiao-us-standard", label: "CaiNiao US Standard" },
    { value: "cainiao-expedited-economy", label: "Cainiao Expedited Economy" },
    { value: "cainiao-expedited-standard", label: "Cainiao Expedited Standard" },
    { value: "cainiao-heavy-parcel-line", label: "Cainiao Heavy Parcel Line" },
    { value: "cainiao-saver-shipping-special", label: "Cainiao Saver Shipping For Special Goods" },
    { value: "cainiao-standard", label: "Cainiao Standard" },
    { value: "cainiao-standard-sg-air", label: "Cainiao Standard - SG Air" },
    { value: "cainiao-standard-special", label: "Cainiao Standard For Special Goods" },
    { value: "cainiao-super-economy", label: "Cainiao Super Economy" },
    { value: "cainiao-super-economy-global", label: "Cainiao Super Economy Global" },
    { value: "cainiao-super-economy-special", label: "Cainiao Super Economy for Special Goods" },
    { value: "chile-express", label: "Chile Express" },
    { value: "china-post-air-parcel", label: "China Post Air Parcel" },
    { value: "china-post-ordinary-small-packet", label: "China Post Ordinary Small Packet Plus" },
    { value: "china-post-registered-air-mail", label: "China Post Registered Air Mail" },
    { value: "china-post-epacket", label: "China Post ePacket" },
    { value: "choice-special-cargo-standard-pre", label: "Choice Special Cargo Standard PRE" },
    { value: "choice-wig-premium", label: "Choice Wig PREMIUM" },
    { value: "choice-wig-standard", label: "Choice Wig Standard" },
    { value: "chronopost-fr", label: "Chronopost_FR" },
    { value: "chronopost-local-fr", label: "Chronopost_LOCAL_FR" },
    { value: "chukouyi-premium-shipping", label: "ChuKouYi Premium Shipping" },
    { value: "chukouyi-standard-special", label: "ChuKouYi Standard For Special Goods" },
    { value: "chukouyi-standard-shipping", label: "ChuKouYi Standard Shipping" },
    { value: "chukou1", label: "Chukou1" },
    { value: "chukou1-de-depost", label: "Chukou1 DE Depost" },
    { value: "chukou1-eu-dhl", label: "Chukou1 EU DHL" },
    { value: "chukou1-us-ams", label: "Chukou1 US AMS" },
    { value: "chukou1-us-fedex-ground", label: "Chukou1 US FedEx Ground" },
    { value: "chukou1-us-fulfillment-economy", label: "Chukou1 US Fulfillment Economy" },
    { value: "chukou1-us-fulfillment-express", label: "Chukou1 US Fulfillment Express" },
    { value: "chukou1-us-fulfillment-standard", label: "Chukou1 US Fulfillment Standard" },
    { value: "chukou1-us-ontrac", label: "Chukou1 US Ontrac" },
    { value: "chukou1-us-ups-ground", label: "Chukou1 US UPS Ground" },
    { value: "chukou1-us-ups-mi", label: "Chukou1 US UPS MI" },
    { value: "chukou1-us-ups-surepost", label: "Chukou1 US UPS Surepost" },
    { value: "chukou1-us-usps-ground-advantage", label: "Chukou1 US USPS Ground Advantage" },
    { value: "chukou1-us-usps-priority-mail", label: "Chukou1 US USPS Priority Mail" },
    { value: "colis-prive", label: "Colis_Prive" },
    { value: "colis-prive-local", label: "Colis_Prive_LOCAL" },
    { value: "colissimo-fr", label: "Colissimo_FR" },
    { value: "colissimo-local-fr", label: "Colissimo_LOCAL_FR" },
    { value: "colissimo-old", label: "Colissimo_old" },
    { value: "correios-brazil", label: "Correios Brazil" },
    { value: "correios-bra", label: "Correios_BRA" },
    { value: "correios-l-br", label: "Correios_L_BR" },
    { value: "correos", label: "Correos" },
    { value: "correos-europe", label: "Correos Europe" },
    { value: "correos-express-spain-local", label: "Correos EXPRESS_SPAIN_LOCAL" },
    { value: "correos-economy", label: "Correos Economy" },
    { value: "correos-express", label: "Correos Express" },
    { value: "correos-express-72h", label: "Correos Express 72H" },
    { value: "correos-ordinario-buzon", label: "Correos Ordinario Buzon" },
    { value: "correos-express-alt", label: "Correos_Express" },
    { value: "deutsche-post-pan-european", label: "DEUTSCHE POST Pan-European" },
    { value: "de-cn-overseas-wh-stdeu", label: "DE_CN_OVERSEAS_WH_STDEU" },
    { value: "de-post-be", label: "DE_POST_BE" },
    { value: "de-post-cz", label: "DE_POST_CZ" },
    { value: "dgm-smartmail-expedited", label: "DGM Smartmail Expedited" },
    { value: "dgm-smartmail-expedited-plus", label: "DGM Smartmail Expedited Plus" },
    { value: "dgm-smartmail-ground", label: "DGM Smartmail Ground" },
    { value: "dgm-smartmail-ground-plus", label: "DGM Smartmail Ground Plus" },
    { value: "dgm-us-small", label: "DGM_US_SMALL" },
    { value: "dhl", label: "DHL" },
    { value: "dhl-de", label: "DHL DE" },
    { value: "dhl-de-domestic", label: "DHL DE Domestic" },
    { value: "dhl-de-domestic-germany", label: "DHL DE Domestic_GERMANY" },
    { value: "dhl-de-pan-european", label: "DHL DE Pan-European" },
    { value: "dhl-de-pan-european-germany", label: "DHL DE Pan-European_GERMANY" },
    { value: "dhl-domestic-service", label: "DHL DOMESTIC SERVICE" },
    { value: "dhl-domestic-service-local", label: "DHL DOMESTIC SERVICE LOCAL" },
    { value: "dhl-express", label: "DHL EXPRESS" },
    { value: "dhl-europe", label: "DHL Europe" },
    { value: "dhl-local-shipping", label: "DHL Local Shipping" },
    { value: "dhl-pl", label: "DHL PL" },
    { value: "dhl-pl-domestic", label: "DHL PL Domestic" },
    { value: "dhl-pl-domestic-poland", label: "DHL PL Domestic_POLAND" },
    { value: "dhl-pl-pan-european", label: "DHL PL Pan-European" },
    { value: "dhl-pl-pan-european-international", label: "DHL PL Pan-European_PL_INTERNATIONAL" },
    { value: "dhl-pl-to-de", label: "DHL PL TO DE" },
    { value: "dhl-pan-eu", label: "DHL Pan-EU" },
    { value: "dhl-ecommerce", label: "DHL e-commerce" },
    { value: "dhl-be", label: "DHL_BE" },
    { value: "dhl-cz", label: "DHL_CZ" },
    { value: "dhl-es", label: "DHL_ES" },
    { value: "dhl-fr", label: "DHL_FR" },
    { value: "dhl-it", label: "DHL_IT" },
    { value: "dhl-pi-es", label: "DHL_PI_ES" },
    { value: "dhl-p-czde", label: "DHL_P_CZDE" },
    { value: "dhl-p-czdeeu", label: "DHL_P_CZDEEU" },
    { value: "dhl-p-czdev", label: "DHL_P_CZDEV" },
    { value: "dhl-p-pl", label: "DHL_P_PL" },
    { value: "dhl-spain-local", label: "DHL_SPAIN_LOCAL" },
    { value: "dpd-de", label: "DPD DE" },
    { value: "dpd-de-domestic", label: "DPD DE Domestic" },
    { value: "dpd-de-pan-european", label: "DPD DE Pan-European" },
    { value: "dpd-de-pan-european-de", label: "DPD DE Pan-European_DE" },
    { value: "dpd-delivery", label: "DPD DELIVERY" },
    { value: "dpd-domestic-service", label: "DPD DOMESTIC SERVICE" },
    { value: "dpd-domestic-service-local", label: "DPD DOMESTIC SERVICE LOCAL" },
    { value: "dpd-express", label: "DPD EXPRESS" },
    { value: "dpd-pl", label: "DPD PL" },
    { value: "dpd-pl-domestic", label: "DPD PL Domestic" },
    { value: "dpd-pl-domestic-poland", label: "DPD PL Domestic_POLAND" },
    { value: "dpd-pl-pan-european", label: "DPD PL Pan-European" },
    { value: "dpd-pl-pan-european-international", label: "DPD PL Pan-European_PL_INTERNATIONAL" },
    { value: "dpd-pl-oversize", label: "DPD-PL-OVERSIZE" },
    { value: "dpd-pl-oversize-international", label: "DPD-PL-OVERSIZE-INTERNATIONAL" },
    { value: "dpd-es", label: "DPD_ES" },
    { value: "dpd-es-oversize-international", label: "DPD_ES_OVERSIZE INTERNATIONAL" },
    { value: "dpd-fr-exp", label: "DPD_FR_EXP" },
    { value: "dpd-fr-local", label: "DPD_FR_LOCAL" },
    { value: "dpd-p-czint", label: "DPD_P_CZINT" },
    { value: "dpex", label: "DPEX" },
    { value: "dpex-za", label: "DPEX_ZA" },
    { value: "dx-express", label: "DX EXPRESS" },
    { value: "dx-local-shipping", label: "DX Local Shipping" },
    { value: "delivery-by-seller", label: "Delivery by seller" },
    { value: "deutsche-post", label: "Deutsche Post" },
    { value: "echo-us", label: "ECHO_us" },
    { value: "ekc", label: "EKC" },
    { value: "ems", label: "EMS" },
    { value: "ems-ae", label: "EMS_AE" },
    { value: "envialia", label: "ENVIALIA" },
    { value: "eqt-special-standard-oversized", label: "EQT Special Standard Shipping For Oversized Goods" },
    { value: "esnad", label: "ESNAD" },
    { value: "es-cttexpress", label: "ES_CTTEXPRESS" },
    { value: "es-sending", label: "ES_SENDING" },
    { value: "ewe-express", label: "EWE EXPRESS" },
    { value: "ebest-fast-shipping", label: "Ebest Fast Shipping" },
    { value: "ecoscooting", label: "Ecoscooting" },
    { value: "ecoscooting-local", label: "Ecoscooting_LOCAL" },
    { value: "entrega-expressa-pegaki", label: "Entrega Expressa (Pegaki Envios)" },
    { value: "entrega-local", label: "Entrega Local" },
    { value: "entrega-local-province", label: "Entrega Local - PROVINCE" },
    { value: "entrega-padrao-infracommerce", label: "Entrega Padrão (InfraCommerce)" },
    { value: "fedex-mx-local", label: "FEDEX_MX_LOCAL" },
    { value: "fedex-us", label: "FEDEX_US" },
    { value: "fedex-us-l2l-exp", label: "FEDEX_US_L2L_EXP" },
    { value: "fetchr", label: "FETCHR" },
    { value: "fr-cn-overseas-wh-expeu", label: "FR_CN_OVERSEAS_WH_EXPEU" },
    { value: "fr-cn-overseas-wh-oseu", label: "FR_CN_OVERSEAS_WH_OSEU" },
    { value: "fr-local-asendia", label: "FR_LOCAL_ASENDIA" },
    { value: "fr-local-dhl", label: "FR_LOCAL_DHL" },
    { value: "fr-local-dhl-eu", label: "FR_LOCAL_DHL_EU" },
    { value: "fr-local-dpd", label: "FR_LOCAL_DPD" },
    { value: "fr-local-europe-fr", label: "FR_LOCAL_Europe_FR" },
    { value: "fr-local-fedex", label: "FR_LOCAL_FEDEX" },
    { value: "fr-local-tnt", label: "FR_LOCAL_TNT" },
    { value: "fedex-ground", label: "FedEx Ground" },
    { value: "fedex-smartpost", label: "FedEx Smartpost" },
    { value: "fedex-ca", label: "FedEx_CA" },
    { value: "fedex-mx-exp", label: "FedEx_MX_EXP" },
    { value: "fedex-de-pan-european", label: "Fedex DE Pan-European" },
    { value: "fedex-de-pan-european-local", label: "Fedex DE Pan-European_LOCAL" },
    { value: "fedex-ie", label: "Fedex IE" },
    { value: "fedex-ip", label: "Fedex IP" },
    { value: "fedex-pl-pan-european", label: "Fedex PL Pan-European" },
    { value: "fedex-pl-pan-european-local", label: "Fedex PL Pan-European_LOCAL" },
    { value: "fedex-es", label: "Fedex_ES" },
    { value: "fedex-es-local", label: "Fedex_ES_LOCAL" },
    { value: "fedex-fr", label: "Fedex_FR" },
    { value: "fedex-fr-local", label: "Fedex_FR_LOCAL" },
    { value: "flyt-express", label: "Flyt Express" },
    { value: "flyt-special-economy", label: "Flyt Special Economy" },
    { value: "france-express", label: "France Express" },
    { value: "gati", label: "GATI" },
    { value: "gc-de-eu-dhl", label: "GC_DE_EU_DHL" },
    { value: "gc-dhl-eu-1", label: "GC_DHL_EU_1" },
    { value: "gc-dhl-eu-2", label: "GC_DHL_EU_2" },
    { value: "gc-dhl-noneu", label: "GC_DHL_NonEU" },
    { value: "gc-fedex-ground", label: "GC_FEDEX_GROUND" },
    { value: "gc-fedex-largeparcel", label: "GC_FEDEX_LARGEPARCEL" },
    { value: "gc-fedex-smallparcel", label: "GC_FEDEX_SMALLPARCEL" },
    { value: "gc-fedex-us", label: "GC_FEDEX_us" },
    { value: "gc-fr-gls-fds", label: "GC_FR_GLS_FDS" },
    { value: "gc-fr-gls-local", label: "GC_FR_GLS_LOCAL" },
    { value: "gc-fr-post-local-ns", label: "GC_FR_POST_LOCAL_NS" },
    { value: "gc-fr-post-local-s", label: "GC_FR_POST_LOCAL_S" },
    { value: "gc-rm-tracked-48h-ns", label: "GC_RM_TRACKED_48h_NS" },
    { value: "gc-ups-ground", label: "GC_UPS_Ground" },
    { value: "gc-ups-us", label: "GC_UPS_us" },
    { value: "gc-usps-largeparcel", label: "GC_USPS_LARGEPARCEL" },
    { value: "gc-usps-smallparcel", label: "GC_USPS_SMALLPARCEL" },
    { value: "gc-usps-us", label: "GC_USPS_us" },
    { value: "gc-yodel-48h-small-p", label: "GC_YODEL_48h_SMALL_P" },
    { value: "gc-yun-us", label: "GC_YUN_us" },
    { value: "geodis", label: "GEODIS" },
    { value: "geodismt-h-freu", label: "GEODISMT_H_FREU" },
    { value: "geodis-fr", label: "GEODIS_FR" },
    { value: "geodis-fr-os-domestic", label: "GEODIS_FR_OS_DOMESTIC" },
    { value: "ges-express", label: "GES Express" },
    { value: "gfs-express", label: "GFS Express" },
    { value: "gls", label: "GLS" },
    { value: "gls-europe", label: "GLS Europe" },
    { value: "gls-gls", label: "GLS - GLS" },
    { value: "gls-de-domestic", label: "GLS DE Domestic" },
    { value: "gls-de-domestic-exp", label: "GLS DE Domestic_EXP" },
    { value: "gls-de-pan-european", label: "GLS DE Pan-European" },
    { value: "gls-de-pan-european-germany", label: "GLS DE Pan-European_GERMANY" },
    { value: "gls-express", label: "GLS EXPRESS" },
    { value: "gls-pl-pan-european", label: "GLS PL Pan-European" },
    { value: "gls-pl-pan-european-poland", label: "GLS PL Pan-European_POLAND" },
    { value: "gls-business-parcel-domestic", label: "GLS-Business Parcel Domestic" },
    { value: "gls-be", label: "GLS_BE" },
    { value: "gls-es-5days", label: "GLS_ES_5days" },
    { value: "gls-es-asm", label: "GLS_ES_ASM" },
    { value: "gls-fr", label: "GLS_FR" },
    { value: "gls-fr-5days", label: "GLS_FR_5days" },
    { value: "gls-fr-eu", label: "GLS_FR_EU" },
    { value: "gls-fr-local", label: "GLS_FR_LOCAL" },
    { value: "gls-it", label: "GLS_IT" },
    { value: "gls-p-czde", label: "GLS_P_CZDE" },
    { value: "gls-p-czdeint", label: "GLS_P_CZDEINT" },
    { value: "gls-es-business-parcel-international", label: "GLS—ES—Business Parcel_International" },
    { value: "gls-es-small-parcel-international", label: "GLS—ES—Small Parcel_International" },
    { value: "gofast-premium-shipping", label: "GOFAST Premium Shipping" },
    { value: "gofast-standard-shipping", label: "GOFAST Standard Shipping" },
    { value: "gofo-express", label: "GOFO Express" },
    { value: "grupoampm", label: "GRUPOAMPM" },
    { value: "geodis-oversi", label: "Geodis-Oversi" },
    { value: "hjyt-ssg-large-standard", label: "HJYT_SSG_LARGE_STANDARD" },
    { value: "hupost", label: "HUPOST" },
    { value: "huapt", label: "HUAPT" },
    { value: "hermes-de-domestic", label: "Hermes DE Domestic" },
    { value: "hermes-de-domestic-local", label: "Hermes DE Domestic_LOCAL" },
    { value: "hermes-evri-local-shipping", label: "Hermes/Evri Local Shipping" },
    { value: "hongkong-post-air-mail", label: "HongKong Post Air Mail" },
    { value: "huahan-special-standard", label: "Huahan Special Standard" },
    { value: "hungary-post", label: "Hungary Post" },
    { value: "icp-local", label: "ICP LOCAL" },
    { value: "imile", label: "IMILE" },
    { value: "imile-express", label: "IMILE_Express" },
    { value: "iml-express", label: "IML Express" },
    { value: "inpost-domestic-service", label: "INPOST DOMESTIC SERVICE" },
    { value: "inpost-domestic-service-local", label: "INPOST DOMESTIC SERVICE LOCAL" },
    { value: "inpost-pl-pan-european", label: "InPost PL Pan-European" },
    { value: "inpost-pl-pan-european-poland", label: "InPost PL Pan-European_POLAND" },
    { value: "j-net", label: "J-NET" },
    { value: "jadlog-p-br", label: "JADLOG_P_BR" },
    { value: "jcex-express", label: "JCEX Express" },
    { value: "jne", label: "JNE" },
    { value: "jnet-il", label: "JNET_IL" },
    { value: "jt-delivery", label: "JT Delivery" },
    { value: "jt-mx-exp", label: "JT_MX_EXP" },
    { value: "jt-mx-l2l-std", label: "JT_MX_L2L_STD" },
    { value: "jt-br-exp", label: "JT_BR_EXP" },
    { value: "jt-delivery-mx", label: "JT Delivery MX" },
    { value: "jt-express", label: "JT EXPress" },
    { value: "jadlog", label: "Jadlog" },
    { value: "jamef", label: "Jamef" },
    { value: "krpost-global-ems", label: "KRpost Global EMS" },
    { value: "krpost-global-kpacket", label: "KRpost Global Kpacket" },
    { value: "kyoungdong-standard", label: "KYOUNGDONG STANDARD" },
    { value: "kyuubin-jp", label: "KYUUBIN_JP" },
    { value: "korea-local-seller-fulfillment", label: "Korea Local Seller Fulfillment" },
    { value: "korea-post", label: "Korea Post" },
    { value: "laposte", label: "LAPOSTE" },
    { value: "laposte-domestic", label: "LAPOSTE-Domestic" },
    { value: "laposte-eu", label: "LAPOSTE_EU" },
    { value: "la-poste", label: "La Poste" },
    { value: "logen-logistics", label: "Logen Logistics" },
    { value: "lotte-global-logistics", label: "Lotte Global Logistics" },
    { value: "magalu", label: "MAGALU" },
    { value: "mini-envio", label: "MINI_ENVIO" },
    { value: "mrw", label: "MRW" },
    { value: "mrw-spain-local", label: "MRW_SPAIN_LOCAL" },
    { value: "mx-cn-overseas-wh-stdus", label: "MX_CN_OVERSEAS_WH_STDUS" },
    { value: "mia-delivery", label: "Mia Delivery" },
    { value: "middle-east-direct-mail-israel-door", label: "Middle East direct mail to Israel (door-to-door)" },
    { value: "middle-east-direct-mail-israel-pickup", label: "Middle East direct mail to Israel (self-pickup)" },
    { value: "miravia-standard-shipping", label: "Miravia Standard Shipping" },
    { value: "miravia-warehouse-standard-shipping", label: "Miravia warehouse standard shipping" },
    { value: "mondial-relay", label: "Mondial Relay" },
    { value: "mondial-relay-local", label: "Mondial Relay_LOCAL" },
    { value: "nacex", label: "NACEX" },
    { value: "naqel", label: "NAQEL" },
    { value: "ontrac", label: "ONTRAC" },
    { value: "otground", label: "OTGround" },
    { value: "other-pl", label: "OTHER PL" },
    { value: "other-za", label: "OTHER ZA" },
    { value: "owh-bfy-slp", label: "OWH_BFY_SLP" },
    { value: "owh-oversize", label: "OWH_OVERSIZE" },
    { value: "owh-ss-cdek-city", label: "OWH_SS_CDEK_City" },
    { value: "own-logistics-to-europe", label: "OWN LOGISTICS_TO EUROPE" },
    { value: "one-world-express", label: "One World Express" },
    { value: "ontrac-us", label: "Ontrac_us" },
    { value: "other-sellers-shipping-method-tr", label: "Other Seller's Shipping Method_TR" },
    { value: "other-shipping-method-europe", label: "Other Shipping Method Europe" },
    { value: "pac-pb", label: "PAC_PB" },
    { value: "paq-express", label: "PAQ Express" },
    { value: "pet-standard-delivery", label: "PET Standard Delivery" },
    { value: "pl-cn-overseas-wh-expeu", label: "PL_CN_OVERSEAS_WH_EXPEU" },
    { value: "pl-cn-overseas-wh-exppl", label: "PL_CN_OVERSEAS_WH_EXPPL" },
    { value: "pl-cn-overseas-wh-stdeu", label: "PL_CN_OVERSEAS_WH_STDEU" },
    { value: "pl-cn-overseas-wh-stdpl", label: "PL_CN_OVERSEAS_WH_STDPL" },
    { value: "poczta-pl-domestic", label: "POCZTA PL Domestic" },
    { value: "poland-dhl-p-pldeeu-exp", label: "POLAND_DHL_P_PLDEEU_EXP" },
    { value: "pony", label: "PONY" },
    { value: "pony-ru", label: "PONY_RU" },
    { value: "pos-malaysia", label: "POS Malaysia" },
    { value: "post-kr-oversea", label: "POST KR Oversea" },
    { value: "po", label: "PO" },
    { value: "raben-de-pan-european", label: "Raben DE Pan-European" },
    { value: "royal-mail", label: "Royal Mail" },
    { value: "royal-mail-economy", label: "Royal Mail Economy" },
    { value: "russia-express-spsr", label: "Russia Express-SPSR" },
    { value: "russian-air", label: "Russian Air" },
    { value: "russian-post", label: "Russian Post" },
    { value: "sagawa-jp-exp", label: "SAGAWA_JP_EXP" },
    { value: "sedex", label: "SEDEX" },
    { value: "seko-us", label: "SEKO_us" },
    { value: "seur", label: "SEUR" },
    { value: "seur-europe", label: "SEUR Europe" },
    { value: "seur-spain-local", label: "SEUR_SPAIN_LOCAL" },
    { value: "sf-economic-air-mail", label: "SF Economic Air Mail" },
    { value: "sf-express", label: "SF Express" },
    { value: "sf-eparcel", label: "SF eParcel" },
    { value: "sfcservice", label: "SFCService" },
    { value: "shipentegra-tr", label: "SHIPENTEGRA_TR" },
    { value: "shunyou-standard-sg", label: "SHUNYOU_STANDARD_SG" },
    { value: "smsa-express", label: "SMSA Express" },
    { value: "smsa-sa", label: "SMSA_SA" },
    { value: "spain-dpd-os-international", label: "SPAIN_DPD_OS_INTERNATIONAL" },
    { value: "spsr-ru", label: "SPSR_RU" },
    { value: "standard-naep-mx-coco", label: "STANDARD_NAEP_MX_COCO" },
    { value: "starken-chile", label: "STARKEN Chile" },
    { value: "seller-shipping", label: "Seller Shipping" },
    { value: "seller-shipping-au", label: "Seller Shipping AU" },
    { value: "seller-shipping-cz", label: "Seller Shipping CZ" },
    { value: "seller-shipping-cz-coun", label: "Seller Shipping CZ Coun" },
    { value: "seller-shipping-de", label: "Seller Shipping DE" },
    { value: "seller-shipping-de-coun", label: "Seller Shipping DE Coun" },
    { value: "seller-shipping-de-coun-local", label: "Seller Shipping DE Coun Local" },
    { value: "seller-shipping-de-local", label: "Seller Shipping DE Local" },
    { value: "seller-shipping-es", label: "Seller Shipping ES" },
    { value: "seller-shipping-es-coun", label: "Seller Shipping ES Coun" },
    { value: "seller-shipping-es-coun-local", label: "Seller Shipping ES Coun Local" },
    { value: "seller-shipping-es-local", label: "Seller Shipping ES Local" },
    { value: "seller-shipping-fr", label: "Seller Shipping FR" },
    { value: "seller-shipping-fr-coun", label: "Seller Shipping FR Coun" },
    { value: "seller-shipping-fr-coun-local", label: "Seller Shipping FR Coun Local" },
    { value: "seller-shipping-fr-local", label: "Seller Shipping FR Local" },
    { value: "seller-shipping-it", label: "Seller Shipping IT" },
    { value: "seller-shipping-it-coun", label: "Seller Shipping IT Coun" },
    { value: "seller-shipping-it-coun-local", label: "Seller Shipping IT Coun Local" },
    { value: "seller-shipping-it-local", label: "Seller Shipping IT Local" },
    { value: "seller-shipping-jp", label: "Seller Shipping JP" },
    { value: "seller-shipping-large", label: "Seller Shipping Large" },
    { value: "seller-shipping-large-local", label: "Seller Shipping Large Local" },
    { value: "seller-shipping-mx", label: "Seller Shipping MX" },
    { value: "seller-shipping-pl", label: "Seller Shipping PL" },
    { value: "seller-shipping-pl-coun", label: "Seller Shipping PL Coun" },
    { value: "seller-shipping-pl-coun-local", label: "Seller Shipping PL Coun Local" },
    { value: "seller-shipping-pl-local", label: "Seller Shipping PL Local" },
    { value: "seller-shipping-uk", label: "Seller Shipping UK" },
    { value: "seller-shipping-uk-local", label: "Seller Shipping UK Local" },
    { value: "seller-shipping-local", label: "Seller Shipping local" },
    { value: "sellers-shipping-method", label: "Seller's Shipping Method" },
    { value: "sellers-shipping-method-au", label: "Seller's Shipping Method - AU" },
    { value: "sellers-shipping-method-br", label: "Seller's Shipping Method - BR" },
    { value: "sellers-shipping-method-cz", label: "Seller's Shipping Method - CZ" },
    { value: "sellers-shipping-method-de", label: "Seller's Shipping Method - DE" },
    { value: "sellers-shipping-method-de-eur", label: "Seller's Shipping Method - DE(EUR)" },
    { value: "turkey-post", label: "TURKEY_POST" },
    { value: "team-global-express", label: "Team Global Express" },
    { value: "tmall-marketplace-cn-shipping-city", label: "Tmall Marketplace CN Shipping CITY" },
    { value: "tmall-marketplace-cn-shipping-region", label: "Tmall Marketplace CN Shipping REGION" },
    { value: "turkey-post-regular", label: "Turkey Post" },
    { value: "turkey-post-registered-parcel", label: "Turkey Post Registered Parcel" },
    { value: "u-speed-il-to-door", label: "U Speed_IL_To Door" },
    { value: "ubi", label: "UBI" },
    { value: "udel-express", label: "UDEL EXPRESS" },
    { value: "udel-local-shipping", label: "UDEL Local Shipping" },
    { value: "uk-min-1-hour-local", label: "UK MIN 1 HOUR LOCAL" },
    { value: "ups-2nd-day", label: "UPS 2nd Day" },
    { value: "ups-de-pan-european", label: "UPS DE Pan-European" },
    { value: "ups-de-pan-european-germany", label: "UPS DE Pan-European_GERMANY" },
    { value: "ups-expedited", label: "UPS Expedited" },
    { value: "ups-express-saver", label: "UPS Express Saver" },
    { value: "ups-ground", label: "UPS Ground" },
    { value: "ups-mail-innovations", label: "UPS Mail Innovations" },
    { value: "ups-pl", label: "UPS PL" },
    { value: "ups-pl-domestic", label: "UPS PL Domestic" },
    { value: "ups-pl-pan-european", label: "UPS PL Pan-European" },
    { value: "ups-pl-pan-european-poland", label: "UPS PL Pan-European_POLAND" },
    { value: "ups-pan-eu", label: "UPS Pan-EU" },
    { value: "ups-small-parcel", label: "UPS Small Parcel" },
    { value: "ups-surepost", label: "UPS Surepost" },
    { value: "ups-business-parcel-domestic", label: "UPS-Business Parcel_Domestic" },
    { value: "ups-oversize-domestic", label: "UPS-Oversize_Domestic" },
    { value: "ups-oversize-international", label: "UPS-Oversize_International" },
    { value: "ups-be", label: "UPS_BE" },
    { value: "ups-ca", label: "UPS_CA" },
    { value: "ups-cz-eu", label: "UPS_CZ_EU" },
    { value: "ups-es", label: "UPS_ES" },
    { value: "ups-fr", label: "UPS_FR" },
    { value: "ups-fr-international", label: "UPS_FR_INTERNATIONAL" },
    { value: "ups-p-czint", label: "UPS_P_CZINT" },
    { value: "ups-spain-local", label: "UPS_SPAIN_LOCAL" },
    { value: "ups-us", label: "UPS_US" },
    { value: "ups-us-l2l-exp", label: "UPS_US_L2L_EXP" },
    { value: "uspeed-ae-gcc", label: "USPEED_AE_GCC" },
    { value: "usps", label: "USPS" },
    { value: "usps-first-class", label: "USPS First Class" },
    { value: "usps-first-class-us", label: "USPS First Class_US" },
    { value: "usps-large-letter", label: "USPS Large Letter" },
    { value: "usps-parcel", label: "USPS Parcel" },
    { value: "usps-priority-mail", label: "USPS Priority Mail" },
    { value: "usps-us-l2l-std", label: "USPS_US_L2L_STD" },
    { value: "us-cn-overseas-wh-expus", label: "US_CN_OVERSEAS_WH_EXPUS" },
    { value: "us-cn-overseas-wh-stdus", label: "US_CN_OVERSEAS_WH_STDUS" },
    { value: "uspeed-il-toshop", label: "USpeed_IL_ToShop" },
    { value: "uz-bonded-warehouse-direct", label: "UZ Bonded Warehouse Direct" },
    { value: "ukrposhta", label: "Ukrposhta" },
    { value: "umall-fast-shipping", label: "Umall Fast Shipping" },
    { value: "urvaam", label: "Urvaam" },
    { value: "valin-ae", label: "VALIN_AE" },
    { value: "vnlin-p-aeil-door", label: "VNLIN_P_AEIL_DOOR" },
    { value: "vnlin-sa", label: "VNLIN_SA" },
    { value: "winitdepost-warenpost", label: "WINITDEPOST_WARENPOST" },
    { value: "winitdhl-de", label: "WINITDHL_DE" },
    { value: "winitdhl-international", label: "WINITDHL_INTERNATIONAL" },
    { value: "winitdpd-de", label: "WINITDPD_DE" },
    { value: "winitups-ground", label: "WINITUPS_GROUND" },
    { value: "winitups-ground-sign", label: "WINITUPS_GROUND_SIGN" },
    { value: "winitups-surepost", label: "WINITUPS_SUREPOST" },
    { value: "winitusps-firstclass", label: "WINITUSPS_FIRSTCLASS" },
    { value: "winit-yodel-home48", label: "WINIT_YODEL_HOME48" },
    { value: "wwe-standard", label: "WWE_STANDARD" },
    { value: "western-post-fedex-smartpost", label: "Western Post FEDEX Smartpost" },
    { value: "western-post-ups-ground-hd", label: "Western Post UPS Ground & HD Quotation" },
    { value: "western-post-us-uniuni", label: "Western Post US Uniuni" },
    { value: "western-post-usps-ground-advantage", label: "Western Post USPS Ground Advantage" },
    { value: "winit-amazon", label: "Winit Amazon" },
    { value: "winit-de-post-warenpost", label: "Winit DE Post - Warenpost" },
    { value: "winit-dhl-domestic-paket", label: "Winit DHL - Domestic Paket" },
    { value: "winit-evri-uk-standard-24", label: "Winit EVRi - UK Standard 24" },
    { value: "winit-evri-uk-standard-48", label: "Winit EVRi - UK Standard 48" },
    { value: "winit-fedex-ground-economy", label: "Winit FedEx Ground Economy" },
    { value: "winit-fedex-ground-standard", label: "Winit FedEx Ground Standard" },
    { value: "winit-fulfillment-amazon", label: "Winit Fulfillment Amazon" },
    { value: "winit-fulfillment-economy", label: "Winit Fulfillment Economy" },
    { value: "winit-fulfillment-plus-economy", label: "Winit Fulfillment Plus Economy" },
    { value: "winit-fulfillment-plus-express", label: "Winit Fulfillment Plus Express" },
    { value: "winit-fulfillment-plus-standard", label: "Winit Fulfillment Plus Standard" },
    { value: "winit-fulfillment-standard", label: "Winit Fulfillment Standard" },
    { value: "winit-fulfillment-ups-ground", label: "Winit Fulfillment UPS Ground" },
    { value: "winit-fulfillment-ups-mail-innovations", label: "Winit Fulfillment UPS Mail Innovations" },
    { value: "winit-fulfillment-economy-de", label: "Winit Fulfillment-Economy-DE" },
    { value: "winit-fulfillment-standard-de", label: "Winit Fulfillment-Standard-DE" },
    { value: "winit-fulfillment-standard-uk", label: "Winit Fulfillment-Standard-UK" },
    { value: "winit-ontrac-ground", label: "Winit OnTrac Ground" },
    { value: "winit-royal-mail-tracked-24", label: "Winit Royal Mail - Tracked 24 Parcel" },
    { value: "winit-royal-mail-tracked-48", label: "Winit Royal Mail - Tracked 48 Parcel" },
    { value: "winit-ups-3-day-select", label: "Winit UPS 3 Day Select Residential" },
    { value: "winit-ups-ground-standard", label: "Winit UPS Ground Standard" },
    { value: "winit-ups-mail-innovations", label: "Winit UPS Mail Innovations" },
    { value: "winit-ups-next-day-air-saver", label: "Winit UPS Next Day Air Saver" },
    { value: "winit-ups-surepost", label: "Winit UPS Surepost" },
    { value: "winit-usps-ground-advantage", label: "Winit USPS Ground Advantage" },
    { value: "winit-usps-priority-mail", label: "Winit USPS Priority Mail" },
    { value: "xdp-express", label: "XDP EXPRESS" },
    { value: "xdp-local-shipping", label: "XDP Local Shipping" },
    { value: "yanwen-special-economy", label: "YANWEN Special Economy" },
    { value: "yanwen-special-standard", label: "YANWEN Special Standard" },
    { value: "ydh-uk-dpd-lgb", label: "YDH UK DPD LGB" },
    { value: "ydh-uk-evri-lgb", label: "YDH UK EVRI LGB" },
    { value: "ydh-uk-royalmail-lgb", label: "YDH UK ROYALMAIL LGB" },
    { value: "yfh-special-standard", label: "YFH Special Standard" },
    { value: "yfh-standard-special-goods", label: "YFH Standard For Special Goods" },
    { value: "yfh-standard-shipping", label: "YFH Standard Shipping" },
    { value: "ym-de-pan-european", label: "YM DE Pan-European" },
    { value: "ym-local-shipping", label: "YM Local Shipping" },
    { value: "ym-es", label: "YM_ES" },
    { value: "ym-fr", label: "YM_FR" },
    { value: "ym-it", label: "YM_IT" },
    { value: "ym-mx", label: "YM_MX" },
    { value: "ym-uk", label: "YM_UK" },
    { value: "ym-us", label: "YM_US" },
    { value: "yode", label: "YODE" },
    { value: "yodel", label: "YODEL" },
    { value: "yodel-local-shipping", label: "YODEL Local Shipping" },
    { value: "yanwen-standard-shipping", label: "YanWen Standard Shipping" },
    { value: "yanwen-economic-air-mail", label: "Yanwen Economic Air Mail" },
    { value: "yunexpress-premium-shipping", label: "YunExpress Premium Shipping" },
    { value: "yunexpress-standard-heavy-parcel", label: "YunExpress Standard For Heavy Parcel" },
    { value: "yunexpress-standard-special-goods", label: "YunExpress Standard For Special Goods" },
    { value: "yunexpress-standard-shipping", label: "YunExpress Standard Shipping" },
    { value: "zeleris", label: "ZELERIS" },
    { value: "acommerce", label: "aCommerce" },
    { value: "e-ems", label: "e-EMS" },
    { value: "epacket", label: "ePacket" },
    { value: "etotal", label: "eTotal" },
    { value: "imile-delivery", label: "iMile Delivery" },
    { value: "imile-sa", label: "iMile_SA" },
    { value: "local-shipping-large", label: "Local Shipping Large" },
    { value: "other-shipping-companies", label: "Other Shipping Companies" },
    { value: "delivery-from-seller-to-regions", label: "Delivery From Seller to Regions" },
    { value: "russian-post-courier-online", label: "Russian Post - Courier Online" },
    { value: "russian-post-to-regions", label: "Russian Post to Regions" },
    { value: "cdek-to-cities", label: "CDEK to Cities" },
    { value: "pickup-from-collection-point", label: "Pickup From Collection Point" },
    { value: "standard-delivery-cainiao-warehouse-courier", label: "Standard Delivery From Official Cainiao Warehouse by Courier" },
    { value: "cainiao-courier-delivery-cn-gd-ru", label: "Cainiao Courier Delivery_CN_GD/RU" }
  ];

  // Validation functions
  const validateRange1 = () => {
    // Convert to numbers to ensure proper comparison
    const startValue = Number(standardRange1Start);
    const endValue = Number(standardRange1End);
    const hasError = startValue >= endValue;
    setRange1Error(hasError);
    return !hasError;
  };

  const validateRange2 = () => {
    // Only validate if ending value is actually filled (not empty)
    if (standardRange2End === "" || standardRange2End === null || standardRange2End === undefined) {
      setRange2Error(false);
      return true;
    }
    // Convert to numbers to ensure proper comparison
    const startValue = Number(standardRange2Start);
    const endValue = Number(standardRange2End);
    const hasError = startValue >= endValue;
    setRange2Error(hasError);
    return !hasError;
  };

  const validateRangeOverlap = () => {
    let hasOverlap = false;

    // Check Range 1 and Range 2 overlap
    if (range1Visible && range2Visible) {
      const range1EndValue = Number(standardRange1End);
      const range2StartValue = Number(standardRange2Start);
      if (range1EndValue >= range2StartValue) {
        hasOverlap = true;
      }
    }

    // Check Range 2 and dynamic rows overlap
    if (range2Visible && dynamicRows.length > 0) {
      const range2EndValue = Number(standardRange2End);
      const dynamicRowStartValue = Number(dynamicRows[0].rangeStart);
      if (range2EndValue >= dynamicRowStartValue) {
        hasOverlap = true;
      }
    }

    setRangeOverlapError(hasOverlap);
    return !hasOverlap;
  };

  const validateDynamicRows = () => {
    // Check if any dynamic row has starting price >= ending price
    let hasError = false;
    for (const row of dynamicRows) {
      if (row.rangeEnd !== "" && row.rangeEnd !== null && row.rangeEnd !== undefined) {
        const startValue = Number(row.rangeStart);
        const endValue = Number(row.rangeEnd);
        if (startValue >= endValue) {
          hasError = true;
          break;
        }
      }
    }
    setDynamicRowError(hasError);
    return !hasError;
  };

  // Real-time validation with useEffect
  useEffect(() => {
    if (range1Visible) {
      validateRange1();
    } else {
      setRange1Error(false);
    }
  }, [standardRange1Start, standardRange1End, range1Visible]);

  useEffect(() => {
    if (range2Visible) {
      validateRange2();
    } else {
      setRange2Error(false);
    }
  }, [standardRange2Start, standardRange2End, range2Visible]);

  useEffect(() => {
    if ((range1Visible && range2Visible) || (range2Visible && dynamicRows.length > 0)) {
      validateRangeOverlap();
    } else {
      setRangeOverlapError(false);
    }
  }, [standardRange1End, standardRange2Start, standardRange2End, range1Visible, range2Visible, dynamicRows]);

  // Automatic range adjustment: when range 1 end changes, set range 2 start to range 1 end + 0.01 (only if both ranges are visible)
  useEffect(() => {
    if (range1Visible && range2Visible) {
      const newRange2Start = Number(standardRange1End) + 0.01;
      if (Number(standardRange2Start) !== newRange2Start) {
        setStandardRange2Start(newRange2Start);
      }
    }
  }, [standardRange1End, range1Visible, range2Visible]);

  // Function to handle dynamic row creation when user finishes editing
  const handleRange2Complete = () => {
    // Only generate if Range 2 is visible and ending is filled
    if (range2Visible && standardRange2End !== "" && standardRange2End !== null) {
      const range2EndNum = Number(standardRange2End);

      if (range2EndNum > 0) {
        // Only create ONE additional row if none exists yet
        if (dynamicRows.length === 0) {
          const newRowStart = range2EndNum + 0.01;

          const newRow = {
            id: `row_${Date.now()}`,
            rangeStart: newRowStart,
            rangeEnd: "", // This will be the final "All remaining price ranges" row
            operationValue1: 1.00,
            operationValue2: 2.00,
            checkboxChecked: false,
            hasInheritedCheckbox: false
          };

          setDynamicRows([newRow]);
          // Make Range 2 deletable when a new row is created
          setRange2Deletable(true);
        }
      }
    }
  };

  // Handle Range 2 deletion - promote dynamic row to Range 2 position
  useEffect(() => {
    if (!range2Visible && dynamicRows.length > 0) {
      // Promote first dynamic row to Range 2
      const firstDynamicRow = dynamicRows[0];
      setStandardRange2Start(Number(firstDynamicRow.rangeStart));
      setStandardRange2End(""); // Reset end price so user can re-complete
      setRow3Checked(firstDynamicRow.checkboxChecked);
      // Remove the promoted row from dynamic rows
      setDynamicRows(dynamicRows.slice(1));
      // Make Range 2 visible again
      setRange2Visible(true);
      setRange2Deletable(false);
    } else if (!range2Visible) {
      setRange2Deletable(false);
    }
  }, [range2Visible]);

  // Update third row starting price when Range 2 ending price changes
  useEffect(() => {
    if (dynamicRows.length > 0 && standardRange2End !== "" && standardRange2End !== null) {
      const newThirdRowStart = Number(standardRange2End) + 0.01;
      const updatedRows = [...dynamicRows];
      updatedRows[0].rangeStart = newThirdRowStart;
      setDynamicRows(updatedRows);
    }
  }, [standardRange2End]);

  // Validate dynamic rows whenever they change
  useEffect(() => {
    validateDynamicRows();
  }, [dynamicRows]);


  // Track if any pricing rule changes have been made
  const [hasPricingChanges, setHasPricingChanges] = useState(false);

  // Initial values to track changes
  const [initialPricingValues, setInitialPricingValues] = useState({
    basicPricingCost: "Product Cost",
    basicPricingPattern: "+",
    basicPricingValue: 0,
    comparedPricingEnabled: false,
    comparedPricingCost: "Product Cost",
    comparedPricingPattern: "+",
    comparedPricingValue: 0,
    pricingRuleType: "PricingRankBasic"
  });

  // Check for changes whenever pricing values change
  useEffect(() => {
    const hasChanges =
      basicPricingCost !== initialPricingValues.basicPricingCost ||
      basicPricingPattern !== initialPricingValues.basicPricingPattern ||
      basicPricingValue !== initialPricingValues.basicPricingValue ||
      comparedPricingEnabled !== initialPricingValues.comparedPricingEnabled ||
      comparedPricingCost !== initialPricingValues.comparedPricingCost ||
      comparedPricingPattern !== initialPricingValues.comparedPricingPattern ||
      comparedPricingValue !== initialPricingValues.comparedPricingValue ||
      pricingRuleType !== initialPricingValues.pricingRuleType;

    setHasPricingChanges(hasChanges);
  }, [basicPricingCost, basicPricingPattern, basicPricingValue, comparedPricingEnabled, comparedPricingCost, comparedPricingPattern, comparedPricingValue, pricingRuleType, initialPricingValues]);

  // Save pricing changes
  const handleSavePricingChanges = () => {
    // Update initial values to current values
    setInitialPricingValues({
      basicPricingCost,
      basicPricingPattern,
      basicPricingValue,
      comparedPricingEnabled,
      comparedPricingCost,
      comparedPricingPattern,
      comparedPricingValue,
      pricingRuleType
    });
    setHasPricingChanges(false);
    // Add any additional save logic here
  };
  const [priceThresholdOption, setPriceThresholdOption] = useState("any");
  const [inventoryChangesEnabled, setInventoryChangesEnabled] = useState(false); // default OFF
  const [skuChangesEnabled, setSkuChangesEnabled] = useState(true); // default ON  
  const [cancelledOrderEnabled, setCancelledOrderEnabled] = useState(true); // default ON
  const [aiRecommendationEnabled, setAiRecommendationEnabled] = useState(true); // default ON
  const [originalPriceChangesEnabled, setOriginalPriceChangesEnabled] = useState(false);
  const [originalPriceThresholdOption, setOriginalPriceThresholdOption] = useState("any");
  const [originalInventoryChangesEnabled, setOriginalInventoryChangesEnabled] = useState(false);
  const [originalSkuChangesEnabled, setOriginalSkuChangesEnabled] = useState(true);
  const [originalCancelledOrderEnabled, setOriginalCancelledOrderEnabled] = useState(true);
  const [originalAiRecommendationEnabled, setOriginalAiRecommendationEnabled] = useState(true);
  const { hasUnsavedChanges, setHasUnsavedChanges, shouldShakeSettingsButtons, triggerSettingsButtonsShake } = useUnsavedChanges();
  const searchRef = useRef<HTMLDivElement>(null);
  const [aliexpressPopoverOpen, setAliexpressPopoverOpen] = useState(false);
  const [temuPopoverOpen, setTemuPopoverOpen] = useState(false);
  const [aliexpressDefault, setAliexpressDefault] = useState("YES");
  const [temuDefault, setTemuDefault] = useState("NO");
  const [aliexpressNote, setAliexpressNote] = useState("");
  const [temuNote, setTemuNote] = useState("");
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showTemuAccountDetails, setShowTemuAccountDetails] = useState(false);
  const [showEbayAccountDetails, setShowEbayAccountDetails] = useState(false);
  const [showSwitchAccountDialog, setShowSwitchAccountDialog] = useState(false);
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(true);
  const [useSupplierIdAsSku, setUseSupplierIdAsSku] = useState(true);
  const [pushProductOption, setPushProductOption] = useState("SendCostAbleProductCostToShopify");
  const [migrationType, setMigrationType] = useState("1");
  const [sourceStore, setSourceStore] = useState("");
  const [targetStore, setTargetStore] = useState("");
  const [migrateProducts, setMigrateProducts] = useState(true);
  const [migrateMapping, setMigrateMapping] = useState(true);

  // Multilingual product language states
  const [frenchEnabled, setFrenchEnabled] = useState(false);
  const [portugueseEnabled, setPortugueseEnabled] = useState(false);
  const [germanEnabled, setGermanEnabled] = useState(false);
  const [italianEnabled, setItalianEnabled] = useState(false);
  const [spanishEnabled, setSpanishEnabled] = useState(false);

  // Automatic inventory update states
  const [inventoryProductOption, setInventoryProductOption] = useState("AutoSyncInventoryProductInvalidDoNothing");
  const [inventoryVariantOption, setInventoryVariantOption] = useState("AutoSyncInventoryVariantInvalidDoNothing");
  const [inventoryMappingOption, setInventoryMappingOption] = useState("DoNothing");
  const [inventoryAboveZeroOption, setInventoryAboveZeroOption] = useState("NotifyOutStockNothing");

  // Manual price update states
  const [selectedStoresForPriceUpdate, setSelectedStoresForPriceUpdate] = useState<string[]>([]);

  // Shipping helper functions
  const addGlobalShippingRow = (selectedMethod: string) => {
    if (selectedMethod) {
      const newRow = {
        id: Date.now(),
        selectedMethod: selectedMethod
      };
      setGlobalShippingRows(prev => [...prev, newRow]);
    }
  };

  const countries = [
    { value: "global", label: "Global" },
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "it", label: "Italy" },
    { value: "es", label: "Spain" },
    { value: "nl", label: "Netherlands" },
    { value: "be", label: "Belgium" },
    { value: "se", label: "Sweden" },
    { value: "no", label: "Norway" },
    { value: "dk", label: "Denmark" },
    { value: "fi", label: "Finland" },
    { value: "ch", label: "Switzerland" },
    { value: "at", label: "Austria" },
    { value: "pl", label: "Poland" },
    { value: "cz", label: "Czech Republic" },
    { value: "hu", label: "Hungary" },
    { value: "sk", label: "Slovakia" },
    { value: "si", label: "Slovenia" },
    { value: "hr", label: "Croatia" },
    { value: "bg", label: "Bulgaria" },
    { value: "ro", label: "Romania" },
    { value: "gr", label: "Greece" },
    { value: "pt", label: "Portugal" },
    { value: "ie", label: "Ireland" },
    { value: "lu", label: "Luxembourg" },
    { value: "mt", label: "Malta" },
    { value: "cy", label: "Cyprus" },
    { value: "ee", label: "Estonia" },
    { value: "lv", label: "Latvia" },
    { value: "lt", label: "Lithuania" },
    { value: "jp", label: "Japan" },
    { value: "kr", label: "South Korea" },
    { value: "cn", label: "China" },
    { value: "hk", label: "Hong Kong" },
    { value: "sg", label: "Singapore" },
    { value: "my", label: "Malaysia" },
    { value: "th", label: "Thailand" },
    { value: "ph", label: "Philippines" },
    { value: "id", label: "Indonesia" },
    { value: "vn", label: "Vietnam" },
    { value: "in", label: "India" },
    { value: "bd", label: "Bangladesh" },
    { value: "pk", label: "Pakistan" },
    { value: "lk", label: "Sri Lanka" },
    { value: "np", label: "Nepal" },
    { value: "mm", label: "Myanmar" },
    { value: "kh", label: "Cambodia" },
    { value: "la", label: "Laos" },
    { value: "mn", label: "Mongolia" },
    { value: "tw", label: "Taiwan" },
    { value: "mo", label: "Macau" },
    { value: "br", label: "Brazil" },
    { value: "mx", label: "Mexico" },
    { value: "ar", label: "Argentina" },
    { value: "cl", label: "Chile" },
    { value: "co", label: "Colombia" },
    { value: "pe", label: "Peru" },
    { value: "ve", label: "Venezuela" },
    { value: "ec", label: "Ecuador" },
    { value: "bo", label: "Bolivia" },
    { value: "py", label: "Paraguay" },
    { value: "uy", label: "Uruguay" },
    { value: "gf", label: "French Guiana" },
    { value: "sr", label: "Suriname" },
    { value: "gy", label: "Guyana" },
    { value: "za", label: "South Africa" },
    { value: "eg", label: "Egypt" },
    { value: "ma", label: "Morocco" },
    { value: "dz", label: "Algeria" },
    { value: "tn", label: "Tunisia" },
    { value: "ly", label: "Libya" },
    { value: "sd", label: "Sudan" },
    { value: "et", label: "Ethiopia" },
    { value: "ke", label: "Kenya" },
    { value: "ug", label: "Uganda" },
    { value: "tz", label: "Tanzania" },
    { value: "mz", label: "Mozambique" },
    { value: "mg", label: "Madagascar" },
    { value: "mw", label: "Malawi" },
    { value: "zm", label: "Zambia" },
    { value: "zw", label: "Zimbabwe" },
    { value: "bw", label: "Botswana" },
    { value: "na", label: "Namibia" },
    { value: "sz", label: "Eswatini" },
    { value: "ls", label: "Lesotho" },
    { value: "gh", label: "Ghana" },
    { value: "ng", label: "Nigeria" },
    { value: "ci", label: "Côte d'Ivoire" },
    { value: "sn", label: "Senegal" },
    { value: "ml", label: "Mali" },
    { value: "bf", label: "Burkina Faso" },
    { value: "ne", label: "Niger" },
    { value: "td", label: "Chad" },
    { value: "cm", label: "Cameroon" },
    { value: "cf", label: "Central African Republic" },
    { value: "ga", label: "Gabon" },
    { value: "gq", label: "Equatorial Guinea" },
    { value: "cg", label: "Republic of the Congo" },
    { value: "cd", label: "Democratic Republic of the Congo" },
    { value: "ao", label: "Angola" },
    { value: "ru", label: "Russia" },
    { value: "ua", label: "Ukraine" },
    { value: "by", label: "Belarus" },
    { value: "md", label: "Moldova" },
    { value: "ge", label: "Georgia" },
    { value: "am", label: "Armenia" },
    { value: "az", label: "Azerbaijan" },
    { value: "kz", label: "Kazakhstan" },
    { value: "kg", label: "Kyrgyzstan" },
    { value: "tj", label: "Tajikistan" },
    { value: "tm", label: "Turkmenistan" },
    { value: "uz", label: "Uzbekistan" },
    { value: "af", label: "Afghanistan" },
    { value: "ir", label: "Iran" },
    { value: "iq", label: "Iraq" },
    { value: "sy", label: "Syria" },
    { value: "lb", label: "Lebanon" },
    { value: "jo", label: "Jordan" },
    { value: "il", label: "Israel" },
    { value: "ps", label: "Palestine" },
    { value: "sa", label: "Saudi Arabia" },
    { value: "ae", label: "United Arab Emirates" },
    { value: "qa", label: "Qatar" },
    { value: "kw", label: "Kuwait" },
    { value: "bh", label: "Bahrain" },
    { value: "om", label: "Oman" },
    { value: "ye", label: "Yemen" },
    { value: "tr", label: "Turkey" },
    { value: "is", label: "Iceland" },
    { value: "nz", label: "New Zealand" },
    { value: "fj", label: "Fiji" },
    { value: "pg", label: "Papua New Guinea" },
    { value: "sb", label: "Solomon Islands" },
    { value: "vu", label: "Vanuatu" },
    { value: "nc", label: "New Caledonia" },
    { value: "pf", label: "French Polynesia" },
    { value: "ws", label: "Samoa" },
    { value: "to", label: "Tonga" },
    { value: "ki", label: "Kiribati" },
    { value: "tv", label: "Tuvalu" },
    { value: "nr", label: "Nauru" },
    { value: "mh", label: "Marshall Islands" },
    { value: "fm", label: "Micronesia" },
    { value: "pw", label: "Palau" }
  ];

  const handlePushProductOptionChange = (value: string) => {
    if (value === "SendCostAbleProductAndShippingCostToShopify") {
      setShowUpgradeDialog(true);
    } else {
      setPushProductOption(value);
    }
  };
  const [productDescriptionOption, setProductDescriptionOption] = useState("CustomProdDescSpecAndOverview");
  const [setProductsTaxable, setSetProductsTaxable] = useState(false);
  const [automaticPriceUpdateOption, setAutomaticPriceUpdateOption] = useState("PriceTypeDoNothing");
  const [priceChangeThresholdOption, setPriceChangeThresholdOption] = useState("number");
  const [priceIncreaseChecked, setPriceIncreaseChecked] = useState(true);
  const [priceDecreaseChecked, setPriceDecreaseChecked] = useState(true);
  const [priceChangePercentage, setPriceChangePercentage] = useState(0);
  const [lastManualPriceUpdate, setLastManualPriceUpdate] = useState<Date | null>(null);
  const [manualPriceUpdateUsageCount, setManualPriceUpdateUsageCount] = useState(0);
  const [availableStores, setAvailableStores] = useState<string[]>([]);

  // Product settings original values for tracking changes
  const [originalProductSettings, setOriginalProductSettings] = useState({
    pushProductOption: "SendCostAbleProductCostToShopify",
    productDescriptionOption: "CustomProdDescSpecAndOverview",
    migrationType: "1",
    sourceStore: "",
    targetStore: "",
    migrateProducts: true,
    migrateMapping: true,
    frenchEnabled: false,
    portugueseEnabled: false,
    germanEnabled: false,
    italianEnabled: false,
    spanishEnabled: false
  });

  const handleAddStaff = () => {
    setShowUpgradeDialog(true);
  };

  const handleAutomaticPriceUpdateOptionChange = (value: string) => {
    if (value !== "PriceTypeDoNothing") {
      setShowUpgradeDialog(true);
      // Don't change the state - keep it at default
    } else {
      setAutomaticPriceUpdateOption(value);
    }
  };

  const handlePriceChangeThresholdOptionChange = (value: string) => {
    if (value !== "number") {
      setShowUpgradeDialog(true);
      // Don't change the state - keep it at default
    } else {
      setPriceChangeThresholdOption(value);
    }
  };

  const handleInventoryProductOptionChange = (value: string) => {
    if (value !== "AutoSyncInventoryProductInvalidDoNothing") {
      setShowUpgradeDialog(true);
      // Don't change the state - keep it at default
    } else {
      setInventoryProductOption(value);
    }
  };

  const handleInventoryVariantOptionChange = (value: string) => {
    if (value !== "AutoSyncInventoryVariantInvalidDoNothing") {
      setShowUpgradeDialog(true);
      // Don't change the state - keep it at default
    } else {
      setInventoryVariantOption(value);
    }
  };

  const handleInventoryMappingOptionChange = (value: string) => {
    if (value !== "DoNothing") {
      setShowUpgradeDialog(true);
      // Don't change the state - keep it at default
    } else {
      setInventoryMappingOption(value);
    }
  };

  const handleInventoryAboveZeroOptionChange = (value: string) => {
    if (value !== "NotifyOutStockNothing") {
      setShowUpgradeDialog(true);
      // Don't change the state - keep it at default
    } else {
      setInventoryAboveZeroOption(value);
    }
  };

  const handleStoreSelectionForPriceUpdate = (storeId: string, checked: boolean) => {
    setSelectedStoresForPriceUpdate(prev => {
      if (checked) {
        return [...prev, storeId];
      } else {
        return prev.filter(id => id !== storeId);
      }
    });
  };

  const handlePriceChangeCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUpgradeDialog(true);
  };

  // Calculate manual price update usage statistics
  const getManualPriceUpdateStats = () => {
    const today = new Date();
    const baseDate = lastManualPriceUpdate || today;
    const refreshDate = new Date(baseDate);
    refreshDate.setDate(refreshDate.getDate() + 30);

    const totalTimes = 1;
    const usedTimes = manualPriceUpdateUsageCount;
    const remainingTimes = Math.max(0, totalTimes - usedTimes);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    return {
      remainingTimes,
      usedTimes,
      totalTimes,
      refreshDate: formatDate(refreshDate)
    };
  };

  // Check for unsaved changes in notification settings
  useEffect(() => {
    if (activeTab === "notification") {
      const hasChanges = priceChangesEnabled !== originalPriceChangesEnabled ||
                        priceThresholdOption !== originalPriceThresholdOption ||
                        inventoryChangesEnabled !== originalInventoryChangesEnabled ||
                        skuChangesEnabled !== originalSkuChangesEnabled ||
                        cancelledOrderEnabled !== originalCancelledOrderEnabled ||
                        aiRecommendationEnabled !== originalAiRecommendationEnabled;
      setHasUnsavedChanges(hasChanges);
    }
  }, [activeTab, priceChangesEnabled, priceThresholdOption, inventoryChangesEnabled, skuChangesEnabled, cancelledOrderEnabled, aiRecommendationEnabled, originalPriceChangesEnabled, originalPriceThresholdOption, originalInventoryChangesEnabled, originalSkuChangesEnabled, originalCancelledOrderEnabled, originalAiRecommendationEnabled]);

  // Clear unsaved changes when switching to tabs that don't have tracking
  useEffect(() => {
    if (activeTab !== "notification" && activeTab !== "product") {
      setHasUnsavedChanges(false);
    }
  }, [activeTab]);

  // Check for unsaved changes in product settings
  useEffect(() => {
    if (activeTab === "product") {
      const hasProductChanges = (
        pushProductOption !== originalProductSettings.pushProductOption ||
        productDescriptionOption !== originalProductSettings.productDescriptionOption ||
        migrationType !== originalProductSettings.migrationType ||
        sourceStore !== originalProductSettings.sourceStore ||
        targetStore !== originalProductSettings.targetStore ||
        migrateProducts !== originalProductSettings.migrateProducts ||
        migrateMapping !== originalProductSettings.migrateMapping ||
        frenchEnabled !== originalProductSettings.frenchEnabled ||
        portugueseEnabled !== originalProductSettings.portugueseEnabled ||
        germanEnabled !== originalProductSettings.germanEnabled ||
        italianEnabled !== originalProductSettings.italianEnabled ||
        spanishEnabled !== originalProductSettings.spanishEnabled
      );
      setHasUnsavedChanges(hasProductChanges);
    }
  }, [activeTab, pushProductOption, productDescriptionOption, migrationType, sourceStore, targetStore, migrateProducts, migrateMapping, frenchEnabled, portugueseEnabled, germanEnabled, italianEnabled, spanishEnabled, originalProductSettings]);

  // Handle price changes enabled toggle
  const handlePriceChangesToggle = (enabled: boolean) => {
    setPriceChangesEnabled(enabled);
  };

  // Handle price threshold option change
  const handlePriceThresholdChange = (value: string) => {
    setPriceThresholdOption(value);
  };

  // Handle tab change with unsaved changes check
  const handleTabChange = (tabId: string) => {
    if (hasUnsavedChanges && (activeTab === "notification" || activeTab === "product") && tabId !== activeTab) {
      triggerSettingsButtonsShake();
      return;
    }
    if (hasShippingChanges && activeTab === "shipping" && tabId !== activeTab) {
      triggerSettingsButtonsShake();
      return;
    }
    setActiveTab(tabId);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // Update all original values to current values
    setOriginalPriceChangesEnabled(priceChangesEnabled);
    setOriginalPriceThresholdOption(priceThresholdOption);
    setOriginalInventoryChangesEnabled(inventoryChangesEnabled);
    setOriginalSkuChangesEnabled(skuChangesEnabled);
    setOriginalCancelledOrderEnabled(cancelledOrderEnabled);
    setOriginalAiRecommendationEnabled(aiRecommendationEnabled);

    // Update product settings original values
    setOriginalProductSettings({
      pushProductOption,
      productDescriptionOption,
      migrationType,
      sourceStore,
      targetStore,
      migrateProducts,
      migrateMapping,
      frenchEnabled,
      portugueseEnabled,
      germanEnabled,
      italianEnabled,
      spanishEnabled
    });

    setHasUnsavedChanges(false);
    // Here you would typically save to backend
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    // Reset all current values to original values
    setPriceChangesEnabled(originalPriceChangesEnabled);
    setPriceThresholdOption(originalPriceThresholdOption);
    setInventoryChangesEnabled(originalInventoryChangesEnabled);
    setSkuChangesEnabled(originalSkuChangesEnabled);
    setCancelledOrderEnabled(originalCancelledOrderEnabled);
    setAiRecommendationEnabled(originalAiRecommendationEnabled);

    // Reset product settings to original values
    setPushProductOption(originalProductSettings.pushProductOption);
    setProductDescriptionOption(originalProductSettings.productDescriptionOption);
    setMigrationType(originalProductSettings.migrationType);
    setSourceStore(originalProductSettings.sourceStore);
    setTargetStore(originalProductSettings.targetStore);
    setMigrateProducts(originalProductSettings.migrateProducts);
    setMigrateMapping(originalProductSettings.migrateMapping);
    setFrenchEnabled(originalProductSettings.frenchEnabled);
    setPortugueseEnabled(originalProductSettings.portugueseEnabled);
    setGermanEnabled(originalProductSettings.germanEnabled);
    setItalianEnabled(originalProductSettings.italianEnabled);
    setSpanishEnabled(originalProductSettings.spanishEnabled);

    setHasUnsavedChanges(false);
  };

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

  // Detect shipping changes
  useEffect(() => {
    const hasChanges = shippingMethodType !== originalShippingMethodType;
    setHasShippingChanges(hasChanges);
  }, [shippingMethodType, originalShippingMethodType]);



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

  // Handle clicks outside settings page area to trigger shake when there are unsaved changes
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (hasUnsavedChanges && activeTab === "notification") {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer && !settingsContainer.contains(event.target as Node)) {
          // Check if click is outside the settings page width area
          const settingsRect = settingsContainer.getBoundingClientRect();
          const clickX = event.clientX;
          
          if (clickX < settingsRect.left || clickX > settingsRect.right) {
            event.preventDefault();
            triggerSettingsButtonsShake();
          }
        }
      }
    };

    if (hasUnsavedChanges && activeTab === "notification") {
      document.addEventListener('click', handleOutsideClick, { capture: true });
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick, { capture: true });
    };
  }, [hasUnsavedChanges, activeTab, triggerSettingsButtonsShake]);

  return (
    <div className="h-full w-full flex flex-col settings-container">
      <div className="flex-shrink-0 px-8 py-6">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center space-x-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Settings className="text-primary h-6 w-6" />
              </div>
              <h1 className="text-foreground text-4xl font-medium">Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Configure your account preferences and application settings
            </p>
          </div>

          {/* Setup Guide Section */}
          <div className="mb-8">
            <Accordion type="single" collapsible defaultValue="setup-guide" className="w-full border rounded-lg">
            <AccordionItem value="setup-guide" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="text-left">
                  <div className="text-2xl font-medium mb-2 capitalize">Setup guide</div>
                  <div className="text-base text-muted-foreground font-normal">
                    Use this guide to make your operation more convenient. Current completion progress 
                    <span className="ml-1">(0/2)</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-0">
                  <Accordion type="multiple" className="w-full">
                    {/* Shipping Template Guide */}
                    <AccordionItem value="shipping-guide" className="border-0">
                      <div className="border-t"></div>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline [&>svg]:hidden rounded-t-lg data-[state=open]:rounded-b-none data-[state=open]:bg-[#fafafa] dark:data-[state=open]:bg-muted">
                        <div className="flex items-center gap-0">
                          <div className="setup-guide-bullet flex-shrink-0 ml-3"></div>
                          <p className="text-lg font-medium text-left">
                            Set matching shipping template automatically for faster ordering
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pt-0">
                        <div className="rounded-b-lg p-6 pt-2 bg-[#fafafa] dark:bg-muted">
                          <div className="flex gap-6">
                            <div className="flex-1 flex flex-col">
                              <div className="ml-12 flex-1 flex flex-col justify-between">
                                <p className="text-base text-muted-foreground leading-relaxed">
                                  How to set up the shipping method, you can click the video on the right to view the setting method. You can also click{" "}
                                  <a 
                                    href="https://help.dshipit.com/set-add-global-shipping-method/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    here
                                  </a>{" "}
                                  to check our blog article
                                </p>
                                <Button variant="outline" className="uppercase self-start">
                                  GO TO SET
                                </Button>
                              </div>
                            </div>
                            <div>
                              <div className="relative">
                                <img src="/shipping_template.jpg" className="w-[261px] h-[124px]" />
                                <img className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px]" src="/play-icon.png" alt="" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Pricing Template Guide */}
                    <AccordionItem value="pricing-guide" className="border-0">
                      <div className="border-t"></div>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline [&>svg]:hidden rounded-t-lg data-[state=open]:rounded-b-none data-[state=open]:bg-[#fafafa] dark:data-[state=open]:bg-muted">
                        <div className="flex items-center gap-0">
                          <div className="setup-guide-bullet flex-shrink-0 ml-3"></div>
                          <p className="text-lg font-medium text-left">
                            Set the price template and DShipIt will automatically calculate the price for you
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pt-0">
                        <div className="rounded-b-lg p-6 pt-2 bg-[#fafafa] dark:bg-muted">
                          <div className="flex gap-6">
                            <div className="flex-1 flex flex-col">
                              <div className="ml-12 flex-1 flex flex-col justify-between">
                                <p className="text-base text-muted-foreground leading-relaxed">
                                  How to set the price template, you can click the video on the right to view the setting method, You can also click{" "}
                                  <a 
                                    href="https://help.dshipit.com/set-pricing-rules/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    here
                                  </a>{" "}
                                  to check our blog article
                                </p>
                                <Button variant="outline" className="uppercase self-start">
                                  GO TO SET
                                </Button>
                              </div>
                            </div>
                            <div>
                              <div className="relative">
                                <img src="/pricing_template.jpg" className="w-[261px] h-[124px]" />
                                <img className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px]" src="/play-icon.png" alt="" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-6xl h-full">
          <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-auto bg-background flex flex-col border-r flex-shrink-0 min-w-0">
            {/* Tab Navigation */}
            <div className="p-2">
              {settingsData.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center px-6 py-2 text-left font-normal rounded-lg text-base mb-1 transition-colors whitespace-nowrap ${
                      activeTab === item.id 
                        ? 'bg-muted text-foreground' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="mr-3" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Subscription & Billing Button */}
              <div className="px-4 pt-4">
                <Button
                  className="w-full"
                  onClick={() => router.push('/subscription')}
                >
                  Subscription & Billing
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className={`flex-1 ${hasUnsavedChanges ? 'pb-24' : ''}`}>
            {/* Shipping Settings Content */}
            {activeTab === "shipping" && (
              <ShippingSettings
                setShowUpgradeDialog={setShowUpgradeDialog}
                shouldShakeSettingsButtons={shouldShakeSettingsButtons}
              />
            )}

            {/* Old inline shipping settings - to be removed */}
            {false && activeTab === "shipping" && (
              <div className={`relative px-6 space-y-6 ${hasShippingChanges ? 'pb-24' : ''}`}>
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
                                    Set up your default shipping method for global countries. Auto order system will choose shipping method according to your setting while placing orders. Option 1 will be your first choice.
                                  </p>

                                  {/* Global Method Accordion */}
                                  <div className="mt-4">
                                    <Accordion type="multiple" defaultValue={["section-1"]} className="w-full border rounded-lg">
                                      {/* First Section - Global */}
                                      <AccordionItem value="section-1" className="border-0">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                          <div className="flex items-center justify-between w-full">
                                            <Select defaultValue="global">
                                              <SelectTrigger
                                                className="w-[404px] text-[0.925rem]"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="global">Global</SelectItem>
                                                <SelectItem value="us">United States</SelectItem>
                                                <SelectItem value="uk">United Kingdom</SelectItem>
                                                <SelectItem value="ca">Canada</SelectItem>
                                                <SelectItem value="au">Australia</SelectItem>
                                                <SelectItem value="de">Germany</SelectItem>
                                                <SelectItem value="fr">France</SelectItem>
                                                <SelectItem value="it">Italy</SelectItem>
                                                <SelectItem value="es">Spain</SelectItem>
                                                <SelectItem value="nl">Netherlands</SelectItem>
                                                <SelectItem value="be">Belgium</SelectItem>
                                                <SelectItem value="se">Sweden</SelectItem>
                                                <SelectItem value="no">Norway</SelectItem>
                                                <SelectItem value="dk">Denmark</SelectItem>
                                                <SelectItem value="fi">Finland</SelectItem>
                                                <SelectItem value="ch">Switzerland</SelectItem>
                                                <SelectItem value="at">Austria</SelectItem>
                                                <SelectItem value="pl">Poland</SelectItem>
                                                <SelectItem value="cz">Czech Republic</SelectItem>
                                                <SelectItem value="hu">Hungary</SelectItem>
                                                <SelectItem value="sk">Slovakia</SelectItem>
                                                <SelectItem value="si">Slovenia</SelectItem>
                                                <SelectItem value="hr">Croatia</SelectItem>
                                                <SelectItem value="bg">Bulgaria</SelectItem>
                                                <SelectItem value="ro">Romania</SelectItem>
                                                <SelectItem value="gr">Greece</SelectItem>
                                                <SelectItem value="pt">Portugal</SelectItem>
                                                <SelectItem value="ie">Ireland</SelectItem>
                                                <SelectItem value="lu">Luxembourg</SelectItem>
                                                <SelectItem value="mt">Malta</SelectItem>
                                                <SelectItem value="cy">Cyprus</SelectItem>
                                                <SelectItem value="ee">Estonia</SelectItem>
                                                <SelectItem value="lv">Latvia</SelectItem>
                                                <SelectItem value="lt">Lithuania</SelectItem>
                                                <SelectItem value="jp">Japan</SelectItem>
                                                <SelectItem value="kr">South Korea</SelectItem>
                                                <SelectItem value="cn">China</SelectItem>
                                                <SelectItem value="hk">Hong Kong</SelectItem>
                                                <SelectItem value="sg">Singapore</SelectItem>
                                                <SelectItem value="my">Malaysia</SelectItem>
                                                <SelectItem value="th">Thailand</SelectItem>
                                                <SelectItem value="ph">Philippines</SelectItem>
                                                <SelectItem value="id">Indonesia</SelectItem>
                                                <SelectItem value="vn">Vietnam</SelectItem>
                                                <SelectItem value="in">India</SelectItem>
                                                <SelectItem value="bd">Bangladesh</SelectItem>
                                                <SelectItem value="pk">Pakistan</SelectItem>
                                                <SelectItem value="lk">Sri Lanka</SelectItem>
                                                <SelectItem value="np">Nepal</SelectItem>
                                                <SelectItem value="mm">Myanmar</SelectItem>
                                                <SelectItem value="kh">Cambodia</SelectItem>
                                                <SelectItem value="la">Laos</SelectItem>
                                                <SelectItem value="mn">Mongolia</SelectItem>
                                                <SelectItem value="tw">Taiwan</SelectItem>
                                                <SelectItem value="mo">Macau</SelectItem>
                                                <SelectItem value="br">Brazil</SelectItem>
                                                <SelectItem value="mx">Mexico</SelectItem>
                                                <SelectItem value="ar">Argentina</SelectItem>
                                                <SelectItem value="cl">Chile</SelectItem>
                                                <SelectItem value="co">Colombia</SelectItem>
                                                <SelectItem value="pe">Peru</SelectItem>
                                                <SelectItem value="ve">Venezuela</SelectItem>
                                                <SelectItem value="ec">Ecuador</SelectItem>
                                                <SelectItem value="bo">Bolivia</SelectItem>
                                                <SelectItem value="py">Paraguay</SelectItem>
                                                <SelectItem value="uy">Uruguay</SelectItem>
                                                <SelectItem value="gf">French Guiana</SelectItem>
                                                <SelectItem value="sr">Suriname</SelectItem>
                                                <SelectItem value="gy">Guyana</SelectItem>
                                                <SelectItem value="za">South Africa</SelectItem>
                                                <SelectItem value="eg">Egypt</SelectItem>
                                                <SelectItem value="ma">Morocco</SelectItem>
                                                <SelectItem value="dz">Algeria</SelectItem>
                                                <SelectItem value="tn">Tunisia</SelectItem>
                                                <SelectItem value="ly">Libya</SelectItem>
                                                <SelectItem value="sd">Sudan</SelectItem>
                                                <SelectItem value="et">Ethiopia</SelectItem>
                                                <SelectItem value="ke">Kenya</SelectItem>
                                                <SelectItem value="ug">Uganda</SelectItem>
                                                <SelectItem value="tz">Tanzania</SelectItem>
                                                <SelectItem value="mz">Mozambique</SelectItem>
                                                <SelectItem value="mg">Madagascar</SelectItem>
                                                <SelectItem value="mw">Malawi</SelectItem>
                                                <SelectItem value="zm">Zambia</SelectItem>
                                                <SelectItem value="zw">Zimbabwe</SelectItem>
                                                <SelectItem value="bw">Botswana</SelectItem>
                                                <SelectItem value="na">Namibia</SelectItem>
                                                <SelectItem value="sz">Eswatini</SelectItem>
                                                <SelectItem value="ls">Lesotho</SelectItem>
                                                <SelectItem value="gh">Ghana</SelectItem>
                                                <SelectItem value="ng">Nigeria</SelectItem>
                                                <SelectItem value="ci">Côte d'Ivoire</SelectItem>
                                                <SelectItem value="sn">Senegal</SelectItem>
                                                <SelectItem value="ml">Mali</SelectItem>
                                                <SelectItem value="bf">Burkina Faso</SelectItem>
                                                <SelectItem value="ne">Niger</SelectItem>
                                                <SelectItem value="td">Chad</SelectItem>
                                                <SelectItem value="cm">Cameroon</SelectItem>
                                                <SelectItem value="cf">Central African Republic</SelectItem>
                                                <SelectItem value="ga">Gabon</SelectItem>
                                                <SelectItem value="gq">Equatorial Guinea</SelectItem>
                                                <SelectItem value="cg">Republic of the Congo</SelectItem>
                                                <SelectItem value="cd">Democratic Republic of the Congo</SelectItem>
                                                <SelectItem value="ao">Angola</SelectItem>
                                                <SelectItem value="ru">Russia</SelectItem>
                                                <SelectItem value="ua">Ukraine</SelectItem>
                                                <SelectItem value="by">Belarus</SelectItem>
                                                <SelectItem value="md">Moldova</SelectItem>
                                                <SelectItem value="ge">Georgia</SelectItem>
                                                <SelectItem value="am">Armenia</SelectItem>
                                                <SelectItem value="az">Azerbaijan</SelectItem>
                                                <SelectItem value="kz">Kazakhstan</SelectItem>
                                                <SelectItem value="kg">Kyrgyzstan</SelectItem>
                                                <SelectItem value="tj">Tajikistan</SelectItem>
                                                <SelectItem value="tm">Turkmenistan</SelectItem>
                                                <SelectItem value="uz">Uzbekistan</SelectItem>
                                                <SelectItem value="af">Afghanistan</SelectItem>
                                                <SelectItem value="ir">Iran</SelectItem>
                                                <SelectItem value="iq">Iraq</SelectItem>
                                                <SelectItem value="sy">Syria</SelectItem>
                                                <SelectItem value="lb">Lebanon</SelectItem>
                                                <SelectItem value="jo">Jordan</SelectItem>
                                                <SelectItem value="il">Israel</SelectItem>
                                                <SelectItem value="ps">Palestine</SelectItem>
                                                <SelectItem value="sa">Saudi Arabia</SelectItem>
                                                <SelectItem value="ae">United Arab Emirates</SelectItem>
                                                <SelectItem value="qa">Qatar</SelectItem>
                                                <SelectItem value="kw">Kuwait</SelectItem>
                                                <SelectItem value="bh">Bahrain</SelectItem>
                                                <SelectItem value="om">Oman</SelectItem>
                                                <SelectItem value="ye">Yemen</SelectItem>
                                                <SelectItem value="tr">Turkey</SelectItem>
                                                <SelectItem value="is">Iceland</SelectItem>
                                                <SelectItem value="nz">New Zealand</SelectItem>
                                                <SelectItem value="fj">Fiji</SelectItem>
                                                <SelectItem value="pg">Papua New Guinea</SelectItem>
                                                <SelectItem value="sb">Solomon Islands</SelectItem>
                                                <SelectItem value="vu">Vanuatu</SelectItem>
                                                <SelectItem value="nc">New Caledonia</SelectItem>
                                                <SelectItem value="pf">French Polynesia</SelectItem>
                                                <SelectItem value="ws">Samoa</SelectItem>
                                                <SelectItem value="to">Tonga</SelectItem>
                                                <SelectItem value="ki">Kiribati</SelectItem>
                                                <SelectItem value="tv">Tuvalu</SelectItem>
                                                <SelectItem value="nr">Nauru</SelectItem>
                                                <SelectItem value="mh">Marshall Islands</SelectItem>
                                                <SelectItem value="fm">Micronesia</SelectItem>
                                                <SelectItem value="pw">Palau</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                            >
                                              <svg
                                                className="size-5"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path fillRule="evenodd" d="M0 0h24v24H0z" fill="none"/>
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                              </svg>
                                            </Button>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between ml-14">
                                              <Select defaultValue="aliexpress-standard-be">
                                                <SelectTrigger className="w-[348px] text-[0.925rem]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {SHIPPING_METHODS.map((method) => (
                                                    <SelectItem key={method.value} value={method.value}>
                                                      {method.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                              >
                                                <svg
                                                  className="size-5"
                                                  fill="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path fillRule="evenodd" d="M0 0h24v24H0z" fill="none"/>
                                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                </svg>
                                              </Button>
                                            </div>
                                            {/* Dynamic shipping method rows */}
                                            {globalShippingRows.map((row) => (
                                              <div key={row.id} className="ml-14">
                                                <Select value={row.selectedMethod}>
                                                  <SelectTrigger className="w-[348px] text-[0.925rem]">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {SHIPPING_METHODS.map((method) => (
                                                      <SelectItem key={method.value} value={method.value}>
                                                        {method.label}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            ))}

                                            <div className="ml-14">
                                              <Select onValueChange={(value) => addGlobalShippingRow(value)}>
                                                <SelectTrigger className="w-[348px] data-[placeholder]:text-gray-400 text-[0.925rem]">
                                                  <SelectValue placeholder="Add more shipping method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {SHIPPING_METHODS.map((method) => (
                                                    <SelectItem key={method.value} value={method.value}>
                                                      {method.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      {/* Second Section - Choose Country */}
                                      <AccordionItem value="section-2" className="border-0">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                          <div className="flex items-center justify-between w-full">
                                            <Select>
                                              <SelectTrigger className="w-[404px] text-[0.925rem]">
                                                <SelectValue placeholder="Choose a country" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {countries.map((country) => (
                                                  <SelectItem key={country.value} value={country.value}>
                                                    {country.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            >
                                              <svg
                                                className="size-5"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path fillRule="evenodd" d="M0 0h24v24H0z" fill="none"/>
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                              </svg>
                                            </Button>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                          <div className="space-y-3">
                                            <div className="ml-14">
                                              <Select onValueChange={(value) => addGlobalShippingRow(value)}>
                                                <SelectTrigger className="w-[348px] data-[placeholder]:text-gray-400 text-[0.925rem]">
                                                  <SelectValue placeholder="Add more shipping method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {SHIPPING_METHODS.map((method) => (
                                                    <SelectItem key={method.value} value={method.value}>
                                                      {method.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  </div>
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
                                            <Select defaultValue="global-advanced">
                                              <SelectTrigger className="w-[400px] text-[0.925rem]">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="global-advanced">Global (Advanced)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-10 w-10 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            >
                                              <svg
                                                className="size-5"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path fillRule="evenodd" d="M0 0h24v24H0z" fill="none"/>
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                              </svg>
                                            </Button>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                              <div>
                                                <Label className="text-sm font-medium">Price Range ($)</Label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                  <Input type="number" placeholder="Min" className="w-20" />
                                                  <span className="text-muted-foreground">to</span>
                                                  <Input type="number" placeholder="Max" className="w-20" />
                                                </div>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Delivery Date Range (days)</Label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                  <Input type="number" placeholder="Min" className="w-20" />
                                                  <span className="text-muted-foreground">to</span>
                                                  <Input type="number" placeholder="Max" className="w-20" />
                                                </div>
                                              </div>
                                            </div>

                                            <RadioGroup defaultValue="less-cost" className="space-y-2">
                                              <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="less-day" id="less-day" />
                                                <Label htmlFor="less-day" className="text-[0.95rem] cursor-pointer">
                                                  When multiple options meet my conditions, I need less day
                                                </Label>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="less-cost" id="less-cost" />
                                                <Label htmlFor="less-cost" className="text-[0.95rem] cursor-pointer">
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
              </div>
            )}
            {activeTab === "general" && (
              <div className="px-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="staff-account">
                    <AccordionTrigger className="text-xl font-bold">
                      <div>
                        <div className="text-left">Add Staff Account</div>
                        <div className="text-base text-muted-foreground font-normal">
                          We will send an email to the email address you filled in to complete the authorization, and your employees can log in to DShipIt through this account
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        {/* Add Staff Button */}
                        <div className="flex items-center p-4 hover:bg-muted/50 cursor-pointer" onClick={handleAddStaff}>
                          <div className="flex items-center gap-6 flex-1">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-6 h-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                              <path d="M256 48C141.125 48 48 141.125 48 256s93.125 208 208 208 208-93.125 208-208S370.875 48 256 48zm107 229h-86v86h-42v-86h-86v-42h86v-86h42v86h86v42z"></path>
                            </svg>
                            <div className="text-base font-medium">Add Staff Account</div>
                          </div>
                          <div className="ml-auto">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-5 h-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                              <path d="M416 277.333H277.333V416h-42.666V277.333H96v-42.666h138.667V96h42.666v138.667H416v42.666z"></path>
                            </svg>
                          </div>
                        </div>

                        {/* Existing Staff Account */}
                        <div className="flex items-center p-4 border rounded-lg">
                          <div className="flex items-center gap-6 flex-1">
                            <svg viewBox="0 0 1024 1024" aria-label="Profile" className="w-6 h-6 text-muted-foreground" fill="currentColor">
                              <title>Profile</title>
                              <path d="M730.06 679.64q-45.377 53.444-101.84 83.443t-120 29.999q-64.032 0-120.75-30.503t-102.6-84.451q-40.335 13.109-77.645 29.747t-53.948 26.722l-17.142 10.084Q106.388 763.84 84.96 802.41t-21.428 73.107 25.461 59.242 60.754 24.705h716.95q35.293 0 60.754-24.705t25.461-59.242-21.428-72.603-51.679-57.225q-6.554-4.033-18.907-10.84t-51.427-24.453-79.409-30.755zm-221.84 25.72q-34.285 0-67.561-14.873t-60.754-40.335-51.175-60.502-40.083-75.124-25.461-84.451-9.075-87.728q0-64.032 19.915-116.22t54.452-85.964 80.67-51.931 99.072-18.151 99.072 18.151 80.67 51.931 54.452 85.964 19.915 116.22q0 65.04-20.167 130.58t-53.948 116.72-81.426 83.443-98.568 32.268z"></path>
                            </svg>
                            <span className="text-base font-normal">filipop@gmail.com</span>
                          </div>
                          <div className="ml-auto">
                            <span className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/50 dark:to-violet-950/50 text-blue-600 dark:text-blue-400 text-base font-normal px-3 py-1" style={{borderRadius: '1.25rem'}}>
                              Admin
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Activity Log Accordion */}
                  <AccordionItem value="activity-log">
                    <AccordionTrigger className="text-xl font-bold">
                      <div>
                        <div className="text-left">Activity Log</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        {/* Filter Section */}
                        <div className="flex items-center justify-between">
                          <Select value={selectedFilter} onValueChange={(value) => {
                            setSelectedFilter(value);
                            setIsSearchExpanded(false);
                            setSearchValue("");
                          }}>
                            <SelectTrigger className="w-max border-0 shadow-none text-base font-normal hover:bg-transparent" style={{outline: 'none', boxShadow: 'none', border: 'none'}} onFocus={(e) => e.target.style.outline = 'none'}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="text-base">
                              <SelectItem value="all" className="text-base hover:bg-transparent focus:bg-transparent">All</SelectItem>
                              <SelectItem value="push" className="text-base hover:bg-transparent focus:bg-transparent">Push</SelectItem>
                              <SelectItem value="mapping" className="text-base hover:bg-transparent focus:bg-transparent">Mapping</SelectItem>
                              <SelectItem value="delete-products" className="text-base hover:bg-transparent focus:bg-transparent">Delete products</SelectItem>
                              <SelectItem value="manually-update-price" className="text-base hover:bg-transparent focus:bg-transparent">Manually update price</SelectItem>
                              <SelectItem value="fulfill-orders-manually" className="text-base hover:bg-transparent focus:bg-transparent">Fulfill Orders Manually</SelectItem>
                              <SelectItem value="roll-back-orders" className="text-base hover:bg-transparent focus:bg-transparent">Roll Back Orders</SelectItem>
                              <SelectItem value="place-orders" className="text-base hover:bg-transparent focus:bg-transparent">Place Orders</SelectItem>
                              <SelectItem value="order-action-edit" className="text-base hover:bg-transparent focus:bg-transparent">Order Action Edit</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Retractable Search - Only show when not "All" */}
                          {selectedFilter !== "all" && (
                            <div className="flex items-center justify-end w-full h-12" ref={searchRef}>
                              {!isSearchExpanded ? (
                                <Button
                                  variant="ghost"
                                  onClick={() => setIsSearchExpanded(true)}
                                  className="flex items-center gap-3 px-4 py-3 bg-transparent hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="h-7 w-7 text-muted-foreground" style={{width: '28px', height: '28px'}} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
                                  </svg>
                                  <span className="text-base font-light">Search Activity</span>
                                </Button>
                              ) : (
                                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background shadow-sm pr-1 h-10">
                                  <Input 
                                    placeholder="Please enter the full product name"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="border-none flex-1 focus-visible:ring-0 rounded-none h-10"
                                    autoFocus
                                  />
                                  
                                  <Button 
                                    onClick={() => {
                                      console.log('Searching for:', searchValue, 'Filter:', selectedFilter);
                                      // Optionally collapse after search
                                      // setIsSearchExpanded(false);
                                    }}
                                    className="h-9 px-4"
                                  >
                                    OK
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Empty State */}
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <svg className="w-32 h-20 mb-2" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                              <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                              <g fillRule="nonzero">
                                <path fill="none" stroke="#d9d9d9" strokeWidth="1" d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                <path fill="#fafafa" stroke="#d9d9d9" strokeWidth="1" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
                              </g>
                            </g>
                          </svg>
                          <p className="text-lg font-normal text-muted-foreground">No data</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Notification Tab */}
            {activeTab === "notification" && (
              <div className="px-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
                    <p className="text-muted-foreground">
                      If you activate this feature, DShipIt will monitor out-of-stock products,price changes, supplier cancelled orders,product SKU changes and notifications will be sent to you DShipIt account.
                    </p>
                  </div>

                        <div className="space-y-6">
                          {/* Inventory Changes */}
                          <div className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm0-3H9V6h10v2z"></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium mb-1">Inventory changes</h3>
                              <p className="text-sm text-muted-foreground">
                                DShipIt will notify you when a supplier product you are mapping has the status "Product not found", "Product out of stock", or "Variants out of stock".
                              </p>
                            </div>
                            <Switch 
                              className="flex-shrink-0" 
                              checked={inventoryChangesEnabled}
                              onCheckedChange={(checked) => {
                                setInventoryChangesEnabled(checked);
                              }}
                            />
                          </div>

                          {/* Price Changes */}
                          <div className="border rounded-lg">
                            <div className="flex items-start gap-4 p-4">
                              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm22.3 665.2l.2 31.7c0 4.4-3.6 8.1-8 8.1h-28.4c-4.4 0-8-3.6-8-8v-31.4C401.3 723 359.5 672.4 355 617.4c-.4-4.7 3.3-8.7 8-8.7h46.2c3.9 0 7.3 2.8 7.9 6.6 5.1 31.7 29.8 55.4 74.1 61.3V533.9l-24.7-6.3c-52.3-12.5-102.1-45.1-102.1-112.7 0-72.9 55.4-112.1 126.2-119v-33c0-4.4 3.6-8 8-8h28.1c4.4 0 8 3.6 8 8v32.7c68.5 6.9 119.9 46.9 125.9 109.2.5 4.7-3.2 8.8-8 8.8h-44.9c-4 0-7.4-3-7.9-6.9-4-29.2-27.4-53-65.5-58.2v134.3l25.4 5.9c64.8 16 108.9 47 108.9 116.4 0 75.3-56 117.3-134.3 124.1zM426.6 410.3c0 25.4 15.7 45.1 49.5 57.3 4.7 1.9 9.4 3.4 15 5v-124c-36.9 4.7-64.5 25.4-64.5 61.7zm116.5 135.2c-2.8-.6-5.6-1.3-8.8-2.2V677c42.6-3.8 72-27.2 72-66.4 0-30.7-15.9-50.7-63.2-65.1z"></path>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-medium mb-1">Price changes</h3>
                                <p className="text-sm text-muted-foreground">
                                  When the product cost of the supplier you mapped has changed, DShipIt will notify you.
                                </p>
                              </div>
                              <Switch 
                                className="flex-shrink-0" 
                                checked={priceChangesEnabled}
                                onCheckedChange={handlePriceChangesToggle}
                              />
                            </div>
                            
                            <div className="px-4 pb-4">
                              <div className="ml-16">
                                <RadioGroup 
                                  defaultValue="any" 
                                  disabled={!priceChangesEnabled}
                                  value={priceThresholdOption}
                                  onValueChange={handlePriceThresholdChange}
                                >
                                  <div className="grid grid-cols-[1fr_auto_auto] gap-8 gap-y-2 items-center">
                                    {/* Row 1 */}
                                    <div className="text-sm font-medium">When your suppliers price</div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id="price-increase" 
                                        defaultChecked 
                                        disabled={!priceChangesEnabled}
                                        className={!priceChangesEnabled ? "" : ""}
                                      />
                                      <Label 
                                        htmlFor="price-increase" 
                                        className={`text-sm ${!priceChangesEnabled ? " cursor-not-allowed" : ""}`}
                                      >
                                        Increase
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id="price-decrease" 
                                        defaultChecked 
                                        disabled={!priceChangesEnabled}
                                        className={!priceChangesEnabled ? "" : ""}
                                      />
                                      <Label 
                                        htmlFor="price-decrease" 
                                        className={`text-sm ${!priceChangesEnabled ? " cursor-not-allowed" : ""}`}
                                      >
                                        Decrease
                                      </Label>
                                    </div>
                                    
                                    {/* Row 2 */}
                                    <div className="text-sm font-medium">When the price changes exceed</div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem 
                                        value="number" 
                                        id="number" 
                                        disabled={!priceChangesEnabled}
                                        className={!priceChangesEnabled ? "" : ""}
                                      />
                                      <div className="flex items-center gap-2">
                                        <Input 
                                          type="number" 
                                          defaultValue="10" 
                                          className={`w-16 h-8 ${!priceChangesEnabled || priceThresholdOption !== "number" ? "" : ""}`}
                                          disabled={!priceChangesEnabled || priceThresholdOption !== "number"}
                                        />
                                        <span className={`text-sm ${!priceChangesEnabled || priceThresholdOption !== "number" ? "" : ""}`}>%</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem 
                                        value="any" 
                                        id="any" 
                                        disabled={!priceChangesEnabled}
                                        className={!priceChangesEnabled ? "" : ""}
                                      />
                                      <Label 
                                        htmlFor="any" 
                                        className={`text-sm ${!priceChangesEnabled ? " cursor-not-allowed" : ""}`}
                                      >
                                        Any changes
                                      </Label>
                                    </div>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          </div>

                          {/* SKU Changes */}
                          <div className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.41 11.41l-8.83-8.83c-.37-.37-.88-.58-1.41-.58H4c-1.1 0-2 .9-2 2v7.17c0 .53.21 1.04.59 1.41l8.83 8.83c.78.78 2.05.78 2.83 0l7.17-7.17c.78-.78.78-2.04-.01-2.83zM6.5 8C5.67 8 5 7.33 5 6.5S5.67 5 6.5 5 8 5.67 8 6.5 7.33 8 6.5 8z"></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium mb-1">SKU changes</h3>
                              <p className="text-sm text-muted-foreground">
                                DShipIt will notify you when the supplier's product SKU name you are mapping changes or when an option is added, causing the mapping to fail.
                              </p>
                            </div>
                            <Switch 
                              className="flex-shrink-0" 
                              checked={skuChangesEnabled}
                              onCheckedChange={(checked) => {
                                setSkuChangesEnabled(checked);
                              }}
                            />
                          </div>

                          {/* Cancelled Order */}
                          <div className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-8 h-8 text-red-600" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="6" width="16" height="12" rx="2"></rect>
                                <path d="M4 10h16"></path>
                                <path d="M12 6v4"></path>
                                <circle cx="18" cy="16" r="3" fill="currentColor"></circle>
                                <path d="m16.5 14.5 3 3m-3 0 3-3" stroke="white" strokeWidth="1.5"></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium mb-1">Cancelled order</h3>
                              <p className="text-sm text-muted-foreground">
                                DShipIt will notify you when your purchase order is cancelled.
                              </p>
                            </div>
                            <Switch 
                              className="flex-shrink-0" 
                              checked={cancelledOrderEnabled}
                              onCheckedChange={(checked) => {
                                setCancelledOrderEnabled(checked);
                              }}
                            />
                          </div>

                          {/* AI Recommendation */}
                          <div className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium mb-1">AI recommendation</h3>
                              <p className="text-sm text-muted-foreground">
                                DShipIt AI assistant will recommend higher quality suppliers and cheaper products for you
                              </p>
                            </div>
                            <Switch 
                              className="flex-shrink-0" 
                              checked={aiRecommendationEnabled}
                              onCheckedChange={(checked) => {
                                setAiRecommendationEnabled(checked);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
            )}

            {/* Stores & Suppliers Tab */}
            {activeTab === "application" && !showAccountDetails && !showTemuAccountDetails && !showEbayAccountDetails && (
              <div className="px-6 pb-32">
                <div className="space-y-6 w-full">
                  {/* Header */}
                  <div className="mb-6 w-full">
                    <h3 className="text-2xl font-bold mb-2">Stores</h3>
                  </div>

                  {/* Sales Channel Accordion */}
                  <Accordion type="single" collapsible className="w-full border rounded-lg">
                    <AccordionItem value="ebay" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src="/ebayicon.jfif" 
                              alt="eBay" 
                              className="w-6 h-6"
                            />
                            <span className="text-lg font-normal">eBay</span>
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('https://signin.ebay.com/signin?ru=https%3A%2F%2Fauth2.ebay.com%2Foauth2%2Fconsents%3Fclient_id%3DDShipIt-dshipit-PRD-c5eb3929e-23da2e73%26redirect_uri%3Dhttps%253A%252F%252Febay-api-gw.dshipit.com%252Febay-auth-core%252Fv1%252Febay%252Fauth%252Fcode%26scope%3Dhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.marketing.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.marketing%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.inventory.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.inventory%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.account.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.account%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.fulfillment.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.fulfillment%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.analytics.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.finances%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.payment.dispute%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fcommerce.identity.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.reputation%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.reputation.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fcommerce.notification.subscription%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fcommerce.notification.subscription.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.stores%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fapi_scope%252Fsell.stores.readonly%2Bhttps%253A%252F%252Fapi.ebay.com%252Foauth%252Fscope%252Fsell.edelivery%26state%26response_type%3Dcode%26hd%26consentGiven%3Dfalse&sgfl=oauth2&AppName=DShipIt-dshipit-PRD-c5eb3929e-23da2e73', '_blank');
                            }}
                            className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="text-base">Add Stores</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 w-full">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 w-full">
                          <div className="flex-1">
                            <div className="space-y-2">
                              <div className="text-base font-normal">spiderco</div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>Store ID: 1943158761686171648</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="p-1 hover:bg-muted rounded">
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy ID</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full shadow-sm border border-green-200 font-medium">
                              Connected
                            </span>
                            <button
                              className="p-2 hover:bg-muted rounded"
                              onClick={() => setShowEbayAccountDetails(true)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Supplier Section */}
                  <div className="mb-6 w-full">
                    <h3 className="text-2xl font-bold mb-2">Suppliers</h3>
                  </div>

                  {/* Supplier Accordion */}
                  <Accordion type="single" collapsible defaultValue="aliexpress" className="w-full border rounded-lg">
                    <AccordionItem value="aliexpress" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src="/aliexpressproductsettingsIcon.png" 
                              alt="AliExpress" 
                              className="w-6 h-6"
                            />
                            <span className="text-lg font-normal">AliExpress</span>
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUpgradeDialog(true);
                            }}
                            className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="text-base">Add Accounts</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 w-full">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 w-full">
                          <div className="flex-1">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-base font-normal">newonlinestore247@gmail.com</span>
                                <Popover open={aliexpressPopoverOpen} onOpenChange={setAliexpressPopoverOpen}>
                                  <PopoverTrigger asChild>
                                    <button className="p-1 hover:bg-muted rounded">
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                                      </svg>
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[480px] p-0 z-[60]" align="start">
                                    <div className="flex flex-col">
                                      <div className="p-4 border-b flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-bold text-lg">EDIT</h4>
                                          <button
                                            onClick={() => setAliexpressPopoverOpen(false)}
                                            className="p-1 hover:bg-muted rounded"
                                          >
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z"></path>
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <div className="p-4 space-y-4">
                                        <p className="text-base font-light text-muted-foreground">
                                          You can set the default AliExpress account here, the system will automatically select the account for you when you place an order. There can only be one default account at a time.<br /><br />
                                          You can also add a note to easily identify your account and understand which account you are placing an order with. This note is only visible on DShipIt.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
                                          <Label className="text-base font-light md:pt-2">Set default</Label>
                                          <Select value={aliexpressDefault} onValueChange={setAliexpressDefault}>
                                            <SelectTrigger className="w-full">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                              <SelectItem value="YES">YES</SelectItem>
                                              <SelectItem value="NO">NO</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
                                          <Label className="text-base font-light md:pt-2">Add note</Label>
                                          <div className="space-y-1">
                                            <Textarea 
                                              value={aliexpressNote}
                                              onChange={(e) => setAliexpressNote(e.target.value)}
                                              placeholder="Add a note..."
                                              className="h-[76px] resize-none"
                                              maxLength={50}
                                            />
                                            <div className="text-xs text-muted-foreground text-right">
                                              {aliexpressNote.length} / 50
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex justify-start space-x-3 pt-2">
                                          <Button 
                                            variant="outline" 
                                            onClick={() => setAliexpressPopoverOpen(false)}
                                            className="text-base font-light px-6 py-2"
                                          >
                                            Cancel
                                          </Button>
                                          <Button 
                                            disabled={aliexpressNote.length === 0 && aliexpressDefault === "YES"}
                                            onClick={() => {
                                              // Save logic here
                                              setAliexpressPopoverOpen(false);
                                            }}
                                            className="text-base font-light px-6 py-2"
                                          >
                                            SAVE
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                au1252252939onue
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full cursor-default shadow-sm border border-blue-200 font-medium">
                                    Default
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center">
                                  <p className="text-sm leading-tight">
                                    This account will be used when you<br />
                                    place an order on Aliexpress
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full shadow-sm border border-green-200 font-medium">
                              Connected
                            </span>
                            <button
                              className="p-2 hover:bg-muted rounded"
                              onClick={() => setShowAccountDetails(true)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="temu" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src="/temuProductSettingsIcon.jfif" 
                              alt="Temu" 
                              className="w-6 h-6"
                            />
                            <span className="text-lg font-normal">Temu</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 w-full">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 w-full">
                          <div className="flex-1">
                            <div className="space-y-1">
                              <div>
                                <span className="text-base font-normal">filipop@gmail.com</span>
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                Your Temu account is your DShipIt account.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                              Connected
                            </span>
                            <button
                              className="p-2 hover:bg-muted rounded"
                              onClick={() => setShowTemuAccountDetails(true)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            )}

            {/* Account Details View */}
            {activeTab === "application" && showAccountDetails && (
              <div className="px-6 pb-32">
                <div className="space-y-6 w-full">
                  {/* Header with Back Button */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAccountDetails(false)}
                      className="p-1"
                    >
                      <ChevronLeft className="h-7 w-7" style={{ width: '1.75rem', height: '1.75rem' }} />
                    </Button>
                    <div className="flex-1">
                      <h2 className="font-semibold" style={{ fontSize: '1.3rem' }}>newonlinestore247@gmail.com</h2>
                      <p className="text-base leading-relaxed font-light" style={{ color: '#374151' }}>
                        Click{" "}
                        <a 
                          href="https://help.dshipit.com/check-aliexpress-account-email/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          here
                        </a>{" "}
                        to learn how to use the ID to find the AliExpress linked mailbox
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2 border-0 shadow-none"
                      onClick={() => setShowSwitchAccountDialog(true)}
                      style={{ 
                        color: 'rgb(22, 163, 74)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgb(22, 163, 74)';
                        e.currentTarget.style.backgroundColor = 'rgb(240, 253, 244)';
                        const svg = e.currentTarget.querySelector('svg');
                        if (svg) {
                          svg.style.color = 'rgb(22, 163, 74)';
                          svg.style.stroke = 'rgb(22, 163, 74)';
                          svg.style.fill = 'rgb(22, 163, 74)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(22, 163, 74)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                        const svg = e.currentTarget.querySelector('svg');
                        if (svg) {
                          svg.style.color = 'rgb(22, 163, 74)';
                          svg.style.stroke = 'rgb(22, 163, 74)';
                          svg.style.fill = 'rgb(22, 163, 74)';
                        }
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: 'rgb(22, 163, 74)' }}>
                        <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"></path>
                      </svg>
                      <span>Switch account</span>
                    </Button>
                  </div>

                  {/* Privacy Details Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Privacy Details</h3>
                      <p className="text-xl font-bold">What we access from your AliExpress account</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">Order Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-foreground" />
                              </div>
                              <span className="text-base font-bold">Contact Information</span>
                            </div>
                            <div className="ml-11 pl-[5px]">
                              <div className="text-[15px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Name</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Email address</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Phone number</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-foreground" />
                              </div>
                              <span className="text-base font-bold">Location</span>
                            </div>
                            <div className="ml-11 pl-[5px]">
                              <div className="text-[15px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Physical address</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Clipboard className="h-5 w-5 text-foreground" />
                              </div>
                              <span className="text-base font-bold">Message</span>
                            </div>
                            <div className="ml-11 pl-[5px]">
                              <div className="text-[15px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Store order note</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permission Details Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Permission Details</h3>
                      <p className="text-xl font-bold">What you can edit in your account</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-foreground" />
                          </div>
                          <span className="text-base font-bold">Edit Products</span>
                        </div>
                        <div className="ml-11 pl-[5px]">
                          <div className="text-[15px] text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Specification</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Overview</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Inventory</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Cost</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-foreground" />
                          </div>
                          <span className="text-base font-bold">Edit Order</span>
                        </div>
                        <div className="ml-11 pl-[5px]">
                          <div className="text-[15px] text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Supplier order number</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Tracking number</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Section */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-900 mb-2">Delete This Supplier</h3>
                      <p className="text-[15px] text-red-700">
                        If you uninstall this application, DShipIt will no longer send data to this application, 
                        and you will not be able to get the Tracking number generated by this application, unless you restart
                      </p>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <div className="flex justify-end">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-medium text-base px-5 py-2.5 rounded-md shadow-sm transition-colors">
                      <span className="tracking-wider">DELETE</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Temu Account Details View */}
            {activeTab === "application" && showTemuAccountDetails && (
              <div className="px-6 pb-32">
                <div className="space-y-6 w-full">
                  {/* Header with Back Button */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <svg 
                        stroke="currentColor" 
                        fill="none" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="cursor-pointer"
                        style={{ fontSize: '24px', minWidth: '24px', height: '1em', width: '1em' }}
                        onClick={() => setShowTemuAccountDetails(false)}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      <div>
                        <div className="text-2xl font-bold">Temu</div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Details Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Privacy Details</h3>
                      <p className="text-xl font-bold">What we access from your Temu account</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">Order Information</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-foreground" />
                              </div>
                              <span className="text-base font-bold">Contact Information</span>
                            </div>
                            <div className="ml-11 pl-[5px]">
                              <div className="text-[15px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Name</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Phone number</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permission Details Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Permission Details</h3>
                      <p className="text-xl font-bold">What you can edit in your account</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-foreground" />
                          </div>
                          <span className="text-base font-bold">Edit Products</span>
                        </div>
                        <div className="ml-11 pl-[5px]">
                          <div className="text-[15px] text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Specification</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Overview</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Inventory</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Cost</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-foreground" />
                          </div>
                          <span className="text-base font-bold">Edit Order</span>
                        </div>
                        <div className="ml-11 pl-[5px]">
                          <div className="text-[15px] text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Supplier order number</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Tracking number</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* eBay Account Details View */}
            {activeTab === "application" && showEbayAccountDetails && (
              <div className="px-6 pb-32">
                <div className="space-y-6 w-full">
                  {/* Header with Back Button */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <svg 
                        stroke="currentColor" 
                        fill="none" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="cursor-pointer"
                        style={{ fontSize: '24px', minWidth: '24px', height: '1em', width: '1em' }}
                        onClick={() => setShowEbayAccountDetails(false)}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      <div>
                        <div className="text-2xl font-bold">spiderco</div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Details Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Privacy Details</h3>
                      <p className="text-xl font-bold">What we access from your eBay account</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">Supplier Product Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-foreground" />
                              </div>
                              <span className="text-base font-bold">Product Information</span>
                            </div>
                            <div className="ml-11 pl-[5px]">
                              <div className="text-[15px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Product cost</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Shipping cost</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <ClipboardList className="h-5 w-5 text-foreground" />
                              </div>
                              <span className="text-base font-bold">Order Information</span>
                            </div>
                            <div className="ml-11 pl-[5px]">
                              <div className="text-[15px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3" />
                                  <span>Supplier order number</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permission Details Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Permission Details</h3>
                      <p className="text-xl font-bold">What you can edit in your account</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-foreground" />
                          </div>
                          <span className="text-base font-bold">Edit shipping information</span>
                        </div>
                        <div className="ml-11 pl-[5px]">
                          <div className="text-[15px] text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="h-3 w-3" />
                              <span>Tracking number</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Management Section */}
                  <div className="border rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[15px] text-muted-foreground mb-1">Store management</h3>
                      <p className="text-xl font-bold">What you can manage in your store</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-bold">Store Auto Login to DShipIt</h4>
                          <Switch
                            checked={isAutoLoginEnabled}
                            onCheckedChange={setIsAutoLoginEnabled}
                            className="h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:size-4 [&>span]:data-[state=checked]:translate-x-4 [&>span]:data-[state=unchecked]:translate-x-0"
                          />
                        </div>
                        <div className="text-[15px] text-muted-foreground">
                          <ul className="space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="mt-1.5 h-1 w-1 bg-current rounded-full flex-shrink-0"></span>
                              <span>Turning the switch on allows the store to automatically log in to DShipIt</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1.5 h-1 w-1 bg-current rounded-full flex-shrink-0"></span>
                              <span>turning the switch off prevents the store from automatically logging in to DShipIt</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-red-900 mb-1">Delete This Store</h4>
                          <p className="text-[15px] text-red-700">
                            If you uninstall this store, DShipIt will no longer send data to this store, 
                            and you will not be able to get the Tracking number generated by this store, unless you restart
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-medium text-base px-5 py-2.5 rounded-md shadow-sm transition-colors">
                          <span className="tracking-wider">DELETE</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Settings Tab */}
            {activeTab === "product" && (
              <div className="px-6 pb-32">
                <div className="space-y-6 w-full">
                  <div className="border rounded-lg p-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Use the supplier ID as product SKU</h3>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                        <p className="text-[15px] text-muted-foreground">After activation, when you import supplier products in the Import List, the SKU of the product will use the supplier product ID-variants name. <a href="https://help.dshipit.com/optimize-product-sku/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Click here</a> to learn more.</p>
                        <div>
                          <Switch
                            checked={useSupplierIdAsSku}
                            onCheckedChange={setUseSupplierIdAsSku}
                            className="h-5 w-9 data-[state=checked]:bg-primary data-[state-unchecked]:bg-input [&>span]:size-4 [&>span]:data-[state=checked]:translate-x-4 [&>span]:data-[state=unchecked]:translate-x-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Push Products Accordion */}
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="push-products" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          Push products
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-8">
                            {/* Send product information section */}
                            <div className="space-y-2">
                              <div>
                                <h3 className="text-[15px] text-muted-foreground font-bold mb-1">Send Product Information to Store</h3>
                                <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-6 ml-4">
                                  <span>Applicable Platform:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img
                                        src="/ebayicon.jfif"
                                        alt="eBay"
                                        className="w-6 h-6 cursor-pointer"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-base">eBay</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">When pushing products, you want DShipIt to:</p>
                                <RadioGroup value={pushProductOption} onValueChange={handlePushProductOptionChange} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="SendCostAbleProductCostToShopify" id="product-cost" className="border-2" />
                                    <Label htmlFor="product-cost" className="flex items-center gap-2 text-[15px] text-muted-foreground font-normal cursor-pointer">
                                      Send product cost to Store
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-base">
                                            <p>Send supplier's cost price to your store</p>
                                            <p>when pushing products</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="SendCostAbleProductAndShippingCostToShopify" id="product-shipping-cost" className="border-2" />
                                    <Label htmlFor="product-shipping-cost" className="flex items-center gap-2 text-[15px] text-muted-foreground font-normal cursor-pointer">
                                      Send product and shipping cost to Store
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-64">
                                          <div className="text-base">
                                            <p>Send supplier item cost plus shipping cost [from your pricing rule] to your store. Click <a href="#" className="text-blue-500 underline">here</a> to learn more</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>

                            {/* Customize product description section */}
                            <div className="space-y-2">
                              <div>
                                <h3 className="text-[15px] text-muted-foreground font-bold mb-1">Customize Product Description</h3>
                                <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-6 ml-4">
                                  <span>Applicable Platform:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img
                                        src="/ebayicon.jfif"
                                        alt="eBay"
                                        className="w-6 h-6 cursor-pointer"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-base">eBay</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">When pushing products, you want DShipIt to:</p>
                                <RadioGroup value={productDescriptionOption} onValueChange={setProductDescriptionOption} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="CustomProdDescSpecAndOverview" id="spec-overview" className="border-2" />
                                    <Label htmlFor="spec-overview" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Push both SPECIFICATIONS & OVERVIEW</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="CustomProdDescSpecOnly" id="spec-only" className="border-2" />
                                    <Label htmlFor="spec-only" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Only push products' SPECIFICATIONS</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="CustomProdDescOverviewOnly" id="overview-only" className="border-2" />
                                    <Label htmlFor="overview-only" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Only push products' OVERVIEW</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="product-settings" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          Product
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                              <div>
                                <h3 className="text-[15px] text-muted-foreground font-bold mb-1">Set Products as Taxable</h3>
                                <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-2 ml-4">
                                  <span>Applicable Platform:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img
                                        src="/ebayicon.jfif"
                                        alt="eBay"
                                        className="w-6 h-6 cursor-pointer"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-base">eBay</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-[15px] text-muted-foreground mb-2 ml-4">Specifies whether or not a tax is charged when the product variant is sold.</p>
                              </div>
                              <div>
                                <Switch
                                  checked={setProductsTaxable}
                                  onCheckedChange={setSetProductsTaxable}
                                  className="h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:size-4 [&>span]:data-[state=checked]:translate-x-4 [&>span]:data-[state=unchecked]:translate-x-0"
                                />
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Multilingual Product Accordion */}
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full" value={multilingualAccordionValue} onValueChange={setMultilingualAccordionValue}>
                      <AccordionItem value="multilingual-product" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          Multilingual product
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div>
                            <h3 className="text-[15px] text-muted-foreground font-bold mb-1">Multilingual Product</h3>
                            <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-2 ml-4">
                              <span>Applicable Platform:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img
                                    src="/aliexpressproductsettingsIcon.png"
                                    alt="AliExpress"
                                    className="w-5 h-5 cursor-pointer"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-base">AliExpress</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-[15px] text-muted-foreground mb-6 ml-4">
                              Set your imported product's multilingual here, click <a href="#" className="text-blue-500 underline">here</a> to learn more.
                            </p>

                            <div className="grid grid-cols-3 gap-6 ml-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="english" checked disabled className="opacity-50 cursor-not-allowed" />
                                <Label htmlFor="english" className="text-[15px] font-normal text-muted-foreground cursor-not-allowed">English</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="french" checked={frenchEnabled} onCheckedChange={(checked) => setFrenchEnabled(checked === true)} />
                                <Label htmlFor="french" className="text-[15px] font-normal cursor-pointer">Français</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="portuguese" checked={portugueseEnabled} onCheckedChange={(checked) => setPortugueseEnabled(checked === true)} />
                                <Label htmlFor="portuguese" className="text-[15px] font-normal cursor-pointer">Português</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="german" checked={germanEnabled} onCheckedChange={(checked) => setGermanEnabled(checked === true)} />
                                <Label htmlFor="german" className="text-[15px] font-normal cursor-pointer">Deutsch</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="italian" checked={italianEnabled} onCheckedChange={(checked) => setItalianEnabled(checked === true)} />
                                <Label htmlFor="italian" className="text-[15px] font-normal cursor-pointer">Italiano</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="spanish" checked={spanishEnabled} onCheckedChange={(checked) => setSpanishEnabled(checked === true)} />
                                <Label htmlFor="spanish" className="text-[15px] font-normal cursor-pointer">Español</Label>
                              </div>
                            </div>
                            <div className="flex justify-end mt-6">
                              <Button
                                onClick={() => {
                                  if (frenchEnabled || portugueseEnabled || germanEnabled || italianEnabled || spanishEnabled) {
                                    setShowUpgradeDialog(true);
                                  }
                                }}
                              >
                                SAVE
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Automatic Inventory Update Accordion */}
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="automatic-inventory" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          Automatic Inventory Update
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div>
                            <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-2 ml-4">
                              <span>Applicable Platform:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/aliexpressproductsettingsIcon.png" alt="AliExpress" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">AliExpress</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/temuProductSettingsIcon.jfif" alt="Temu" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">Temu</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/1688ProductSettingsIcon.jfif" alt="Alibaba" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">Alibaba</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/ebayicon.jfif" alt="eBay" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">eBay</p></TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-[15px] text-muted-foreground mb-6 ml-4">
                              The updates won't be applied to multi-supplier products like Advanced, BOGO or Bundle mapping
                              <Tooltip>
                                <TooltipTrigger>
                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer ml-1 inline-block" style={{verticalAlign: '-0.1em'}}>
                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80" sideOffset={8}>
                                  <div className="text-base">
                                    <ol className="list-decimal pl-4 space-y-2">
                                      <li>When synchronizing product inventory in Shopify, DShipIt syncs product inventory only for locations set to "dshipit-fulfillment-service," "Shop location," or manually created locations. Please go to Shopify to set the product location to them.</li>
                                      <li>Some options may not be available for all platforms, please refer to the blog for details. Click <a href="#" className="text-blue-500 underline">here</a> to learn more.</li>
                                    </ol>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </p>

                            <div className="space-y-6">
                              {/* When product is out of stock */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">When a product is out of stock or no longer available, you want DShipIt to:</p>
                                <RadioGroup value={inventoryProductOption} onValueChange={handleInventoryProductOptionChange} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="AutoSyncInventoryProductInvalidDoNothing" id="product-nothing" />
                                    <Label htmlFor="product-nothing" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Do Nothing</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="AutoSyncInventoryProductInvalidDoDraft" id="product-draft" />
                                    <Label htmlFor="product-draft" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Set as draft</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="AutoSyncInventoryProductInvalidDoZero" id="product-zero" />
                                    <Label htmlFor="product-zero" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Set quantity to zero on store</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* When variant is out of stock */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">When a variant is out of stock, you want DShipIt to:</p>
                                <RadioGroup value={inventoryVariantOption} onValueChange={handleInventoryVariantOptionChange} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="AutoSyncInventoryVariantInvalidDoNothing" id="variant-nothing" />
                                    <Label htmlFor="variant-nothing" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Do Nothing</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="AutoSyncInventoryVariantInvalidDoRemove" id="variant-remove" />
                                    <Label htmlFor="variant-remove" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Remove Variant</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="AutoSyncInventoryVariantInvalidDoZero" id="variant-zero" />
                                    <Label htmlFor="variant-zero" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Set quantity to zero on store</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* When variant mapping lost */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">When variant mapping is lost, you want DShipIt to:</p>
                                <RadioGroup value={inventoryMappingOption} onValueChange={handleInventoryMappingOptionChange} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="DoNothing" id="mapping-nothing" />
                                    <Label htmlFor="mapping-nothing" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Do Nothing</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="QuantityToZero" id="mapping-zero" />
                                    <Label htmlFor="mapping-zero" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Set quantity to zero on store</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* When variant inventory changes */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">When a variant's inventory is above zero, DShipIt will:</p>
                                <RadioGroup value={inventoryAboveZeroOption} onValueChange={handleInventoryAboveZeroOptionChange} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="NotifyOutStockNothing" id="inventory-nothing" />
                                    <Label htmlFor="inventory-nothing" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Do Nothing</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="NotifyOutStockSync" id="inventory-sync" />
                                    <Label htmlFor="inventory-sync" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Update to store Automatically</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Automatic Price Update Accordion */}
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="automatic-price" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          Automatic Price Update
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div>
                            <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-2 ml-4">
                              <span>Applicable Platform:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/aliexpressproductsettingsIcon.png" alt="AliExpress" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">AliExpress</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/temuProductSettingsIcon.jfif" alt="Temu" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">Temu</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/1688ProductSettingsIcon.jfif" alt="Alibaba" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">Alibaba</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/ebayicon.jfif" alt="eBay" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">eBay</p></TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-[15px] text-muted-foreground mb-6 ml-4">
                              With automatic updates turned ON, DShipIt syncs product prices to your store based on your pricing rules.
                              <Tooltip>
                                <TooltipTrigger>
                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer ml-1 inline-block" style={{verticalAlign: '-0.1em'}}>
                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80" sideOffset={8}>
                                  <div className="text-base">
                                    <p>NOTE: Pricing Rules must be enabled.</p>
                                    <p className="mt-2">Store prices are updated based on your rules for products ordered or viewed in the last 10 days.</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </p>

                            <div className="space-y-6">
                              {/* You want DShipIt to */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">You want DShipIt to:</p>
                                <RadioGroup value={automaticPriceUpdateOption} onValueChange={handleAutomaticPriceUpdateOptionChange} className="space-y-0 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="PriceTypeDoNothing" id="price-nothing" />
                                    <Label htmlFor="price-nothing" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Do Nothing</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="PriceTypeBoth" id="price-both" />
                                    <Label htmlFor="price-both" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Update Price and Compared-At Price to Store</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="PriceTypeOnly" id="price-only" />
                                    <Label htmlFor="price-only" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Update Price to Store</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="PriceTypePriceAndCost" id="price-cost" />
                                    <Label htmlFor="price-cost" className="flex items-center gap-2 text-[15px] text-muted-foreground font-normal cursor-pointer">
                                      Update Price, Compared-At Price and Cost to Store
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-60">
                                          <p className="text-base">For some stores, product info may not include a cost, in which case updating the cost will be ignored.</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* When your supplier's price */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">Apply the above action when your Suppliers' Prices:</p>
                                <div className="ml-4 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="price-increase" checked={priceIncreaseChecked} onClick={handlePriceChangeCheckboxClick} />
                                    <Label htmlFor="price-increase" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Increase</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="price-decrease" checked={priceDecreaseChecked} onClick={handlePriceChangeCheckboxClick} />
                                    <Label htmlFor="price-decrease" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Decrease</Label>
                                  </div>
                                </div>
                              </div>

                              {/* And the price's change exceeds */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">And the price change exceeds:</p>
                                <RadioGroup value={priceChangeThresholdOption} onValueChange={handlePriceChangeThresholdOptionChange} className="space-y-2 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="number" id="change-number" />
                                    <Label htmlFor="change-number" className="flex items-center gap-2 text-[15px] text-muted-foreground font-normal cursor-pointer">
                                      <Input
                                        type="number"
                                        value={priceChangePercentage}
                                        onChange={(e) => setPriceChangePercentage(Number(e.target.value))}
                                        className="w-20 h-8"
                                        step="1"
                                        min="-100"
                                      />
                                      <span>%</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="any" id="change-any" />
                                    <Label htmlFor="change-any" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Any changes</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Manually Change Store Products Price Accordion */}
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="manually-change-price" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span>Manually change store product prices once in 30 days</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                  <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-60">
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Used:</span>
                                    <span>{getManualPriceUpdateStats().usedTimes}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Remaining:</span>
                                    <span>{getManualPriceUpdateStats().remainingTimes}</span>
                                  </div>
                                  <div className="border-t pt-1 mt-2">
                                    <div className="flex justify-between">
                                      <span>Total:</span>
                                      <span>{getManualPriceUpdateStats().totalTimes}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Resets on</span>
                                    <span className="ml-2">{getManualPriceUpdateStats().refreshDate}</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div>
                            <div className="flex items-center gap-2 text-[15px] text-muted-foreground mb-2 ml-4">
                              <span>Applicable Platform:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/aliexpressproductsettingsIcon.png" alt="AliExpress" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">AliExpress</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/temuProductSettingsIcon.jfif" alt="Temu" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">Temu</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/1688ProductSettingsIcon.jfif" alt="Alibaba" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">Alibaba</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/ebayicon.jfif" alt="eBay" className="w-5 h-5 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent><p className="text-base">eBay</p></TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-[15px] text-muted-foreground mb-6 ml-4">
                              Update the price and cost of products in your store according to your current pricing rules. This process may take some time and can be done once every 30 days.
                            </p>

                            <div className="ml-4">
                              <div className="border rounded-lg p-4 bg-muted/50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <Checkbox
                                            id="spiderco-store"
                                            disabled // Disabled because this store has no products
                                            checked={selectedStoresForPriceUpdate.includes("spiderco")}
                                            onCheckedChange={(checked) => handleStoreSelectionForPriceUpdate("spiderco", checked === true)}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-base">This store has no products</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <div className="flex items-center gap-2">
                                      <img src="/ebayicon.jfif" alt="eBay" className="w-5 h-5" />
                                      <span className="text-[15px] font-medium">spiderco</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex justify-end">
                                <Button
                                  disabled={selectedStoresForPriceUpdate.length === 0 || getManualPriceUpdateStats().remainingTimes === 0}
                                  onClick={() => {
                                    // Handle start update logic here
                                    console.log('Start update clicked for stores:', selectedStoresForPriceUpdate);
                                  }}
                                >
                                  START UPDATE
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Product Migration Accordion */}
                  <div className="border rounded-lg">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="product-migration" className="border-none">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                          Product migration
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div>
                            <p className="text-[15px] text-muted-foreground mb-6 ml-4">
                              Migrate products and mapping data from store A to store B in "My products".
                              <Tooltip>
                                <TooltipTrigger>
                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer ml-1 inline-block" style={{verticalAlign: '-0.1em'}}>
                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                  </svg>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-60">
                                  <p className="text-base">If the product already exists in the target store, it will not be migrated</p>
                                </TooltipContent>
                              </Tooltip>
                            </p>

                            <div className="space-y-6 ml-4">
                              {/* Migration Type */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">
                                  Migration type:
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer ml-1 inline-block" style={{verticalAlign: '-0.1em'}}>
                                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                      </svg>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-base">For other needs, please <a href="#" className="text-primary hover:underline">contact support</a></p>
                                    </TooltipContent>
                                  </Tooltip>
                                </p>
                                <RadioGroup defaultValue="1" className="space-y-2 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="1" id="same-account" />
                                    <Label htmlFor="same-account" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Same account migration</Label>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="2" id="different-account" />
                                    <Label htmlFor="different-account" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Different account migration</Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* Source Store */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">Source Store</p>
                                <Select>
                                  <SelectTrigger className="w-full ml-4 h-10 text-base data-[placeholder]:text-muted-foreground">
                                    <SelectValue placeholder="Please select a store" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableStores.length > 0 ? (
                                      availableStores.map((store) => (
                                        <SelectItem key={store} value={store}>{store}</SelectItem>
                                      ))
                                    ) : (
                                      <div className="p-8 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                          <svg className="w-16 h-10 mb-2" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                              <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                              <g fillRule="nonzero">
                                                <path fill="none" stroke="#d9d9d9" strokeWidth="1" d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                                <path fill="#fafafa" stroke="#d9d9d9" strokeWidth="1" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
                                              </g>
                                            </g>
                                          </svg>
                                          <div className="text-sm">No data</div>
                                        </div>
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Target Store */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">Target Store</p>
                                <Select>
                                  <SelectTrigger className="w-full ml-4 h-10 text-base data-[placeholder]:text-muted-foreground">
                                    <SelectValue placeholder="Please select a store" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableStores.length > 0 ? (
                                      availableStores.map((store) => (
                                        <SelectItem key={store} value={store}>{store}</SelectItem>
                                      ))
                                    ) : (
                                      <div className="p-8 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                          <svg className="w-16 h-10 mb-2" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                              <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                              <g fillRule="nonzero">
                                                <path fill="none" stroke="#d9d9d9" strokeWidth="1" d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                                <path fill="#fafafa" stroke="#d9d9d9" strokeWidth="1" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
                                              </g>
                                            </g>
                                          </svg>
                                          <div className="text-sm">No data</div>
                                        </div>
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Migration Mode */}
                              <div>
                                <p className="text-[15px] text-muted-foreground font-bold mb-2">Migration mode:</p>
                                <div className="ml-4 space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="migrate-products" defaultChecked />
                                    <Label htmlFor="migrate-products" className="text-[15px] text-muted-foreground font-normal cursor-pointer">Migrating products</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="migrate-mapping" defaultChecked />
                                    <Label htmlFor="migrate-mapping" className="flex items-center gap-2 text-[15px] text-muted-foreground font-normal cursor-pointer">
                                      Migrate mapping relationships
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-72">
                                          <p className="text-base">Enabling this option will also migrate the products' mapping relationships</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Label>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center justify-between ml-4">
                                <span className="text-[15px] text-muted-foreground">Remaining times: 0</span>
                                <Button disabled className="uppercase">
                                  Start migration
                                </Button>
                              </div>

                              {/* Migration History Table */}
                              <div className="ml-4 mt-6">
                                <div className="border rounded-lg">
                                  <div className="grid grid-cols-5 bg-muted/50 border-b">
                                    <div className="p-3 text-center text-[15px] font-medium">Task start time</div>
                                    <div className="p-3 text-center text-[15px] font-medium">Source store</div>
                                    <div className="p-3 text-center text-[15px] font-medium">Target store</div>
                                    <div className="p-3 text-center text-[15px] font-medium">Schedule</div>
                                    <div className="p-3 text-center text-[15px] font-medium">Status</div>
                                  </div>
                                  <div className="p-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center">
                                      <svg className="w-32 h-20 mb-2" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                          <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                          <g fillRule="nonzero">
                                            <path fill="none" stroke="#d9d9d9" strokeWidth="1" d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                            <path fill="#fafafa" stroke="#d9d9d9" strokeWidth="1" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
                                          </g>
                                        </g>
                                      </svg>
                                      <div className="text-[15px]">No data</div>
                                    </div>
                                  </div>
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
            )}

            {/* Pricing & Currencies Tab */}
            {activeTab === "pricing" && (
              <div className="px-6 pb-32">
                <div className="space-y-6 w-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Pricing & Currencies</h2>
                    <p className="text-muted-foreground">
                      In Pricing Management, you can set the Currency and Pricing Rule for each of your stores to help you price your products.
                    </p>
                  </div>

                  {/* Main Content */}
                  <div>
                    <Tabs defaultValue="pricing-templates" className="w-full">
                      <TabsList className="w-fit mb-6 bg-transparent p-0 h-auto">
                        <TabsTrigger
                          value="pricing-templates"
                          className="text-base font-medium px-5 py-2 rounded-3xl data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:border data-[state=inactive]:border-muted-foreground/25 hover:bg-muted/50 hover:text-foreground transition-colors"
                        >
                          Pricing Templates
                        </TabsTrigger>
                        <TabsTrigger
                          value="assign-cents"
                          className="text-base font-medium px-5 py-2 rounded-3xl data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:border data-[state=inactive]:border-muted-foreground/25 hover:bg-muted/50 hover:text-foreground transition-colors ml-2"
                        >
                          Assign Cents
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="pricing-templates" className="space-y-6">
                        {/* Pricing Templates Description */}
                        <div>
                          <p className="text-[15px] text-muted-foreground">
                            Pricing Templates let you set the prices for the products easily. Select the store to which you want to apply the templates. View and check the Pricing Rule details to further customize the prices of your products.
                          </p>
                        </div>

                        {/* Store and Currency Section */}
                        <div className="space-y-6">
                          {/* Store List */}
                          <div className="border rounded-lg p-4">
                            <div className="storeList">
                              <div className="storeListName">
                                <p className="shopName flex items-center gap-2">
                                  <img
                                    src="/ebayicon.jfif"
                                    alt=""
                                    className="w-6 h-6"
                                  />
                                  <span className="storeName font-normal">spiderco</span>
                                </p>
                              </div>
                            </div>
                            <div className="border-b border-border my-4"></div>

                            <div className="selectCountryWrap flex items-center justify-between ml-4">
                              <div className="selectCountryTitle font-medium text-lg">Store Currency</div>
                              <div className="storeListSelect">
                                <div className="relative">
                                  <Input
                                    disabled
                                    value={isCurrencyLoading ? "..." : currency}
                                    placeholder="Detecting currency..."
                                    className="w-[136px] syncbordercolor pr-8"
                                  />
                                  <div className="questTips absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span role="img" aria-label="question-circle" className="anticon anticon-question-circle">
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="text-muted-foreground">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">
                                        <p>
                                          {isCurrencyLoading
                                            ? "Detecting your currency based on location..."
                                            : isManualOverride
                                              ? `Currency manually set to ${currency}. Contact customer support to change.`
                                              : `Currency auto-detected as ${currency} based on your location${locationData ? ` (${locationData.country})` : ''}. Contact customer support to change.`
                                          }
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="exchangeRate mt-4 font-bold ml-8 text-base">Turn ON Exchange Rate Conversion</div>

                            <div className="ant-space-item ml-8 mt-3">
                              <RadioGroup defaultValue="false" onValueChange={(value) => setExchangeRateManual(value === "true")}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="false" id="exchange-auto" />
                                  <div className="text-base font-normal flex items-center gap-2">
                                    Exchange rates using the exchange rate interface： 1 USD = {isCurrencyLoading ? "..." : "1.50128"}{currency}
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span role="img" aria-label="question-circle" className="anticon anticon-question-circle quest">
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="text-muted-foreground">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs text-sm">
                                        <p>This feature uses the default exchange rate interface for automatic currency conversion.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <RadioGroupItem value="true" id="exchange-manual" />
                                  <div className="text-base font-normal flex items-center gap-2">
                                    Exchange Rate ：1 USD  =
                                    <span className="exchangeRateNum">
                                      <IncrementButton
                                        value={exchangeRate}
                                        onChange={setExchangeRate}
                                        min={0}
                                        step={1}
                                        showDecimals={true}
                                        decimalPlaces={2}
                                        width="w-20"
                                        height="h-8"
                                        disabled={!exchangeRateManual}
                                      />
                                    </span>
                                    <span className={`authCurrency ${!exchangeRateManual ? 'text-muted-foreground' : ''}`}>{currency}</span>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span role="img" aria-label="question-circle" className="anticon anticon-question-circle quest">
                                          <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="text-muted-foreground">
                                            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                          </svg>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs text-sm">
                                        <p>This feature supports modifying the exchange rate conversion value of the currently selected currency and applying it to your sales products.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* Horizontal Divider */}
                            <div className="border-b border-border my-4 ml-8 mr-8"></div>

                            {/* Pricing Rule Accordion */}
                            {/* Custom Pricing Rule Header */}
                            <div className="ml-4 mr-4">
                              <div className="flex items-center justify-between py-4 px-0">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                  if (pricingRuleEnabled) {
                                    setPricingRuleEnabled(false);
                                  }
                                }}>
                                  <span className="text-lg font-medium">Pricing Rule</span>
                                  <svg
                                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${pricingRuleEnabled ? 'rotate-90' : ''}`}
                                    viewBox="0 0 24 24"
                                    focusable="false"
                                    fill="currentColor"
                                  >
                                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
                                  </svg>
                                </div>
                                <div className="flex items-center gap-12">
                                  {!hasPricingChanges && (
                                    <span
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowPricingRuleDialog(true);
                                      }}
                                      className="text-base text-muted-foreground font-normal hover:text-foreground cursor-pointer underline-offset-2 hover:underline"
                                    >
                                      Use for other ranges
                                    </span>
                                  )}
                                  {hasPricingChanges ? (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSavePricingChanges();
                                      }}
                                      className="px-6 py-2"
                                    >
                                      Save
                                    </Button>
                                  ) : (
                                    <Switch
                                      checked={pricingRuleEnabled}
                                      onCheckedChange={(checked) => {
                                        setPricingRuleEnabled(checked);
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Pricing Rule Content */}
                            {pricingRuleEnabled && (
                              <div className="ml-4 mr-4">
                                <div className="pl-4 pr-6 pb-6">
                                  <div className="space-y-6">
                                    <RadioGroup value={pricingRuleType} onValueChange={setPricingRuleType} className="space-y-4">
                                      {/* Basic pricing rule - All inline */}
                                      <div className="w-full">
                                        <Label htmlFor="basic-pricing" className="flex items-center cursor-pointer w-full">
                                          <div className="flex items-center space-x-3 w-full">
                                            <RadioGroupItem value="PricingRankBasic" id="basic-pricing" />
                                            <span className="text-base font-medium">Basic Pricing Rule</span>
                                            <span className="text-sm text-muted-foreground">
                                              Click{" "}
                                              <a
                                                href="/help/basic-pricing-rule"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                here
                                              </a>
                                              {" "}to get more information.
                                            </span>
                                          </div>
                                        </Label>

                                        {/* Basic Pricing Calculation */}
                                        {pricingRuleType === "PricingRankBasic" && (
                                          <div className="ml-8 mt-4 pr-6 grid grid-cols-[auto_auto_auto_auto_1fr] gap-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <Select value={basicPricingCost} onValueChange={setBasicPricingCost}>
                                                <SelectTrigger className="w-36 h-8 text-sm" style={{height: '32px'}}>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="Product Cost">Product Cost</SelectItem>
                                                  <SelectItem value="Total Cost">Total Cost</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <span className="text-base font-normal text-foreground">({currency})</span>
                                            </div>

                                            <Select value={basicPricingPattern} onValueChange={setBasicPricingPattern}>
                                              <SelectTrigger className="w-16 h-8 text-sm" style={{height: '32px'}}>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="+">+</SelectItem>
                                                <SelectItem value="*">×</SelectItem>
                                              </SelectContent>
                                            </Select>

                                            <IncrementButton
                                              value={basicPricingValue}
                                              onChange={setBasicPricingValue}
                                              min={0}
                                              step={1}
                                              showDecimals={false}
                                              width="w-20"
                                              height="h-8"
                                            />

                                            <div className="flex items-center gap-1">
                                              <span className="text-base text-muted-foreground">= Price</span>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true" className="text-muted-foreground">
                                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                                  </svg>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                  <p>E.g. The price of product costing 10 {currency} will be set at 12 or 20 {currency} (if you add 2 to cost, or multiply it by 2)</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>

                                            <div></div>
                                          </div>
                                        )}

                                        {/* Compared Pricing Section */}
                                        {pricingRuleType === "PricingRankBasic" && (
                                          comparedPricingEnabled ? (
                                            <div className="ml-6 mt-4 pr-6 grid grid-cols-[auto_auto_auto_auto_1fr] gap-3 items-center">
                                              <div className="flex items-center gap-1">
                                                <Select value={comparedPricingCost} onValueChange={setComparedPricingCost}>
                                                  <SelectTrigger className="w-36 h-8 text-sm" style={{height: '32px'}}>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="Product Cost">Product Cost</SelectItem>
                                                    <SelectItem value="Total Cost">Total Cost</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                <span className="text-base font-normal text-foreground">({currency})</span>
                                              </div>

                                              <Select value={comparedPricingPattern} onValueChange={setComparedPricingPattern}>
                                                <SelectTrigger className="w-16 h-8 text-sm" style={{height: '32px'}}>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="+">+</SelectItem>
                                                  <SelectItem value="*">×</SelectItem>
                                                </SelectContent>
                                              </Select>

                                              <IncrementButton
                                                value={comparedPricingValue}
                                                onChange={setComparedPricingValue}
                                                min={0}
                                                step={1}
                                                showDecimals={false}
                                                width="w-20"
                                                height="h-8"
                                              />

                                              <div className="flex items-center gap-1">
                                                <span className="text-base text-muted-foreground">= Compared at Price</span>
                                                <Tooltip>
                                                  <TooltipTrigger>
                                                    <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true" className="text-muted-foreground">
                                                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                                      <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                                    </svg>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="max-w-xs text-sm">
                                                    <p>Example: For Shopify, a $10 product can show a compared price of $15 (add $5) or $50 (×5). If not selected, the compared price will be blank when products are pushed to the store.</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </div>

                                              <div className="justify-self-end">
                                                <Switch
                                                  checked={comparedPricingEnabled}
                                                  onCheckedChange={setComparedPricingEnabled}
                                                />
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="ml-6 mt-4 pr-6 flex items-center justify-between py-2">
                                              <span className="text-base font-normal text-foreground">Set your compared at pricing rules</span>
                                              <Switch
                                                checked={comparedPricingEnabled}
                                                onCheckedChange={setComparedPricingEnabled}
                                              />
                                            </div>
                                          )
                                        )}
                                      </div>

                                      {/* Standard pricing rule - All inline */}
                                      <div className="w-full">
                                        <Label htmlFor="standard-pricing" className="flex items-center cursor-pointer w-full">
                                          <div className="flex items-center space-x-3 w-full">
                                            <RadioGroupItem value="PricingRankStandard" id="standard-pricing" />
                                            <span className="text-base font-medium">Standard Pricing Rule</span>
                                            <span className="text-sm text-muted-foreground">
                                              Click{" "}
                                              <a
                                                href="/help/standard-pricing-rule"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                here
                                              </a>
                                              {" "}to get more information.
                                            </span>
                                          </div>
                                        </Label>

                                        {/* Standard Pricing Rule Content */}
                                        {pricingRuleType === "PricingRankStandard" && (
                                          <div className="ml-8 mt-4 space-y-4">
                                            {/* Header Row - New simplified structure */}
                                            <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-6 pb-2 mb-2 border-b border-border">
                                                {/* Column 1: Product Cost/Total Cost select and text */}
                                                <div className="flex items-center gap-1">
                                                  <Select value="Product Cost">
                                                    <SelectTrigger className="w-40 !h-8 !min-h-8 !max-h-8 text-sm">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="Product Cost">Product Cost</SelectItem>
                                                      <SelectItem value="Total Cost">Total Cost</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <span className="text-base font-normal text-foreground">({currency})</span>
                                                </div>
                                                {/* Column 2: Price heading */}
                                                <div className="flex items-center gap-1">
                                                  <span className="font-normal text-base">Price</span>
                                                </div>
                                                {/* Column 3: Checkbox, "Compared at Price" text and tooltip */}
                                                <div className="flex items-center gap-1.5" style={{boxSizing: 'border-box'}}>
                                                  <Checkbox
                                                    className="w-4 h-4 flex-shrink-0 m-0 p-0"
                                                    checked={mainComparedPriceChecked}
                                                    onCheckedChange={(checked) => {
                                                      const isChecked = checked === true;
                                                      setMainComparedPriceChecked(isChecked);
                                                      // Tick/untick all row checkboxes based on main checkbox
                                                      setRow2Checked(isChecked);
                                                      setRow3Checked(isChecked);
                                                      setRow4Checked(isChecked);
                                                      // Also update dynamic rows
                                                      if (dynamicRows.length > 0) {
                                                        const updatedRows = dynamicRows.map(row => ({
                                                          ...row,
                                                          checkboxChecked: isChecked
                                                        }));
                                                        setDynamicRows(updatedRows);
                                                      }
                                                    }}
                                                  />
                                                  <span className="font-normal text-base">Compared at Price</span>
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-muted-foreground cursor-pointer">
                                                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                                        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                                                      </svg>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-48">
                                                      <p>If this option is not selected, no compared price will be set when products are pushed to your store.</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </div>
                                                {/* Column 4: Empty */}
                                                <div></div>
                                            </div>

                                            {/* Pricing Range Rows */}
                                            {/* Row 2: Range 1 - Conditionally rendered */}
                                            {range1Visible && (
                                            <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-1">
                                                {/* Column 1: Two increment buttons */}
                                                <div className="flex items-center gap-1">
                                                  <IncrementButton
                                                    value={standardRange1Start}
                                                    onChange={(value) => {
                                                      setStandardRange1Start(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                  <span className="text-muted-foreground text-sm">-</span>
                                                  <IncrementButton
                                                    value={standardRange1End}
                                                    onChange={(value) => {
                                                      setStandardRange1End(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                    placeholder="∞"
                                                  />
                                                </div>
                                                {/* Column 2: Operations dropdown and counter box inline */}
                                                <div className="flex items-center gap-1">
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={operationValue1}
                                                    onChange={(value) => {
                                                      setOperationValue1(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                </div>
                                                {/* Column 3: Checkbox, operations dropdown and counter box */}
                                                <div className="flex items-center gap-2" style={{boxSizing: 'border-box'}}>
                                                  <Checkbox
                                                    className="w-4 h-4 flex-shrink-0 m-0 p-0"
                                                    checked={row2Checked}
                                                    onCheckedChange={(checked) => {
                                                      setRow2Checked(checked === true);
                                                    }}
                                                  />
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={operationValue2}
                                                    onChange={(value) => {
                                                      setOperationValue2(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                                                                      />
                                                </div>
                                                {/* Column 4: Delete button */}
                                                <div className="flex justify-left">
                                                  <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    strokeWidth="0"
                                                    viewBox="0 0 24 24"
                                                    className="text-muted-foreground hover:text-muted-foreground cursor-pointer h-6 w-6 transition-colors"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    onClick={() => {
                                                      // Remove Range 1 completely
                                                      setRange1Visible(false);
                                                      setHasPricingChanges(true);
                                                    }}
                                                  >
                                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                  </svg>
                                                </div>
                                              </div>
                                            )}

                                            {/* Row 3: Range 2 - Conditionally rendered */}
                                            {range2Visible && (
                                            <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-3">
                                                {/* Column 1: Two increment buttons */}
                                                <div className="flex items-center gap-1">
                                                  <IncrementButton
                                                    value={standardRange2Start}
                                                    onChange={(value) => {
                                                      setStandardRange2Start(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                  <span className="text-muted-foreground text-sm">-</span>
                                                  <IncrementButton
                                                    value={standardRange2End === "" ? 0 : Number(standardRange2End)}
                                                    onChange={(value) => {
                                                      setStandardRange2End(String(value));
                                                      setHasPricingChanges(true);
                                                      // Trigger row creation immediately when valid value is entered (max 3 rows total)
                                                      if (value > Number(standardRange2Start) && dynamicRows.length === 0) {
                                                        const newRowStart = Number(value) + 0.01;
                                                        const newRow = {
                                                          id: `row_${Date.now()}`,
                                                          rangeStart: newRowStart,
                                                          rangeEnd: "",
                                                          operationValue1: 1.00,
                                                          operationValue2: 2.00,
                                                          checkboxChecked: false,
                                                          hasInheritedCheckbox: false
                                                        };
                                                        setDynamicRows([newRow]);
                                                        setRange2Deletable(true);
                                                      }
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                    placeholder="∞"
                                                  />
                                                </div>
                                                {/* Column 2: Operations dropdown and counter box inline */}
                                                <div className="flex items-center gap-1">
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={operationValue3}
                                                    onChange={(value) => {
                                                      setOperationValue3(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                                                                      />
                                                </div>
                                                {/* Column 3: Checkbox, operations dropdown and counter box */}
                                                <div className="flex items-center gap-2" style={{boxSizing: 'border-box'}}>
                                                  <Checkbox
                                                    className="w-4 h-4 flex-shrink-0 m-0 p-0"
                                                    checked={row3Checked}
                                                    disabled={standardRange2End === "" || standardRange2End === null || dynamicRows.length === 0}
                                                    onCheckedChange={(checked) => {
                                                      setRow3Checked(checked === true);
                                                    }}
                                                  />
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={operationValue4}
                                                    onChange={(value) => {
                                                      setOperationValue4(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                                                                      />
                                                </div>
                                                {/* Column 4: Delete button for Range 2 (only if not the last complete row) */}
                                                <div>
                                                  {(() => {
                                                    // Range 2 can be deleted only if there are complete dynamic rows (making Range 2 not the last complete row)
                                                    const hasCompleteDynamicRows = dynamicRows.some(r => r.rangeEnd !== "" && r.rangeEnd !== null && r.rangeEnd !== undefined);
                                                    const range2HasEndPrice = standardRange2End !== "" && standardRange2End !== null;
                                                    const canDeleteRange2 = range2HasEndPrice && hasCompleteDynamicRows;

                                                    return canDeleteRange2 ? (
                                                      <svg
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="text-muted-foreground hover:text-muted-foreground cursor-pointer h-6 w-6 transition-colors"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        onClick={() => {
                                                          // Remove Range 2 completely
                                                          setRange2Visible(false);
                                                          setRange2Deletable(false);
                                                          // Reset ending price of first dynamic row (if it exists)
                                                          if (dynamicRows.length > 0) {
                                                            const updatedRows = [...dynamicRows];
                                                            updatedRows[0].rangeEnd = "";
                                                            setDynamicRows(updatedRows);
                                                          }
                                                          setHasPricingChanges(true);
                                                        }}
                                                      >
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                      </svg>
                                                    ) : null;
                                                  })()}
                                                </div>
                                              </div>
                                            )}

                                            {/* Dynamic Rows - inserted before "All remaining" */}
                                            {dynamicRows.map((row, index) => (
                                              <div key={row.id} className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-3">
                                                {/* Column 1: Two increment buttons */}
                                                <div className="flex items-center gap-1">
                                                  <IncrementButton
                                                    value={Number(row.rangeStart)}
                                                    onChange={(value) => {
                                                      const updatedRows = [...dynamicRows];
                                                      updatedRows[index].rangeStart = value;
                                                      setDynamicRows(updatedRows);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                  <span className="text-muted-foreground text-sm">-</span>
                                                  <IncrementButton
                                                    value={row.rangeEnd === "" ? 0 : Number(row.rangeEnd)}
                                                    onChange={(value) => {
                                                      const updatedRows = [...dynamicRows];
                                                      updatedRows[index].rangeEnd = value;
                                                      setDynamicRows(updatedRows);
                                                      setHasPricingChanges(true);

                                                      // NO row creation from dynamic rows - only Range 2 can create the single dynamic row
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                    placeholder="∞"
                                                  />
                                                </div>
                                                {/* Column 2: Operations dropdown and counter box inline */}
                                                <div className="flex items-center gap-1">
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={row.operationValue1}
                                                    onChange={(value) => {
                                                      const updatedRows = [...dynamicRows];
                                                      updatedRows[index].operationValue1 = value;
                                                      setDynamicRows(updatedRows);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                </div>
                                                {/* Column 3: Checkbox, operations dropdown and counter box */}
                                                <div className="flex items-center gap-2" style={{boxSizing: 'border-box'}}>
                                                  <Checkbox
                                                    className="w-4 h-4 flex-shrink-0 m-0 p-0"
                                                    checked={row.checkboxChecked}
                                                    disabled={row.rangeEnd === "" || row.rangeEnd === null || row.rangeEnd === undefined ||
                                                      (row.rangeEnd !== "" && row.rangeEnd !== null && row.rangeEnd !== undefined &&
                                                       index === dynamicRows.findLastIndex(r => r.rangeEnd !== "" && r.rangeEnd !== null && r.rangeEnd !== undefined))}
                                                    onCheckedChange={(checked) => {
                                                      const updatedRows = [...dynamicRows];
                                                      updatedRows[index].checkboxChecked = checked === true;
                                                      setDynamicRows(updatedRows);
                                                    }}
                                                  />
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={row.operationValue2}
                                                    onChange={(value) => {
                                                      const updatedRows = [...dynamicRows];
                                                      updatedRows[index].operationValue2 = value;
                                                      setDynamicRows(updatedRows);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                </div>
                                                {/* Column 4: Delete button for dynamic rows (only if not the last complete row) */}
                                                <div>
                                                  {(() => {
                                                    // Find the last complete row index
                                                    const lastCompleteRowIndex = dynamicRows.findLastIndex(r => r.rangeEnd !== "" && r.rangeEnd !== null && r.rangeEnd !== undefined);
                                                    // Show delete button only if this is NOT the last complete row AND has complete data
                                                    const canDelete = row.rangeEnd !== "" && row.rangeEnd !== null && row.rangeEnd !== undefined && index !== lastCompleteRowIndex;

                                                    return canDelete ? (
                                                      <svg
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="text-muted-foreground hover:text-muted-foreground cursor-pointer h-6 w-6 transition-colors"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        onClick={() => {
                                                          // Remove only this specific dynamic row
                                                          const updatedRows = dynamicRows.filter((_, i) => i !== index);
                                                          // Reset ending price of the next row (if it exists)
                                                          if (index < dynamicRows.length - 1) {
                                                            // There's a next row, reset its ending price
                                                            updatedRows[index].rangeEnd = "";
                                                          }
                                                          setDynamicRows(updatedRows);
                                                          setHasPricingChanges(true);
                                                        }}
                                                      >
                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                                      </svg>
                                                    ) : null;
                                                  })()}
                                                </div>
                                              </div>
                                            ))}

                                            {/* Row 4: "All remaining price ranges" - ALWAYS LAST */}
                                            <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-3">
                                                {/* Column 1: Text content */}
                                                <div className="flex items-center gap-1">
                                                  <span className="text-base font-medium text-foreground">All remaining price ranges</span>
                                                </div>
                                                {/* Column 2: Operations dropdown and counter box inline */}
                                                <div className="flex items-center gap-1">
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={operationValue5}
                                                    onChange={(value) => {
                                                      setOperationValue5(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                </div>
                                                {/* Column 3: Checkbox, operations dropdown and counter box */}
                                                <div className="flex items-center gap-2" style={{boxSizing: 'border-box'}}>
                                                  <Checkbox
                                                    className="w-4 h-4 flex-shrink-0 m-0 p-0"
                                                    checked={row4Checked}
                                                    onCheckedChange={(checked) => {
                                                      setRow4Checked(checked === true);
                                                    }}
                                                  />
                                                  <Select value="+">
                                                    <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 ">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                      <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <IncrementButton
                                                    value={operationValue6}
                                                    onChange={(value) => {
                                                      setOperationValue6(value);
                                                      setHasPricingChanges(true);
                                                    }}
                                                    min={0}
                                                    step={1}
                                                    showDecimals={true}
                                                    decimalPlaces={2}
                                                    width="w-24"
                                                    height="h-8"
                                                  />
                                                </div>
                                                {/* Column 4: Empty */}
                                                <div></div>
                                              </div>


                                            {/* Consolidated Error Messages at the bottom of all rows */}
                                            {(range1Error || range2Error || dynamicRowError) && (
                                              <div className="mt-4 w-full">
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 flex-shrink-0">
                                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
                                                  </svg>
                                                  <span className="text-sm">The starting value of the range must be less than the ending value</span>
                                                </div>
                                              </div>
                                            )}

                                            {/* Range Overlap Error Message */}
                                            {rangeOverlapError && (
                                              <div className="mt-3 w-full">
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" className="w-4 h-4 flex-shrink-0">
                                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
                                                  </svg>
                                                  <span className="text-sm">Your ranges overlap</span>
                                                </div>
                                              </div>
                                            )}

                                          </div>
                                        )}
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Horizontal Divider */}
                            <div className="border-b border-border my-4 ml-8 mr-8"></div>

                            {/* Advanced Pricing Rule Section */}
                            <div className="ml-4 mr-4">
                              <div className="flex items-center justify-between py-4 px-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-medium">Advanced Pricing Rule</span>
                                </div>
                              </div>
                            </div>

                            {/* Advanced Pricing Rule Content - Always Open */}
                            <div className="ml-8 pb-6">
                                <div className="space-y-6">
                                  <RadioGroup className="space-y-4">
                                    <div className="w-full">
                                      <Label htmlFor="advanced-pricing" className="flex items-center cursor-pointer w-full" onClick={(e) => { e.preventDefault(); setShowUpgradeDialog(true); }}>
                                        <div className="flex items-center space-x-3 w-full">
                                          <RadioGroupItem value="PricingRankAdvanced" id="advanced-pricing" onClick={(e) => { e.preventDefault(); setShowUpgradeDialog(true); }} />
                                          <span className="text-base font-medium">Fixed Formula Template</span>
                                          <span className="text-sm text-muted-foreground">
                                            Click{" "}
                                            <a
                                              href="/help/advanced-pricing-rule"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              here
                                            </a>
                                            {" "}to get more information.
                                          </span>
                                        </div>
                                      </Label>

                                      <div className="mt-4 space-y-4">
                                        {/* Formula Display */}
                                        <p className="text-sm text-foreground">
                                          Price Value = <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-0.5 py-0.5 rounded font-bold">[</span><span className="bg-muted text-muted-foreground px-1 rounded">(Product Cost + Shipping Cost + Tax)</span> × <span className="bg-muted text-muted-foreground px-1 rounded">(1+ Profit %)</span> + <span className="bg-muted text-muted-foreground px-1 rounded">Fixed Profit</span><span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-0.5 py-0.5 rounded font-bold">]</span> ÷ <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-1 rounded">(1 - Breakeven %)</span>
                                        </p>

                                        {/* PS Note */}
                                        <div className="bg-muted/70 dark:bg-muted/50 border border-border rounded-lg overflow-hidden mt-4">
                                          <div className="p-4">
                                            <p className="text-sm text-foreground leading-relaxed">
                                              If the Final Profit ((Product Cost + Shipping Cost + Tax) × Profit % + Fixed Profit) is less than your Minimum Profit, then the price will be calculated using:
                                            </p>
                                          </div>
                                          <div className="bg-muted/90 dark:bg-muted/70 border-t border-border p-3">
                                            <p className="text-sm font-mono text-foreground">
                                              Price = [(Product Cost + Shipping Cost + Tax) + Minimum Profit] ÷ (1 - Breakeven %)
                                            </p>
                                          </div>
                                        </div>

                                        {/* Set Pricing Rules Details */}
                                        <div className="pt-2">
                                          <div className="flex items-center justify-between">
                                            <p className="text-base text-foreground">Set Pricing Rules Details</p>
                                            <svg
                                              stroke="currentColor"
                                              fill="currentColor"
                                              strokeWidth="0"
                                              viewBox="0 0 512 512"
                                              className="h-5 w-5 text-muted-foreground"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path d="M413.967 276.8c1.06-6.235 1.06-13.518 1.06-20.8s-1.06-13.518-1.06-20.8l44.667-34.318c4.26-3.118 5.319-8.317 2.13-13.518L418.215 115.6c-2.129-4.164-8.507-6.235-12.767-4.164l-53.186 20.801c-10.638-8.318-23.394-15.601-36.16-20.801l-7.448-55.117c-1.06-4.154-5.319-8.318-10.638-8.318h-85.098c-5.318 0-9.577 4.164-10.637 8.318l-8.508 55.117c-12.767 5.2-24.464 12.482-36.171 20.801l-53.186-20.801c-5.319-2.071-10.638 0-12.767 4.164L49.1 187.365c-2.119 4.153-1.061 10.399 2.129 13.518L96.97 235.2c0 7.282-1.06 13.518-1.06 20.8s1.06 13.518 1.06 20.8l-44.668 34.318c-4.26 3.118-5.318 8.317-2.13 13.518L92.721 396.4c2.13 4.164 8.508 6.235 12.767 4.164l53.187-20.801c10.637 8.318 23.394 15.601 36.16 20.801l8.508 55.117c1.069 5.2 5.318 8.318 10.637 8.318h85.098c5.319 0 9.578-4.164 10.638-8.318l8.518-55.117c12.757-5.2 24.464-12.482 36.16-20.801l53.187 20.801c5.318 2.071 10.637 0 12.767-4.164l42.549-71.765c2.129-4.153 1.06-10.399-2.13-13.518l-46.8-34.317zm-158.499 52c-41.489 0-74.46-32.235-74.46-72.8s32.971-72.8 74.46-72.8 74.461 32.235 74.461 72.8-32.972 72.8-74.461 72.8z"></path>
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-b border-border mt-2 mb-4"></div>

                                    {/* Custom Formula Template */}
                                    <div className="w-full">
                                      <Label htmlFor="custom-pricing" className="flex items-center cursor-pointer w-full" onClick={(e) => { e.preventDefault(); setShowUpgradeDialog(true); }}>
                                        <div className="flex items-center space-x-3 w-full">
                                          <RadioGroupItem value="PricingRankCustom" id="custom-pricing" onClick={(e) => { e.preventDefault(); setShowUpgradeDialog(true); }} />
                                          <span className="text-base font-medium">Custom Formula Template</span>
                                          <span className="text-sm text-muted-foreground">
                                            Click{" "}
                                            <a
                                              href="/help/advanced-pricing-rule"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              here
                                            </a>
                                            {" "}to get more information.
                                          </span>
                                        </div>
                                      </Label>

                                      {/* Custom Formula Template Content */}
                                      <div className="ml-8 mt-4 space-y-4">
                                        {/* Header Row */}
                                        <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-6 pb-2 mb-2 border-b border-border">
                                          {/* Column 1: Product Cost Range */}
                                          <div className="flex items-center gap-1">
                                            <span className="font-normal text-base">Product Cost Range <strong className="font-bold text-foreground">({currency})</strong></span>
                                            <span className="text-red-500 ml-1">*</span>
                                          </div>
                                          {/* Column 2: Price heading */}
                                          <div className="flex items-center gap-1">
                                            <span className="font-normal text-base">Price</span>
                                            <span className="text-red-500 ml-1">*</span>
                                          </div>
                                          {/* Column 3: Compared At Price */}
                                          <div className="flex items-center gap-1">
                                            <span className="font-normal text-base">Compared At Price</span>
                                          </div>
                                          {/* Column 4: Empty for actions */}
                                          <div></div>
                                        </div>

                                        {/* Row 1 */}
                                        <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-1">
                                          {/* Column 1: Two increment buttons for range */}
                                          <div className="flex items-center gap-1">
                                            <IncrementButton
                                              value={0.00}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={true}
                                              decimalPlaces={2}
                                              width="w-24"
                                              height="h-8"
                                            />
                                            <span className="text-muted-foreground text-sm">-</span>
                                            <IncrementButton
                                              value={10.00}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={true}
                                              decimalPlaces={2}
                                              width="w-24"
                                              height="h-8"
                                            />
                                          </div>
                                          {/* Column 2: Add formula button */}
                                          <div className="flex items-center gap-1">
                                            <Button variant="outline" className="text-blue-600 dark:text-blue-400 border-none hover:bg-gradient-to-r hover:from-violet-50 hover:to-teal-50 hover:text-violet-600 dark:hover:bg-gradient-to-r dark:hover:from-violet-950/50 dark:hover:to-teal-950/50 dark:hover:text-teal-400 h-8 px-3">
                                              <span>Add formula</span>
                                              <span className="ml-1 text-xl text-muted-foreground">+</span>
                                            </Button>
                                          </div>
                                          {/* Column 3: Compared at price controls */}
                                          <div className="flex items-center gap-1">
                                            <Checkbox className="w-4 h-4 flex-shrink-0 m-0 p-0" />
                                            <Select defaultValue="+">
                                              <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                <SelectItem value="-" className="text-lg font-semibold">-</SelectItem>
                                                <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                <SelectItem value="/" className="text-lg font-semibold">÷</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <IncrementButton
                                              value={0}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={false}
                                              width="w-20"
                                              height="h-8"
                                            />
                                          </div>
                                          {/* Column 4: Delete button */}
                                          <div className="flex items-center">
                                            <svg
                                              fill="currentColor"
                                              viewBox="0 0 24 24"
                                              className="text-muted-foreground hover:text-muted-foreground cursor-pointer h-6 w-6 transition-colors"
                                              xmlns="http://www.w3.org/2000/svg"
                                              onClick={() => {
                                                console.log('Delete row clicked');
                                              }}
                                            >
                                              <path fill="none" d="M0 0h24v24H0z"></path>
                                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                            </svg>
                                          </div>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-1">
                                          {/* Column 1: Two increment buttons for range */}
                                          <div className="flex items-center gap-1">
                                            <IncrementButton
                                              value={10.01}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={true}
                                              decimalPlaces={2}
                                              width="w-24"
                                              height="h-8"
                                            />
                                            <span className="text-muted-foreground text-sm">-</span>
                                            <IncrementButton
                                              value={0}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={true}
                                              decimalPlaces={2}
                                              width="w-24"
                                              height="h-8"
                                              disabled={true}
                                            />
                                          </div>
                                          {/* Column 2: Disabled Add formula button */}
                                          <div className="flex items-center gap-1">
                                            <Button variant="outline" className="text-muted-foreground border-none cursor-not-allowed h-8 px-3" disabled>
                                              <span>Add formula</span>
                                              <span className="ml-1 text-xl">+</span>
                                            </Button>
                                          </div>
                                          {/* Column 3: Disabled compared at price controls */}
                                          <div className="flex items-center gap-1">
                                            <Checkbox className="w-4 h-4 flex-shrink-0 m-0 p-0" disabled />
                                            <Select defaultValue="+" disabled>
                                              <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8 opacity-50">
                                                <SelectValue />
                                              </SelectTrigger>
                                            </Select>
                                            <IncrementButton
                                              value={0}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={false}
                                              width="w-20"
                                              height="h-8"
                                              disabled={true}
                                            />
                                          </div>
                                          {/* Column 4: Empty space */}
                                          <div className="w-6 h-6"></div>
                                        </div>

                                        {/* All remaining price ranges row */}
                                        <div className="grid grid-cols-[1.1fr_0.9fr_1fr_0.15fr] gap-3 items-center mt-4 pt-4 border-t border-border">
                                          {/* Column 1: All remaining ranges text */}
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium text-base">All remaining price ranges</span>
                                          </div>
                                          {/* Column 2: Add formula button */}
                                          <div className="flex items-center gap-1">
                                            <Button variant="outline" className="text-blue-600 dark:text-blue-400 border-none hover:bg-gradient-to-r hover:from-violet-50 hover:to-teal-50 hover:text-violet-600 dark:hover:bg-gradient-to-r dark:hover:from-violet-950/50 dark:hover:to-teal-950/50 dark:hover:text-teal-400 h-8 px-3">
                                              <span>Add formula</span>
                                              <span className="ml-1 text-xl text-muted-foreground">+</span>
                                            </Button>
                                          </div>
                                          {/* Column 3: Compared at price controls */}
                                          <div className="flex items-center gap-1">
                                            <Checkbox className="w-4 h-4 flex-shrink-0 m-0 p-0" />
                                            <Select defaultValue="+">
                                              <SelectTrigger className="w-16 h-8 text-lg flex items-center justify-center font-semibold !h-8 !min-h-8 !max-h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="+" className="text-lg font-semibold">+</SelectItem>
                                                <SelectItem value="-" className="text-lg font-semibold">-</SelectItem>
                                                <SelectItem value="*" className="text-lg font-semibold">×</SelectItem>
                                                <SelectItem value="/" className="text-lg font-semibold">÷</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <IncrementButton
                                              value={0}
                                              onChange={() => {}}
                                              min={0}
                                              step={1}
                                              showDecimals={false}
                                              width="w-20"
                                              height="h-8"
                                            />
                                          </div>
                                          {/* Column 4: Empty space */}
                                          <div className="w-6 h-6"></div>
                                        </div>
                                      </div>
                                    </div>

                                  </RadioGroup>
                                </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="assign-cents" className="space-y-6">
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Assign cents functionality will be implemented here.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mapping" && <AutomatedMapping />}

            {activeTab === "order" && <OrderSettings />}

            {activeTab === "fulfillment" && <FulfillmentSettings />}
          </div>
          </div>
        </div>
      </div>

        <UpgradePlanDialog
          isOpen={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="Product Cost + Shipping Cost"
        />

        {/* Pricing Rule Dialog */}
        <Dialog open={showPricingRuleDialog} onOpenChange={setShowPricingRuleDialog}>
          <DialogContent className="max-w-[560px] h-[230px] p-0">
            <div className="px-6 pt-4 pb-4">
              <DialogTitle className="text-2xl font-bold mb-2">Apply Pricing Rule</DialogTitle>
              <div className="text-lg mb-3">Select which stores will use this pricing rule</div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">Store Selection</div>
                <div className="text-base">No stores available for selection.</div>
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  disabled
                  className="uppercase font-medium"
                  onClick={() => setShowPricingRuleDialog(false)}
                >
                  CONFIRM
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sticky Footer with DISCARD and SAVE buttons - only show when there are unsaved changes */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-64 right-0 bg-background border-t shadow-lg z-50">
            <div className="mx-auto w-full max-w-6xl px-8 py-4">
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
                    onClick={handleDiscardChanges}
                  >
                    DISCARD
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                  >
                    SAVE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Switch Account Dialog */}
        <Dialog open={showSwitchAccountDialog} onOpenChange={setShowSwitchAccountDialog}>
          <DialogContent className="w-[560px] max-w-[560px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Supplier Account</DialogTitle>
              <p className="text-base mt-2">Are you sure you want to switch your AliExpress account?</p>
            </DialogHeader>
            <DialogDescription className="pt-2 pb-4 text-base">
              The information for orders placed with the current account will no longer be updated in DShipIt after disconnecting.
            </DialogDescription>
            <DialogFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSwitchAccountDialog(false)}
                className="uppercase"
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  // Handle OK action here
                  setShowSwitchAccountDialog(false);
                }}
                className="uppercase"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}