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
import {
  type SubmitOptions,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { Calendar } from "@canny_ecosystem/ui/calendar";
import {
  defaultYear,
  getYears,
  leaveTypeArray,
  replaceUnderscore,
} from "@canny_ecosystem/utils";

import type { LeavesFilters } from "@canny_ecosystem/supabase/queries";
import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";
import { recentlyAddedFilter } from "@/constant";

export const PLACEHOLDERS = [
  "Sick leaves taken in 2023 for Project 'ABC'",
  "Leaves approved by Manager Priya between Jan-Mar 2022",
  "Casual leaves taken in 2020 at Site 'XYZ'",
  "Maternity leaves recorded in 2021 for Site 'ABC'",
  "Leaves from EMP456 in December 2023",
  "Unapproved leaves for Project 'ABC' in year 2022",
  "Leave records from Site 'ABC' for year 2020",
  "Paid leave entries for employees in 2019",
  "Leaves taken in February 2024 across all sites",
  "Leave records from Project 'XYZ' in year 2021",
  "Annual leaves approved by ABC in 2020",
  "Leaves from Site 'ABC' for the year 2023",
  "Emergency leaves taken by employees in March 2022",
  "Leaves from EMP1001 in year 2021 for Site 'XYZ'",
  "Leaves created in last 2 hours",
];

export function LeavesSearchFilter({
  disabled,
  employeeId,
  projectArray,
  siteArray,
  userEmails,
  isEmployeeRoute,
}: {
  disabled?: boolean;
  employeeId?: string | undefined;
  projectArray?: string[];
  siteArray?: string[];
  userEmails: (string | null | undefined)[];
  isEmployeeRoute: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);
  const animatedPlaceholder = useTypingAnimation(PLACEHOLDERS, isFocused, {
    typingSpeed: 40,
    pauseDuration: 4000,
  });
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === `/employees/${employeeId}/leaves` &&
      navigation.location.search.length);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: LeavesFilters = {
    date_start: "",
    date_end: "",
    leave_type: "",
    name: "",
    project: "",
    site: "",
    users: "",
    year: "",
    recently_added: "",
  };

  const [filterParams, setFilterParams] = useState(initialFilterParams);

  const submit = useSubmit();
  const debounceSubmit = useDebounce((target: any, options?: SubmitOptions) => {
    submit(target, options);
  }, 300);
  const deleteAllSearchParams = () => {
    for (const [key, _val] of Object.entries(filterParams)) {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    for (const [key, value] of Object.entries(filterParams)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.set(key, value);
      }
      setSearchParams(searchParams);
    }
  }, [filterParams]);

  const searchParamsList: LeavesFilters = {
    date_start: searchParams.get("date_start"),
    date_end: searchParams.get("date_end"),
    leave_type: searchParams.get("leave_type"),
    project: searchParams.get("project"),
    site: searchParams.get("site"),
    users: searchParams.get("users"),
    year: searchParams.get("year"),
    recently_added: searchParams.get("recently_added"),
  };

  useEffect(() => {
    for (const [key, value] of Object.entries(searchParamsList)) {
      if (value === null || value === undefined || !String(value)?.length) {
        setFilterParams((prev) => ({ ...prev, [key]: "" }));
      }
    }
  }, [searchParams]);

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      deleteAllSearchParams();
      setFilterParams(initialFilterParams);
      setIsOpen(false);
    },
    {
      enableOnFormTags: true,
    },
  );

  useHotkeys(["meta+s", "ctrl+s"], (evt) => {
    if (!disabled) {
      evt.preventDefault();
      inputRef.current?.focus();
    }
  });

  useHotkeys(["meta+f", "ctrl+f"], (evt) => {
    if (!disabled) {
      evt.preventDefault();
      setIsOpen((prev) => !prev);
    }
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    if (value) {
      setPrompt(value);
    } else {
      deleteAllSearchParams();
      setFilterParams(initialFilterParams);
      setPrompt("");
    }
  };

  const handleSubmit = () => {
    if (prompt.split(" ").length > 1) {
      debounceSubmit(
        { prompt: prompt },
        {
          action: "/time-tracking/leaves",
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
    Object.entries(filterParams).filter(
      ([key, value]) => value?.length && key !== "name",
    ).length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex space-x-4 w-full md:w-auto items-center">
        <form
          className="relative w-full md:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Icon
            name={isSubmitting ? "update" : "search"}
            className={cn(
              "absolute pointer-events-none left-3 top-[12.5px]",
              isSubmitting && "animate-spin",
            )}
          />
          <Input
            tabIndex={-1}
            ref={inputRef}
            placeholder={
              disabled
                ? "No Leaves Data to Search And Filter"
                : animatedPlaceholder
            }
            disabled={disabled}
            className="pl-9 w-full h-10 md:w-[480px] pr-8 focus-visible:ring-0 placeholder:opacity-50 placeholder:focus-visible:opacity-70"
            value={prompt}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="on"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <DropdownMenuTrigger disabled={disabled} asChild>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
              disabled={disabled}
              className={cn(
                "absolute z-10 right-3 top-[6px] opacity-70",
                !disabled &&
                  "transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100",
              )}
            >
              <Icon name="mixer" />
            </button>
          </DropdownMenuTrigger>
        </form>
      </div>

      <DropdownMenuContent
        className="w-full md:w-[480px]"
        align="end"
        sideOffset={19}
        alignOffset={-11}
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Date</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                <Calendar
                  mode="range"
                  captionLayout="dropdown"
                  today={
                    filterParams.date_start
                      ? new Date(filterParams.date_start)
                      : new Date()
                  }
                  hidden={{ after: new Date() }}
                  selected={{
                    from: filterParams.date_start
                      ? new Date(filterParams.date_start)
                      : undefined,
                    to: filterParams.date_end
                      ? new Date(filterParams.date_end)
                      : undefined,
                  }}
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      date_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.date_start),
                      date_end: range.to
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
              <span>Leave Type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {leaveTypeArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.leave_type === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        leave_type: name,
                      }));
                    }}
                  >
                    {replaceUnderscore(name)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuGroup className={cn(isEmployeeRoute && "hidden")}>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Project</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {projectArray?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.project === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        project: name,
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

        <DropdownMenuGroup className={cn(isEmployeeRoute && "hidden")}>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Site</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {siteArray?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.site === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        site: name,
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
              <span>Users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {userEmails?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    checked={filterParams?.users === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        users: name,
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
              <span>Year</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {getYears(25, defaultYear).map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.year === name.toString()}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        year: name.toString(),
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
              <span>Recently Added</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {recentlyAddedFilter.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.recently_added === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        recently_added: name,
                      }));
                    }}
                  >
                    {replaceUnderscore(name)}
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
