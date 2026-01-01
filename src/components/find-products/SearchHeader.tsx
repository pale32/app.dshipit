"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Camera } from "lucide-react";

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  onImageSearch?: (file: File) => void;
  placeholder?: string;
  defaultValue?: string;
}

/**
 * Search header with text search and image search capabilities
 * Clean, modern design with camera icon for image search
 */
export function SearchHeader({
  onSearch,
  onImageSearch,
  placeholder = "Search for products...",
  defaultValue = "",
}: SearchHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const query = searchInputRef.current?.value || "";
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSearch) {
      onImageSearch(file);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-2xl">
      {/* Search Input Container */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          defaultValue={defaultValue}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 h-10 text-base"
        />
      </div>

      {/* Image Search Button */}
      {onImageSearch && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCameraClick}
            className="h-10 w-10 shrink-0"
            title="Search by image"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        className="h-10 px-6 shrink-0"
      >
        Search
      </Button>
    </div>
  );
}
