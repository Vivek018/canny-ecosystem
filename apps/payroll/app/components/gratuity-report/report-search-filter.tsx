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
import type { EmployeeFilters } from "@canny_ecosystem/supabase/queries";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";

export function GratuityReportSearchFilter({
  disabled,
  projectArray,
  projectSiteArray,
}: {
  disabled?: boolean;
  projectArray: string[] | null;
  projectSiteArray: string[] | null;
}) {
  const [prompt, setPrompt] = useState("");
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === "/reports/gratuity" &&
      navigation.location.search.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: EmployeeFilters = {
    project: "",
    project_site: "",
    doj_start: "",
    doj_end: "",
    dol_start: "",
    dol_end: "",
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

  const searchParamsList: {
    project: string | null;
    project_site: string | null;
    doj_start: string | null;
    doj_end: string | null;
    dol_start: string | null;
    dol_end: string | null;
  } = {
    project: searchParams.get("project"),
    project_site: searchParams.get("project_site"),
    doj_start: searchParams.get("doj_start"),
    doj_end: searchParams.get("doj_end"),
    dol_start: searchParams.get("dol_start"),
    dol_end: searchParams.get("dol_end"),
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
    debounceSubmit(
      { prompt: prompt },
      {
        action: "/reports/gratuity?index",
        method: "POST",
      },
    );
    if (prompt.length) {
      searchParams.set("name", prompt);
      setSearchParams(searchParams);
    }
  };

  const hasValidFilters =
    Object.entries(filterParams).filter(
      ([key, value]) =>
        typeof value === "string" && value.length && key !== "name",
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
                ? "No Employee Data to Search And Filter"
                : "Search employee report"
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
              <span>Date of joining</span>
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
                  today={
                    filterParams.doj_start
                      ? new Date(filterParams.doj_start)
                      : new Date()
                  }
                  toDate={new Date()}
                  selected={
                    {
                      from:
                        filterParams.doj_start &&
                        new Date(filterParams.doj_start).toISOString(),
                      to:
                        filterParams.doj_end && new Date(filterParams.doj_end),
                    } as any
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      doj_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.doj_start),
                      doj_end: range.to
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
              <span>Date of leaving</span>
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
                  today={
                    filterParams.dol_start
                      ? new Date(filterParams.dol_start)
                      : new Date()
                  }
                  toDate={new Date()}
                  selected={
                    {
                      from:
                        filterParams.dol_start &&
                        new Date(filterParams.dol_start).toISOString(),
                      to:
                        filterParams.dol_end && new Date(filterParams.dol_end),
                    } as any
                  }
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      dol_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.dol_start),
                      dol_end: range.to
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
