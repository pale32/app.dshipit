"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronLeft, ChevronsUpDown } from "lucide-react";
import { locationService } from "@/services/locationService";

interface CascadingLocationSelectorProps {
  onLocationChange?: (country: string, state: string, city: string) => void;
  defaultCountry?: string;
  defaultState?: string;
  defaultCity?: string;
  className?: string;
  useGeolocation?: boolean; // Enable geolocation-based default country detection
}

type SelectionLevel = 'country' | 'state' | 'city';

export function CascadingLocationSelector({
  onLocationChange,
  defaultCountry = "",
  defaultState = "",
  defaultCity = "",
  className = "",
  useGeolocation = true // Enabled by default
}: CascadingLocationSelectorProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [country, setCountry] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [city, setCity] = useState<any>(null);
  const [currentLevel, setCurrentLevel] = useState<SelectionLevel>('country');
  const [open, setOpen] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<any>(null);
  const initializedRef = useRef(false);
  const [displayCountryName, setDisplayCountryName] = useState<string>("United States");

  // Load countries and detect user location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const countriesData = await GetCountries();
        setCountries(countriesData || []);

        if (!initializedRef.current) {
          let targetCountryName = "United States";

          // If geolocation is enabled and no default country provided, detect user location
          if (useGeolocation && !defaultCountry) {
            try {
              const locationData = await locationService.detectUserLocation();
              if (locationData && locationData.country) {
                targetCountryName = locationData.country;
              }
            } catch (error) {
              console.warn('Geolocation detection failed, using default:', error);
            }
          } else if (defaultCountry) {
            targetCountryName = defaultCountry;
          }

          // Find the country in the list
          const matchedCountry = countriesData?.find((c: any) =>
            c.name === targetCountryName ||
            c.name === `${targetCountryName} of America` ||
            c.name.toLowerCase().includes(targetCountryName.toLowerCase())
          );

          if (matchedCountry) {
            setCountry(matchedCountry);
            setDisplayCountryName(matchedCountry.name);
          } else {
            // Fallback to USA if country not found
            const usa = countriesData?.find((c: any) =>
              c.name === 'United States' || c.name === 'United States of America'
            );
            if (usa) {
              setCountry(usa);
              setDisplayCountryName(usa.name);
            }
          }

          initializedRef.current = true;
        }
      } catch (error) {
        console.error('Error initializing location selector:', error);
        setCountries([]);
      }
    };

    initializeLocation();
  }, [defaultCountry, useGeolocation]);

  // Handle location change callback
  const handleLocationChange = useCallback((newCountry: any, newState: any, newCity: any) => {
    const countryName = newCountry?.name || "";
    const stateName = newState?.name || "";
    const cityName = newCity?.name || "";
    onLocationChange?.(countryName, stateName, cityName);
  }, [onLocationChange]);

  const handleCountrySelect = async (selectedCountry: any) => {
    setCountry(selectedCountry);
    setState(null);
    setCity(null);
    setCities([]);
    
    try {
      // Load states for this country
      const countryStates = await GetState(selectedCountry.id);
      setStates(countryStates || []);
      
      if (countryStates && countryStates.length > 0) {
        setCurrentLevel('state');
      } else {
        // No states, complete selection
        handleLocationChange(selectedCountry, null, null);
        setOpen(false);
        setCurrentLevel('country');
      }
    } catch (error) {
      console.error('Error loading states:', error);
      // Complete selection without states
      handleLocationChange(selectedCountry, null, null);
      setOpen(false);
      setCurrentLevel('country');
    }
  };

  const handleStateSelect = async (selectedState: any) => {
    setState(selectedState);
    setCity(null);
    
    try {
      // Load cities for this state
      const stateCities = await GetCity(country.id, selectedState.id);
      setCities(stateCities || []);
      
      if (stateCities && stateCities.length > 0) {
        setCurrentLevel('city');
      } else {
        // No cities, complete selection
        handleLocationChange(country, selectedState, null);
        setOpen(false);
        setCurrentLevel('country');
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // Complete selection without cities
      handleLocationChange(country, selectedState, null);
      setOpen(false);
      setCurrentLevel('country');
    }
  };

  const handleCitySelect = (selectedCity: any) => {
    setCity(selectedCity);
    handleLocationChange(country, state, selectedCity);
    setOpen(false);
    setCurrentLevel('country');
  };

  const handleBack = () => {
    if (currentLevel === 'city') {
      setCurrentLevel('state');
      setCity(null);
    } else if (currentLevel === 'state') {
      setCurrentLevel('country');
      setState(null);
      setStates([]);
    }
  };

  const getDisplayValue = () => {
    if (city && state && country) return `${country.name}, ${state.name}, ${city.name}`;
    if (state && country) return `${country.name}, ${state.name}`;
    if (country) return country.name;
    return displayCountryName; // Use detected/default country name
  };

  const handleCountryHover = async (hoveredCountry: any) => {
    setHoveredCountry(hoveredCountry);
    
    // Reset states and cities when hovering over a different country
    setCities([]);
    setHoveredState(null);
    
    try {
      const countryStates = await GetState(hoveredCountry.id);
      if (countryStates && countryStates.length > 0) {
        setStates(countryStates);
        setCurrentLevel('state');
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error loading states on hover:', error);
      setStates([]);
    }
  };

  const handleStateHover = async (hoveredState: any) => {
    setHoveredState(hoveredState);
    
    try {
      const stateCities = await GetCity(hoveredCountry.id, hoveredState.id);
      if (stateCities && stateCities.length > 0) {
        setCities(stateCities);
        setCurrentLevel('city');
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities on hover:', error);
      setCities([]);
    }
  };

  const getCurrentItems = () => {
    switch (currentLevel) {
      case 'country':
        return countries;
      case 'state':
        return states;
      case 'city':
        return cities;
      default:
        return [];
    }
  };

  const getLevelTitle = () => {
    switch (currentLevel) {
      case 'country':
        return '';
      case 'state':
        return `${country?.name}`;
      case 'city':
        return `${country?.name}, ${state?.name}`;
      default:
        return '';
    }
  };

  const handleItemSelect = (item: any) => {
    switch (currentLevel) {
      case 'country':
        handleCountrySelect(item);
        break;
      case 'state':
        handleStateSelect(item);
        break;
      case 'city':
        handleCitySelect(item);
        break;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base font-normal text-gray-700 whitespace-nowrap">Ship to:</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-48 h-9 min-h-[36px] max-h-[36px] justify-between text-base font-normal bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <span className="truncate text-black">{getDisplayValue() || "United States"}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border border-gray-200 shadow-xl rounded-xl max-w-[90vw] overflow-hidden" align="start">
          <div className="flex whitespace-nowrap" style={{ height: '350px' }}>
            {/* Countries Column */}
            <div className={`min-w-[280px] max-w-[320px] bg-white flex flex-col ${states.length > 0 ? 'border-r border-gray-200' : ''}`}>
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/80">
                <span className="text-sm font-medium text-gray-600">Country</span>
              </div>
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden p-2"
                style={{ scrollBehavior: 'smooth' }}
                onWheel={(e) => {
                  e.stopPropagation();
                  const container = e.currentTarget;
                  container.scrollTop += e.deltaY;
                }}
              >
                {countries.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => handleCountryHover(item)}
                    onClick={() => {
                      setCountry(item);
                      setState(null);
                      setCity(null);
                      handleLocationChange(item, null, null);
                      if (!states.length) {
                        setOpen(false);
                        setCurrentLevel('country');
                      }
                    }}
                    className={`flex items-center px-3 py-2.5 my-0.5 rounded-lg cursor-pointer text-base transition-all duration-150 ${
                      country?.id === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    title={item.name}
                  >
                    <span className="truncate">
                      {item.name}
                    </span>
                    {states.length > 0 && hoveredCountry?.id === item.id && (
                      <svg className="ml-auto h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* States Column */}
            {states.length > 0 && (
              <div className={`min-w-[280px] max-w-[320px] bg-white flex flex-col ${cities.length > 0 ? 'border-r border-gray-200' : ''}`}>
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/80">
                  <span className="text-sm font-medium text-gray-600">State / Province</span>
                </div>
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden p-2"
                  style={{ scrollBehavior: 'smooth' }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget;
                    container.scrollTop += e.deltaY;
                  }}
                >
                  {states.map((item) => (
                    <div
                      key={item.id}
                      onMouseEnter={() => handleStateHover(item)}
                      onClick={() => {
                        setState(item);
                        handleLocationChange(hoveredCountry || country, item, null);
                        if (!cities.length) {
                          setOpen(false);
                          setCurrentLevel('country');
                        }
                      }}
                      className={`flex items-center px-3 py-2.5 my-0.5 rounded-lg cursor-pointer text-base transition-all duration-150 ${
                        state?.id === item.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      title={item.name}
                    >
                      <span className="truncate">
                        {item.name}
                      </span>
                      {cities.length > 0 && hoveredState?.id === item.id && (
                        <svg className="ml-auto h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cities Column */}
            {cities.length > 0 && (
              <div className="min-w-[280px] max-w-[320px] bg-white flex flex-col">
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/80">
                  <span className="text-sm font-medium text-gray-600">City</span>
                </div>
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden p-2"
                  style={{ scrollBehavior: 'smooth' }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget;
                    container.scrollTop += e.deltaY;
                  }}
                >
                  {cities.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => {
                        setCity(item);
                        handleLocationChange(hoveredCountry || country, hoveredState || state, item);
                        setOpen(false);
                        setCurrentLevel('country');
                      }}
                      className={`flex items-center px-3 py-2.5 my-0.5 rounded-lg cursor-pointer text-base transition-all duration-150 ${
                        city?.name === item.name
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      title={item.name}
                    >
                      <span className="truncate">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}