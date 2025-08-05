import { useEffect, useMemo, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { columns } from "./table/columns";
import type { EmployeeLetterDataType } from "@canny_ecosystem/supabase/queries";
import { useParams } from "@remix-run/react";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { DataTable } from "./table/data-table";

const sortData = (
  data: Omit<EmployeeLetterDataType, "created_at">[],
  sortType: string,
) => {
  if (!sortType) return data;

  const sortedData = [...data];
  switch (sortType) {
    case "date:desc":
      return sortedData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    case "letter_type:desc":
      return sortedData.sort((a, b) =>
        b.letter_type.localeCompare(a.letter_type),
      );
    case "date:asc":
      return sortedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    case "letter_type:asc":
      return sortedData.sort((a, b) =>
        a.letter_type.localeCompare(b.letter_type),
      );
    default:
      return sortedData;
  }
};

export function EmployeeLetterTableWrapper({
  data,
  error,
  searchString,
}: {
  data: Omit<EmployeeLetterDataType, "created_at">[] | null;
  error: Error | null | { message: string };
  searchString: string;
}) {
  const { employeeId } = useParams();
  const { toast } = useToast();
  const [sortType, setSortType] = useState("");

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  const filterData = (
    data: Omit<EmployeeLetterDataType, "created_at">[],
  ) => {
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
  };

  const tableData = useMemo(() => {
    if (!data) return [];

    const filteredData = filterData(data);

    return sortData(filteredData, sortType);
  }, [data, searchString, sortType]);

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        sortType={sortType}
        handleSortType={setSortType}
      />
    </>
  );
}
