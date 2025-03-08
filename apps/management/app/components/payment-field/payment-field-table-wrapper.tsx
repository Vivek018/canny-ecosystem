import { DataTable } from "./table/data-table";
import { useEffect, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { columns } from "./table/columns";
import type { PaymentFieldDataType } from "@canny_ecosystem/supabase/queries";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { searchInObject } from "@canny_ecosystem/utils";

export function PaymentFieldTableWrapper({
  data,
  error,
  searchString,
}: {
  data: Omit<PaymentFieldDataType, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
  searchString: string;
}) {
  const [tableData, setTableData] = useState(data);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.payment_fields);
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }

    const filteredData = data?.filter((item: any) =>
      searchInObject(item, searchString),
    );

    setTableData(filteredData ?? []);
  }, [searchString, data]);

  return <DataTable columns={columns} data={tableData ?? []} />;
}
