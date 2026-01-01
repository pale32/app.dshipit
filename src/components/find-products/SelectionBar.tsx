"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface SelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onImportSelected: () => void;
  isAllSelected: boolean;
  isPartialSelected: boolean;
}

/**
 * Selection bar for bulk product actions
 * Shows select all checkbox and import button
 */
export function SelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onImportSelected,
  isAllSelected,
  isPartialSelected,
}: SelectionBarProps) {
  const handleCheckboxClick = () => {
    if (isAllSelected || isPartialSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Custom Checkbox */}
      <div
        className="relative h-5 w-5 cursor-pointer"
        onClick={handleCheckboxClick}
      >
        <div
          className={`
            peer w-5 h-5 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none
            flex items-center justify-center
            ${selectedCount === 0
              ? 'border-input dark:bg-input/30'
              : 'bg-primary text-primary-foreground border-primary dark:bg-primary'
            }
          `}
        >
          {selectedCount === 0 && ''}
          {isPartialSelected && !isAllSelected && '−'}
          {isAllSelected && selectedCount > 0 && (
            <CheckIcon className="size-3.5" />
          )}
        </div>
      </div>

      {/* Import Button */}
      <Button
        variant="default"
        onClick={onImportSelected}
        disabled={selectedCount === 0}
        className={selectedCount > 0
          ? "bg-primary hover:bg-[linear-gradient(90deg,#42A5F5_0%,#64B5F6_100%)]"
          : "bg-gray-200 hover:bg-gray-200 text-gray-600"
        }
      >
        Add to Import List ({selectedCount}/{totalCount})
      </Button>
    </div>
  );
}
