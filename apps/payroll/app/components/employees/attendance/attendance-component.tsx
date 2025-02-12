import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";
import type { EmployeeAttendanceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { AttendanceFilter } from "./attendance-filter";
import { useNavigate } from "@remix-run/react";
import { FilterList } from "./filter-list";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useUser } from "@/utils/user";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AttendanceComponent = ({
  attendanceData,
  employeeId,
  filters,
}: {
  employeeId: string;
  attendanceData: EmployeeAttendanceDatabaseRow[];
  disabled?: boolean;
  filters: {
    month?: string | undefined;
    year?: string | undefined;
  };
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const emptyFirstDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const emptyLastDays = Array.from({
    length: 7 - ((emptyFirstDays?.length + daysInMonth) % 7),
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const currentDate = new Date(year, month, i + 1);
    currentDate.setHours(12, 0, 0, 0);
    return {
      day: i + 1,
      fullDate: currentDate.toISOString().split("T")[0],
    };
  });

  const handleUpdate = (date: string) => {
    navigate(`/employees/${employeeId}/attendance/${date}/update-attendance`);
  };

  return (
    <div className="m-4">
      <div className="flex justify-end items-center mb-4 gap-x-2">
        <FilterList filters={filters} />
        <AttendanceFilter setMonth={setMonth} setYear={setYear} />
      </div>

      <div className="w-full mx-auto pb-8">
        <div className="border rounded-lg">
          <div className="grid grid-cols-7">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 text-center bg-muted/60 font-semibold text-muted-foreground last:border-none border-r"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 ">
            {emptyFirstDays.map((_, index) => (
              <div
                key={`empty-${index.toString()}`}
                className="h-32 border-b first:border-l border-t border-r p-2"
              />
            ))}

            {days.map((date) => (
              <div
                onClick={
                  hasPermission(role, `${updateRole}:${attribute.attendance}`)
                    ? () => handleUpdate(date.fullDate)
                    : undefined
                }
                onKeyDown={
                  hasPermission(role, `${updateRole}:${attribute.attendance}`)
                    ? () => handleUpdate(date.fullDate)
                    : undefined
                }
                key={date.fullDate}
                className={cn(
                  "h-32 border p-2 bg-card flex flex-col justify-between cursor-pointer"
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="font-extrabold text-lg">{date.day}</div>
                  <div className="text-xs flex flex-col items-end">
                    <div
                      className={cn(
                        "py-0.5 px-1 rounded-sm text-center",
                        attendanceData.find(
                          (entry) => entry.date === date.fullDate
                        )?.holiday
                          ? "bg-yellow-300 dark:text-black"
                          : attendanceData.find(
                              (entry) => entry.date === date.fullDate
                            )?.present
                          ? "bg-green"
                          : "bg-destructive text-white",
                        !attendanceData.find(
                          (entry) => entry.date === date.fullDate
                        )?.date && "hidden"
                      )}
                    >
                      {attendanceData.find(
                        (entry) => entry.date === date.fullDate
                      )?.present
                        ? "Present"
                        : "Absent"}
                    </div>
                    {attendanceData.find(
                      (entry) => entry.date === date.fullDate
                    )?.holiday && (
                      <div className="capitalize mt-1 py-0.5 px-1 rounded-sm text-center bg-muted text-muted-foreground">
                        {
                          attendanceData.find(
                            (entry) => entry.date === date.fullDate
                          )?.holiday_type
                        }
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div
                    className={cn(
                      "rounded-sm px-1 py-0.5",
                      attendanceData.find(
                        (entry) => entry.date === date.fullDate
                      )?.no_of_hours === 8
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted-foreground text-muted",
                      !attendanceData.find(
                        (entry) => entry.date === date.fullDate
                      )?.id && "hidden"
                    )}
                  >
                    {attendanceData.find(
                      (entry) => entry.date === date.fullDate
                    )?.no_of_hours &&
                      `${
                        attendanceData.find(
                          (entry) => entry.date === date.fullDate
                        )?.no_of_hours
                      } hours`}
                  </div>
                  <div className="text-xs px-1 py-0.5 rounded-sm bg-muted text-muted-foreground">
                    {
                      attendanceData.find(
                        (entry) => entry.date === date.fullDate
                      )?.working_shift
                    }
                  </div>
                </div>
              </div>
            ))}

            {emptyLastDays.map((_, index) => (
              <div
                key={`empty-${index.toString()}`}
                className="h-32 border-b first:border-l border-t border-r p-2"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
