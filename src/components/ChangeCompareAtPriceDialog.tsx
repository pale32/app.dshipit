"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DsiCounterbox } from "@/components/dsi-counterbox";

interface ChangeCompareAtPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (newComparePrice: number) => void;
}

export function ChangeCompareAtPriceDialog({
  open,
  onOpenChange,
  onSave,
}: ChangeCompareAtPriceDialogProps) {
  const [newComparePrice, setNewComparePrice] = React.useState("");

  // Reset price when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setNewComparePrice("");
    }
  }, [open]);

  const handleComparePriceChange = (value: string) => {
    setNewComparePrice(value);
  };

  const handleSave = () => {
    const price = parseFloat(newComparePrice);
    if (isNaN(price) || price < 0) return;

    onSave?.(price);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change compare at price</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-compare-price" className="text-sm">New compare price</Label>
            <DsiCounterbox
              id="new-compare-price"
              value={newComparePrice}
              onChange={handleComparePriceChange}
              placeholder=""
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="uppercase text-sm font-medium"
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!newComparePrice || parseFloat(newComparePrice) < 0}
            className="uppercase text-sm font-medium"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}