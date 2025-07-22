import Papa from "papaparse";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime, roundToNearest } from "@canny_ecosystem/utils";
import type {
  SupabaseEnv,
  TypedSupabaseClient,
} from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getEmployeeStatutoryDetailsById } from "@canny_ecosystem/supabase/queries";

export const prepareEpfFormat = async ({
  data,
  supabase,
}: {
  data: any[];
  supabase: TypedSupabaseClient;
}) => {
  const statutoryDetailsResults = await Promise.all(
    data.map(({ employee_id }) =>
      getEmployeeStatutoryDetailsById({ id: employee_id, supabase })
    )
  );

  const updatedData = data.map((entry, index) => ({
    ...entry,
    statutoryDetails: statutoryDetailsResults[index]?.data || null,
  }));

  const extractedData = updatedData.map((formatData) => ({
    uan_number: formatData?.statutoryDetails?.uan_number || null,
    name:
      `${formatData?.employees?.first_name} ${
        formatData?.employees?.middle_name || ""
      } ${formatData?.employees?.last_name}` || null,
    gross_wages: formatData?.amount,
    epf_wages: formatData?.amount > 15000 ? 15000 : formatData?.amount,
    eps_wages: formatData?.amount > 15000 ? 15000 : formatData?.amount,
    edli_wages: formatData?.amount > 15000 ? 15000 : formatData?.amount,
    epf_contribution: roundToNearest(
      Number((formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.12)
    ),
    eps_contribution: roundToNearest(
      Number((formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.0833)
    ),
    diffEpf_Eps:
      roundToNearest(
        Number(formatData?.amount > 15000 ? 15000 : formatData?.amount * 0.12)
      ) -
      roundToNearest(
        Number(
          (formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.0833
        )
      ),
    ncp_days:
      formatData.absentDays ??
      Number(formatData.workingDays) - Number(formatData.presentDays) ??
      0,
    refund: 0,
  }));

  return await extractedData;
};
export const DownloadEpfFormat = ({
  env,
  data,
}: {
  env: SupabaseEnv;
  data: any[];
}) => {
  const { supabase } = useSupabase({ env });

  function transformSalaryData(data: any[]) {
    return data.map((emp: any) => {
      const earnings = emp.salary_entries.salary_field_values
        .filter(
          (e: {
            amount: number;
            payroll_fields: { type: string; name: string };
          }) => e.payroll_fields.type === "earning"
        )
        .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

      return {
        amount: earnings,
        presentDays: emp?.present_days ?? null,
        workingDays: emp?.working_days ?? null,
        absentDays: emp?.absent_days ?? null,
        employee_id: emp?.employee?.id,
        employees: {
          employee_code: emp.employee?.employee_code,
          first_name: emp.employee?.first_name,
          middle_name: emp.employee?.middle_name,
          last_name: emp.employee?.last_name,
        },
      };
    });
  }

  const generateEpfFormat = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const transformedData = transformSalaryData(data);

    const epfData = await prepareEpfFormat({ data: transformedData, supabase });

    const csv = Papa.unparse(epfData, { header: false }).replaceAll(",", "#~#");

    const blob = new Blob([csv], { type: "text" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `Epf-Format - ${formatDateTime(Date.now())}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn("w-full flex justify-start items-center gap-2")}
      >
        <Icon name="import" />
        <p>Download Epf Format</p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Epf Format</AlertDialogTitle>
          <AlertDialogDescription>
            Create the csv for Epf
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={generateEpfFormat}
            onSelect={generateEpfFormat}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
