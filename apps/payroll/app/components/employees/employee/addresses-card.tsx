import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { EmployeeAddressDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { DeleteAddress } from "./delete-address";
import { replaceUnderscore } from "@canny_ecosystem/utils";

type EmployeeAddress = Omit<
  EmployeeAddressDatabaseRow,
  "country" | "created_at" | "updated_at"
>;

export const AddressItem = ({ address }: { address: EmployeeAddress }) => {
  return (
    <Card
      key={address.id}
      className="w-[420px] shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {address.address_type ?? "--"}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/employees/${address.employee_id}/${address.id}/update-employee-address`}
                  className={cn(
                    buttonVariants({ variant: "muted" }),
                    "px-2.5 h-min",
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
                buttonVariants({ variant: "muted" }),
                "px-2.5 h-min",
              )}
            >
              <Icon name="dots" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={cn(
                    "py-2 text-[13px]",
                    !address.latitude && "hidden",
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(String(address.latitude));
                  }}
                >
                  Copy Latitude
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "py-2 text-[13px]",
                    !address.longitude && "hidden",
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(String(address.longitude));
                  }}
                >
                  Copy Longitude
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={cn(
                    !address.latitude && !address.longitude && "hidden",
                  )}
                />
                <DeleteAddress
                  employeeId={address.employee_id}
                  addressId={address.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <address className="not-italic line-clamp-3">
          {`${address.address_line_1 ?? "--"} ${address.address_line_2 ? address.address_line_2 : ""}`}
        </address>
        <div className="flex items-center capitalize gap-2">
          <p>{`${address.city ?? "--"},`}</p>
          <p>{`${replaceUnderscore(address.state ?? "--")}`}</p>
          <p>{`- ${address.pincode ?? "--"}`}</p>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "px-2.5 ml-auto bg-secondary text-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
          !address.is_primary && "opacity-0",
        )}
      >
        <Icon name="dot-filled" size="xs" />
        Primary
      </CardFooter>
    </Card>
  );
};

export const EmployeeAddressesCard = ({
  employeeAddresses,
}: {
  employeeAddresses: EmployeeAddress[] | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Addresses</h2>
        <div>
          <Link
            to="add-employee-address"
            className={cn(buttonVariants({ variant: "outline" }), "bg-card")}
          >
            <Icon name="plus-circled" className="mr-2" />
            Add
          </Link>
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {employeeAddresses?.length ? (
          <div className="flex items-center gap-4 min-w-max">
            {employeeAddresses.map((address, index) => (
              <AddressItem
                key={address?.id + index.toString()}
                address={address}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No employee addresses available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
