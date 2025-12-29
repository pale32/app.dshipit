"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpgradePlanDialog } from "@/components/UpgradePlanDialog";

export default function TrackingPage() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleCreatePage = () => {
    setShowUpgradeDialog(true);
  };

  return (
    <div className="h-full w-full px-8 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-foreground text-4xl font-medium mb-4">Tracking Page</h1>
            <div className="space-y-4 mb-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Create your custom store tracking page in your store domain. The url of the page will be applied to shipping notification emails.{" "}
                <a
                  href="/help/tracking-page"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Click here
                </a>{" "}
                to learn more.
              </p>
              <div>
                <Button onClick={handleCreatePage} className="uppercase">
                  Create Page
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <img 
                  src="/pag.png" 
                  alt="Tracking page illustration" 
                  className="mx-auto max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        <UpgradePlanDialog 
          isOpen={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="Tracking Page"
        />
      </div>
    </div>
  );
}