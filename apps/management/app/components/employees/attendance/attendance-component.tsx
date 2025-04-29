import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useEffect, useState } from "react";
import type { EmployeeAttendanceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { AttendanceFilter } from "./attendance-filter";
import { useNavigate } from "@remix-run/react";
import { FilterList } from "./filter-list";
import {
  defaultMonth,
  defaultYear,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute, months } from "@canny_ecosystem/utils/constant";
import { useUser } from "@/utils/user";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AttendanceComponent = ({
  attendanceData,
  employeeId,
  filters,
}: {
  employeeId?: string;
  attendanceData: EmployeeAttendanceDatabaseRow[];
  disabled?: boolean;
  filters?: {
    month?: string | undefined;
    year?: string | undefined;
  } | null;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const [month, setMonth] = useState<number>(() => {
    if (filters?.month) {
      return months[filters?.month] - 1;
    }
    return defaultMonth;
  });

  const [year, setYear] = useState<number>(() => {
    return filters?.year ? Number(filters?.year) : defaultYear;
  });

  useEffect(() => {
    if (filters?.month) {
      setMonth(months[filters?.month] - 1);
    } else {
      setMonth(defaultMonth);
    }

    if (filters?.year) {
      setYear(Number(filters?.year));
    } else {
      setYear(defaultYear);
    }
  }, [filters]);

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
    let query = "";

    if (filters?.month && filters?.year) {
      query = `?month=${filters.month}&year=${filters.year}`;
    } else if (filters?.month) {
      query = `?month=${filters.month}`;
    } else if (filters?.year) {
      query = `?year=${filters.year}`;
    }

    const url = `/employees/${employeeId}/attendance/${date}/update-attendance${query}`;
    navigate(url);
  };

  return (
    <div className="p-4">
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
                className="bg-border p-2 text-center font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {emptyFirstDays?.map((_, index) => (
              <div
                key={`empty-${index.toString()}`}
                className="h-32 border first:border-l  bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]"
              />
            ))}

            {days?.map((date) => (
              <div
                onClick={
                  hasPermission(
                    role,
                    `${updateRole}:${attribute.attendance}`
                  ) && new Date(date.fullDate) <= new Date()
                    ? () => handleUpdate(date?.fullDate)
                    : undefined
                }
                onKeyDown={
                  hasPermission(
                    role,
                    `${updateRole}:${attribute.attendance}`
                  ) && new Date(date.fullDate) <= new Date()
                    ? () => handleUpdate(date?.fullDate)
                    : undefined
                }
                key={date?.fullDate}
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
                        )?.date && "hidden p-0"
                      )}
                    >
                      {attendanceData.find(
                        (entry) => entry.date === date.fullDate
                      )?.present
                        ? "Present"
                        : "Absent"}
                    </div>
                    {attendanceData?.find(
                      (entry) => entry?.date === date?.fullDate
                    )?.holiday && (
                      <div className="capitalize mt-1 py-0.5 px-1 rounded-sm text-center bg-muted text-muted-foreground">
                        {
                          attendanceData.find(
                            (entry) => entry?.date === date?.fullDate
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
                      attendanceData?.find(
                        (entry) => entry?.date === date?.fullDate
                      )?.no_of_hours === 8
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted-foreground text-muted",
                      !attendanceData?.find(
                        (entry) => entry?.date === date?.fullDate
                      )?.id && "hidden p-0"
                    )}
                  >
                    {attendanceData?.find(
                      (entry) => entry?.date === date?.fullDate
                    )?.no_of_hours &&
                      `${
                        attendanceData?.find(
                          (entry) => entry?.date === date?.fullDate
                        )?.no_of_hours
                      } hours`}
                  </div>
                  <div className="text-xs px-1 rounded-sm bg-muted text-muted-foreground">
                    {
                      attendanceData?.find(
                        (entry) => entry?.date === date?.fullDate
                      )?.working_shift
                    }
                  </div>
                </div>
              </div>
            ))}

            {emptyLastDays?.map((_, index) => (
              <div
                key={`empty-${index.toString()}`}
                className="h-32 border first:border-l bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
