import type { EmployeeStatutoryDetailsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate } from "@canny_ecosystem/utils";
import { Link } from "@remix-run/react";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (value: string) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, formatter }) => {
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

type EmployeeStatutoryDetails = Omit<
  EmployeeStatutoryDetailsDatabaseRow,
  "created_at" | "updated_at"
>;

export const EmployeeStatutoryCard: React.FC<{
  employeeStatutory: EmployeeStatutoryDetails | null;
}> = ({ employeeStatutory }) => {
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl font-semibold">Statutory Details</h2>
        <Link
          prefetch="intent"
          to={`/${employeeStatutory?.employee_id}/update-employee-statutory`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card",
            !employeeStatutory && "hidden",
          )}
        >
          <Icon name="edit" className="mr-2" />
          Edit
        </Link>
      </div>

      {employeeStatutory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DetailItem
            label="Aadhaar Number"
            value={employeeStatutory.aadhaar_number}
          />
          <DetailItem label="PAN Number" value={employeeStatutory.pan_number} />
          <DetailItem label="UAN Number" value={employeeStatutory.uan_number} />
          <DetailItem label="PF Number" value={employeeStatutory.pf_number} />
          <DetailItem
            label="ESIC Number"
            value={employeeStatutory.esic_number}
          />
          <DetailItem
            label="Driving License Number"
            value={employeeStatutory.driving_license_number}
          />
          <DetailItem
            label="Driving License Expiry"
            value={employeeStatutory.driving_license_expiry}
            formatter={formatDate}
          />
          <DetailItem
            label="Passport Number"
            value={employeeStatutory.passport_number}
          />
          <DetailItem
            label="Passport Expiry"
            value={employeeStatutory.passport_expiry}
            formatter={formatDate}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No statutory data available.</p>
        </div>
      )}
    </Card>
  );
};
