import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/utils";
import { Button, buttonVariants } from "@/components/button";
import { Icon } from "./icon";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row",
        month: "space-y-4 pb-2",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        button_previous: "z-10 absolute top-3 left-4 h-8",
        button_next: "z-10 absolute top-3 right-4 h-8",
        month_grid: "w-full border-collapse space-y-1 mt-4",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day_button: cn(
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        range_start: "day-range-start",
        range_end: "day-range-end",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: (props) => (
          <Button variant='outline' size='icon' {...props}>
            <Icon name='chevron-left' size='sm' />
          </Button>
        ),
        NextMonthButton: (props) => (
          <Button variant='outline' size='icon' {...props}>
            <Icon name='chevron-right' size='sm' />
          </Button>
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
