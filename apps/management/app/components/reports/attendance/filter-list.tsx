import type { AttendanceReportFilters } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSearchParams } from "@remix-run/react";

type Props = {
  filterList: AttendanceReportFilters | undefined;
};

export function FilterList({ filterList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({ key, value }: { key: string; value: string }) => {
    switch (key) {
      case "start_year":
        return `${filterList?.start_month?.slice(0, 3)} ${value}`;

      case "end_year":
        return `${filterList?.end_month?.slice(0, 3)} ${value}`;

      case "name":
      case "project":
      case "site":
        return value;

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    if (key === "start_year" && filterList?.start_month) {
      searchParams.delete("start_month");
      searchParams.delete("start_year");
    } else if (key === "end_year" && filterList?.end_month) {
      searchParams.delete("end_month");
      searchParams.delete("end_year");
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
              value !== null && value !== undefined && !key.endsWith("month"),
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
