import { Card } from "@canny_ecosystem/ui/card";
import { Link } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import type { ExitsRow } from "@canny_ecosystem/supabase/types";
import {
  createRole,
  deleteRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { ExitsDropdown } from "../exits-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p className="truncate w-80">{value ?? "--"}</p>
    </div>
  );
};

export const ExitsItem = ({ exitsData }: { exitsData: any }) => {
  return (
    <section className="w-full select-text cursor-auto h-full flex flex-col justify-start p-4">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li>
          <DetailItem
            label="Employee Payable Days"
            value={exitsData?.payable_days}
          />
        </li>
        <li>
          <DetailItem
            label="Last Working Day"
            value={formatDate(exitsData?.last_working_day)}
          />
        </li>
        <li>
          <DetailItem
            label="Final Settlement Date"
            value={formatDate(exitsData.final_settlement_date)}
          />
        </li>
        <li>
          <DetailItem
            label="Exit Reason"
            value={replaceUnderscore(exitsData.reason)}
          />
        </li>
        <li>
          <DetailItem label="Bonus" value={`₹${exitsData?.bonus}`} />
        </li>
        <li>
          <DetailItem
            label="Leave Encashment"
            value={`₹${exitsData.leave_encashment}`}
          />
        </li>
        <li>
          <DetailItem label="Gratuity" value={`₹${exitsData.gratuity}`} />
        </li>
        <li>
          <DetailItem label="Deduction" value={`₹${exitsData?.deduction}`} />
        </li>
        <li>
          <DetailItem label="Note" value={exitsData?.note} />
        </li>
      </ul>
    </section>
  );
};

export const ExitsCard = ({
  exitsData,
  employeeId,
}: {
  exitsData: Omit<ExitsRow, "created_at"> | null;
  employeeId: string;
}) => {
  const { role } = useUser();

  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex flex-col items-start gap-3 md:flex-row justify-between md:items-center mb-6 max-sm:mb-4">
        <h2 className="text-xl font-semibold">Exits</h2>
        <div>
          {exitsData ? (
            <div className="flex gap-4">
              <Link
                to={`/employees/${employeeId}/payments/${exitsData.id}/update-exit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "bg-card",
                  !hasPermission(
                    `${role}`,
                    `${updateRole}:${attribute.employeeExits}`,
                  ) && "hidden",
                )}
              >
                <Icon name={"edit"} className="mr-2" />
                Update
              </Link>
              <ExitsDropdown
                exitId={exitsData.id}
                employeeId={employeeId}
                triggerChild={
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "bg-card",
                      !hasPermission(
                        role,
                        `${updateRole}:${attribute.employeeExits}`,
                      ) && "hidden",
                      !hasPermission(
                        `${role}`,
                        `${deleteRole}:${attribute.employeeExits}`,
                      ) && "hidden",
                    )}
                  >
                    <Icon name="dots-vertical" size="xs" className="mr-1.5" />
                    <p>More Options</p>
                  </DropdownMenuTrigger>
                }
              />
            </div>
          ) : (
            <Link
              to={`/employees/${employeeId}/payments/create-exit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "bg-card",
                !hasPermission(
                  `${role}`,
                  `${createRole}:${attribute.employeeExits}`,
                ) && "hidden",
              )}
            >
              <Icon name={"plus-circled"} className="mr-2" />
              Create
            </Link>
          )}
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {exitsData ? (
          <div className="flex items-center gap-4 min-w-max">
            <ExitsItem exitsData={exitsData} />
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Exit data not found</p>
          </div>
        )}
      </div>
    </Card>
  );
};
