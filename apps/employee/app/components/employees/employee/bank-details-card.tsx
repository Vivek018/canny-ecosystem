import { Card } from "@canny_ecosystem/ui/card";
import type { EmployeeBankDetailsDatabaseRow } from "@canny_ecosystem/supabase/types";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

type EmployeeBankDetails = Omit<EmployeeBankDetailsDatabaseRow, "created_at">;

export const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

export const EmployeeBankDetailsCard = ({
  bankDetails,
}: {
  bankDetails: EmployeeBankDetails | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bank Account Details</h2>
      </div>

      {bankDetails ? (
        <div className="grid grid-cols-1 max-sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
