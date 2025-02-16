import { getProjectNamesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";
import { useAttendanceStore } from "@/store/attendance";
import { AttendanceTrend } from "@/components/attendance/analytics/attendance-trend";
import { AttendanceBars } from "@/components/attendance/analytics/attendance-bar";
import type { TransformedAteendanceDataType } from "./_index";

import { AttendanceAbsentees } from "@/components/attendance/analytics/attendance-absents";
import { AttendanceByProjects } from "@/components/attendance/analytics/attendance-project";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useLoaderData } from "@remix-run/react";
import { AttendanceByProjectSite } from "@/components/attendance/analytics/attendance-project-site";

const getDataSource = (
  selectedRows: TransformedAteendanceDataType[],
  storedValue: TransformedAteendanceDataType[],
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
    TransformedAteendanceDataType[]
  >("analyticsArray", []);

  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: TransformedAteendanceDataType[] = getDataSource(
    selectedRows,
    storedValue,
  );

  const transformedData = dataSource.map((entry) => ({
    id: entry.employee_id,
    employee_code: entry.employee_code,
    employeeName: entry.employee_name,
    projectName: entry.project,
    projectSiteName: entry.project_site,
    attendance: Object.entries(entry)
      .filter(([key]) => key.match(/^\d{2} \w{3} \d{4}$/))
      .map(([date, status]) => {
        const isPresent = status === "P";
        const isWeeklyOff = status === "(WOF)";
        const isLeave = status === "L";

        return {
          date,
          no_of_hours: isPresent ? 8 : 0,
          present: isPresent,
          holiday: isWeeklyOff || isLeave,
          working_shift: "",
          holiday_type: isWeeklyOff ? "weekly" : isLeave ? "paid" : "",
        };
      }),
  }));

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <AttendanceTrend
            chartData={
              transformedData as unknown as TransformedAteendanceDataType[]
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AttendanceByProjects
          chartData={
            transformedData as unknown as TransformedAteendanceDataType[]
          }
        />
        <AttendanceByProjectSite
          chartData={transformedData as any}
          projectArray={projectArray}
        />

        <AttendanceAbsentees
          chartData={
            transformedData as unknown as TransformedAteendanceDataType[]
          }
        />
      </div>

      <div className="col-span-1">
        <AttendanceBars
          chartData={
            transformedData as unknown as TransformedAteendanceDataType[]
          }
        />
      </div>
    </div>
  );
}
