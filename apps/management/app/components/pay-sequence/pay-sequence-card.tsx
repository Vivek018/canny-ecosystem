import { useUser } from "@/utils/user";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
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
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  deleteRole,
  getOrdinalSuffix,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Link } from "@remix-run/react";
import type { PaySequenceDataType } from "@canny_ecosystem/supabase/queries";
import { DeletePaySequence } from "./delete-pay-sequence";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { workingDaysOptions } from "@/constant";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {

  return (
    <div className="flex flex-row items-center gap-4 text-base">
      <h3 className="text-muted-foreground tracking-wide capitalize w-40 truncate">
        {label}
      </h3>
      <p className="w-44 truncate">{value ?? "--"}</p>
    </div>
  );
};

export function PaySequenceCard({
  paySequence,
}: {
  paySequence: PaySequenceDataType;
}) {
  const { role } = useUser();

  return (
    <Card
      key={paySequence.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide capitalize">
          {paySequence.name}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`${paySequence.id}/update-pay-sequence`}
                  className={cn(
                    "p-2 rounded-md bg-secondary grid place-items-center",
                    !hasPermission(
                      `${role}`,
                      `${updateRole}:${attribute.paySequence}`
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
                  `${deleteRole}:${attribute.paySequence}`
                ) && "hidden"
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeletePaySequence id={paySequence.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-2 pb-4 px-4">
        <DetailItem
          label="Pay Day"
          value={`${getOrdinalSuffix(paySequence.pay_day)} of every month`}
        />
        <DetailItem
          label="Overtime Multiplier"
          value={paySequence.overtime_multiplier?.toString()}
        />
        <div className="flex flex-row items-center gap-4 text-base">
          <h3 className="text-muted-foreground tracking-wide capitalize w-40 truncate">
            Working Days
          </h3>

          <ToggleGroup
            type="multiple"
            variant="outline"
            className="flex gap-2"
            disabled={true}
          >
            {workingDaysOptions.map(({ label, value }) => (
              <ToggleGroupItem
                key={value}
                className={cn(
                  "flex items-center space-x-2 disabled:opacity-100",
                  paySequence.working_days.includes(Number.parseInt(value)) &&
                    "bg-secondary"
                )}
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>
        <CardFooter
          className={cn(
            "px-3 py-2 ml-auto bg-secondary text-foreground text-base tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center mt-auto",
            !paySequence.is_default && "opacity-0"
          )}
        >
          <Icon name="dot-filled" size="xs" />
          Default
        </CardFooter>
    </Card>
  );
}
