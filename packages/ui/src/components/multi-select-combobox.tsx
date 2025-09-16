import type React from "react";
import { useState } from "react";

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
import { cn } from "@/utils";
import type { ComboboxSelectOption } from "./combobox";

interface Props {
  label: string;
  renderItem: (option: ComboboxSelectOption) => React.ReactNode;
  renderSelectedItem: (value: string[]) => React.ReactNode;
  options: ComboboxSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelectCombobox = ({
  label,
  renderItem,
  renderSelectedItem,
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  const [open, setOpen] = useState(false);

  const handleChange = (currentValue: string) => {
    onChange(
      value.includes(currentValue)
        ? value.filter((val) => val !== currentValue)
        : [...value, currentValue],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="multi-select-options"
        aria-label={`Select ${label}`}
        tabIndex={0}
        className="w-full flex h-10 min-w-[180px] cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setOpen(!open);
          }
        }}
      >
        <Icon name="import" size="sm" className="mb-[3px]" />
        {value.length > 0 && (
          <span className="text-muted-foreground">{label}</span>
        )}

        <div className="overflow-hidden">
          {value.length > 0 ? renderSelectedItem(value) : `Select ${label}`}
        </div>

        <span className="z-10 ml-auto flex items-center gap-2">
          <Icon name="caret-sort" size="sm" />
        </span>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        id="multi-select-options"
      >
        <Command>
          <CommandInput
            placeholder={placeholder || `Search ${label}...`}
            aria-label={`Search ${label}`}
          />
          <CommandList className="max-h-[180px]">
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value + option.label}
                  value={option.label}
                  onSelect={() => handleChange(String(option.value))}
                  aria-selected={value.includes(String(option.value))}
                  disabled={
                    option?.value?.toString().toLowerCase() === "separator"
                  }
                >
                  <Icon
                    name="check"
                    size="sm"
                    className={cn(
                      "mr-1",
                      !value.includes(String(option.value)) && "opacity-0",
                    )}
                  />
                  {renderItem(option)}
                  <p
                    className={cn(
                      "text-muted-foreground ml-6 w-28 truncate",
                      !option?.pseudoLabel && "hidden",
                    )}
                  >
                    {option?.pseudoLabel}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
