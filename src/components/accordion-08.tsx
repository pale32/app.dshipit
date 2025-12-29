"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, FileText, ShoppingCart, Folder, Search, Book } from "lucide-react";

const _items = [
  {
    title: "Is it accessible?",
    content: "Yes. It adheres to the WAI-ARIA design pattern.",
  },
  {
    title: "Is it styled?",
    content: "Yes. It comes with default styles that matches the other components' aesthetic.",
  },
  {
    title: "Is it animated?",
    content: "Yes. It's animated by default, but you can disable it if you prefer.",
  },
];

export default function AccordionMultipleOpenDemo() {
  return (
    <Accordion defaultValue={["dropshipping-guide"]} type="multiple" className="my-4 w-full">
      <AccordionItem value="dropshipping-guide" className="mt-6 border-none">
        <AccordionTrigger className="from-muted to-muted/70 rounded-lg bg-gradient-to-r px-4 py-4 hover:no-underline sm:px-6 sm:py-5">
          <div className="text-left">
            <div className="text-foreground text-lg font-bold sm:text-xl">Dropshipping Guide</div>
            <div className="text-muted-foreground mt-1 text-sm leading-relaxed font-normal sm:text-base">
              We will show you the most suitable content according to your selection
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-4">
          <div className="space-y-4">
            {/* Accordion Items */}
            <div className="space-y-3">
              <div className="bg-destructive/10 rounded-lg p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-start gap-3 sm:items-center sm:gap-5">
                    <div className="flex-shrink-0">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-destructive sm:h-14 sm:w-14"
                      >
                        <circle cx="12" cy="12" r="10" fill="currentColor" />
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground mb-1 text-sm font-semibold sm:text-base">
                        Start fast — install the plugin first
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                        Easily import and sync Supplier products to your DShipIt account — place
                        orders, make payments, sync order info, and automatically grab coupons.
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 sm:ml-5">
                    <Button variant="destructive" className="w-full px-4 py-2 text-sm sm:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      INSTALL
                    </Button>
                  </div>
                </div>
              </div>
              <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-3">
                <AccordionItem
                  value="item-1"
                  className="rounded-lg border-none bg-blue-50 dark:bg-blue-950/20"
                >
                  <AccordionTrigger className="rounded-t-lg px-4 py-3 text-left hover:no-underline sm:px-5 sm:py-4 [&[data-state=closed]]:rounded-lg">
                    <div className="flex items-start gap-3 sm:items-center sm:gap-5">
                      <div className="flex-shrink-0">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-blue-600 sm:h-14 sm:w-14"
                        >
                          <path
                            d="M9 21H15M12 3C8.5 3 6 5.5 6 9C6 11 7 12.5 8 13.5C8.5 14 9 14.5 9 15V16C9 16.5 9.5 17 10 17H14C14.5 17 15 16.5 15 16V15C15 14.5 15.5 14 16 13.5C17 12.5 18 11 18 9C18 5.5 15.5 3 12 3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 17V18C9 18.5 9.5 19 10 19H14C14.5 19 15 18.5 15 18V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="9" r="2" fill="currentColor" opacity="0.3" />
                          <path
                            d="M10.5 7L13.5 11"
                            stroke="currentColor"
                            strokeWidth="1"
                            opacity="0.6"
                          />
                          <path
                            d="M13.5 7L10.5 11"
                            stroke="currentColor"
                            strokeWidth="1"
                            opacity="0.6"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-foreground text-sm font-semibold sm:text-base">
                          I am new and don&apos;t have products & orders
                        </div>
                        <div className="text-muted-foreground text-xs leading-relaxed font-normal sm:text-sm">
                          I&apos;m new and I don&apos;t know how to use DShipIt to start my dropshipping
                          business.
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="rounded-b-lg bg-blue-50 px-4 pb-4 sm:px-5 dark:bg-blue-950/20">
                    <div className="ml-12 space-y-2 sm:ml-20">
                      <div className="flex items-center gap-2">
                        <FileText className="text-foreground h-4 w-4" />
                        <a href="#" className="text-foreground text-sm font-medium hover:underline">
                          What Is Dropshipping?
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="text-foreground h-4 w-4" />
                        <a href="#" className="text-foreground text-sm font-medium hover:underline">
                          How To Start a Dropshipping Store with DShipIt?
                        </a>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <Folder className="text-foreground h-4 w-4 flex-shrink-0" />
                          <a
                            href="#"
                            className="text-foreground text-xs font-medium hover:underline sm:text-sm"
                          >
                            How to import products in Find Supplier?
                          </a>
                        </div>
                        <Button className="w-full bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
                          Go To Import List
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <Folder className="text-foreground h-4 w-4 flex-shrink-0" />
                          <a
                            href="#"
                            className="text-foreground text-xs font-medium hover:underline sm:text-sm"
                          >
                            How to send products to Shopify after Importing them?
                          </a>
                        </div>
                        <Button className="w-full bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
                          Go To Import List
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="rounded-lg border-none bg-green-50 dark:bg-green-950/20"
                >
                  <AccordionTrigger className="rounded-t-lg px-4 py-3 text-left hover:no-underline sm:px-5 sm:py-4 [&[data-state=closed]]:rounded-lg">
                    <div className="flex items-start gap-3 sm:items-center sm:gap-5">
                      <div className="flex-shrink-0">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-600 sm:h-14 sm:w-14"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M12 6V12L16 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="12" r="1" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-foreground text-sm font-semibold sm:text-base">
                          I have products, but no orders
                        </div>
                        <div className="text-muted-foreground text-xs leading-relaxed font-normal sm:text-sm">
                          I already have items on Shopify, but I don&apos;t know how to start my business
                          on DShipIt.
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="rounded-b-lg bg-green-50 px-4 pb-4 sm:px-5 dark:bg-green-950/20">
                    <div className="ml-12 space-y-2 sm:ml-20">
                      <div className="flex items-center gap-2">
                        <FileText className="text-foreground h-4 w-4" />
                        <a href="#" className="text-foreground text-sm font-medium hover:underline">
                          Ultimate Guide to 15 Evergreen Products to Dropship in 2024
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="text-foreground h-4 w-4" />
                        <a href="#" className="text-foreground text-sm font-medium hover:underline">
                          Top 10 Trending Dropshipping Products for 2024
                        </a>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <Book className="text-foreground h-4 w-4 flex-shrink-0" />
                          <a
                            href="#"
                            className="text-foreground text-xs font-medium hover:underline sm:text-sm"
                          >
                            How to import items from Shopify to DShipIt?
                          </a>
                        </div>
                        <Button className="w-full bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
                          Go To My Products
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <Book className="text-foreground h-4 w-4 flex-shrink-0" />
                          <a
                            href="#"
                            className="text-foreground text-xs font-medium hover:underline sm:text-sm"
                          >
                            How to find the right supplier for a product?
                          </a>
                        </div>
                        <Button className="w-full bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
                          Go To My Products
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="rounded-lg border-none bg-purple-50 dark:bg-purple-950/20"
                >
                  <AccordionTrigger className="rounded-t-lg px-4 py-3 text-left hover:no-underline sm:px-5 sm:py-4 [&[data-state=closed]]:rounded-lg">
                    <div className="flex items-start gap-3 sm:items-center sm:gap-5">
                      <div className="flex-shrink-0">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-purple-600 sm:h-14 sm:w-14"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="20"
                            height="14"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M8 21H16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 17V21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <rect
                            x="5"
                            y="6"
                            width="14"
                            height="8"
                            rx="1"
                            fill="currentColor"
                            opacity="0.1"
                          />
                          <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
                          <path d="M9 8H15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                          <path d="M9 12H13" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-foreground text-sm font-semibold sm:text-base">
                          I have products and have orders
                        </div>
                        <div className="text-muted-foreground text-xs leading-relaxed font-normal sm:text-sm">
                          I have used solutions like other platforms, but I need to know how to use the main
                          features of DShipIt.
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="rounded-b-lg bg-purple-50 px-4 pb-4 sm:px-5 dark:bg-purple-950/20">
                    <div className="ml-12 space-y-2 sm:ml-20">
                      <div className="flex items-center gap-2">
                        <FileText className="text-foreground h-4 w-4" />
                        <a href="#" className="text-foreground text-sm font-medium hover:underline">
                          How to Set a Proper and Lucrative Dropshipping Profit Margin?
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="text-foreground h-4 w-4" />
                        <a href="#" className="text-foreground text-sm font-medium hover:underline">
                          A Step-by-Step Guide to Deal with Your First Dropshipping Order
                        </a>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <Book className="text-foreground h-4 w-4 flex-shrink-0" />
                          <a
                            href="#"
                            className="text-foreground text-xs font-medium hover:underline sm:text-sm"
                          >
                            How to place an order on DShipIt?
                          </a>
                        </div>
                        <Button className="w-full bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
                          Go To Open Orders
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <Book className="text-foreground h-4 w-4 flex-shrink-0" />
                          <a
                            href="#"
                            className="text-foreground text-xs font-medium hover:underline sm:text-sm"
                          >
                            How to set up the shipping template?
                          </a>
                        </div>
                        <Button className="w-full bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
                          Go To Settings
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
