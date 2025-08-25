import { useImportStoreForReimbursement } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { createReimbursementsFromImportedData } from "@canny_ecosystem/supabase/mutations";
import {
  getEmployeeIdsByEmployeeCodes,
  getUserIdsByUserEmails,
} from "@canny_ecosystem/supabase/queries";
import type {
  ReimbursementInsert,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import {
  ImportReimbursementDataSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";
import { LoadingSpinner } from "@/components/loading-spinner";

import { useState, useEffect } from "react";
import { ImportedDataTable } from "../imported-table/imported-data-table";
import { ImportedDataColumns } from "../imported-table/columns";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix, recentlyAddedFilter } from "@/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function ReimbursementImportData({
  env,
  companyId,
}: {
  env: SupabaseEnv;
  companyId: string;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForReimbursement();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(importData.data);
  const [isImporting, setIsImporting] = useState(false);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportReimbursementDataSchema.safeParse({ data });

      if (!result.success) {
        console.error("Reimbursement Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Reimbursement Data validation error:", error);
      return false;
    }
  };

  useEffect(() => {
    const filteredData = importData?.data.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
    setTableData(filteredData);
  }, [searchString, importData]);

  const handleFinalImport = async () => {
    if (validateImportData(importData.data)) {
      setIsImporting(true);
      const userEmails = importData.data!.map((value) => value.email!);
      const employeeCodes = importData.data!.map(
        (value) => value.employee_code,
      );

      const { data: employees, error: codeError } =
        await getEmployeeIdsByEmployeeCodes({
          supabase,
          employeeCodes,
        });

      if (codeError) throw codeError;
      const { data: users, error: userError } = await getUserIdsByUserEmails({
        supabase,
        userEmails,
      });

      if (userError) throw userError;

      const updatedData = importData.data!.map((item: any) => {
        const employeeId = employees?.find(
          (e) => e.employee_code === item.employee_code,
        )?.id;
        const userId = users?.find((u) => u.email === item.email)?.id;

        const { email, employee_code, ...rest } = item;

        return {
          ...rest,
          ...(employeeId ? { employee_id: employeeId } : {}),
          ...(userId ? { user_id: userId } : {}),
          company_id: companyId,
        };
      });

      const { error, status } = await createReimbursementsFromImportedData({
        data: updatedData as ReimbursementInsert[],
        supabase,
      });

      setIsImporting(false);

      if (error) {
        toast({
          title: "Error",
          description: JSON.stringify(error) ?? "Failed to import details",
          variant: "destructive",
        });
      }

      if (isGoodStatus(status)) {
        toast({
          title: "Success",
          description: "Details imported succesfully",
          variant: "success",
        });
        clearCacheEntry(cacheKeyPrefix.reimbursements);
        navigate(
          `/approvals/reimbursements?recently_added=${recentlyAddedFilter[0]}`,
        );
      }
    }
  };

  return (
    <section className="p-4 relative">
      <div className={cn("fixed inset-0 z-50 bg-background/80", isImporting ? "block" : "hidden")}>
        <LoadingSpinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0" />
      </div>
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center">
          <div className="relative w-[30rem] ">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon
                name="magnifying-glass"
                size="sm"
                className="text-gray-400"
              />
            </div>
            <Input
              placeholder="Search Reimbursements"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant={"default"} onClick={handleFinalImport}>
              Import
            </Button>
          </div>
        </div>
      </div>

      <ImportedDataTable data={tableData} columns={ImportedDataColumns} />
    </section>
  );
}
