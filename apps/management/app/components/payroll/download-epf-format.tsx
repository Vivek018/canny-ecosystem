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
import { formatDateTime } from "@canny_ecosystem/utils";
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
    epf_contribution: Number(
      (formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.12
    ).toFixed(2),
    eps_contribution: Number(
      (formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.0833
    ).toFixed(2),
    diffEpf_Eps: Number(
      (formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.12 -
        (formatData?.amount > 15000 ? 15000 : formatData?.amount) * 0.0833
    ).toFixed(2),
    ncp_days: null,
    refund: null,
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

  function transformSalaryData(data: any) {
    const earningsFields = ["BASIC", "BONUS", "HRA", "Others"];
    return data.map((emp: any) => {
      const earnings = emp.salary_entries
        .filter((e: { field_name: string; amount: number }) =>
          earningsFields.includes(e.field_name)
        )
        .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
      const presentDays =
        emp.salary_entries.length > 0
          ? emp.salary_entries[0].present_days
          : null;
      return {
        amount: earnings,
        presentDays: presentDays,
        employee_id: emp.id,
        employees: {
          company_id: emp.company_id,
          employee_code: emp.employee_code,
          first_name: emp.first_name,
          middle_name: emp.middle_name,
          last_name: emp.last_name,
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
