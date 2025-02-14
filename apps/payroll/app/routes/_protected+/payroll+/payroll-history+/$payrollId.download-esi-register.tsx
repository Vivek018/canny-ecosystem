import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from '@canny_ecosystem/supabase/server';
import {getUniqueEmployeeIdsByPayrollId} from '@canny_ecosystem/supabase/queries';
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const payrollId = params.payrollId as string;
    const { data: employeeIds } = await getUniqueEmployeeIdsByPayrollId({ supabase, payrollId });

    const esiRegister = employeeIds;

    return json({ esiRegister });
}

export default function DownloadRoute() {
    const { esiRegister } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const hasDownloaded = useRef(false);

    // preparing data according to esiRegister format
    const data = (esiRegister ?? []).map(() => ({
        employee_name: "sahil",
        employee_code: "123",
        esi_number: "123",
        date: "Jan 2024",
        gross_wages: "20000",
        employee_contribution: "123",
        employer_contribution: "123",
        total_contribution: "123",
        payment_date: "15-Feb-2023",
        challan_number: "123",
        remarks: ""
    }));

    useEffect(() => {
        if (hasDownloaded.current) return;

        hasDownloaded.current = true;

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", `ESI Register - ${formatDateTime(Date.now())}`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        navigate(-1);
    }, []);

    return null;
}