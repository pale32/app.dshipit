"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Value",
  description = "After deleting the selected value, the related Variant will also be deleted. Please confirm whether to continue?",
}: DeleteConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-primary text-white uppercase text-sm font-medium"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}