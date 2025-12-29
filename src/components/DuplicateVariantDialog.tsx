"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DuplicateVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantName: string; // e.g., "Color", "Size", "Unit"
  onDuplicate?: (newVariantValue: string) => void;
}

export function DuplicateVariantDialog({
  open,
  onOpenChange,
  variantName,
  onDuplicate,
}: DuplicateVariantDialogProps) {
  const [newVariantValue, setNewVariantValue] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setNewVariantValue("");
    }
  }, [open]);

  const handleDuplicate = () => {
    if (newVariantValue.trim()) {
      onDuplicate?.(newVariantValue.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Duplicate in another {variantName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-base font-normal mb-2.5">
            {variantName} for duplicated variant
          </p>
          <Input
            value={newVariantValue}
            onChange={(e) => setNewVariantValue(e.target.value)}
            maxLength={50}
            placeholder={`Enter ${variantName.toLowerCase()}`}
          />
        </div>

        <DialogFooter className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="uppercase text-base font-normal"
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleDuplicate}
            disabled={!newVariantValue.trim()}
            className="uppercase text-base font-normal"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}