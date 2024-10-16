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

export function convertToNull(obj: { [x: string]: any }) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      obj[key] = null;
    }
    if (obj[key] === "null") {
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

export function extractJsonFromString(str: string): any | null {
  // Function to find the outermost matching braces
  function findOutermostBraces(s: string): [number, number] | null {
    const stack: string[] = [];
    let start = -1;

    for (let i = 0; i < s.length; i++) {
      if (s[i] === "{") {
        if (stack.length === 0) start = i;
        stack.push("{");
      } else if (s[i] === "}") {
        if (stack.length === 0) return null; // Unmatched closing brace
        stack.pop();
        if (stack.length === 0) return [start, i];
      }
    }

    return null; // No matching braces found
  }

  // Find the outermost braces
  const bracesIndices = findOutermostBraces(str);

  if (bracesIndices === null) {
    console.warn("No valid JSON object found in the string");
    return null;
  }

  const [start, end] = bracesIndices;
  const jsonSubstring = str.substring(start, end + 1);

  try {
    // Attempt to parse the extracted substring
    return JSON.parse(jsonSubstring);
  } catch (error) {
    console.error("Failed to parse extracted JSON:", error);
    return null;
  }
}