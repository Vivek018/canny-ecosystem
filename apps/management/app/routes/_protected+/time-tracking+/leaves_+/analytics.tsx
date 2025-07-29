import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";

import { useLeavesStore } from "@/store/leaves";
import { LeavesTrend } from "@/components/leaves/analytics/leaves-trend";
import { LeavesBars } from "@/components/leaves/analytics/leaves-bar";
import { LeavesByleaveType } from "@/components/leaves/analytics/leaves-by-leave-type";
import { LeavesByTime } from "@/components/leaves/analytics/leaves-by-time";
import { LeavesPerEmployer } from "@/components/leaves/analytics/leaves-per-employer";

const getDataSource = (
  selectedRows: LeavesDataType[],
  storedValue: LeavesDataType[],
) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export default function LeavesAnalytics() {
  const { selectedRows } = useLeavesStore();
  const [storedValue, setValue] = useLocalStorage<LeavesDataType[]>(
    "analyticsArray",
    [],
  );

  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: LeavesDataType[] = getDataSource(selectedRows, storedValue);
  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <LeavesTrend chartData={dataSource} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <LeavesByleaveType chartData={dataSource} />
        <LeavesByTime chartData={dataSource} />

        <LeavesPerEmployer chartData={dataSource} />
      </div>

      <div className="col-span-1">
        <LeavesBars chartData={dataSource} />
      </div>
    </div>
  );
}
