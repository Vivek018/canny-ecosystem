import { useState } from "react";
import { cn } from "@/utils/cn";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Icon } from "./icon";
import { replaceUnderscore } from "@canny_ecosystem/utils";

export interface ComboboxSelectOption {
  value: string | number;
  label: string;
}

interface ComboboxProps {
  options: ComboboxSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options?.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "truncate justify-between capitalize",
            !selectedOption && "text-muted-foreground",
            className,
          )}
        >
          {replaceUnderscore(
            selectedOption ? selectedOption.label : placeholder,
          )}
          <Icon
            name="caret-sort"
            size="sm"
            className="ml-2 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty className="w-full py-6 text-center">
            No option found.
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={String(option.value + option.label)}
                  onSelect={() => {
                    onChange(
                      String(option.value) === value
                        ? ""
                        : String(option.value),
                    );
                    setOpen(false);
                  }}
                  className="max-w-96"
                >
                  <Icon
                    name="check"
                    size="sm"
                    className={cn(
                      "mr-2 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <p className="truncate capitalize">
                    {replaceUnderscore(option.label)}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
