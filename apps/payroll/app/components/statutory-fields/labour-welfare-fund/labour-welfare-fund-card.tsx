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
import { replaceUnderscore } from "@canny_ecosystem/utils";

export function LabourWelfareFundCard({
  labourWelfareFund,
}: {
  labourWelfareFund: Omit<LabourWelfareFundDatabaseRow, "created_at" | "updated_at">;
}) {
  return (
    <Card
      key={labourWelfareFund.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">{labourWelfareFund.state}</CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/payment-components/statutory-fields/${labourWelfareFund.id}/update-labour-welfare-fund`}
                  className="p-2 rounded-md bg-secondary grid place-items-center"
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center">
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeleteLabourWelfareFund labourWelfareFundId={labourWelfareFund.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 w-full">
        <div className="flex justify-between">
          <span className="font-medium">Employee Contribution:</span>
          <span>{labourWelfareFund.employee_contribution}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Employer Contribution:</span>
          <span>{labourWelfareFund.employer_contribution}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Deduction Cycle:</span>
          <span>{replaceUnderscore(labourWelfareFund.deduction_cycle)}</span>
        </div>
      </CardContent>
      {
        labourWelfareFund.status && <CardFooter
          className="px-2.5 ml-auto bg-secondary text-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center"
        >
          <Icon name="dot-filled" size="xs" />Active
        </CardFooter>
      }
    </Card>
  );
}
