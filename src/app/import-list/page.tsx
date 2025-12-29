"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProductCounts } from "@/contexts/ProductCountsContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import { downloadImagesAsZip } from "@/lib/utils";
import { getImportList, removeFromImportList, updateImportListItem, ImportListItem } from '@/lib/import-list-storage';
import { getTags, addTag, updateTagName, deleteTag, applyTagsToProducts, Tag } from '@/lib/tags-storage';
import { currencyService } from '@/services/currencyService';
import { setSupplierOptimizerImage } from '@/lib/supplier-optimizer-storage';
import { useRouter } from 'next/navigation';

const ImageEditor = dynamic(() => import('@toast-ui/react-image-editor'), {
  ssr: false,
}) as React.ComponentType<any>;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CKEditorStyleEditor from "@/components/CKEditorStyleEditor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DsiCounterbox } from "@/components/dsi-counterbox";
import { DeleteImageDialog } from "@/components/DeleteImageDialog";
import { ShippingInfoTab } from "@/components/ShippingInfoTab";
import { 
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Star,
  Package,
  DollarSign,
  Calendar,
  ShoppingCart,
  Eye,
  Edit,
  Store,
  ShoppingBag,
  Check as CheckIcon,
  Plus,
  X,
  ChevronDown as ChevronDownIcon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VariantsTabBar } from "@/components/VariantsTabBar";
import { ChangeOptionPictureSheet } from "@/components/ChangeOptionPictureSheet";
import { ChangePriceDialog } from "@/components/ChangePriceDialog";
import { ChangeCompareAtPriceDialog } from "@/components/ChangeCompareAtPriceDialog";
import { ChangeStockDialog } from "@/components/ChangeStockDialog";
import { DeleteVariantsDialog } from "@/components/DeleteVariantsDialog";
import { DuplicateVariantDialog } from "@/components/DuplicateVariantDialog";
import { DShipItAiSheet } from "@/components/DShipItAiSheet";
import { type ProductVariant } from "@/utils/pricingRules";

// Countries data with flag URLs - All sovereign countries (defined outside component for performance)
const COUNTRIES = [
  { code: "ad", name: "Andorra" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "af", name: "Afghanistan" },
  { code: "ag", name: "Antigua and Barbuda" },
  { code: "ai", name: "Anguilla" },
  { code: "al", name: "Albania" },
  { code: "am", name: "Armenia" },
  { code: "ao", name: "Angola" },
  { code: "aq", name: "Antarctica" },
  { code: "ar", name: "Argentina" },
  { code: "as", name: "American Samoa" },
  { code: "at", name: "Austria" },
  { code: "au", name: "Australia" },
  { code: "aw", name: "Aruba" },
  { code: "ax", name: "Åland Islands" },
  { code: "az", name: "Azerbaijan" },
  { code: "ba", name: "Bosnia and Herzegovina" },
  { code: "bb", name: "Barbados" },
  { code: "bd", name: "Bangladesh" },
  { code: "be", name: "Belgium" },
  { code: "bf", name: "Burkina Faso" },
  { code: "bg", name: "Bulgaria" },
  { code: "bh", name: "Bahrain" },
  { code: "bi", name: "Burundi" },
  { code: "bj", name: "Benin" },
  { code: "bl", name: "Saint Barthélemy" },
  { code: "bm", name: "Bermuda" },
  { code: "bn", name: "Brunei" },
  { code: "bo", name: "Bolivia" },
  { code: "bq", name: "Caribbean Netherlands" },
  { code: "br", name: "Brazil" },
  { code: "bs", name: "Bahamas" },
  { code: "bt", name: "Bhutan" },
  { code: "bv", name: "Bouvet Island" },
  { code: "bw", name: "Botswana" },
  { code: "by", name: "Belarus" },
  { code: "bz", name: "Belize" },
  { code: "ca", name: "Canada" },
  { code: "cc", name: "Cocos Islands" },
  { code: "cd", name: "Democratic Republic of the Congo" },
  { code: "cf", name: "Central African Republic" },
  { code: "cg", name: "Republic of the Congo" },
  { code: "ch", name: "Switzerland" },
  { code: "ci", name: "Côte d'Ivoire" },
  { code: "ck", name: "Cook Islands" },
  { code: "cl", name: "Chile" },
  { code: "cm", name: "Cameroon" },
  { code: "cn", name: "China" },
  { code: "co", name: "Colombia" },
  { code: "cr", name: "Costa Rica" },
  { code: "cu", name: "Cuba" },
  { code: "cv", name: "Cape Verde" },
  { code: "cw", name: "Curaçao" },
  { code: "cx", name: "Christmas Island" },
  { code: "cy", name: "Cyprus" },
  { code: "cz", name: "Czech Republic" },
  { code: "de", name: "Germany" },
  { code: "dj", name: "Djibouti" },
  { code: "dk", name: "Denmark" },
  { code: "dm", name: "Dominica" },
  { code: "do", name: "Dominican Republic" },
  { code: "dz", name: "Algeria" },
  { code: "ec", name: "Ecuador" },
  { code: "ee", name: "Estonia" },
  { code: "eg", name: "Egypt" },
  { code: "eh", name: "Western Sahara" },
  { code: "er", name: "Eritrea" },
  { code: "es", name: "Spain" },
  { code: "et", name: "Ethiopia" },
  { code: "fi", name: "Finland" },
  { code: "fj", name: "Fiji" },
  { code: "fk", name: "Falkland Islands" },
  { code: "fm", name: "Micronesia" },
  { code: "fo", name: "Faroe Islands" },
  { code: "fr", name: "France" },
  { code: "ga", name: "Gabon" },
  { code: "gb", name: "United Kingdom" },
  { code: "gd", name: "Grenada" },
  { code: "ge", name: "Georgia" },
  { code: "gf", name: "French Guiana" },
  { code: "gg", name: "Guernsey" },
  { code: "gh", name: "Ghana" },
  { code: "gi", name: "Gibraltar" },
  { code: "gl", name: "Greenland" },
  { code: "gm", name: "Gambia" },
  { code: "gn", name: "Guinea" },
  { code: "gp", name: "Guadeloupe" },
  { code: "gq", name: "Equatorial Guinea" },
  { code: "gr", name: "Greece" },
  { code: "gs", name: "South Georgia" },
  { code: "gt", name: "Guatemala" },
  { code: "gu", name: "Guam" },
  { code: "gw", name: "Guinea-Bissau" },
  { code: "gy", name: "Guyana" },
  { code: "hk", name: "Hong Kong" },
  { code: "hm", name: "Heard Island" },
  { code: "hn", name: "Honduras" },
  { code: "hr", name: "Croatia" },
  { code: "ht", name: "Haiti" },
  { code: "hu", name: "Hungary" },
  { code: "id", name: "Indonesia" },
  { code: "ie", name: "Ireland" },
  { code: "il", name: "Israel" },
  { code: "im", name: "Isle of Man" },
  { code: "in", name: "India" },
  { code: "io", name: "British Indian Ocean Territory" },
  { code: "iq", name: "Iraq" },
  { code: "ir", name: "Iran" },
  { code: "is", name: "Iceland" },
  { code: "it", name: "Italy" },
  { code: "je", name: "Jersey" },
  { code: "jm", name: "Jamaica" },
  { code: "jo", name: "Jordan" },
  { code: "jp", name: "Japan" },
  { code: "ke", name: "Kenya" },
  { code: "kg", name: "Kyrgyzstan" },
  { code: "kh", name: "Cambodia" },
  { code: "ki", name: "Kiribati" },
  { code: "km", name: "Comoros" },
  { code: "kn", name: "Saint Kitts and Nevis" },
  { code: "kp", name: "North Korea" },
  { code: "kr", name: "South Korea" },
  { code: "kw", name: "Kuwait" },
  { code: "ky", name: "Cayman Islands" },
  { code: "kz", name: "Kazakhstan" },
  { code: "la", name: "Laos" },
  { code: "lb", name: "Lebanon" },
  { code: "lc", name: "Saint Lucia" },
  { code: "li", name: "Liechtenstein" },
  { code: "lk", name: "Sri Lanka" },
  { code: "lr", name: "Liberia" },
  { code: "ls", name: "Lesotho" },
  { code: "lt", name: "Lithuania" },
  { code: "lu", name: "Luxembourg" },
  { code: "lv", name: "Latvia" },
  { code: "ly", name: "Libya" },
  { code: "ma", name: "Morocco" },
  { code: "mc", name: "Monaco" },
  { code: "md", name: "Moldova" },
  { code: "me", name: "Montenegro" },
  { code: "mf", name: "Saint Martin" },
  { code: "mg", name: "Madagascar" },
  { code: "mh", name: "Marshall Islands" },
  { code: "mk", name: "North Macedonia" },
  { code: "ml", name: "Mali" },
  { code: "mm", name: "Myanmar" },
  { code: "mn", name: "Mongolia" },
  { code: "mo", name: "Macao" },
  { code: "mp", name: "Northern Mariana Islands" },
  { code: "mq", name: "Martinique" },
  { code: "mr", name: "Mauritania" },
  { code: "ms", name: "Montserrat" },
  { code: "mt", name: "Malta" },
  { code: "mu", name: "Mauritius" },
  { code: "mv", name: "Maldives" },
  { code: "mw", name: "Malawi" },
  { code: "mx", name: "Mexico" },
  { code: "my", name: "Malaysia" },
  { code: "mz", name: "Mozambique" },
  { code: "na", name: "Namibia" },
  { code: "nc", name: "New Caledonia" },
  { code: "ne", name: "Niger" },
  { code: "nf", name: "Norfolk Island" },
  { code: "ng", name: "Nigeria" },
  { code: "ni", name: "Nicaragua" },
  { code: "nl", name: "Netherlands" },
  { code: "no", name: "Norway" },
  { code: "np", name: "Nepal" },
  { code: "nr", name: "Nauru" },
  { code: "nu", name: "Niue" },
  { code: "nz", name: "New Zealand" },
  { code: "om", name: "Oman" },
  { code: "pa", name: "Panama" },
  { code: "pe", name: "Peru" },
  { code: "pf", name: "French Polynesia" },
  { code: "pg", name: "Papua New Guinea" },
  { code: "ph", name: "Philippines" },
  { code: "pk", name: "Pakistan" },
  { code: "pl", name: "Poland" },
  { code: "pm", name: "Saint Pierre and Miquelon" },
  { code: "pn", name: "Pitcairn Islands" },
  { code: "pr", name: "Puerto Rico" },
  { code: "ps", name: "Palestine" },
  { code: "pt", name: "Portugal" },
  { code: "pw", name: "Palau" },
  { code: "py", name: "Paraguay" },
  { code: "qa", name: "Qatar" },
  { code: "re", name: "Réunion" },
  { code: "ro", name: "Romania" },
  { code: "rs", name: "Serbia" },
  { code: "ru", name: "Russia" },
  { code: "rw", name: "Rwanda" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "sb", name: "Solomon Islands" },
  { code: "sc", name: "Seychelles" },
  { code: "sd", name: "Sudan" },
  { code: "se", name: "Sweden" },
  { code: "sg", name: "Singapore" },
  { code: "sh", name: "Saint Helena" },
  { code: "si", name: "Slovenia" },
  { code: "sj", name: "Svalbard and Jan Mayen" },
  { code: "sk", name: "Slovakia" },
  { code: "sl", name: "Sierra Leone" },
  { code: "sm", name: "San Marino" },
  { code: "sn", name: "Senegal" },
  { code: "so", name: "Somalia" },
  { code: "sr", name: "Suriname" },
  { code: "ss", name: "South Sudan" },
  { code: "st", name: "São Tomé and Príncipe" },
  { code: "sv", name: "El Salvador" },
  { code: "sx", name: "Sint Maarten" },
  { code: "sy", name: "Syria" },
  { code: "sz", name: "Eswatini" },
  { code: "tc", name: "Turks and Caicos Islands" },
  { code: "td", name: "Chad" },
  { code: "tf", name: "French Southern Territories" },
  { code: "tg", name: "Togo" },
  { code: "th", name: "Thailand" },
  { code: "tj", name: "Tajikistan" },
  { code: "tk", name: "Tokelau" },
  { code: "tl", name: "Timor-Leste" },
  { code: "tm", name: "Turkmenistan" },
  { code: "tn", name: "Tunisia" },
  { code: "to", name: "Tonga" },
  { code: "tr", name: "Turkey" },
  { code: "tt", name: "Trinidad and Tobago" },
  { code: "tv", name: "Tuvalu" },
  { code: "tw", name: "Taiwan" },
  { code: "tz", name: "Tanzania" },
  { code: "ua", name: "Ukraine" },
  { code: "ug", name: "Uganda" },
  { code: "um", name: "U.S. Minor Outlying Islands" },
  { code: "us", name: "United States" },
  { code: "uy", name: "Uruguay" },
  { code: "uz", name: "Uzbekistan" },
  { code: "va", name: "Vatican City" },
  { code: "vc", name: "Saint Vincent and the Grenadines" },
  { code: "ve", name: "Venezuela" },
  { code: "vg", name: "British Virgin Islands" },
  { code: "vi", name: "U.S. Virgin Islands" },
  { code: "vn", name: "Vietnam" },
  { code: "vu", name: "Vanuatu" },
  { code: "wf", name: "Wallis and Futuna" },
  { code: "ws", name: "Samoa" },
  { code: "ye", name: "Yemen" },
  { code: "yt", name: "Mayotte" },
  { code: "za", name: "South Africa" },
  { code: "zm", name: "Zambia" },
  { code: "zw", name: "Zimbabwe" }
] as const;

export default function ImportListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { updateImportListCount } = useProductCounts();
  
  // Unit counter states for product editing
  const [productTitle, setProductTitle] = useState("Wireless Bluetooth Headphones");
  const [weightValue, setWeightValue] = useState(250);
  const [weightUnit, setWeightUnit] = useState("gm");
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(8);
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  const [editingProductDescription, setEditingProductDescription] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0.00);
  const [maxPrice, setMaxPrice] = useState(0.00);
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedShipFrom, setSelectedShipFrom] = useState("");
  const [selectedPushStatus, setSelectedPushStatus] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [productImages, setProductImages] = useState([
    "https://ae01.alicdn.com/kf/Sebad6e800dd24a7899815be4e6491803L.jpg",
    "https://ae01.alicdn.com/kf/Sfece7e6e8e5e4c2795033e8cee49e2aeY.jpg",
    "https://ae01.alicdn.com/kf/Sbd180795d4f34696994ffe688498d6f8O.jpg",
    "https://ae01.alicdn.com/kf/S3a6804ee054f44e78cb7a7e095ba2ed6i.jpg",
    "https://ae01.alicdn.com/kf/S651463133a34479f8d7a478539777069r.jpg",
    "https://ae01.alicdn.com/kf/Sdc8a5fbd4eea4ef4a6930e15eded3af9Z.jpg",
    "https://ae01.alicdn.com/kf/S9fa84e98a7b949f5a98cc1e69ee04ed2w.jpg",
    "https://ae01.alicdn.com/kf/S1e1cd981aaf64f86aacf7fbcf277f489L.jpg",
    "https://ae01.alicdn.com/kf/S89208d576ffe4cb69a9737589eb4c08bG.jpg",
    "https://ae01.alicdn.com/kf/Sf3863e5007c243d6828d73708f5051a7q.jpg",
    "https://ae01.alicdn.com/kf/S7d2be437b1c34a28a8b9206014d2da62I.jpg",
    "https://ae01.alicdn.com/kf/Sfa69beff9ac6491d914629ffd3f42ac95.jpg",
    "https://ae01.alicdn.com/kf/S8401d184199140b2b3ed7babca3a9c7.jpg",
    "https://ae01.alicdn.com/kf/S11c26fc13c9640269897a9bd8d2440f7i.jpg",
    "https://ae01.alicdn.com/kf/Sab1085473a8b4aec989cfcd6f8bd8b710.jpg",
    "https://ae01.alicdn.com/kf/S48506018d3524fd1909d136c0f197acdT.jpg",
    "https://ae01.alicdn.com/kf/Sb5ee4f3bb27f44029044e7d1c5a74a1aO.jpg",
    "https://ae01.alicdn.com/kf/Sb941f3868c7e4d328a0731fb43e1115bK.jpg",
    "https://ae01.alicdn.com/kf/S22ac48a85b144bb59cf0cb3e4d02f792R.jpg"
  ]);
  const [resizePopoverOpen, setResizePopoverOpen] = useState<number | null>(null);
  const [editPopoverOpen, setEditPopoverOpen] = useState<number | null>(null);
  const [moreActionsOpen, setMoreActionsOpen] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(null);
  const [currentEditingImageIndex, setCurrentEditingImageIndex] = useState<number | null>(null);
  const imageEditorRef = useRef<any>(null);
  const [imageResizeData, setImageResizeData] = useState<{[key: number]: {
    originalWidth: number;
    originalHeight: number;
    newWidth: number;
    newHeight: number;
    newWidthInput: string;
    newHeightInput: string;
  }}>({});
  const [imageEditData, setImageEditData] = useState<{[key: number]: {
    brightness: number;
    contrast: number;
    saturation: number;
  }}>({});
  const [skuOver100, setSkuOver100] = useState(false);
  const [createTagsDialogOpen, setCreateTagsDialogOpen] = useState(false);
  const [applyTagsDialogOpen, setApplyTagsDialogOpen] = useState(false);
  const [applyTagsProductId, setApplyTagsProductId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [showEmptyTagPopover, setShowEmptyTagPopover] = useState(false);
  const [createdTags, setCreatedTags] = useState<Tag[]>([]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [selectedApplyTags, setSelectedApplyTags] = useState<string[]>([]);
  const [isAllApplyTagsSelected, setIsAllApplyTagsSelected] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [individualDeleteDialogOpen, setIndividualDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [changeLanguageDialogOpen, setChangeLanguageDialogOpen] = useState(false);
  const [changeLanguageProductId, setChangeLanguageProductId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchValue, setCountrySearchValue] = useState("");
  const [productSyncRuleDialogOpen, setProductSyncRuleDialogOpen] = useState(false);
  const [convertedPrices, setConvertedPrices] = useState<Record<string, string>>({});
  const [pendingCountry, setPendingCountry] = useState("us"); // Temporary country selection in dialog
  const [pendingCurrency, setPendingCurrency] = useState("USD"); // Currency preview in dialog
  // Per-product country/currency settings - maps product ID to country code
  const [productCountries, setProductCountries] = useState<Record<string, string>>({});
  // Track which product is currently being edited in the sync rule dialog
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  // Pre-cached exchange rates for instant conversion
  const [cachedExchangeRates, setCachedExchangeRates] = useState<Record<string, number> | null>(null);
  const [editProductSheetOpen, setEditProductSheetOpen] = useState(false);
  const [editProductSheetTab, setEditProductSheetTab] = useState("products");
  const [storeSheetOpen, setStoreSheetOpen] = useState(false);
  const [editProductDetailSheetOpen, setEditProductDetailSheetOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [currentStoreName, setCurrentStoreName] = useState<string>("spiderco");
  const [changeOptionPictureSheetOpen, setChangeOptionPictureSheetOpen] = useState(false);
  const [changePriceDialogOpen, setChangePriceDialogOpen] = useState(false);
  const [changeCompareAtPriceDialogOpen, setChangeCompareAtPriceDialogOpen] = useState(false);
  const [changeStockDialogOpen, setChangeStockDialogOpen] = useState(false);
  const [deleteVariantsDialogOpen, setDeleteVariantsDialogOpen] = useState(false);
  const [duplicateVariantDialogOpen, setDuplicateVariantDialogOpen] = useState(false);
  const [defaultParcelSheetOpen, setDefaultParcelSheetOpen] = useState(false);
  const [selectedMainImage, setSelectedMainImage] = useState("https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg");
  const [savedMainImage, setSavedMainImage] = useState("https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg");
  
  // Default parcel information data
  const [parcelData, setParcelData] = useState([
    { id: 1, name: "", length: 0, width: 0, height: 0, unit: "cm", isDefault: false }
  ]);
  
  // Track if parcel data has been modified
  const [parcelDataModified, setParcelDataModified] = useState(false);
  
  const [selectedVariantItems, setSelectedVariantItems] = useState<number[]>([]);

  // Reset focus and modification state when Default Parcel Information sheet opens
  useEffect(() => {
    if (defaultParcelSheetOpen) {
      // Remove focus from any active element
      setTimeout(() => {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 100);
      // Reset modification flag when sheet opens
      setParcelDataModified(false);
    }
  }, [defaultParcelSheetOpen]);

  // Close more actions popup when clicking outside - optimized with ref for performance
  const moreActionsOpenRef = useRef<string | null>(null);
  moreActionsOpenRef.current = moreActionsOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsOpenRef.current) {
        const target = event.target as Element;
        if (!target.closest('[data-more-actions-popup]') && !target.closest('[data-more-actions-trigger]')) {
          setMoreActionsOpen(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // TODO: Move tags storage to Azure backend when deploying to dev/prod
  // Load tags from localStorage on mount
  useEffect(() => {
    const loadedTags = getTags();
    setCreatedTags(loadedTags);
  }, []);

  const [pricingRuleEnabled, setPricingRuleEnabled] = useState(true);
  const [variantType, setVariantType] = useState("Unit"); // Dynamic variant type
  
  // Available variant options for each type
  const variantOptionsMap = {
    "Unit": ["AU", "UK", "EU", "US", "CA", "JP"],
    "Color": ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Black", "White", "Gray"],
    "Size": ["XS", "S", "M", "L", "XL", "XXL"],
    "Material": ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim"]
  };
  
  // Get available options for current variant type
  const availableVariantOptions = variantOptionsMap[variantType as keyof typeof variantOptionsMap] || [];
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<string[]>(availableVariantOptions.slice(0, 3)); // Default to first 3 options
  
  // Handle variant option selection in filter
  const handleVariantOptionToggle = (option: string) => {
    const isSelectingOption = !selectedVariantOptions.includes(option);
    
    // Update selected variant options
    setSelectedVariantOptions(prev => 
      isSelectingOption
        ? [...prev, option]
        : prev.filter(item => item !== option)
    );
    
    setHasUnsavedChanges(true);
    
    // Find variants with this option and update their selection state
    const variantsWithOption = productVariants
      .filter(variant => variant.variantOption === option)
      .map(variant => parseInt(variant.id));
    
    if (isSelectingOption) {
      // Select all variants with this option
      setSelectedVariantItems(prev => [
        ...prev.filter(id => !variantsWithOption.includes(id)), // Remove duplicates
        ...variantsWithOption
      ]);
    } else {
      // Deselect all variants with this option
      setSelectedVariantItems(prev => 
        prev.filter(id => !variantsWithOption.includes(id))
      );
    }
  };

  // Update product variants and selected options when variant type changes
  useEffect(() => {
    const newVariants = availableVariantOptions.map((option, index) => ({
      id: (index + 1).toString(),
      sku: `SKU-${option.toUpperCase().slice(0, 3)}-${index + 1}`,
      supplierPrice: 11.50 + (index * 0.25),
      currentPrice: 17.00 + (index * 0.50),
      compareAtPrice: 20.00 + (index * 0.75),
      profitMargin: 14 + index,
      shippingCost: 2.25 + (index * 0.15),
      variantOption: option
    }));
    setProductVariants(newVariants);
    
    // Reset selections when variant type changes
    setSelectedVariantOptions([]);
    setSelectedVariantItems([]);
  }, [variantType]);
  
  // Handle individual variant checkbox
  const handleVariantCheckboxChange = (variantId: number, checked: boolean) => {
    // Update selected variant items
    if (checked) {
      setSelectedVariantItems(prev => [...prev, variantId]);
    } else {
      setSelectedVariantItems(prev => prev.filter(id => id !== variantId));
    }
    
    // Find the variant option for this variant
    const variant = productVariants.find(v => parseInt(v.id) === variantId);
    if (variant) {
      // Check if all variants with this option are now selected
      const variantsWithSameOption = productVariants.filter(v => v.variantOption === variant.variantOption);
      const selectedVariantsWithSameOption = variantsWithSameOption.filter(v => 
        selectedVariantItems.includes(parseInt(v.id)) || parseInt(v.id) === variantId
      );
      
      // Update variant filter based on selection state
      if (checked && selectedVariantsWithSameOption.length === variantsWithSameOption.length) {
        // All variants with this option are now selected, check the option in filter
        setSelectedVariantOptions(prev => 
          prev.includes(variant.variantOption) ? prev : [...prev, variant.variantOption]
        );
      } else if (!checked) {
        // At least one variant with this option is deselected, uncheck the option in filter
        setSelectedVariantOptions(prev => 
          prev.filter(option => option !== variant.variantOption)
        );
      }
    }
  };
  
  // Handle select all variants checkbox
  const handleSelectAllVariants = (checked: boolean) => {
    if (checked) {
      // Select all current variants
      const allVariantIds = productVariants.map(variant => parseInt(variant.id));
      setSelectedVariantItems(allVariantIds);
      
      // Also update variant filter to show all options as selected
      setSelectedVariantOptions(availableVariantOptions);
    } else {
      // Deselect all variants
      setSelectedVariantItems([]);
      
      // Also clear variant filter selections
      setSelectedVariantOptions([]);
    }
  };
  
  // Mock product variants data for pricing calculations - dynamically generated
  // Initial values for reset functionality
  const initialProductVariants = availableVariantOptions.map((option, index) => ({
    id: (index + 1).toString(),
    sku: `SKU-${option.toUpperCase().slice(0, 3)}-${index + 1}`,
    supplierPrice: 11.50 + (index * 0.25),
    currentPrice: 17.00 + (index * 0.50),
    compareAtPrice: 20.00 + (index * 0.75),
    profitMargin: 14 + index,
    shippingCost: 2.25 + (index * 0.15),
    variantOption: option
  }));

  const [productVariants, setProductVariants] = useState<(ProductVariant & { variantOption: string })[]>(initialProductVariants);

  // Calculate selection state for header checkbox (after productVariants is defined)
  const allVariantsSelected = productVariants.length > 0 && productVariants.every(variant => 
    selectedVariantItems.includes(parseInt(variant.id))
  );
  const someVariantsSelected = selectedVariantItems.length > 0 && !allVariantsSelected;

  // Location form states
  const [locationName, setLocationName] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [locationProvince, setLocationProvince] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationZipCode, setLocationZipCode] = useState("");
  const [warehouseLocations, setWarehouseLocations] = useState<Array<{id: string, name: string, country: string, province: string, city: string, zipCode: string}>>([]);
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [selectedWarehouseLocation, setSelectedWarehouseLocation] = useState("");
  
  // Store configuration state
  const [selectedMarketplace, setSelectedMarketplace] = useState("");
  const [selectedPaymentPolicy, setSelectedPaymentPolicy] = useState("");
  const [selectedReturnPolicy, setSelectedReturnPolicy] = useState("");
  const [selectedShippingPolicy, setSelectedShippingPolicy] = useState("");
  const [selectedPackageType, setSelectedPackageType] = useState("");
  
  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingSheetClose, setPendingSheetClose] = useState<'editProductDetail' | 'defaultParcel' | null>(null);
  
  // Reset form to original values
  const resetFormData = () => {
    setProductTitle("Wireless Bluetooth Headphones");
    setWeightValue(250);
    setWeightUnit("gm");
    setLength(20);
    setWidth(15);
    setHeight(8);
    setDimensionUnit("cm");
    setPricingRuleEnabled(true);
    setProductVariants([...initialProductVariants]);
    setParcelData([{ id: 1, name: "", length: 0, width: 0, height: 0, unit: "cm", isDefault: false }]);
  };
  
  // Image selection and dropdown state
  const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>([]);
  const [selectedImageSet, setSelectedImageSet] = useState<Set<number>>(new Set());
  const [selectedImageFilter, setSelectedImageFilter] = useState("all");
  const [imageFilterDropdownOpen, setImageFilterDropdownOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [moreActionDropdownOpen, setMoreActionDropdownOpen] = useState(false);
  const [altTextDialogOpen, setAltTextDialogOpen] = useState(false);
  const [altTextValues, setAltTextValues] = useState<{[key: number]: string}>({});

  // Image handling functions
  const getImageCategory = (index: number) => {
    if (selectedImageSet.has(index)) return "selected";
    return "all";
  };

  const handleImageSelect = (index: number, checked: boolean) => {
    const newSet = new Set(selectedImageSet);
    const newIndices = [...selectedImageIndices];
    
    if (checked) {
      newSet.add(index);
      newIndices.push(index);
    } else {
      newSet.delete(index);
      const indexPos = newIndices.indexOf(index);
      if (indexPos > -1) {
        newIndices.splice(indexPos, 1);
      }
    }
    
    setSelectedImageSet(newSet);
    setSelectedImageIndices(newIndices);
    setSelectAllChecked(newIndices.length === productImages.length);
    setHasUnsavedChanges(true);
  };

  const handleDownloadImages = async () => {
    if (selectedImageIndices.length === 0) {
      alert("Please select images to download");
      return;
    }
    
    const selectedImages = selectedImageIndices.map(index => productImages[index]);
    const folderName = productTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const zipFileName = `${folderName}_images.zip`;
    
    try {
      await downloadImagesAsZip(selectedImages, zipFileName, folderName);
      console.log(`Downloaded ${selectedImages.length} images as ${zipFileName}`);
    } catch (error) {
      console.error("Error downloading images:", error);
      alert("Failed to download images. Please try again.");
    }
  };

  const handleAICutoutReplace = () => {
    if (selectedImageIndices.length === 0) {
      alert("Please select images for AI cutout & replace background");
      return;
    }
    console.log("AI Cutout & Replace Background for:", selectedImageIndices.length, "images");
    setAiDropdownOpen(false);
  };

  const handleAIElimination = () => {
    if (selectedImageIndices.length === 0) {
      alert("Please select images for AI elimination");
      return;
    }
    console.log("AI Elimination for:", selectedImageIndices.length, "images");
    setAiDropdownOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = productImages.map((_, index) => index);
      setSelectedImageIndices(allIndices);
      setSelectedImageSet(new Set(allIndices));
    } else {
      setSelectedImageIndices([]);
      setSelectedImageSet(new Set());
    }
    setSelectAllChecked(checked);
    setHasUnsavedChanges(true);
  };

  const handleAltTextOpen = () => {
    if (selectedImageIndices.length === 0) {
      return; // Menu item is disabled, so this shouldn't be called
    }
    setAltTextDialogOpen(true);
    setMoreActionDropdownOpen(false);
  };

  const handleDeleteSelected = () => {
    if (selectedImageIndices.length === 0) {
      alert("Please select images to delete");
      return;
    }
    
    const selectedImages = selectedImageIndices.map(index => productImages[index]);
    const imagesToDelete = selectedImages.join(',');
    setImageToDelete(imagesToDelete);
    setDeleteImageDialogOpen(true);
    setMoreActionDropdownOpen(false);
  };

  // Removed problematic useEffect - warning dialog is now handled in Sheet onOpenChange

  // Tab change handler removed - users should freely switch tabs

  // Validation function for location form
  const isLocationFormValid = () => {
    return locationName.trim() !== "" && 
           locationCountry !== "" && 
           locationProvince.trim() !== "" && 
           locationCity.trim() !== "" && 
           locationZipCode.trim() !== "";
  };

  // Function to reset location form
  const resetLocationForm = () => {
    setLocationName("");
    setLocationCountry("");
    setLocationProvince("");
    setLocationCity("");
    setLocationZipCode("");
  };

  // Function to handle image delete
  const handleDeleteImage = (imageUrl: string) => {
    setImageToDelete(imageUrl);
    setDeleteImageDialogOpen(true);
  };

  const confirmDeleteImage = () => {
    if (imageToDelete) {
      // Remove the image from the productImages state array
      setProductImages(prevImages => prevImages.filter(img => img !== imageToDelete));
      console.log("Deleted image:", imageToDelete);
    }
    setDeleteImageDialogOpen(false);
    setImageToDelete(null);
  };

  const handleEditImage = (imageUrl: string, index: number, event: React.MouseEvent) => {
    console.log("Edit image:", imageUrl);
    
    // Set current editing image and open image editor modal
    setCurrentEditingImage(imageUrl);
    setCurrentEditingImageIndex(index);
    setImageEditorOpen(true);
  };

  const handleSaveEditedImage = async () => {
    console.log('handleSaveEditedImage called');
    console.log('imageEditorRef.current:', imageEditorRef.current);
    console.log('currentEditingImageIndex:', currentEditingImageIndex);
    
    if (imageEditorRef.current && currentEditingImageIndex !== null) {
      const editorInstance = imageEditorRef.current.getInstance();
      console.log('editorInstance:', editorInstance);
      
      if (!editorInstance) {
        console.error('Editor instance not available');
        return;
      }
      
      try {
        // Get the edited image data with proper format and quality
        const editedImageData = editorInstance.toDataURL({
          format: 'png',
          quality: 1
        });
        console.log('Got editedImageData:', editedImageData.substring(0, 100) + '...');
        
        // Convert to blob for better handling
        const blob = await (await fetch(editedImageData)).blob();
        console.log('Converted to blob, size:', blob.size);
        
        // Update the product images array with the edited image data
        const updatedImages = [...productImages];
        updatedImages[currentEditingImageIndex] = editedImageData;
        setProductImages(updatedImages);
        console.log('Updated product images array');
        
        console.log('Edited image saved successfully:', {
          dataURL: editedImageData.substring(0, 50) + '...',
          blobSize: blob.size + ' bytes'
        });
        
        // Close the editor and return to Images tab
        setImageEditorOpen(false);
        setCurrentEditingImage(null);
        setCurrentEditingImageIndex(null);
        
      } catch (error) {
        console.error('Error in save process:', error);
      }
    } else {
      console.error('Missing requirements:', {
        imageEditorRef: !!imageEditorRef.current,
        currentEditingImageIndex
      });
    }
  };

  const handleCancelEditImage = () => {
    // Close the editor without saving and ensure we stay in the Images tab
    setImageEditorOpen(false);
    setCurrentEditingImage(null);
    setCurrentEditingImageIndex(null);
    // Keep the EditProductDetailSheet open and Images tab selected
    // No navigation changes needed - just close the editor overlay
  };

  const handleResizeImage = (imageUrl: string, index: number, event: React.MouseEvent) => {
    console.log("Resize image:", imageUrl);
    
    // Initialize resize data for this image if it doesn't exist
    if (!imageResizeData[index]) {
      setImageResizeData(prev => ({
        ...prev,
        [index]: {
          originalWidth: 1000,
          originalHeight: 817,
          newWidth: 1000,
          newHeight: 817,
          newWidthInput: '1000',
          newHeightInput: '817'
        }
      }));
    }
    
    // Calculate position for popover
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.right + 10, // Position to the right of the button
      y: rect.top
    });
    
    // Open the resize popover
    setResizePopoverOpen(index);
  };

  const handleWidthChange = (value: string, imageIndex: number) => {
    const currentData = imageResizeData[imageIndex];
    if (!currentData) return;
    
    const numValue = Number(value);
    
    if (value === '' || isNaN(numValue) || numValue <= 0) {
      // Keep the input value as-is during typing, but don't update calculated height
      setImageResizeData(prev => ({
        ...prev,
        [imageIndex]: {
          ...currentData,
          newWidthInput: value,
          newWidth: value === '' ? 0 : currentData.newWidth
        }
      }));
    } else {
      // Calculate offset from original width (continue calculations even if outside valid range)
      const widthOffset = numValue - currentData.originalWidth;
      
      // Apply same offset to original height (no clamping, allow calculations to continue)
      const newHeight = currentData.originalHeight + widthOffset;
      
      setImageResizeData(prev => ({
        ...prev,
        [imageIndex]: {
          ...currentData,
          newWidth: numValue,
          newHeight: newHeight,
          newWidthInput: value,
          newHeightInput: newHeight.toString()
        }
      }));
    }
  };

  const handleHeightChange = (value: string, imageIndex: number) => {
    const currentData = imageResizeData[imageIndex];
    if (!currentData) return;
    
    const numValue = Number(value);
    
    if (value === '' || isNaN(numValue) || numValue <= 0) {
      // Keep the input value as-is during typing, but don't update calculated width
      setImageResizeData(prev => ({
        ...prev,
        [imageIndex]: {
          ...currentData,
          newHeightInput: value,
          newHeight: value === '' ? 0 : currentData.newHeight
        }
      }));
    } else {
      // Calculate offset from original height (continue calculations even if outside valid range)
      const heightOffset = numValue - currentData.originalHeight;
      
      // Apply same offset to original width (no clamping, allow calculations to continue)
      const newWidth = currentData.originalWidth + heightOffset;
      
      setImageResizeData(prev => ({
        ...prev,
        [imageIndex]: {
          ...currentData,
          newWidth: newWidth,
          newHeight: numValue,
          newWidthInput: newWidth.toString(),
          newHeightInput: value
        }
      }));
    }
  };

  const handleSaveResize = (imageIndex: number) => {
    const resizeData = imageResizeData[imageIndex];
    if (resizeData) {
      console.log("Saving resize for image", imageIndex, ":", { 
        width: resizeData.newWidth, 
        height: resizeData.newHeight 
      });
      // TODO: Implement actual image resizing logic
    }
  };

  const handleEditControlChange = (imageIndex: number, property: 'brightness' | 'contrast' | 'saturation', value: number) => {
    setImageEditData(prev => ({
      ...prev,
      [imageIndex]: {
        ...prev[imageIndex],
        [property]: value
      }
    }));
  };

  const handleSaveEdit = (imageIndex: number) => {
    const editData = imageEditData[imageIndex];
    if (editData) {
      console.log("Saving edit for image", imageIndex, ":", editData);
      // TODO: Implement actual image editing logic
    }
  };

  // Function to add a new location
  const addLocation = () => {
    if (isLocationFormValid()) {
      const newLocation = {
        id: `location-${Date.now()}`,
        name: locationName.trim(),
        country: locationCountry,
        province: locationProvince.trim(),
        city: locationCity.trim(),
        zipCode: locationZipCode.trim()
      };
      
      setWarehouseLocations(prev => [...prev, newLocation]);
      resetLocationForm();
      setIsAddLocationDialogOpen(false);
    }
  };

  // Function to delete a location
  const deleteLocation = (locationId: string) => {
    setWarehouseLocations(prev => prev.filter(location => location.id !== locationId));
    if (selectedWarehouseLocation === locationId) {
      setSelectedWarehouseLocation("");
    }
  };

  // Validation function for store configuration
  // Only validate fields that have actual selectable options
  const isStoreConfigValid = () => {
    return selectedMarketplace !== "" && 
           selectedWarehouseLocation !== "" && 
           selectedPackageType !== "";
    // Note: Business policies (payment, return, shipping) are excluded from validation
    // as they show empty states when no data is available from the store vendor's API
  };

  // Get the country for a specific product (defaults to US)
  const getProductCountry = (productId: string) => {
    const countryCode = productCountries[productId] || "us";
    return COUNTRIES.find(country => country.code === countryCode) || COUNTRIES[0];
  };

  // Import list state - products that user has added to their import list from Find Products page
  const [importListItems, setImportListItems] = useState<ImportListItem[]>([]);

  // Pre-load exchange rates on mount for instant conversions
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const rates = await currencyService.getExchangeRates('USD');
        setCachedExchangeRates(rates);
      } catch (error) {
        console.error('Failed to pre-load exchange rates:', error);
      }
    };
    loadExchangeRates();
  }, []);

  // Update pending currency preview when pending country changes in dialog
  useEffect(() => {
    const pendingCountryData = COUNTRIES.find(c => c.code === pendingCountry);
    if (pendingCountryData) {
      const currency = currencyService.getCurrencyByCountryName(pendingCountryData.name);
      setPendingCurrency(currency);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCountry]);

  // Convert prices based on per-product country settings - SYNCHRONOUS using cached rates
  useEffect(() => {
    // Skip if no items to convert or rates not loaded yet
    if (importListItems.length === 0 || !cachedExchangeRates) {
      return;
    }

    const newConvertedPrices: Record<string, string> = {};

    // Convert each item's price based on its own country setting using cached rates
    for (const item of importListItems) {
      const countryCode = productCountries[item.id] || "us";
      const countryData = COUNTRIES.find(c => c.code === countryCode);

      if (!countryData) {
        newConvertedPrices[item.id] = `US ${item.price}`;
        continue;
      }

      const targetCurrency = currencyService.getCurrencyByCountryName(countryData.name);

      // If USD, show original price
      if (targetCurrency === 'USD') {
        newConvertedPrices[item.id] = `US ${item.price}`;
        continue;
      }

      const currencyInfo = currencyService.getCurrencyInfo(targetCurrency);
      const symbol = currencyInfo.symbol;
      const decimals = currencyInfo.decimal_digits;
      const rate = cachedExchangeRates[targetCurrency];

      // Parse the price (format: "$XX.XX" or "$XX.XX-$YY.YY")
      const priceStr = item.price.replace(/[^0-9.-]/g, '');
      const prices = priceStr.split('-').map(p => parseFloat(p)).filter(p => !isNaN(p));

      if (prices.length > 0) {
        // Apply exchange rate if available, otherwise use 1:1 with currency symbol change
        const effectiveRate = rate || 1;
        const convertedValues = prices.map(p => p * effectiveRate);

        if (convertedValues.length === 1) {
          newConvertedPrices[item.id] = `${symbol}${convertedValues[0].toFixed(decimals)}`;
        } else if (convertedValues.length === 2) {
          newConvertedPrices[item.id] = `${symbol}${convertedValues[0].toFixed(decimals)}-${symbol}${convertedValues[1].toFixed(decimals)}`;
        }
      } else {
        newConvertedPrices[item.id] = `US ${item.price}`;
      }
    }

    setConvertedPrices(newConvertedPrices);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productCountries, importListItems, cachedExchangeRates]);

  // Helper function to get display price (converted based on product's country setting)
  const getDisplayPrice = (product: ImportListItem): string => {
    return convertedPrices[product.id] || `US ${product.price}`;
  };

  // Track which product is currently being edited in the Edit Product sheet
  const [currentEditingProduct, setCurrentEditingProduct] = useState<ImportListItem | null>(null);

  // Populate form fields when a product is selected for editing
  useEffect(() => {
    if (currentEditingProduct) {
      // Set product title from the current editing product
      setProductTitle(currentEditingProduct.name);
      // Set main image from the current editing product
      setSelectedMainImage(currentEditingProduct.image);
      setSavedMainImage(currentEditingProduct.image);
      // Set weight if available
      if (currentEditingProduct.weight) {
        setWeightValue(currentEditingProduct.weight.value);
        setWeightUnit(currentEditingProduct.weight.unit);
      }
      // Set dimensions if available
      if (currentEditingProduct.dimensions) {
        setLength(currentEditingProduct.dimensions.length);
        setWidth(currentEditingProduct.dimensions.width);
        setHeight(currentEditingProduct.dimensions.height);
        setDimensionUnit(currentEditingProduct.dimensions.unit);
      }
      // Set product images if available
      if (currentEditingProduct.images && currentEditingProduct.images.length > 0) {
        setProductImages(currentEditingProduct.images);
      } else if (currentEditingProduct.image) {
        // Fallback to single main image if no images array
        setProductImages([currentEditingProduct.image]);
      }
      // Set description if available
      if (currentEditingProduct.description) {
        setEditingProductDescription(currentEditingProduct.description);
      } else {
        setEditingProductDescription('');
      }
      // Set variants if available - convert from ImportListItem format to ProductVariant format
      if (currentEditingProduct.variants && currentEditingProduct.variants.length > 0) {
        const convertedVariants = currentEditingProduct.variants.map(v => ({
          id: v.id,
          sku: v.sku,
          supplierPrice: v.price,
          currentPrice: v.price,
          compareAtPrice: v.compareAtPrice,
          profitMargin: v.compareAtPrice > 0 ? ((v.compareAtPrice - v.price) / v.compareAtPrice * 100) : 0,
          shippingCost: 0,
          variantOption: v.option,
        }));
        setProductVariants(convertedVariants);
      }
      // Reset unsaved changes flag when loading new product
      setHasUnsavedChanges(false);

      // Fetch additional images from product API if only 1 image is available
      const hasLimitedImages = !currentEditingProduct.images || currentEditingProduct.images.length <= 1;
      if (hasLimitedImages && currentEditingProduct.id) {
        const fetchAdditionalImages = async () => {
          try {
            const response = await fetch(`/api/aliexpress/product?productId=${currentEditingProduct.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.images && data.images.length > 1) {
                setProductImages(data.images);
                // Update the product in storage with the fetched images
                const updatedProduct = { ...currentEditingProduct, images: data.images };
                updateImportListItem(updatedProduct);
              }
            }
          } catch (error) {
            // Silently fail - keep existing images
            console.error('Failed to fetch additional product images:', error);
          }
        };
        fetchAdditionalImages();
      }
    }
  }, [currentEditingProduct]);

  // Load import list from localStorage on mount
  useEffect(() => {
    const items = getImportList();
    setImportListItems(items);
  }, []);

  // Listen for storage changes (cross-tab sync and same-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dshipit_import_list') {
        setImportListItems(getImportList());
      }
    };

    // Also listen for custom storage events dispatched within same tab
    const handleCustomStorageEvent = () => {
      setImportListItems(getImportList());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageEvent);
    };
  }, []);

  // Display all imported products
  const displayedProducts = importListItems;
  const displayedProductsCount = displayedProducts.length;

  // Update sidebar count when component mounts or displayed products change
  useEffect(() => {
    updateImportListCount(displayedProductsCount);
  }, [displayedProductsCount, updateImportListCount]);

  // Mock vendor products that can be added to import list
  const [availableVendorProducts] = useState([
    {
      id: 101,
      name: "Gaming Mechanical Keyboard",
      supplier: "AliExpress",
      supplierLogo: "/aliexpressQualityControl.png",
      price: "$45.99",
      originalPrice: "$79.99",
      discount: "42%",
      rating: 4.7,
      reviews: 3421,
      image: "/techAccessoriesAliexpress.png",
      category: "Gaming",
      status: "Available",
      stock: 300,
      minOrder: 1
    },
    {
      id: 102,
      name: "Wireless Car Charger",
      supplier: "Temu",
      supplierLogo: "/temuQualityControl.jfif",
      price: "$15.99",
      originalPrice: "$25.99",
      discount: "38%",
      rating: 4.1,
      reviews: 892,
      image: "/techAccessoriesAliexpress.png",
      category: "Automotive",
      status: "Available",
      stock: 180,
      minOrder: 5
    },
    {
      id: 103,
      name: "Smart Home Security Camera",
      supplier: "Alibaba",
      supplierLogo: "/alibabaQualityControl.jfif",
      price: "$67.50",
      originalPrice: "$99.99",
      discount: "32%",
      rating: 4.5,
      reviews: 1567,
      image: "/techAccessoriesAliexpress.png",
      category: "Security",
      status: "Available",
      stock: 95,
      minOrder: 2,
      weight: { value: 150, unit: "gm" },
      dimensions: { length: 10, width: 8, height: 2, unit: "cm" }
    }
  ]);

  // Placeholder product filtering logic based on weight and dimensions
  useEffect(() => {
    const filterProducts = () => {
      // TODO: Replace with actual API filtering when real data is available
      // This is placeholder logic for demonstration
      
      const filtered = importListItems.filter(product => {
        // Convert units to common unit for comparison (grams for weight, cm for dimensions)
        const productWeight = convertToGrams(product.weight?.value || 0, product.weight?.unit || 'gm');
        const referenceWeight = convertToGrams(weightValue, weightUnit);
        
        const productDimensions = convertToCm(product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' });
        const referenceDimensions = convertToCm({ length, width, height, unit: dimensionUnit });
        
        // Filter logic: products with similar weight (±50%) and dimensions (±30%)
        const weightMatch = Math.abs(productWeight - referenceWeight) <= (referenceWeight * 0.5);
        const dimensionMatch = 
          Math.abs(productDimensions.length - referenceDimensions.length) <= (referenceDimensions.length * 0.3) &&
          Math.abs(productDimensions.width - referenceDimensions.width) <= (referenceDimensions.width * 0.3) &&
          Math.abs(productDimensions.height - referenceDimensions.height) <= (referenceDimensions.height * 0.3);
        
        return weightMatch || dimensionMatch; // Show if either weight or dimensions match
      });
      
      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [weightValue, weightUnit, length, width, height, dimensionUnit, importListItems]);

  // Helper functions for unit conversion (placeholder implementations)
  const convertToGrams = (value: number, unit: string): number => {
    switch (unit) {
      case 'kg': return value * 1000;
      case 'lb': return value * 453.592;
      case 'gm': 
      default: return value;
    }
  };

  const convertToCm = (dimensions: { length: number, width: number, height: number, unit: string }) => {
    const { length, width, height, unit } = dimensions;
    switch (unit) {
      case 'm': return { length: length * 100, width: width * 100, height: height * 100 };
      case 'in': return { length: length * 2.54, width: width * 2.54, height: height * 2.54 };
      case 'cm':
      default: return { length, width, height };
    }
  };

  // This will be populated dynamically from API/props
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearAllFilters = () => {
    setMinPrice(0.00);
    setMaxPrice(0.00);
    setSelectedCountry("");
    setSelectedShipFrom("");
    setSelectedPushStatus("");
    setSelectedVendor("");
    setTagSearchQuery("");
    setSelectedTags([]);
    setSkuOver100(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsFilterOpen(open);
    // Reset selections when closing the sheet (clicking away or X button)
    // Only preserve selections when user clicks CONFIRM
    if (!open) {
      setMinPrice(0.00);
      setMaxPrice(0.00);
      setSelectedCountry("");
      setSelectedShipFrom("");
      setSelectedPushStatus("");
      setSelectedVendor("");
      // Clear variant selections
      setSelectedVariantOptions([]);
      setSelectedVariantItems([]);
      setTagSearchQuery("");
      setSelectedTags([]);
      setSkuOver100(false);
    }
  };

  const handleApplyFilters = () => {
    // Apply filters logic here - close sheet and filter products
    setIsFilterOpen(false);
    console.log("Applying filters:", {
      minPrice,
      maxPrice,
      selectedCountry,
      selectedShipFrom,
      selectedPushStatus,
      selectedTags,
      skuOver100
    });
  };

  const handleAddTag = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (newTagInput.trim() === "") {
      setShowEmptyTagPopover(true);
      setTimeout(() => setShowEmptyTagPopover(false), 3000); // Auto-hide after 3 seconds
      return;
    }

    // Add new tag to storage (returns null if duplicate)
    const newTag = addTag(newTagInput.trim());
    if (newTag) {
      setCreatedTags(prev => [...prev, newTag]);
    }
    setNewTagInput("");
    // Explicitly ensure popover is closed
    setShowEmptyTagPopover(false);
  };

  const handleDeleteTag = (tagId: string) => {
    deleteTag(tagId);
    setCreatedTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleEditTag = (tagId: string, currentName: string) => {
    setEditingTagId(tagId);
    setEditingTagValue(currentName);
  };

  const handleSaveTag = (tagId: string) => {
    if (editingTagValue.trim() === "") {
      return; // Don't save empty tags
    }

    // Update tag in storage (returns false if duplicate name)
    const success = updateTagName(tagId, editingTagValue.trim());
    if (success) {
      setCreatedTags(prev =>
        prev.map(tag =>
          tag.id === tagId
            ? { ...tag, name: editingTagValue.trim() }
            : tag
        )
      );
    }

    setEditingTagId(null);
    setEditingTagValue("");
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagValue("");
  };

  const handleSelectAllApplyTags = (checked: boolean) => {
    setIsAllApplyTagsSelected(checked);
    if (checked) {
      setSelectedApplyTags(createdTags.map(tag => tag.id));
    } else {
      setSelectedApplyTags([]);
    }
    setHasUnsavedChanges(true);
  };

  const handleApplyTagToggle = (tagId: string) => {
    setSelectedApplyTags(prev => {
      const newSelection = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      
      // Update select all state
      setIsAllApplyTagsSelected(newSelection.length === createdTags.length);
      setHasUnsavedChanges(true);
      return newSelection;
    });
  };

  const handleApplyTags = () => {
    if (selectedApplyTags.length === 0) {
      return; // No tags selected
    }

    // Determine which products to apply tags to
    const productIds = applyTagsProductId ? [applyTagsProductId] : selectedItems;

    // Apply tags to products in storage
    applyTagsToProducts(selectedApplyTags, productIds);

    // Update local state with new product counts
    setCreatedTags(getTags());

    // Close dialog and reset state
    setApplyTagsDialogOpen(false);
    setSelectedApplyTags([]);
    setIsAllApplyTagsSelected(false);
    setApplyTagsProductId(null);
  };

  const handleApplyTagsDialogClose = (open: boolean) => {
    setApplyTagsDialogOpen(open);

    // Reset selections when dialog is closed (clicking away, X button, or ESC)
    if (!open) {
      setSelectedApplyTags([]);
      setIsAllApplyTagsSelected(false);
      setApplyTagsProductId(null);
    }
  };

  const handleDeleteImportedProducts = () => {
    if (selectedItems.length === 0) {
      return;
    }

    // Convert selected number IDs to strings for storage removal
    const selectedIdsAsStrings = selectedItems.map(id => id.toString());

    // Remove from localStorage
    removeFromImportList(selectedIdsAsStrings);

    // Remove selected products from import list state
    setImportListItems(prev => prev.filter(item => !selectedIdsAsStrings.includes(item.id)));

    // Close dialog and reset selections
    setDeleteDialogOpen(false);
    setSelectedItems([]);
  };

  // Function to add vendor products to import list
  const addToImportList = (vendorProductIds: number[]) => {
    const productsToAdd = availableVendorProducts.filter(product =>
      vendorProductIds.includes(product.id)
    );
    
    const importListProducts = productsToAdd.map(product => ({
      ...product,
      id: String(product.id), // Convert id to string for ImportListItem compatibility
      addedDate: new Date().toISOString().split('T')[0], // Today's date
      weight: product.weight || { value: 100, unit: "gm" }, // Default weight if not provided
      dimensions: product.dimensions || { length: 10, width: 10, height: 5, unit: "cm" } // Default dimensions if not provided
    }));
    
    setImportListItems(prev => [...prev, ...importListProducts]);
    console.log('Added to import list:', importListProducts);
  };


  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllItems = () => {
    if (selectedItems.length === displayedProductsCount) {
      setSelectedItems([]);
    } else {
      setSelectedItems(displayedProducts.map(item => item.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      case "Limited Stock":
        return <Badge className="bg-yellow-100 text-yellow-800">Limited Stock</Badge>;
      case "Out of Stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="h-full w-full px-8 py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-medium text-foreground">Import list</h1>
            <Sheet open={isFilterOpen} onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.4em" width="1.4em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14L4 5V3H20V5L14 14V20L10 22V14Z"></path>
                  </svg>
                  <span className="font-light text-lg">Filter</span>
                </div>
              </SheetTrigger>
              <SheetContent className="flex flex-col h-full">
                <SheetHeader className="px-1">
                  <SheetTitle className="text-2xl font-semibold w-5/6 mx-auto">Filter Products</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto mt-2 px-1">
                  <Accordion type="multiple" className="w-full" defaultValue={["supplier", "category", "status", "price", "stores", "push-status", "tags", "condition"]}>
                    <AccordionItem value="supplier" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Marketplaces</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <RadioGroup value={selectedVendor} onValueChange={setSelectedVendor} className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value="aliexpress" id="aliexpress" className="w-5 h-5" />
                            <Image
                              src="/aliexpressQualityControl.png"
                              alt="AliExpress"
                              width={24}
                              height={24}
                              className="rounded"
                            />
                            <label htmlFor="aliexpress" className="text-base font-normal cursor-pointer">AliExpress</label>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value="temu" id="temu" className="w-5 h-5" />
                            <Image
                              src="/temuQualityControl.jfif"
                              alt="Temu"
                              width={24}
                              height={24}
                              className="rounded"
                            />
                            <label htmlFor="temu" className="text-base font-normal cursor-pointer">Temu</label>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value="alibaba" id="alibaba" className="w-5 h-5" />
                            <Image
                              src="/alibabaQualityControl.jfif"
                              alt="Alibaba"
                              width={24}
                              height={24}
                              className="rounded"
                            />
                            <label htmlFor="alibaba" className="text-base font-normal cursor-pointer">Alibaba</label>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value="banggood" id="banggood" className="w-5 h-5" />
                            <Image
                              src="/banggoodQualityControl.png"
                              alt="Banggood"
                              width={24}
                              height={24}
                              className="rounded"
                            />
                            <label htmlFor="banggood" className="text-base font-normal cursor-pointer">Banggood</label>
                          </div>
                        </RadioGroup>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="category" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Product Cost</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <div className="flex items-start justify-center gap-4 py-1 px-1">
                          <div className="w-[130px]">
                            <label className="block mb-2">Min Price</label>
                            <DsiCounterbox
                              value={minPrice.toFixed(2)}
                              onChange={(value) => setMinPrice(parseFloat(value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="h-[1px] w-[14px] bg-gray-700 dark:bg-gray-400 mx-2 mt-5"></div>

                          <div className="w-[130px]">
                            <label className="block mb-2">Max Price</label>
                            <DsiCounterbox
                              value={maxPrice.toFixed(2)}
                              onChange={(value) => setMaxPrice(parseFloat(value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="status" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter Price by Country</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <div>
                          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Please select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇺🇸</span>
                                  <span>United States</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ca" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇨🇦</span>
                                  <span>Canada</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="gb" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇬🇧</span>
                                  <span>United Kingdom</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="au" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇦🇺</span>
                                  <span>Australia</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="de" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇩🇪</span>
                                  <span>Germany</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="fr" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇫🇷</span>
                                  <span>France</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="jp" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇯🇵</span>
                                  <span>Japan</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cn" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇨🇳</span>
                                  <span>China</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="price" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Ship From</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <div>
                          <Select value={selectedShipFrom} onValueChange={setSelectedShipFrom}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Please select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cn" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇨🇳</span>
                                  <span>China</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="fr" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇫🇷</span>
                                  <span>France</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ru" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇷🇺</span>
                                  <span>Russia</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="us" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇺🇸</span>
                                  <span>United States</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="gb" className="h-12">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">🇬🇧</span>
                                  <span>United Kingdom</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="stores" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Connected Stores</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Checkbox id="shopify" className="w-5 h-5 border-2 border-gray-600" />
                            <div className="flex items-center space-x-3">
                              <Store className="w-6 h-6 text-green-600" />
                              <label htmlFor="shopify" className="text-base font-medium cursor-pointer">My Shopify Store</label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Checkbox id="woocommerce" className="w-5 h-5 border-2 border-gray-600" />
                            <div className="flex items-center space-x-3">
                              <ShoppingBag className="w-6 h-6 text-purple-600" />
                              <label htmlFor="woocommerce" className="text-base font-medium cursor-pointer">WooCommerce Store Pro</label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Checkbox id="amazon-store" className="w-5 h-5 border-2 border-gray-600" />
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="w-6 h-6 text-orange-600" />
                              <label htmlFor="amazon-store" className="text-base font-medium cursor-pointer">Amazon Marketplace</label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Checkbox id="ebay-store" className="w-5 h-5 border-2 border-gray-600" />
                            <div className="flex items-center space-x-3">
                              <Package className="w-6 h-6 text-blue-600" />
                              <label htmlFor="ebay-store" className="text-base font-medium cursor-pointer">eBay Business Store</label>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="push-status" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Push Status</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <RadioGroup value={selectedPushStatus} onValueChange={setSelectedPushStatus} className="space-y-2 pl-4">
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value="pushed" id="pushed" className="w-5 h-5" />
                            <label htmlFor="pushed" className="text-base font-normal cursor-pointer">Pushed to Store</label>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value="not-pushed" id="not-pushed" className="w-5 h-5" />
                            <label htmlFor="not-pushed" className="text-base font-normal cursor-pointer">Not pushed to store</label>
                          </div>
                        </RadioGroup>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="tags" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Tags</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <div className="space-y-3">
                          {/* Search Bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="Search tags..."
                              value={tagSearchQuery}
                              onChange={(e) => setTagSearchQuery(e.target.value)}
                              className="pl-9 h-8"
                            />
                          </div>

                          {/* Scrollable Tags List */}
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                            {filteredTags.map((tag) => (
                              <div key={tag} className="flex items-center space-x-3">
                                <Checkbox
                                  id={tag}
                                  checked={selectedTags.includes(tag)}
                                  onCheckedChange={() => handleTagToggle(tag)}
                                  className="w-4 h-4 border-2 border-gray-500"
                                />
                                <label 
                                  htmlFor={tag} 
                                  className="font-normal cursor-pointer flex-1"
                                >
                                  {tag}
                                </label>
                              </div>
                            ))}
                            {filteredTags.length === 0 && (
                              <p className="text-muted-foreground text-center py-4">
                                No tags found matching "{tagSearchQuery}"
                              </p>
                            )}
                          </div>
                        </div>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="condition" className="border-0 mb-3">
                      <div className="w-5/6 mx-auto"><AccordionTrigger className="text-lg py-2 hover:no-underline border-0 focus-visible:ring-0 focus-visible:border-transparent outline-none font-normal text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/90 dark:hover:bg-slate-700/70 rounded-lg px-4 w-full">Filter by Condition</AccordionTrigger></div>
                      <AccordionContent className="mt-6"><div className="flex justify-center"><div className="w-3/5">
                        <div>
                          <div className="flex items-center space-x-4">
                            <Checkbox
                              id="sku-over-100"
                              checked={skuOver100}
                              onCheckedChange={(checked) => setSkuOver100(checked === true)}
                              className="w-5 h-5 border-2 border-gray-600"
                            />
                            <label htmlFor="sku-over-100" className="text-base font-medium cursor-pointer">
                              SKU over 100
                            </label>
                          </div>
                        </div>
                        </div>
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                {/* Fixed Bottom Buttons */}
                <div className="flex-shrink-0 bg-background border-t p-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleClearAllFilters}
                    className="flex-1"
                  >
                    CLEAR ALL FILTERS
                  </Button>
                  <Button 
                    onClick={handleApplyFilters}
                    className="flex-1"
                  >
                    CONFIRM
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-muted-foreground">
              You can import and manage your suppliers' products here before publishing them to your store.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <svg 
                    stroke="currentColor" 
                    fill="currentColor" 
                    strokeWidth="0" 
                    viewBox="0 0 16 16" 
                    height="1em" 
                    width="1em" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"></path>
                  </svg>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    You can publish a product to different stores and add multiple tags to each product. After you import products to DShipIt, only the price and inventory of the supplier products will be automatically updated on DShipIt. If you have imported a product for a long time, in order to ensure the consistency of the product information and the supplier, it is recommended that you check the supplier information before pushing this product.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-card border rounded-lg p-4">
            {/* Left Side - Add to Import List Logic */}
            <div className="flex items-center gap-4">
              {/* Select All Checkbox */}
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => {
                  if (selectedItems.length === displayedProductsCount) {
                    // Deselect all
                    setSelectedItems([]);
                  } else {
                    // Select all displayed products
                    setSelectedItems(displayedProducts.map(item => item.id));
                  }
                }}
              >
                <div 
                  className={`
                    peer w-5 h-5 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none
                    flex items-center justify-center
                    ${selectedItems.length === 0 
                      ? 'border-input dark:bg-input/30' 
                      : 'bg-primary text-primary-foreground border-primary dark:bg-primary'
                    }
                  `}
                >
                  {selectedItems.length === 0 && ''}
                  {selectedItems.length > 0 && selectedItems.length < displayedProductsCount && '−'}
                  {selectedItems.length === displayedProductsCount && (
                    <CheckIcon className="size-3.5" />
                  )}
                </div>
              </div>
              <Button 
                variant="default"
                onClick={() => {
                  if (selectedItems.length > 0) {
                    // Handle adding products to import list
                    console.log(`Adding ${selectedItems.length} products to import list`, selectedItems);
                  }
                }}
                disabled={selectedItems.length === 0}
                style={{
                  height: "40px",
                  paddingLeft: "16px",
                  paddingRight: "24px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
                className={`${selectedItems.length > 0 ? "bg-primary text-white" : "bg-gray-300 hover:bg-gray-300 text-gray-600"} !important`}
              >
                <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{fontSize: "24px", width: "24px !important", height: "24px !important", minWidth: "24px", minHeight: "24px", marginRight: "2px"}} className={`w-[24px] h-[24px] flex-shrink-0 ${selectedItems.length > 0 ? 'text-white' : 'text-gray-600'}`}>
                  <title></title>
                  <g id="画板" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <rect id="矩形" fillOpacity="0" fill="transparent" x="0" y="0" width="24" height="24"></rect>
                    <g id="编组备份" transform="translate(2.000000, 3.000000)" fillRule="nonzero">
                      <path d="M12.3809524,0 C13.9589088,0 15.2380952,1.27245387 15.2380952,2.84210526 C15.2380952,3.85749169 14.6935269,4.79574744 13.8095238,5.30344066 C12.9255207,5.81113388 11.836384,5.81113388 10.9523809,5.30344066 C10.5631504,5.07990106 10.2397254,4.77288914 9.99961642,4.41257419 C9.48853818,5.17926167 8.61307346,5.68421052 7.61904762,5.68421052 C6.04109119,5.68421052 4.76190477,4.41175665 4.76190477,2.84210526 C4.76190477,1.27245387 6.04109119,0 7.61904762,0 C8.61307346,0 9.48853818,0.504948851 10.0003557,1.27105043 C10.5114618,0.504948851 11.3869265,0 12.3809524,0 Z" id="形状结合" fillOpacity="0.7" fill="currentColor"></path>
                      <path d="M17.6190476,3.31578946 C18.952381,3.31578946 20,4.35789472 20,5.68421052 C20,6.84786494 19.1935869,7.79274606 18.095316,8.00700689 L18.0952381,15.6315789 C18.0952381,16.9578947 17.047619,18 15.7142857,18 L4.28571428,18 C2.95238094,18 1.90476191,16.9105263 1.90476191,15.6315789 L1.9044409,8.00422842 C0.835899352,7.78469033 0,6.84290693 0,5.68421052 C0,4.40526316 1.04761904,3.31578946 2.38095238,3.31578946 L17.6190476,3.31578946 Z" id="形状结合" fill="currentColor"></path>
                      <path d="M10,8.7631579 C8.66666666,8.7631579 7.52380953,7.86315789 7.09523809,6.67894736 C7,6.39473684 6.7142857,6.15789474 6.42857143,6.15789474 C5.95238096,6.15789474 5.61904762,6.63157894 5.76190477,7.10526315 C6.33333334,8.90526315 8.04761904,10.1842105 10,10.1842105 C11.952381,10.1842105 13.6666667,8.90526317 14.2380952,7.10526315 C14.3809524,6.63157894 14.047619,6.15789474 13.5714286,6.15789474 C13.2380952,6.15789474 13,6.34736843 12.9047619,6.67894736 C12.4761905,7.86315789 11.3333333,8.76315788 10,8.7631579 L10,8.7631579 Z" id="路径" fill="white"></path>
                    </g>
                  </g>
                </svg>
                Push to Store ({selectedItems.length}/{displayedProductsCount})
              </Button>
            </div>
            
            {/* Right Side - Filter Controls */}
            <div className="flex items-center">
              {/* Tag Management Menu */}
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-2 py-1.5 text-base font-semibold hover:bg-accent rounded-md transition-colors" style={{ color: '#000' }}>
                      <img
                        src="/dsi-tags_management.svg"
                        alt="Tag Management"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                        style={{ filter: 'brightness(0)' }}
                      />
                      <span style={{ color: '#000' }}>Tag Management</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg">
                    <DropdownMenuItem
                      className="flex items-center space-x-2 px-2 py-1.5 font-semibold cursor-pointer transition-colors"
                      onClick={() => setCreateTagsDialogOpen(true)}
                      style={{ color: '#000' }}
                    >
                      <svg stroke="#000" fill="#000" strokeWidth="0" viewBox="0 0 24 24" height="1.25em" width="1.25em" xmlns="http://www.w3.org/2000/svg" className="!w-5 !h-5 !size-5">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27A2.5 2.5 0 0110.5 11c.69 0 1.32.28 1.77.74l.73.72.73-.73a2.5 2.5 0 013.54 3.54z"></path>
                      </svg>
                      <span style={{ color: '#000' }}>Create DShipIt Tags</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center space-x-2 px-2 py-1.5 font-semibold cursor-pointer transition-colors"
                      onClick={() => setApplyTagsDialogOpen(true)}
                      style={{ color: '#000' }}
                    >
                      <svg stroke="#000" fill="#000" strokeWidth="0" viewBox="0 0 24 24" height="1.25em" width="1.25em" xmlns="http://www.w3.org/2000/svg" className="!w-5 !h-5 !size-5">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M21 7h-2v2h-2V7h-2V5h2V3h2v2h2v2zm-2 14l-7-3-7 3V5c0-1.1.9-2 2-2h7a5.002 5.002 0 005 7.9V21z"></path>
                      </svg>
                      <span style={{ color: '#000' }}>Apply DShipIt Tags</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Vertical Divider */}
              <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-4"></div>

              {/* Delete Products Dialog */}
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center space-x-2 px-2 py-1.5 text-base font-semibold hover:bg-accent rounded-md transition-colors" style={{ color: '#000' }}>
                    <svg stroke="#000" fill="#000" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                    </svg>
                    <span style={{ color: '#000' }}>Delete</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription className="text-base">
                      Are you sure you want to delete the product(s)? It will be deleted from the import list but will not be deleted from your store.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteImportedProducts}
                      variant="destructive"
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Individual Delete Product Dialog */}
              <Dialog open={individualDeleteDialogOpen} onOpenChange={(open) => {
                setIndividualDeleteDialogOpen(open);
                if (!open) setProductToDelete(null);
              }}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription className="text-base">
                      Are you sure you want to delete the product(s)? It will be deleted from the import list but will not be deleted from your store.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIndividualDeleteDialogOpen(false);
                        setProductToDelete(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (productToDelete) {
                          removeFromImportList([productToDelete]);
                          setImportListItems(prev => prev.filter(item => item.id !== productToDelete));
                        }
                        setIndividualDeleteDialogOpen(false);
                        setProductToDelete(null);
                      }}
                      className="uppercase"
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Change Language Dialog */}
              <Dialog open={changeLanguageDialogOpen} onOpenChange={(open) => {
                setChangeLanguageDialogOpen(open);
                if (!open) setChangeLanguageProductId(null);
              }}>
                <DialogContent className="w-[560px] max-w-[560px] p-0 gap-0 overflow-hidden">
                  <DialogHeader className="px-6 py-3 border-b border-gray-100">
                    <DialogTitle className="text-lg font-semibold text-foreground">Change Language</DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="sr-only">Change the language of your product</DialogDescription>
                  <div className="px-6 py-4">
                    <p className="text-base text-muted-foreground mb-4">You can change the language of your product.</p>
                    <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage} className="mb-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="EN" id="lang-en" />
                        <label htmlFor="lang-en" className="text-base font-normal cursor-pointer text-foreground">English</label>
                      </div>
                    </RadioGroup>
                    <button
                      onClick={() => {
                        router.push('/settings?tab=product&section=multilingual-product');
                        setChangeLanguageDialogOpen(false);
                      }}
                      className="flex items-center gap-2 text-base text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                        <path d="M8.68735 4.00008L11.294 1.39348C11.6845 1.00295 12.3176 1.00295 12.7082 1.39348L15.3148 4.00008H19.0011C19.5533 4.00008 20.0011 4.4478 20.0011 5.00008V8.68637L22.6077 11.293C22.9982 11.6835 22.9982 12.3167 22.6077 12.7072L20.0011 15.3138V19.0001C20.0011 19.5524 19.5533 20.0001 19.0011 20.0001H15.3148L12.7082 22.6067C12.3176 22.9972 11.6845 22.9972 11.294 22.6067L8.68735 20.0001H5.00106C4.44877 20.0001 4.00106 19.5524 4.00106 19.0001V15.3138L1.39446 12.7072C1.00393 12.3167 1.00393 11.6835 1.39446 11.293L4.00106 8.68637V5.00008C4.00106 4.4478 4.44877 4.00008 5.00106 4.00008H8.68735ZM6.00106 6.00008V9.5148L3.51578 12.0001L6.00106 14.4854V18.0001H9.51578L12.0011 20.4854L14.4863 18.0001H18.0011V14.4854L20.4863 12.0001L18.0011 9.5148V6.00008H14.4863L12.0011 3.5148L9.51578 6.00008H6.00106ZM12.0011 16.0001C9.79192 16.0001 8.00106 14.2092 8.00106 12.0001C8.00106 9.79094 9.79192 8.00008 12.0011 8.00008C14.2102 8.00008 16.0011 9.79094 16.0011 12.0001C16.0011 14.2092 14.2102 16.0001 12.0011 16.0001ZM12.0011 14.0001C13.1056 14.0001 14.0011 13.1047 14.0011 12.0001C14.0011 10.8955 13.1056 10.0001 12.0011 10.0001C10.8965 10.0001 10.0011 10.8955 10.0011 12.0001C10.0011 13.1047 10.8965 14.0001 12.0011 14.0001Z"></path>
                      </svg>
                      Language Setting
                    </button>
                  </div>
                  <DialogFooter className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <Button
                      onClick={() => {
                        setChangeLanguageDialogOpen(false);
                        setChangeLanguageProductId(null);
                      }}
                    >
                      OK
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Imported Products Grid */}
        <div className="py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Dynamic Product Cards from Import List */}
            {importListItems.map((product) => (
              <Card key={product.id} className="border-0 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-200 p-0 relative overflow-hidden h-[445px] rounded-xl">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-xl w-full relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center"
                      unoptimized
                    />
                  </div>

                  {/* Checkbox */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedItems.includes(product.id)}
                      onCheckedChange={() => handleSelectItem(product.id)}
                      className="h-5 w-5 bg-white dark:bg-gray-300 border border-gray-300 dark:border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 dark:data-[state=checked]:bg-orange-500 dark:data-[state=checked]:border-orange-500"
                    />
                  </div>

                  {/* Push to Store Button */}
                  <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 z-10 px-4 py-2">
                    <div className="flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="default"
                              size="icon"
                              className="rounded-full w-10 h-10 cursor-pointer hover:cursor-pointer"
                              onClick={() => console.log('Push to Store clicked for:', product.id)}
                            >
                              <svg width="28px" height="28px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="!w-7 !h-7 !min-w-[28px] !min-h-[28px]">
                                <g id="画板" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                  <rect id="矩形" fillOpacity="0" fill="#D8D8D8" x="0" y="0" width="24" height="24"></rect>
                                  <g id="编组备份" transform="translate(2.000000, 3.000000)" fillRule="nonzero">
                                    <path d="M12.3809524,0 C13.9589088,0 15.2380952,1.27245387 15.2380952,2.84210526 C15.2380952,3.85749169 14.6935269,4.79574744 13.8095238,5.30344066 C12.9255207,5.81113388 11.836384,5.81113388 10.9523809,5.30344066 C10.5631504,5.07990106 10.2397254,4.77288914 9.99961642,4.41257419 C9.48853818,5.17926167 8.61307346,5.68421052 7.61904762,5.68421052 C6.04109119,5.68421052 4.76190477,4.41175665 4.76190477,2.84210526 C4.76190477,1.27245387 6.04109119,0 7.61904762,0 C8.61307346,0 9.48853818,0.504948851 10.0003557,1.27105043 C10.5114618,0.504948851 11.3869265,0 12.3809524,0 Z" id="形状结合" fillOpacity="0.5" fill="#fff"></path>
                                    <path d="M17.6190476,3.31578946 C18.952381,3.31578946 20,4.35789472 20,5.68421052 C20,6.84786494 19.1935869,7.79274606 18.095316,8.00700689 L18.0952381,15.6315789 C18.0952381,16.9578947 17.047619,18 15.7142857,18 L4.28571428,18 C2.95238094,18 1.90476191,16.9105263 1.90476191,15.6315789 L1.9044409,8.00422842 C0.835899352,7.78469033 0,6.84290693 0,5.68421052 C0,4.40526316 1.04761904,3.31578946 2.38095238,3.31578946 L17.6190476,3.31578946 Z" id="形状结合" fill="#fff"></path>
                                    <path d="M10,8.7631579 C8.66666666,8.7631579 7.52380953,7.86315789 7.09523809,6.67894736 C7,6.39473684 6.7142857,6.15789474 6.42857143,6.15789474 C5.95238096,6.15789474 5.61904762,6.63157894 5.76190477,7.10526315 C6.33333334,8.90526315 8.04761904,10.1842105 10,10.1842105 C11.952381,10.1842105 13.6666667,8.90526317 14.2380952,7.10526315 C14.3809524,6.63157894 14.047619,6.15789474 13.5714286,6.15789474 C13.2380952,6.15789474 13,6.34736843 12.9047619,6.67894736 C12.4761905,7.86315789 11.3333333,8.76315788 10,8.7631579 L10,8.7631579 Z" id="路径" fill="#FFFFFF"></path>
                                  </g>
                                </g>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Push to Store</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="px-3 pb-6 pt-4 flex flex-col h-[240px] relative overflow-visible">
                  {/* Title */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                    <div className="flex-shrink-0 cursor-pointer">
                      <Image
                        src={product.supplierLogo}
                        alt={`${product.supplier} Quality Control`}
                        width={14}
                        height={14}
                        className="flex-shrink-0"
                      />
                    </div>

                    <h3
                      className="font-normal text-foreground truncate leading-tight cursor-default min-w-0 flex-1"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 leading-none mt-2">
                    <span className="text-lg font-bold text-black dark:text-white leading-none">
                      {getDisplayPrice(product)}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <svg
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => setProductSyncRuleDialogOpen(true)}
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Click to change destination country for price synchronization</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Ship To Country Select - Opens sync rule dialog for this specific product */}
                  <div className="my-3">
                    <div
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        setEditingProductId(product.id);
                        setPendingCountry(productCountries[product.id] || "us");
                        setProductSyncRuleDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center">
                        <img
                          src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${getProductCountry(product.id).code}.svg`}
                          className="inline-block w-4 h-4 align-middle mr-2"
                          alt={`${getProductCountry(product.id).name} Flag`}
                        />
                        <span className="text-sm">Price for {getProductCountry(product.id).code.toUpperCase()}</span>
                      </div>
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Thin Info Rows */}
                  <div className="mt-0">
                    {/* Language Row */}
                    <div className="flex justify-between items-center text-xs text-muted-foreground leading-none py-0.5">
                      <span>Language</span>
                      <div className="text-foreground font-normal">English</div>
                    </div>

                    {/* Stock Row */}
                    <div className="flex justify-between items-center text-xs text-muted-foreground leading-none py-0.5">
                      <span>Stock</span>
                      <div className="text-foreground font-normal">{product.stock}</div>
                    </div>
                  </div>

                  {/* Bottom Toolbar - matches mock card exactly */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      {/* Left side - Edit and Split buttons */}
                      <div className="flex items-center gap-1">
                        {/* Edit Button - opens Edit Product sheet with this product's data */}
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="cursor-pointer h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md"
                                onClick={() => {
                                  setCurrentEditingProduct(product);
                                  setEditProductSheetOpen(true);
                                }}
                              >
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="!h-6 !w-6 !size-6">
                                  <path fill="none" d="M0 0h24v24H0z"></path>
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                                </svg>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5}>
                              <p>Edit Product</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Split/Open View Button */}
                        <span
                          className="cursor-pointer h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md"
                          onClick={() => console.log('Split view clicked for:', product.id)}
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="!h-6 !w-6 !size-6">
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z"></path>
                          </svg>
                        </span>
                      </div>

                      {/* Right side - Vertical 3-Dots More Actions Button */}
                      <span
                        className="cursor-pointer h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-md"
                        onClick={() => setMoreActionsOpen(moreActionsOpen === product.id ? null : product.id)}
                        data-more-actions-trigger
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="!h-6 !w-6 !size-6">
                          <path d="M296 136c0-22.002-17.998-40-40-40s-40 17.998-40 40 17.998 40 40 40 40-17.998 40-40zm0 240c0-22.002-17.998-40-40-40s-40 17.998-40 40 17.998 40 40 40 40-17.998 40-40zm0-120c0-22.002-17.998-40-40-40s-40 17.998-40 40 17.998 40 40 40 40-17.998 40-40z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>

                </div>

                {/* More Actions Popup - Full Width, Book Opening Animation from bottom, stays within card bounds */}
                <div
                  className={`absolute left-0 right-0 bg-white dark:bg-gray-800 z-30 rounded-xl shadow-[0_-4px_12px_rgba(0,0,0,0.15),_-4px_0_8px_rgba(0,0,0,0.08),_4px_0_8px_rgba(0,0,0,0.08)] origin-bottom ${
                    moreActionsOpen === product.id
                      ? 'opacity-100'
                      : 'opacity-0 pointer-events-none'
                  }`}
                  style={{
                    bottom: '0',
                    transform: moreActionsOpen === product.id ? 'scaleY(1)' : 'scaleY(0)',
                    willChange: 'transform, opacity',
                    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 100ms ease-out'
                  }}
                  data-more-actions-popup
                >
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {/* Supplier Optimizer */}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left rounded-t-xl"
                      onClick={() => {
                        // Store the product image URL for supplier optimizer search
                        setSupplierOptimizerImage({
                          imageUrl: product.image,
                          productId: product.id,
                          productName: product.name,
                        });
                        setMoreActionsOpen(null);
                        // Navigate to supplier optimizer page
                        router.push('/supplier-optimizer');
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                        <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"></path>
                      </svg>
                      <span>Supplier Optimizer</span>
                    </button>

                    {/* Change Language */}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      onClick={() => {
                        setChangeLanguageProductId(product.id);
                        setChangeLanguageDialogOpen(true);
                        setMoreActionsOpen(null);
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path>
                      </svg>
                      <span>Change Language</span>
                    </button>

                    {/* Apply Tags */}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      onClick={() => {
                        setApplyTagsProductId(product.id);
                        setApplyTagsDialogOpen(true);
                        setMoreActionsOpen(null);
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                        <path d="M497.941 225.941L286.059 14.059A48 48 0 0 0 252.118 0H48C21.49 0 0 21.49 0 48v204.118a48 48 0 0 0 14.059 33.941l211.882 211.882c18.744 18.745 49.136 18.746 67.882 0l204.118-204.118c18.745-18.745 18.745-49.137 0-67.882zM112 160c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm513.941 133.823L421.823 497.941c-18.745 18.745-49.137 18.745-67.882 0l-.36-.36L527.64 323.522c16.999-16.999 26.36-39.6 26.36-63.64s-9.362-46.641-26.36-63.64L331.397 0h48.721a48 48 0 0 1 33.941 14.059l211.882 211.882c18.745 18.745 18.745 49.137 0 67.882z"></path>
                      </svg>
                      <span>Apply Tags</span>
                    </button>

                    {/* Shipping Info */}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      onClick={() => {
                        setCurrentEditingProduct(product);
                        setEditProductSheetTab("shipping");
                        setEditProductSheetOpen(true);
                        setMoreActionsOpen(null);
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                      </svg>
                      <span>Shipping Info</span>
                    </button>

                    {/* Delete */}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left rounded-b-xl"
                      onClick={() => {
                        setMoreActionsOpen(null);
                        // Open confirmation dialog instead of directly deleting
                        setProductToDelete(product.id);
                        setIndividualDeleteDialogOpen(true);
                      }}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Sample Product Card - Keep as reference (do NOT remove) - HIDDEN */}
            <Card className="hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200 p-0 relative overflow-hidden h-[445px]">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-lg w-full">
                  <Image
                    src={savedMainImage}
                    alt="Sample Product"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center"
                    priority
                  />
                </div>

                {/* Checkbox */}
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedItems.includes("mock-1")} // Using product ID "mock-1" for this sample card
                    onCheckedChange={() => handleSelectItem("mock-1")} // Using product ID "mock-1" for this sample card
                    className="h-5 w-5 bg-white dark:bg-gray-300 border border-gray-300 dark:border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 dark:data-[state=checked]:bg-orange-500 dark:data-[state=checked]:border-orange-500"
                  />
                </div>

                {/* Push to Store Button - Fixed Position */}
                <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 z-10 px-4 py-2">
                  <div className="flex justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="default"
                            size="icon"
                            className="rounded-full w-10 h-10 cursor-pointer hover:cursor-pointer"
                            onClick={() => console.log('Push to Store clicked')}
                          >
                            <svg width="28px" height="28px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="!w-7 !h-7 !min-w-[28px] !min-h-[28px]">
                              <g id="画板" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <rect id="矩形" fillOpacity="0" fill="#D8D8D8" x="0" y="0" width="24" height="24"></rect>
                                <g id="编组备份" transform="translate(2.000000, 3.000000)" fillRule="nonzero">
                                  <path d="M12.3809524,0 C13.9589088,0 15.2380952,1.27245387 15.2380952,2.84210526 C15.2380952,3.85749169 14.6935269,4.79574744 13.8095238,5.30344066 C12.9255207,5.81113388 11.836384,5.81113388 10.9523809,5.30344066 C10.5631504,5.07990106 10.2397254,4.77288914 9.99961642,4.41257419 C9.48853818,5.17926167 8.61307346,5.68421052 7.61904762,5.68421052 C6.04109119,5.68421052 4.76190477,4.41175665 4.76190477,2.84210526 C4.76190477,1.27245387 6.04109119,0 7.61904762,0 C8.61307346,0 9.48853818,0.504948851 10.0003557,1.27105043 C10.5114618,0.504948851 11.3869265,0 12.3809524,0 Z" id="形状结合" fillOpacity="0.5" fill="#fff"></path>
                                  <path d="M17.6190476,3.31578946 C18.952381,3.31578946 20,4.35789472 20,5.68421052 C20,6.84786494 19.1935869,7.79274606 18.095316,8.00700689 L18.0952381,15.6315789 C18.0952381,16.9578947 17.047619,18 15.7142857,18 L4.28571428,18 C2.95238094,18 1.90476191,16.9105263 1.90476191,15.6315789 L1.9044409,8.00422842 C0.835899352,7.78469033 0,6.84290693 0,5.68421052 C0,4.40526316 1.04761904,3.31578946 2.38095238,3.31578946 L17.6190476,3.31578946 Z" id="形状结合" fill="#fff"></path>
                                  <path d="M10,8.7631579 C8.66666666,8.7631579 7.52380953,7.86315789 7.09523809,6.67894736 C7,6.39473684 6.7142857,6.15789474 6.42857143,6.15789474 C5.95238096,6.15789474 5.61904762,6.63157894 5.76190477,7.10526315 C6.33333334,8.90526315 8.04761904,10.1842105 10,10.1842105 C11.952381,10.1842105 13.6666667,8.90526317 14.2380952,7.10526315 C14.3809524,6.63157894 14.047619,6.15789474 13.5714286,6.15789474 C13.2380952,6.15789474 13,6.34736843 12.9047619,6.67894736 C12.4761905,7.86315789 11.3333333,8.76315788 10,8.7631579 L10,8.7631579 Z" id="路径" fill="#FFFFFF"></path>
                                </g>
                              </g>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Push to Store</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="px-3 pb-6 pt-4 flex flex-col h-[240px] relative overflow-visible">
                {/* Title */}
                <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                  <div className="flex-shrink-0 cursor-pointer">
                    <Image
                      src="/aliexpressQualityControl.png"
                      alt="AliExpress Quality Control"
                      width={14}
                      height={14}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  <h3 
                    className="font-normal text-foreground truncate leading-tight cursor-default min-w-0 flex-1"
                    title="Wireless Bluetooth Headphones Premium Quality Sound"
                  >
                    Wireless Bluetooth Headphones Premium Quality Sound
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 leading-none mt-2">
                  <span className="text-lg font-bold text-black dark:text-white leading-none">
                    US $24.99-$39.99
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground hover:text-foreground">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>After importing, the cost displayed on the supplier's page may differ from what you see on DShipIt, as the selected destination country may vary between the two platforms. Please make sure to check it first.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Ship To Country Select - Mock card reference (dialog is shared outside grid) */}
                <div className="my-3">
                  <div
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      setEditingProductId("mock-product");
                      setPendingCountry(productCountries["mock-product"] || "us");
                      setProductSyncRuleDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center">
                      <img
                        src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${getProductCountry("mock-product").code}.svg`}
                        className="inline-block w-4 h-4 align-middle mr-2"
                        alt={`${getProductCountry("mock-product").name} Flag`}
                      />
                      <span className="text-sm">Price for {getProductCountry("mock-product").code.toUpperCase()}</span>
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </div>
                </div>

                {/* Thin Info Rows */}
                <div className="mt-0">
                  {/* Language Row */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground leading-none py-0.5">
                    <span>Language</span>
                    <div className="text-foreground font-normal">English</div>
                  </div>

                  {/* Stock Row */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground leading-none py-0.5">
                    <span>Stock</span>
                    <div className="text-foreground font-normal">434</div>
                  </div>
                </div>

                {/* Bottom Toolbar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 transition-colors text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              onClick={() => {
                                // Mock card - set currentEditingProduct to null to indicate mock
                                setCurrentEditingProduct(null);
                                setEditProductSheetOpen(true);
                              }}
                            >
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="!h-6 !w-6 !size-6">
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={5}>
                            <p>Edit Product</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Product Sheet - Shared across all product cards */}
        <Sheet
          open={editProductSheetOpen}
          onOpenChange={(open) => {
            if (!open && hasUnsavedChanges) {
              setShowUnsavedChangesDialog(true);
              return;
            }
            setEditProductSheetOpen(open);
            if (!open) {
              setHasUnsavedChanges(false);
              setSelectedVariantItems([]);
              setSelectedVariantOptions([]);
              setCurrentEditingProduct(null);
              setEditProductSheetTab("products"); // Reset to default tab
            }
          }}
        >
          <SheetContent className="!max-w-[1330px] w-[1330px]">
            {editProductSheetOpen && (
                                <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a]">
                                  {/* Header */}
                                  <div className="px-6 py-2">
                                    <div className="max-w-7xl mx-auto">
                                      <SheetHeader className="space-y-2">
                                        <SheetTitle className="font-light text-primary tracking-tight" style={{ fontSize: 'var(--opensheet-fullwidth-title-size)' }}>
                                          Edit product detail
                                        </SheetTitle>
                                        <p className="text-foreground leading-5 font-light" style={{ fontSize: 'var(--opensheet-fullwidth-description-size)' }}>
                                          If you run into problems, you can{" "}
                                          <button className="text-primary hover:text-primary/80 underline transition-colors">
                                            click here for an introduction to this feature
                                          </button>
                                          .
                                        </p>
                                      </SheetHeader>
                                    </div>
                                  </div>

                                  {/* Shadcn Navigation and Content */}
                                  <div className="px-6 mt-0">
                                    <div className="max-w-7xl mx-auto">
                                      <Tabs value={editProductSheetTab} onValueChange={setEditProductSheetTab} className="w-full">
                                        <TabsList className="h-10 bg-transparent gap-2.5 p-0">
                                          <TabsTrigger value="products" className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]">
                                            Products
                                          </TabsTrigger>
                                          <TabsTrigger value="variants" className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]">
                                            Variants
                                          </TabsTrigger>
                                          <TabsTrigger value="description" className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black group rounded-[12.5rem]">
                                            <span className="flex items-center gap-2 text-base">
                                              Description
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <span className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer">
                                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="14" width="14" xmlns="http://www.w3.org/2000/svg" className="text-black group-data-[state=active]:text-white" style={{marginLeft: "4px"}}>
                                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
                                                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"></path>
                                                      </svg>
                                                    </span>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="max-w-sm">
                                                    <p>Due to character limitations on product descriptions, to ensure the efficiency of product pushes, the excess characters will be automatically removed during the push process. Please check your store promptly.</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </span>
                                          </TabsTrigger>
                                          <TabsTrigger value="images" className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]">
                                            Images
                                          </TabsTrigger>
                                          <TabsTrigger value="shipping" className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]">
                                            Shipping info
                                          </TabsTrigger>
                                        </TabsList>

                                        {/* Microsoft-style Content */}
                                        <div className="flex-1 overflow-y-auto py-8" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                                        <TabsContent value="products" className="mt-0">
                                          <div className="w-full bg-card">
                                            <div className="flex gap-8 h-80">
                                              {/* Left side - Image */}
                                              <div className="flex-shrink-0 flex flex-col h-full">
                                                <div className="w-64 flex-1 border border-border rounded-lg overflow-hidden bg-muted mb-3">
                                                  <img 
                                                    src={selectedMainImage} 
                                                    alt="Product" 
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                                <Button 
                                                  variant="outline" 
                                                  className="w-full"
                                                  onClick={() => setChangeOptionPictureSheetOpen(true)}
                                                >
                                                  CHANGE IMAGE
                                                </Button>
                                              </div>
                                              
                                              {/* Right side - Product details */}
                                              <div className="flex-1 flex flex-col justify-between h-full">
                                                {/* Title editor */}
                                                <div>
                                                  <div className="flex items-center justify-between mb-3 min-h-[2rem] max-h-[2rem]">
                                                    <div className="flex items-center gap-2">
                                                      <label className="text-lg font-semibold text-foreground">Title</label>
                                                      <TooltipProvider>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <span className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer">
                                                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="14" width="14" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
                                                                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"></path>
                                                              </svg>
                                                            </span>
                                                          </TooltipTrigger>
                                                          <TooltipContent className="max-w-sm">
                                                            <p>Due to character limitations on product names, excess characters are automatically removed when products are pushed to the store. Please check your store after pushing products.</p>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </TooltipProvider>
                                                    </div>
                                                    <DShipItAiSheet
                                                      trigger={
                                                        <div className="flex items-center flex-shrink-0 relative cursor-pointer">
                                                          <img src="/aigif3.gif" alt="AI" className="h-12 w-auto" />
                                                        </div>
                                                      }
                                                      initialProductTitle={productTitle}
                                                      onOptimizedTitle={(optimizedTitle) => {
                                                        setProductTitle(optimizedTitle);
                                                        setHasUnsavedChanges(true);
                                                      }}
                                                    />
                                                  </div>
                                                  <input 
                                                    type="text" 
                                                    value={productTitle}
                                                    data-slot="input"
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-base shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground"
                                                    onChange={(e) => {
                                                      setProductTitle(e.target.value);
                                                      setHasUnsavedChanges(true);
                                                    }}
                                                  />
                                                  {/* Vendor info */}
                                                  <div className="text-foreground mt-1 text-xs">
                                                    From <span className="text-foreground">AliExpress</span>
                                                  </div>
                                                </div>
                                                
                                                {/* Reference Weight */}
                                                <div>
                                                  <label className="block text-lg font-semibold text-foreground mb-3">Weight</label>
                                                  <div className="flex gap-2">
                                                    <div className="flex-1">
                                                      <DsiCounterbox
                                                        value={weightValue.toFixed(2)}
                                                        onChange={(value) => {
                                                          setWeightValue(parseFloat(value) || 0);
                                                          setHasUnsavedChanges(true);
                                                        }}
                                                        placeholder="0.10"
                                                      />
                                                    </div>
                                                    <div className="w-[119px]">
                                                      <Select 
                                                        value={weightUnit} 
                                                        onValueChange={(unit) => {
                                                          setWeightUnit(unit);
                                                          setHasUnsavedChanges(true);
                                                        }}
                                                      >
                                                        <SelectTrigger className="h-10">
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="gm">grams</SelectItem>
                                                          <SelectItem value="kg">kg</SelectItem>
                                                          <SelectItem value="lb">lbs</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                {/* Dimensions */}
                                                <div>
                                                  <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-lg font-semibold text-foreground">Size</label>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      className="h-auto p-0 font-medium text-orange-500 hover:text-orange-600 hover:bg-transparent border-none shadow-none flex items-center gap-2"
                                                      onClick={() => {
                                                        setDefaultParcelSheetOpen(true);
                                                      }}
                                                    >
                                                      <svg 
                                                        stroke="currentColor" 
                                                        fill="currentColor" 
                                                        strokeWidth="1" 
                                                        viewBox="0 0 1024 1024" 
                                                        height="24" 
                                                        width="24" 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        className="text-orange-500"
                                                      >
                                                        <path d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1 0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1 74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5 0-15.3 1.2-30.6 3.7-45.5l6.5-40-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2 31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3 17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97 38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8 92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z"></path>
                                                      </svg>
                                                      <span className="text-base font-normal">Default Parcel Information</span>
                                                    </Button>
                                                  </div>
                                                  <div className="flex items-end gap-3">
                                                    <div className="flex-1">
                                                      <label className="block mb-2">Length</label>
                                                      <DsiCounterbox
                                                        value={length.toFixed(2)}
                                                        onChange={(value) => {
                                                          setLength(parseFloat(value) || 0);
                                                          setHasUnsavedChanges(true);
                                                        }}
                                                        placeholder="0.00"
                                                      />
                                                    </div>
                                                    <div className="flex-1">
                                                      <label className="block mb-2">Width</label>
                                                      <DsiCounterbox
                                                        value={width.toFixed(2)}
                                                        onChange={(value) => {
                                                          setWidth(parseFloat(value) || 0);
                                                          setHasUnsavedChanges(true);
                                                        }}
                                                        placeholder="0.00"
                                                      />
                                                    </div>
                                                    <div className="flex-1">
                                                      <label className="block mb-2">Height</label>
                                                      <DsiCounterbox
                                                        value={height.toFixed(2)}
                                                        onChange={(value) => {
                                                          setHeight(parseFloat(value) || 0);
                                                          setHasUnsavedChanges(true);
                                                        }}
                                                        placeholder="0.00"
                                                      />
                                                    </div>
                                                    <div className="space-y-2">
                                                      <label className="block mb-2 ml-1">Unit</label>
                                                      <Select value={dimensionUnit} onValueChange={(unit) => {
                                                        setDimensionUnit(unit);
                                                        setHasUnsavedChanges(true);
                                                      }}>
                                                        <SelectTrigger className="!h-[42px] w-20">
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="cm">cm</SelectItem>
                                                          <SelectItem value="m">m</SelectItem>
                                                          <SelectItem value="in">in</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Connected Stores Section */}
                                            <div className="mt-8 mb-6 w-full">
                                              <div className="!border !border-gray-200 !rounded-lg overflow-hidden" style={{border: '1px solid rgb(229, 231, 235)'}}>
                                                <Accordion type="single" collapsible defaultValue="ebay-preset" className="w-full">
                                                  <AccordionItem value="ebay-preset" className="!border-none !border-0" style={{border: 'none'}}>
                                                  <AccordionTrigger className="px-4 py-4 hover:no-underline text-base font-medium">
                                                    eBay Pre-setting
                                                  </AccordionTrigger>
                                                  <AccordionContent className="px-4 pb-4">
                                                    <Sheet>
                                                      <SheetTrigger asChild>
                                                        <div 
                                                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                          onClick={() => setCurrentStoreName("spiderco")}
                                                        >
                                                          <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 flex-shrink-0">
                                                              <img
                                                                src="/images/ui/info-tooltip.png"
                                                                alt="Store logo"
                                                                className="w-full h-full object-contain"
                                                              />
                                                            </div>
                                                            <span className="font-medium">{currentStoreName}</span>
                                                          </div>
                                                          <div className="text-gray-500">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>
                                                            </svg>
                                                          </div>
                                                        </div>
                                                      </SheetTrigger>
                                                      <SheetContent className="sm:max-w-[800px] w-full">
                                                        <SheetHeader className="px-8 py-6 border-b">
                                                          <SheetTitle className="text-2xl font-semibold text-gray-900" style={{fontSize: '26px'}}>Store Configuration</SheetTitle>
                                                          <SheetDescription className="text-gray-500 mt-2 text-base font-light">
                                                            Configure marketplace settings and business policies for {currentStoreName}
                                                          </SheetDescription>
                                                        </SheetHeader>
                                                        
                                                        <div className="flex-1 px-8 py-6 space-y-8 max-h-[calc(100vh-180px)] overflow-y-auto">
                                                          {/* Marketplace Section */}
                                                          <div className="space-y-6">
                                                            <div className="space-y-2">
                                                              <h3 className="text-lg font-medium text-gray-900">Marketplace Settings</h3>
                                                              <p className="text-gray-500">Select your target marketplace</p>
                                                            </div>
                                                            
                                                            <div className="space-y-3">
                                                              <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                                                                <SelectTrigger id="marketplace" className="w-full h-11 border-gray-300">
                                                                  <SelectValue placeholder="Select marketplace" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                  <SelectItem value="austria">Austria</SelectItem>
                                                                  <SelectItem value="australia">Australia</SelectItem>
                                                                  <SelectItem value="belgium-french">Belgium_French</SelectItem>
                                                                  <SelectItem value="belgium-dutch">Belgium_dutch</SelectItem>
                                                                  <SelectItem value="canada-french">Canada_French</SelectItem>
                                                                  <SelectItem value="canada-english">Canada_English</SelectItem>
                                                                  <SelectItem value="switzerland">Switzerland</SelectItem>
                                                                  <SelectItem value="philippines">Philippines</SelectItem>
                                                                  <SelectItem value="poland">Poland</SelectItem>
                                                                  <SelectItem value="singapore">Singapore</SelectItem>
                                                                  <SelectItem value="taiwan">Taiwan, China</SelectItem>
                                                                  <SelectItem value="united-states">United States</SelectItem>
                                                                  <SelectItem value="thailand">Thailand</SelectItem>
                                                                  <SelectItem value="france">France</SelectItem>
                                                                  <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                                                                  <SelectItem value="hong-kong">Hong Kong, China</SelectItem>
                                                                  <SelectItem value="ireland">Ireland</SelectItem>
                                                                  <SelectItem value="italy">Italy</SelectItem>
                                                                  <SelectItem value="malaysia">Malaysia</SelectItem>
                                                                  <SelectItem value="netherlands">Netherlands</SelectItem>
                                                                  <SelectItem value="germany">Germany</SelectItem>
                                                                  <SelectItem value="spain">Spain</SelectItem>
                                                                </SelectContent>
                                                              </Select>
                                                            </div>
                                                          </div>

                                                          {/* Business Policies Section */}
                                                          <div className="space-y-6">
                                                            <div className="space-y-2">
                                                              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                                Business Policies
                                                                <TooltipProvider>
                                                                  <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                      <div className="w-4 h-4 text-black hover:text-black cursor-help">
                                                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                          <path fill="none" strokeMiterlimit="10" strokeWidth="32" d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z"></path>
                                                                          <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M220 220h32v116"></path>
                                                                          <path fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M208 340h88"></path>
                                                                          <path d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"></path>
                                                                        </svg>
                                                                      </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                      <p className="max-w-xs">DShipIt does not currently support creating Business Policies. If you don't have any Business Policies, please create them from your store. Policies vary between Marketplaces.</p>
                                                                    </TooltipContent>
                                                                  </Tooltip>
                                                                </TooltipProvider>
                                                              </h3>
                                                              <p className="text-gray-500">Configure payment, return, and shipping policies</p>
                                                            </div>
                                                            
                                                            <div className="grid gap-6">
                                                              {/* Payment Policy */}
                                                              <div className="space-y-3">
                                                                {/* TODO: Wire to selected store's payment policies via API */}
                                                                <Select value={selectedPaymentPolicy} onValueChange={setSelectedPaymentPolicy}>
                                                                  <SelectTrigger id="payment_policy" className="w-full h-11 border-gray-300">
                                                                    <SelectValue placeholder="Select payment policy" />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                    {/* When API data is available, render policies here */}
                                                                    {false ? ( // Replace with actual API data check
                                                                      <>
                                                                        {/* Payment policies from API will be rendered here */}
                                                                      </>
                                                                    ) : (
                                                                      <div className="flex flex-col items-center justify-center py-6 px-4">
                                                                        <svg className="w-8 h-8 text-black mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                        </svg>
                                                                        <p className="text-gray-500 text-center">No payment policies found</p>
                                                                        <p className="text-xs text-gray-400 text-center mt-1">Create policies in your store first</p>
                                                                      </div>
                                                                    )}
                                                                  </SelectContent>
                                                                </Select>
                                                              </div>

                                                              {/* Return Policy */}
                                                              <div className="space-y-3">
                                                                {/* TODO: Wire to selected store's return policies via API */}
                                                                <Select value={selectedReturnPolicy} onValueChange={(value) => {
                                                                  setSelectedReturnPolicy(value);
                                                                  setHasUnsavedChanges(true);
                                                                }}>
                                                                  <SelectTrigger id="return_policy" className="w-full h-11 border-gray-300">
                                                                    <SelectValue placeholder="Select return policy" />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                    {/* When API data is available, render policies here */}
                                                                    {false ? ( // Replace with actual API data check
                                                                      <>
                                                                        {/* Return policies from API will be rendered here */}
                                                                      </>
                                                                    ) : (
                                                                      <div className="flex flex-col items-center justify-center py-6 px-4">
                                                                        <svg className="w-8 h-8 text-black mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                        </svg>
                                                                        <p className="text-gray-500 text-center">No return policies found</p>
                                                                        <p className="text-xs text-gray-400 text-center mt-1">Create policies in your store first</p>
                                                                      </div>
                                                                    )}
                                                                  </SelectContent>
                                                                </Select>
                                                              </div>

                                                              {/* Shipping Policy */}
                                                              <div className="space-y-3">
                                                                {/* TODO: Wire to selected store's shipping policies via API */}
                                                                <Select value={selectedShippingPolicy} onValueChange={(value) => {
                                                                  setSelectedShippingPolicy(value);
                                                                  setHasUnsavedChanges(true);
                                                                }}>
                                                                  <SelectTrigger id="shipping_policy" className="w-full h-11 border-gray-300">
                                                                    <SelectValue placeholder="Select shipping policy" />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                    {/* When API data is available, render policies here */}
                                                                    {false ? ( // Replace with actual API data check
                                                                      <>
                                                                        {/* Shipping policies from API will be rendered here */}
                                                                      </>
                                                                    ) : (
                                                                      <div className="flex flex-col items-center justify-center py-6 px-4">
                                                                        <svg className="w-8 h-8 text-black mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                        </svg>
                                                                        <p className="text-gray-500 text-center">No shipping policies found</p>
                                                                        <p className="text-xs text-gray-400 text-center mt-1">Create policies in your store first</p>
                                                                      </div>
                                                                    )}
                                                                  </SelectContent>
                                                                </Select>
                                                              </div>
                                                            </div>
                                                          </div>

                                                          {/* Location Section */}
                                                          <div className="space-y-6">
                                                            <div className="space-y-2">
                                                              <h3 className="text-lg font-medium text-gray-900">Fulfillment Settings</h3>
                                                              <p className="text-gray-500">Configure warehouse location and package specifications</p>
                                                            </div>
                                                            
                                                            <div className="space-y-3">
                                                              <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                  <label className="font-medium text-gray-700">Warehouse Location</label>
                                                                  <TooltipProvider>
                                                                    <Tooltip>
                                                                      <TooltipTrigger asChild>
                                                                        <div className="w-4 h-4 text-black hover:text-black">
                                                                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                            <path fill="none" strokeMiterlimit="10" strokeWidth="32" d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z"></path>
                                                                            <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M220 220h32v116"></path>
                                                                            <path fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M208 340h88"></path>
                                                                            <path d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"></path>
                                                                          </svg>
                                                                        </div>
                                                                      </TooltipTrigger>
                                                                      <TooltipContent>
                                                                        <p className="max-w-xs">Not all shipping methods may be available for your selected location. Verify carrier coverage before proceeding.</p>
                                                                      </TooltipContent>
                                                                    </Tooltip>
                                                                  </TooltipProvider>
                                                                </div>
                                                                <Dialog open={isAddLocationDialogOpen} onOpenChange={(open) => {
                                                                  setIsAddLocationDialogOpen(open);
                                                                  if (!open) {
                                                                    resetLocationForm();
                                                                  }
                                                                }}>
                                                                  <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs text-gray-600">
                                                                      Add Location
                                                                    </Button>
                                                                  </DialogTrigger>
                                                                  <DialogContent className="w-[480px] h-[440px] max-w-[480px] max-h-[440px] p-0 flex flex-col overflow-hidden">
                                                                    {/* Modal Header */}
                                                                    <DialogHeader className="px-6 py-4 flex-shrink-0">
                                                                      <DialogTitle className="text-xl font-medium text-foreground">Add location</DialogTitle>
                                                                    </DialogHeader>
                                                                    
                                                                    {/* Modal Body */}
                                                                    <div className="flex-1 px-6 py-2 overflow-y-auto">
                                                                      <div className="space-y-4">
                                                                        {/* Name Field */}
                                                                        <div className="flex items-center space-x-3">
                                                                          <span className="text-foreground w-20">Name:</span>
                                                                          <Input
                                                                            placeholder="Please enter the location name"
                                                                            maxLength={1000}
                                                                            type="text"
                                                                            value={locationName}
                                                                            onChange={(e) => setLocationName(e.target.value)}
                                                                            className="flex-1 h-[38px]"
                                                                          />
                                                                        </div>

                                                                        {/* Country Field */}
                                                                        <div className="flex items-center space-x-3">
                                                                          <span className="text-foreground w-20">Country:</span>
                                                                          <Select value={locationCountry} onValueChange={setLocationCountry}>
                                                                            <SelectTrigger className="flex-1 h-[38px]">
                                                                              <SelectValue placeholder="Please select a country" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                              {COUNTRIES.map((country) => (
                                                                                <SelectItem key={country.code} value={country.code}>
                                                                                  {country.name}
                                                                                </SelectItem>
                                                                              ))}
                                                                            </SelectContent>
                                                                          </Select>
                                                                        </div>

                                                                        {/* Province Field */}
                                                                        <div className="flex items-center space-x-3">
                                                                          <span className="text-foreground w-20">Province:</span>
                                                                          <Input
                                                                            placeholder="Please enter the province"
                                                                            maxLength={1000}
                                                                            type="text"
                                                                            value={locationProvince}
                                                                            onChange={(e) => setLocationProvince(e.target.value)}
                                                                            className="flex-1 h-[38px]"
                                                                          />
                                                                        </div>

                                                                        {/* City Field */}
                                                                        <div className="flex items-center space-x-3">
                                                                          <span className="text-foreground w-20">City:</span>
                                                                          <Input
                                                                            placeholder="Please enter the city"
                                                                            maxLength={1000}
                                                                            type="text"
                                                                            value={locationCity}
                                                                            onChange={(e) => setLocationCity(e.target.value)}
                                                                            className="flex-1 h-[38px]"
                                                                          />
                                                                        </div>

                                                                        {/* Zip Code Field */}
                                                                        <div className="flex items-center space-x-3">
                                                                          <span className="text-foreground w-20">Zip code:</span>
                                                                          <Input
                                                                            maxLength={16}
                                                                            placeholder="Please enter the Zip code"
                                                                            type="text"
                                                                            value={locationZipCode}
                                                                            onChange={(e) => setLocationZipCode(e.target.value)}
                                                                            className="flex-1 h-[38px]"
                                                                          />
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                    
                                                                    {/* Modal Footer */}
                                                                    <div className="px-6 py-4 flex-shrink-0">
                                                                      <div className="flex justify-end">
                                                                        <Button 
                                                                          disabled={!isLocationFormValid()} 
                                                                          className={`px-6 ${!isLocationFormValid() ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                                                                          onClick={addLocation}
                                                                        >
                                                                          <span>Confirm</span>
                                                                        </Button>
                                                                      </div>
                                                                    </div>
                                                                  </DialogContent>
                                                                </Dialog>
                                                              </div>
                                                              <div className="flex items-center space-x-2">
                                                                <Select value={selectedWarehouseLocation} onValueChange={setSelectedWarehouseLocation}>
                                                                  <SelectTrigger className="w-full h-11 border-gray-300">
                                                                    <SelectValue placeholder="Select warehouse location" />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                    {warehouseLocations.length > 0 ? (
                                                                      warehouseLocations.map((location) => (
                                                                        <SelectItem key={location.id} value={location.id}>
                                                                          <span className="font-medium">
                                                                            {location.name}-{location.country.toUpperCase()}-{location.zipCode}
                                                                          </span>
                                                                        </SelectItem>
                                                                      ))
                                                                    ) : (
                                                                      <div className="flex flex-col items-center justify-center py-6 px-4">
                                                                        <svg className="w-8 h-8 text-black mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                        </svg>
                                                                        <p className="text-gray-500 text-center">No warehouse locations found</p>
                                                                        <p className="text-xs text-gray-400 text-center mt-1">Create locations using "Add Location" button above</p>
                                                                      </div>
                                                                    )}
                                                                  </SelectContent>
                                                                </Select>
                                                                {selectedWarehouseLocation && (
                                                                  <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => deleteLocation(selectedWarehouseLocation)}
                                                                  >
                                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                    </svg>
                                                                  </Button>
                                                                )}
                                                              </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                              <div className="flex items-center gap-2">
                                                                <label className="font-medium text-gray-700">Package Type</label>
                                                                <TooltipProvider>
                                                                  <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                      <div className="w-4 h-4 text-gray-400 hover:text-gray-600">
                                                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                          <path fill="none" strokeMiterlimit="10" strokeWidth="32" d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z"></path>
                                                                          <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M220 220h32v116"></path>
                                                                          <path fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M208 340h88"></path>
                                                                          <path d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"></path>
                                                                        </svg>
                                                                      </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                      <p className="max-w-xs">Ensure your package type complies with {/* TODO: Wire to selected marketplace name */}eBay's policies to prevent push failures.</p>
                                                                    </TooltipContent>
                                                                  </Tooltip>
                                                                </TooltipProvider>
                                                              </div>
                                                              <Select value={selectedPackageType} onValueChange={(value) => {
                                                                setSelectedPackageType(value);
                                                                setHasUnsavedChanges(true);
                                                              }}>
                                                                <SelectTrigger id="package_type" className="w-full h-11 border-gray-300">
                                                                  <SelectValue placeholder="Select package type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                  <SelectItem value="bulky-goods">Bulky goods</SelectItem>
                                                                  <SelectItem value="caravan">Caravan</SelectItem>
                                                                  <SelectItem value="cars">Cars</SelectItem>
                                                                  <SelectItem value="europallet">Europallet</SelectItem>
                                                                  <SelectItem value="expandable-tough-bags">Expandable tough bags</SelectItem>
                                                                  <SelectItem value="extra-large-pack">Extra large pack</SelectItem>
                                                                  <SelectItem value="furniture">Furniture</SelectItem>
                                                                  <SelectItem value="industry-vehicles">Industry vehicles</SelectItem>
                                                                  <SelectItem value="large-canada-postbox">Large Canada postbox</SelectItem>
                                                                  <SelectItem value="large-canada-post-bubble-mailer">Large Canada post bubble mailer</SelectItem>
                                                                  <SelectItem value="large-envelope">Large envelope</SelectItem>
                                                                  <SelectItem value="letter">Letter</SelectItem>
                                                                  <SelectItem value="mailing-box">Mailing box</SelectItem>
                                                                  <SelectItem value="medium-canada-post-box">Medium Canada post box</SelectItem>
                                                                  <SelectItem value="medium-canada-post-bubble-mailer">Medium Canada post bubble mailer</SelectItem>
                                                                  <SelectItem value="motorbikes">Motorbikes</SelectItem>
                                                                  <SelectItem value="one-way-pallet">One way pallet</SelectItem>
                                                                  <SelectItem value="package-thick-envelope">Package thick envelope</SelectItem>
                                                                  <SelectItem value="padded-bags">Padded bags</SelectItem>
                                                                  <SelectItem value="parcel-or-padded-envelope">Parcel or padded envelope</SelectItem>
                                                                  <SelectItem value="roll">Roll</SelectItem>
                                                                  <SelectItem value="small-canada-post-box">Small Canada post box</SelectItem>
                                                                  <SelectItem value="small-canada-post-bubble-mailer">Small Canada post bubble mailer</SelectItem>
                                                                  <SelectItem value="tough-bags">Tough bags</SelectItem>
                                                                  <SelectItem value="ups-letter">Ups letter</SelectItem>
                                                                  <SelectItem value="usps-flat-rate-envelope">Usps flat rate envelope</SelectItem>
                                                                  <SelectItem value="usps-large-pack">Usps large pack</SelectItem>
                                                                  <SelectItem value="very-large-pack">Very large pack</SelectItem>
                                                                  <SelectItem value="wine-pak">Wine pak</SelectItem>
                                                                </SelectContent>
                                                              </Select>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        
                                                        {/* Footer */}
                                                        <div className="sticky bottom-0 left-0 right-0 bg-white border-t px-8 py-4 flex justify-between items-center">
                                                          <Button variant="outline" size="default" className="px-6">
                                                            Cancel
                                                          </Button>
                                                          <Button 
                                                            variant="default" 
                                                            size="default" 
                                                            className="px-8"
                                                            disabled={!isStoreConfigValid()}
                                                          >
                                                            Save Settings
                                                          </Button>
                                                        </div>
                                                      </SheetContent>
                                                    </Sheet>
                                                  </AccordionContent>
                                                  </AccordionItem>
                                                </Accordion>
                                              </div>
                                            </div>
                                          </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="variants" className="mt-0">
                                          <div className="w-full space-y-4">
                                            {/* VariantsTabBar Component */}
                                            <VariantsTabBar
                                              onActionSelect={(action) => {
                                                console.log('Action selected:', action);
                                                switch (action) {
                                                  case 'change-option-picture':
                                                    setChangeOptionPictureSheetOpen(true);
                                                    break;
                                                  case 'change-price':
                                                    setChangePriceDialogOpen(true);
                                                    break;
                                                  case 'change-compare-price':
                                                    setChangeCompareAtPriceDialogOpen(true);
                                                    break;
                                                  case 'change-stock':
                                                    setChangeStockDialogOpen(true);
                                                    break;
                                                  case 'delete-variants':
                                                    setDeleteVariantsDialogOpen(true);
                                                    break;
                                                  case 'duplicate-variant':
                                                    setDuplicateVariantDialogOpen(true);
                                                    break;
                                                  default:
                                                    console.log('Unhandled action:', action);
                                                }
                                              }}
                                              onShipToChange={(country, state, city) => {
                                                console.log('Ship to changed:', country, state, city);
                                                setHasUnsavedChanges(true);
                                              }}
                                              onShippingMethodChange={(method) => {
                                                console.log('Shipping method changed:', method);
                                                setHasUnsavedChanges(true);
                                              }}
                                              onEditOptions={(optionName, options) => {
                                                console.log('Edit options saved:', { optionName, options });
                                                // Update the variant type and available options
                                                setVariantType(optionName);
                                                // Here you would also update the variantOptionsMap if needed
                                                setHasUnsavedChanges(true);
                                              }}
                                              onPricingRuleChange={(enabled, pricing) => {
                                                console.log('Pricing rule changed:', enabled, pricing);
                                                setPricingRuleEnabled(enabled);
                                                setHasUnsavedChanges(true);
                                              }}
                                              onVariantPricingUpdate={(updatedVariants) => {
                                                console.log('Variant pricing updated:', updatedVariants);
                                                // Don't update productVariants here as it expects a different type
                                                // The VariantsTabBar handles its own pricing calculations
                                              }}
                                              shipToValue="United States"
                                              shippingMethodValue="AliExpress standard shipping"
                                              pricingRuleEnabled={pricingRuleEnabled}
                                              selectedProductsCount={selectedVariantItems.length}
                                              productVariants={productVariants}
                                              variantType={variantType}
                                              availableVariantOptions={availableVariantOptions}
                                              selectedVariantOptions={selectedVariantOptions}
                                              onVariantOptionToggle={handleVariantOptionToggle}
                                            />

                                            {/* Data Grid Container with Sticky Column */}
                                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[calc(100vh-240px)]">
                                              <div className="relative flex flex-col h-full">
                                                {/* Fixed Header Section */}
                                                <div className="flex-shrink-0">
                                                  {/* Column Headers */}
                                                  <div className="overflow-x-auto">
                                                    <div className="bg-gray-100 border-b border-gray-200 h-9 flex items-center">
                                                      {/* Checkbox Header */}
                                                      <div className="w-12 flex items-center justify-center  sticky left-0 bg-gray-100 z-20">
                                                        <Checkbox 
                                                          className="h-4 w-4"
                                                          checked={allVariantsSelected}
                                                          onCheckedChange={(checked) => {
                                                            handleSelectAllVariants(checked === true);
                                                            setHasUnsavedChanges(true);
                                                          }}
                                                        />
                                                      </div>
                                                      <div className="flex-1 min-w-[120px] px-2 py-1 text-sm font-medium text-black  whitespace-nowrap">SKU</div>
                                                      <div className="flex-1 min-w-[100px] px-2 py-1 text-sm font-medium text-black  whitespace-nowrap">{variantType}</div>
                                                      <div className="flex-1 min-w-[80px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Cost</div>
                                                      <div className="flex-1 min-w-[80px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Shipping</div>
                                                      <div className="flex-1 min-w-[100px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Tax/Import</div>
                                                      <div className="flex-1 min-w-[80px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Total</div>
                                                      <div className="flex-1 min-w-[80px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Margin</div>
                                                      <div className="flex-1 min-w-[80px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Price</div>
                                                      <div className="flex-1 min-w-[100px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Compare At</div>
                                                      <div className="flex-1 min-w-[90px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Store Stock</div>
                                                      <div className="flex-1 min-w-[90px] px-2 py-1 text-sm font-medium text-black  text-right whitespace-nowrap">Ali Stock</div>
                                                      <div className="w-16 px-2 py-1 text-sm font-medium text-black whitespace-nowrap"></div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Scrollable Data Section */}
                                                <div className="flex-1 overflow-y-auto min-h-0 relative">
                                                  {/* Scrollable Content */}
                                                  <div>
                                                    {/* Dynamic Rows */}
                                                    <div>
                                                      {productVariants.map((variant, index) => {
                                                        const totalCost = variant.supplierPrice + (variant.shippingCost || 0);
                                                        const profitMarginValue = ((variant.currentPrice - totalCost) / variant.currentPrice * 100);
                                                        const isSelected = selectedVariantItems.includes(parseInt(variant.id));
                                                        
                                                        return (
                                                          <div key={variant.id} className={`h-9 flex hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} items-center border-b border-gray-200`}>
                                                            {/* Checkbox Column */}
                                                            <div className={`w-12 flex items-center justify-center  sticky left-0 z-10 ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}>
                                                              <Checkbox 
                                                                className="h-4 w-4"
                                                                checked={selectedVariantItems.includes(parseInt(variant.id))}
                                                                onCheckedChange={(checked) => {
                                                                  handleVariantCheckboxChange(parseInt(variant.id), checked === true);
                                                                  setHasUnsavedChanges(true);
                                                                }}
                                                              />
                                                            </div>
                                                            <div className="flex-1 min-w-[120px] px-2 py-1  flex items-center text-sm whitespace-nowrap">{variant.sku}</div>
                                                            <div className="flex-1 min-w-[100px] px-2 py-1  flex items-center text-sm whitespace-nowrap">
                                                              {variant.variantOption}
                                                            </div>
                                                            <div className="flex-1 min-w-[80px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">{variant.supplierPrice.toFixed(2)}</div>
                                                            <div className="flex-1 min-w-[80px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">$ {(variant.shippingCost || 0).toFixed(2)}</div>
                                                            <div className="flex-1 min-w-[100px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">--</div>
                                                            <div className="flex-1 min-w-[80px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">{totalCost.toFixed(2)}</div>
                                                            <div className={`flex-1 min-w-[80px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap ${profitMarginValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                              {profitMarginValue.toFixed(2)}%
                                                            </div>
                                                            <div className="flex-1 min-w-[80px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">{variant.currentPrice.toFixed(2)}</div>
                                                            <div className="flex-1 min-w-[100px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">{(variant.compareAtPrice || 0).toFixed(2)}</div>
                                                            <div className="flex-1 min-w-[90px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">
                                                              {Math.floor(Math.random() * 100) + 50}
                                                            </div>
                                                            <div className="flex-1 min-w-[90px] px-2 py-1  flex items-center justify-end text-sm whitespace-nowrap">
                                                              {Math.floor(Math.random() * 100) + 50}
                                                            </div>
                                                            <div className="w-16 px-2 py-1 flex items-center justify-center whitespace-nowrap">
                                                              <button 
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={() => {
                                                                  // Handle delete variant
                                                                  const updatedVariants = productVariants.filter(v => v.id !== variant.id);
                                                                  setProductVariants(updatedVariants);
                                                                  setHasUnsavedChanges(true);
                                                                }}
                                                              >
                                                                <svg className="w-5 h-5 accent-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                              </button>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                          </div>
                                        </TabsContent>

                                        <TabsContent value="images" className="mt-0">
                                          <div className="w-full">
                                            {/* Alert */}
                                            <div className="mb-4">
                                              {selectedImageIndices.length === 0 ? (
                                                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
                                                  <div className="mr-3 text-red-500">
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                                    </svg>
                                                  </div>
                                                  <div className="text-base text-red-700">
                                                    If you don't select any images here, no images will be uploaded to Media in the store product.
                                                  </div>
                                                </div>
                                              ) : (
                                                <div data-show="true" className="alert alert-warning flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md" role="alert" style={{alignItems: 'center'}}>
                                                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="alert-icon text-amber-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{fontSize: '22px'}}>
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                                                  </svg>
                                                  <div className="alert-content ml-3">
                                                    <div className="alert-description text-base text-amber-700">
                                                      The pictures checked here will appear in the Media of products on store backend.
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Ribbon Controls */}
                                            <div className="mb-4 p-3 bg-gray-100 rounded-md">
                                              <div className="flex items-center justify-between">
                                                {/* Left side - Select controls */}
                                                <div className="flex items-center gap-4">
                                                  <div className="flex items-center">
                                                    <Checkbox 
                                                      checked={selectAllChecked}
                                                      onCheckedChange={handleSelectAll}
                                                      className="mr-2 w-4 h-4 bg-white border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white" 
                                                    />
                                                    <DropdownMenu open={imageFilterDropdownOpen} onOpenChange={setImageFilterDropdownOpen}>
                                                      <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="flex items-center text-base hover:bg-gray-100">
                                                          Select Image
                                                          <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                        </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="start" className="w-48">
                                                        <DropdownMenuItem 
                                                          onClick={() => setSelectedImageFilter("all")}
                                                          className="text-base"
                                                        >
                                                          All Images
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                          onClick={() => setSelectedImageFilter("selected")}
                                                          className="text-base"
                                                        >
                                                          Selected Images ({selectedImageIndices.length})
                                                        </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                  </div>
                                                </div>

                                                {/* Right side - Action buttons */}
                                                <div className="flex items-center gap-2">
                                                  {/* AI Button */}
                                                  <DropdownMenu open={aiDropdownOpen} onOpenChange={setAiDropdownOpen}>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="sm" className="flex items-center text-base hover:bg-gray-100">
                                                        <img width="24" height="24" src="/images/ui/ai-more.gif" alt="" className="mr-1" />
                                                        AI
                                                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-72">
                                                      <DropdownMenuItem 
                                                        onClick={handleAICutoutReplace}
                                                        className="text-base whitespace-nowrap"
                                                      >
                                                        AI Background Cut-Out and Replace
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem 
                                                        onClick={handleAIElimination}
                                                        className="text-base whitespace-nowrap"
                                                      >
                                                        AI Elimination
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>

                                                  <div className="w-px h-6 bg-gray-300"></div>

                                                  {/* More Action Button */}
                                                  <DropdownMenu open={moreActionDropdownOpen} onOpenChange={setMoreActionDropdownOpen}>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="sm" className="flex items-center text-base hover:bg-gray-100">
                                                        More Action
                                                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                      <DropdownMenuItem 
                                                        onClick={selectedImageIndices.length === 0 ? undefined : handleAltTextOpen}
                                                        className={`text-base whitespace-nowrap ${selectedImageIndices.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                        disabled={selectedImageIndices.length === 0}
                                                      >
                                                        Edit Alt Text
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem 
                                                        onClick={selectedImageIndices.length === 0 ? undefined : handleDeleteSelected}
                                                        className={`text-base whitespace-nowrap ${selectedImageIndices.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                        disabled={selectedImageIndices.length === 0}
                                                      >
                                                        Delete Selected
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>

                                                  <div className="w-px h-6 bg-gray-300"></div>

                                                  {/* Download Button */}
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={handleDownloadImages}
                                                    disabled={selectedImageIndices.length === 0}
                                                    className={`flex items-center text-base ${selectedImageIndices.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                  >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                                                      <path d="M16.707 7.404c-.189-.188-.448-.283-.707-.283s-.518.095-.707.283l-2.293 2.293v-6.697c0-.552-.448-1-1-1s-1 .448-1 1v6.697l-2.293-2.293c-.189-.188-.44-.293-.707-.293s-.518.105-.707.293c-.39.39-.39 1.024 0 1.414l4.707 4.682 4.709-4.684c.388-.387.388-1.022-.002-1.412zM20.987 16c0-.105-.004-.211-.039-.316l-2-6c-.136-.409-.517-.684-.948-.684h-.219c-.094.188-.21.368-.367.525l-1.482 1.475h1.348l1.667 5h-13.893l1.667 5h1.348l-1.483-1.475c-.157-.157-.274-.337-.367-.525h-.219c-.431 0-.812.275-.948.684l-2 6c-.035.105-.039.211-.039.316-.013 0-.013 5-.013 5 0 .553.447 1 1 1h16c.553 0 1-.447 1-1 0 0 0-5-.013-5z"/>
                                                    </svg>
                                                    Download
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Images Grid */}
                                            <div className="h-96 overflow-y-auto p-4">
                                              <div className="grid grid-cols-4 gap-4">
                                              {productImages.map((src, index) => (
                                                <div key={index} className="relative group">
                                                  <div className="absolute top-2 left-2 z-10">
                                                    <Checkbox 
                                                      checked={selectedImageSet.has(index)}
                                                      onCheckedChange={(checked) => handleImageSelect(index, checked as boolean)}
                                                      className="w-5 h-5 bg-white border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white" 
                                                    />
                                                  </div>
                                                  
                                                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                                                    <button 
                                                      onClick={(e) => handleEditImage(src, index, e)}
                                                      className="p-2 bg-blue-200 hover:bg-blue-300 rounded-lg shadow-sm transition-all duration-200"
                                                    >
                                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                                      </svg>
                                                    </button>
                                                    <button 
                                                      onClick={(e) => handleResizeImage(src, index, e)}
                                                      className="p-2 bg-purple-200 hover:bg-purple-300 rounded-lg shadow-sm transition-all duration-200"
                                                    >
                                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                                                        <path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/>
                                                      </svg>
                                                    </button>
                                                    <button 
                                                      onClick={() => handleDeleteImage(src)}
                                                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg shadow-sm transition-all duration-200"
                                                    >
                                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                      </svg>
                                                    </button>
                                                  </div>

                                                  <img 
                                                    src={src}
                                                    alt="" 
                                                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                                                  />
                                                  
                                                  {/* Add variant label to specific images */}
                                                  {[2, 5, 7, 9, 11, 13, 15, 17].includes(index) && (
                                                    <div className="absolute bottom-2 left-2 right-2">
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-xs bg-white px-2 py-1 rounded text-black flex items-center gap-1">
                                                          variant image
                                                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-black">
                                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                                                          </svg>
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                              </div>
                                            </div>

                                            {/* Resize Popover - positioned near the clicked button */}
                                            {resizePopoverOpen !== null && imageResizeData[resizePopoverOpen] && (
                                              <div className="fixed inset-0 z-50">
                                                {/* Backdrop to close on outside click - must be first for proper layering */}
                                                <div 
                                                  className="absolute inset-0 bg-black/20" 
                                                  onClick={() => setResizePopoverOpen(null)}
                                                />
                                                {/* Popover content */}
                                                <div 
                                                  className="absolute pointer-events-auto"
                                                  style={{
                                                    left: `${popoverPosition.x}px`,
                                                    top: `${popoverPosition.y}px`
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <div className="bg-white rounded-lg shadow-lg border p-6 w-96">
                                                    <div className="space-y-4">
                                                      {/* Header and Button Row */}
                                                      <div className="flex items-center justify-between">
                                                        <h4 className="font-medium leading-none text-lg">Resize Image</h4>
                                                        <Button 
                                                          onClick={() => handleSaveResize(resizePopoverOpen)}
                                                          disabled={
                                                            !imageResizeData[resizePopoverOpen]?.newWidth || 
                                                            !imageResizeData[resizePopoverOpen]?.newHeight || 
                                                            imageResizeData[resizePopoverOpen]?.newWidth < 0 || 
                                                            imageResizeData[resizePopoverOpen]?.newHeight < 0 ||
                                                            imageResizeData[resizePopoverOpen]?.newWidth < 100 || 
                                                            imageResizeData[resizePopoverOpen]?.newWidth > 5000 || 
                                                            imageResizeData[resizePopoverOpen]?.newHeight < 100 || 
                                                            imageResizeData[resizePopoverOpen]?.newHeight > 5000
                                                          }
                                                        >
                                                          SAVE
                                                        </Button>
                                                      </div>
                                                      
                                                      {/* Size Input Rows */}
                                                      <div className="space-y-3">
                                                        {/* Original Size Row */}
                                                        <div className="flex items-center gap-4">
                                                          <span className="text-sm text-gray-600 w-20">Original</span>
                                                          <Input 
                                                            type="text" 
                                                            value={imageResizeData[resizePopoverOpen].originalWidth.toString()} 
                                                            disabled 
                                                            className="w-24 h-9 text-center text-sm"
                                                          />
                                                          <span className="text-sm text-gray-400">×</span>
                                                          <Input 
                                                            type="text" 
                                                            value={imageResizeData[resizePopoverOpen].originalHeight.toString()} 
                                                            disabled 
                                                            className="w-24 h-9 text-center text-sm"
                                                          />
                                                        </div>

                                                        {/* New Size Row */}
                                                        <div className="flex items-center gap-4">
                                                          <span className="text-sm text-gray-600 w-20">New Size</span>
                                                          <Input 
                                                            type="text" 
                                                            value={imageResizeData[resizePopoverOpen].newWidthInput} 
                                                            onChange={(e) => handleWidthChange(e.target.value, resizePopoverOpen)}
                                                            className="w-24 h-9 text-center text-sm"
                                                            placeholder="1000"
                                                          />
                                                          <span className="text-sm text-gray-400">×</span>
                                                          <Input 
                                                            type="text" 
                                                            value={imageResizeData[resizePopoverOpen].newHeightInput} 
                                                            onChange={(e) => handleHeightChange(e.target.value, resizePopoverOpen)}
                                                            className="w-24 h-9 text-center text-sm"
                                                            placeholder="1000"
                                                          />
                                                        </div>
                                                      </div>

                                                      {/* Error message for negative values */}
                                                      {imageResizeData[resizePopoverOpen] && 
                                                       imageResizeData[resizePopoverOpen].newWidthInput !== '' && 
                                                       imageResizeData[resizePopoverOpen].newHeightInput !== '' &&
                                                       (imageResizeData[resizePopoverOpen].newWidth < 0 || imageResizeData[resizePopoverOpen].newHeight < 0) && (
                                                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                                                          <p className="text-sm text-red-800">
                                                            Image dimensions cannot be negative
                                                          </p>
                                                        </div>
                                                      )}

                                                      {/* Error message for invalid range - only show when user has entered invalid values and not negative */}
                                                      {imageResizeData[resizePopoverOpen] && 
                                                       imageResizeData[resizePopoverOpen].newWidthInput !== '' && 
                                                       imageResizeData[resizePopoverOpen].newHeightInput !== '' &&
                                                       imageResizeData[resizePopoverOpen].newWidth >= 0 && imageResizeData[resizePopoverOpen].newHeight >= 0 &&
                                                       (imageResizeData[resizePopoverOpen].newWidth < 100 || imageResizeData[resizePopoverOpen].newWidth > 5000 || imageResizeData[resizePopoverOpen].newHeight < 100 || imageResizeData[resizePopoverOpen].newHeight > 5000) && (
                                                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                                                          <p className="text-sm text-red-800">
                                                            Enter a number between 100 and 5,000
                                                          </p>
                                                        </div>
                                                      )}

                                                      {/* Warning message for large image sizes - only show when user has entered values > 1000 */}
                                                      {imageResizeData[resizePopoverOpen] && 
                                                       imageResizeData[resizePopoverOpen].newWidthInput !== '' && 
                                                       imageResizeData[resizePopoverOpen].newHeightInput !== '' &&
                                                       imageResizeData[resizePopoverOpen].newWidth >= 100 && imageResizeData[resizePopoverOpen].newWidth <= 5000 && 
                                                       imageResizeData[resizePopoverOpen].newHeight >= 100 && imageResizeData[resizePopoverOpen].newHeight <= 5000 && 
                                                       (imageResizeData[resizePopoverOpen].newWidth > 1000 || imageResizeData[resizePopoverOpen].newHeight > 1000) && (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                                                          <p className="text-sm text-yellow-800">
                                                            If the image size is too large, the product may fail to be pushed to WooCommerce. Setting the size of both Width and Height to lower than 1000 will raise the success rate of pushing the product.
                                                          </p>
                                                        </div>
                                                      )}

                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Edit Popover - positioned near the clicked button */}
                                            {editPopoverOpen !== null && imageEditData[editPopoverOpen] && (
                                              <div className="fixed inset-0 z-50">
                                                {/* Backdrop to close on outside click - must be first for proper layering */}
                                                <div 
                                                  className="absolute inset-0 bg-black/20" 
                                                  onClick={() => setEditPopoverOpen(null)}
                                                />
                                                {/* Popover content */}
                                                <div 
                                                  className="absolute pointer-events-auto"
                                                  style={{
                                                    left: `${popoverPosition.x}px`,
                                                    top: `${popoverPosition.y}px`
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <div className="bg-white rounded-lg shadow-lg border p-4 w-64">
                                                    <div className="space-y-4">
                                                      {/* Header with check button */}
                                                      <div className="flex items-center justify-between">
                                                        <h4 className="font-medium leading-none text-sm">Edit Image</h4>
                                                        <Button 
                                                          onClick={() => handleSaveEdit(editPopoverOpen)}
                                                          size="sm"
                                                          className="h-6 w-6 p-0"
                                                        >
                                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20,6 9,17 4,12"></polyline>
                                                          </svg>
                                                        </Button>
                                                      </div>
                                                      
                                                      {/* Brightness Control */}
                                                      <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                          <span className="text-xs text-gray-600">Brightness</span>
                                                          <span className="text-xs text-gray-500">{imageEditData[editPopoverOpen].brightness}%</span>
                                                        </div>
                                                        <input 
                                                          type="range" 
                                                          min="0" 
                                                          max="200" 
                                                          value={imageEditData[editPopoverOpen].brightness}
                                                          onChange={(e) => handleEditControlChange(editPopoverOpen, 'brightness', Number(e.target.value))}
                                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                      </div>

                                                      {/* Contrast Control */}
                                                      <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                          <span className="text-xs text-gray-600">Contrast</span>
                                                          <span className="text-xs text-gray-500">{imageEditData[editPopoverOpen].contrast}%</span>
                                                        </div>
                                                        <input 
                                                          type="range" 
                                                          min="0" 
                                                          max="200" 
                                                          value={imageEditData[editPopoverOpen].contrast}
                                                          onChange={(e) => handleEditControlChange(editPopoverOpen, 'contrast', Number(e.target.value))}
                                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                      </div>

                                                      {/* Saturation Control */}
                                                      <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                          <span className="text-xs text-gray-600">Saturation</span>
                                                          <span className="text-xs text-gray-500">{imageEditData[editPopoverOpen].saturation}%</span>
                                                        </div>
                                                        <input 
                                                          type="range" 
                                                          min="0" 
                                                          max="200" 
                                                          value={imageEditData[editPopoverOpen].saturation}
                                                          onChange={(e) => handleEditControlChange(editPopoverOpen, 'saturation', Number(e.target.value))}
                                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Image Editor */}
                                            {imageEditorOpen && currentEditingImage && (
                                              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: 'white', pointerEvents: 'auto' }}>
                                                <style dangerouslySetInnerHTML={{
                                                  __html: `
                                                    .tui-image-editor-container * {
                                                      pointer-events: auto !important;
                                                    }
                                                    .tui-image-editor-menu * {
                                                      pointer-events: auto !important;
                                                    }
                                                    .tui-image-editor-submenu * {
                                                      pointer-events: auto !important;
                                                    }
                                                    .tui-colorpicker-palette-button {
                                                      width: 18px !important;
                                                      height: 18px !important;
                                                      border-radius: 50% !important;
                                                      border: 1px solid #ddd !important;
                                                      margin: 1px !important;
                                                      cursor: pointer !important;
                                                      display: inline-block !important;
                                                      outline: none !important;
                                                      box-sizing: border-box !important;
                                                    }
                                                    .tui-colorpicker-palette-button:hover {
                                                      transform: scale(1.15) !important;
                                                      border: 2px solid #333 !important;
                                                    }
                                                    .tui-colorpicker-selected {
                                                      border: 2px solid #333 !important;
                                                      transform: scale(1.1) !important;
                                                    }
                                                    .tui-colorpicker-palette-container ul {
                                                      display: flex !important;
                                                      flex-wrap: wrap !important;
                                                      padding: 8px !important;
                                                      margin: 0 !important;
                                                      list-style: none !important;
                                                    }
                                                    .tui-colorpicker-palette-container li {
                                                      display: inline-block !important;
                                                      margin: 2px !important;
                                                    }
                                                    .tui-image-editor-load-btn,
                                                    .tui-image-editor-download-btn,
                                                    .tui-image-editor-header-buttons .tui-image-editor-load-btn,
                                                    .tui-image-editor-header-buttons .tui-image-editor-download-btn,
                                                    .tui-image-editor-header .tui-image-editor-load-btn,
                                                    .tui-image-editor-header .tui-image-editor-download-btn {
                                                      display: none !important;
                                                      visibility: hidden !important;
                                                      opacity: 0 !important;
                                                      position: absolute !important;
                                                      left: -9999px !important;
                                                    }
                                                  `
                                                }}></style>
                                                <div className="absolute top-4 right-4 flex gap-2 z-50">
                                                  <button 
                                                    onClick={async (e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      console.log('Save button clicked');
                                                      try {
                                                        await handleSaveEditedImage();
                                                      } catch (error) {
                                                        console.error('Error saving image:', error);
                                                      }
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                  >
                                                    Save
                                                  </button>
                                                  <button 
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      handleCancelEditImage();
                                                    }}
                                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                                <ImageEditor
                                                  ref={imageEditorRef}
                                                  includeUI={{
                                                    loadImage: {
                                                      path: currentEditingImage,
                                                      name: 'EditImage',
                                                    },
                                                    theme: {
                                                      'common.bi.image': '',
                                                      'common.bisize.width': '0px',
                                                      'common.bisize.height': '0px',
                                                      'header.display': 'none',
                                                    },
                                                    uiSize: {
                                                      width: '100%',
                                                      height: '100%',
                                                    },
                                                    menuBarPosition: 'bottom',
                                                  }}
                                                  usageStatistics={false}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </TabsContent>

                                        <TabsContent value="description" className="mt-0 h-full">
                                          <div className="h-full overflow-y-auto">
                                            <CKEditorStyleEditor 
                                              onChange={(sections) => {
                                                console.log('Product description sections changed:', sections);
                                                setHasUnsavedChanges(true);
                                              }}
                                            />
                                          </div>
                                        </TabsContent>

                                        <TabsContent value="shipping" className="mt-0">
                                          <ShippingInfoTab 
                                            productVariants={productVariants}
                                            onVariantChange={(variant) => {
                                              console.log('Selected variant for shipping:', variant);
                                            }}
                                          />
                                        </TabsContent>
                                        </div>
                                      </Tabs>
                                    </div>
                                  </div>

                                {/* Sticky Footer */}
                                <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center">
                                  <div className="flex">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mr-2.5"
                                      onClick={() => {
                                        if (currentEditingProduct?.productUrl) {
                                          window.open(currentEditingProduct.productUrl, '_blank', 'noopener,noreferrer');
                                        }
                                      }}
                                      disabled={!currentEditingProduct?.productUrl}
                                    >
                                      CLICK FOR DETAILS
                                    </Button>
                                  </div>
                                  <div className="flex gap-2.5">
                                    <Button variant="outline" size="sm">
                                      PUSH TO STORE
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="uppercase"
                                      onClick={() => {
                                        // Save the current tab's changes
                                        setSavedMainImage(selectedMainImage);
                                        setHasUnsavedChanges(false);

                                        // If editing a dynamic product, save to localStorage
                                        if (currentEditingProduct) {
                                          // Convert productVariants back to ImportListItem.variants format
                                          const convertedVariants = productVariants.map(v => ({
                                            id: v.id,
                                            sku: v.sku,
                                            option: v.variantOption,
                                            price: v.currentPrice,
                                            compareAtPrice: v.compareAtPrice || 0,
                                            stock: 0, // Stock is managed separately
                                            image: undefined,
                                          }));

                                          const updatedProduct: ImportListItem = {
                                            ...currentEditingProduct,
                                            name: productTitle,
                                            image: selectedMainImage,
                                            images: productImages,
                                            weight: { value: weightValue, unit: weightUnit },
                                            dimensions: { length, width, height, unit: dimensionUnit },
                                            description: editingProductDescription,
                                            variants: convertedVariants,
                                          };
                                          // Update in localStorage
                                          updateImportListItem(updatedProduct);
                                          // Update local state
                                          setImportListItems(prev =>
                                            prev.map(item => item.id === updatedProduct.id ? updatedProduct : item)
                                          );
                                          setCurrentEditingProduct(updatedProduct);
                                        }
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                                </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Product Synchronization Rule Dialog - Per-product country/currency selection */}
        <Dialog open={productSyncRuleDialogOpen} onOpenChange={(open) => {
          if (!open) {
            // Reset editing product when dialog closes
            setEditingProductId(null);
          }
          setProductSyncRuleDialogOpen(open);
        }}>
          <DialogContent className="w-[688px] max-w-[688px] h-auto p-0">
            <DialogHeader className="px-6 pt-5 pb-0">
              <DialogTitle className="text-xl font-semibold">Product synchronization rule</DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Supplier (such as AliExpress) have different price, stock, and sales support for the same product shipped to different countries.
              </p>
              <p className="text-sm text-muted-foreground">
                Set here for DShipIt to obtain supplier product data sent to destination countries
              </p>
            </div>
            <div className="px-6 pb-4 space-y-3">
              <Select value={pendingCountry} onValueChange={setPendingCountry}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue>
                    <div className="flex items-center">
                      <img
                        src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${pendingCountry}.svg`}
                        className="inline-block w-6 h-6 align-middle mr-3"
                        alt="Selected Country Flag"
                      />
                      <span>{COUNTRIES.find(c => c.code === pendingCountry)?.name || 'United States'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center">
                        <img
                          src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${country.code}.svg`}
                          className="mr-3 h-5 w-5"
                          alt={`${country.name} Flag`}
                        />
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Prices will be displayed in <span className="font-medium text-foreground">{pendingCurrency}</span> ({currencyService.getCurrencyInfo(pendingCurrency).name})
              </p>
            </div>
            <DialogFooter className="px-6 pb-5">
              <Button
                variant="outline"
                onClick={() => {
                  // Save the country selection for this specific product
                  if (editingProductId) {
                    setProductCountries(prev => ({
                      ...prev,
                      [editingProductId]: pendingCountry
                    }));
                  }
                  setProductSyncRuleDialogOpen(false);
                  setEditingProductId(null);
                }}
                className="uppercase"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Tags Dialog */}
        <Dialog open={createTagsDialogOpen} onOpenChange={setCreateTagsDialogOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Create and manage DShipIt tags</DialogTitle>
              <DialogDescription className="text-base">
                You can create or delete tags to group your products. Click here to get more information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="relative">
                <div className="flex items-center h-12 border border-input rounded-md bg-background">
                  <Input
                    type="text"
                    placeholder="Create a new DShipIt tag (0/1000)"
                    maxLength={50}
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 h-full border-0 bg-transparent px-3 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                  />
                  <div className="flex items-center pr-1">
                    <Popover open={showEmptyTagPopover} onOpenChange={(open) => {
                      // Only allow the popover to close, not open from external triggers
                      if (!open) {
                        setShowEmptyTagPopover(false);
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAddTag(e)}
                          className="h-10 w-12 rounded-md bg-teal-200 hover:bg-teal-300 dark:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                        >
                          <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="!h-6 !w-6 !size-6 text-teal-600 dark:text-teal-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                          </svg>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" side="top" align="center">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white">
                              <path fill="none" d="M0 0h24v24H0z"></path>
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                            </svg>
                          </div>
                          <span className="text-foreground">tag cannot be empty</span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              {/* Tags Table or Empty State */}
              {createdTags.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground w-1/2">Tag Name</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground w-1/4 whitespace-nowrap">Products</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground w-1/4 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createdTags.map((tag, index) => (
                        <tr key={tag.id} className={`border-t ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-accent/50 transition-colors`}>
                          <td className="py-3 px-4 w-1/2">
                            {editingTagId === tag.id ? (
                              <Input
                                type="text"
                                value={editingTagValue}
                                onChange={(e) => setEditingTagValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTag(tag.id);
                                  }
                                  if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                className="h-12 w-full"
                                autoFocus
                              />
                            ) : (
                              <span className="font-medium break-words">{tag.name}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 w-1/4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-thin bg-green-500 text-white">
                              {tag.productCount} product(s)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center w-1/4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1">
                              {editingTagId === tag.id ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveTag(tag.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                                >
                                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className="!h-6 !w-6 !size-6 text-green-600">
                                    <path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"></path>
                                  </svg>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTag(tag.id, tag.name)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <Edit className="!h-6 !w-6 !size-6 text-muted-foreground" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTag(tag.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="!h-6 !w-6 !size-6 text-foreground" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-40">
                    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                      <ellipse cx="32" cy="33" rx="32" ry="7" fill="#f5f5f5"></ellipse>
                      <g fillRule="nonzero" fill="#fafafa">
                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#e6e6e6"></path>
                      </g>
                    </g>
                  </svg>
                  <p className="text-lg font-thin text-muted-foreground">No Data</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Apply Tags Dialog */}
        <Dialog open={applyTagsDialogOpen} onOpenChange={handleApplyTagsDialogClose}>
          <DialogContent className="w-[520px] max-w-[520px] h-[692px] p-0 gap-0 flex flex-col overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b border-gray-200 shrink-0">
              <DialogTitle className="text-lg font-semibold text-foreground">Apply DShipIt Tags</DialogTitle>
            </DialogHeader>
            <DialogDescription className="sr-only">Apply tags to group your products</DialogDescription>
            <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">
              <p className="text-base text-muted-foreground mb-4 shrink-0">You can apply tags to group your products.</p>

              {/* Table Structure */}
              <div className="flex-1 border rounded-md overflow-hidden flex flex-col">
                {/* Table Header - Select All */}
                <div className="flex items-center border-b bg-muted/30 shrink-0">
                  <div className="w-12 flex items-center justify-center py-3 border-r">
                    <Checkbox
                      id="select-all-tags"
                      checked={isAllApplyTagsSelected}
                      onCheckedChange={handleSelectAllApplyTags}
                    />
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <label htmlFor="select-all-tags" className="text-base font-medium cursor-pointer">
                      Select All
                    </label>
                  </div>
                </div>

                {/* Table Body - Tags List */}
                <div className="flex-1 overflow-y-auto">
                  {createdTags.length > 0 ? (
                    createdTags.map((tag) => (
                      <div key={tag.id} className="flex items-center border-b last:border-b-0 hover:bg-accent/20 transition-colors">
                        <div className="w-12 flex items-center justify-center py-3 border-r">
                          <Checkbox
                            id={`apply-tag-${tag.id}`}
                            checked={selectedApplyTags.includes(tag.id)}
                            onCheckedChange={() => handleApplyTagToggle(tag.id)}
                          />
                        </div>
                        <div className="flex-1 px-4 py-3">
                          <label htmlFor={`apply-tag-${tag.id}`} className="text-base cursor-pointer truncate block">
                            {tag.name}
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-40">
                        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                          <ellipse cx="32" cy="33" rx="32" ry="7" fill="#f5f5f5"></ellipse>
                          <g fillRule="nonzero" fill="#d9d9d9">
                            <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                            <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#e6e6e6"></path>
                          </g>
                        </g>
                      </svg>
                      <p className="text-base text-muted-foreground">No tags available</p>
                      <p className="text-sm text-muted-foreground mt-1">Create tags first to apply them to products</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 shrink-0">
              <Button variant="outline" onClick={() => handleApplyTagsDialogClose(false)}>
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Option Picture Sheet */}
        <ChangeOptionPictureSheet
          open={changeOptionPictureSheetOpen}
          onOpenChange={setChangeOptionPictureSheetOpen}
          onSave={(updatedVariants, selectedImageUrl) => {
            console.log('Updated variants:', updatedVariants);
            // If selectedImageUrl is provided, update main image (from Products tab)
            if (selectedImageUrl) {
              setSelectedMainImage(selectedImageUrl);
            }
            // Handle saving the updated variant images
            setHasUnsavedChanges(true);
            setChangeOptionPictureSheetOpen(false);
          }}
        />


        {/* Change Price Dialog */}
        <ChangePriceDialog
          open={changePriceDialogOpen}
          onOpenChange={setChangePriceDialogOpen}
          onSave={(newPrice) => {
            console.log('New price:', newPrice);
            // Update the currentPrice for all selected variants
            const updatedVariants = productVariants.map(variant => {
              if (selectedVariantItems.includes(parseInt(variant.id))) {
                return { ...variant, currentPrice: newPrice };
              }
              return variant;
            });
            setProductVariants(updatedVariants);
            setHasUnsavedChanges(true);
          }}
        />

        {/* Change Compare At Price Dialog */}
        <ChangeCompareAtPriceDialog
          open={changeCompareAtPriceDialogOpen}
          onOpenChange={setChangeCompareAtPriceDialogOpen}
          onSave={(newComparePrice) => {
            console.log('New compare at price:', newComparePrice);
            // Update the compareAtPrice for all selected variants
            const updatedVariants = productVariants.map(variant => {
              if (selectedVariantItems.includes(parseInt(variant.id))) {
                return { ...variant, compareAtPrice: newComparePrice };
              }
              return variant;
            });
            setProductVariants(updatedVariants);
            setHasUnsavedChanges(true);
          }}
        />

        {/* Change Stock Dialog */}
        <ChangeStockDialog
          open={changeStockDialogOpen}
          onOpenChange={setChangeStockDialogOpen}
          onSave={(newStock) => {
            console.log('New stock:', newStock);
            // Update the stock for all selected variants
            const updatedVariants = productVariants.map(variant => {
              if (selectedVariantItems.includes(parseInt(variant.id))) {
                return { ...variant, stock: newStock };
              }
              return variant;
            });
            setProductVariants(updatedVariants);
            setHasUnsavedChanges(true);
          }}
        />

        {/* Delete Variants Dialog */}
        <DeleteVariantsDialog
          open={deleteVariantsDialogOpen}
          onOpenChange={setDeleteVariantsDialogOpen}
          selectedItems={selectedVariantItems}
          onDeleteVariants={(itemIds: number[]) => {
            console.log('Deleting variant items:', itemIds);
            // Handle deleting the selected variant items
            setHasUnsavedChanges(true);
            setDeleteVariantsDialogOpen(false);
          }}
        />

        {/* Duplicate Variant Dialog */}
        <DuplicateVariantDialog
          open={duplicateVariantDialogOpen}
          onOpenChange={setDuplicateVariantDialogOpen}
          variantName={variantType}
          onDuplicate={(newVariantValue: string) => {
            console.log('Duplicating variants with new value:', newVariantValue);
            // Handle duplicating the selected variant items with new variant value
            setHasUnsavedChanges(true);
            setDuplicateVariantDialogOpen(false);
          }}
        />

        {/* Default Parcel Information Sheet */}
        <Sheet open={defaultParcelSheetOpen} onOpenChange={(open) => {
          if (!open && parcelDataModified) {
            setPendingSheetClose('defaultParcel');
            setShowUnsavedChangesDialog(true);
            return;
          }
          setDefaultParcelSheetOpen(open);
        }}>
          <SheetContent className="w-[868px] max-w-[868px] sm:w-[868px] sm:max-w-[868px] px-6 overflow-x-hidden">
            <SheetHeader>
              <SheetTitle style={{fontSize: '20px', fontWeight: '600'}}>Default Parcel Information</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 h-[calc(100vh-160px)]">
              <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
                <Table className="w-full table-fixed min-w-0">
                  <colgroup>
                    <col className="w-[140px]" />
                    <col className="w-[110px]" />
                    <col className="w-[110px]" />
                    <col className="w-[110px]" />
                    <col className="w-[120px]" />
                    <col className="w-[158px]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{fontSize: '16px', fontWeight: '400'}}>Package Info</TableHead>
                      <TableHead style={{fontSize: '16px', fontWeight: '400'}}>Length</TableHead>
                      <TableHead style={{fontSize: '16px', fontWeight: '400'}}>Width</TableHead>
                      <TableHead style={{fontSize: '16px', fontWeight: '400'}}>Height</TableHead>
                      <TableHead style={{fontSize: '16px', fontWeight: '400'}}>Unit</TableHead>
                      <TableHead style={{fontSize: '16px', fontWeight: '400'}}>Setting</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {parcelData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input 
                          placeholder="Custom"
                          value={row.name}
                          onChange={(e) => {
                            const newData = [...parcelData];
                            newData[index].name = e.target.value;
                            setParcelData(newData);
                            setParcelDataModified(true);
                          }}
                          className="h-[42px]"
                        />
                      </TableCell>
                      <TableCell>
                        <DsiCounterbox
                          value={row.length.toFixed(2)}
                          onChange={(value) => {
                            const newData = [...parcelData];
                            newData[index].length = parseFloat(value) || 0;
                            setParcelData(newData);
                            setParcelDataModified(true);
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <DsiCounterbox
                          value={row.width.toFixed(2)}
                          onChange={(value) => {
                            const newData = [...parcelData];
                            newData[index].width = parseFloat(value) || 0;
                            setParcelData(newData);
                            setParcelDataModified(true);
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <DsiCounterbox
                          value={row.height.toFixed(2)}
                          onChange={(value) => {
                            const newData = [...parcelData];
                            newData[index].height = parseFloat(value) || 0;
                            setParcelData(newData);
                            setParcelDataModified(true);
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.unit}
                          onValueChange={(value) => {
                            const newData = [...parcelData];
                            newData[index].unit = value;
                            setParcelData(newData);
                            setParcelDataModified(true);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="relative w-5 h-5 cursor-pointer"
                              onClick={() => {
                                const newData = parcelData.map((item, i) => ({
                                  ...item,
                                  isDefault: i === index
                                }));
                                setParcelData(newData);
                                setParcelDataModified(true);
                              }}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                                row.isDefault ? 'border-orange-500' : 'border-gray-300'
                              }`}>
                                {row.isDefault && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                )}
                              </div>
                            </div>
                            <label 
                              htmlFor={`default-${row.id}`} 
                              className="font-normal text-base cursor-pointer"
                            >
                              Default
                            </label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 h-10 w-10 text-black hover:text-black hover:bg-gray-100 ml-6"
                            onClick={() => {
                              const newData = parcelData.filter((_, i) => i !== index);
                              setParcelData(newData);
                              setParcelDataModified(true);
                            }}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              style={{
                                width: '24px',
                                height: '24px',
                                minWidth: '24px',
                                minHeight: '24px',
                                opacity: '0.7'
                              }}
                            >
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                              <path d="M3 6h18"></path>
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Add Button */}
              <div className="mt-4">
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 border-orange-500 text-orange-500"
                  onClick={() => {
                    const newId = Math.max(...parcelData.map(p => p.id)) + 1;
                    setParcelData([...parcelData, {
                      id: newId,
                      name: "",
                      length: 0,
                      width: 0,
                      height: 0,
                      unit: "cm",
                      isDefault: false
                    }]);
                    setParcelDataModified(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
            
            {/* Sticky Save Button Row */}
            <div className="absolute bottom-0 right-0 left-0 bg-white border-t p-4">
              <div className="flex justify-end">
                <Button 
                  variant="default"
                  onClick={() => {
                    console.log('Default Parcel Information saved');
                    setParcelDataModified(false);
                    setDefaultParcelSheetOpen(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedChangesDialog} onOpenChange={(open) => {
          // Prevent closing dialog by clicking outside when there are unsaved changes
          if (!open && hasUnsavedChanges) {
            return;
          }
          setShowUnsavedChangesDialog(open);
        }}>
          <DialogContent className="w-[440px] max-w-[440px] p-0 z-[9999]">
            {/* Close Button */}
            <button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => {
                // Don't allow closing with X button - user must choose SAVE or DISCARD
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="text-xl font-medium">Unsaved changes</DialogTitle>
            </DialogHeader>
            
            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-600">
                The product information or pricing rule switch status you modified has not been saved yet. 
                If you want to save, please click "SAVE"; if you don't want to save your modifications, please click "DISCARD."
              </p>
            </div>
            
            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset form data to original values (discard changes)
                  resetFormData();
                  
                  // Clear unsaved changes flags and close dialog
                  setHasUnsavedChanges(false);
                  setParcelDataModified(false);
                  setShowUnsavedChangesDialog(false);
                  
                  // Continue with the original close action
                  if (pendingSheetClose === 'editProductDetail') {
                    setEditProductDetailSheetOpen(false);
                  } else if (pendingSheetClose === 'defaultParcel') {
                    setDefaultParcelSheetOpen(false);
                  }
                  setPendingSheetClose(null);
                }}
              >
                Discard
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // TODO: Implement actual save logic here
                  
                  // Clear unsaved changes flags (retain the changes)
                  setSavedMainImage(selectedMainImage);
                  setHasUnsavedChanges(false);
                  setParcelDataModified(false);
                  setShowUnsavedChangesDialog(false);
                  
                  // Continue with the original close action
                  if (pendingSheetClose === 'editProductDetail') {
                    setEditProductDetailSheetOpen(false);
                  } else if (pendingSheetClose === 'defaultParcel') {
                    setDefaultParcelSheetOpen(false);
                  }
                  setPendingSheetClose(null);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Image Dialog */}
        <DeleteImageDialog
          open={deleteImageDialogOpen}
          onOpenChange={setDeleteImageDialogOpen}
          onConfirm={confirmDeleteImage}
          selectedCount={1}
        />

        {/* Alt Text Dialog */}
        <Dialog open={altTextDialogOpen} onOpenChange={setAltTextDialogOpen}>
          <DialogContent className="modal-content p-0 max-w-none w-[1200px]" style={{ width: '1200px', height: 'auto' }}>
            <div className="modal-header px-6 py-2">
              <div className="modal-title">Edit Image ALT text</div>
            </div>
            
            <div className="modal-body px-6 py-1">
              <div className="index_imageListContainer__UtrPX">
                {selectedImageIndices.map(index => (
                  <div key={index} className="index_oneOfImageInfo__ORcGh flex items-center gap-4">
                    <img 
                      src={productImages[index]} 
                      alt="" 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 overflow-hidden">
                      <input 
                        placeholder="Please enter the alt of the image" 
                        data-slot="input"
                        className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-base shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground" 
                        type="text" 
                        value={altTextValues[index] || ''}
                        onChange={(e) => setAltTextValues(prev => ({
                          ...prev,
                          [index]: e.target.value
                        }))}
                        style={{ minWidth: '100%' }}
                      />
                    </div>
                    <span
                      title="Copy to clipboard"
                      className="cursor-pointer hover:opacity-70"
                      onClick={() => {
                        const textToCopy = altTextValues[index] || '';
                        navigator.clipboard.writeText(textToCopy);
                        console.log('Copied to clipboard:', textToCopy);
                      }}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1.5em"
                        width="1.5em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                      </svg>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter className="px-6 py-2">
              <Button 
                variant="outline"
                onClick={() => setAltTextDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  console.log('Alt text updated:', altTextValues);
                  setAltTextDialogOpen(false);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



      </div>
    </div>
  );
}