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
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { defaultYear, getYears } from "@canny_ecosystem/utils";
import { months } from "@canny_ecosystem/utils/constant";
import { useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const AttendanceFilter = ({
  disabled,
  setYear,
  setMonth,
}: {
  disabled?: boolean;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilterParams = {
    year: "",
    month: "",
  };

  const [filterParams, setFilterParams] = useState(initialFilterParams);

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
    month: string | null;
    year: string | null;
  } = {
    month: searchParams.get("month"),
    year: searchParams.get("year"),
  };

  useEffect(() => {
    for (const [key, value] of Object.entries(searchParamsList)) {
      if (value === null || value === undefined || !String(value)?.length) {
        setFilterParams((prev) => ({ ...prev, [key]: "" }));
      }
    }
  }, [searchParams]);

  useHotkeys(["meta+f", "ctrl+f"], (evt) => {
    if (!disabled) {
      evt.preventDefault();
      setIsOpen((prev) => !prev);
    }
  });

  useHotkeys(
    "esc",
    () => {
      deleteAllSearchParams();
      setFilterParams(initialFilterParams);
      setIsOpen(false);
    },
    {
      enableOnFormTags: true,
    },
  );
  return (
    <div>
      <div className="text-xl font-bold">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <div className="border rounded-md flex p-2 space-x-4 w-full md:w-auto items-center">
            <form
              className="relative w-full md:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  type="button"
                  className={cn(
                    "flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100",
                    isOpen && "opacity-100",
                  )}
                >
                  <Icon name="mixer" className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
            </form>
          </div>

          <DropdownMenuContent
            className="w-full md:w-[220px]"
            align="end"
            sideOffset={19}
            alignOffset={-11}
          >
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
      </div>
    </div>
  );
};
