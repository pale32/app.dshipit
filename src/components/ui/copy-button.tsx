"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-4 w-4 p-0 hover:bg-transparent", className)}
            onClick={copyToClipboard}
          >
            {copied ? (
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </div>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{copied ? "Link Copied!" : "Copy Link"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}