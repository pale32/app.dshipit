"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DSIColorsPage() {
  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">DSI Branded Color System</h1>
        <p className="text-muted-foreground">Testing DSI-prefixed color variables</p>
      </div>

      {/* DSI Orange Colors */}
      <Card>
        <CardHeader>
          <CardTitle>DSI Orange Palette</CardTitle>
          <CardDescription>Primary brand colors with dsi- prefix</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-orange)]" />
              <p className="text-sm font-medium">dsi-orange</p>
              <p className="text-muted-foreground text-xs">Primary Brand</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-orange-hover)]" />
              <p className="text-sm font-medium">dsi-orange-hover</p>
              <p className="text-muted-foreground text-xs">Hover State</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-orange-light)]" />
              <p className="text-sm font-medium">dsi-orange-light</p>
              <p className="text-muted-foreground text-xs">Light Variant</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-orange-lighter)]" />
              <p className="text-sm font-medium">dsi-orange-lighter</p>
              <p className="text-muted-foreground text-xs">Lighter Variant</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-[var(--dsi-orange)] text-white hover:bg-[var(--dsi-orange-lightest)] hover:text-black">
              DSI Orange Button
            </Button>
            <Badge className="bg-[var(--dsi-orange)] text-white">DSI Orange Badge</Badge>
            <Badge className="bg-[var(--dsi-orange-light)] text-black">DSI Light Badge</Badge>
            <Badge className="bg-[var(--dsi-orange-lightest)] text-black">DSI Lightest Badge</Badge>
          </div>
        </CardContent>
      </Card>

      {/* DSI Gray Colors */}
      <Card>
        <CardHeader>
          <CardTitle>DSI Gray Palette</CardTitle>
          <CardDescription>Complete gray scale with dsi- prefix</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg border bg-[var(--dsi-gray-50)]" />
              <p className="text-xs font-medium">dsi-gray-50</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-100)]" />
              <p className="text-xs font-medium">dsi-gray-100</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-200)]" />
              <p className="text-xs font-medium">dsi-gray-200</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-300)]" />
              <p className="text-xs font-medium">dsi-gray-300</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-400)]" />
              <p className="text-xs font-medium">dsi-gray-400</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-500)]" />
              <p className="text-xs font-medium">dsi-gray-500</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-600)]" />
              <p className="text-xs font-medium">dsi-gray-600</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-700)]" />
              <p className="text-xs font-medium">dsi-gray-700</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-800)]" />
              <p className="text-xs font-medium">dsi-gray-800</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-900)]" />
              <p className="text-xs font-medium">dsi-gray-900</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-lg bg-[var(--dsi-gray-950)]" />
              <p className="text-xs font-medium">dsi-gray-950</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-[var(--dsi-gray-800)] text-white hover:bg-[var(--dsi-gray-700)]">
              DSI Gray Button
            </Button>
            <Badge className="bg-[var(--dsi-gray-600)] text-white">DSI Gray Badge</Badge>
            <Badge className="bg-[var(--dsi-gray-200)] text-black">DSI Light Gray</Badge>
          </div>
        </CardContent>
      </Card>

      {/* DSI Yellow Colors */}
      <Card>
        <CardHeader>
          <CardTitle>DSI Yellow Palette</CardTitle>
          <CardDescription>Warning and complementary colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-yellow)]" />
              <p className="text-sm font-medium">dsi-yellow</p>
              <p className="text-muted-foreground text-xs">Warning Color</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-yellow-light)]" />
              <p className="text-sm font-medium">dsi-yellow-light</p>
              <p className="text-muted-foreground text-xs">Light Warning</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-yellow-lightest)]" />
              <p className="text-sm font-medium">dsi-yellow-lightest</p>
              <p className="text-muted-foreground text-xs">Lightest Warning</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-[var(--dsi-yellow)] text-black hover:bg-[var(--dsi-yellow-lightest)]">
              DSI Warning Button
            </Button>
            <Badge className="bg-[var(--dsi-yellow)] text-black">DSI Warning Badge</Badge>
            <Badge className="bg-[var(--dsi-yellow-lightest)] text-black">
              DSI Lightest Warning
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* DSI Red Colors */}
      <Card>
        <CardHeader>
          <CardTitle>DSI Red Palette</CardTitle>
          <CardDescription>Error and alert colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-red)]" />
              <p className="text-sm font-medium">dsi-red</p>
              <p className="text-muted-foreground text-xs">Error Color</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-red-light)]" />
              <p className="text-sm font-medium">dsi-red-light</p>
              <p className="text-muted-foreground text-xs">Light Error</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="bg-[var(--dsi-red)] text-white hover:bg-[var(--dsi-red-light)]">
              DSI Error Button
            </Button>
            <Badge className="bg-[var(--dsi-red)] text-white">DSI Error Badge</Badge>
          </div>
        </CardContent>
      </Card>

      {/* DSI Warm Color Combinations */}
      <Card>
        <CardHeader>
          <CardTitle>DSI Warm Color Combinations</CardTitle>
          <CardDescription>Warm color palettes for buttons and backgrounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Warm Colors */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Original Warm Combination</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-warm-button)]" />
                <p className="text-sm font-medium">dsi-warm-button</p>
                <p className="text-muted-foreground text-xs">#dcaa70</p>
              </div>
              <div className="text-center">
                <div className="mb-2 h-20 w-full rounded-lg border bg-[var(--dsi-warm-bg)]" />
                <p className="text-sm font-medium">dsi-warm-bg</p>
                <p className="text-muted-foreground text-xs">#fcf4ee</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="border bg-[var(--dsi-warm-button)] text-white hover:border-[var(--dsi-warm-button)] hover:bg-[var(--dsi-warm-bg)] hover:text-black">
                Warm Button
              </Button>
              <Badge className="bg-[var(--dsi-warm-button)] text-white">Warm Badge</Badge>
            </div>
          </div>

          {/* New Coral Warm Colors */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Coral Warm Combination</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="mb-2 h-20 w-full rounded-lg bg-[var(--dsi-warm-coral-button)]" />
                <p className="text-sm font-medium">dsi-warm-coral-button</p>
                <p className="text-muted-foreground text-xs">#e2a6a3</p>
              </div>
              <div className="text-center">
                <div className="mb-2 h-20 w-full rounded-lg border bg-[var(--dsi-warm-coral-bg)]" />
                <p className="text-sm font-medium">dsi-warm-coral-bg</p>
                <p className="text-muted-foreground text-xs">#fff3f2</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="border bg-[var(--dsi-warm-coral-button)] text-white hover:border-[var(--dsi-warm-coral-button)] hover:bg-[var(--dsi-warm-coral-bg)] hover:text-black">
                Coral Button
              </Button>
              <Badge className="bg-[var(--dsi-warm-coral-button)] text-white">Coral Badge</Badge>
            </div>
          </div>

          {/* Combined Example */}
          <div className="rounded-lg border border-[var(--dsi-warm-coral-button)] bg-[var(--dsi-warm-coral-bg)] p-4">
            <h4 className="mb-2 font-semibold text-[var(--dsi-warm-coral-button)]">
              Warm Color Combinations
            </h4>
            <p className="mb-3 text-sm text-gray-700">
              These warm color combinations provide gentle, approachable styling options for various
              UI elements.
            </p>
            <div className="flex gap-2">
              <Button className="bg-[var(--dsi-warm-button)] text-white hover:bg-[var(--dsi-warm-button)]/80">
                Original Warm
              </Button>
              <Button className="bg-[var(--dsi-warm-coral-button)] text-white hover:bg-[var(--dsi-warm-coral-button)]/80">
                Coral Warm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>DSI Color Usage Examples</CardTitle>
          <CardDescription>How to use DSI-branded colors in your components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <h4 className="mb-2 font-semibold">CSS Custom Properties:</h4>
            <code className="text-sm">
              background-color: var(--dsi-orange);
              <br />
              border-color: var(--dsi-orange-hover);
              <br />
              color: var(--dsi-orange-light);
            </code>
          </div>

          <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <h4 className="mb-2 font-semibold">Tailwind Classes:</h4>
            <code className="text-sm">
              className=&quot;bg-[var(--dsi-orange)] text-[var(--dsi-orange-light)]&quot;
              <br />
              className=&quot;border-[var(--dsi-yellow)] hover:bg-[var(--dsi-orange-hover)]&quot;
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
