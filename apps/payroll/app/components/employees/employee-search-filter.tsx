import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { formatISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSearchParams, useSubmit } from "@remix-run/react";
import { Calendar } from "@canny_ecosystem/ui/calendar";
import {
  educationArray,
  genderArray,
  replaceDash,
} from "@canny_ecosystem/utils";
import type { EmployeeFilters } from "@canny_ecosystem/supabase/queries";
import { useIsDocument } from "@canny_ecosystem/ui/hooks/is-document";

const PLACEHOLDERS = [
  "Employees born before 1980",
  "Active Employees",
  "Graduate Employees",
  "Search Employees",
];
const placeholder =
  PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

export function EmployeesSearchFilter() {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const filters: EmployeeFilters = {
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
    education: searchParams.get("education") ?? undefined,
    gender: searchParams.get("gender") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  };
  const [filterParams, setFilterParams] = useState(filters);

  const { isDocument } = useIsDocument();
  const submit = useSubmit();

  useEffect(() => {
    for (const [key, value] of Object.entries(filterParams)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.set(key, value);
        setSearchParams(searchParams);
      }
    }
  }, [filterParams]);

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      setSearchParams("");
      setIsOpen(false);
    },
    {
      enableOnFormTags: true,
    },
  );

  useHotkeys("meta+s", (evt) => {
    evt.preventDefault();
    inputRef.current?.focus();
  });

  useHotkeys("meta+f", (evt) => {
    evt.preventDefault();
    setIsOpen((prev) => !prev);
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;

    if (value) {
      setPrompt(value);
    } else {
      setSearchParams();
      setPrompt("");
    }
  };

  const handleSubmit = async () => {
    if (prompt.split(" ").length > 1) {
      submit(
        { prompt: prompt },
        {
          action: "/employees",
          method: "POST",
        },
      );
    } else {
      if (prompt.length) {
        searchParams.set("name", prompt);
        setSearchParams(searchParams);
      }
    }
  };

  const hasValidFilters =
    Object.entries(filters).filter(
      ([key, value]) => value !== null && key !== "q",
    ).length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex space-x-4 items-center">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Icon
            name="search"
            className="absolute pointer-events-none left-3 top-2.5"
          />
          <Input
            ref={inputRef}
            placeholder={isDocument ? placeholder : "Search Employees"}
            className="pl-9 w-full md:w-[350px] pr-8 focus-visible:ring-0 "
            value={prompt}
            onChange={handleSearch}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <DropdownMenuTrigger asChild>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
              className={cn(
                "absolute z-10 right-3 top-1 opacity-50 transition-opacity duration-300 hover:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100",
              )}
            >
              <Icon name="filter" />
            </button>
          </DropdownMenuTrigger>
        </form>
      </div>

      <DropdownMenuContent
        className="w-[350px]"
        align="end"
        sideOffset={19}
        alignOffset={-11}
        side="top"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Date of birth</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                <Calendar
                  mode="range"
                  initialFocus
                  today={filters.start ? new Date(filters.start) : new Date()}
                  toDate={new Date()}
                  selected={
                    {
                      from:
                        filters.start && new Date(filters.start).toISOString(),
                      to: filters.end && new Date(filters.end),
                    } as any
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filters.start),
                      end: range.to
                        ? formatISO(range.to, { representation: "date" })
                        : "",
                    };
                    setFilterParams((prev) => ({ ...prev, ...newRange }));
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Education</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {educationArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filters?.education === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        education: name,
                      }));
                    }}
                  >
                    {replaceDash(name)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Gender</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {genderArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filters?.gender?.includes(name)}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        gender: name,
                      }));
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {["active", "inactive"].map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filters?.status?.includes(name)}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        status: name,
                      }));
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
