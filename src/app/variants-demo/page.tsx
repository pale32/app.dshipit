"use client";

import { useState } from "react";
import { VariantsTabBar } from "@/components/VariantsTabBar";

export default function VariantsDemoPage() {
  const [shipTo, setShipTo] = useState("United Arab Emirates");
  const [shippingMethod, setShippingMethod] = useState("AliExpress standard shipping");
  const [pricingRule, setPricingRule] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(0);

  const handleActionSelect = (action: string) => {
    console.log("Action selected:", action);
    // Handle action selection logic here
  };

  const handleEditOptions = () => {
    console.log("Edit options clicked");
    // Handle edit options logic here
  };

  const handleSelectProducts = (count: number) => {
    setSelectedProducts(count);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-2">Variants Tab Bar Demo</h1>
          <p className="text-gray-600">
            Full page width filter bar with modern shadcn/ui components replacing Ant Design
          </p>
        </div>
      </div>

      {/* Full Page Width Filter Bar */}
      <VariantsTabBar
        onActionSelect={handleActionSelect}
        onShipToChange={setShipTo}
        onShippingMethodChange={setShippingMethod}
        onEditOptions={handleEditOptions}
        onPricingRuleChange={setPricingRule}
        shipToValue={shipTo}
        shippingMethodValue={shippingMethod}
        pricingRuleEnabled={pricingRule}
        selectedProductsCount={selectedProducts}
      />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Demo Controls */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3">Demo Controls</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-800">Simulate selected products:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectProducts(0)}
                className={`px-3 py-1 text-xs rounded ${
                  selectedProducts === 0
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-300"
                }`}
              >
                None (0)
              </button>
              <button
                onClick={() => handleSelectProducts(2)}
                className={`px-3 py-1 text-xs rounded ${
                  selectedProducts === 2
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-300"
                }`}
              >
                Some (2)
              </button>
              <button
                onClick={() => handleSelectProducts(5)}
                className={`px-3 py-1 text-xs rounded ${
                  selectedProducts === 5
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-300"
                }`}
              >
                Many (5)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-black mb-2">Current Settings</h3>
            <div className="space-y-2 text-gray-600">
              <div><strong>Ship to:</strong> {shipTo}</div>
              <div><strong>Shipping:</strong> {shippingMethod}</div>
              <div><strong>Pricing Rule:</strong> {pricingRule ? "Enabled" : "Disabled"}</div>
              <div><strong>Selected Products:</strong> {selectedProducts}</div>
              <div><strong>Action Button:</strong> {selectedProducts > 0 ? "Enabled" : "Disabled"}</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Features</h3>
            <ul className="space-y-1 text-blue-700 text-xs">
              <li>• shadcn/ui DropdownMenu</li>
              <li>• shadcn/ui Select components</li>
              <li>• shadcn/ui Switch</li>
              <li>• Tailwind CSS styling</li>
              <li>• Responsive design</li>
              <li>• Accessible components</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Improvements</h3>
            <ul className="space-y-1 text-green-700 text-xs">
              <li>• No Ant Design dependencies</li>
              <li>• Better TypeScript support</li>
              <li>• Consistent design system</li>
              <li>• Smaller bundle size</li>
              <li>• Modern component patterns</li>
              <li>• Customizable styling</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Usage Instructions</h3>
          <p className="text-yellow-800 text-sm">
            This component replaces the original Ant Design-based variants tab bar. 
            All functionality has been preserved while using modern shadcn/ui components 
            and Tailwind CSS for styling. The Action dropdown is disabled by default 
            and only activates when products are selected in the table below.
          </p>
        </div>
      </div>
    </div>
  );
}