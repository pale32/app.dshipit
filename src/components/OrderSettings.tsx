"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Plus, ChevronDown, X, Search, HelpCircle, CalendarIcon, RotateCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function OrderSettings() {
  // Mock connected stores - dynamically detected
  const connectedStores = [
    { id: 'store-1', name: 'spiderco', platform: 'eBay', icon: '/ebayicon.jfif', message: '' },
    { id: 'store-2', name: 'My Shopify Store', platform: 'Shopify', icon: '/shopify-icon.png', message: '' },
    { id: 'store-3', name: 'WooCommerce Shop', platform: 'WooCommerce', icon: '/woocommerce-icon.png', message: '' }
  ];

  // State management
  const [activeSupplierTab, setActiveSupplierTab] = useState("aliexpress");

  // Messages for each supplier platform
  const [defaultMessageAliExpress, setDefaultMessageAliExpress] = useState("");
  const [defaultMessageTemu, setDefaultMessageTemu] = useState("");
  const [defaultMessageAlibaba, setDefaultMessageAlibaba] = useState("");

  const [storeMessagesAliExpress, setStoreMessagesAliExpress] = useState<Record<string, string>>({
    'store-1': '',
    'store-2': '',
    'store-3': ''
  });
  const [storeMessagesTemu, setStoreMessagesTemu] = useState<Record<string, string>>({
    'store-1': '',
    'store-2': '',
    'store-3': ''
  });
  const [storeMessagesAlibaba, setStoreMessagesAlibaba] = useState<Record<string, string>>({
    'store-1': '',
    'store-2': '',
    'store-3': ''
  });
  const [canceledOptimization, setCanceledOptimization] = useState(false);
  const [iossExpanded, setIossExpanded] = useState(false);
  const [autoPlaceOrders, setAutoPlaceOrders] = useState(false);
  const [syncOrderNotes, setSyncOrderNotes] = useState(false);
  const [syncOrderNumbers, setSyncOrderNumbers] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [phoneNumberExpanded, setPhoneNumberExpanded] = useState(false);
  const [showMorePhones, setShowMorePhones] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [currentStoreId, setCurrentStoreId] = useState<string>("");
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Set default date range to one month from today
  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  };
  const [dateFrom, setDateFrom] = useState<Date>(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Function to show success notification
  const showSuccessMessage = () => {
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  // Phone number rows
  const [overridePhoneRows, setOverridePhoneRows] = useState<Array<{
    id: string;
    country: string;
    phone: string;
  }>>([{ id: '1', country: '', phone: '' }]);

  const [defaultPhoneRows, setDefaultPhoneRows] = useState<Array<{
    id: string;
    country: string;
    phone: string;
  }>>([
    { id: '1', country: 'Global', phone: '0000000' },
    { id: '2', country: 'United States', phone: '0000000000' },
    { id: '3', country: 'Brazil', phone: '00000000000' },
    { id: '4', country: 'France', phone: '000000001' },
    { id: '5', country: 'Czech Republic', phone: '000000000' },
    { id: '6', country: 'Germany', phone: '00000000001' },
    { id: '7', country: 'Denmark', phone: '00000000' },
    { id: '8', country: 'Estonia', phone: '00000000' },
    { id: '9', country: 'Spain', phone: '0000000001' },
    { id: '10', country: 'Guinea', phone: '000000000' },
    { id: '11', country: 'Guadeloupe', phone: '000000000' },
    { id: '12', country: 'Greece', phone: '0000000000' },
    { id: '13', country: 'Hong Kong, China', phone: '00000000' },
    { id: '14', country: 'Croatia (local name: Hrvatska)', phone: '000000000' },
    { id: '15', country: 'Hungary', phone: '000000000' },
    { id: '16', country: 'Indonesia', phone: '0000000000' },
    { id: '17', country: 'Ireland', phone: '000000000' },
    { id: '18', country: 'Israel', phone: '500000000' },
    { id: '19', country: 'India', phone: '0000000000' },
    { id: '20', country: 'Italy', phone: '0000000000' },
    { id: '21', country: 'Japan', phone: '00000000000' },
    { id: '22', country: 'Korea, South', phone: '00000000000' },
    { id: '23', country: 'Mexico', phone: '0000000000' },
    { id: '24', country: 'Netherlands', phone: '0000000000' },
    { id: '25', country: 'Norway', phone: '00000000' },
    { id: '26', country: 'Poland', phone: '000000000' },
    { id: '27', country: 'Portugal', phone: '000000000' },
    { id: '28', country: 'Romania', phone: '0000000000' },
    { id: '29', country: 'Russian Federation', phone: '00000000000' },
    { id: '30', country: 'Saudi Arabia', phone: '0000000000' },
    { id: '31', country: 'Singapore', phone: '00000000' },
    { id: '32', country: 'Sweden', phone: '000000000' },
    { id: '33', country: 'Switzerland', phone: '000000000' },
    { id: '34', country: 'Thailand', phone: '0000000000' },
    { id: '35', country: 'Turkey', phone: '00000000000' },
    { id: '36', country: 'Ukraine', phone: '000000000' },
    { id: '37', country: 'United Arab Emirates', phone: '000000000' },
    { id: '38', country: 'United Kingdom', phone: '00000000000' },
    { id: '39', country: 'Vietnam', phone: '0000000000' },
    { id: '40', country: 'Argentina', phone: '00000000000' },
    { id: '41', country: 'Australia', phone: '0000000000' },
    { id: '42', country: 'Austria', phone: '00000000000' },
    { id: '43', country: 'Belgium', phone: '0000000000' },
    { id: '44', country: 'Canada', phone: '0000000000' },
    { id: '45', country: 'Chile', phone: '000000000' },
    { id: '46', country: 'China', phone: '00000000000' },
    { id: '47', country: 'Colombia', phone: '0000000000' },
    { id: '48', country: 'Egypt', phone: '00000000000' },
    { id: '49', country: 'Finland', phone: '000000000' },
    { id: '50', country: 'Malaysia', phone: '0000000000' },
    { id: '51', country: 'New Zealand', phone: '000000000' },
    { id: '52', country: 'Philippines', phone: '00000000000' },
    { id: '53', country: 'South Africa', phone: '0000000000' },
    { id: '54', country: '', phone: '' }
  ]);


  const addOverridePhoneRow = () => {
    const newId = String(overridePhoneRows.length + 1);
    setOverridePhoneRows([...overridePhoneRows, { id: newId, country: '', phone: '' }]);
  };

  const deletePhoneRow = (id: string, isOverride: boolean) => {
    if (isOverride) {
      setOverridePhoneRows(overridePhoneRows.map(row =>
        row.id === id ? { ...row, phone: '00000000' } : row
      ));
    } else {
      setDefaultPhoneRows(defaultPhoneRows.map(row =>
        row.id === id ? { ...row, phone: '00000000' } : row
      ));
    }
  };

  return (
    <div className="relative">
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white border border-green-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
            <svg viewBox="64 64 896 896" fill="currentColor" className="w-5 h-5 text-green-500">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
            </svg>
            <span className="text-sm font-medium text-green-700">Successfully saved</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="px-6 pb-6">
        {/* Leave a message to Suppliers Section */}
        <Accordion type="single" collapsible defaultValue="message-suppliers" className="w-full border rounded-lg mb-6">
          <AccordionItem value="message-suppliers" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="text-left">
                <div className="text-xl font-bold">Leave a message to Suppliers</div>
                <div className="text-base text-muted-foreground font-normal mt-1">
                  Supplier orders will receive customized messages based on product Settings first. For products that do not have a custom message set, the order will receive a custom message set by the store.
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {/* Supplier Tabs */}
              <Tabs value={activeSupplierTab} onValueChange={setActiveSupplierTab} className="w-full">
                <TabsList className="inline-flex bg-transparent p-0 gap-2 border-0 mb-6">
                  <TabsTrigger
                    value="aliexpress"
                    className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
                  >
                    AliExpress
                  </TabsTrigger>
                  <TabsTrigger
                    value="temu"
                    className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
                  >
                    Temu
                  </TabsTrigger>
                  <TabsTrigger
                    value="alibaba"
                    className="rounded-[1.25rem] px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground border-0"
                  >
                    Alibaba
                  </TabsTrigger>
                </TabsList>

                {/* AliExpress Tab Content */}
                <TabsContent value="aliexpress" className="space-y-6">
                  {/* Default Message */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">Default Message</div>
                    <div className="text-base text-muted-foreground">
                      For stores without a message, the default message will be automatically applied. If a store already has a message set, the default message will not be applied; instead, the store will use its own set message.
                    </div>
                    <Textarea
                      rows={4}
                      placeholder="Please set your default message here."
                      value={defaultMessageAliExpress}
                      onChange={(e) => setDefaultMessageAliExpress(e.target.value)}
                      maxLength={1000}
                      className="resize-y"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{defaultMessageAliExpress.length} / 1000</div>
                      <Button
                        disabled={!defaultMessageAliExpress}
                        className="uppercase"
                        onClick={() => {
                          // Save default message logic here
                          showSuccessMessage();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Sales Channel */}
                  <div className="space-y-4 pt-4">
                    <div className="text-lg font-semibold">Sales Channel</div>
                    <div className="text-base text-muted-foreground">
                      Here you can set the messages of suppliers for different stores.
                    </div>

                    {/* Dynamically render store accordions */}
                    <Accordion type="single" collapsible defaultValue={connectedStores[0]?.id} className="w-full space-y-3">
                      {connectedStores.map((store) => (
                        <AccordionItem key={store.id} value={store.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <img
                                src={store.icon}
                                alt={store.name}
                                className="w-6 h-6"
                              />
                              <span className="font-medium">{store.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <button
                                onClick={() => {
                                  setCurrentStoreId(store.id);
                                  setIsProductSheetOpen(true);
                                }}
                                className="text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                Set custom message based on product
                              </button>
                              <Textarea
                                rows={4}
                                placeholder="You can write a message for your supplier here."
                                value={storeMessagesAliExpress[store.id] || ''}
                                onChange={(e) => setStoreMessagesAliExpress({
                                  ...storeMessagesAliExpress,
                                  [store.id]: e.target.value
                                })}
                                maxLength={1000}
                                className="resize-y"
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">{(storeMessagesAliExpress[store.id] || '').length} / 1000</div>
                                <Button
                                  disabled={!storeMessagesAliExpress[store.id]}
                                  className="uppercase"
                                  onClick={() => {
                                    // Save store message logic here
                                    showSuccessMessage();
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>

                {/* Temu Tab Content */}
                <TabsContent value="temu" className="space-y-6">
                  {/* Default Message */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">Default Message</div>
                    <div className="text-base text-muted-foreground">
                      For stores without a message, the default message will be automatically applied. If a store already has a message set, the default message will not be applied; instead, the store will use its own set message.
                    </div>
                    <Textarea
                      rows={4}
                      placeholder="Please set your default message here."
                      value={defaultMessageTemu}
                      onChange={(e) => setDefaultMessageTemu(e.target.value)}
                      maxLength={1000}
                      className="resize-y"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{defaultMessageTemu.length} / 1000</div>
                      <Button
                        disabled={!defaultMessageTemu}
                        className="uppercase"
                        onClick={() => {
                          // Save default message logic here
                          showSuccessMessage();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Sales Channel */}
                  <div className="space-y-4 pt-4">
                    <div className="text-lg font-semibold">Sales Channel</div>
                    <div className="text-base text-muted-foreground">
                      Here you can set the messages of suppliers for different stores.
                    </div>

                    {/* Dynamically render store accordions */}
                    <Accordion type="single" collapsible defaultValue={connectedStores[0]?.id} className="w-full space-y-3">
                      {connectedStores.map((store) => (
                        <AccordionItem key={store.id} value={store.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <img
                                src={store.icon}
                                alt={store.name}
                                className="w-6 h-6"
                              />
                              <span className="font-medium">{store.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <button
                                onClick={() => {
                                  setCurrentStoreId(store.id);
                                  setIsProductSheetOpen(true);
                                }}
                                className="text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                Set custom message based on product
                              </button>
                              <Textarea
                                rows={4}
                                placeholder="You can write a message for your supplier here."
                                value={storeMessagesTemu[store.id] || ''}
                                onChange={(e) => setStoreMessagesTemu({
                                  ...storeMessagesTemu,
                                  [store.id]: e.target.value
                                })}
                                maxLength={1000}
                                className="resize-y"
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">{(storeMessagesTemu[store.id] || '').length} / 1000</div>
                                <Button
                                  disabled={!storeMessagesTemu[store.id]}
                                  className="uppercase"
                                  onClick={() => {
                                    // Save store message logic here
                                    showSuccessMessage();
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>

                {/* Alibaba Tab Content */}
                <TabsContent value="alibaba" className="space-y-6">
                  {/* Default Message */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">Default Message</div>
                    <div className="text-base text-muted-foreground">
                      For stores without a message, the default message will be automatically applied. If a store already has a message set, the default message will not be applied; instead, the store will use its own set message.
                    </div>
                    <Textarea
                      rows={4}
                      placeholder="Please set your default message here."
                      value={defaultMessageAlibaba}
                      onChange={(e) => setDefaultMessageAlibaba(e.target.value)}
                      maxLength={1000}
                      className="resize-y"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{defaultMessageAlibaba.length} / 1000</div>
                      <Button
                        disabled={!defaultMessageAlibaba}
                        className="uppercase"
                        onClick={() => {
                          // Save default message logic here
                          showSuccessMessage();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Sales Channel */}
                  <div className="space-y-4 pt-4">
                    <div className="text-lg font-semibold">Sales Channel</div>
                    <div className="text-base text-muted-foreground">
                      Here you can set the messages of suppliers for different stores.
                    </div>

                    {/* Dynamically render store accordions */}
                    <Accordion type="single" collapsible defaultValue={connectedStores[0]?.id} className="w-full space-y-3">
                      {connectedStores.map((store) => (
                        <AccordionItem key={store.id} value={store.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <img
                                src={store.icon}
                                alt={store.name}
                                className="w-6 h-6"
                              />
                              <span className="font-medium">{store.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <button
                                onClick={() => {
                                  setCurrentStoreId(store.id);
                                  setIsProductSheetOpen(true);
                                }}
                                className="text-sm text-blue-600 hover:underline cursor-pointer"
                              >
                                Set custom message based on product
                              </button>
                              <Textarea
                                rows={4}
                                placeholder="You can write a message for your supplier here."
                                value={storeMessagesAlibaba[store.id] || ''}
                                onChange={(e) => setStoreMessagesAlibaba({
                                  ...storeMessagesAlibaba,
                                  [store.id]: e.target.value
                                })}
                                maxLength={1000}
                                className="resize-y"
                              />
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">{(storeMessagesAlibaba[store.id] || '').length} / 1000</div>
                                <Button
                                  disabled={!storeMessagesAlibaba[store.id]}
                                  className="uppercase"
                                  onClick={() => {
                                    // Save store message logic here
                                    showSuccessMessage();
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Phone Number Optimization Section */}
        <Accordion type="single" collapsible defaultValue="phone-optimization" className="w-full border rounded-lg mb-6">
          <AccordionItem value="phone-optimization" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="text-left">
                <div className="text-xl font-bold">Phone Number Optimization</div>
                <div className="text-base text-muted-foreground font-normal mt-1">
                  In order for your package to the Netherlands and Finland to be delivered properly, please fill in a real phone number in the order. The Netherlands and Finland do not support the use of the Phone Number Optimization feature for the time being. Click{" "}
                  <a
                    href="https://help.dshipit.com/fix-failed-orders-due-to-phone-number-regulations/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    here
                  </a>
                  {" "}to learn about how to solve this problem
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {/* Override phone number */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold">Override phone number</h3>
                <p className="text-base text-foreground">
                  Override customer's phone number with your own number when placing order on supplier. However, after editing and saving the Customer Detail of the order, this function will no longer be applicable to the order.
                </p>

                {/* Override phone rows */}
                <div className="space-y-3">
                  {overridePhoneRows.map((row, index) => {
                    const isLastRow = index === overridePhoneRows.length - 1;
                    return (
                      <div key={row.id} className="flex items-center gap-3">
                        <Select value={row.country} onValueChange={(value) => {
                          setOverridePhoneRows(overridePhoneRows.map(r =>
                            r.id === row.id ? { ...r, country: value } : r
                          ));
                        }}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Choose a country" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="Global">Global</SelectItem>
                            <SelectItem value="Aland Islands">Aland Islands</SelectItem>
                            <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                            <SelectItem value="Albania">Albania</SelectItem>
                            <SelectItem value="Alderney">Alderney</SelectItem>
                            <SelectItem value="Algeria">Algeria</SelectItem>
                            <SelectItem value="American Samoa">American Samoa</SelectItem>
                            <SelectItem value="Andorra">Andorra</SelectItem>
                            <SelectItem value="Angola">Angola</SelectItem>
                            <SelectItem value="Anguilla">Anguilla</SelectItem>
                            <SelectItem value="Antarctica">Antarctica</SelectItem>
                            <SelectItem value="Antigua and Barbuda">Antigua and Barbuda</SelectItem>
                            <SelectItem value="Argentina">Argentina</SelectItem>
                            <SelectItem value="Armenia">Armenia</SelectItem>
                            <SelectItem value="Aruba">Aruba</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Austria">Austria</SelectItem>
                            <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                            <SelectItem value="Bahamas">Bahamas</SelectItem>
                            <SelectItem value="Bahrain">Bahrain</SelectItem>
                            <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="Barbados">Barbados</SelectItem>
                            <SelectItem value="Belarus">Belarus</SelectItem>
                            <SelectItem value="Belgium">Belgium</SelectItem>
                            <SelectItem value="Belize">Belize</SelectItem>
                            <SelectItem value="Benin">Benin</SelectItem>
                            <SelectItem value="Bermuda">Bermuda</SelectItem>
                            <SelectItem value="Bhutan">Bhutan</SelectItem>
                            <SelectItem value="Bolivia">Bolivia</SelectItem>
                            <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                            <SelectItem value="Botswana">Botswana</SelectItem>
                            <SelectItem value="Brazil">Brazil</SelectItem>
                            <SelectItem value="British Indian Ocean Territory">British Indian Ocean Territory</SelectItem>
                            <SelectItem value="Brunei Darussalam">Brunei Darussalam</SelectItem>
                            <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                            <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                            <SelectItem value="Burundi">Burundi</SelectItem>
                            <SelectItem value="Cambodia">Cambodia</SelectItem>
                            <SelectItem value="Cameroon">Cameroon</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Cape Verde">Cape Verde</SelectItem>
                            <SelectItem value="Cayman Islands">Cayman Islands</SelectItem>
                            <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                            <SelectItem value="Chad">Chad</SelectItem>
                            <SelectItem value="Chile">Chile</SelectItem>
                            <SelectItem value="China">China</SelectItem>
                            <SelectItem value="Christmas Island">Christmas Island</SelectItem>
                            <SelectItem value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</SelectItem>
                            <SelectItem value="Colombia">Colombia</SelectItem>
                            <SelectItem value="Comoros">Comoros</SelectItem>
                            <SelectItem value="Congo">Congo</SelectItem>
                            <SelectItem value="Cook Islands">Cook Islands</SelectItem>
                            <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                            <SelectItem value="Croatia (local name: Hrvatska)">Croatia (local name: Hrvatska)</SelectItem>
                            <SelectItem value="Cuba">Cuba</SelectItem>
                            <SelectItem value="Cyprus">Cyprus</SelectItem>
                            <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                            <SelectItem value="Denmark">Denmark</SelectItem>
                            <SelectItem value="Djibouti">Djibouti</SelectItem>
                            <SelectItem value="Dominica">Dominica</SelectItem>
                            <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                            <SelectItem value="Ecuador">Ecuador</SelectItem>
                            <SelectItem value="Egypt">Egypt</SelectItem>
                            <SelectItem value="El Salvador">El Salvador</SelectItem>
                            <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                            <SelectItem value="Eritrea">Eritrea</SelectItem>
                            <SelectItem value="Estonia">Estonia</SelectItem>
                            <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                            <SelectItem value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</SelectItem>
                            <SelectItem value="Faroe Islands">Faroe Islands</SelectItem>
                            <SelectItem value="Fiji">Fiji</SelectItem>
                            <SelectItem value="Finland">Finland</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="French Guiana">French Guiana</SelectItem>
                            <SelectItem value="French Polynesia">French Polynesia</SelectItem>
                            <SelectItem value="Gabon">Gabon</SelectItem>
                            <SelectItem value="Gambia">Gambia</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Ghana">Ghana</SelectItem>
                            <SelectItem value="Gibraltar">Gibraltar</SelectItem>
                            <SelectItem value="Greece">Greece</SelectItem>
                            <SelectItem value="Greenland">Greenland</SelectItem>
                            <SelectItem value="Grenada">Grenada</SelectItem>
                            <SelectItem value="Guadeloupe">Guadeloupe</SelectItem>
                            <SelectItem value="Guam">Guam</SelectItem>
                            <SelectItem value="Guatemala">Guatemala</SelectItem>
                            <SelectItem value="Guernsey">Guernsey</SelectItem>
                            <SelectItem value="Guinea">Guinea</SelectItem>
                            <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                            <SelectItem value="Guyana">Guyana</SelectItem>
                            <SelectItem value="Haiti">Haiti</SelectItem>
                            <SelectItem value="Honduras">Honduras</SelectItem>
                            <SelectItem value="Hong Kong, China">Hong Kong, China</SelectItem>
                            <SelectItem value="Hungary">Hungary</SelectItem>
                            <SelectItem value="Iceland">Iceland</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                            <SelectItem value="Iran">Iran</SelectItem>
                            <SelectItem value="Iraq">Iraq</SelectItem>
                            <SelectItem value="Ireland">Ireland</SelectItem>
                            <SelectItem value="Isle of Man">Isle of Man</SelectItem>
                            <SelectItem value="Israel">Israel</SelectItem>
                            <SelectItem value="Italy">Italy</SelectItem>
                            <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                            <SelectItem value="Jamaica">Jamaica</SelectItem>
                            <SelectItem value="Japan">Japan</SelectItem>
                            <SelectItem value="Jersey">Jersey</SelectItem>
                            <SelectItem value="Jordan">Jordan</SelectItem>
                            <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="Kiribati">Kiribati</SelectItem>
                            <SelectItem value="Korea, North">Korea, North</SelectItem>
                            <SelectItem value="Korea, South">Korea, South</SelectItem>
                            <SelectItem value="Kosovo">Kosovo</SelectItem>
                            <SelectItem value="Kuwait">Kuwait</SelectItem>
                            <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                            <SelectItem value="Laos">Laos</SelectItem>
                            <SelectItem value="Latvia">Latvia</SelectItem>
                            <SelectItem value="Lebanon">Lebanon</SelectItem>
                            <SelectItem value="Lesotho">Lesotho</SelectItem>
                            <SelectItem value="Liberia">Liberia</SelectItem>
                            <SelectItem value="Libya">Libya</SelectItem>
                            <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                            <SelectItem value="Lithuania">Lithuania</SelectItem>
                            <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                            <SelectItem value="Macao, China">Macao, China</SelectItem>
                            <SelectItem value="Macedonia">Macedonia</SelectItem>
                            <SelectItem value="Madagascar">Madagascar</SelectItem>
                            <SelectItem value="Malawi">Malawi</SelectItem>
                            <SelectItem value="Malaysia">Malaysia</SelectItem>
                            <SelectItem value="Maldives">Maldives</SelectItem>
                            <SelectItem value="Mali">Mali</SelectItem>
                            <SelectItem value="Malta">Malta</SelectItem>
                            <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                            <SelectItem value="Martinique">Martinique</SelectItem>
                            <SelectItem value="Mauritania">Mauritania</SelectItem>
                            <SelectItem value="Mauritius">Mauritius</SelectItem>
                            <SelectItem value="Mayotte">Mayotte</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                            <SelectItem value="Micronesia">Micronesia</SelectItem>
                            <SelectItem value="Moldova">Moldova</SelectItem>
                            <SelectItem value="Monaco">Monaco</SelectItem>
                            <SelectItem value="Mongolia">Mongolia</SelectItem>
                            <SelectItem value="Montenegro">Montenegro</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                            <SelectItem value="Morocco">Morocco</SelectItem>
                            <SelectItem value="Mozambique">Mozambique</SelectItem>
                            <SelectItem value="Myanmar">Myanmar</SelectItem>
                            <SelectItem value="Namibia">Namibia</SelectItem>
                            <SelectItem value="Nauru">Nauru</SelectItem>
                            <SelectItem value="Nepal">Nepal</SelectItem>
                            <SelectItem value="Netherlands">Netherlands</SelectItem>
                            <SelectItem value="Netherlands Antilles">Netherlands Antilles</SelectItem>
                            <SelectItem value="New Caledonia">New Caledonia</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                            <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                            <SelectItem value="Niger">Niger</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Niue">Niue</SelectItem>
                            <SelectItem value="Norfolk Island">Norfolk Island</SelectItem>
                            <SelectItem value="Northern Mariana Islands">Northern Mariana Islands</SelectItem>
                            <SelectItem value="Norway">Norway</SelectItem>
                            <SelectItem value="Oman">Oman</SelectItem>
                            <SelectItem value="Pakistan">Pakistan</SelectItem>
                            <SelectItem value="Palau">Palau</SelectItem>
                            <SelectItem value="Palestine">Palestine</SelectItem>
                            <SelectItem value="Panama">Panama</SelectItem>
                            <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>
                            <SelectItem value="Paraguay">Paraguay</SelectItem>
                            <SelectItem value="Peru">Peru</SelectItem>
                            <SelectItem value="Philippines">Philippines</SelectItem>
                            <SelectItem value="Pitcairn">Pitcairn</SelectItem>
                            <SelectItem value="Poland">Poland</SelectItem>
                            <SelectItem value="Portugal">Portugal</SelectItem>
                            <SelectItem value="Puerto Rico">Puerto Rico</SelectItem>
                            <SelectItem value="Qatar">Qatar</SelectItem>
                            <SelectItem value="Reunion">Reunion</SelectItem>
                            <SelectItem value="Romania">Romania</SelectItem>
                            <SelectItem value="Russian Federation">Russian Federation</SelectItem>
                            <SelectItem value="Rwanda">Rwanda</SelectItem>
                            <SelectItem value="Saint Kitts and Nevis">Saint Kitts and Nevis</SelectItem>
                            <SelectItem value="Saint Lucia">Saint Lucia</SelectItem>
                            <SelectItem value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</SelectItem>
                            <SelectItem value="Samoa">Samoa</SelectItem>
                            <SelectItem value="San Marino">San Marino</SelectItem>
                            <SelectItem value="Sao Tome and Principe">Sao Tome and Principe</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="Senegal">Senegal</SelectItem>
                            <SelectItem value="Serbia">Serbia</SelectItem>
                            <SelectItem value="Seychelles">Seychelles</SelectItem>
                            <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="Slovakia">Slovakia</SelectItem>
                            <SelectItem value="Slovenia">Slovenia</SelectItem>
                            <SelectItem value="Solomon Islands">Solomon Islands</SelectItem>
                            <SelectItem value="Somalia">Somalia</SelectItem>
                            <SelectItem value="South Africa">South Africa</SelectItem>
                            <SelectItem value="South Sudan">South Sudan</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                            <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                            <SelectItem value="Sudan">Sudan</SelectItem>
                            <SelectItem value="Suriname">Suriname</SelectItem>
                            <SelectItem value="Swaziland">Swaziland</SelectItem>
                            <SelectItem value="Sweden">Sweden</SelectItem>
                            <SelectItem value="Switzerland">Switzerland</SelectItem>
                            <SelectItem value="Syria">Syria</SelectItem>
                            <SelectItem value="Taiwan, China">Taiwan, China</SelectItem>
                            <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                            <SelectItem value="Tanzania">Tanzania</SelectItem>
                            <SelectItem value="Thailand">Thailand</SelectItem>
                            <SelectItem value="Timor-Leste">Timor-Leste</SelectItem>
                            <SelectItem value="Togo">Togo</SelectItem>
                            <SelectItem value="Tokelau">Tokelau</SelectItem>
                            <SelectItem value="Tonga">Tonga</SelectItem>
                            <SelectItem value="Trinidad and Tobago">Trinidad and Tobago</SelectItem>
                            <SelectItem value="Tunisia">Tunisia</SelectItem>
                            <SelectItem value="Turkey">Turkey</SelectItem>
                            <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                            <SelectItem value="Turks and Caicos Islands">Turks and Caicos Islands</SelectItem>
                            <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                            <SelectItem value="Uganda">Uganda</SelectItem>
                            <SelectItem value="Ukraine">Ukraine</SelectItem>
                            <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Uruguay">Uruguay</SelectItem>
                            <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                            <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                            <SelectItem value="Vatican City">Vatican City</SelectItem>
                            <SelectItem value="Venezuela">Venezuela</SelectItem>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                            <SelectItem value="Virgin Islands, British">Virgin Islands, British</SelectItem>
                            <SelectItem value="Virgin Islands, U.S.">Virgin Islands, U.S.</SelectItem>
                            <SelectItem value="Wallis and Futuna">Wallis and Futuna</SelectItem>
                            <SelectItem value="Western Sahara">Western Sahara</SelectItem>
                            <SelectItem value="Yemen">Yemen</SelectItem>
                            <SelectItem value="Zambia">Zambia</SelectItem>
                            <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={row.phone}
                          onChange={(e) => {
                            setOverridePhoneRows(overridePhoneRows.map(r =>
                              r.id === row.id ? { ...r, phone: e.target.value } : r
                            ));
                          }}
                          placeholder=""
                          className="flex-1"
                        />
                        {isLastRow ? (
                          <button
                            onClick={addOverridePhoneRow}
                            className="text-gray-500 hover:text-black transition-colors p-2"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => deletePhoneRow(row.id, true)}
                            className="text-gray-500 hover:text-black transition-colors p-2"
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              className="w-5 h-5"
                            >
                              <path fill="none" d="M0 0h24v24H0z"></path>
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border my-6"></div>

              {/* Set default phone number */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Set default phone number</h3>
                <p className="text-base text-foreground">
                  If an order doesn't include a phone number, the system will use the default phone number you set to fill it in.
                </p>

                {/* Default phone rows */}
                <div className="space-y-3">
                  {defaultPhoneRows.slice(0, showMorePhones ? defaultPhoneRows.length : 5).map((row) => (
                    <div key={row.id} className="flex items-center gap-3">
                      <Select value={row.country} onValueChange={(value) => {
                        setDefaultPhoneRows(defaultPhoneRows.map(r =>
                          r.id === row.id ? { ...r, country: value } : r
                        ));
                      }}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder={row.country === '' ? 'Choose a country' : undefined} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="Global">Global</SelectItem>
                          <SelectItem value="Aland Islands">Aland Islands</SelectItem>
                          <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                          <SelectItem value="Albania">Albania</SelectItem>
                          <SelectItem value="Alderney">Alderney</SelectItem>
                          <SelectItem value="Algeria">Algeria</SelectItem>
                          <SelectItem value="American Samoa">American Samoa</SelectItem>
                          <SelectItem value="Andorra">Andorra</SelectItem>
                          <SelectItem value="Angola">Angola</SelectItem>
                          <SelectItem value="Anguilla">Anguilla</SelectItem>
                          <SelectItem value="Antarctica">Antarctica</SelectItem>
                          <SelectItem value="Antigua and Barbuda">Antigua and Barbuda</SelectItem>
                          <SelectItem value="Argentina">Argentina</SelectItem>
                          <SelectItem value="Armenia">Armenia</SelectItem>
                          <SelectItem value="Aruba">Aruba</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Austria">Austria</SelectItem>
                          <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                          <SelectItem value="Bahamas">Bahamas</SelectItem>
                          <SelectItem value="Bahrain">Bahrain</SelectItem>
                          <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="Barbados">Barbados</SelectItem>
                          <SelectItem value="Belarus">Belarus</SelectItem>
                          <SelectItem value="Belgium">Belgium</SelectItem>
                          <SelectItem value="Belize">Belize</SelectItem>
                          <SelectItem value="Benin">Benin</SelectItem>
                          <SelectItem value="Bermuda">Bermuda</SelectItem>
                          <SelectItem value="Bhutan">Bhutan</SelectItem>
                          <SelectItem value="Bolivia">Bolivia</SelectItem>
                          <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                          <SelectItem value="Botswana">Botswana</SelectItem>
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          <SelectItem value="British Indian Ocean Territory">British Indian Ocean Territory</SelectItem>
                          <SelectItem value="Brunei Darussalam">Brunei Darussalam</SelectItem>
                          <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                          <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                          <SelectItem value="Burundi">Burundi</SelectItem>
                          <SelectItem value="Cambodia">Cambodia</SelectItem>
                          <SelectItem value="Cameroon">Cameroon</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Cape Verde">Cape Verde</SelectItem>
                          <SelectItem value="Cayman Islands">Cayman Islands</SelectItem>
                          <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                          <SelectItem value="Chad">Chad</SelectItem>
                          <SelectItem value="Chile">Chile</SelectItem>
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="Christmas Island">Christmas Island</SelectItem>
                          <SelectItem value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</SelectItem>
                          <SelectItem value="Colombia">Colombia</SelectItem>
                          <SelectItem value="Comoros">Comoros</SelectItem>
                          <SelectItem value="Congo">Congo</SelectItem>
                          <SelectItem value="Cook Islands">Cook Islands</SelectItem>
                          <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                          <SelectItem value="Croatia (local name: Hrvatska)">Croatia (local name: Hrvatska)</SelectItem>
                          <SelectItem value="Cuba">Cuba</SelectItem>
                          <SelectItem value="Cyprus">Cyprus</SelectItem>
                          <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                          <SelectItem value="Denmark">Denmark</SelectItem>
                          <SelectItem value="Djibouti">Djibouti</SelectItem>
                          <SelectItem value="Dominica">Dominica</SelectItem>
                          <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                          <SelectItem value="Ecuador">Ecuador</SelectItem>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="El Salvador">El Salvador</SelectItem>
                          <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                          <SelectItem value="Eritrea">Eritrea</SelectItem>
                          <SelectItem value="Estonia">Estonia</SelectItem>
                          <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</SelectItem>
                          <SelectItem value="Faroe Islands">Faroe Islands</SelectItem>
                          <SelectItem value="Fiji">Fiji</SelectItem>
                          <SelectItem value="Finland">Finland</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="French Guiana">French Guiana</SelectItem>
                          <SelectItem value="French Polynesia">French Polynesia</SelectItem>
                          <SelectItem value="Gabon">Gabon</SelectItem>
                          <SelectItem value="Gambia">Gambia</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Gibraltar">Gibraltar</SelectItem>
                          <SelectItem value="Greece">Greece</SelectItem>
                          <SelectItem value="Greenland">Greenland</SelectItem>
                          <SelectItem value="Grenada">Grenada</SelectItem>
                          <SelectItem value="Guadeloupe">Guadeloupe</SelectItem>
                          <SelectItem value="Guam">Guam</SelectItem>
                          <SelectItem value="Guatemala">Guatemala</SelectItem>
                          <SelectItem value="Guernsey">Guernsey</SelectItem>
                          <SelectItem value="Guinea">Guinea</SelectItem>
                          <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                          <SelectItem value="Guyana">Guyana</SelectItem>
                          <SelectItem value="Haiti">Haiti</SelectItem>
                          <SelectItem value="Honduras">Honduras</SelectItem>
                          <SelectItem value="Hong Kong, China">Hong Kong, China</SelectItem>
                          <SelectItem value="Hungary">Hungary</SelectItem>
                          <SelectItem value="Iceland">Iceland</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Iran">Iran</SelectItem>
                          <SelectItem value="Iraq">Iraq</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Isle of Man">Isle of Man</SelectItem>
                          <SelectItem value="Israel">Israel</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                          <SelectItem value="Jamaica">Jamaica</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="Jersey">Jersey</SelectItem>
                          <SelectItem value="Jordan">Jordan</SelectItem>
                          <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Kiribati">Kiribati</SelectItem>
                          <SelectItem value="Korea, North">Korea, North</SelectItem>
                          <SelectItem value="Korea, South">Korea, South</SelectItem>
                          <SelectItem value="Kosovo">Kosovo</SelectItem>
                          <SelectItem value="Kuwait">Kuwait</SelectItem>
                          <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                          <SelectItem value="Laos">Laos</SelectItem>
                          <SelectItem value="Latvia">Latvia</SelectItem>
                          <SelectItem value="Lebanon">Lebanon</SelectItem>
                          <SelectItem value="Lesotho">Lesotho</SelectItem>
                          <SelectItem value="Liberia">Liberia</SelectItem>
                          <SelectItem value="Libya">Libya</SelectItem>
                          <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                          <SelectItem value="Lithuania">Lithuania</SelectItem>
                          <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                          <SelectItem value="Macao, China">Macao, China</SelectItem>
                          <SelectItem value="Macedonia">Macedonia</SelectItem>
                          <SelectItem value="Madagascar">Madagascar</SelectItem>
                          <SelectItem value="Malawi">Malawi</SelectItem>
                          <SelectItem value="Malaysia">Malaysia</SelectItem>
                          <SelectItem value="Maldives">Maldives</SelectItem>
                          <SelectItem value="Mali">Mali</SelectItem>
                          <SelectItem value="Malta">Malta</SelectItem>
                          <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                          <SelectItem value="Martinique">Martinique</SelectItem>
                          <SelectItem value="Mauritania">Mauritania</SelectItem>
                          <SelectItem value="Mauritius">Mauritius</SelectItem>
                          <SelectItem value="Mayotte">Mayotte</SelectItem>
                          <SelectItem value="Mexico">Mexico</SelectItem>
                          <SelectItem value="Micronesia">Micronesia</SelectItem>
                          <SelectItem value="Moldova">Moldova</SelectItem>
                          <SelectItem value="Monaco">Monaco</SelectItem>
                          <SelectItem value="Mongolia">Mongolia</SelectItem>
                          <SelectItem value="Montenegro">Montenegro</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Morocco">Morocco</SelectItem>
                          <SelectItem value="Mozambique">Mozambique</SelectItem>
                          <SelectItem value="Myanmar">Myanmar</SelectItem>
                          <SelectItem value="Namibia">Namibia</SelectItem>
                          <SelectItem value="Nauru">Nauru</SelectItem>
                          <SelectItem value="Nepal">Nepal</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="Netherlands Antilles">Netherlands Antilles</SelectItem>
                          <SelectItem value="New Caledonia">New Caledonia</SelectItem>
                          <SelectItem value="New Zealand">New Zealand</SelectItem>
                          <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                          <SelectItem value="Niger">Niger</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Niue">Niue</SelectItem>
                          <SelectItem value="Norfolk Island">Norfolk Island</SelectItem>
                          <SelectItem value="Northern Mariana Islands">Northern Mariana Islands</SelectItem>
                          <SelectItem value="Norway">Norway</SelectItem>
                          <SelectItem value="Oman">Oman</SelectItem>
                          <SelectItem value="Pakistan">Pakistan</SelectItem>
                          <SelectItem value="Palau">Palau</SelectItem>
                          <SelectItem value="Palestine">Palestine</SelectItem>
                          <SelectItem value="Panama">Panama</SelectItem>
                          <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>
                          <SelectItem value="Paraguay">Paraguay</SelectItem>
                          <SelectItem value="Peru">Peru</SelectItem>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="Pitcairn">Pitcairn</SelectItem>
                          <SelectItem value="Poland">Poland</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Puerto Rico">Puerto Rico</SelectItem>
                          <SelectItem value="Qatar">Qatar</SelectItem>
                          <SelectItem value="Reunion">Reunion</SelectItem>
                          <SelectItem value="Romania">Romania</SelectItem>
                          <SelectItem value="Russian Federation">Russian Federation</SelectItem>
                          <SelectItem value="Rwanda">Rwanda</SelectItem>
                          <SelectItem value="Saint Kitts and Nevis">Saint Kitts and Nevis</SelectItem>
                          <SelectItem value="Saint Lucia">Saint Lucia</SelectItem>
                          <SelectItem value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</SelectItem>
                          <SelectItem value="Samoa">Samoa</SelectItem>
                          <SelectItem value="San Marino">San Marino</SelectItem>
                          <SelectItem value="Sao Tome and Principe">Sao Tome and Principe</SelectItem>
                          <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="Senegal">Senegal</SelectItem>
                          <SelectItem value="Serbia">Serbia</SelectItem>
                          <SelectItem value="Seychelles">Seychelles</SelectItem>
                          <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Slovakia">Slovakia</SelectItem>
                          <SelectItem value="Slovenia">Slovenia</SelectItem>
                          <SelectItem value="Solomon Islands">Solomon Islands</SelectItem>
                          <SelectItem value="Somalia">Somalia</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="South Sudan">South Sudan</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                          <SelectItem value="Sudan">Sudan</SelectItem>
                          <SelectItem value="Suriname">Suriname</SelectItem>
                          <SelectItem value="Swaziland">Swaziland</SelectItem>
                          <SelectItem value="Sweden">Sweden</SelectItem>
                          <SelectItem value="Switzerland">Switzerland</SelectItem>
                          <SelectItem value="Syria">Syria</SelectItem>
                          <SelectItem value="Taiwan, China">Taiwan, China</SelectItem>
                          <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                          <SelectItem value="Thailand">Thailand</SelectItem>
                          <SelectItem value="Timor-Leste">Timor-Leste</SelectItem>
                          <SelectItem value="Togo">Togo</SelectItem>
                          <SelectItem value="Tokelau">Tokelau</SelectItem>
                          <SelectItem value="Tonga">Tonga</SelectItem>
                          <SelectItem value="Trinidad and Tobago">Trinidad and Tobago</SelectItem>
                          <SelectItem value="Tunisia">Tunisia</SelectItem>
                          <SelectItem value="Turkey">Turkey</SelectItem>
                          <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                          <SelectItem value="Turks and Caicos Islands">Turks and Caicos Islands</SelectItem>
                          <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Ukraine">Ukraine</SelectItem>
                          <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Uruguay">Uruguay</SelectItem>
                          <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                          <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                          <SelectItem value="Vatican City">Vatican City</SelectItem>
                          <SelectItem value="Venezuela">Venezuela</SelectItem>
                          <SelectItem value="Vietnam">Vietnam</SelectItem>
                          <SelectItem value="Virgin Islands, British">Virgin Islands, British</SelectItem>
                          <SelectItem value="Virgin Islands, U.S.">Virgin Islands, U.S.</SelectItem>
                          <SelectItem value="Wallis and Futuna">Wallis and Futuna</SelectItem>
                          <SelectItem value="Western Sahara">Western Sahara</SelectItem>
                          <SelectItem value="Yemen">Yemen</SelectItem>
                          <SelectItem value="Zambia">Zambia</SelectItem>
                          <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={row.phone}
                        onChange={(e) => {
                          setDefaultPhoneRows(defaultPhoneRows.map(r =>
                            r.id === row.id ? { ...r, phone: e.target.value } : r
                          ));
                        }}
                        placeholder=""
                        className="flex-1"
                      />
                      <button
                        onClick={() => deletePhoneRow(row.id, false)}
                        className="text-gray-500 hover:text-black transition-colors p-2"
                      >
                        <svg
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {defaultPhoneRows.length > 5 && (
                  <button
                    onClick={() => setShowMorePhones(!showMorePhones)}
                    className="flex items-center justify-center gap-2 text-base hover:underline w-full"
                  >
                    {showMorePhones ? 'Show Less' : 'Show More'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMorePhones ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Canceled Orders Optimization */}
        <div className="border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Canceled Orders Optimization</h3>
              <p className="text-base text-foreground mb-4">
                Activate this feature to automatically optimize an order cancelled by supplier. The optimization by DShipIt will greatly reduce the probability for the order to be cancelled again.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-base">Applicable Platform:</span>
                <img src="/aliexpressproductsettingsIcon.png" alt="AliExpress" className="w-6 h-6" />
                <img src="/temuProductSettingsIcon.jfif" alt="Temu" className="w-6 h-6" />
              </div>
            </div>
            <Switch
              checked={canceledOptimization}
              onCheckedChange={(checked) => {
                setCanceledOptimization(checked);
                showSuccessMessage();
              }}
              className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
            />
          </div>
        </div>

        {/* TAX Section */}
        <div className="mb-6">
          <div className="text-xl font-bold mb-4">TAX</div>
          <div className="border rounded-lg p-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ioss" className="border-b-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">IOSS</h3>
                    <p className="text-base text-foreground mt-1">
                      If you want to pay VAT yourself instead of paying through AliExpress, you need to add an IOSS ID to the buyer information of your AliExpress orders shipped to the EU.{" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center cursor-pointer">
                              <HelpCircle className="w-4 h-4 mx-1" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>
                              Your AliExpress account needs to be verified as a Business Buyer to add a VAT tax number on AliExpress and declare and pay VAT yourself. The IOSS ID you set here will be automatically added to "Address 2" of your AliExpress orders when placing them. Note that any changes to the IOSS ID will only apply to new orders placed after the modification.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      Click{" "}
                      <a
                        href="https://www.dshipit.com/blog/eu-vat-reform/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        here
                      </a>
                      {" "}to get more information.
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Input
                    placeholder=""
                    className="h-[54px]"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Automatically Place Orders With Suppliers */}
        <div className="border rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-4 border-b">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Automatically Place Orders With Suppliers</h3>
                <p className="text-base text-foreground">
                  After activating this feature, DShipIt will automatically place orders to the Agent without manual operation. The orders will be automatically transferred to Awaiting payment or Awaiting shipment. Please check in time.{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center cursor-pointer">
                          <HelpCircle className="w-4 h-4 mx-1" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="w-64">
                        <p>
                          For orders that fail to be placed automatically, please place the orders manually after the failed orders has been modified.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-base">Applicable Platform:</span>
                  <img src="/temuProductSettingsIcon.jfif" alt="Temu" className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <img src="/temuProductSettingsIcon.jfif" alt="Alibaba" className="w-6 h-6" />
                <span className="text-base">Alibaba <span className="text-muted-foreground">()</span></span>
              </div>
              <Switch
                checked={autoPlaceOrders}
                onCheckedChange={(checked) => {
                  setAutoPlaceOrders(checked);
                  showSuccessMessage();
                }}
                className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
              />
            </div>
          </div>
        </div>

        {/* Synchronize store orders */}
        <div className="mb-6">
          <div className="text-xl font-bold mb-2">Synchronize store orders</div>
          <div className="text-base text-muted-foreground mb-4">
            DShipIt can help you synchronize store orders of the last 30 days by default.{" "}
            <a
              href="https://help.dshipit.com/synchronize-store-order-notes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Click here
            </a>
            {" "}to learn more
          </div>
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[278px]">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {connectedStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      <div className="flex items-center gap-2">
                        <img src={store.icon} alt={store.name} className="w-4 h-4" />
                        <span>{store.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-accent transition-colors">
                    <span className="text-sm">
                      {dateFrom ? format(dateFrom, "yyyy / MM / dd") : "Start date"}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">
                      {dateTo ? format(dateTo, "yyyy / MM / dd") : "End date"}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-muted-foreground ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex divide-x">
                    <div className="p-3">
                      <div className="text-sm font-medium mb-2 px-3">From</div>
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => date && setDateFrom(date)}
                        initialFocus
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium mb-2 px-3">To</div>
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => date && setDateTo(date)}
                        disabled={(date) => dateFrom ? date < dateFrom : false}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {(!selectedStore || !dateFrom || !dateTo) ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        disabled
                        className="text-gray-500 transition-colors p-2 opacity-50 cursor-not-allowed"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {!selectedStore
                          ? "Select a store"
                          : !dateFrom || !dateTo
                          ? "Select date range"
                          : ""}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <button
                  onClick={() => {
                    setIsSyncing(true);
                    // Simulate sync operation
                    setTimeout(() => setIsSyncing(false), 2000);
                  }}
                  disabled={isSyncing}
                  className="text-gray-500 hover:text-black transition-colors p-2 disabled:opacity-50"
                >
                  <RotateCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Synchronize store order notes */}
        <div className="border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Synchronize store order notes</h3>
              <p className="text-base text-foreground mb-4">
                Activate this feature to automatically synchronize store order notes. DShipIt will help to send the notes of an order from store to supplier along with orders.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-base">Applicable Platform:</span>
                <img src="/ebayicon.jfif" alt="eBay" className="w-6 h-6" />
              </div>
            </div>
            <Switch
              checked={syncOrderNotes}
              onCheckedChange={(checked) => {
                setSyncOrderNotes(checked);
                showSuccessMessage();
              }}
              className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
            />
          </div>
        </div>

        {/* Order Details Synchronization */}
        <Accordion type="single" collapsible defaultValue="order-details-sync" className="w-full border rounded-lg mb-6">
          <AccordionItem value="order-details-sync" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="text-left">
                <div className="text-xl font-bold">Order Details Synchronization</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="border-t pt-4">
                <div className="flex items-start justify-between pb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Sync order numbers to store</h3>
                    <p className="text-base text-foreground mb-4">
                      If this setting is on, your order numbers will be automatically synced to your store order detail page.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-base">Applicable Platform:</span>
                      <img src="/aliexpressproductsettingsIcon.png" alt="AliExpress" className="w-6 h-6" />
                      <img src="/woocommerce-icon.png" alt="WooCommerce" className="w-6 h-6" />
                      <img src="/ebayicon.jfif" alt="eBay" className="w-6 h-6" />
                    </div>
                  </div>
                  <Switch
                    checked={syncOrderNumbers}
                    onCheckedChange={(checked) => {
                      setSyncOrderNumbers(checked);
                      showSuccessMessage();
                    }}
                    className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Product Selection Sheet */}
      <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
        <SheetContent className="w-[868px] max-w-[868px] sm:max-w-[868px] p-0 [&>button]:hidden">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <SheetTitle className="text-xl font-semibold">
                  Set Custom Messages by Product
                </SheetTitle>
                <button
                  onClick={() => setIsProductSheetOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Input
                  placeholder="Search by keywords of product title"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="h-12 pr-14"
                />
                <Button
                  variant="default"
                  size="default"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-4"
                >
                  <Search style={{ width: '24px', height: '24px' }} />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 px-6 py-4 overflow-y-auto">
            </div>

            <SheetFooter className="px-6 py-4 border-t">
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  className="uppercase"
                  onClick={() => setIsProductSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="uppercase"
                  onClick={() => {
                    setIsProductSheetOpen(false);
                    // Save logic here
                  }}
                >
                  Save
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
