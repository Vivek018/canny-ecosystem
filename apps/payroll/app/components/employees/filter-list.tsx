import type { EmployeeFilters } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  formatDate,
  formatDateRange,
  replaceDash,
} from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

export type EmployeeFilterList = EmployeeFilters & {
  name?: string;
};

type Props = {
  filterList: EmployeeFilterList | undefined;
};

export function FilterList({ filterList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({ key, value }: { key: string; value: string }) => {
    switch (key) {
      case "start": {
        if (key === "start" && value && filterList?.end) {
          return formatDateRange(new Date(value), new Date(filterList.end), {
            includeTime: false,
          });
        }

        return key === "start" && value && formatDate(new Date(value));
      }

      case "gender":
        return value;

      case "education":
        return replaceDash(value);

      case "status":
        return value;

      case "name":
        return value;

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    if (key === "start" && filterList?.end) {
      searchParams.delete("end");
    }
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return (
    <ul className="flex flex-0 space-x-2 md:max-w-full lg:max-w-[60%] overflow-x-scroll no-scrollbar">
      {filterList &&
        Object.entries(filterList)
          .filter(
            ([key, value]) =>
              value !== null && value !== undefined && key !== "end",
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
                      value,
                    })}
                  </span>
                </Button>
              </li>
            );
          })}
    </ul>
  );
}
