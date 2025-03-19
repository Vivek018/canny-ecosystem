import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const payrollId = params.payrollId as string;
  

  return json({ dispensary: [] });
}

export default function DownloadRoute() {
  const { dispensary } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  const data = (dispensary ?? []).map((dispensaryEntry, index) => ({
    sr_no: index + 1,
    date: "123",
    name_of_employee: "Chris",
    age: "123",
    residence: "Chicago",
    disease: "123",
    treatement: "123",
    cash: "123",
    credit: "123",
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

    link.setAttribute("download", `Dispensary - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigate(-1);
  }, []);

  return null;
}
