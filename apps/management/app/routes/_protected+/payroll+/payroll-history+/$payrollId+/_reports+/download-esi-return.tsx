import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  getEmployeeById,
  getEmployeeStatutoryDetailsById,
  getPaymentFieldById,
  getPaymentTemplateComponentById,
} from "@canny_ecosystem/supabase/queries";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const payrollId = params.payrollId as string;
  

  return json({ esiReturn: [] });
}

export default function DownloadRoute() {
  const { esiReturn } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  // const data = (esiReturn ?? []).map((esiData) => ({
  //   esi_number: esiData.employeeStatutoryData?.esic_number,
  //   name: `${esiData?.employeeData?.first_name} ${esiData?.employeeData?.middle_name} ${esiData?.employeeData?.last_name}`,
  //   presentDays: 0,
  //   total_monthly_wages:
  //     esiData.salaryDetails.basicPay + esiData.salaryDetails.dearnessAllowance,
  //   reason_code: 0,
  //   last_working_day: 0,
  // }));

  useEffect(() => {
    if (hasDownloaded.current) return;

    hasDownloaded.current = true;

    // const csv = Papa.unparse(data);
    const csv = Papa.unparse([]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute("download", `ESI Return - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigate(-1);
  }, []);

  return null;
}
