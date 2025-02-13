import { ExitByReasons } from "@/components/exits/analytics/exit-by-reasons";
import { ExitByTime } from "@/components/exits/analytics/exit-by-time";
import { ExitPaymentByTime } from "@/components/exits/analytics/exit-payment-by-time";
import { ExitTopPayment } from "@/components/exits/analytics/exit-top-payment";
import { ExitTrend } from "@/components/exits/analytics/exit-trend";
import { useExitsStore } from "@/store/exits";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";

const getDataSource = (selectedRows: ExitDataType[], storedValue: ExitDataType[]) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export default function ExitAnalytics() {
  const { selectedRows } = useExitsStore();
  const [storedValue, setValue] = useLocalStorage<ExitDataType[]>("analyticsArray", []);

  useEffect(() => {
    if (selectedRows.length > 0) setValue(selectedRows);
  }, [selectedRows, setValue]);

  const dataSource: ExitDataType[] = getDataSource(selectedRows, storedValue);

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <ExitTrend chartData={dataSource} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ExitPaymentByTime chartData={dataSource} />
        <ExitByTime chartData={dataSource} />
        <ExitByReasons chartData={dataSource} />
      </div>
      <div><ExitTopPayment chartData={dataSource} /></div>
    </div>
  );
}
