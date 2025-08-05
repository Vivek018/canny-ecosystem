import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { EmployeeGuardianDatabaseRow } from "@canny_ecosystem/supabase/types";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

type EmployeeGuardian = Omit<
  EmployeeGuardianDatabaseRow,
  "created_at" 
>;

export const GuardianItem = ({ guardian }: { guardian: EmployeeGuardian }) => {
  return (
    <Card
      key={guardian.id}
      className="w-[420px] max-sm:w-11/12 shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {guardian.relationship ?? "--"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col px-4 pt-1 pb-4 gap-3">
        <div className="grid grid-cols-2 max-sm:gap-2">
          <DetailItem
            label="Name"
            value={`${guardian.first_name ?? "--"} ${
              guardian.last_name ?? "--"
            }`}
          />
          <DetailItem label="Date of Birth" value={guardian.date_of_birth} />
          <DetailItem label="Gender" value={guardian.gender} />
          <DetailItem label="Mobile Number" value={guardian.mobile_number} />
          <DetailItem
            label="Alternate Number"
            value={guardian.alternate_mobile_number}
          />
        </div>
        <div className="mt-1.5 flex flex-row items-center justify-between max-sm:flex-col max-sm:items-start">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Icon
              name={guardian.is_emergency_contact ? "check" : "cross"}
              size="sm"
              className={cn(
                "dark:mt-[1px]",
                guardian.is_emergency_contact
                  ? "text-green"
                  : "text-destructive",
              )}
            />
            <p>Is emergency contact</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Icon
              name={guardian.address_same_as_employee ? "check" : "cross"}
              size="sm"
              className={cn(
                "dark:mt-[1px]",
                guardian.address_same_as_employee
                  ? "text-green"
                  : "text-destructive",
              )}
            />
            <p>Address same as employee</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EmployeeGuardiansCard = ({
  employeeGuardians,
}: {
  employeeGuardians: EmployeeGuardian[] | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Guardians Details</h2>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {employeeGuardians?.length ? (
          <div className="flex items-center gap-4 min-w-max">
            {employeeGuardians.map((guardian, index) => (
              <GuardianItem
                key={guardian?.id + index.toString()}
                guardian={guardian}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No guardians details available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
