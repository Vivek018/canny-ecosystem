import * as XLSX from "xlsx";

import saveAs from "file-saver";
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

export const prepareEsiFormatWorkbook = async ({
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
    wages: roundToNearest(formatData?.amount),
    ip_number: formatData?.statutoryDetails?.esic_number || "",
    ip_name: `${formatData?.employees?.first_name} ${
      formatData?.employees?.middle_name || ""
    } ${formatData?.employees?.last_name}`,
    days: roundToNearest(formatData?.presentDays) || 0,
    code: "",
    last_day: "",
  }));

  const headers = [
    "IP Number",
    "IP Name",
    "No Of Days for which wages paid/payable during the month",
    "Total Monthly Wages",
    "Reason Code for Zero workings days(numeric only:provide 0 for all other reasons)",
    "Last Working Day",
  ];

  const dataRows = [headers];

  for (const emp of extractedData) {
    dataRows.push([
      emp.ip_number,
      emp.ip_name,
      emp.days,
      emp.wages,
      emp.code,
      emp.last_day,
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);

  const columnWidths = [20, 30, 30, 20, 20, 20].map((w) => ({ wch: w }));
  worksheet["!cols"] = columnWidths;

  for (let col = 0; col < headers.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ c: col, r: 0 });
    const cell = worksheet[cellAddress];
    if (cell) {
      cell.s = {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF999999" },
        },
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        border: {
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ESI Format");
  const buffer = XLSX.write(workbook, {
    bookType: "xls",
    type: "array",
    cellStyles: true,
  });

  return new Blob([buffer], { type: "application/vnd.ms-excel" });
};

export const DownloadEsiFormat = ({
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
        amount: Number(earnings),
        presentDays: emp?.present_days,
        employee_id: emp.employee?.id,
        employees: {
          company_id: emp.employee?.company_id,
          employee_code: emp.employee?.employee_code,
          first_name: emp.employee?.first_name,
          middle_name: emp.employee?.middle_name,
          last_name: emp.employee?.last_name,
        },
      };
    });
  }

  const generateEsiFormatExcel = async () => {
    const blob = await prepareEsiFormatWorkbook({
      data: transformSalaryData(data),
      supabase,
    });
    if (!blob) return;
    saveAs(blob, `Esi-Format ${formatDateTime(Date.now())}.xls`);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn("w-full flex items-center justify-start  gap-2")}
      >
        <Icon name="import" />
        <p>Download ESI Format</p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ESI Format</AlertDialogTitle>
          <AlertDialogDescription>
            Create the excell for Esi
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={generateEsiFormatExcel}
            onSelect={generateEsiFormatExcel}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
