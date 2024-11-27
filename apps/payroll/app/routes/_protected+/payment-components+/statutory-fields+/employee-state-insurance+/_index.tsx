import { DeleteEmployeeStateInsurance } from "@/components/statutory-fields/employee-state-insurance/delete-employee-state-insurance";
import { ESINoData } from "@/components/statutory-fields/employee-state-insurance/esi-no-data";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeStateInsuranceByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data } = await getEmployeeStateInsuranceByCompanyId({
    supabase,
    companyId,
  });
  return json({ data });
};

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`flex gap-1 max-md:flex-col ${className ?? ""}`}>
      <div className="w-60 text-muted-foreground">{label}</div>
      <div className="w-96 self-start">{value || "-"}</div>
    </div>
  );
};

export default function EmployeeStateInsuranceIndex() {
  const { data } = useLoaderData<typeof loader>();

  if (!data) return <ESINoData />;
  return (
    <div className="p-4 w-full">
      <div>
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Employees' State Insurance</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/employee-state-insurance/${data?.id}/update-esi`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex flex-col mb-2 justify-between gap-6 w-full">
          <DetailItem label="ESI Number" value={data?.esi_number || "-"} />
          <DetailItem
            label="Deduction Cycle"
            value={replaceUnderscore(data?.deduction_cycle) || "-"}
            className="capitalize"
          />
          <DetailItem
            label="Employees' Contribution"
            value={`${data?.employees_contribution * 100}% of Gross Pay`}
          />
          <DetailItem
            label="Employer's Contribution"
            value={`${data?.employers_contribution * 100}% of Gross Pay`}
          />
        </div>
        <hr className="my-6" />
        <div>
          <DeleteEmployeeStateInsurance employeeStateInsuranceId={data?.id} />
        </div>
      </div>
    </div>
  );
}
