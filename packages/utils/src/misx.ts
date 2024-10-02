import { z } from "zod";

export function isGoodStatus(status: number | string) {
  const statusString = status.toString();
  return statusString.startsWith("2");
}

export function replaceDash(str: string) {
  return str?.replaceAll("-", " ");
}

export function replaceUnderscore(str: string) {
  return str?.replaceAll("_", " ");
}

export const pipe =
  (...fns: any[]) =>
  (val: any) =>
    fns.reduce((prev, fn) => fn(prev), val);

export function getInitialValueFromZod<T extends z.ZodObject<any, any>>(
  schema: T,
): z.infer<T> {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) {
        return [key, value._def.defaultValue()];
      }
      return [key, undefined];
    }),
  ) as z.infer<T>;
}

export function transformStringArrayIntoOptions(
  arr: string[],
): { value: string; label: string }[] {
  return arr.map((str) => ({
    value: str,
    label: str,
  }));
}

export function getOrdinalSuffix(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = n % 100;

  return (
    n + (suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0])
  );
}

export function deepEqualCheck(
  obj1: { [x: string]: any } | null | undefined,
  obj2: { [x: string]: any } | null | undefined,
) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqualCheck(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export function convertUndefinedToNull(obj: { [x: string]: any }) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      obj[key] = null;
    }
  }
  return obj;
}

export const parseStringValue = (value: string) => {
  if (value === "") return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (!Number.isNaN(Number(value))) return Number(value);
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
