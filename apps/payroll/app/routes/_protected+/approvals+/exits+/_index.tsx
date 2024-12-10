import { ExitPaymentColumns } from "@/components/exit-payment/table/columns";
import { ExitPaymentTable } from "@/components/exit-payment/table/data-table";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";

const demoExits = [
  {
    employee_name: "John Doe",
    last_working_day: "2024-12-01",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-15",
    note: "Smooth transition",
    organization_payable_days: 15,
    employee_payable_days:20,
    bonus: 5000,
    diwali_bonus: 2000,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 10000,
    leave_encashment: 3000,
    gift_coupon: 500,
    computer_service_charges: 100,
    gratuity: 15000,
    deduction: 200,
  },
  {
    employee_name: "Jane Smith",
    last_working_day: "2024-11-30",
    reason_for_exit: "Termination",
    final_settlement_date: "2024-12-10",
    note: "Performance concerns",
    organization_payable_days: 10,
    employee_payable_days:20,
    bonus: 0,
    diwali_bonus: 1000,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 8000,
    leave_encashment: 0,
    gift_coupon: 200,
    computer_service_charges: 200,
    gratuity: 0,
    deduction: 500,
  },
  {
    employee_name: "Mike Johnson",
    last_working_day: "2024-11-28",
    reason_for_exit: "Retirement",
    final_settlement_date: "2024-12-12",
    note: "30+ years of service",
    organization_payable_days: 20,
    employee_payable_days:20,
    bonus: 10000,
    diwali_bonus: 3000,
    commission: 1000,
    joining_bonus: 0,
    yearly_bonus: 15000,
    leave_encashment: 5000,
    gift_coupon: 700,
    computer_service_charges: 0,
    gratuity: 20000,
    deduction: 0,
  },
  {
    employee_name: "Emily Davis",
    last_working_day: "2024-11-25",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-05",
    note: "New job opportunity",
    organization_payable_days: 10,
    employee_payable_days:20,
    bonus: 3000,
    diwali_bonus: 0,
    commission: 500,
    joining_bonus: 5000,
    yearly_bonus: 7000,
    leave_encashment: 2500,
    gift_coupon: 300,
    computer_service_charges: 150,
    gratuity: 12000,
    deduction: 100,
  },
  {
    employee_name: "William Brown",
    last_working_day: "2024-11-22",
    reason_for_exit: "Layoff",
    final_settlement_date: "2024-12-01",
    note: "Economic slowdown",
    organization_payable_days: 12,
    employee_payable_days:20,
    bonus: 4000,
    diwali_bonus: 2000,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 5000,
    leave_encashment: 0,
    gift_coupon: 0,
    computer_service_charges: 0,
    gratuity: 10000,
    deduction: 300,
  },
  {
    employee_name: "Sarah Wilson",
    last_working_day: "2024-11-15",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-01",
    note: "Relocation",
    organization_payable_days: 16,
    employee_payable_days:20,
    bonus: 2500,
    diwali_bonus: 1500,
    commission: 200,
    joining_bonus: 0,
    yearly_bonus: 4000,
    leave_encashment: 1000,
    gift_coupon: 400,
    computer_service_charges: 100,
    gratuity: 8000,
    deduction: 200,
  },
  {
    employee_name: "Chris Moore",
    last_working_day: "2024-11-20",
    reason_for_exit: "Retirement",
    final_settlement_date: "2024-12-04",
    note: "Loyal employee",
    organization_payable_days: 18,
    employee_payable_days:20,
    bonus: 9000,
    diwali_bonus: 3500,
    commission: 500,
    joining_bonus: 0,
    yearly_bonus: 14000,
    leave_encashment: 4000,
    gift_coupon: 600,
    computer_service_charges: 50,
    gratuity: 18000,
    deduction: 0,
  },
  {
    employee_name: "Sophia Taylor",
    last_working_day: "2024-11-18",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-11-30",
    note: "Career change",
    organization_payable_days: 12,
    employee_payable_days:20,
    bonus: 4000,
    diwali_bonus: 2500,
    commission: 300,
    joining_bonus: 0,
    yearly_bonus: 10000,
    leave_encashment: 1500,
    gift_coupon: 200,
    computer_service_charges: 200,
    gratuity: 15000,
    deduction: 150,
  },
  {
    employee_name: "Daniel Anderson",
    last_working_day: "2024-12-02",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-14",
    note: "Health reasons",
    organization_payable_days: 14,
    employee_payable_days:20,
    bonus: 6000,
    diwali_bonus: 4000,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 8000,
    leave_encashment: 2000,
    gift_coupon: 350,
    computer_service_charges: 150,
    gratuity: 12000,
    deduction: 250,
  },
  {
    employee_name: "Ava Thomas",
    last_working_day: "2024-11-28",
    reason_for_exit: "Layoff",
    final_settlement_date: "2024-12-08",
    note: "Position eliminated",
    organization_payable_days: 10,
    employee_payable_days:20,
    bonus: 3500,
    diwali_bonus: 0,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 3000,
    leave_encashment: 500,
    gift_coupon: 300,
    computer_service_charges: 100,
    gratuity: 5000,
    deduction: 500,
  },
  {
    employee_name: "Ethan White",
    last_working_day: "2024-12-03",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-17",
    note: "Further studies",
    organization_payable_days: 14,
    employee_payable_days:20,
    bonus: 4000,
    diwali_bonus: 2000,
    commission: 100,
    joining_bonus: 0,
    yearly_bonus: 6000,
    leave_encashment: 1500,
    gift_coupon: 250,
    computer_service_charges: 100,
    gratuity: 10000,
    deduction: 200,
  },
  {
    employee_name: "Olivia Harris",
    last_working_day: "2024-11-30",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-15",
    note: "Better pay opportunity",
    organization_payable_days: 15,
    employee_payable_days:20,
    bonus: 5000,
    diwali_bonus: 3000,
    commission: 200,
    joining_bonus: 0,
    yearly_bonus: 7000,
    leave_encashment: 2000,
    gift_coupon: 500,
    computer_service_charges: 100,
    gratuity: 15000,
    deduction: 150,
  },
  {
    employee_name: "Jacob Martinez",
    last_working_day: "2024-11-29",
    reason_for_exit: "Retirement",
    final_settlement_date: "2024-12-10",
    note: "Outstanding contributor",
    organization_payable_days: 11,
    employee_payable_days:20,
    bonus: 10000,
    diwali_bonus: 5000,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 20000,
    leave_encashment: 6000,
    gift_coupon: 700,
    computer_service_charges: 100,
    gratuity: 25000,
    deduction: 0,
  },
  {
    employee_name: "Mia Clark",
    last_working_day: "2024-11-21",
    reason_for_exit: "Layoff",
    final_settlement_date: "2024-12-05",
    note: "Project cancellation",
    organization_payable_days: 14,
    employee_payable_days:20,
    bonus: 0,
    diwali_bonus: 2000,
    commission: 0,
    joining_bonus: 0,
    yearly_bonus: 4000,
    leave_encashment: 0,
    gift_coupon: 150,
    computer_service_charges: 0,
    gratuity: 6000,
    deduction: 350,
  },
  {
    employee_name: "Benjamin Lee",
    last_working_day: "2024-12-01",
    reason_for_exit: "Resignation",
    final_settlement_date: "2024-12-14",
    note: "Joining family business",
    organization_payable_days: 12,
    employee_payable_days:20,
    bonus: 4500,
    diwali_bonus: 2500,
    commission: 150,
    joining_bonus: 0,
    yearly_bonus: 5000,
    leave_encashment: 1000,
    gift_coupon: 200,
    computer_service_charges: 150,
    gratuity: 9000,
    deduction: 100,
  },
];

export default function Exits() {
  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(demoExits);

  useEffect(() => {
    const filteredData = demoExits?.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, demoExits]);
  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center">
          <div className="relative w-96">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon
                name="magnifying-glass"
                size="sm"
                className="text-gray-400"
              />
            </div>
            <Input
              placeholder="Search Users"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
          <Link
            to="/approvals/exits/exit-form"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1"
            )}
          >
            <span>Add</span>
            <span className="hidden md:flex justify-end">Exits</span>
          </Link>
        </div>
      </div>
      <ExitPaymentTable data={tableData as any} columns={ExitPaymentColumns} />
    </section>
  );
}
