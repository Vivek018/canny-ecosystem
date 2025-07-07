import type {
  PayrollDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { DownloadBankAdvice } from "./download-bank-advice";
import { DownloadEsiFormat } from "./download-esi-format";
import { DownloadEpfFormat } from "./download-epf-format";
import type {
  ExitsPayrollEntriesWithEmployee,
  ReimbursementPayrollEntriesWithEmployee,
} from "@canny_ecosystem/supabase/queries";

export function PayrollActions({
  payrollId,
  className,
  env,
  data,
  payrollData,
  fromWhere,
  status,
}: {
  payrollData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">;
  data:
    | ReimbursementPayrollEntriesWithEmployee[]
    | ExitsPayrollEntriesWithEmployee[];
  env: SupabaseEnv;
  payrollId: string;
  className?: string;
  fromWhere: "runpayroll" | "payrollhistory";
  status: string;
}) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("h-10", className)}>
          <Icon name="dots-vertical" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <div className="flex flex-col">
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "px-2 w-full flex flex-row justify-start gap-2 ",
                status !== "approved" ? "hidden" : ""
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(`/payroll/run-payroll/${payrollId}/create-invoice`)
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/create-invoice`
                    )
              }
            >
              <Icon name="plus-circled" />
              Create Invoice
            </Button>
          </div>
          <DropdownMenuSeparator
            className={cn(
              "flex ",
              fromWhere !== "payrollhistory" || status !== "approved"
                ? "hidden"
                : ""
            )}
          />
          <Button variant={"ghost"} className="w-full px-2">
            <DownloadBankAdvice
              env={env}
              data={data}
              payrollData={payrollData}
            />
          </Button>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              payrollData.payroll_type === "salary" &&
                status === "approved" &&
                "flex"
            )}
          />
          <Button
            variant={"ghost"}
            className={cn(
              "hidden w-full px-2",
              payrollData.payroll_type === "salary" && "flex"
            )}
          >
            <DownloadEsiFormat env={env} data={data} />
          </Button>

          <Button
            variant={"ghost"}
            className={cn(
              "hidden w-full px-2",
              payrollData.payroll_type === "salary" && "flex"
            )}
          >
            <DownloadEpfFormat env={env} data={data} />
          </Button>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              payrollData.payroll_type === "salary" &&
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
                payrollData.payroll_type === "salary" &&
                  status === "approved" &&
                  "flex flex-row justify-start gap-2 px-2 pr-1  "
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(`/payroll/run-payroll/${payrollId}/salary-slips`)
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/salary-slips`
                    )
              }
            >
              <Icon name="import" />
              Download Bulk Salary Slips
            </Button>
          </div>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              payrollData.payroll_type === "salary" &&
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
                payrollData.payroll_type === "salary" &&
                  status === "approved" &&
                  "flex flex-row justify-start gap-2 px-2 pr-1  "
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(
                      `/payroll/run-payroll/${payrollId}/salary-register`
                    )
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/salary-register`
                    )
              }
            >
              <Icon name="import" />
              Download Salary Register
            </Button>
          </div>
          {/* <DropdownMenuSeparator
            className={cn(
              "hidden",
              payrollData.payroll_type === "salary" &&
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
                payrollData.payroll_type === "salary" &&
                  status === "approved" &&
                  "flex flex-row justify-start gap-2 px-2 pr-1  "
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(
                      `/payroll/run-payroll/${payrollId}/salary-register`
                    )
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/salary-register`
                    )
              }
            >
              <Icon name="import" />
              Download Salary Register
            </Button>
          </div>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              payrollData.payroll_type === "salary" &&
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
                payrollData.payroll_type === "salary" &&
                  status === "approved" &&
                  "flex flex-row justify-start gap-2 px-2 pr-1  "
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(
                      `/payroll/run-payroll/${payrollId}/salary-register`
                    )
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/salary-register`
                    )
              }
            >
              <Icon name="import" />
              Download Salary Register
            </Button>
          </div> */}
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              payrollData.payroll_type === "salary" &&
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
                payrollData.payroll_type === "salary" &&
                  status === "approved" &&
                  "flex flex-row justify-start gap-2 px-2 pr-1  "
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(
                      `/payroll/run-payroll/${payrollId}/overtime-register`
                    )
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/overtime-register`
                    )
              }
            >
              <Icon name="import" />
              Download Overtime Register
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
