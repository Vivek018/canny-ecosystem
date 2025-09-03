import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { Label } from "@canny_ecosystem/ui/label";
import {
  Combobox,
  type ComboboxSelectOption,
} from "@canny_ecosystem/ui/combobox";
import { useState } from "react";

export function PayrollActions({
  payrollId,
  className,
  env,
  data,
  fromWhere,
  status,
  allLocationOptions,
}: {
  data: any[];
  env: SupabaseEnv;
  payrollId: string;
  className?: string;
  fromWhere: "runpayroll" | "payrollhistory";
  status: string;
  allLocationOptions: ComboboxSelectOption[];
}) {
  const [locations, setLocations] = useState("");
  const newParams = new URLSearchParams();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="muted"
          size="icon"
          className={cn(
            "h-10 w-12 px-2 bg-muted border border-input",
            className,
          )}
        >
          <Icon name="dots-vertical" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <div className="flex flex-col">
          <Button variant={"ghost"} className="w-full px-2">
            <DownloadBankAdvice env={env} data={data} />
          </Button>
          <Button variant={"ghost"} className={cn("w-full px-2")}>
            <DownloadEsiFormat env={env} data={data} />
          </Button>

          <Button variant={"ghost"} className={cn(" w-full px-2")}>
            <DownloadEpfFormat env={env} data={data} />
          </Button>

          <DropdownMenuSeparator
            className={cn("hidden", status === "approved" && "flex")}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
                status === "approved" &&
                  "flex flex-row justify-start gap-2 px-2 pr-1",
              )}
              onClick={() =>
                fromWhere === "runpayroll"
                  ? navigate(`/payroll/run-payroll/${payrollId}/salary-slips`)
                  : navigate(
                      `/payroll/payroll-history/${payrollId}/salary-slips`,
                    )
              }
            >
              <Icon name="import" />
              Download Bulk Salary Slips
            </Button>
          </div>
          <DropdownMenuSeparator
            className={cn("hidden", status === "approved" && "flex")}
          />
          <div>
            <AlertDialog>
              <AlertDialogTrigger
                className={cn("w-full", status !== "approved" && "hidden")}
              >
                <Button
                  variant={"ghost"}
                  className={cn(
                    "w-full flex flex-row justify-start gap-2 px-2 pr-1",
                  )}
                >
                  <Icon name="import" />
                  Download Salary Register
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Select Company Locations</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select Company Locations here
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Locations</Label>
                  <Combobox
                    options={allLocationOptions}
                    value={locations}
                    onChange={(e) => setLocations(e)}
                  />
                </div>

                <AlertDialogFooter className="pt-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(buttonVariants({ variant: "default" }))}
                    onClick={() => {
                      newParams.set("location", locations);
                      fromWhere === "runpayroll"
                        ? navigate(
                            `/payroll/run-payroll/${payrollId}/salary-register?${newParams.toString()}`,
                          )
                        : navigate(
                            `/payroll/payroll-history/${payrollId}/salary-register?${newParams.toString()}`,
                          );
                    }}
                  >
                    Set
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {/* <DropdownMenuSeparator
            className={cn(
              "hidden",
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
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
                status === "approved" &&
                "flex"
            )}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
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
          {/* <DropdownMenuSeparator
            className={cn("hidden", status === "approved" && "flex")}
          />
          <div>
            <Button
              variant={"ghost"}
              className={cn(
                "hidden",
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
          </div> */}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
