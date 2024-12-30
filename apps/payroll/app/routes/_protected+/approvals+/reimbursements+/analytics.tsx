import { ReimbursementPerEmployer } from "@/components/reimbursements/analytics/reimbursement-per-employer";
import { ReimbursementByTime } from "@/components/reimbursements/analytics/reimbursement-by-time";
import { ReimbursementTopEmployees } from "@/components/reimbursements/analytics/reimbursement-top-employees";
import { ReimbursementTrend } from "@/components/reimbursements/analytics/reimbursement-trend";
import { useReimbursementStore } from "@/store/reimbursements";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";
import { ReimbursementByDeductible } from "@/components/reimbursements/analytics/reimbursement-by-deductible";

const getDataSource = (
  selectedRows: ReimbursementDataType[],
  storedValue: ReimbursementDataType[],
) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export default function ReimbursementAnalytics() {
  const { selectedRows } = useReimbursementStore();
  const [storedValue, setValue] = useLocalStorage<ReimbursementDataType[]>(
    "analyticsArray",
    [],
  );


  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: ReimbursementDataType[] = getDataSource(
    selectedRows,
    storedValue,
  );

  // Trend
  const trendData = dataSource.map((row) => ({
    date: row.submitted_date,
    amount: row.amount,
  }));

  // Top employees
  const employeeTotals = dataSource
    .reduce(
      (acc, row) => {
        const employee_name = `${row.employees.first_name}_${row.employees.middle_name || ""}_${row.employees.last_name}`;
        acc[employee_name] = (acc[employee_name] || 0) + (row.amount || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

  const topEmployeesData = Object.entries(employeeTotals)
    .map(([employee_name, totalAmount]) => ({
      employee_name,
      amount: totalAmount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Reimbursement by time
  const reimbursementYears = new Set(
    dataSource.map((row) => {
      const date = new Date(row.submitted_date || "");
      return date.getFullYear();
    }),
  );

  let reimbursementByTimeData = [];

  if (reimbursementYears.size > 1) {
    reimbursementByTimeData = Object.values(
      dataSource.reduce(
        (
          acc: Record<
            number,
            { year: number; amount: number; month: string | null }
          >,
          row,
        ) => {
          if (row.submitted_date) {
            const date = new Date(row.submitted_date);
            const year = date.getFullYear();

            if (!acc[year]) {
              acc[year] = { year, amount: 0, month: null };
            }
            acc[year].amount += row.amount || 0;
          }
          return acc;
        },
        {},
      ),
    );
  } else {
    reimbursementByTimeData = Object.values(
      dataSource.reduce(
        (
          acc: Record<
            string,
            { month: string; amount: number; year: number | null }
          >,
          row,
        ) => {
          if (row.submitted_date) {
            const date = new Date(row.submitted_date);
            const monthName = date.toLocaleString("default", { month: "long" });

            if (!acc[monthName]) {
              acc[monthName] = { month: monthName, amount: 0, year: null };
            }
            acc[monthName].amount += row.amount || 0;
          }
          return acc;
        },
        {},
      ),
    );
  }

  // Reimbursement per employer
  const totalEmployerAmountData = dataSource.reduce(
    (acc, row) => {
      const email = row.users.email;
      if (email) {
        if (!acc[email]) {
          acc[email] = { employer: email, amount: 0 };
        }
        acc[email].amount += row.amount ?? 0;
      }
      return acc;
    },
    {} as Record<string, { employer: string; amount: number }>,
  );

  // Reimbursement by deductible
  const topUsersData = Object.values(totalEmployerAmountData)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  if (Object.values(totalEmployerAmountData).length > 5) {
    const othersAmount = Object.values(totalEmployerAmountData)
      .slice(4)
      .reduce((acc, user) => acc + user.amount, 0);

    topUsersData.push({ employer: "Others", amount: othersAmount });
  }

  // Reimbursement by deductible
  const totalDeductibleData = Object.values(
    dataSource.reduce(
      (
        acc: Record<
          string,
          { type: "deductible" | "nonDeductible"; amount: number }
        >,
        row,
      ) => {
        const type = row.is_deductible ? "deductible" : "nonDeductible";
        if (!acc[type]) {
          acc[type] = { type, amount: 0 };
        }
        acc[type].amount += row.amount ?? 0;
        return acc;
      },
      {},
    ),
  );

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <ReimbursementTrend chartData={trendData} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ReimbursementByDeductible chartData={totalDeductibleData} />
        <ReimbursementByTime
          chartData={reimbursementByTimeData}
          isYearly={reimbursementYears.size > 1}
        />
        <ReimbursementPerEmployer chartData={topUsersData} />
      </div>

      <div className="col-span-1">
        <ReimbursementTopEmployees chartData={topEmployeesData} />
      </div>
    </div>
  );
}
