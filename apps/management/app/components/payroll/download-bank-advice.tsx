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
import { formatDate, formatDateTime } from "@canny_ecosystem/utils";
import type {
  PayrollDatabaseRow,
  SupabaseEnv,
  TypedSupabaseClient,
} from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  getEmployeeBankDetailsById,
  type PayrollEntriesWithEmployee,
} from "@canny_ecosystem/supabase/queries";

export const prepareBankAdviceWorkbook = async ({
  data,
  supabase,
  payrollType,
}: {
  data: any[];
  supabase: TypedSupabaseClient;
  payrollType: string;
}) => {
  const date = new Date();
  const bankDetailsResults = await Promise.all(
    data.map(({ employee_id }) =>
      getEmployeeBankDetailsById({ id: employee_id, supabase })
    )
  );

  const updatedData = data.map((entry, index) => ({
    ...entry,
    bankDetails: bankDetailsResults[index]?.data || null,
  }));

  const extractedData = updatedData.map(({ amount, bankDetails }) => ({
    amount,
    account_holder_name: bankDetails?.account_holder_name || null,
    account_number: bankDetails?.account_number || null,
    ifsc_code: bankDetails?.ifsc_code || null,
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bank Advice");

  const headerRow = worksheet.addRow([
    "Debit A/c Number",
    "Beneficiary A/c Number",
    "Beneficiary Name",
    "Amount",
    "Payment Type (Mandatory for all types of payments)",
    "Payment Date",
    "IFSC Code",
    "Payable Location",
    "Print Location",
    "Beneficiary Mobile No.",
    "Beneficiary email-id",
    "Bene Address 1",
    "Bene Address 2",
    "Bene Address 3",
    "Bene Address 4",
    "Add detail 1",
    "Add detail 2",
    "Add detail 3",
    "Add detail 4",
    "Add detail 5",
    "Remarks",
  ]);

  for (let col = 1; col <= 21; col++) {
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF999999" },
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
  const columnWidths = [
    20, 20, 30, 15, 20, 20, 25, 15, 15, 15, 35, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 40,
  ];

  for (let col = 0; col < columnWidths.length; col++) {
    worksheet.getColumn(col + 1).width = columnWidths[col];
  }
  for (const emp of extractedData) {
    const row = [
      "182628991917",
      emp.account_number || null,
      emp.account_holder_name || null,
      emp.amount || null,
      "Online",
      `${formatDate(date)}`.replaceAll(" ", "-"),
      emp.ifsc_code || null,
      null,
      null,
      null,
      "canny.canny@gmail.com",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      `${payrollType.charAt(0).toUpperCase() + payrollType.slice(1)} payment`,
    ];
    const newRow = worksheet.addRow(row);

    for (let i = 4; i < newRow.cellCount - 1; i++) {
      const cell = newRow.getCell(i + 1);

      cell.alignment = { horizontal: "center" };
    }
  }

  return await workbook.xlsx.writeBuffer();
};

export const DownloadBankAdvice = ({
  env,
  data,
  payrollData,
}: {
  env: SupabaseEnv;
  data: PayrollEntriesWithEmployee[];
  payrollData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">;
}) => {
  const { supabase } = useSupabase({ env });

  const generateBankAdviceExcel = async (selectedRows: any[]) => {
    if (!selectedRows.length) return;

    const workbook = await prepareBankAdviceWorkbook({
      data,
      supabase,
      payrollType: payrollData.payroll_type,
    });
    if (!workbook) return;
    saveAs(
      new Blob([workbook], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Bank-Advice ${formatDateTime(Date.now())}.xlsx`
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          "w-full flex items-center justify-start  gap-2"
        )}
      >
        <Icon name="import" />
        <p>Download Bank Advice</p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bank Advice</AlertDialogTitle>
          <AlertDialogDescription>
            Create the advice for bank
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={() => generateBankAdviceExcel(data)}
            onSelect={() => generateBankAdviceExcel(data)}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
