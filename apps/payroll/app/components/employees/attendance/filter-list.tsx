import type { AttendanceFilterType } from "@/routes/_protected+/dashboard";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSearchParams } from "@remix-run/react";

type Props = {
  filterList: AttendanceFilterType | undefined;
};

export function FilterList({ filterList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilter = ({ key, value }: { key: string; value: string }) => {
    switch (key) {
      case "month":
      case "year":
        return value;

      default:
        return null;
    }
  };

  const handleOnRemove = (key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  return (
    <ul className="flex justify-end  mr-4 flex-0 space-x-2 w-full overflow-scroll no-scrollbar">
      {filterList &&
        Object.entries(filterList)
          .filter(([_, value]) => value !== null && value !== undefined)
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
