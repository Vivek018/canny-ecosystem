import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from '@canny_ecosystem/supabase/server';
import {
    getEmployeeById,
    getEmployeeStatutoryDetailsById,
    getPaymentFieldById,
    getPaymentTemplateComponentById,
    getPaymentTemplateComponentIdsByPayrollIdAndEmployeeId,
    getUniqueEmployeeIdsByPayrollId
} from '@canny_ecosystem/supabase/queries';
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const payrollId = params.payrollId as string;
    const { data: employeeIds } = await getUniqueEmployeeIdsByPayrollId({ supabase, payrollId });

    const esiReturn = await Promise.all(
        (employeeIds ?? []).map(async (employeeId) => {
            const { data: employeeData } = await getEmployeeById({ supabase, id: employeeId as string });
            const { data: employeeStatutoryData } = await getEmployeeStatutoryDetailsById({ supabase, id: employeeId as string });
            const { data: payrollEntriesData } = await getPaymentTemplateComponentIdsByPayrollIdAndEmployeeId({ supabase, employeeId:employeeId as string, payrollId });

            const salaryDetails = {
                basicPay: 0,
                dearnessAllowance: 0,
                grossWages: 0
            };

            await Promise.all(
                (payrollEntriesData ?? []).map(async (payrollEntry) => {
                    const { data: paymentTemplateComponentData } = await getPaymentTemplateComponentById({
                        supabase,
                        id: payrollEntry.payment_template_components_id as string
                    });

                    if (paymentTemplateComponentData?.target_type === "payment_field") {
                        const { data: paymentFieldData } = await getPaymentFieldById({
                            supabase,
                            id: paymentTemplateComponentData.payment_field_id as string
                        });

                        if (paymentTemplateComponentData.component_type !== "deduction" &&
                            paymentTemplateComponentData.component_type !== "statutory_contribution")
                            salaryDetails.grossWages += paymentFieldData?.amount ?? 0;

                        if (paymentFieldData?.name === "basic pay") {
                            salaryDetails.basicPay = paymentFieldData.amount ?? 0;
                        } else if (paymentFieldData?.consider_for_esic &&
                            (paymentTemplateComponentData.component_type !== "deduction" &&
                                paymentTemplateComponentData.component_type !== "statutory_contribution")) {
                            salaryDetails.dearnessAllowance += paymentFieldData.amount ?? 0;
                        }
                    }
                })
            );

            return {
                employeeData,
                employeeStatutoryData,
                salaryDetails,
            };
        })
    );

    return json({ esiReturn });
}

export default function DownloadRoute() {
    const { esiReturn } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const hasDownloaded = useRef(false);

    const data = (esiReturn ?? []).map((esiData) => ({
        esi_number: esiData.employeeStatutoryData?.esic_number,
        name: `${esiData?.employeeData?.first_name} ${esiData?.employeeData?.middle_name} ${esiData?.employeeData?.last_name}`,
        presentDays: 0,
        total_monthly_wages: esiData.salaryDetails.basicPay + esiData.salaryDetails.dearnessAllowance,
        reason_code: 0,
        last_working_day: 0
    }));

    useEffect(() => {
        if (hasDownloaded.current) return;

        hasDownloaded.current = true;

        const csv = Papa.unparse(data);
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