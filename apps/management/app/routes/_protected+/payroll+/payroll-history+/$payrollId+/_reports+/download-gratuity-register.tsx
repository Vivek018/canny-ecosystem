import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const payrollId = params.payrollId as string;

  return json({ gratuityRegister: [] });
}

export default function DownloadRoute() {
  const { gratuityRegister } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  const data = (gratuityRegister ?? []).map(() => ({
    employee_name: "Chris",
    employee_code: "123",
    department: "123",
    date_of_joining: "3",
    date_of_exit: "342",
    total_years_of_service: "1",
    last_drawn_salary: "3",
    grauity_amount_payable: "342",
    mode_of_payment: "324",
    date_of_payment: "34",
    tds_deducted: "3",
    net_gratuity_paid: "4",
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
      `Gratuity Register - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigate(-1);
  }, []);

  return null;
}
