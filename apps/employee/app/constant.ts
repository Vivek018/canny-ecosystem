export const DEFAULT_ROUTE = "/";

export const CANNY_MANAGEMENT_SERVICES_COMPANY_ID =
  "3f01b65d-ba67-4d57-9e79-c5ad9d8695a3";

export const CANNY_MANAGEMENT_SERVICES_NAME =
  "Canny Management Services Pvt. Ltd.";

export const CANNY_MANAGEMENT_SERVICES_ADDRESS =
  "502-503, Girivar Glean, Under Odhav Overbrigde, Sardar Patel Ring Rd, nr. Palm Hotel, Odhav, Ahmedabad, Gujarat 382415";

export const CANNY_MANAGEMENT_SERVICES_ACCOUNT_NAME =
  "Canny Management Services Pvt. Ltd.";

export const SALARY_SLIP_TITLE = "Form IV B [Rule 26(2)(b)]";

export const CANNY_MANAGEMENT_SERVICES_ACCOUNT_NUMBER = "093005001273";

export const CANNY_MANAGEMENT_SERVICES_IFSC_CODE = "ICIC0000930";

export const CANNY_MANAGEMENT_SERVICES_BRANCH_NAME = "Bapunagar Ahmedabad";

export const CANNY_MANAGEMENT_SERVICES_HSN_CODE_NUMBER = "9985";

export const CANNY_MANAGEMENT_SERVICES_PAN_NUMBER = "AADCC6596P";

export const CANNY_MANAGEMENT_SERVICES_GSTIN = "24AADCC6596P1ZZ";

export const cacheKeyPrefix = {
  root: "root",
  index: "index",
  protected: "protected",
  employees_main: "employees-main",
  employees: "employees",
  employee_overview: "employee-overview",
  employee_work_portfolio: "employee-work-portfolio",
  employee_reimbursements: "employee-reimbursements",
  employee_letters: "employee-letters",
  employee_payments: "employee-payments",
  attendance: "attendance",
  attendanceReport: "attendance-report",
  employee_leaves: "employee-leaves",
  employee_salary: "employee-salary",
  employee_document: "employee-document",
};

export function numberToWordsIndian(num: number) {
  const belowTwenty = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
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
    "",
    "thousand",
    "lakh",
    "crore",
    "arab",
    "kharab",
    "neel",
    "padma",
  ];

  function convertBelowThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return belowTwenty[n];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 ? ` ${belowTwenty[n % 10]}` : "")
      );
    return `${belowTwenty[Math.floor(n / 100)]} hundred${
      n % 100 ? ` ${convertBelowThousand(n % 100)}` : ""
    }`;
  }

  function convertIntegerToWordsIndian(n: number) {
    if (n === 0) return "zero";

    const parts = [];
    let i = 0;

    while (n > 0) {
      const remainder = n % (i === 0 ? 1000 : 100); // First group is 3 digits, subsequent groups are 2 digits
      if (remainder > 0) {
        const groupName = i > 0 ? units[i] : ""; // Add lakh, crore, etc.
        parts.unshift(
          convertBelowThousand(remainder) + (groupName ? ` ${groupName}` : ""),
        );
      }
      n = Math.floor(n / (i === 0 ? 1000 : 100)); // Reduce the number based on the group
      i++;
    }

    return parts.join(" ");
  }

  function convertDecimalPart(decimalStr: string) {
    return decimalStr
      .split("")
      .map((digit) => belowTwenty[Number.parseInt(digit, 10)])
      .join(" ");
  }

  // Split integer and decimal parts
  const [integerPart, decimalPart] = num.toString().split(".");
  const integerWords = convertIntegerToWordsIndian(
    Number.parseInt(integerPart, 10),
  );
  const decimalWords = decimalPart
    ? `point ${convertDecimalPart(decimalPart)}`
    : "";

  return `${integerWords}${decimalPart ? ` ${decimalWords}` : ""}`;
}
