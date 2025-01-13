import { Icon } from "@canny_ecosystem/ui/icon";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { Link } from "@remix-run/react";
import { DeleteEmployeeStateInsurance } from "./delete-employee-state-insurance";
import type { EmployeeStateInsuranceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { ESINoData } from "./esi-no-data";
import { ErrorBoundary } from "@/components/error-boundary";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`flex gap-1 max-md:flex-col ${className ?? ""}`}>
      <div className='w-60 text-muted-foreground'>{label}</div>
      <div className='w-96 self-start'>{value || "-"}</div>
    </div>
  );
};

export function ESIWrapper({
  data,
  error,
}: {
  data: Omit<
    EmployeeStateInsuranceDatabaseRow,
    "created_at" | "updated_at"
  > | null;
  error: Error | null | { message: string };
}) {
  if (error)
    return <ErrorBoundary error={error} message='Failed to load ESI' />;
  if (!data) return <ESINoData />;

  return (
    <div className='p-4 w-full'>
      <div>
        <div className='flex items-center gap-5 mb-8'>
          <h4 className='text-lg font-semibold'>Employees' State Insurance</h4>
          <Link
            prefetch='intent'
            to={`/payment-components/statutory-fields/employee-state-insurance/${data?.id}/update-esi`}
            className='p-2 rounded-full bg-secondary grid place-items-center'
          >
            <Icon name='edit' size='sm' />
          </Link>
        </div>
        <div className='flex flex-col mb-2 justify-between gap-6 w-full'>
          <DetailItem label='ESI Number' value={data?.esi_number || "-"} />
          <DetailItem
            label='Deduction Cycle'
            value={replaceUnderscore(data?.deduction_cycle) || "-"}
            className='capitalize'
          />
          <DetailItem
            label="Employees' Contribution"
            value={`${data?.employees_contribution * 100}% of Gross Pay`}
          />
          <DetailItem
            label="Employer's Contribution"
            value={`${data?.employers_contribution * 100}% of Gross Pay`}
          />
          <DetailItem label='Max Limit' value={data?.max_limit} />
        </div>
        <hr className='my-6' />
        <div>
          <DeleteEmployeeStateInsurance employeeStateInsuranceId={data?.id} />
        </div>
      </div>
    </div>
  );
}
