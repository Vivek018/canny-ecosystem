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

    const epfRegister = employeeIds;

    return json({ epfRegister });
}

export default function DownloadRoute() {
    const { epfRegister } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const hasDownloaded = useRef(false);

    // preparing data according to epfRegister format
    const data = (epfRegister ?? []).map(() => ({
        employee_name: "Sahil",
        employee_code: "123",
        pf_number: "123",
        date:"04-02-2025",
        basic_salary:"123",
        employee_contribution:"123",
        employer_contribution:"123",
        total_contribution:"123",
        admin_charges:"123",
        edli_contribution:"123",
        payment_date:"123",
        challan_number:"123",
        remarks:""
    }));

    useEffect(() => {
        if (hasDownloaded.current) return;

        hasDownloaded.current = true;

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", `EPF Register - ${formatDateTime(Date.now())}`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        navigate(-1);
    }, []);

    return null;
}