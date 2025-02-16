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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type {
  ProfessionalTaxDatabaseRow,
  ProfessionalTaxGrossSalaryRangeType,
} from "@canny_ecosystem/supabase/types";
import { DeleteProfessionalTax } from "./delete-professional-tax";
import {
  deleteRole,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@canny_ecosystem/ui/dialog";
import { Input } from "@canny_ecosystem/ui/input";
import { Fragment } from "react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  formatter?: (value: string | number) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, formatter }) => {
  const formattedValue = value ? (formatter ? formatter(value) : value) : "--";

  return (
    <div className="flex flex-row items-center gap-4 text-base">
      <h3 className="text-muted-foreground tracking-wide capitalize w-40 truncate">
        {label}
      </h3>
      <p className="w-44 truncate">{formattedValue}</p>
    </div>
  );
};

export function ProfessionalTaxCard({
  professionalTax,
}: {
  professionalTax: Omit<
    ProfessionalTaxDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
  const { role } = useUser();
  const grossSalaryRangeJson = JSON.parse(
    String(professionalTax?.gross_salary_range) ?? "",
  ) as ProfessionalTaxGrossSalaryRangeType;

  return (
    <Card
      key={professionalTax.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {replaceUnderscore(professionalTax.state)}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`${professionalTax.id}/update-professional-tax`}
                  className={cn(
                    "p-2 rounded-md bg-secondary grid place-items-center",
                    !hasPermission(
                      `${role}`,
                      `${updateRole}:${attribute.statutoryFieldsPf}`,
                    ) && "hidden",
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
                  `${deleteRole}:${attribute.statutoryFieldsPf}`,
                ) && "hidden",
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeleteProfessionalTax professionalTaxId={professionalTax.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-2 pb-4 px-4">
        <DetailItem label="PT Number" value={professionalTax.pt_number} />
        <DetailItem
          label="Deduction Cycle"
          value={professionalTax.deduction_cycle}
        />
        <div className="flex flex-row items-center gap-4 text-base">
          <h3 className="text-muted-foreground tracking-wide capitalize w-40 truncate">
            Gross Salary Range
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="h-min py-0 px-0">
                View Salary Range
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Gross Salary Range</DialogTitle>
              <DialogDescription className="grid grid-cols-3 place-content-center justify-between gap-6 py-4">
                {grossSalaryRangeJson?.map((salaryRange, index) => {
                  return (
                    <Fragment key={String(index)}>
                      <Input
                        value={salaryRange.start}
                        disabled={true}
                        className="disabled:opacity-100 disabled:cursor-text"
                      />
                      <Input
                        value={salaryRange.end}
                        disabled={true}
                        className="disabled:opacity-100 disabled:cursor-text"
                      />
                      <Input
                        value={salaryRange.value}
                        disabled={true}
                        className="disabled:opacity-100 disabled:cursor-text border-muted-foreground"
                      />
                    </Fragment>
                  );
                })}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
