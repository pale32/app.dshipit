"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  change: number;
  icon: React.ComponentType<any>;
  format?: "currency" | "number" | "percentage";
  valueColor?: string;
  size?: "default" | "large";
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  format = "number",
  valueColor,
  size = "default",
}: StatCardProps) {
  const formatValue = (val: number, formatType: string) => {
    switch (formatType) {
      case "currency":
        return `$${val.toLocaleString()}`;
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const textSize = size === "large" ? "text-3xl md:text-4xl" : "text-2xl";
  const cardPadding = size === "large" ? "p-8" : "";

  return (
    <Card className={cardPadding}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className={`${textSize} font-bold ${valueColor || ""}`}>
          {formatValue(value, format)}
        </div>
        <p className="text-muted-foreground mb-2 text-xs">{subtitle}</p>
        <div className="flex items-center">
          {change > 0 ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${change > 0 ? "text-green-500" : "text-red-500"}`}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          <span className="text-muted-foreground ml-1 text-xs">from yesterday</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function LargeStatCard({
  value,
  label,
  description,
  color = "text-primary",
  chartElement,
}: {
  value: string;
  label: string;
  description: string;
  color?: string;
  chartElement?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <span className={`text-5xl font-bold md:text-6xl ${color}`}>{value}</span>
      <p className="text-foreground mt-6 text-xl font-semibold">{label}</p>
      <p className="text-muted-foreground mt-2 text-[17px]">{description}</p>
      {chartElement && (
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-24">{chartElement}</div>
        </div>
      )}
    </div>
  );
}
