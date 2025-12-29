"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Heart, Settings, User, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function DemoPage() {
  const [progress, setProgress] = useState(33);
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-8 p-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">shadcn/ui Components Demo</h1>
          <p className="text-muted-foreground">Testing all installed components</p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and variants</CardDescription>
          </CardHeader>
          <CardContent className="space-x-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields, labels, checkboxes, and radio buttons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>

            <div className="space-y-2">
              <Label>Choose an option</Label>
              <RadioGroup defaultValue="option1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option1" id="option1" />
                  <Label htmlFor="option1">Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option2" id="option2" />
                  <Label htmlFor="option2">Option 2</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Components */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Tooltips, popovers, dropdowns, dialogs, and sheets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 space-x-2">
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="[&:hover]:border-gray-200 [&:hover]:!border-gray-200">
                    <Heart className="mr-2 h-4 w-4" />
                    Hover me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip!</p>
                </TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="leading-none font-medium">Dimensions</h4>
                      <p className="text-muted-foreground text-sm">
                        Set the dimensions for the layer.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Menu <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                      Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

        {/* Display Components */}
        <Card>
          <CardHeader>
            <CardTitle>Display Components</CardTitle>
            <CardDescription>Badges, avatars, progress bars, and sliders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label>Progress: {progress}%</Label>
              <Progress value={progress} className="w-full" />
              <Button onClick={() => setProgress(Math.min(100, progress + 10))} size="sm">
                Increase Progress
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Slider Value: {sliderValue[0]}</Label>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Icons */}
        <Card>
          <CardHeader>
            <CardTitle>Lucide React Icons</CardTitle>
            <CardDescription>Sample icons from the Lucide React library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Heart className="h-6 w-6" />
              <Settings className="h-6 w-6" />
              <User className="h-6 w-6" />
              <ChevronDown className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
