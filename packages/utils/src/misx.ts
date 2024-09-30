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
