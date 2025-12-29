"use client";

import { useState } from "react";
import { DialogStates, PopoverStates, SelectionStates, FilterState, Tag } from "@/types/import-list";

export function useImportListState() {
  // Dialog states
  const [dialogs, setDialogs] = useState<DialogStates>({
    filter: false,
    editProduct: false,
    editProductDetail: false,
    store: false,
    changeOptionPicture: false,
    changePriceDialog: false,
    changeCompareAtPriceDialog: false,
    changeStockDialog: false,
    deleteVariants: false,
    deleteImage: false,
    duplicateVariant: false,
    createTags: false,
    applyTags: false,
    deleteDialog: false,
  });

  // Popover states
  const [popovers, setPopovers] = useState<PopoverStates>({
    country: false,
    countryDropdown: false,
    editTooltip: false,
    showEmptyTag: false,
    resizeImage: null,
  });

  // Selection states
  const [selections, setSelections] = useState<SelectionStates>({
    selectedItems: [],
    selectedTags: [],
    selectedApplyTags: [],
    selectedImages: [],
    isAllApplyTagsSelected: false,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    priceRange: { min: 0, max: 0 },
    vendor: "",
    status: "",
    pushStatus: "",
    shipFrom: "",
    tags: [],
    country: "us",
    skuOver100: false,
  });

  // Product editing states
  const [productTitle, setProductTitle] = useState("Wireless Bluetooth Headphones");
  const [weightValue, setWeightValue] = useState(250);
  const [weightUnit, setWeightUnit] = useState("gm");
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(8);
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  
  // Tags and search states
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [createdTags, setCreatedTags] = useState<Tag[]>([]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [countrySearchValue, setCountrySearchValue] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper functions to update nested states
  const updateDialog = (key: keyof DialogStates, value: boolean) => {
    setDialogs(prev => ({ ...prev, [key]: value }));
  };

  const updatePopover = (key: keyof PopoverStates, value: boolean | number | null) => {
    setPopovers(prev => ({ ...prev, [key]: value }));
  };

  const updateSelection = (key: keyof SelectionStates, value: any) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    // States
    dialogs,
    popovers,
    selections,
    filters,
    productTitle,
    setProductTitle,
    weightValue,
    setWeightValue,
    weightUnit,
    setWeightUnit,
    length,
    setLength,
    width,
    setWidth,
    height,
    setHeight,
    dimensionUnit,
    setDimensionUnit,
    tagSearchQuery,
    setTagSearchQuery,
    newTagInput,
    setNewTagInput,
    createdTags,
    setCreatedTags,
    editingTagId,
    setEditingTagId,
    editingTagValue,
    setEditingTagValue,
    countrySearchValue,
    setCountrySearchValue,
    selectedStore,
    setSelectedStore,
    imageToDelete,
    setImageToDelete,
    isSaving,
    setIsSaving,
    
    // Helper functions
    updateDialog,
    updatePopover,
    updateSelection,
    updateFilter,
  };
}