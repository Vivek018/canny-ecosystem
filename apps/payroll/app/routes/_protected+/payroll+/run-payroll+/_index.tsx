import { PayrollStatus } from "@/components/payroll/payroll-status";

const demoData = {
  status: "YET TO BE PROCESS",
  date: "10/10/2010",
  number: "20",
};

export default function RunPayroll() {
  return <PayrollStatus data={demoData as any} />;
}
