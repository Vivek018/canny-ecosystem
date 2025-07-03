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
  reimbursementStatusArray,
  replaceUnderscore,
} from "@canny_ecosystem/utils";

import type { ReimbursementFilters } from "@canny_ecosystem/supabase/queries";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";
import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";

export const PLACEHOLDERS = [
  "Reimbursements submitted after Jan 2022 for Project 'ABC'",
  "Pending reimbursements approved by Manager John",
  "Non-payroll reimbursements submitted in 2023",
  "Approved reimbursements for Site 'ABC' under Project 'XYZ'",
  "Reimbursements marked as deductible for Loan recovery",
  "Reimbursements submitted before 2020 and still pending",
  "In-payroll reimbursements approved by User",
  "Rejected reimbursements for Project 'XYZ' by User",
  "Deductible reimbursements submitted between 2021 and 2024",
  "Reimbursements for Site 'ABC' not linked to Payroll",
  "Approved reimbursements submitted by EMP2045 in 2022",
  "Reimbursements submitted before 2019 for Project Site 'XYZ'",
  "Pending reimbursements from employees not in Payroll",
  "Deductible reimbursements approved by Finance Head",
];

export function ReimbursementSearchFilter({
  disabled,
  userEmails,
  employeeId,
  projectArray,
  projectSiteArray,
}: {
  disabled?: boolean;
  userEmails?: (string | null | undefined)[];
  employeeId?: string | undefined;
  projectArray?: string[];
  projectSiteArray?: string[];
}) {
  const [prompt, setPrompt] = useState("");
  const navigation = useNavigation();
  const submit = useSubmit();
  const [isFocused, setIsFocused] = useState(false);

  const debounceSubmit = useDebounce((target: any, options?: SubmitOptions) => {
    submit(target, options);
  }, 300);

  const animatedPlaceholder = useTypingAnimation(PLACEHOLDERS, isFocused, {
    typingSpeed: 40,
    pauseDuration: 4000,
  });

  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname ===
        (employeeId
          ? `/employees/${employeeId}/reimbursements`
          : "/approvals/reimbursements") &&
      navigation.location.search.length);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: ReimbursementFilters = {
    submitted_date_start: "",
    submitted_date_end: "",
    status: "",
    is_deductible: "",
    users: "",
    name: "",
    project: "",
    project_site: "",
    in_payroll: "",
  };

  const [filterParams, setFilterParams] = useState(initialFilterParams);

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

  const searchParamsList: ReimbursementFilters = {
    submitted_date_start: searchParams.get("submitted_date_start"),
    submitted_date_end: searchParams.get("submitted_date_end"),
    status: searchParams.get("status"),
    is_deductible: searchParams.get("is_deductible"),
    users: searchParams.get("users"),
    project: searchParams.get("project"),
    project_site: searchParams.get("project_site"),
    in_payroll: searchParams.get("in_payroll"),
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
    if (prompt.split(" ").length > 1) {
      debounceSubmit(
        { prompt: prompt },
        {
          action: "/approvals/reimbursements?index",
          method: "POST",
        }
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
      ([key, value]) => value?.length && key !== "name"
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
                ? "No Reimbursement Data to Search And Filter"
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
              <span>Submitted Date</span>
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
                    filterParams.submitted_date_start
                      ? new Date(filterParams.submitted_date_start)
                      : new Date()
                  }
                  hidden={{ after: new Date() }}
                  selected={{
                    from: filterParams.submitted_date_start
                      ? new Date(filterParams.submitted_date_start)
                      : undefined,
                    to: filterParams.submitted_date_end
                      ? new Date(filterParams.submitted_date_end)
                      : undefined,
                  }}
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      submitted_date_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.submitted_date_start),
                      submitted_date_end: range.to
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
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {reimbursementStatusArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.status === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        status: name,
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
              <span>Is Deductible</span>
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
                    checked={filterParams?.is_deductible === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        is_deductible: name,
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

        <DropdownMenuGroup className={cn(!projectArray?.length && "hidden")}>
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

        <DropdownMenuGroup className={cn(!projectArray?.length && "hidden")}>
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
              <span>Is In Payroll</span>
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
                    checked={filterParams?.in_payroll === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        in_payroll: name,
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
