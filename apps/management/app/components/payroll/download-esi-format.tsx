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
import { formatDateTime } from "@canny_ecosystem/utils";
import type {
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSupabase } from "@canny_ecosystem/supabase/client";
const data = [
  {
    ip_number: "2017702958",
    ip_name: "Rakesh Kumar",
    days: 30,
    wages: 19500,
    code: 0,
    last_day: null,
  },
  {
    ip_number: "2017702971",
    ip_name: "Deepak Singh",
    days: 30,
    wages: 19800,
    code: 0,
    last_day: null,
  },
  {
    ip_number: "2017703002",
    ip_name: "Ajay Narang",
    days: 29,
    wages: 15113,
    code: 0,
    last_day: null,
  },
  {
    ip_number: "2017702959",
    ip_name: "Prem Prakash",
    days: 30,
    wages: 18000,
    code: 0,
    last_day: null,
  },
  {
    ip_number: "2017702972",
    ip_name: "Deepak",
    days: 30,
    wages: 18000,
    code: 0,
    last_day: null,
  },
  {
    ip_number: "2017703003",
    ip_name: "Rajnish Singh",
    days: 30,
    wages: 16000,
    code: 0,
    last_day: null,
  },
  {
    ip_number: "2017702961",
    ip_name: "Dilawar Singh",
    days: 0,
    wages: 0,
    code: 2,
    last_day: "31-08-2021",
  },
  {
    ip_number: "2017703008",
    ip_name: "Sonu",
    days: 0,
    wages: 0,
    code: 1,
    last_day: null,
  },
];

export const prepareEsiFormatWorkbook = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bank Advice");

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
  for (const emp of data) {
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

export const DownloadEsiFormat = ({ env }: { env: SupabaseEnv }) => {
  const { supabase } = useSupabase({ env });

  const generateEsiFormatExcel = async () => {
    const workbook = await prepareEsiFormatWorkbook();
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
