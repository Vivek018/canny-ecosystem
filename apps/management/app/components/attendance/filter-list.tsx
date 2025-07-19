import type { AttendanceFilters } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { defaultMonth, defaultYear } from "@canny_ecosystem/utils";
import { months } from "@canny_ecosystem/utils/constant";
import { useSearchParams } from "@remix-run/react";

type Props = {
  filters: AttendanceFilters | undefined;
};

export function FilterList({ filters }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthNames = Object.entries(months).reduce((acc, [name, num]) => {
    acc[num] = name;
    return acc;
  }, {} as { [key: number]: string });

  const defaultFilters =
    Object.keys(filters!).length
      ? filters
      : {
        month: monthNames[defaultMonth + 2],
        year: defaultYear.toString(),
      };

  const renderFilter = ({
    key,
    value,
  }: {
    key: string;
    value: string | null | undefined;
  }) => {
    if (!value) return null;

    switch (key) {
      case "name":
      case "month":
      case "year":
      case "project":
      case "site":
        return value;
      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    const updatedSearchParams = new URLSearchParams(searchParams);

    updatedSearchParams.delete(key);
    setSearchParams(updatedSearchParams);
  };

  return (
    <ul className="flex flex-0 space-x-2 w-full overflow-scroll no-scrollbar">
      {defaultFilters &&
        Object.entries(defaultFilters)
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
                  {renderFilter({ key, value: value ?? "" })}
                </span>
              </Button>
            </li>
          ))}
    </ul>
  );
}
