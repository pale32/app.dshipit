"use client"

import React, { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GetCountries, GetState, GetCity } from "react-country-state-city"

const getShippingMethods = (country: string, state: string = "", city: string = "") => {
  // Mock shipping methods based on location
  const baseShippingMethods = [
    {
      company: "Cainiao Standard For Special Goods",
      shipFrom: "CN",
      cost: "Free Shipping",
      deliveryTime: "12~17days",
      tracking: "Available"
    },
    {
      company: "DHL Express",
      shipFrom: "HK",
      cost: "$15.99",
      deliveryTime: "3~5days",
      tracking: "Available"
    },
    {
      company: "FedEx International",
      shipFrom: "SG",
      cost: "$22.50",
      deliveryTime: "5~7days",
      tracking: "Available"
    }
  ];

  // Filter methods based on destination
  if (country === "United States") {
    return baseShippingMethods.concat([
      {
        company: "USPS Priority Mail",
        shipFrom: "US",
        cost: "$12.99",
        deliveryTime: "2~3days",
        tracking: "Available"
      }
    ]);
  }
  
  if (country === "United Kingdom") {
    return baseShippingMethods.concat([
      {
        company: "Royal Mail International",
        shipFrom: "GB",
        cost: "£8.99",
        deliveryTime: "3~5days",
        tracking: "Available"
      }
    ]);
  }

  if (country === "Canada") {
    return baseShippingMethods.concat([
      {
        company: "Canada Post Expedited",
        shipFrom: "CA",
        cost: "CAD $14.99",
        deliveryTime: "2~4days",
        tracking: "Available"
      }
    ]);
  }

  // Default methods for other countries
  return baseShippingMethods;
}

interface ProductVariant {
  id: string;
  sku: string;
  variantOption: string;
  supplierPrice: number;
  currentPrice: number;
}

interface ShippingInfoTabProps {
  productVariants?: ProductVariant[];
  onVariantChange?: (variant: ProductVariant) => void;
}

export function ShippingInfoTab({ 
  productVariants = [
    { id: "1", sku: "SKU-BOL-1", variantOption: "Bold Brown", supplierPrice: 11.50, currentPrice: 19.17 },
    { id: "2", sku: "SKU-LIG-2", variantOption: "Light Brown", supplierPrice: 11.75, currentPrice: 19.58 },
    { id: "3", sku: "SKU-DAR-3", variantOption: "Dark Brown", supplierPrice: 12.00, currentPrice: 20.00 }
  ], 
  onVariantChange 
}: ShippingInfoTabProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(productVariants[0])
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [selectedState, setSelectedState] = useState<any>(null)
  const [selectedCity, setSelectedCity] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [currentShippingMethods, setCurrentShippingMethods] = useState<any[]>([])

  const handleVariantChange = (variantId: string) => {
    const variant = productVariants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      onVariantChange?.(variant);
      // Update shipping methods when variant changes
      updateShippingMethods(selectedCountry?.name || "", selectedState?.name || "", selectedCity?.name || "");
    }
  };

  const updateShippingMethods = (country: string, state: string = "", city: string = "") => {
    const methods = getShippingMethods(country, state, city);
    setCurrentShippingMethods(methods);
  };

  // Get user's country from IP geolocation first, then device locale
  const getUserCountry = async () => {
    try {
      // First try IP geolocation with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        const response = await fetch('https://ipapi.co/json/', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        if (response.ok) {
          const data = await response.json()
          if (data.country_name) {
            return data.country_name
          }
        }
      } catch (ipError) {
        console.log('IP geolocation failed, falling back to device detection:', ipError)
      }

      // Fallback to device timezone/locale detection
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const locale = navigator.language || 'en-US'
      
      // Map common timezones to countries
      const timezoneToCountry: { [key: string]: string } = {
        'America/New_York': 'United States',
        'America/Los_Angeles': 'United States', 
        'America/Chicago': 'United States',
        'America/Denver': 'United States',
        'Europe/London': 'United Kingdom',
        'Europe/Berlin': 'Germany',
        'Europe/Paris': 'France',
        'Asia/Tokyo': 'Japan',
        'Asia/Shanghai': 'China',
        'Australia/Sydney': 'Australia',
        'Australia/Melbourne': 'Australia',
        'Canada/Eastern': 'Canada',
        'Canada/Central': 'Canada',
      }

      // Try timezone mapping
      if (timezoneToCountry[timezone]) {
        return timezoneToCountry[timezone]
      }

      // Try locale mapping
      const localeToCountry: { [key: string]: string } = {
        'en-US': 'United States',
        'en-GB': 'United Kingdom', 
        'en-AU': 'Australia',
        'en-CA': 'Canada',
        'fr-FR': 'France',
        'de-DE': 'Germany',
        'ja-JP': 'Japan',
        'zh-CN': 'China',
      }

      if (localeToCountry[locale]) {
        return localeToCountry[locale]
      }

      // Final fallback
      return 'United States'
    } catch (error) {
      console.error('Error detecting user country:', error)
      return 'United States'
    }
  }

  // Load countries and set default selection
  useEffect(() => {
    const initializeCountries = async () => {
      try {
        const data = await GetCountries()
        setCountries(data || [])

        if (data && data.length > 0) {
          // Try to detect user's country
          const userCountryName = await getUserCountry()
          let defaultCountry = data.find(c => c.name === userCountryName)
          
          // If user's country not found, use first country in list
          if (!defaultCountry) {
            defaultCountry = data[0]
          }

          // Set default country and load its states
          if (defaultCountry) {
            await handleCountrySelect(defaultCountry)
          } else {
            // Set initial shipping methods with empty location
            updateShippingMethods("", "", "")
          }
        }
      } catch (error) {
        console.error('Error loading countries:', error)
        setCountries([])
      }
    }

    const stored = localStorage.getItem('shipping-recent-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {
        console.error('Error parsing recent searches:', e)
      }
    }

    initializeCountries()
  }, [])

  // Save recent search and update state
  const addToRecentSearches = (countryName: string) => {
    if (!countryName) return
    
    const updated = [countryName, ...recentSearches.filter(c => c !== countryName)].slice(0, 3)
    setRecentSearches(updated)
    localStorage.setItem('shipping-recent-searches', JSON.stringify(updated))
  }

  const handleCountrySelect = async (country: any) => {
    setSelectedCountry(country)
    setSelectedState(null)
    setSelectedCity(null)
    setCities([])
    addToRecentSearches(country.name)
    updateShippingMethods(country.name, "", "")
    
    try {
      const countryStates = await GetState(country.id)
      setStates(countryStates || [])
    } catch (error) {
      console.error('Error loading states:', error)
      setStates([])
    }
  }

  const handleStateSelect = async (state: any) => {
    setSelectedState(state)
    setSelectedCity(null)
    updateShippingMethods(selectedCountry?.name || "", state.name, "")
    
    try {
      const stateCities = await GetCity(selectedCountry.id, state.id)
      setCities(stateCities || [])
    } catch (error) {
      console.error('Error loading cities:', error)
      setCities([])
    }
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full">
      <div className="mb-8 px-4 md:px-6">
        <ul className="list-disc pl-4 space-y-1">
          <li className="text-[15px]">
            You can check AliExpress shipping cost information, estimated delivery time and tracking availability here by selecting a Ship to (and Ship from) country. Shipping information will NOT be pushed to store when you publish. This is just to give you an estimate of shipping cost.
          </li>
          <li className="text-[15px]">
            If you want to set the shipping method for a specific country, go to{" "}
            <a 
              href="/application/settings?type=Logistics_Setting" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Setting-Shipping
            </a>{" "}
            to set it up
          </li>
        </ul>
      </div>

      <div className="w-full mb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="text-base font-medium">SKU:</div>
          <div className="flex-1">
            <Select value={selectedVariant.id} onValueChange={handleVariantChange}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedVariant.sku} - {selectedVariant.variantOption}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productVariants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.sku} - {variant.variantOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
        
      <div className="w-full flex gap-0">
        {/* Left Section - Ship to (Fixed 265px width) */}
        <div className="w-[265px] flex-shrink-0 border border-r-0 border-gray-200 rounded-l-lg">
          <div className="p-4">
            <h2 className="text-base font-medium mb-3">Ship to:</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base placeholder:text-base"
              />
            </div>

            {recentSearches.length > 0 && (
              <div className="mb-4">
                <span className="text-base font-medium text-muted-foreground">Recent Searches</span>
                <div className="flex flex-col gap-2 mt-2">
                  {recentSearches.slice(0, 3).map((countryName, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 flex items-center justify-center text-base font-light py-1 px-3 rounded-md border min-h-[32px] text-black ${
                        countryName === selectedCountry?.name 
                          ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 shadow-sm' 
                          : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 hover:from-rose-50 hover:to-pink-50 hover:border-rose-200 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        const country = countries.find(c => c.name === countryName)
                        if (country) handleCountrySelect(country)
                      }}
                    >
                      {countryName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y">
                {filteredCountries.map((country) => (
                  <li
                    key={country.id}
                    className={`px-3 py-2 hover:bg-muted cursor-pointer flex justify-between items-center ${
                      country.id === selectedCountry?.id ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className="text-base">{country.name}</span>
                    {country.id === selectedCountry?.id && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Section - Location & Shipping (Remaining width) */}
        <div className="flex-1 border border-gray-200 rounded-r-lg">
          <div className="p-4">
            {/* Location Selectors at Top - SetShipping_fuLogisticsRightTitle */}
            {selectedCountry && (
              <div className="flex items-center mb-6">
                <div className="text-base font-light mr-4">
                  {selectedCountry.name}
                </div>
                {states.length > 0 && (
                  <>
                    <Select 
                      value={selectedState?.name || ''} 
                      onValueChange={(value) => {
                        const state = states.find(s => s.name === value)
                        if (state) handleStateSelect(state)
                      }}
                    >
                      <SelectTrigger className="min-w-[180px] w-auto mr-[10px] h-9">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] min-w-[180px] w-auto">
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.name} className="whitespace-nowrap">
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={selectedCity?.name || ''} 
                      onValueChange={(value) => {
                        const city = cities.find(c => c.name === value)
                        if (city) setSelectedCity(city)
                      }}
                      disabled={!selectedState}
                    >
                      <SelectTrigger className={`min-w-[150px] w-auto h-9 ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder={!selectedState ? "Select state first" : (cities.length ? "Select city" : "No cities available")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] min-w-[150px] w-auto">
                        {cities.map((city) => (
                          <SelectItem key={city.name} value={city.name} className="whitespace-nowrap">
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            )}

            {/* Shipping Methods Table - SetShipping_fuLogisticsRightList */}
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="text-sm font-medium text-left">Shipping Company</TableHead>
                    <TableHead className="text-sm font-medium text-center">Ship From</TableHead>
                    <TableHead className="text-sm font-medium text-center">Shipping Cost</TableHead>
                    <TableHead className="text-sm font-medium text-center">Est. Delivery Time</TableHead>
                    <TableHead className="text-sm font-medium text-center">Tracking Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentShippingMethods.map((method, index) => (
                    <TableRow key={index} className="border-b-0">
                      <TableCell className="text-sm py-3">
                        <span className="font-light whitespace-nowrap">{method.company}</span>
                      </TableCell>
                      <TableCell className="text-sm text-center py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-light">
                          {method.shipFrom}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-center py-3">
                        <span className="text-green-600 font-light">{method.cost}</span>
                      </TableCell>
                      <TableCell className="text-sm text-center py-3">
                        <span className="text-gray-700 font-light">{method.deliveryTime}</span>
                      </TableCell>
                      <TableCell className="text-sm text-center py-3">
                        <span className="text-blue-600 font-light">{method.tracking}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}