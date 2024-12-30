import { ExitByReasons } from "@/components/exits/analytics/exit-by-reasons";
import { ExitByTime } from "@/components/exits/analytics/exit-by-time";
import { ExitPaymentByTime } from "@/components/exits/analytics/exit-payment-by-time";
import { ExitTopPayment } from "@/components/exits/analytics/exit-top-payment";
import { ExitTrend } from "@/components/exits/analytics/exit-trend";
import { useExitsStore } from "@/store/exits";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import { employeeExitReasons } from "@canny_ecosystem/utils/constant";
import { useLocalStorage } from "@canny_ecosystem/utils/hooks/local-storage";
import { useEffect } from "react";

const getDataSource = (
  selectedRows: ExitDataType[],
  storedValue: ExitDataType[],
) => {
  return selectedRows.length > 0 ? selectedRows : storedValue;
};

export default function ExitAnalytics() {
  const { selectedRows } = useExitsStore();
  const [storedValue, setValue] = useLocalStorage<ExitDataType[]>(
    "analyticsArray",
    [],
  );

  useEffect(() => {
    if (selectedRows.length > 0) {
      setValue(selectedRows);
    }
  }, [selectedRows, setValue]);

  const dataSource: ExitDataType[] = getDataSource(selectedRows, storedValue);

  const trendData = dataSource.map((row) => ({
    date: row.final_settlement_date,
    amount: row.total || 0,
  }));

  const exitYears = new Set(
    trendData.map((row) => {
      const date = new Date(row.date || "");
      return date.getFullYear();
    }),
  );

  let exitByTimeData = [];

  if (exitYears.size > 1) {
    exitByTimeData = Object.values(
      dataSource.reduce(
        (
          acc: Record<
            number,
            { year: number; amount: number; month: string | null }
          >,
          row,
        ) => {
          if (row.final_settlement_date) {
            const date = new Date(row.final_settlement_date);
            const year = date.getFullYear();

            if (!acc[year]) {
              acc[year] = { year, amount: 0, month: null };
            }
            acc[year].amount += row.total || 0;
          }
          return acc;
        },
        {},
      ),
    );
  } else {
    exitByTimeData = Object.values(
      dataSource.reduce(
        (
          acc: Record<
            string,
            { month: string; amount: number; year: number | null }
          >,
          row,
        ) => {
          if (row.final_settlement_date) {
            const date = new Date(row.final_settlement_date);
            const monthName = date.toLocaleString("default", { month: "long" });

            if (!acc[monthName]) {
              acc[monthName] = { month: monthName, amount: 0, year: null };
            }
            acc[monthName].amount += row.total || 0;
          }
          return acc;
        },
        {},
      ),
    );
  }

  const exitByReasonsData = Object.values(
    dataSource.reduce(
      (acc, row) => {
        const reason = row.reason.toLowerCase().replace(/\s+/g, "_") || "Other";

        if (!acc[reason]) {
          acc[reason] = { reason, amount: 0 };
        }

        acc[reason].amount += row.total || 0;
        return acc;
      },
      Object.fromEntries(
        employeeExitReasons.map((reason) => {
          const normalizedReason = reason.toLowerCase().replace(/\s+/g, "_");
          return [normalizedReason, { reason: normalizedReason, amount: 0 }];
        }),
      ),
    ),
  );

  const exitTopPaymentData = Object.values(dataSource.reduce(
    (acc, row) => {
      if(row.exit_payments) {
        const payments = row.exit_payments;
        for (const payment of payments) {
          const costType = payment.payment_fields.name.toLowerCase().replace(/\s+/g, "_");
          if (!acc[costType]) {
            acc[costType] = { amount: 0, costType };
          }
          acc[costType].amount += payment.amount;
        }
      }
      return acc;
    },
    {} as Record<string, { amount: number; costType: string }>,
  ));

  const exitLastWorkingYears = new Set(
    dataSource.map((row) => {
      const date = new Date(row.last_working_day || "");
      return date.getFullYear();
    }),
  );

  const exitsByTimeData = [];

  if (exitLastWorkingYears.size > 1) {
    for (const year of exitLastWorkingYears) {
      const count = dataSource.filter(
        (row) => new Date(row.last_working_day).getFullYear() === year,
      ).length;
      exitsByTimeData.push({ year, count, month: null });
    }
  } else {
    const groupedByMonth = dataSource.reduce(
      (acc: Record<string, number>, row) => {
        const month = new Date(row.last_working_day).toLocaleString("default", {
          month: "long",
        });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month]++;
        return acc;
      },
      {},
    );

    for (const month in groupedByMonth) {
      exitsByTimeData.push({ month, count: groupedByMonth[month], year: null });
    }
  }

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <ExitTrend chartData={trendData} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ExitPaymentByTime chartData={exitByTimeData} />
        <ExitByTime
          chartData={exitsByTimeData}
          isYearly={exitLastWorkingYears.size > 1}
        />
        <ExitByReasons chartData={exitByReasonsData} />
      </div>
      <div>
        <ExitTopPayment chartData={exitTopPaymentData} />
      </div>
    </div>
  );
}
