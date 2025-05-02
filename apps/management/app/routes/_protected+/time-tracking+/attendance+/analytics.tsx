import { getProjectNamesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";
import { useAttendanceStore } from "@/store/attendance";
import { AttendanceTrend } from "@/components/attendance/analytics/attendance-trend";
import { AttendanceBars } from "@/components/attendance/analytics/attendance-bar";
import type { TransformedAttendanceDataType } from "./_index";

import { AttendanceAbsentees } from "@/components/attendance/analytics/attendance-absents";
import { AttendanceByProjects } from "@/components/attendance/analytics/attendance-project";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useLoaderData } from "@remix-run/react";
import { AttendanceByProjectSite } from "@/components/attendance/analytics/attendance-project-site";

const getDataSource = (
  selectedRows: TransformedAttendanceDataType[],
  storedValue: TransformedAttendanceDataType[]
) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: projectData } = await getProjectNamesByCompanyId({
    supabase,
    companyId,
  });

  return json({
    projectArray: projectData?.map((project) => project.name) ?? [],
  });
}

export default function AttendanceAnalytics() {
  const { projectArray } = useLoaderData<typeof loader>();
  const { selectedRows } = useAttendanceStore();
  const [storedValue, setValue] = useLocalStorage<
    TransformedAttendanceDataType[]
  >("analyticsArray", []);

  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: TransformedAttendanceDataType[] = getDataSource(
    selectedRows,
    storedValue
  );

  const transformedData: TransformedAttendanceDataType[] = dataSource.map(
    (entry) => ({
      employee_id: entry.employee_id,
      employee_code: entry.employee_code,
      employee_name: entry.employee_name,
      project: entry.project,
      project_site: entry.project_site,
      attendance: Object.entries(entry)
        .filter(([key]) => key.match(/^\d{2} \w{3} \d{4}$/))
        .map(([date, status]) => {

          const isPresent =
            typeof status === "object" &&
            status !== null &&
            "present" in status &&
            status.present === "P";
          // const isWeeklyOff = status === "(WOF)";
          // const isLeave = status === "L";

          return {
            date,
            no_of_hours: isPresent ? 8 : 0,
            present: isPresent,
            // holiday: isWeeklyOff || isLeave,
            // working_shift: "",
            // holiday_type: isWeeklyOff ? "weekly" : isLeave ? "paid" : "",
          };
        }),
    })
  );

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <AttendanceTrend chartData={transformedData} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AttendanceByProjects chartData={transformedData} />
        <AttendanceByProjectSite
          chartData={transformedData}
          projectArray={projectArray}
        />

        <AttendanceAbsentees chartData={transformedData} />
      </div>

      <div className="col-span-1">
        <AttendanceBars chartData={transformedData} />
      </div>
    </div>
  );
}
