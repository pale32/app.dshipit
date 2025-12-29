"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductLimitUpgradeDialog } from "@/components/ProductLimitUpgradeDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries } from "@/lib/countries";

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("management");
  const [billingMethod, setBillingMethod] = useState("stripe");
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [billingActivated, setBillingActivated] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(3000);
  const [newLimit, setNewLimit] = useState(20000);
  const [businessInfoDialogOpen, setBusinessInfoDialogOpen] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "filipop@gmail.com",
    country: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: ""
  });

  const handleBillingMethodChange = (value: string) => {
    setBillingMethod(value);
    setBillingActivated(false);
  };

  const handleUpgradeClick = (current: number, next: number) => {
    setCurrentLimit(current);
    setNewLimit(next);
    setUpgradeDialogOpen(true);
  };

  const handleBusinessInfoSave = () => {
    console.log("Saving business info:", businessInfo);
    setBusinessInfoDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[1156px] mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-3">Manage subscription</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Manage your subscription and set up a default billing store here. Click{" "}
            <a
              href="https://help.dshipit.com/upgrade-downgrade-plan/"
              className="text-primary hover:underline"
            >
              here
            </a>{" "}
            to check how to manage subscription. And if you want to know more about DShipIt Plan Policy, please click{" "}
            <a
              href="https://help.dshipit.com/subscription-plans-presentation/"
              className="text-primary hover:underline"
            >
              here
            </a>
            . If you want cancel subscription, please click{" "}
            <a
              href="mailto:support@dshipit.com"
              className="text-primary hover:underline"
            >
              here
            </a>{" "}
            to contact DShipIt support team.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex bg-transparent p-0 gap-2 border-0 mb-6">
            <TabsTrigger
              value="management"
              className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
            >
              Manage Plan
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
            >
              Manage Billing
            </TabsTrigger>
          </TabsList>

          {/* Plan Management Tab */}
          <TabsContent value="management" className="mt-6 space-y-8">
            {/* Current Plan Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Current plan</h2>

              {/* Plan Card */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Basic</h3>
                  <Button>Change Plan</Button>
                </div>

                <div
                  className="text-base font-medium cursor-pointer"
                  onClick={() => setFeaturesExpanded(!featuresExpanded)}
                >
                  Upgrade to Advanced plan will get
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 512 512"
                    className="inline-block ml-1"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: featuresExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"></path>
                  </svg>
                </div>

                {/* Features List */}
                {featuresExpanded && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                    {[
                      "Tracking",
                      "20000 Products usage",
                      "2 PayPal usage",
                      "5 supplier variants mapping",
                      "Advanced mapping",
                      "BOGO mapping",
                      "Bundle mapping",
                      "Automated Pricing Rule",
                      "Automatic Price Update",
                      "Inventory Management",
                      "5 staff account",
                      "Frequency of notification per 12 hours",
                      "Send product and shipping cost to Shopify",
                      "Affiliate",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 16 16"
                          className="text-green-600 mr-2 mt-0.5 flex-shrink-0"
                          height="20"
                          width="20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path>
                        </svg>
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Default Billing Method Section */}
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Default Billing Method</h2>
                <p className="text-sm text-muted-foreground">
                  To avoid store suspension, please set a default billing store. Click{" "}
                  <a
                    href="https://www.dshipit.com/terms-of-service/#SECTIONIVFEESTERMSOFPAYMENTREFUNDS"
                    className="text-primary hover:underline"
                  >
                    here
                  </a>{" "}
                  to learn DShipIt Plan Policy.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Select value={billingMethod} onValueChange={handleBillingMethodChange}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img
                          src={billingMethod === "stripe" ? "/stripe.png" : "/paypal.png"}
                          className="w-5 h-5"
                          alt=""
                        />
                        <span>{billingMethod === "stripe" ? "Stripe" : "PayPal"}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <img src="/stripe.png" className="w-5 h-5" alt="" />
                        <span>Stripe</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <img src="/paypal.png" className="w-5 h-5" alt="" />
                        <span>PayPal</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  disabled={billingActivated}
                  onClick={() => setBillingActivated(true)}
                  className="uppercase"
                >
                  {billingActivated ? "ACTIVATED" : "ACTIVATE"}
                </Button>
              </div>
            </div>

            {/* Store Management Accordion */}
            <Accordion type="single" collapsible defaultValue="store-management" className="border rounded-lg">
              <AccordionItem value="store-management" className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div>
                    <div className="text-base font-semibold text-left">Store management</div>
                    <div className="text-sm text-muted-foreground font-normal text-left mt-1">
                      If you decide to downgrade your plan, DShipIt will keep your deactivated stores here so you can
                      disconnect the unwanted stores and activate other stores according to your plan. Once
                      disconnected, you won't be able to add more stores than the restriction of different plans
                      allows.
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Active Stores */}
                    <div>
                      <h3 className="text-base font-semibold mb-3">Active Store</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 px-4 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <img
                              src="/images/ui/info-tooltip.png"
                              alt=""
                              className="w-6 h-6"
                            />
                            <span>spiderco</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md border border-green-200">
                              Connected
                            </span>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                              <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 24 24"
                                height="20"
                                width="20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inactive Stores */}
                    <div>
                      <h3 className="text-base font-semibold mb-3">Inactive Store</h3>
                      <p className="text-muted-foreground text-sm">no stores</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Stores Products Limit */}
            <div className="border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">Stores products limit</h2>
              <p className="text-sm text-muted-foreground">
                Product limit include stores product limit and suppliers product limit,{" "}
                <a
                  href="https://help.dshipit.com/product-limit/"
                  className="text-primary hover:underline"
                >
                  Click here
                </a>{" "}
                to learn more.
              </p>

              <div className="space-y-6 mt-6">
                {/* Store Products Limit */}
                <div className="space-y-3">
                  <h3 className="font-medium">Store products limit</h3>
                  <p className="text-sm text-muted-foreground">
                    The number of products that can be imported in My Products.
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">0/3000</span>
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto uppercase"
                      onClick={() => handleUpgradeClick(3000, 20000)}
                    >
                      UPGRADE
                    </Button>
                  </div>
                </div>

                {/* Supplier Products Limit */}
                <div className="space-y-3">
                  <h3 className="font-medium">Supplier products limit</h3>
                  <p className="text-sm text-muted-foreground">
                    Sum of the imported products in Import List and the number of products in My Products mapping.
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "0.23%" }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">7/3000</span>
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto uppercase"
                      onClick={() => handleUpgradeClick(3000, 20000)}
                    >
                      UPGRADE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Billing Management Tab */}
          <TabsContent value="billing" className="mt-6 space-y-8">
            {/* Business Information */}
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Business Information</h2>
                <p className="text-sm text-muted-foreground">Used on all statements</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base">{businessInfo.email}</p>
                </div>
                <Button
                  className="uppercase"
                  onClick={() => setBusinessInfoDialogOpen(true)}
                >
                  EDIT
                </Button>
              </div>
            </div>

            {/* Subscription Bills */}
            <div className="border rounded-lg overflow-hidden">
              <div className="p-6 space-y-2">
                <h2 className="text-xl font-semibold">Subscription Bills</h2>
                <p className="text-sm text-muted-foreground">
                  Statements for DShipIt subscription fees using PayPal or Stripe can be downloaded here. If you are
                  using Shopify or Wix subscription, contact the relevant platform to obtain Statements information.
                </p>
              </div>

              <div className="border-t py-4 text-center bg-background">
                <p className="text-muted-foreground" style={{ color: 'rgba(151, 151, 151, 0.5)' }}>No Data</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProductLimitUpgradeDialog
        isOpen={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        currentLimit={currentLimit}
        newLimit={newLimit}
      />

      {/* Business Information Edit Dialog */}
      <Dialog open={businessInfoDialogOpen} onOpenChange={setBusinessInfoDialogOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Business Information</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBusinessInfoSave();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  maxLength={50}
                  value={businessInfo.firstName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  maxLength={50}
                  value={businessInfo.lastName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="your company name, etc."
                  maxLength={50}
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="required">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country/region</Label>
                <Select
                  value={businessInfo.country}
                  onValueChange={(value) => setBusinessInfo({ ...businessInfo, country: value })}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Address"
                  maxLength={200}
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">Apartment, suite, etc.</Label>
                <Input
                  id="apartment"
                  placeholder="Apartment, suite, etc."
                  maxLength={200}
                  value={businessInfo.apartment}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, apartment: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  maxLength={50}
                  value={businessInfo.city}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder=""
                  maxLength={50}
                  value={businessInfo.state}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP code</Label>
                <Input
                  id="zipCode"
                  maxLength={50}
                  value={businessInfo.zipCode}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, zipCode: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="uppercase">
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
