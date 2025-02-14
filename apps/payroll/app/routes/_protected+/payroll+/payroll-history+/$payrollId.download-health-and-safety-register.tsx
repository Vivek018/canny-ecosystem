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

    const healthAndSafetyRegister = employeeIds; // map on employeeIds to get healthAndSafetyRegister

    return json({ healthAndSafetyRegister });
}

export default function DownloadRoute() {
    const { healthAndSafetyRegister } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const hasDownloaded = useRef(false);

    const data = (healthAndSafetyRegister ?? []).map(() => ({
        date_of_inspection: "34",
        department: "342",
        inspector_name: "34",
        type_of_inspection: "2",
        hazards_indentified: "34",
        risk_level: "342",
        corrective_actions_taken: "34",
        responsible_person: "32",
        status_of_action: "3",
        employee_health_monitoring: "3",
        ppe_provided: "3",
        training_conducted: "43",
        follow_up_date: "423",
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

        link.setAttribute("download", `Health & Safety Register - ${formatDateTime(Date.now())}`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        navigate(-1);
    }, []);

    return null;
}