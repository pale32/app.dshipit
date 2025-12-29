"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AutomatedMapping() {
  // Automated Mapping state
  const [mappingFirstProductDefault, setMappingFirstProductDefault] = useState(true);
  const [mappingAutoMatch, setMappingAutoMatch] = useState(true);
  const [mappingOptionValueAuto, setMappingOptionValueAuto] = useState(false);
  const [mappingFormRows, setMappingFormRows] = useState<Array<{
    id: string;
    storeOptionValue: string;
    supplierOptionValue: string;
  }>>([{ id: '0', storeOptionValue: '', supplierOptionValue: '' }]);
  const [savedMappingRows, setSavedMappingRows] = useState<Array<{
    id: string;
    storeOptionValue: string;
    supplierOptionValue: string;
  }>>([]);

  // Ref for measuring content width and position
  const contentRef = useRef<HTMLDivElement>(null);
  const [footerStyle, setFooterStyle] = useState<React.CSSProperties>({});

  // Update footer position and width based on content
  useEffect(() => {
    const updateFooterPosition = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        setFooterStyle({
          left: `${rect.left}px`,
          width: `${rect.width}px`,
        });
      }
    };

    updateFooterPosition();
    window.addEventListener('resize', updateFooterPosition);

    return () => {
      window.removeEventListener('resize', updateFooterPosition);
    };
  }, []);

  return (
    <div className="relative">
      {/* Content Area */}
      <div ref={contentRef} className="px-6 pb-24">
        <div className="w-full">
          <div className="border-none">
            <div className="pb-4">
              <div>
                <div className="text-left text-xl font-bold">Automated Mapping</div>
                <div className="text-base text-muted-foreground font-normal">
                  If you run into problems, you can{" "}
                  <a
                    href="https://help.dshipit.com/automated-mapping/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    click here
                  </a>
                  {" "}for an introduction to this feature.
                </div>
              </div>
            </div>
            <div className="pt-4">
              <div className="space-y-6">
                {/* First Switch: Default Supplier */}
                <div className="flex items-start justify-between border-b pb-6">
                  <div className="flex-1 pr-4">
                    <p className="text-base">Should the first imported product be set as the default supplier?</p>
                  </div>
                  <div>
                    <Switch
                      checked={mappingFirstProductDefault}
                      onCheckedChange={setMappingFirstProductDefault}
                      className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
                    />
                  </div>
                </div>

                {/* Second Switch: Auto Mapping */}
                <div className="flex items-start justify-between border-b pb-6">
                  <div className="flex-1 pr-4">
                    <p className="text-base">When the store product matches your mapped supplier's product Option and Option Value, should it be automatically mapped?</p>
                  </div>
                  <div>
                    <Switch
                      checked={mappingAutoMatch}
                      onCheckedChange={setMappingAutoMatch}
                      className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
                    />
                  </div>
                </div>

                {/* Third Switch: Option Value Auto Mapping */}
                <div className="flex items-start justify-between pb-6">
                  <div className="flex-1 pr-4">
                    <p className="text-base">When the Option Value of the store product is different from the supplier product you mapped, DShipIt can automatically map it for you according to the corresponding relationship between the Option Values you set below.</p>
                  </div>
                  <div>
                    <Switch
                      checked={mappingOptionValueAuto}
                      onCheckedChange={setMappingOptionValueAuto}
                      className="h-5 w-9 [&>span]:size-[1.125rem] [&>span]:data-[state=checked]:translate-x-4"
                    />
                  </div>
                </div>

                {/* Mapping Form - Input table for adding new mappings */}
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left" style={{ width: '266px' }}>
                          Store Product OptionValue
                        </TableHead>
                        <TableHead className="text-left">
                          Supplier Product OptionValue
                        </TableHead>
                        <TableHead className="text-right" style={{ width: '48px' }}></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="[&_tr]:border-0">
                      {mappingFormRows.map((row, index) => {
                        const isLastRow = index === mappingFormRows.length - 1;
                        return (
                          <TableRow key={row.id} className="hover:bg-transparent">
                            <TableCell className="text-left">
                              <Input
                                placeholder="Store Product OptionValue"
                                maxLength={50}
                                value={row.storeOptionValue}
                                onChange={(e) => {
                                  const updatedRows = mappingFormRows.map(r =>
                                    r.id === row.id ? { ...r, storeOptionValue: e.target.value } : r
                                  );
                                  setMappingFormRows(updatedRows);
                                }}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="text-left">
                              <Input
                                placeholder="Supplier Product OptionValue"
                                value={row.supplierOptionValue}
                                onChange={(e) => {
                                  const updatedRows = mappingFormRows.map(r =>
                                    r.id === row.id ? { ...r, supplierOptionValue: e.target.value } : r
                                  );
                                  setMappingFormRows(updatedRows);
                                }}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {isLastRow ? (
                                <Button
                                  variant="outline"
                                  className="group hover:bg-transparent h-9 w-9 p-0"
                                  onClick={() => {
                                    const newId = String(parseInt(mappingFormRows[mappingFormRows.length - 1].id) + 1);
                                    setMappingFormRows([...mappingFormRows, {
                                      id: newId,
                                      storeOptionValue: '',
                                      supplierOptionValue: ''
                                    }]);
                                  }}
                                >
                                  <Plus style={{ width: '20px', height: '20px' }} className="text-gray-500 group-hover:text-black transition-colors" strokeWidth={1.5} />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="group hover:bg-transparent h-9 w-9 p-0"
                                  onClick={() => {
                                    const updatedRows = mappingFormRows.filter(r => r.id !== row.id);
                                    setMappingFormRows(updatedRows);
                                  }}
                                >
                                  <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 24 24"
                                    style={{ width: '20px', height: '20px' }}
                                    className="text-gray-500 group-hover:text-black transition-colors"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                                  </svg>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Saved Mappings List - shows "No Data" when empty */}
                {savedMappingRows.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 24 24"
                      className="h-16 w-16 text-gray-400"
                      style={{ fontWeight: 300 }}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.801 3.57A1.75 1.75 0 0 1 6.414 2.5h11.174c.702 0 1.337.42 1.611 1.067l3.741 8.828c.04.092.06.192.06.293v7.562A1.75 1.75 0 0 1 21.25 22H2.75A1.75 1.75 0 0 1 1 20.25v-7.5c0-.1.02-.199.059-.291L4.8 3.571ZM6.414 4a.25.25 0 0 0-.23.153L2.88 12H8a.75.75 0 0 1 .648.372L10.18 15h3.638l1.533-2.628a.75.75 0 0 1 .64-.372l5.13-.051-3.304-7.797a.25.25 0 0 0-.23-.152ZM21.5 13.445l-5.067.05-1.535 2.633a.75.75 0 0 1-.648.372h-4.5a.75.75 0 0 1-.648-.372L7.57 13.5H2.5v6.75c0 .138.112.25.25.25h18.5a.25.25 0 0 0 .25-.25Z"></path>
                    </svg>
                    <div className="text-base text-gray-400 font-light">No Data</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer - Save Button - Fixed to viewport bottom, matches content width */}
      <div
        className="fixed bottom-0 border-t bg-background shadow-lg z-50"
        style={footerStyle}
      >
        <div className="px-6 py-4">
          <Button
            size="sm"
            className="uppercase"
            onClick={() => {
              // Handle save logic here
              console.log('Saving mapping data:', {
                mappingFirstProductDefault,
                mappingAutoMatch,
                mappingOptionValueAuto,
                mappingFormRows,
                savedMappingRows
              });
            }}
          >
            SAVE
          </Button>
        </div>
      </div>
    </div>
  );
}
