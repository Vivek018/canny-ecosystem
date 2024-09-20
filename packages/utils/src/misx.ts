import { z } from "zod";

export function replaceDash(str: string) {
  return str.replaceAll("-", " ");
}

export function replaceUnderscore(str: string) {
  return str.replaceAll("_", " ");
}

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
