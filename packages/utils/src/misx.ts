import { z } from "zod";

export function isGoodStatus(status: number | string) {
  const statusString = status.toString();
  return statusString.startsWith("2");
}

export function replaceDash(str: string | null | undefined) {
  return str?.replaceAll("-", " ");
}

export function replaceUnderscore(str: string | null | undefined) {
  return str?.replaceAll("_", " ");
}

export const pipe =
  (...fns: any[]) =>
    (val: any) =>
      fns.reduce((prev, fn) => fn(prev), val);

export function getInitialValueFromZod<T extends z.ZodTypeAny>(
  schema: T
): z.infer<T> {
  let unwrappedSchema = schema;
  while (unwrappedSchema instanceof z.ZodEffects) {
    unwrappedSchema = unwrappedSchema._def.schema;
  }

  if (!(unwrappedSchema instanceof z.ZodObject)) {
    throw new Error("Schema must be a ZodObject or wrapped ZodObject");
  }

  return Object.fromEntries(
    Object.entries(unwrappedSchema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) {
        return [key, value._def.defaultValue()];
      }
      return [key, undefined];
    })
  ) as z.infer<T>;
}

export function transformStringArrayIntoOptions(
  arr: string[]
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
  obj2: { [x: string]: any } | null | undefined
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

export function convertToNull<T extends Record<any, any> | null>(obj: T) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      obj[key] = null;
    }
    if (obj[key] === "null") {
      obj[key] = null;
    }
  }
  return obj as T;
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

export function debounce<
  Callback extends (...args: Parameters<Callback>) => void
>(fn: Callback, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export function getCurrentMonthIndex() {
  const date = new Date();
  return date.getMonth() + 1;
}

export function toCamelCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
}

export function getWorkingDaysInCurrentMonth({ working_days }: {
  working_days: number[];
}): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDayCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (working_days.includes(dayOfWeek)) workingDayCount++;
  }

  return workingDayCount;
}

export const searchInObject = (obj: any, searchString: string): boolean => {
  if (!obj || typeof obj !== "object") {
    return String(obj).toLowerCase().includes(searchString.toLowerCase());
  }

  return Object.values(obj).some((value) =>
    searchInObject(value, searchString),
  );
};

export const capitalizeFirstLetter = (val: any) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export function extractKeys<T extends Record<string, any>, K extends string>(
  arr: T[],
  keys: K[]
): Partial<Record<K, any>>[] {
  return arr.map(obj =>
    keys.reduce((acc, key) => {
      acc[key] = key.split('.').reduce((o, k) => o?.[k], obj);
      return acc;
    }, {} as Partial<Record<K, any>>)
  );
}
