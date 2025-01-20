import { getCurrentMonthIndex } from "./misx";

export const calculatePaymentField = (paymentField) => {
  if (!paymentField || !paymentField.is_active) return 0;
  return paymentField?.amount ? paymentField?.amount : 0;
};

export const calculateSB = (sb, grossPay) => {
  if (!sb) return 0;
  const currentMonth = getCurrentMonthIndex();
  const { payment_frequency, percentage, payout_month } = sb;

  if (payment_frequency === "yearly" && payout_month !== currentMonth) return 0;

  const bonusAmount = (grossPay * percentage) / 100;

  return bonusAmount;
};

export const calculateEPF = (epf, grossPay) => {
  if (!epf) return 0;
  const {
    employee_contribution,
    employer_contribution,
    employee_restrict_value,
    employer_restrict_value,
    restrict_employee_contribution,
    restrict_employer_contribution,
    include_employer_contribution,
  } = epf;
  let employeeContributionAmount = grossPay * employee_contribution;
  let employerContributionAmount = grossPay * employer_contribution;

  if (restrict_employee_contribution)
    employeeContributionAmount = Math.min(
      employeeContributionAmount,
      employee_restrict_value,
    );
  if (restrict_employer_contribution)
    employerContributionAmount = Math.min(
      employerContributionAmount,
      employer_restrict_value,
    );
  if (!include_employer_contribution) employerContributionAmount = 0;

  return employeeContributionAmount + employerContributionAmount;
};

export const calculateESI = (esi, grossPay) => {
  if (!esi) return 0;
  const {
    employees_contribution,
    employers_contribution,
    include_employer_contribution,
  } = esi;
  const employeesContributionAmount = grossPay * employees_contribution;
  let employersContributionAmount = grossPay * employers_contribution;

  if (!include_employer_contribution) employersContributionAmount = 0;

  return employeesContributionAmount + employersContributionAmount;
};

export const calculatePT = (pt, grossPay) => {
  if (!pt) return 0;
  const { gross_salary_range } = pt;
  for (const range of gross_salary_range)
    if (grossPay >= range.start && grossPay <= range.end) return range.value;
  return 0;
};

export const calculateLWF = (lwf, grossPay) => {
  if (!lwf) return 0;
  const {
    employer_contribution = 0,
    employee_contribution = 0,
    deduction_cycle,
    status,
  } = lwf;
  if (status && deduction_cycle === "monthly") {
    const employeesContributionAmount = grossPay * employee_contribution;
    const employersContributionAmount = grossPay * employer_contribution;
    return employeesContributionAmount + employersContributionAmount;
  }
  return 0;
};
