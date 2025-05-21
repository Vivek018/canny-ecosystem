import type { LabourWelfareFundDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import { DeleteLabourWelfareFund } from "./delete-labour-welfare-fund";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  deleteRole,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-row items-center gap-4 text-base">
      <h3 className="text-muted-foreground tracking-wide capitalize w-44 truncate">
        {label}
      </h3>
      <p className="w-44 truncate">{value ?? "--"}</p>
    </div>
  );
};

export function LabourWelfareFundCard({
  labourWelfareFund,
}: {
  labourWelfareFund: Omit<
    LabourWelfareFundDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
  const { role } = useUser();
  return (
    <Card
      key={labourWelfareFund.id}
      className={cn(
        "w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
      )}
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide capitalize">
          {replaceUnderscore(labourWelfareFund.state)}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`${labourWelfareFund.id}/update-labour-welfare-fund`}
                  className={cn(
                    "p-2 rounded-md bg-secondary grid place-items-center",
                    !hasPermission(
                      `${role}`,
                      `${updateRole}:${attribute.statutoryFieldsLwf}`
                    ) && "hidden"
                  )}
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "p-2 py-2 rounded-md bg-secondary grid place-items-center",
                !hasPermission(
                  `${role}`,
                  `${deleteRole}:${attribute.statutoryFieldsLwf}`
                ) && "hidden"
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeleteLabourWelfareFund
                  labourWelfareFundId={labourWelfareFund.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DetailItem
          label="Employee Contribution"
          value={labourWelfareFund.employee_contribution}
        />
        <DetailItem
          label="Employer Contribution"
          value={labourWelfareFund.employer_contribution}
        />
        <DetailItem
          label="Deduction Cycle"
          value={replaceUnderscore(labourWelfareFund.deduction_cycle)}
        />
      </CardContent>
      {labourWelfareFund.status && (
        <CardFooter className="px-2.5 ml-auto bg-secondary text-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center">
          <Icon name="dot-filled" size="xs" />
          Active
        </CardFooter>
      )}
    </Card>
  );
}
