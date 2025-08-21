import { useImportStoreForVehicleUsage } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { createVehicleUsageFromImportedData } from "@canny_ecosystem/supabase/mutations";
import { getVehicleIdsByRegistrationNumber } from "@canny_ecosystem/supabase/queries";
import type {
  SupabaseEnv,
  VehiclesUsageDatabaseInsert,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import {
  ImportVehicleUsageDataSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

import { useState, useEffect } from "react";
import { ImportedDataColumns } from "../imported-table/columns";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix, recentlyAddedFilter } from "@/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ImportedDataTable } from "../imported-table/imported-data-table";

export function VehicleUsageImportData({
  env,
}: {
  env: SupabaseEnv;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForVehicleUsage();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(importData.data);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportVehicleUsageDataSchema.safeParse({ data });

      if (!result.success) {
        console.error("Vehicle usage Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Vehicle usage Data validation error:", error);
      return false;
    }
  };

  useEffect(() => {
    const filteredData = importData?.data.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, importData]);

  const handleFinalImport = async () => {
    if (validateImportData(importData.data)) {
      const numbers = importData.data!.map(
        (value) => value.registration_number
      );

      const { data: employees, error: numberError } =
        await getVehicleIdsByRegistrationNumber({
          supabase,
          numbers,
        });

      if (numberError) throw numberError;

      const updatedData = importData.data!.map((item: any) => {
        const regNumber = employees?.find(
          (e) => e.registration_number === item.registration_number
        )?.id;

        const { registration_number, ...rest } = item;

        return {
          ...rest,
          ...(regNumber ? { vehicle_id: regNumber } : {})
        };
      });

      const { error, status } = await createVehicleUsageFromImportedData({
        data: updatedData as VehiclesUsageDatabaseInsert[],
        supabase,
      });

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
        clearCacheEntry(cacheKeyPrefix.vehicle_usage);
        navigate(
          `/vehicles/usage?recently_added=${recentlyAddedFilter[0]}`
        );
      }
    }
  };

  return (
    <section>
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
              placeholder="Search Vehicles"
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
