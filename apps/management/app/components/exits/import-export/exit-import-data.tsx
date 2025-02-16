import { useImportStoreForExit } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { createExitsFromImportedData } from "@canny_ecosystem/supabase/mutations";
import { getEmployeeIdsByEmployeeCodes } from "@canny_ecosystem/supabase/queries";
import type { ExitsInsert, SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { ImportExitDataSchema, isGoodStatus } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ImportedDataTable } from "../imported-table/imported-data-table";
import { ImportedDataColumns } from "../imported-table/columns";
import { toast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export function ExitImportData({ env }: { env: SupabaseEnv }) {
  const navigate = useNavigate();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForExit();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(importData.data);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportExitDataSchema.safeParse({ data });
      if (!result.success) {
        console.error("Exit Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Exit Data validation error:", error);
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
      const employeeCodes = importData.data!.map(
        (value) => value.employee_code,
      );

      const { data: employees, error: codeError } =
        await getEmployeeIdsByEmployeeCodes({ supabase, employeeCodes });

      if (codeError) throw codeError;

      const updatedData = importData.data!.map((item: any) => {
        const employeeId = employees?.find(
          (e) => e.employee_code === item.employee_code,
        )?.id;
        const {
          email,
          employee_code,
          employee_name,
          project_name,
          project_site_name,
          ...rest
        } = item;
        return { ...rest, ...(employeeId ? { employee_id: employeeId } : {}) };
      });

      const { error, status } = await createExitsFromImportedData({
        data: updatedData as ExitsInsert[],
        supabase,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Exit creation Failed! Try Again, later.",
          variant: "destructive",
        });
      }
      if (isGoodStatus(status)) {
        clearCacheEntry(cacheKeyPrefix.exits)
        toast({
          title: "Success",
          description: "Exit created successfully!",
          variant: "success",
        });
        navigate("/approvals/exits");
      }
    }
  };

  return (
    <section className="p-4">
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
              placeholder="Search Exits"
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
