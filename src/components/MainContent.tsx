"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import AccordionMultipleOpenDemo from "@/components/accordion-08";

export default function MainContent() {
  const [activeHomeTab, setActiveHomeTab] = useState("guide");

  return (
    <div className="flex h-full w-full justify-center px-8 py-0">
      <div className="w-full max-w-[1156px]">
        {/* Main heading - centered with optimal UI spacing */}
        <div className="mb-1 w-full pt-6 text-center">
          <h1 className="text-foreground mb-0.5 text-2xl font-bold sm:mb-1 sm:text-3xl md:text-4xl">
            Welcome to DShipIt
          </h1>
          <p className="text-sm font-normal text-muted-foreground sm:text-lg md:text-xl">
            Empowering Sellers Worldwide
          </p>
        </div>

        {/* Modern Horizontal Tabs - Left aligned within container */}
        <div className="mb-2 flex w-full justify-start">
          <Tabs value={activeHomeTab} onValueChange={setActiveHomeTab} className="w-full">
            <TabsList className="h-10 bg-transparent gap-2.5 p-0">
              <TabsTrigger
                value="guide"
                className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
              >
                Guide
              </TabsTrigger>
              <TabsTrigger
                value="partner"
                className="text-base font-medium px-6 tracking-[0.02em] bg-gray-100 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-[12.5rem]"
              >
                Partner
              </TabsTrigger>
            </TabsList>

            {/* Content within 1350px container */}
            <TabsContent value="guide" className="mt-4 bg-transparent">
              {/* Account Setup Bar - Full Width */}
              <div className="bg-card mb-6 flex min-h-[50px] w-full flex-col gap-3 rounded-lg border px-4 py-3 sm:h-[50px] sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-8 sm:py-5">
                {/* Left side - Icon and Text */}
                <div className="flex items-center sm:pl-4">
                  <User className="text-primary mr-3 h-5 w-5 flex-shrink-0 sm:mr-6 sm:h-6 sm:w-6" />
                  <h3 className="text-sm font-normal sm:text-base">Setup your DShipIt Account</h3>
                </div>

                {/* Right side - Links */}
                <div className="flex items-center space-x-4 sm:space-x-8 sm:pr-4">
                  <a
                    href="#"
                    className="text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 sm:text-base"
                  >
                    TUTORIAL
                  </a>
                  <a
                    href="#"
                    className="text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 sm:text-base"
                  >
                    HELP CENTER
                  </a>
                </div>
              </div>

              {/* Accordion Section */}
              <div className="mb-6">
                <AccordionMultipleOpenDemo />
              </div>
            </TabsContent>

            <TabsContent value="partner" className="mt-6 bg-transparent">
              {/* Partner content placeholder */}
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Partner content will go here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
