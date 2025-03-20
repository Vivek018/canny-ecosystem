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
} from "@canny_ecosystem/supabase/queries";
import { useEffect, useRef } from "react";
import { formatDateTime } from "@canny_ecosystem/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const payrollId = params.payrollId as string;


  return json({ epfReturn: [] });
}

export default function DownloadRoute() {
  const { epfReturn } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const navigate = useNavigate();
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (navigation.state === "idle" && !hasDownloaded.current) {
      hasDownloaded.current = true;

      const formattedData = "";

      // epfReturn?.map((data) => {
      //   const epfWages =
      //     data.salaryDetails.basicPay + data.salaryDetails.dearnessAllowance;
      //   const str = `${data?.employeeStatutoryData?.uan_number}#~#${data?.employeeData?.employee_code}#~#${data.salaryDetails.grossWages}#~#${epfWages}#~#${Math.min(15000, epfWages)}#~#${0.005 * Math.min(15000, epfWages)}#~#${0.12 * epfWages}#~#${0.833 * epfWages}#~#${0.367 * epfWages}#~#${0}#~#${0}\n`;
      //   formattedData += str;
      // });

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
