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
  booleanArray,
  exitReasonArray,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import type { ExitFilterType } from "@canny_ecosystem/supabase/queries";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";
import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";
import { recentlyAddedFilter } from "@/constant";

export const PLACEHOLDERS = [
  "Employees who left before 2020 due to resignation",
  "Exits with final settlement after Jan 2023",
  "Employees exited from Project 'XYZ' at Site 'ABC'",
  "Resigned employees not included in invoice",
  "Terminated employees whose last working day was in 2022",
  "Employees who exited Site 'ABC' with settlements before 2024",
  "Exits from Project 'XYZ' with final settlement after June 2021",
  "Employees who left between 2019-2021 and were in invoice",
  "Voluntary exits from Site 'XYZ' before 2018",
  "Exits due to retirement with working day end before 2015",
  "Employees whose final settlement is still pending after 2023",
  "Non-invoice exits due to personal reasons",
  "Employees exited in 2020 from Project 'XYZ'",
  "Last working day between 2021 and 2022 for Site 'ABC'",
  "Exits created in last 4 hours",
];

export function ExitsSearchFilter({
  disabled,
  projectArray,
  siteArray,
}: {
  disabled?: boolean;
  projectArray: string[] | null;
  siteArray: string[] | null;
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
      navigation.location.pathname === "/approvals/exits" &&
      navigation.location.search.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: ExitFilterType = {
    last_working_day_start: "",
    last_working_day_end: "",
    final_settlement_date_start: "",
    final_settlement_date_end: "",
    reason: "",
    project: "",
    site: "",
    in_invoice: "",
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
    searchParams.delete("name");
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

  const searchParamsList: ExitFilterType = {
    last_working_day_start: searchParams.get("last_working_day_start"),
    last_working_day_end: searchParams.get("last_working_day_end"),
    final_settlement_date_start: searchParams.get(
      "final_settlement_date_start",
    ),
    final_settlement_date_end: searchParams.get("final_settlement_date_end"),
    reason: searchParams.get("reason"),
    project: searchParams.get("project"),
    in_invoice: searchParams.get("in_invoice"),
    site: searchParams.get("site"),
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
          action: "/approvals/exits?index",
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
                ? "No Exits Data to Search And Filter"
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
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Last Working Day</span>
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
                    filterParams.last_working_day_start
                      ? new Date(filterParams.last_working_day_start)
                      : new Date()
                  }
                  hidden={{ after: new Date() }}
                  selected={{
                    from: filterParams.last_working_day_start
                      ? new Date(filterParams.last_working_day_start)
                      : undefined,
                    to: filterParams.last_working_day_end
                      ? new Date(filterParams.last_working_day_end)
                      : undefined,
                  }}
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      last_working_day_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.last_working_day_start),
                      last_working_day_end: range.to
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
              <span>Reason</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {exitReasonArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.reason === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        reason: name,
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

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Final Settlement Date</span>
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
                    filterParams.final_settlement_date_start
                      ? new Date(filterParams.final_settlement_date_start)
                      : new Date()
                  }
                  hidden={{ after: new Date() }}
                  selected={{
                    from: filterParams.final_settlement_date_start
                      ? new Date(filterParams.final_settlement_date_start)
                      : undefined,
                    to: filterParams.final_settlement_date_end
                      ? new Date(filterParams.final_settlement_date_end)
                      : undefined,
                  }}
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      final_settlement_date_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.final_settlement_date_start),
                      final_settlement_date_end: range.to
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

        <DropdownMenuGroup>
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
              <span>Is In Invoice</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {booleanArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.in_invoice === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        in_invoice: name,
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
