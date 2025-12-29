"use client";

// import { useState } from "react" // Unused import
import { Flame, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PromoBanner() {
  return (
    <div
      className="fixed top-16 z-50 flex min-h-12 w-full items-center justify-center px-4 py-2"
      style={{ background: 'linear-gradient(180deg, #DFEBFF 20%, #F5F8FC 130%)' }}
    >
      <div className="flex flex-col items-center gap-2 text-sm text-dsi-gray-700 dark:text-white sm:flex-row sm:gap-2 sm:text-lg">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 flex-shrink-0 animate-pulse sm:h-6 sm:w-6" style={{ color: '#6877FA' }} />
          <span className="text-center font-medium sm:text-left">
            Get your exclusive 14-day free trial.
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="px-3 py-1 text-xs text-white sm:px-4 sm:py-2 sm:text-base rounded-md font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#4455D4' }}
          >
            Start Selling
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="px-3 sm:px-4 h-[22px] sm:h-[38px] text-white rounded-md hover:opacity-90 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: '#4455D4' }}
              >
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>🚀 Launch Your Dropshipping Empire!</DialogTitle>
                <DialogDescription>
                  Transform your entrepreneurial dreams into reality with our comprehensive
                  dropshipping platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">10K+</div>
                    <div className="text-sm text-gray-600">Products Available</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">24/7</div>
                    <div className="text-sm text-gray-600">Customer Support</div>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-4 text-center">
                  <h3 className="mb-2 font-semibold text-black">🎁 Limited Time Offer</h3>
                  <p className="mb-3 text-sm text-gray-600">
                    Get your first month FREE + exclusive startup toolkit worth $297
                  </p>
                  <Button className="bg-destructive hover:bg-destructive/80 w-full text-white">
                    Claim Your Free Trial Now
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
