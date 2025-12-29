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

interface ChangePriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (newPrice: number) => void;
}

export function ChangePriceDialog({
  open,
  onOpenChange,
  onSave,
}: ChangePriceDialogProps) {
  const [newPrice, setNewPrice] = React.useState("");

  // Reset price when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setNewPrice("");
    }
  }, [open]);

  const handlePriceChange = (value: string) => {
    setNewPrice(value);
  };

  const handleSave = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;

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
          <DialogTitle>Change price</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-price" className="text-sm">New price</Label>
            <DsiCounterbox
              id="new-price"
              value={newPrice}
              onChange={handlePriceChange}
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
            disabled={!newPrice || parseFloat(newPrice) <= 0}
            className="uppercase text-sm font-medium"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}