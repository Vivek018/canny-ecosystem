import type { EmployeeDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import { formatDate, replaceDash } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (value: string) => string;
};

export const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  formatter,
}) => {
  const formattedValue = value ? (formatter ? formatter(value) : value) : "--";

  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{formattedValue}</p>
    </div>
  );
};

export const EmployeeDetailsCard: React.FC<{
  employee: Omit<
    EmployeeDatabaseRow,
    "fts_vector" | "nationality" | "created_at" | "updated_at"
  >;
}> = ({ employee }) => {
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Employee Details</h2>
      {employee ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DetailItem label="First Name" value={employee?.first_name} />
          <DetailItem label="Middle Name" value={employee?.middle_name} />
          <DetailItem label="Last Name" value={employee?.last_name} />
          <DetailItem label="Gender" value={employee.gender} />
          <DetailItem
            label="Education"
            value={employee.education}
            formatter={replaceDash}
          />
          <DetailItem label="Marital Status" value={employee.marital_status} />
          <DetailItem
            label="Date of birth"
            value={employee.date_of_birth}
            formatter={formatDate}
          />
          <DetailItem label="Personal Email" value={employee.personal_email} />
          <DetailItem
            label="Primary Mobile Number"
            value={employee.primary_mobile_number}
          />
          <DetailItem
            label="Secondary Mobile Number"
            value={employee.secondary_mobile_number}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No employee data available.</p>
        </div>
      )}
    </Card>
  );
};
