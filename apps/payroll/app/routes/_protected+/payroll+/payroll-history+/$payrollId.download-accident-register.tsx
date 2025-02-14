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

    const accidentRegister = employeeIds; 

    return json({ accidentRegister });
}

export default function DownloadRoute() {
    const { accidentRegister } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const hasDownloaded = useRef(false);

    const data = (accidentRegister ?? []).map(() => ({
        date: "342",
        name_of_injured_person: "ddf",
        employee_code: "3",
        department: "34",
        loaction: "Chicago",
        nature_of_injury: "4",
        cause_of_accident: "42",
        type_of_accident: "2",
        severity: "major",
        medical_treatement: "342",
        days_lost: "42",
        compensation_paid: "432",
        investigation_details: "NIL",
        corrective_actions: "fsd",
        reported_by_authorities: "zc",
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

        link.setAttribute("download", `Accident Register - ${formatDateTime(Date.now())}`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        navigate(-1);
    }, []);

    return null;
}