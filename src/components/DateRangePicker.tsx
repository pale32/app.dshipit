"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  React.useEffect(() => {
    setStartDate(dateRange?.from || null);
    setEndDate(dateRange?.to || null);
  }, [dateRange]);

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

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-0">
            <DatePicker
              selected={startDate}
              onChange={handleChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              monthsShown={2}
              inline
              maxDate={new Date()}
              minDate={new Date("2025-01-01")}
              calendarClassName="border-0 shadow-none"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
