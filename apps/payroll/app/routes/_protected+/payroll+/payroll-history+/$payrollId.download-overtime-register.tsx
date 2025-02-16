import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getUniqueEmployeeIdsByPayrollId } from "@canny_ecosystem/supabase/queries";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const payrollId = params.payrollId as string;
  const { data: employeeIds } = await getUniqueEmployeeIdsByPayrollId({
    supabase,
    payrollId,
  });

  const overtimeRegister = employeeIds;

  return json({ overtimeRegister });
}

export default function DownloadRoute() {
  const { overtimeRegister } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  const data = (overtimeRegister ?? []).map(() => ({
    employee_name: "Chris",
    employee_code: "231",
    department: "IT",
    date: "34",
    date_of_overtime: "34",
    normal_working_hours: "3",
    total_hours_worked: "3",
    overtime_hours: "34",
    overtime_rate_per_hour: "342",
    overtime_wages: "34",
    reason_for_overtime: "34",
    mode_of_payment: "34",
    date_of_payment: "34",
    remarks: "",
  }));

  useEffect(() => {
    if (hasDownloaded.current) return;

    hasDownloaded.current = true;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute(
      "download",
      `Overtime Register - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigate(-1);
  }, []);

  return null;
}
