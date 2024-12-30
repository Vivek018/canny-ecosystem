import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { createReimbursementsFromImportedData } from "@canny_ecosystem/supabase/mutations";

import {
  getEmployeeIdsByEmployeeCodes,
  getUserIdsByUserEmails,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const formData = await request.formData();
  const finalData = JSON.parse(formData.get("finalData") as string);

  const userEmails: any = Array.from(
    new Set(finalData.map((item: { email: string }) => item.email))
  );
  const employeeCodes: any = Array.from(
    new Set(
      finalData.map((item: { employee_code: string }) => item.employee_code)
    )
  );

  const { data: employees, error } = await getEmployeeIdsByEmployeeCodes({
    supabase,
    employeeCodes,
  });

  if (error) {
    throw error;
  }
  const { data: users, error: userError } = await getUserIdsByUserEmails({
    supabase,
    userEmails,
  });

  if (userError) {
    throw userError;
  }

  const employeeMapping = employees?.reduce((map, employee: any) => {
    if (employee?.employee_code && employee?.id) {
      map[employee.employee_code] = employee.id;
    }
    return map;
  }, {} as Record<string, string>);
  const userMapping = users?.reduce((map, user: any) => {
    if (user?.email && user?.id) {
      map[user.email] = user.id;
    }
    return map;
  }, {} as Record<string, string>);

  const updatedDataWithEmployeeId = finalData.map((item: { [x: string]: any; employee_code: any; }) => {
    const employeeId = employeeMapping![item.employee_code];
    if (employeeId) {
      const { employee_code, ...rest } = item;
      return {
        ...rest,
        employee_id: employeeId,
      };
    }
  });
  const updatedDataWithUserId = updatedDataWithEmployeeId.map((item: { [x: string]: any; email: any; }) => {
    const userId = userMapping![item.email];
    if (userId) {
      const { email, ...rest } = item;
      return {
        ...rest,
        user_id: userId,
      };
    }
  });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const updatedDataWithCompanyId = updatedDataWithUserId.map((item: any) => ({
    ...item,
    company_id: companyId,
  }));

  const { status, error: dataEntryError } =
    await createReimbursementsFromImportedData({
      supabase,
      data: updatedDataWithCompanyId,
    });

  if (isGoodStatus(status))
    return safeRedirect("/approvals/reimbursements", { status: 303 });
  if (dataEntryError) {
    throw error;
  }
}
