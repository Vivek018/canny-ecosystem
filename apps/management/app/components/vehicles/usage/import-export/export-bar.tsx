import type { VehicleUsageDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { VehicleUsageColumnIdArray } from "../table/vehicle-usage-table-header";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: VehicleUsageDataType[];
  className: string;
  columnVisibility: VisibilityState;
}) {
  const toBeExportedData = data.map((element) => {
    const exportedData: {
      [key: (typeof VehicleUsageColumnIdArray)[number]]:
        | string
        | number
        | boolean;
    } = {};

    for (const key of VehicleUsageColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "vehicle_number") {
        exportedData[key] = element?.vehicles.registration_number;
      } else if (key === "site_name") {
        exportedData[key] = element?.vehicles?.sites?.name ?? "0";
      } else if (key === "month") {
        exportedData[key] = element?.month;
      } else if (key === "year") {
        exportedData[key] = element?.year;
      } else if (key === "kilometers") {
        exportedData[key] = element?.kilometers ?? 0;
      } else if (key === "fuel_in_liters") {
        exportedData[key] = element?.fuel_in_liters ?? 0;
      } else if (key === "fuel_amount") {
        exportedData[key] = element?.fuel_amount ?? 0;
      } else if (key === "toll_amount") {
        exportedData[key] = element?.toll_amount ?? 0;
      } else if (key === "maintainance_amount") {
        exportedData[key] = element?.maintainance_amount ?? 0;
      }
    }

    return exportedData;
  });

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(toBeExportedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute(
      "download",
      `Vehicle Usages - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className,
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <Button
          onClick={handleExport}
          variant="default"
          size="lg"
          className="h-full rounded-full"
        >
          Export
        </Button>
      </div>
    </div>
  );
}
