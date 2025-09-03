
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
import { Icon } from "@canny_ecosystem/ui/icon";

export const prepareAttendanceWorkbook = async ({
  selectedRows,
  companyName,
  companyAddress,
}: {
  selectedRows: any[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) => {
  const updatedData = selectedRows.map((employee) => {
    const totalPresents = Object.values(employee).filter(
      (value: any) => value?.present === "P"
    ).length;
    const totalLeaves = Object.values(employee).filter(
      (value: any) => value?.present === "L"
    ).length;

    return {
      ...employee,
      total_presents: totalPresents,
      total_leaves: totalLeaves,
    };
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  const allDates = new Set<string>();
  for (const emp of updatedData) {
    for (const key in emp) {
      if (key.match(/^\d{2} \w{3} \d{4}$/)) {
        allDates.add(key);
      }
    }
  }
  const sortedDates = Array.from(allDates).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const allMonths = new Set<string>();
  for (const date of sortedDates) {
    const monthYear = date.slice(3);
    allMonths.add(monthYear);
  }
  const monthYear = [...allMonths].join("-");

  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = companyName!.name!;
  worksheet.getCell("A1").font = { bold: true, size: 16 };
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

  worksheet.mergeCells("F1:AE4");
  worksheet.getCell("F1").value = `Attendance Register for ${monthYear}`;
  worksheet.getCell("F1").font = { bold: true, size: 20 };
  worksheet.getCell("F1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("AF1:AJ1");
  worksheet.getCell("AF1").value = CANNY_MANAGEMENT_SERVICES_NAME;
  worksheet.getCell("AF1").font = { bold: true, size: 16 };
  worksheet.getCell("AF1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells("AF2:AJ3");
  worksheet.getCell("AF2").value = CANNY_MANAGEMENT_SERVICES_ADDRESS;
  worksheet.getCell("AF2").font = { bold: false, size: 12 };
  worksheet.getCell("AF2").alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  const headerRow = worksheet.addRow([
    "Employee Name",
    "Employee Code",
    "Project",
    "Site",
    ...sortedDates,
    "Total Presents",
    "Total Leaves",
    "Total Hours",
  ]);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  for (const emp of updatedData) {
    const row = [
      emp.employee_name || "N/A",
      emp.employee_code || "N/A",
      emp.project || "N/A",
      emp.site || "N/A",
      ...sortedDates.map(
        (date) => (emp[date as "attendance"] as any)?.present || ""
      ),
      emp.total_presents || 0,
      emp.total_leaves || 0,
    ];
    const newRow = worksheet.addRow(row);

    for (let i = 4; i < newRow.cellCount; i++) {
      const cell = newRow.getCell(i + 1);
      if (cell.value === "P") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00FF00" },
        }; // Green
      } else if (cell.value === "A") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0000" },
        }; // Red
      } else if (cell.value === "WOF") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF8596A6" },
        }; // Gray
      } else if (cell.value === "L") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" },
        }; // Yellow
      }
      cell.alignment = { horizontal: "center" };
    }
  }

  for (const column of worksheet.columns) {
    column.width = 15;
  }

  return await workbook.xlsx.writeBuffer();
};
export const AttendanceRegister = ({
  selectedRows,
  companyName,
  companyAddress,
  className,
}: {
  selectedRows: any[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
  className?: string;
}) => {
  const generateAttendanceExcel = async (selectedRows: any[]) => {
    if (!selectedRows.length) return;

    const workbook = await prepareAttendanceWorkbook({
      selectedRows,
      companyName,
      companyAddress,
    });

    saveAs(
      new Blob([workbook], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Attendance-Register ${formatDateTime(Date.now())}.xlsx`
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "muted" }),
          "w-full justify-start text-[13px] h-9 px-2 gap-2",
          className
        )}
      >
        <Icon name="plus-circled" />
        <p>Monthly Register</p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Attendance Register</AlertDialogTitle>
          <AlertDialogDescription>
            Create the register for {selectedRows.length} employees
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={() => generateAttendanceExcel(selectedRows)}
            onSelect={() => generateAttendanceExcel(selectedRows)}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
