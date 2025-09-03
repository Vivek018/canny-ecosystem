import type { EmployeeFilters } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  formatDate,
  formatDateRange,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

export type EmployeeFilterList = EmployeeFilters & {
  name?: string | null;
};

type Props = {
  filterList: EmployeeFilterList | null;
};

export function FilterList({ filterList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({ key, value }: { key: string; value: string }) => {
    switch (key) {
      case "dob_start": {
        if (value && filterList?.dob_end) {
          return formatDateRange(
            new Date(value),
            new Date(filterList.dob_end),
            {
              includeTime: false,
            }
          );
        }

        return value && formatDate(new Date(value));
      }
      case "dob_end":
        return !filterList?.dob_start && value && formatDate(new Date(value));

      case "gender":
        return value;

      case "education":
        return replaceUnderscore(value);

      case "status":
        return value;

      case "assignment_type":
        return replaceUnderscore(value);

      case "position":
        return replaceUnderscore(value);

      case "skill_level":
        return replaceUnderscore(value);
      case "site":
        return value;
      case "doj_start": {
        if (value && filterList?.doj_end) {
          return formatDateRange(
            new Date(value),
            new Date(filterList.doj_end),
            {
              includeTime: false,
            }
          );
        }

        return value && formatDate(new Date(value));
      }

      case "doj_end":
        return !filterList?.doj_start && value && formatDate(new Date(value));

      case "dol_start": {
        if (value && filterList?.dol_end) {
          return formatDateRange(
            new Date(value),
            new Date(filterList.dol_end),
            {
              includeTime: false,
            }
          );
        }

        return value && formatDate(new Date(value));
      }

      case "dol_end":
        return !filterList?.dol_start && value && formatDate(new Date(value));

      case "name":
        return value;

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    if (key === "dob_start" && filterList?.dob_end) {
      searchParams.delete("dob_end");
    }
    if (key === "doj_start" && filterList?.doj_end) {
      searchParams.delete("doj_end");
    }
    if (key === "dol_start" && filterList?.dol_end) {
      searchParams.delete("dol_end");
    }
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return (
    <ul className="flex flex-0 space-x-2 w-full overflow-scroll no-scrollbar">
      {filterList &&
        Object.entries(filterList)
          .filter(([value]) => value !== null && value !== undefined)
          .map(([key, value]) => {
            const renderValue = renderFilter({
              key,
              value: value ?? "",
            });
            return (
              <li key={key} className={cn(!renderValue && "hidden")}>
                <Button
                  className="rounded-full h-9 px-3 bg-secondary hover:bg-secondary font-normal text-[#878787] flex space-x-1 items-center group"
                  onClick={() => handleOnRemove(key)}
                >
                  <Icon
                    name="cross"
                    className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4"
                  />
                  <span className="capitalize">{renderValue}</span>
                </Button>
              </li>
            );
          })}
    </ul>
  );
}
