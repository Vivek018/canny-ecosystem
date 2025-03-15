import { useEffect, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

import type { PaymentTemplateDatabaseRow } from "@canny_ecosystem/supabase/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { searchInObject } from "@canny_ecosystem/utils";

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
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.payment_templates);
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
