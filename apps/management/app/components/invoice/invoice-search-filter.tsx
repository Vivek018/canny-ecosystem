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
  invoiceReimbursementTypeArray,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import type { InvoiceFilters } from "@canny_ecosystem/supabase/queries";
import { useDebounce } from "@canny_ecosystem/utils/hooks/debounce";

export function InvoiceSearchFilter({
  disabled,
  locationArray,
}: {
  disabled?: boolean;
  locationArray: string[];
}) {
  const [prompt, setPrompt] = useState("");
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === "/payroll/invoices" &&
      navigation.location.search.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams: InvoiceFilters = {
    date_start: "",
    date_end: "",
    company_location: "",
    payroll_type: "",
    invoice_type: "",
    service_charge: "",
    paid: "",
    paid_date_start: "",
    paid_date_end: "",
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

  const searchParamsList: InvoiceFilters = {
    date_start: searchParams.get("date_start"),
    date_end: searchParams.get("date_end"),
    company_location: searchParams.get("company_location"),
    payroll_type: searchParams.get("payroll_type"),
    invoice_type: searchParams.get("invoice_type"),
    service_charge: searchParams.get("project"),
    paid: searchParams.get("paid"),
    paid_date_start: searchParams.get("paid_date_start"),
    paid_date_end: searchParams.get("paid_date_end"),
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
          action: "/payroll/invoices?index",
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
              "absolute pointer-events-none left-3 top-[15px]",
              isSubmitting && "animate-spin"
            )}
          />
          <Input
            tabIndex={-1}
            ref={inputRef}
            disabled={disabled}
            className="pl-9 w-full h-10 md:w-[480px] pr-8 focus-visible:ring-0 placeholder:opacity-50 placeholder:focus-visible:opacity-70"
            value={prompt}
            onChange={handleSearch}
            autoComplete="on"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Search invoices"
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
              <span>Company Location</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {locationArray.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.company_location === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        company_location: name,
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
              <span>Payroll Type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {["salary", "exit", "reimbursement"].map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.payroll_type === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        payroll_type: name,
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
              <span>Invoice Type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {["salary", "exit", ...invoiceReimbursementTypeArray].map(
                  (name, index) => (
                    <DropdownMenuCheckboxItem
                      key={name + index.toString()}
                      className="capitalize"
                      checked={filterParams?.invoice_type === name}
                      onCheckedChange={() => {
                        setFilterParams((prev) => ({
                          ...prev,
                          invoice_type: name,
                        }));
                      }}
                    >
                      {name}
                    </DropdownMenuCheckboxItem>
                  )
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Service Charge</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {booleanArray?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.service_charge === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        service_charge: name,
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
              <span>Paid</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {booleanArray?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    checked={filterParams?.paid === name}
                    onCheckedChange={() => {
                      setFilterParams((prev) => ({
                        ...prev,
                        paid: name,
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
              <span>Paid Date</span>
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
                    filterParams.paid_date_start
                      ? new Date(filterParams.paid_date_start)
                      : new Date()
                  }
                  hidden={{ after: new Date() }}
                  selected={{
                    from: filterParams.paid_date_start
                      ? new Date(filterParams.paid_date_start)
                      : undefined,
                    to: filterParams.paid_date_end
                      ? new Date(filterParams.paid_date_end)
                      : undefined,
                  }}
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      paid_date_start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : String(filterParams.paid_date_start),
                      paid_date_end: range.to
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
