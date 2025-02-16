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
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  type SubmitOptions,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";

import type { AttendanceFilters } from "@canny_ecosystem/supabase/queries";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";
import { months } from "@canny_ecosystem/utils/constant";
import { getYears } from "@canny_ecosystem/utils";

export function AttendanceSearchFilter({
  disabled,
  projectArray,
  projectSiteArray,
  setYear,
  setMonth,
}: {
  disabled?: boolean;
  projectArray: string[];
  projectSiteArray: string[];
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === "/time-tracting/attendance" &&
      navigation.location.search.length);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: AttendanceFilters = {
    month: "",
    year: "",
    project: "",
    project_site: "",
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

  const searchParamsList: AttendanceFilters = {
    month: searchParams.get("month"),
    year: searchParams.get("year"),
    project: searchParams.get("project"),
    project_site: searchParams.get("project_site"),
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
          action: "/time-tracking/attendance?index",
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
                ? "No Attendance Data to Search And Filter"
                : "Search Attendance"
            }
            disabled={disabled}
            className="pl-9 w-full h-10 md:w-[480px] pr-8 focus-visible:ring-0 placeholder:opacity-50 placeholder:focus-visible:opacity-70"
            value={prompt}
            onChange={handleSearch}
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
        side="top"
      >
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
              <span>Project Site</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {!searchParamsList.project ? (
                  <DropdownMenuCheckboxItem
                    disabled={true}
                    className="p-8 items-center justify-center"
                  >
                    Select Project First
                  </DropdownMenuCheckboxItem>
                ) : (
                  projectSiteArray?.map((name, index) => (
                    <DropdownMenuCheckboxItem
                      key={name + index.toString()}
                      className="capitalize"
                      checked={filterParams?.project_site === name}
                      onCheckedChange={() => {
                        setFilterParams((prev) => ({
                          ...prev,
                          project_site: name,
                        }));
                      }}
                    >
                      {name}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
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
                {getYears(25, new Date().getFullYear()).map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.year === name.toString()}
                    onCheckedChange={() => {
                      setYear(Number(name));
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
              <span>Month</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {Object.keys(months).map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.month === name.toString()}
                    onCheckedChange={() => {
                      setMonth(Number(index));
                      setFilterParams((prev) => ({
                        ...prev,
                        month: name.toString(),
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
