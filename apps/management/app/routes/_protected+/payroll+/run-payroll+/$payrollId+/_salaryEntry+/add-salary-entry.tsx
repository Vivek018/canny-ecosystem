import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";
import {
  createAttendanceByPayrollImportAndGiveID,
  createSalaryEntries,
  createSalaryFieldValues,
  updatePayrollById,
} from "@canny_ecosystem/supabase/mutations";
import { getPayrollById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const payrollId = formData.get("payrollId") as string;

    const failedRedirect = formData.get("failedRedirect") as string;

    const salaryEntryData = JSON.parse(
      formData.get("salaryEntryData") as string
    );

    const { data: payrollData } = await getPayrollById({
      payrollId,
      supabase,
    });
   
    const newTotal = salaryEntryData.salary_data.reduce(
      (total: number, item: any) => {
        const amt = Number(item.amount);
        return item.type === "earning" ? total + amt : total - amt;
      },
      0
    );

    const updatedPayrollData = {
      total_net_amount: payrollData?.total_net_amount + newTotal,
      total_employees: payrollData?.total_employees! + 1,
    };

    const { data: attendanceData, error: attendanceError } =
      await createAttendanceByPayrollImportAndGiveID({
        employee_id: salaryEntryData.employee_id,
        insertData: { present_days: salaryEntryData.present_days },
        month: payrollData?.month!,
        year: payrollData?.year!,
        supabase,
      });
    if (attendanceError || !attendanceData) {
      console.error("Failed to insert attendance", attendanceError);
      return json({
        status: "error",
        message:
          "Salary Payroll Creation failed as conflict in attendance data",
        failedRedirect,
        error: attendanceError,
      });
    }
    const salaryEntryToBeAdded = [
      {
        payroll_id: payrollId,
        monthly_attendance_id: attendanceData.id,
      },
    ];

    const {
      data: salaryEntriesData,
      status: salaryEntriesStatus,
      error: salaryEntriesError,
    } = await createSalaryEntries({
      supabase,
      data: salaryEntryToBeAdded,
      onConflict: "monthly_attendance_id",
    });

    const payrollFieldValuesToBeAdded = salaryEntryData.salary_data.map(
      (entry: any) => ({
        payroll_field_id: entry.id,
        amount: entry.amount,
        salary_entry_id: salaryEntriesData![0]?.id ?? "",
      })
    );

    const { status: salaryFieldEntriesStatus, error: salaryFieldEntriesError } =
      await createSalaryFieldValues({
        supabase,
        data: payrollFieldValuesToBeAdded,
      });
    if (
      isGoodStatus(salaryEntriesStatus) &&
      isGoodStatus(salaryFieldEntriesStatus)
    ) {
      await updatePayrollById({
        data: updatedPayrollData,
        supabase,
        payrollId,
      });

      return json({
        status: "success",
        message: "Salary Entry Added successfully",
        error: null,
      });
    }
    return json(
      {
        status: "error",
        message: "Salary Entry add failed",
        error: salaryEntriesError ?? salaryFieldEntriesError,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export default function AddSalaryEntry() {
  const actionData = useActionData<typeof action>();
  const { payrollId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            (actionData?.error as any)?.message || actionData?.message,
          variant: "destructive",
        });
      }
      navigate(`/payroll/run-payroll/${payrollId}`, { replace: true });
    }
  }, [actionData]);

  return null;
}
