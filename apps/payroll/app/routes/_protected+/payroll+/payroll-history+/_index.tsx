import { PayrollStatus } from "@/components/payroll/payroll-status";

const demoData = { status: "COMPLETED", date: "10/10/2024", number: "200" };

export default function PayrollHistory() {
  return <PayrollStatus data={demoData as any} />;
}
