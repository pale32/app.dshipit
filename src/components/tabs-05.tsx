import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";

const tabs = [
  {
    name: "pnpm",
    value: "pnpm",
    content: "pnpm dlx shadcn@latest add tabs",
  },
  {
    name: "npm",
    value: "npm",
    content: "npx shadcn@latest add tabs",
  },
  {
    name: "yarn",
    value: "yarn",
    content: "npx shadcn@latest add tabs",
  },
  {
    name: "bun",
    value: "bun",
    content: "bunx --bun shadcn@latest add tabs",
  },
];

export default function TabsBoxDemo() {
  return (
    <Tabs defaultValue={tabs[0].value} className="w-full max-w-xs">
      <TabsList className="bg-background h-auto gap-1 border p-1">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <code className="text-[13px]">{tab.name}</code>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          <div className="flex h-10 items-center justify-between gap-2 rounded-md border pr-1.5 pl-3">
            <code className="text-[13px]">{tab.content}</code>
            <Button size="icon" variant="secondary" className="h-7 w-7">
              <Copy className="!h-3.5 !w-3.5" />
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
