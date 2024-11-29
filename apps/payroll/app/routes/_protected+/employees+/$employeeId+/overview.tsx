import { EmployeeAddressesCard } from "@/components/employees/employee/addresses-card";
import { EmployeeBankDetailsCard } from "@/components/employees/employee/bank-details-card";
import { EmployeeDetailsCard } from "@/components/employees/employee/details-card";
import { EmployeeGuardiansCard } from "@/components/employees/employee/guardians-card";
import { EmployeePageHeader } from "@/components/employees/employee/page-header";
import { EmployeeStatutoryCard } from "@/components/employees/employee/statutory-card";
import {
  getEmployeeAddressesByEmployeeId,
  getEmployeeBankDetailsById,
  getEmployeeById,
  getEmployeeGuardiansByEmployeeId,
  getEmployeeStatutoryDetailsById,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data, error } = await getEmployeeById({
    supabase,
    id: employeeId ?? "",
  });

  if (error) {
    return json({
      status: "error",
      message: "Failed to get employee",
      error,
      data: null,
    });
  }

  if (!data) {
    return json({
      status: "error",
      message: "Employee not found",
      error,
      data: null,
    });
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
    status: "success",
    message: "Employee found",
    error: null,
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
    error,
    status,
  } = useLoaderData<typeof loader>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load employee",
        variant: "destructive",
      });
      navigate("/employees", { replace: true });
    }
  }, []);

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
