"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteVariantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems?: number[];
  onDeleteVariants?: (itemIds: number[]) => void;
}

export function DeleteVariantsDialog({
  open,
  onOpenChange,
  selectedItems = [],
  onDeleteVariants
}: DeleteVariantsDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onDeleteVariants?.(selectedItems);
    console.log(`Deleting ${selectedItems.length} variant(s)`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Variant{selectedItems.length !== 1 ? 's' : ''}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete {selectedItems.length === 1 ? 'this variant' : 'these variants'}?
          </p>
          
          {selectedItems.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              This action will permanently delete {selectedItems.length} selected variant{selectedItems.length !== 1 ? 's' : ''}.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="uppercase"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            className="uppercase"
          >
            Delete Variant{selectedItems.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}