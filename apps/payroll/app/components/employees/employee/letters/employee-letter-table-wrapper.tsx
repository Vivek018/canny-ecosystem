import { DataTable } from "./table/data-table";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { columns } from "./table/columns";
import type { EmployeeLetterDataType } from "@canny_ecosystem/supabase/queries";
import { useSearchParams } from "@remix-run/react";

export function EmployeeLetterTableWrapper({
  data,
  error,
  searchString,
}: {
  data: Omit<EmployeeLetterDataType, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
  searchString: string;
}) {
  const [searchParams] = useSearchParams();

  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
  }, [searchString, data]);

  const filterData = (
    data: Omit<EmployeeLetterDataType, "created_at" | "updated_at">[],
  ) => {
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
  };

  const sortData = (
    data: Omit<EmployeeLetterDataType, "created_at" | "updated_at">[],
  ) => {
    const sortParam = searchParams.get("sort");
    if (!sortParam) return data;

    const sortedData = [...data];
    switch (sortParam) {
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

  // Process table data: filter first, then sort
  const tableData = useMemo(() => {
    if (!data) return [];
    const filteredData = filterData(data);
    return sortData(filteredData);
  }, [data, searchString, searchParams]);

  return (
    <>
      <DataTable columns={columns} data={tableData ?? []} />
    </>
  );
}
