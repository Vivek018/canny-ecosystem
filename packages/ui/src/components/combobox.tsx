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
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options?.find(
    (option) => String(option.value) === String(value),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "truncate justify-between",
            !selectedOption && "text-muted-foreground",
            className,
          )}
        >
          {replaceUnderscore(
            selectedOption ? selectedOption?.label : placeholder,
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
                      String(option.value) === String(value)
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
                      String(value) === String(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <p className="truncate">{replaceUnderscore(option?.label)}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
