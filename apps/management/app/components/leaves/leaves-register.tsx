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
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  CANNY_MANAGEMENT_SERVICES_ADDRESS,
  CANNY_MANAGEMENT_SERVICES_NAME,
} from "@/constant";
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import { months } from "@canny_ecosystem/utils/constant";
import { useSearchParams } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";

export const prepareLeavesWorkbook = async ({
  selectedRows,
  companyName,
  companyAddress,
  refYear,
}: {
  selectedRows: any[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
  refYear: number;
}) => {
  const referenceYear = refYear ? refYear : new Date().getFullYear();
  const transformedLeaveData = selectedRows.reduce((acc: any, leave) => {
    const getMonthKey = (date: string | number | Date) => {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) return null;
      const monthName = parsedDate.toLocaleString("en-US", { month: "long" });
      return `${monthName.slice(0, 3)}-${parsedDate.getFullYear()}`;
    };

    const { start_date, end_date, leave_type, employees } = leave;
    const { employee_code, first_name, last_name, work_details } = employees;
    const project = work_details[0]?.sites?.projects?.name || null;
    const site = work_details[0]?.sites?.name || null;

    if (!acc[employee_code]) {
      const monthsArray = Object.entries(months)
        .sort((a, b) => a[1] - b[1])
        .map(([month]) => `${month.slice(0, 3)}-${referenceYear}`);

      acc[employee_code] = {
        employee_code,
        employee_name: `${first_name} ${last_name}`,
        project,
        site,
        ...Object.fromEntries(
          monthsArray.map((month) => [
            month,
            {
              casual_leave: 0,
              paid_leave: 0,
              unpaid_leave: 0,
              paternity_leave: 0,
              sick_leave: 0,
            },
          ])
        ),
      };
    }

    let start = new Date(start_date);
    let end = end_date ? new Date(end_date) : start;

    if (start.getFullYear() < referenceYear) {
      start = new Date(referenceYear, 0, 2);
    }
    if (end.getFullYear() > referenceYear) {
      end = new Date(referenceYear, 11, 31);
    }

    const leaveDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const monthKey = getMonthKey(end);
    if (monthKey && acc[employee_code][monthKey]) {
      acc[employee_code][monthKey][leave_type] += leaveDays;
    }

    return acc;
  }, {});

  const formattedLeaveData: any = Object.values(transformedLeaveData);

  if (!formattedLeaveData.length) return;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leaves Register");

  const exlMonths = Object.keys(formattedLeaveData[0]).filter((key) =>
    key.match(/^[A-Za-z]{3}-\d{4}$/)
  );

  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = companyName!.name!;
  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("A2:E3");
  worksheet.getCell("A2").value =
    `${companyAddress?.address_line_1}, ${companyAddress?.address_line_2}, ${companyAddress?.city}, ${companyAddress?.state} ${companyAddress?.pincode}`;
  worksheet.getCell("A2").font = { bold: false, size: 12 };
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  worksheet.mergeCells("F1:BH4");
  worksheet.getCell("F1").value = `Leaves Register for ${
    refYear ? refYear : new Date().getFullYear()
  }`;
  worksheet.getCell("F1").font = { bold: true, size: 20 };
  worksheet.getCell("F1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("BI1:BM1");
  worksheet.getCell("BI1").value = CANNY_MANAGEMENT_SERVICES_NAME;
  worksheet.getCell("BI1").font = {
    bold: true,
    size: 16,
  };
  worksheet.getCell("BI1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("BI2:BM3");
  worksheet.getCell("BI2").value = CANNY_MANAGEMENT_SERVICES_ADDRESS;
  worksheet.getCell("BI2").font = { bold: false, size: 12 };
  worksheet.getCell("BI2").alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  const fixedHeaders = ["Employee Code", "Employee Name", "Project", "Site"];
  const leaveTypes = [
    "Casual Leave",
    "Paid Leave",
    "Unpaid Leave",
    "Paternity Leave",
    "Sick Leave",
  ];

  const headerRow1 = worksheet.addRow([
    ...fixedHeaders,
    ...exlMonths.flatMap((month) => Array(5).fill(month)),
    "Total Leaves",
  ]);

  let colIndex = fixedHeaders.length + 1;
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  for (const month of exlMonths) {
    worksheet.mergeCells(5, colIndex, 5, colIndex + 4);
    colIndex += 5;
  }

  const headerRow2 = worksheet.addRow([
    ...Array(fixedHeaders.length).fill(""),
    ...exlMonths.flatMap(() => leaveTypes),
  ]);

  headerRow1.font = { bold: true, size: 12 };
  headerRow1.alignment = { horizontal: "center", vertical: "middle" };
  for (let i = 4; i <= 63; i++) {
    const cell = headerRow1.getCell(i + 1);
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  }
  headerRow2.font = { bold: true };
  headerRow2.alignment = { horizontal: "center" };

  for (const emp of formattedLeaveData) {
    const rowData = [
      emp.employee_code || "N/A",
      emp.employee_name || "N/A",
      emp.project || "N/A",
      emp.site || "N/A",
    ];

    let totalLeaves = 0;

    rowData.push(
      ...exlMonths.flatMap((month) => {
        const leaveData = emp[month] || {};
        const monthTotal =
          (leaveData.casual_leave || 0) +
          (leaveData.paid_leave || 0) +
          (leaveData.unpaid_leave || 0) +
          (leaveData.paternity_leave || 0) +
          (leaveData.sick_leave || 0);
        totalLeaves += monthTotal;
        return [
          leaveData.casual_leave || 0,
          leaveData.paid_leave || 0,
          leaveData.unpaid_leave || 0,
          leaveData.paternity_leave || 0,
          leaveData.sick_leave || 0,
        ];
      })
    );

    rowData.push(totalLeaves);
    worksheet.addRow(rowData);
  }

  for (const column of worksheet.columns) {
    column.width = 15;
  }
  return await workbook.xlsx.writeBuffer();
};

export const LeavesRegister = ({
  selectedRows,
  companyName,
  companyAddress,
}: {
  selectedRows: LeavesDataType[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) => {
  const [searchParams] = useSearchParams();
  const refYear = Number(searchParams.get("year"));

  const generateLeavesExcel = async (selectedRows: any[]) => {
    if (!selectedRows.length) return;

    const workbook = await prepareLeavesWorkbook({
      selectedRows,
      companyName,
      companyAddress,
      refYear,
    });
    if (!workbook) return;
    saveAs(
      new Blob([workbook], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Leaves-Register ${formatDateTime(Date.now())}.xlsx`
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "muted" }),
          "w-full justify-start text-[13px] h-9 hidden px-2 gap-2",
          selectedRows.length && "flex"
        )}
      >
        <Icon name="plus-circled" />
        <p>Leaves Register</p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leaves Register</AlertDialogTitle>
          <AlertDialogDescription>
            Create the register of leaves
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={() => generateLeavesExcel(selectedRows)}
            onSelect={() => generateLeavesExcel(selectedRows)}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
