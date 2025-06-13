import { UTCDate } from "@date-fns/utc";
import {
  isValid,
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";
import { months } from "../constant";

export { UTCDate } from "@date-fns/utc";
export { formatDateRange } from "little-date";

export const defaultMonth = new Date().getMonth() - 1;
export const defaultYear = new Date().getFullYear();

export function formatUTCDate(date?: string): string | undefined {
  return date ? new UTCDate(date).toISOString() : undefined;
}

export function getValidDateForInput(date: string | Date | undefined): string {
  let dateObject: Date | null = null;

  if (date instanceof Date && isValid(date)) {
    dateObject = date;
  } else if (typeof date === "string") {
    dateObject = new Date(date);

    if (!isValid(dateObject)) {
      return "";
    }
  }

  if (dateObject && isValid(dateObject)) {
    return format(dateObject, "yyyy-MM-dd");
  }

  return "";
}

export function getAutoTimeDifference(
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null,
  unit: "days" | "months" | "years" = "days",
): number | null {
  const start = startDate
    ? startDate instanceof Date && isValid(startDate)
      ? startDate
      : new Date(startDate)
    : null;
  const end = endDate
    ? endDate instanceof Date && isValid(endDate)
      ? endDate
      : new Date(endDate)
    : null;

  if (!isValid(start) || !isValid(end) || start === null || end === null) {
    return null;
  }

  switch (unit) {
    case "days":
      return differenceInDays(end, start);
    case "months":
      return differenceInMonths(end, start);
    case "years":
      return differenceInYears(end, start);
    default:
      return differenceInDays(end, start);
  }
}

export function formatMonthYearDate(date: Date | string | number) {
  return format(new Date(date), "MMM yyyy");
}

export function formatDate(date: Date | string | number | null) {
  if (!date || typeof date === "number") {
    return date;
  }

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (!trimmed.length) return date;

    const parsedDate = new Date(trimmed);
    if (Number.isNaN(parsedDate.getTime()) || !trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
      return date;
    }

    return format(parsedDate, "dd MMM yyyy");
  }

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return format(date, "dd MMM yyyy");
  }

  return date;
}


export function formatDateTime(date: Date | string | number) {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function getYears(
  numberOfYears = 30,
  currentYear: number | null = defaultYear,
) {
  if (numberOfYears <= 0) {
    throw new Error("Number of years must be greater than 0");
  }

  const years: number[] = [];

  for (let i = 0; i < numberOfYears; i++) {
    years.push((currentYear ?? defaultYear) - i);
  }

  return years;
}

export const formatDateToMonthYear = (dateString: string | number | Date) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

export const calculateDateRange = (
  range: string,
  monthName: string | number | null | undefined,
  yearValue: string | number | undefined
) => {
  const rangeNumber = Number.parseInt(String(range), 10);
  const monthNumber = monthName
    ? months[monthName]
    : defaultMonth + 1;
  const yearToUse =
    Number.parseInt(yearValue as string) || defaultYear;

  if (rangeNumber > 0) {
    const endDateObj = new Date(yearToUse, monthNumber, rangeNumber + 1);
    let targetMonth = monthNumber - 1;
    let targetYear = yearToUse;
    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    }
    const startDateObj = new Date(targetYear, targetMonth, rangeNumber + 2);
    return {
      startDate: startDateObj.toISOString().split("T")[0],
      endDate: endDateObj.toISOString().split("T")[0],
    };
  }
  const monthStr = monthNumber.toString().padStart(2, "0");
  const lastDay = new Date(yearToUse, monthNumber, 0).getDate();
  return {
    startDate: `${yearToUse}-${monthStr}-01`,
    endDate: `${yearToUse}-${monthStr}-${lastDay}`,
  };
};