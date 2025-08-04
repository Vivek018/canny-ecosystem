import type { ExitFilterType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  formatDate,
  formatDateRange,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

export type ExitFilterList = ExitFilterType & {
  name?: string | undefined | null;
};

type Props = {
  filterList: ExitFilterList | undefined;
};

export function FilterList({ filterList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({ key, value }: { key: string; value: string }) => {
    switch (key) {
      case "last_working_day_start": {
        if (value && filterList?.last_working_day_end) {
          return formatDateRange(
            new Date(value),
            new Date(filterList?.last_working_day_end),
            {
              includeTime: false,
            }
          );
        }

        return (
          key === "last_working_day_start" &&
          value &&
          formatDate(new Date(value))
        );
      }
      case "in_payroll":

      case "reason":

      case "name":
        return value;

      case "final_settlement_date_start": {
        if (
          key === "final_settlement_date_start" &&
          value &&
          filterList?.final_settlement_date_end
        ) {
          return formatDateRange(
            new Date(value),
            new Date(filterList.final_settlement_date_end),
            {
              includeTime: false,
            }
          );
        }

        return (
          key === "final_settlement_date_start" &&
          value &&
          formatDate(new Date(value))
        );
      }
      case "recently_added":
        return replaceUnderscore(value);
      case "project":
        return value;

      case "site":
        return value;

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    if (key === "last_working_day_start" && filterList?.last_working_day_end) {
      searchParams.delete("last_working_day_end");
    }
    if (
      key === "final_settlement_date_start" &&
      filterList?.final_settlement_date_end
    ) {
      searchParams.delete("final_settlement_date_end");
    }
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return (
    <ul className="flex flex-0 space-x-2 w-full overflow-scroll no-scrollbar">
      {filterList &&
        Object.entries(filterList)
          .filter(
            ([key, value]) =>
              value !== null && value !== undefined && !key.endsWith("end")
          )
          .map(([key, value]) => {
            return (
              <li key={key}>
                <Button
                  className="rounded-full h-9 px-3 bg-secondary hover:bg-secondary font-normal text-[#878787] flex space-x-1 items-center group"
                  onClick={() => handleOnRemove(key)}
                >
                  <Icon
                    name="cross"
                    className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4"
                  />
                  <span className="capitalize">
                    {renderFilter({
                      key,
                      value: value ?? "",
                    })}
                  </span>
                </Button>
              </li>
            );
          })}
    </ul>
  );
}
