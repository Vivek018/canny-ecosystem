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
import {
  formatDate,
  formatDateTime,
  roundToNearest,
} from "@canny_ecosystem/utils";
import type {
  SupabaseEnv,
  TypedSupabaseClient,
} from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getEmployeeBankDetailsById } from "@canny_ecosystem/supabase/queries";
import { CANNY_MANAGEMENT_SERVICES_ACCOUNT_NUMBER } from "@/constant";

export const prepareBankAdviceWorkbook = async ({
  data,
  supabase,
}: {
  data: any[];
  supabase: TypedSupabaseClient;
}) => {
  const date = new Date();
  const bankDetailsResults = await Promise.all(
    data.map(({ employee_id }) =>
      getEmployeeBankDetailsById({ id: employee_id, supabase }),
    ),
  );
  const dateToBeSent = formatDate(date)
    ?.toString()!
    .replace(/([A-Za-z]{3})/, (match: any) => match.toUpperCase())
    .replaceAll(" ", "-");

  const updatedData = data.map((entry, index) => ({
    ...entry,
    bankDetails: bankDetailsResults[index]?.data || null,
  }));

  const extractedData = updatedData.map(({ amount, bankDetails }) => ({
    amount,
    account_holder_name: bankDetails?.account_holder_name || "",
    account_number: bankDetails?.account_number || "",
    ifsc_code: bankDetails?.ifsc_code || "",
  }));

  function isIciciBankIfsc(ifsc: string | null | undefined): boolean {
    if (!ifsc) return false;
    return ifsc.toUpperCase().startsWith("ICIC");
  }

  const headers = [
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
  ];

  const dataRows = [headers];

  for (const emp of extractedData) {
    dataRows.push([
      CANNY_MANAGEMENT_SERVICES_ACCOUNT_NUMBER,
      emp.account_number,
      emp.account_holder_name,
      roundToNearest(Number(emp.amount)).toFixed(2),
      isIciciBankIfsc(emp.ifsc_code) ? "I" : "N",
      dateToBeSent,
      emp.ifsc_code,
      "",
      "",
      "",
      "cannycms@gmail.com",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Salary Payment",
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);

  const columnWidths = [
    20, 20, 40, 15, 20, 20, 25, 15, 15, 15, 35, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 40,
  ].map((w) => ({ wch: w }));
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
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Advice");
  const buffer = XLSX.write(workbook, {
    bookType: "xls",
    type: "array",
    cellStyles: true,
  });
  return new Blob([buffer], { type: "application/vnd.ms-excel" });
};

export const DownloadBankAdvice = ({
  env,
  data,
}: {
  env: SupabaseEnv;
  data: any[];
}) => {
  const { supabase } = useSupabase({ env });

  function transformSalaryData(data: any[]) {
    return data.map((emp) => {
      let earnings = 0;
      let deductions = 0;
      for (const entry of emp.salary_entries.salary_field_values) {
        if (entry.payroll_fields.type === "earning") earnings += entry.amount;
        else if (entry.payroll_fields.type === "deduction")
          deductions += entry.amount;
      }
      return {
        amount: earnings - deductions,
        employee_id: emp.employee?.id,
        employees: {
          employee_code: emp.employee?.employee_code,
          first_name: emp.employee?.first_name,
          middle_name: emp.employee?.middle_name,
          last_name: emp.employee?.last_name,
        },
      };
    });
  }

  const generateBankAdviceExcel = async (selectedRows: any[]) => {
    if (!selectedRows.length) return;
    const blob = await prepareBankAdviceWorkbook({
      data: transformSalaryData(data),
      supabase,
    });
    if (!blob) return;
    saveAs(blob, `Bank-Advice ${formatDateTime(Date.now())}.xls`);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn("w-full flex items-center justify-start gap-2")}
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
