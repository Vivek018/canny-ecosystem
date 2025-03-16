import type { TransformedAttendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";
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

export const AttendanceHourlyRegister = ({
  selectedRows,
  companyName,
  companyAddress,
}: {
  selectedRows: TransformedAttendanceDataType[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) => {
  const updatedData = selectedRows.map((employee) => {
    const totalHours = Object.values(employee).reduce((sum, value) => {
      if (typeof value === "object" && value !== null && "hours" in value) {
        return sum + (Number(value.hours) || 0);
      }
      return sum;
    }, 0);

    return {
      ...employee,
      total_hours: totalHours,
    };
  });

  const generateAttendanceHourlyExcel = async (updatedData: any[]) => {
    if (!updatedData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance(Hourly)");

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
    worksheet.getCell("A1").font = {
      bold: true,
      size: 16,
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.mergeCells("A2:E3");
    worksheet.getCell(
      "A2"
    ).value = `${companyAddress?.address_line_1}, ${companyAddress?.address_line_2}, ${companyAddress?.city}, ${companyAddress?.state} ${companyAddress?.pincode}`;
    worksheet.getCell("A2").font = { bold: false, size: 12 };
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    worksheet.mergeCells("F1:AE4");
    worksheet.getCell(
      "F1"
    ).value = `Attendance(Hourly) Register for ${monthYear}`;
    worksheet.getCell("F1").font = { bold: true, size: 20 };
    worksheet.getCell("F1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.mergeCells("AF1:AJ1");
    worksheet.getCell("AF1").value = CANNY_MANAGEMENT_SERVICES_NAME;
    worksheet.getCell("AF1").font = {
      bold: true,
      size: 16,
    };
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
      "Project Site",
      ...sortedDates,
      "Total Hours",
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    for (const emp of updatedData) {
      const row = [
        emp.employee_name || "N/A",
        emp.employee_code || "N/A",
        emp.project || "N/A",
        emp.project_site || "N/A",
        ...sortedDates.map((date) => emp[date]?.hours || 0),
        emp.total_hours || 0,
      ];
      const newRow = worksheet.addRow(row);

      for (let i = 4; i < newRow.cellCount - 1; i++) {
        const cell = newRow.getCell(i + 1);
        if (Number(cell.value) > 8) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "00FF00" },
          }; // Green
        } else if (cell.value && Number(cell.value) < 8) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF8596A6" },
          }; // Gray
        } else if (Number(cell.value) === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC0C0" },
          }; // Red
        }

        cell.alignment = { horizontal: "center" };
      }
    }

    for (const column of worksheet.columns) {
      column.width = 15;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Attendance(Hourly)-Register ${formatDateTime(Date.now())}.xlsx`
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "full" }),
          "text-[13px] h-9 hidden",
          selectedRows.length && "flex"
        )}
      >
        Attendance Hourly Register
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Attendance Hourly Register</AlertDialogTitle>
          <AlertDialogDescription>
            Create the register for {selectedRows.length} employees
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={() => generateAttendanceHourlyExcel(updatedData)}
            onSelect={() => generateAttendanceHourlyExcel(updatedData)}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
