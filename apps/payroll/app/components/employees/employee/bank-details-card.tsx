import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import type { EmployeeBankDetailsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (value: string) => string;
};

type EmployeeBankDetails = Omit<
  EmployeeBankDetailsDatabaseRow,
  "created_at" | "updated_at"
>;

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

export const EmployeeBankDetailsCard = ({
  bankDetails,
}: {
  bankDetails: EmployeeBankDetails | null;
}) => {
  const { role } = useUserRole();
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bank Account Details</h2>
        <Link
          prefetch="intent"
          to={`/employees/${bankDetails?.employee_id}/update-bank-details`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card",
            !bankDetails && "hidden",
            !hasPermission(role, `${updateRole}:employee_bank_details`) &&
              "hidden"
          )}
        >
          <Icon name="edit" className="mr-2" />
          Edit
        </Link>
      </div>

      {bankDetails ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DetailItem label="Bank Name" value={bankDetails.bank_name} />
          <DetailItem label="Branch Name" value={bankDetails.branch_name} />
          <DetailItem
            label="Account Holder"
            value={bankDetails.account_holder_name}
          />
          <DetailItem label="Account Type" value={bankDetails.account_type} />
          <DetailItem
            label="Account Number"
            value={bankDetails?.account_number?.replace(/^(?=.{4}$)/, "••••••")}
          />
          <DetailItem label="IFSC Code" value={bankDetails.ifsc_code} />
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No bank details available.</p>
        </div>
      )}
    </Card>
  );
};
