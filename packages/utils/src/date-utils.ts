import {
  isValid,
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";

export function getValidDateForInput(
  date: string | Date | undefined,
): string {
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
