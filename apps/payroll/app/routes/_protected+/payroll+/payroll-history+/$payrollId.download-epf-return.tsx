import {
  json,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  getEmployeeById,
  getEmployeeStatutoryDetailsById,
  getPaymentFieldById,
  getPaymentTemplateComponentById,
  getPaymentTemplateComponentIdsByPayrollIdAndEmployeeId,
  getUniqueEmployeeIdsByPayrollId,
} from "@canny_ecosystem/supabase/queries";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const payrollId = params.payrollId as string;
  const { data: employeeIds } = await getUniqueEmployeeIdsByPayrollId({
    supabase,
    payrollId,
  });

  const epfReturn = await Promise.all(
    (employeeIds ?? []).map(async (employeeId) => {
      const { data: employeeData } = await getEmployeeById({
        supabase,
        id: employeeId as string,
      });
      const { data: employeeStatutoryData } =
        await getEmployeeStatutoryDetailsById({
          supabase,
          id: employeeId as string,
        });
      const { data: payrollEntriesData } =
        await getPaymentTemplateComponentIdsByPayrollIdAndEmployeeId({
          supabase,
          employeeId: employeeId as string,
          payrollId,
        });

      const salaryDetails = {
        basicPay: 0,
        dearnessAllowance: 0,
        grossWages: 0,
      };

      await Promise.all(
        (payrollEntriesData ?? []).map(async (payrollEntry) => {
          const { data: paymentTemplateComponentData } =
            await getPaymentTemplateComponentById({
              supabase,
              id: payrollEntry.payment_template_components_id as string,
            });

          if (paymentTemplateComponentData?.target_type === "payment_field") {
            const { data: paymentFieldData } = await getPaymentFieldById({
              supabase,
              id: paymentTemplateComponentData.payment_field_id as string,
            });

            if (
              paymentTemplateComponentData.component_type !== "deduction" &&
              paymentTemplateComponentData.component_type !==
                "statutory_contribution"
            ) {
              salaryDetails.grossWages += paymentFieldData?.amount ?? 0;
            }

            if (paymentFieldData?.name === "basic pay") {
              salaryDetails.basicPay = paymentFieldData.amount ?? 0;
            } else if (
              paymentFieldData?.consider_for_epf &&
              paymentTemplateComponentData.component_type !== "deduction" &&
              paymentTemplateComponentData.component_type !==
                "statutory_contribution"
            ) {
              salaryDetails.dearnessAllowance += paymentFieldData.amount ?? 0;
            }
          }
        }),
      );

      return {
        employeeData,
        employeeStatutoryData,
        salaryDetails,
      };
    }),
  );

  return json({ epfReturn });
}

export default function DownloadRoute() {
  const { epfReturn } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (navigation.state === "idle" && !hasDownloaded.current) {
      hasDownloaded.current = true;

      let formattedData = "";

      epfReturn.map((data) => {
        const epfWages =
          data.salaryDetails.basicPay + data.salaryDetails.dearnessAllowance;
        const str = `${data?.employeeStatutoryData?.uan_number}#~#${data?.employeeData?.employee_code}#~#${data.salaryDetails.grossWages}#~#${epfWages}#~#${Math.min(15000, epfWages)}#~#${0.005 * Math.min(15000, epfWages)}#~#${0.12 * epfWages}#~#${0.833 * epfWages}#~#${0.367 * epfWages}#~#${0}#~#${0}\n`;
        formattedData += str;
      });

      // Create and trigger download
      const blob = new Blob([formattedData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EPF Return - ${formatDateTime(Date.now())}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      navigate(-1);
    }
  }, []);

  return null;
}
