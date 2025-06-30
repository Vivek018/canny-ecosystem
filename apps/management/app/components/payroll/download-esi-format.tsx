import ExcelJS from "exceljs";
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
import { formatDateTime} from "@canny_ecosystem/utils";
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
    wages: formatData?.amount,
    ip_number: formatData?.statutoryDetails?.esic_number || null,
    ip_name:
      `${formatData?.employees?.first_name} ${
        formatData?.employees?.middle_name || ""
      } ${formatData?.employees?.last_name}` || null,
    days: formatData?.presentDays || 0,
    code: null,
    last_day: null,
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ESI Format");

  const headerRow = worksheet.addRow([
    "IP Number",
    "IP Name",
    "No Of Days for which wages paid/payable during the month",
    "Total Monthly Wages",
    "Reason Code for Zero workings days(numeric only:provide 0 for all other reasons)",
    "Last Working Day",
  ]);

  for (let col = 1; col <= 6; col++) {
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFBFEFFF" },
    };
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  }
  const columnWidths = [20, 30, 30, 20, 20, 20];

  for (let col = 0; col < columnWidths.length; col++) {
    worksheet.getColumn(col + 1).width = columnWidths[col];
  }
  for (const emp of extractedData) {
    const row = [
      emp.ip_number || null,
      emp.ip_name || null,
      emp.days || 0,
      emp.wages || 0,
      emp.code || null,
      emp.last_day || null,
    ];
    const newRow = worksheet.addRow(row);

    for (let i = 4; i < newRow.cellCount - 1; i++) {
      const cell = newRow.getCell(i + 1);

      cell.alignment = { horizontal: "center" };
    }
  }

  return await workbook.xlsx.writeBuffer();
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
      const earnings = emp.salary_entries
        .filter((e: { type: string }) => e.type === "earning")
        .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

      const presentDays =
        emp.salary_entries[0]?.monthly_attendance?.present_days ?? null;

      return {
        amount: Number(earnings),
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

  const generateEsiFormatExcel = async () => {
    const workbook = await prepareEsiFormatWorkbook({
      data: transformSalaryData(data),
      supabase,
    });
    if (!workbook) return;
    saveAs(
      new Blob([workbook], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Esi-Format ${formatDateTime(Date.now())}.xlsx`
    );
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
