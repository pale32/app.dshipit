"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UpgradePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradePlanDialog({ isOpen, onClose, feature = "Tracking" }: UpgradePlanDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState("TYPE_ADVANCED");
  const [billingStore, setBillingStore] = useState("stripe");

  const handleUpgrade = () => {
    console.log("Upgrading with plan:", selectedPlan, "billing:", billingStore);
    // Handle upgrade logic here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[560px] min-w-[560px] max-w-[560px] p-0 gap-0 flex flex-col rounded-[12px] shadow-none border-0 bg-background dark:bg-slate-900">
        <DialogHeader className="px-4 py-3 space-y-0 border-b">
          <DialogTitle className="text-xl font-bold tracking-wide">Upgrade Plan</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 flex-1">
          <p className="text-base text-muted-foreground mb-3">
            Please UPGRADE to enjoy the paid feature and extend the resource limitation.
          </p>

          <div className="space-y-2">
            <div className="flex items-center py-1">
              <span className="font-medium text-base w-20">Feature</span>
              <span className="text-base ml-8 text-orange-500">{feature}</span>
            </div>

            <div className="flex items-center py-1">
              <span className="font-medium text-base w-20">Plan</span>
              <div className="ml-8">
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TYPE_ADVANCED" id="advanced" />
                    <Label htmlFor="advanced" className="text-base cursor-pointer whitespace-nowrap">
                      Advanced ($19.9)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TYPE_PRO" id="pro" />
                    <Label htmlFor="pro" className="text-base cursor-pointer whitespace-nowrap">
                      Pro ($49.9)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex items-center py-1">
              <span className="font-medium text-base w-20">Billing store</span>
              <div className="w-[180px] ml-8">
                <Select value={billingStore} onValueChange={setBillingStore}>
                  <SelectTrigger className="w-full h-8 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <img 
                          src="/stripe.png" 
                          alt="Stripe" 
                          className="w-5 h-5"
                        />
                        <span>Stripe</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <img 
                          src="/paypal.png" 
                          alt="PayPal" 
                          className="w-5 h-5"
                        />
                        <span>PayPal</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t">
          <p className="text-sm text-muted-foreground flex-1 mr-4">
            For more features in the plan, click{" "}
            <a
              href="/application/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              here
            </a>
            .
          </p>
          <div
            className="upgrade-button-wrapper rounded-[12.5rem] inline-block transition-all duration-200"
            style={{
              background: 'linear-gradient(56deg, #45c4f9, #7d09ff 50.33%, #ff0be5)',
              boxShadow: '0 4px 4px 0 rgba(87, 75, 172, .15)',
              padding: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(56deg, #3aa5d1, #6507d9 50.33%, #d108c1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(56deg, #45c4f9, #7d09ff 50.33%, #ff0be5)';
            }}
          >
            <Button 
              onClick={handleUpgrade} 
              variant="ghost"
              className="rounded-[12.5rem] text-white px-8 py-2 h-10 border-0 font-bold bg-transparent hover:bg-transparent hover:text-white uppercase"
            >
              UPGRADE NOW
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}