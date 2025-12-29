"use client";

import * as React from "react";
import { ChevronDownIcon, EditIcon, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditOptionsDialog } from "@/components/EditOptionsDialog";
import { CascadingLocationSelector } from "@/components/CascadingLocationSelector";
import {
  calculatePricing,
  calculateShippingCost,
  getPricingRuleForDestination,
  DEFAULT_PRICING_RULES,
  type PricingRule,
  type ProductVariant,
  type PricingCalculationResult
} from "@/utils/pricingRules";

interface VariantsTabBarProps {
  onActionSelect?: (action: string) => void;
  onShipToChange?: (country: string, state: string, city: string) => void;
  onShippingMethodChange?: (value: string) => void;
  onEditOptions?: (optionName: string, options: any[]) => void;
  onPricingRuleChange?: (enabled: boolean, calculatedPricing?: PricingCalculationResult[]) => void;
  shipToValue?: string;
  shippingMethodValue?: string;
  pricingRuleEnabled?: boolean;
  selectedProductsCount?: number; // Number of selected products in the table
  // Pricing-related props for future API integration
  productVariants?: ProductVariant[];
  onVariantPricingUpdate?: (variants: ProductVariant[]) => void;
  currentPricingRule?: PricingRule;
  // Variant filter props
  variantType?: string;
  availableVariantOptions?: string[];
  selectedVariantOptions?: string[];
  onVariantOptionToggle?: (option: string) => void;
}

export function VariantsTabBar({
  onActionSelect,
  onShipToChange,
  onShippingMethodChange,
  onEditOptions,
  onPricingRuleChange,
  shipToValue = "United States",
  shippingMethodValue = "AliExpress standard shipping",
  pricingRuleEnabled = true,
  selectedProductsCount = 0,
  productVariants = [],
  onVariantPricingUpdate,
  currentPricingRule,
  variantType = "Unit",
  availableVariantOptions = [],
  selectedVariantOptions = [],
  onVariantOptionToggle,
}: VariantsTabBarProps) {
  const hasSelectedProducts = selectedProductsCount > 0;
  const [editOptionsOpen, setEditOptionsOpen] = React.useState(false);

  // Pricing rule state management
  const [activePricingRule, setActivePricingRule] = React.useState<PricingRule | null>(
    currentPricingRule || (pricingRuleEnabled ? DEFAULT_PRICING_RULES.standard : null)
  );

  const handleEditOptionsSave = (optionName: string, options: any[]) => {
    // Handle saving the variant options
    console.log("Variant options saved:", { optionName, options });
    // This would update the variant type and available options
    onEditOptions?.(optionName, options);
  };

  // Calculate pricing when shipping destination or method changes
  const handleShipToChangeWithPricing = React.useCallback((country: string, state: string, city: string) => {
    const destination = [country, state, city].filter(Boolean).join(", ") || country;
    onShipToChange?.(country, state, city);
    
    if (pricingRuleEnabled && productVariants.length > 0) {
      // Get pricing rule for destination
      const pricingRule = getPricingRuleForDestination(destination);
      setActivePricingRule(pricingRule);
      
      // Calculate new pricing for all variants
      const updatedVariants = productVariants.map(variant => {
        const shippingCost = calculateShippingCost(destination, shippingMethodValue, variant.supplierPrice);
        const pricing = calculatePricing(variant.supplierPrice, shippingCost, pricingRule);
        
        return {
          ...variant,
          currentPrice: pricing.calculatedPrice,
          compareAtPrice: pricing.compareAtPrice,
          profitMargin: pricing.profitMargin,
          shippingCost,
        };
      });
      
      onVariantPricingUpdate?.(updatedVariants);
      
      // Notify parent with calculated pricing results
      const pricingResults = updatedVariants.map(variant => {
        const shippingCost = calculateShippingCost(destination, shippingMethodValue, variant.supplierPrice);
        return calculatePricing(variant.supplierPrice, shippingCost, pricingRule);
      });
      
      onPricingRuleChange?.(true, pricingResults);
    }
  }, [pricingRuleEnabled, productVariants, shippingMethodValue, onShipToChange, onVariantPricingUpdate, onPricingRuleChange]);

  // Calculate pricing when shipping method changes
  const handleShippingMethodChangeWithPricing = React.useCallback((method: string) => {
    onShippingMethodChange?.(method);
    
    if (pricingRuleEnabled && productVariants.length > 0 && activePricingRule) {
      // Calculate new pricing with updated shipping costs
      const updatedVariants = productVariants.map(variant => {
        const shippingCost = calculateShippingCost(shipToValue, method, variant.supplierPrice);
        const pricing = calculatePricing(variant.supplierPrice, shippingCost, activePricingRule);
        
        return {
          ...variant,
          currentPrice: pricing.calculatedPrice,
          compareAtPrice: pricing.compareAtPrice,
          profitMargin: pricing.profitMargin,
          shippingCost,
        };
      });
      
      onVariantPricingUpdate?.(updatedVariants);
      
      // Notify parent with calculated pricing results
      const pricingResults = updatedVariants.map(variant => {
        const shippingCost = calculateShippingCost(shipToValue, method, variant.supplierPrice);
        return calculatePricing(variant.supplierPrice, shippingCost, activePricingRule);
      });
      
      onPricingRuleChange?.(true, pricingResults);
    }
  }, [pricingRuleEnabled, productVariants, activePricingRule, shipToValue, onShippingMethodChange, onVariantPricingUpdate, onPricingRuleChange]);

  // Handle pricing rule toggle
  const handlePricingRuleToggle = React.useCallback((enabled: boolean) => {
    if (enabled) {
      // Enable pricing rule - apply calculations
      const pricingRule = getPricingRuleForDestination(shipToValue);
      setActivePricingRule(pricingRule);
      
      if (productVariants.length > 0) {
        const updatedVariants = productVariants.map(variant => {
          const shippingCost = calculateShippingCost(shipToValue, shippingMethodValue, variant.supplierPrice);
          const pricing = calculatePricing(variant.supplierPrice, shippingCost, pricingRule);
          
          return {
            ...variant,
            currentPrice: pricing.calculatedPrice,
            compareAtPrice: pricing.compareAtPrice,
            profitMargin: pricing.profitMargin,
            shippingCost,
          };
        });
        
        onVariantPricingUpdate?.(updatedVariants);
        
        // Notify parent with calculated pricing results
        const pricingResults = updatedVariants.map(variant => {
          const shippingCost = calculateShippingCost(shipToValue, shippingMethodValue, variant.supplierPrice);
          return calculatePricing(variant.supplierPrice, shippingCost, pricingRule);
        });
        
        onPricingRuleChange?.(true, pricingResults);
      } else {
        onPricingRuleChange?.(true);
      }
    } else {
      // Disable pricing rule - revert to original pricing
      setActivePricingRule(null);
      
      if (productVariants.length > 0) {
        const revertedVariants = productVariants.map(variant => {
          const shippingCost = calculateShippingCost(shipToValue, shippingMethodValue, variant.supplierPrice);
          return {
            ...variant,
            currentPrice: variant.supplierPrice + shippingCost,
            compareAtPrice: (variant.supplierPrice + shippingCost) * 1.2, // Default 20% markup
            profitMargin: 0,
            shippingCost,
          };
        });
        
        onVariantPricingUpdate?.(revertedVariants);
      }
      
      onPricingRuleChange?.(false);
    }
  }, [shipToValue, shippingMethodValue, productVariants, onVariantPricingUpdate, onPricingRuleChange]);
  

  const isMultipleSelection = selectedProductsCount > 1;
  
  const actionItems = [
    { value: "change-price", label: "Change price", disabled: false },
    { value: "change-compare-price", label: "Change compare at price", disabled: false },
    { value: "change-stock", label: "Change stock", disabled: false },
    { value: "delete-variants", label: "Delete variants", disabled: false },
    { value: "change-option-picture", label: "Change option picture", disabled: isMultipleSelection },
    { value: "duplicate-variant", label: `Duplicate in another ${variantType}`, disabled: isMultipleSelection },
  ];

  const shipToOptions = [
    "Aland Islands",
    "Afghanistan",
    "Albania",
    "Alderney",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Ascension Island",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cape Verde",
    "Caribbean Netherlands",
    "Cayman Islands",
    "Central African Republic",
    "Chad",
    "Chile",
    "Christmas Island",
    "Cocos (Keeling) Islands",
    "Colombia",
    "Comoros",
    "Congo, The Democratic Republic Of The",
    "Congo, The Republic of Congo",
    "Cook Islands",
    "Costa Rica",
    "Cote D'Ivoire",
    "Croatia (local name: Hrvatska)",
    "Curacao",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Ethiopia",
    "Falkland Islands (Malvinas)",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "French Polynesia",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guadeloupe",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hong Kong,China",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Lao People's Democratic Republic",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macau,China",
    "Macedonia",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Martinique",
    "Mauritania",
    "Mauritius",
    "Mayotte",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "Netherlands Antilles",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Niue",
    "Norfolk Island",
    "Northern Mariana Islands",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Reunion",
    "Romania",
    "Russian Federation",
    "Rwanda",
    "Saint Barthelemy",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Martin",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Sint Maarten",
    "Slovakia (Slovak Republic)",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Georgia and the South Sandwich Islands",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "St. Pierre and Miquelon",
    "Suriname",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Taiwan,China",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks and Caicos Islands",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City State (Holy See)",
    "Venezuela",
    "Vietnam",
    "Virgin Islands (British)",
    "Virgin Islands (U.S.)",
    "Wallis And Futuna Islands",
    "Yemen",
    "Zambia",
    "Zanzibar",
    "Zimbabwe",
  ];

  const shippingMethods = [
    "AliExpress standard shipping",
    "EMS",
    "Fedex IP",
    "UPS Expedited",
    "UPS Express Saver",
    "DHL",
  ];

  return (
    <div className="w-full bg-white">
      <div className="flex items-center justify-between w-full px-6 py-3 min-h-[52px]">
        {/* Left Section - Action and Variant Filter flush left */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Action Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`h-9 min-h-[36px] max-h-[36px] px-3 border border-gray-200 text-base font-normal ${
                  hasSelectedProducts
                    ? "text-gray-700 hover:!bg-gray-100 hover:!border-gray-300 focus:!bg-gray-100 focus:!border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-gray-200"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                disabled={!hasSelectedProducts}
              >
                <span className="text-base font-normal">Action</span>
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-auto min-w-64 text-base whitespace-nowrap">
              {actionItems.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  disabled={item.disabled}
                  onSelect={() => onActionSelect?.(item.value)}
                  className="text-base font-normal"
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Variant Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-auto h-9 justify-between px-3 gap-2 border border-gray-200 text-base font-normal hover:!bg-gray-100 hover:!border-gray-300 focus:!bg-gray-100 focus:!border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-gray-200"
              >
                <span className="text-base font-normal">{variantType}</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0 text-base" align="start" sideOffset={4}>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  {availableVariantOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`variant-${option.toLowerCase()}`} 
                        className="h-4 w-4"
                        checked={selectedVariantOptions.includes(option)}
                        onCheckedChange={() => onVariantOptionToggle?.(option)}
                      />
                      <label 
                        htmlFor={`variant-${option.toLowerCase()}`} 
                        className="text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Section - Full Width Controls */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Ship To Location Selector */}
          <CascadingLocationSelector
            onLocationChange={handleShipToChangeWithPricing}
            defaultCountry={shipToValue}
            className="flex-shrink-0 [&_button]:hover:!bg-gray-100 [&_button]:hover:!border-gray-300 [&_button]:focus:!bg-gray-100 [&_button]:focus:!border-gray-300 [&_button]:focus:!outline-none [&_button]:focus:!ring-2 [&_button]:focus:!ring-gray-200"
          />

          {/* Shipping Method Select */}
          <div className="flex items-center flex-shrink-0">
            <Select value={shippingMethodValue} onValueChange={handleShippingMethodChangeWithPricing}>
              <SelectTrigger className="w-48 h-9 min-h-[36px] max-h-[36px] text-base font-normal border-gray-200 hover:!bg-gray-100 hover:!border-gray-300 focus:!bg-gray-100 focus:!border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-base">
                {shippingMethods.map((method) => (
                  <SelectItem key={method} value={method} className="text-base font-normal">
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Edit Options Dialog */}
          <EditOptionsDialog
            open={editOptionsOpen}
            onOpenChange={setEditOptionsOpen}
            onSave={handleEditOptionsSave}
            initialOptionName={variantType}
            initialOptions={availableVariantOptions}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-9 min-h-[36px] max-h-[36px] px-4 text-gray-700 border border-gray-200 flex-shrink-0 hover:!bg-gray-100 hover:!border-gray-300 focus:!bg-gray-100 focus:!border-gray-300 focus:!outline-none focus:!ring-2 focus:!ring-gray-200"
              >
                <EditIcon className="mr-2 h-4 w-4" />
                <span className="text-base font-normal">Edit Options</span>
              </Button>
            }
          />

          {/* Pricing Rule Switch */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-base font-normal text-gray-700 whitespace-nowrap">Pricing Rule:</span>
            <Switch
              checked={pricingRuleEnabled}
              onCheckedChange={handlePricingRuleToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}