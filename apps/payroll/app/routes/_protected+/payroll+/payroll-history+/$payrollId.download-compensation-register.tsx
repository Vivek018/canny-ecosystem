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

  const compensationRegister = employeeIds;

  return json({ compensationRegister });
}

export default function DownloadRoute() {
  const { compensationRegister } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  const data = (compensationRegister ?? []).map(() => ({
    employee_name: "John",
    employee_code: "123",
    department: "IT",
    date_of_accident: "123",
    nature_of_injury: "123",
    cause_of_accident: "124",
    type_of_compensation: "123",
    amount_paid: "123",
    mode_of_payment: "123",
    date_of_payment: "123",
    medical_expense: "123",
    disability_type: "123",
    death: "No",
    dependents_details: "123",
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
      `Compensation Register - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigate(-1);
  }, []);

  return null;
}
