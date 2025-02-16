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

  const wagesRegister = employeeIds;

  return json({ wagesRegister });
}

export default function DownloadRoute() {
  const { wagesRegister } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  const data = (wagesRegister ?? []).map(() => ({
    employee_name: "ihae",
    employee_code: "123",
    department: "123",
    date: "31",
    present_days: "43",
    basic_salary: "34",
    overtime_hours: "342",
    overtime_wages: "34",
    allowances: "3",
    gross_wages: "43",
    deductions: "3",
    net_wages: "432",
    mode_of_payment: "2",
    date_of_payment: "43",
    leaves_taken: "4",
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
      `Wages Register - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigate(-1);
  }, []);

  return null;
}
