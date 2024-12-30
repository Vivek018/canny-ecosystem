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
}

export const MultiSelectCombobox = ({
  label,
  renderItem,
  renderSelectedItem,
  options,
  value,
  onChange,
  placeholder,
}: Props) => {
  const [open, setOpen] = useState(false);

  const handleChange = (currentValue: string) => {
    onChange(
      value.includes(currentValue)
        ? value.filter((val) => val !== currentValue)
        : [...value, currentValue]
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role='combobox'
          aria-expanded={open}
          aria-haspopup='listbox'
          aria-controls='multi-select-options'
          aria-label={`Select ${label}`}
          tabIndex={0}
          className='flex h-10 min-w-[200px] cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground'
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOpen(!open);
            }
          }}
        >
          <Icon name='select-drop' size='sm' className='mb-[3px]' />
          {value.length > 0 && (
            <span className='text-muted-foreground'>{label}</span>
          )}

          <div className='flex-1 overflow-hidden'>
            {value.length > 0 ? renderSelectedItem(value) : `Select ${label}`}
          </div>

          <span className='z-10 ml-auto flex items-center gap-2'>
            {value.length > 0 && (
              <button
                type='button'
                aria-label='Clear selection'
                className='z-10 rounded-sm opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-300'
                onClick={handleClear}
              >
                <Icon name='cross' size='sm' />
              </button>
            )}
            <Icon name='caret-sort' size='sm' />
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className='w-[--radix-popover-trigger-width] p-0'
        id='multi-select-options'
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
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleChange(String(option.value))}
                  aria-selected={value.includes(String(option.value))}
                >
                  <Icon
                    name='check'
                    size='sm'
                    className={cn(
                      "mr-1",
                      !value.includes(String(option.value)) && "opacity-0"
                    )}
                  />
                  {renderItem(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
