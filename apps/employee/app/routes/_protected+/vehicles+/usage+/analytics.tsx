import type { VehicleUsageDataType } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";
import { useVehicleUsageStore } from "@/store/vehicle-usage";
import type { ChartConfig } from "@canny_ecosystem/ui/chart";
import { VehicleUsageBars } from "@/components/vehicles/usage/analytics/usage-bar";
import { KilometersByMonth } from "@/components/vehicles/usage/analytics/kilometers-by-month";
import { FuelAmountByMonth } from "@/components/vehicles/usage/analytics/fuel-amount-by-month";
import { FuelByMonth } from "@/components/vehicles/usage/analytics/fuel-by-month";
import { TollAmountByMonth } from "@/components/vehicles/usage/analytics/toll-amount-by-month";
import { MaintainanceAmountByMonth } from "@/components/vehicles/usage/analytics/maintainance-amount-by-month";

const getDataSource = (
  selectedRows: VehicleUsageDataType[],
  storedValue: VehicleUsageDataType[]
) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export default function VehicleUsageAnalytics() {
  const { selectedRows } = useVehicleUsageStore();
  const [storedValue, setValue] = useLocalStorage<VehicleUsageDataType[]>(
    "analyticsArray",
    []
  );

  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: VehicleUsageDataType[] = getDataSource(
    selectedRows,
    storedValue
  );

  const chartConfig = {
    amount: {
      label: "Total Amount",
    },
    1: {
      label: "Jan",
      color: "hsl(var(--chart-1))",
    },
    2: {
      label: "Feb",
      color: "hsl(var(--chart-2))",
    },
    3: {
      label: "Mar",
      color: "hsl(var(--chart-3))",
    },
    4: {
      label: "Apr",
      color: "hsl(var(--chart-4))",
    },
    5: {
      label: "May",
      color: "hsl(var(--chart-5))",
    },
    6: {
      label: "June",
      color: "hsl(var(--chart-6))",
    },
    7: {
      label: "July",
      color: "hsl(var(--chart-7))",
    },
    8: {
      label: "Aug",
      color: "hsl(var(--chart-8))",
    },
    9: {
      label: "Sept",
      color: "hsl(var(--chart-9))",
    },
    10: {
      label: "Oct",
      color: "hsl(var(--chart-10))",
    },
    11: {
      label: "Nov",
      color: "hsl(var(--chart-11))",
    },
    12: {
      label: "Dec",
      color: "hsl(var(--chart-12))",
    },
  } satisfies ChartConfig;

  const newData = Object.values(
    dataSource.reduce((acc: any, data) => {
      const reg = data.month;

      if (!acc[reg]) {
        acc[reg] = {
          month: reg,
          kilometers: 0,
          fuel_in_liters: 0,
          fuel_amount: 0,
          toll_amount: 0,
          maintainance_amount: 0,
        };
      }

      acc[reg].kilometers += data.kilometers || 0;
      acc[reg].fuel_in_liters += data.fuel_in_liters || 0;
      acc[reg].fuel_amount += data.fuel_amount || 0;
      acc[reg].toll_amount += data.toll_amount || 0;
      acc[reg].maintainance_amount += data.maintainance_amount || 0;

      return acc;
    }, {})
  );

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <VehicleUsageBars chartData={dataSource} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KilometersByMonth
          chartData={newData as unknown as any[]}
          chartConfig={chartConfig}
        />
        <FuelAmountByMonth
          chartData={newData as unknown as any[]}
          chartConfig={chartConfig}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FuelByMonth
          chartData={newData as unknown as any[]}
          chartConfig={chartConfig}
        />
        <TollAmountByMonth
          chartData={newData as unknown as any[]}
          chartConfig={chartConfig}
        />
        <MaintainanceAmountByMonth
          chartData={newData as unknown as any[]}
          chartConfig={chartConfig}
        />
      </div>
    </div>
  );
}
