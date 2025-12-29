import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Home, Settings, User } from "lucide-react";

const tabs = [
  {
    name: "Home",
    value: "home",
    icon: Home,
  },
  {
    name: "Profile",
    value: "profile",
    icon: User,
  },
  {
    name: "Messages",
    value: "messages",
    icon: Bot,
  },
  {
    name: "Settings",
    value: "settings",
    icon: Settings,
  },
];

export default function VerticalLeftBorderedTabsDemo() {
  return (
    <Tabs
      orientation="vertical"
      defaultValue={tabs[0].value}
      className="flex w-full max-w-md items-start justify-center gap-4"
    >
      <TabsList className="bg-background grid min-w-28 shrink-0 grid-cols-1 p-0">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:border-primary data-[state=active]:bg-primary/5 justify-start rounded-none border-l-2 border-transparent py-1.5 data-[state=active]:shadow-none"
          >
            <tab.icon className="me-2 h-5 w-5" /> {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="text-muted-foreground flex h-40 w-full max-w-xs items-center justify-center rounded-md border font-medium">
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.name} Content
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
