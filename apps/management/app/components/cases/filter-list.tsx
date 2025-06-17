import type { CaseFilters } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { formatDate, formatDateRange } from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

type Props = {
  filters: CaseFilters | undefined | null;
};

export function FilterList({ filters }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({
    key,
    value,
  }: {
    key: string;
    value: string | null | undefined;
  }) => {
    if (!value) return null;

    switch (key) {
      case "date_start":
        if (filters?.date_end) {
          return formatDateRange(new Date(value), new Date(filters.date_end), {
            includeTime: false,
          });
        }
        return formatDate(new Date(value));

      case "incident_date_start":
        if (filters?.incident_date_end) {
          return formatDateRange(
            new Date(value),
            new Date(filters.incident_date_end),
            {
              includeTime: false,
            },
          );
        }
        return formatDate(new Date(value));

      case "resolution_date_start":
        if (filters?.resolution_date_end) {
          return formatDateRange(
            new Date(value),
            new Date(filters.resolution_date_end),
            {
              includeTime: false,
            },
          );
        }
        return formatDate(new Date(value));

      case "name":
      case "status":
      case "case_type":
      case "location_type":
      case "location":
      case "reported_by":
      case "reported_on":
        return value;
      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    const updatedSearchParams = new URLSearchParams(searchParams);

    if (key === "date_start" && filters?.date_end) {
      updatedSearchParams.delete("date_end");
    }

    if (key === "incident_date_start" && filters?.incident_date_end) {
      updatedSearchParams.delete("incident_date_end");
    }

    if (key === "resolution_date_start" && filters?.resolution_date_end) {
      updatedSearchParams.delete("resolution_date_end");
    }

    updatedSearchParams.delete(key);
    setSearchParams(updatedSearchParams);
  };

  return (
    <ul className="flex flex-0 space-x-2 w-full overflow-scroll no-scrollbar">
      {filters &&
        Object.entries(filters)
          .filter(([key, value]) => value != null && !key.endsWith("end"))
          .map(([key, value]) => (
            <li key={key}>
              <Button
                className="rounded-full h-9 px-3 bg-secondary hover:bg-secondary font-normal text-[#878787] flex space-x-1 items-center group"
                onClick={() => handleOnRemove(key)}
                aria-label={`Remove filter for ${key}`}
              >
                <Icon
                  name="cross"
                  className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4"
                />
                <span className="capitalize">
                  {renderFilter({ key, value: value})}
                </span>
              </Button>
            </li>
          ))}
    </ul>
  );
}
