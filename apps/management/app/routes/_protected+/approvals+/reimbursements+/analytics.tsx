import { ReimbursementPerEmployer } from "@/components/reimbursements/analytics/reimbursement-per-employer";
import { ReimbursementByTime } from "@/components/reimbursements/analytics/reimbursement-by-time";
import { ReimbursementTopEmployees } from "@/components/reimbursements/analytics/reimbursement-top-employees";
import { ReimbursementTrend } from "@/components/reimbursements/analytics/reimbursement-trend";
import { useReimbursementStore } from "@/store/reimbursements";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";
import { ReimbursementByType } from "@/components/reimbursements/analytics/reimbursement-by-type";

const getDataSource = (
  selectedRows: ReimbursementDataType[],
  storedValue: ReimbursementDataType[],
) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export default function ReimbursementAnalytics() {
  const { selectedRows } = useReimbursementStore();
  const [storedValue, setValue] = useLocalStorage<ReimbursementDataType[]>(
    "analyticsArray",
    [],
  );

  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: ReimbursementDataType[] = getDataSource(
    selectedRows,
    storedValue,
  );

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <ReimbursementTrend chartData={dataSource} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ReimbursementByType chartData={dataSource} />
        <ReimbursementByTime chartData={dataSource} />
        <ReimbursementPerEmployer chartData={dataSource} />
      </div>

      <div className="col-span-1">
        <ReimbursementTopEmployees chartData={dataSource} />
      </div>
    </div>
  );
}
