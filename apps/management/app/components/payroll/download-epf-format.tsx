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
  EmployeeProvidentFundDatabaseRow,
  SupabaseEnv,
  TypedSupabaseClient,
} from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getEmployeeStatutoryDetailsById } from "@canny_ecosystem/supabase/queries";

export const prepareEpfFormat = async ({
  data,
  supabase,
  isRestricted,
}: {
  data: any[];
  supabase: TypedSupabaseClient;
  isRestricted: boolean;
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

  const extractedData = updatedData.map((formatData) => {
    const baseAmount = Number(formatData?.amount) || 0;
    const restrictedAmount = isRestricted
      ? baseAmount > 15000
        ? 15000
        : baseAmount
      : baseAmount;
      
    const cappedAmount = baseAmount > 15000 ? 15000 : baseAmount;

    const epfContribution = roundToNearest(restrictedAmount * 0.12);
    const epsContribution = roundToNearest(cappedAmount * 0.0833);
    const diffEpf_Eps = epfContribution - epsContribution;

    return {
      uan_number: formatData?.statutoryDetails?.uan_number || null,
      name:
        `${formatData?.employees?.first_name} ${
          formatData?.employees?.middle_name || ""
        } ${formatData?.employees?.last_name}`.trim() || null,
      gross_wages: formatData?.gross,
      epf_wages: restrictedAmount,
      eps_wages: cappedAmount,
      edli_wages: cappedAmount,
      epf_contribution: epfContribution,
      eps_contribution: epsContribution,
      diffEpf_Eps: diffEpf_Eps,
      ncp_days:
        formatData.absentDays ??
        Number(formatData.workingDays) - Number(formatData.presentDays),
      refund: 0,
    };
  });

  return await extractedData;
};
export const DownloadEpfFormat = ({
  env,
  data,
  epfData: epfRules,
}: {
  env: SupabaseEnv;
  data: any[];
  epfData: EmployeeProvidentFundDatabaseRow;
}) => {
  const { supabase } = useSupabase({ env });

  function transformSalaryData(data: any[], epfRules: any) {
    const fieldsStr = epfRules?.terms?.fields?.trim().toUpperCase();

    const allowedFields =
      fieldsStr && fieldsStr !== "ALL"
        ? fieldsStr.split(",").map((f: string) => f.trim().toUpperCase())
        : null;

    return data.map((emp: any) => {
      const gross = emp.salary_entries.salary_field_values
        .filter(
          (e: {
            amount: number;
            payroll_fields: { type: string; name: string };
          }) => e.payroll_fields.type === "earning"
        )
        .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

      const earnings = emp.salary_entries.salary_field_values
        .filter(
          (e: {
            amount: number;
            payroll_fields: { type: string; name: string };
          }) =>
            e.payroll_fields.type === "earning" &&
            (allowedFields === null ||
              allowedFields.includes(e.payroll_fields.name.toUpperCase()))
        )
        .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

      return {
        amount: earnings,
        gross: gross,
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

    const transformedData = transformSalaryData(data, epfRules);

    const epfData = await prepareEpfFormat({
      data: transformedData,
      supabase,
      isRestricted: epfRules?.restrict_employee_contribution!,
    });

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