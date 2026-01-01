"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, subMonths, subDays, subYears, isSameMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | null>(dateRange?.from || null);
  const [endDate, setEndDate] = React.useState<Date | null>(dateRange?.to || null);
  const [viewDate, setViewDate] = React.useState<Date>(subMonths(new Date(), 1));
  const containerRef = React.useRef<HTMLDivElement>(null);

  const today = new Date();
  const isAtCurrentMonth = isSameMonth(viewDate, subMonths(today, 1));

  React.useEffect(() => {
    setStartDate(dateRange?.from || null);
    setEndDate(dateRange?.to || null);
  }, [dateRange]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      onDateRangeChange({
        from: start,
        to: end,
      });
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (dateRange.to) {
      return (
        <>
          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
        </>
      );
    }

    return format(dateRange.from, "MMM dd, yyyy");
  };

  // Quick filter presets
  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "Last 180 days", days: 180 },
    { label: "Last 1 year", days: 365 },
  ];

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = days === 365 ? subYears(end, 1) : subDays(end, days);

    // Ensure start date is not before minDate
    const minDate = new Date("2025-01-01");
    const adjustedStart = start < minDate ? minDate : start;

    setStartDate(adjustedStart);
    setEndDate(end);
    onDateRangeChange({
      from: adjustedStart,
      to: end,
    });
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-[300px] justify-start text-left font-normal",
          !dateRange?.from && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDateRange()}
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 z-[9999] mt-2 rounded-md border bg-popover p-0 shadow-md",
            isAtCurrentMonth && "datepicker-at-max"
          )}
        >
          <DatePicker
            selected={startDate}
            onChange={handleChange}
            onMonthChange={(date) => setViewDate(date)}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            monthsShown={2}
            inline
            maxDate={new Date()}
            minDate={new Date("2025-01-01")}
            openToDate={viewDate}
            calendarClassName="border-0 shadow-none"
          />
          <div className="border-t px-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handlePresetClick(preset.days)}
                  className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
