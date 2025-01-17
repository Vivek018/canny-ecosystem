
import { useEffect, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

import type { PaymentTemplateDatabaseRow } from "@canny_ecosystem/supabase/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";

export function PaymentTemplatesTableWrapper({
  data,
  error,
  searchString,
}: {
  data: Omit<PaymentTemplateDatabaseRow, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
  searchString: string;
}) {
  const [tableData, setTableData] = useState(data);
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });

    const filteredData = data?.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData ?? []);
  }, [searchString, data]);

  return (
    <>
      <DataTable columns={columns} data={tableData ?? []} />
    </>
  );
}
