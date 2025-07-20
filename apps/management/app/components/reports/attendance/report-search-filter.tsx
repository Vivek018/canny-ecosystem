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
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";
import { payoutMonths } from "@canny_ecosystem/utils/constant";
import { getYears } from "@canny_ecosystem/utils";
import type { EmployeeReportFilters } from "@canny_ecosystem/supabase/queries";

export function AttendanceReportSearchFilter({
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
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === "/reports/attendance" &&
      navigation.location.search.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: EmployeeReportFilters = {
    project: "",
    site: "",
    start_month: "",
    start_year: "",
    end_year: "",
    end_month: "",
  };

  const startYear = Number.parseInt(searchParams.get("start_year") ?? "");
  const endYear = Number.parseInt(searchParams.get("end_year") ?? "");

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

        if (key === "start_year" && !searchParams.get("start_month")) {
          searchParams.set("start_month", "January");
        }
        if (key === "end_year" && !searchParams.get("end_month")) {
          searchParams.set("end_month", "December");
        }
      }
      setSearchParams(searchParams);
    }
  }, [filterParams]);

  const searchParamsList: {
    project: string | null;
    site: string | null;
    start_month: string | null;
    start_year: string | null;
    end_month: string | null;
    end_year: string | null;
  } = {
    project: searchParams.get("project"),
    site: searchParams.get("site"),
    start_month: searchParams.get("start_month"),
    start_year: searchParams.get("start_year"),
    end_month: searchParams.get("end_month"),
    end_year: searchParams.get("end_year"),
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
    }
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
        action: "/reports/attendance?index",
        method: "POST",
      }
    );
    if (prompt.length) {
      searchParams.set("name", prompt);
      setSearchParams(searchParams);
    }
  };

  const hasValidFilters =
    Object.entries(filterParams).filter(
      ([key, value]) =>
        typeof value === "string" && value.length && key !== "name"
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
              isSubmitting && "animate-spin"
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
                isOpen && "opacity-100"
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
              <span>Start Year</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {getYears(
                  10,
                  endYear ? Number(endYear) : new Date().getFullYear()
                )
                  ?.sort((a, b) => b - a)
                  .map((name, index) => (
                    <DropdownMenuCheckboxItem
                      key={name + index.toString()}
                      className="capitalize"
                      checked={filterParams?.start_year === name.toString()}
                      onCheckedChange={() => {
                        setFilterParams((prev) => ({
                          ...prev,
                          start_year: name.toString(),
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
              <span>Start Month</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {!searchParamsList.start_year ? (
                  <DropdownMenuCheckboxItem
                    disabled={true}
                    className="p-8 items-center justify-center"
                  >
                    Select Start Year First
                  </DropdownMenuCheckboxItem>
                ) : (
                  payoutMonths
                    .slice(1)
                    .map((item) => item.label)
                    ?.map((name, index) => (
                      <DropdownMenuCheckboxItem
                        key={name + index.toString()}
                        className="capitalize"
                        checked={filterParams?.start_month === name}
                        onCheckedChange={() => {
                          setFilterParams((prev) => ({
                            ...prev,
                            start_month: name,
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
              <span>End Year</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {getYears(10)?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.end_year === name.toString()}
                    disabled={startYear > name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        end_year: name.toString(),
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
              <span>End Month</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {!searchParamsList.end_year ? (
                  <DropdownMenuCheckboxItem
                    disabled={true}
                    className="p-8 items-center justify-center"
                  >
                    Select End Year First
                  </DropdownMenuCheckboxItem>
                ) : (
                  payoutMonths
                    .slice(0, payoutMonths.length - 1)
                    .map((item) => item.label)
                    ?.map((name, index) => (
                      <DropdownMenuCheckboxItem
                        key={name + index.toString()}
                        className="capitalize"
                        checked={filterParams?.end_month === name}
                        onCheckedChange={() => {
                          setFilterParams((prev) => ({
                            ...prev,
                            end_month: name,
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
                {
                  siteArray?.map((name, index) => (
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
                  ))
                }
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
