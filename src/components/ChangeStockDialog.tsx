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

interface ChangeStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (newStock: number) => void;
}

export function ChangeStockDialog({
  open,
  onOpenChange,
  onSave,
}: ChangeStockDialogProps) {
  const [newStock, setNewStock] = React.useState("");

  // Reset stock when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setNewStock("");
    }
  }, [open]);

  const handleStockChange = (value: string) => {
    setNewStock(value);
  };

  const handleSave = () => {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) return;

    onSave?.(stock);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-stock" className="text-sm">New stock</Label>
            <DsiCounterbox
              id="new-stock"
              value={newStock}
              onChange={handleStockChange}
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
            disabled={!newStock || parseInt(newStock) < 0}
            className="uppercase text-sm font-medium"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}