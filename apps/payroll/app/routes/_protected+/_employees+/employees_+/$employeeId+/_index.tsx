import { EmployeeAddressesCard } from "@/components/employees/employee/addresses-card";
import { EmployeeBankDetailsCard } from "@/components/employees/employee/bank-details-card";
import { EmployeeDetailsCard } from "@/components/employees/employee/details-card";
import { EmployeeGuardiansCard } from "@/components/employees/employee/guardians-card";
import { EmployeePageHeader } from "@/components/employees/employee/page-header";
import { EmployeeStatutoryCard } from "@/components/employees/employee/statutory-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getEmployeeAddressesByEmployeeId,
  getEmployeeBankDetailsById,
  getEmployeeById,
  getEmployeeGuardiansByEmployeeId,
  getEmployeeStatutoryDetailsById,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data, error } = await getEmployeeById({
    supabase,
    id: employeeId ?? "",
    companyId,
  });

  if (error) {
    return safeRedirect("/employees", { status: 303 });
  }

  if (!data) {
    throw new Error("No data found");
  }

  const { data: employeeStatutoryData } = await getEmployeeStatutoryDetailsById(
    {
      supabase,
      id: employeeId ?? "",
    },
  );

  const { data: employeeBankData } = await getEmployeeBankDetailsById({
    supabase,
    id: employeeId ?? "",
  });

  const { data: employeeAddresses } = await getEmployeeAddressesByEmployeeId({
    supabase,
    employeeId: employeeId ?? "",
  });

  const { data: employeeGuardians } = await getEmployeeGuardiansByEmployeeId({
    supabase,
    employeeId: employeeId ?? "",
  });

  return json({
    data,
    employeeStatutoryData,
    employeeBankData,
    employeeAddresses,
    employeeGuardians,
  });
}

export default function EmployeeIndex() {
  const {
    data,
    employeeStatutoryData,
    employeeBankData,
    employeeAddresses,
    employeeGuardians,
  } = useLoaderData<typeof loader>();

  return (
    <div className="w-full my-8 flex flex-col gap-8">
      <EmployeePageHeader employee={data} />
      <EmployeeDetailsCard employee={data} />
      <EmployeeStatutoryCard employeeStatutory={employeeStatutoryData} />
      <EmployeeBankDetailsCard bankDetails={employeeBankData} />
      <EmployeeAddressesCard employeeAddresses={employeeAddresses} />
      <EmployeeGuardiansCard employeeGuardians={employeeGuardians} />
    </div>
  );
}
