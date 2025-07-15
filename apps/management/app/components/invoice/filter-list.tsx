import type { InvoiceFilters } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate, formatDateRange } from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

export type InvoiceFilterList = InvoiceFilters & {
  name?: string | null;
};

type Props = {
  filterList: InvoiceFilterList | null;
};

export function FilterList({ filterList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({ key, value }: { key: string; value: string }) => {
    switch (key) {
      case "date_start": {
        if (value && filterList?.date_end) {
          return formatDateRange(
            new Date(value),
            new Date(filterList.date_end),
            {
              includeTime: false,
            }
          );
        }

        return value && formatDate(new Date(value));
      }
      case "date_end":
        return !filterList?.date_start && value && formatDate(new Date(value));

      case "company_location":
        return value;

      case "type":
        return value;


      case "service_charge":
        return value;

      case "paid":
        return value;

      case "name":
        return value;

      case "paid_date_start": {
        if (value && filterList?.paid_date_end) {
          return formatDateRange(
            new Date(value),
            new Date(filterList.paid_date_end),
            {
              includeTime: false,
            }
          );
        }

        return value && formatDate(new Date(value));
      }

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    if (key === "date_start" && filterList?.date_end) {
      searchParams.delete("date_end");
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
