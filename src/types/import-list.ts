export interface Product {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  variants: ProductVariant[];
  images: ProductImage[];
  tags: string[];
  vendor: string;
  status: ProductStatus;
  pushStatus: PushStatus;
  weight: Weight;
  dimensions: Dimensions;
  shipFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  barcode?: string;
  weight: Weight;
  dimensions: Dimensions;
  options: VariantOption[];
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  type: ImageType;
  width: number;
  height: number;
  variantIds?: number[];
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export type ProductStatus = 'active' | 'draft' | 'archived';
export type PushStatus = 'pending' | 'published' | 'failed' | 'not_pushed';
export type ImageType = 'cover' | 'variant' | 'additional';
export type WeightUnit = 'gm' | 'kg' | 'lb' | 'oz';
export type DimensionUnit = 'cm' | 'in' | 'm' | 'mm';

export interface FilterState {
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
  vendor: string;
  status: ProductStatus | '';
  pushStatus: PushStatus | '';
  shipFrom: string;
  tags: string[];
  country: string;
  skuOver100: boolean;
}

export interface Tag {
  id: string;
  name: string;
  productCount: number;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Store {
  id: string;
  name: string;
  platform: string;
  isConnected: boolean;
}

// UI State interfaces
export interface DialogStates {
  filter: boolean;
  editProduct: boolean;
  editProductDetail: boolean;
  store: boolean;
  changeOptionPicture: boolean;
  changePriceDialog: boolean;
  changeCompareAtPriceDialog: boolean;
  changeStockDialog: boolean;
  deleteVariants: boolean;
  deleteImage: boolean;
  duplicateVariant: boolean;
  createTags: boolean;
  applyTags: boolean;
  deleteDialog: boolean;
}

export interface PopoverStates {
  country: boolean;
  countryDropdown: boolean;
  editTooltip: boolean;
  showEmptyTag: boolean;
  resizeImage: number | null;
}

export interface SelectionStates {
  selectedItems: number[];
  selectedTags: string[];
  selectedApplyTags: string[];
  selectedImages: number[];
  isAllApplyTagsSelected: boolean;
}