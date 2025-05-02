import { faker } from "@faker-js/faker";

export function seedSalaryPayroll(employees: { id: string }[]) {
  const salaryData = employees.flatMap((emp) => {
    return ["BASIC", "HRA", "LTA", "BONUS", "PF", "ESIC", "PT", "LWF"].map(
      (field) => ({
        month: faker.number.int({ min: 1, max: 11 }),
        year: faker.number.int({ min: 2020, max: 2024 }),
        present_days: faker.number.int({ min: 0, max: 26 }),
        overtime_hours: 0,
        employee_id: emp.id,
        field_name: field,
        type: ["PF", "ESIC", "PT", "LWF"].includes(field)
          ? "statutory_contribution"
          : "earning",
        is_pro_rata: faker.datatype.boolean(),
        consider_for_epf: faker.datatype.boolean(),
        consider_for_esic: faker.datatype.boolean(),
        amount: faker.number.int({ min: 0, max: 100000 }),
        is_overtime: faker.datatype.boolean(),
      })
    );
  });

  return {
    run_date: faker.date.past().toISOString(),
    status: ["pending", "approved"][faker.number.int({ min: 0, max: 1 })],
    type: "salary",
    salaryData,
    totalEmployees: employees.length,
    totalNetAmount: salaryData.reduce((sum, entry) => sum + entry.amount, 0),
  };
}

export function seedExitPayroll(employees: { id: string }[]) {
  const exitData = employees.map((emp) => ({
    employee_id: emp.id,
    net_pay: faker.number.int({ min: 1000, max: 100000 }),
  }));

  return {
    run_date: faker.date.past().toISOString(),
    status: ["pending", "approved"][faker.number.int({ min: 0, max: 1 })],
    type: "exit",
    exitData,
    totalEmployees: employees.length,
    totalNetAmount: exitData.reduce((sum, emp) => sum + emp.net_pay, 0),
  };
}
export function seedReimbursementPayroll(employees: { id: string }[]) {
  const reimbursementData = employees.map((emp) => ({
    employee_id: emp.id,
    amount: faker.number.int({ min: 1000, max: 100000 }),
  }));

  return {
    run_date: faker.date.past().toISOString(),
    status: ["pending", "approved"][faker.number.int({ min: 0, max: 1 })],
    type: "reimbursement",
    reimbursementData,
    totalEmployees: employees.length,
    totalNetAmount: reimbursementData.reduce((sum, emp) => sum + emp.amount, 0),
  };
}
