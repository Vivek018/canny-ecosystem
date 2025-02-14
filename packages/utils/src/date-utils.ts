import { UTCDate } from "@date-fns/utc";
import {
  isValid,
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";

export { UTCDate } from "@date-fns/utc";
export { formatDateRange } from "little-date";

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

export function formatDate(date: Date | string | number) {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string | number) {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function getYears(numberOfYears = 30, currentYear: number | null = new Date().getFullYear()) {
  if (numberOfYears <= 0) {
    throw new Error("Number of years must be greater than 0");
  }

  const years: number[] = [];

  for (let i = 0; i < numberOfYears; i++) {
    years.push((currentYear ?? new Date().getFullYear()) - i);
  }

  return years;
}

export const formatDateToMonthYear = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};