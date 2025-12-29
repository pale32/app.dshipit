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
import { X } from "lucide-react";

interface DeleteImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  selectedCount?: number;
}

export function DeleteImageDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount = 1
}: DeleteImageDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const isPlural = selectedCount > 1;
  const imageText = isPlural ? 'image(s)' : 'image(s)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[560px] h-[174px] max-w-none p-0 overflow-hidden"
        style={{ width: '560px', height: '174px', padding: 0, margin: 0 }}>
        <button type="button" onClick={() => onOpenChange(false)} className="absolute top-4 right-4">
          <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
            <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
          </svg>
        </button>

        <div className="px-6 pt-4 pb-1">
          <DialogTitle className="font-medium m-0 p-0">Deleted Image</DialogTitle>
        </div>
        
        <div className="px-6 pb-1">
          <div>Do you want to delete the image(s)? The deleted image(s) will not be uploaded to the Media section in the Shopify product.</div>
        </div>

        <DialogFooter className="px-6 pb-4">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}