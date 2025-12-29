"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Image as ImageIcon, ExternalLink, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VariantOption {
  id: string;
  name: string;
  value: string;
  image?: string;
  selected?: boolean;
}

interface ChangeOptionPictureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVariants?: VariantOption[];
  onSave?: (updatedVariants: VariantOption[], selectedImageUrl?: string) => void;
}

export function ChangeOptionPictureSheet({
  open,
  onOpenChange,
  selectedVariants = [],
  onSave,
}: ChangeOptionPictureSheetProps) {
  const [variants, setVariants] = React.useState<VariantOption[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = React.useState<string[]>([]);
  const [uploadMethod, setUploadMethod] = React.useState<"select" | "upload" | "url">("select");
  const [imageUrl, setImageUrl] = React.useState("");
  const [selectedImageUrl, setSelectedImageUrl] = React.useState("");
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const initializedRef = React.useRef(false);
  const variantsInitializedRef = React.useRef(false);

  // Product images from supplier API (mock data)
  const productImages = [
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
    "https://ae01.alicdn.com/kf/S8401d184199140b2b4b3ed7babca3a9c7.jpg",
    "https://ae01.alicdn.com/kf/S11c26fc13c9640269897a9bd8d2440f7i.jpg",
    "https://ae01.alicdn.com/kf/Sab1085473a8b4aec989cfcd6f8bd8b710.jpg",
    "https://ae01.alicdn.com/kf/S48506018d3524fd1909d136c0f197acdT.jpg",
    "https://ae01.alicdn.com/kf/Sb5ee4f3bb27f44029044e7d1c5a74a1aO.jpg",
    "https://ae01.alicdn.com/kf/Sb941f3868c7e4d328a0731fb43e1115bK.jpg",
    "https://ae01.alicdn.com/kf/S22ac48a85b144bb59cf0cb3e4d02f792R.jpg",
  ];

  // Initialize variants data only once to prevent infinite loops
  React.useEffect(() => {
    if (!variantsInitializedRef.current) {
      if (selectedVariants.length > 0) {
        setVariants(selectedVariants);
      } else {
        // Mock data for unit variants
        setVariants([
          {
            id: "1",
            name: "Unit",
            value: "AU",
            image: "https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg",
            selected: true,
          },
          {
            id: "2",
            name: "Unit",
            value: "UK",
            image: "https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg",
            selected: false,
          },
          {
            id: "3",
            name: "Unit",
            value: "EU",
            image: "https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg",
            selected: true,
          },
          {
            id: "4",
            name: "Unit",
            value: "US",
            image: "https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg",
            selected: false,
          },
        ]);
      }
      variantsInitializedRef.current = true;
    }
  }, []); // No dependencies - only run once

  // Simple reset when sheet closes - no automatic initialization
  React.useEffect(() => {
    if (!open) {
      setSelectedVariantIds([]);
      initializedRef.current = false;
      // Don't reset variantsInitializedRef - let variants persist
    }
  }, [open]);

  const handleVariantToggle = (variantId: string) => {
    setSelectedVariantIds(prev => 
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVariantIds.length === variants.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(variants.map(v => v.id));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        applyImageToSelectedVariants(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      applyImageToSelectedVariants(imageUrl.trim());
      setImageUrl("");
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    applyImageToSelectedVariants(imageUrl);
  };

  const applyImageToSelectedVariants = (imageSource: string) => {
    setVariants(prev => 
      prev.map(variant => 
        selectedVariantIds.includes(variant.id)
          ? { ...variant, image: imageSource }
          : variant
      )
    );
  };

  const handleSave = () => {
    const updatedVariants = variants.map(variant => ({
      ...variant,
      selected: selectedVariantIds.includes(variant.id)
    }));
    onSave?.(updatedVariants, selectedImageUrl);
    onOpenChange(false);
  };

  const handleReset = () => {
    // Reset to original images
    setVariants(prev => 
      prev.map(variant => ({
        ...variant,
        image: "https://ae01.alicdn.com/kf/H0d497faa73bf464fa2905a972d9ae87bf.jpg"
      }))
    );
  };

  const selectedCount = selectedVariantIds.length;
  const totalCount = variants.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[868px] w-[868px]">
        <SheetHeader className="pb-6 px-8">
          <SheetTitle className="text-3xl font-semibold">Images</SheetTitle>
          <SheetDescription className="text-base font-light">
            You can choose a different image for the selected variant or main from the following product images
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto px-8">
          {/* Image Selection */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {productImages.map((imageUrl, index) => (
                <label key={index} className="cursor-pointer block relative">
                  <input
                    type="radio"
                    name="product-image"
                    value={imageUrl}
                    checked={selectedImageUrl === imageUrl}
                    onChange={(e) => handleImageSelect(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border overflow-hidden transition-all relative ${
                    selectedImageUrl === imageUrl 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`} style={{borderRadius: '8px'}}>
                    <img 
                      src={imageUrl} 
                      alt={`Product image ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedImageUrl === imageUrl
                          ? 'bg-white border-orange-500'
                          : 'bg-white border-gray-300 hover:border-orange-400'
                      }`}>
                        {selectedImageUrl === imageUrl && (
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Variant Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Variants</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-base"
              >
                {selectedCount === totalCount ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedVariantIds.includes(variant.id)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleVariantToggle(variant.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedVariantIds.includes(variant.id)}
                      onChange={() => handleVariantToggle(variant.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-medium">{variant.name}</span>
                        <Badge variant="secondary" className="text-sm">
                          {variant.value}
                        </Badge>
                      </div>
                      {variant.image && (
                        <div className="mt-2">
                          <img
                            src={variant.image}
                            alt={`${variant.name} - ${variant.value}`}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedCount > 0 && (
              <div className="text-base text-muted-foreground">
                {selectedCount} of {totalCount} variants selected
              </div>
            )}
          </div>

          {/* Preview Section */}
          {selectedCount > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Preview</Label>
              <div className="grid grid-cols-2 gap-3">
                {variants
                  .filter(variant => selectedVariantIds.includes(variant.id))
                  .map((variant) => (
                    <div key={variant.id} className="border rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-medium">{variant.name}</span>
                            <Badge variant="secondary" className="text-sm">
                              {variant.value}
                            </Badge>
                          </div>
                          {variant.image && (
                            <div className="mt-2">
                              <img
                                src={variant.image}
                                alt={`${variant.name} - ${variant.value}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 pb-6 border-t px-8">
          <span></span>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              CANCEL
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedImageUrl && uploadMethod === 'select'}
              className="uppercase px-6"
            >
              Select
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}