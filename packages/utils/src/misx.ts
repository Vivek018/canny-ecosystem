import { z } from "zod";
import { months } from "../constant";

export function isGoodStatus(status: number | string) {
  const statusString = status.toString();
  return statusString.startsWith("2");
}

export function replaceDash(str: string | null | undefined) {
  if (typeof str !== "string") {
    return str;
  }
  return str?.replaceAll("-", " ");
}

export function replaceUnderscore(str: string | null | undefined) {
  if (typeof str !== "string") {
    return str;
  }
  return str?.replaceAll("_", " ");
}

export const pipe =
  (...fns: any[]) =>
  (val: any) =>
    fns.reduce((prev, fn) => fn(prev), val);

export function getInitialValueFromZod<T extends z.ZodTypeAny>(
  schema: T,
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
    }),
  ) as z.infer<T>;
}

export function transformStringArrayIntoOptions(
  arr: string[],
): { value: string; label: string }[] {
  return arr?.map((str) => ({
    value: String(str),
    label: String(str),
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

export function debounce<
  Callback extends (...args: Parameters<Callback>) => void,
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
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}

export function getWorkingDaysInCurrentMonth({
  working_days,
}: {
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

export const searchInObject = (obj: any, searchString: string): any => {
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
  keys: K[],
): Partial<Record<K, any>>[] {
  return arr.map((obj) =>
    keys.reduce(
      (acc, key) => {
        acc[key] = key.split(".").reduce((o, k) => o?.[k], obj);
        return acc;
      },
      {} as Partial<Record<K, any>>,
    ),
  );
}

export function getMonthNameFromNumber(
  monthNumber: number,
  shortName = false,
): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("Month number must be between 1 and 12");
  }

  return shortName
    ? monthNames[monthNumber - 1].slice(0, 3)
    : monthNames[monthNumber - 1];
}

export function numberToWords(num: number): string {
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const units = [
    { value: 10000000, str: "crore" },
    { value: 100000, str: "lakh" },
    { value: 1000, str: "thousand" },
    { value: 100, str: "hundred" },
  ];

  function convert(n: number): string {
    let words = "";

    for (const unit of units) {
      if (n >= unit.value) {
        words += `${convert(Math.floor(n / unit.value))} ${unit.str} `;
        n %= unit.value;
      }
    }

    if (n >= 20) {
      words += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    }

    if (n >= 10 && n <= 19) {
      words += `${teens[n - 10]} `;
      return words.trim();
    }

    if (n > 0 && n < 10) {
      words += `${ones[n]} `;
    }

    return words.trim();
  }

  // Split integer and decimal parts
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let words = convert(integerPart);

  if (decimalPart > 0) {
    words += " point";
    for (const digit of decimalPart.toString().split("")) {
      words += ` ${ones[Number.parseInt(digit)]}`;
    }
  }

  return words.replace(/\s+/g, " ").trim();
}
export const getMonthName = (value: number): string | undefined => {
  return Object.keys(months).find((key) => months[key] === value);
};

export function roundToNearest(num: number): number {
  return Math.floor(num) + (num % 1 >= 0.5 ? 1 : 0);
}

export const normalizeNames = (name: string) => {
  if (!name) return "";
  return (
    name
      .normalize("NFKC")
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
      .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
};

export function formatNumber(num: number): string | number {
  return Number.isInteger(num) ? num.toString() : num?.toFixed(2);
}

export function generatePrefix(siteName: string): string {
  const words = siteName
    .trim()
    .split(/\s+/)
    .map((w) => w.toUpperCase());

  if (words.length === 1) {
    return words[0].slice(0, 4);
  }

  let prefix = "";
  const totalNeeded = 4;
  const perWord = Math.floor(totalNeeded / words.length);
  let extra = totalNeeded % words.length;

  for (const word of words) {
    let take = perWord;
    if (extra > 0) {
      take++;
      extra--;
    }
    prefix += word.slice(0, take);
  }

  return prefix;
}

export function generateEmployeeCodes(
  sitePrefix: string,
  count: number,
  lastCode?: string,
): string[] {
  let startNumber = 0;
  if (lastCode?.startsWith(sitePrefix)) {
    const match = lastCode.match(/\d+$/);
    if (match) {
      startNumber = Number.parseInt(match[0], 10);
    }
  }

  const codes: string[] = [];
  for (let i = 1; i <= count; i++) {
    codes.push(`${sitePrefix}${startNumber + i}`);
  }

  return codes;
}

// export function generateNextCode(code: string) {
//   const match = code?.match(/^(.*?)(\d+)$/) ?? "NOCODE";
//   if (!match) return `${code}1`;

//   const prefix = match[1];
//   const number = Number.parseInt(match[2], 10);

//   return prefix + (number + 1);
// }

export function generateRandomCode(prefix: string) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const numLetters = Math.floor(Math.random() * 4) + 1;
  const numDigits = 5 - numLetters;

  let suffix = "";

  for (let i = 0; i < numLetters; i++) {
    const randIndex = Math.floor(Math.random() * letters.length);
    suffix += letters[randIndex];
  }

  for (let i = 0; i < numDigits - 1; i++) {
    const randIndex = Math.floor(Math.random() * digits.length);
    suffix += digits[randIndex];
  }

  suffix += digits[Math.floor(Math.random() * digits.length)];

  return `${prefix}${suffix}`;
}

export function fixedDecimal(amount: number) {
  return amount.toFixed(2);
}
