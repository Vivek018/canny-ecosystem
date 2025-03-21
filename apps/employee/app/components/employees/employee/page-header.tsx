import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@canny_ecosystem/ui/avatar";
import type {
  EmployeeDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";

export function EmployeePageHeader({
  employee,
}: {
  employee: Pick<
    EmployeeDatabaseRow,
    | "id"
    | "is_active"
    | "photo"
    | "first_name"
    | "middle_name"
    | "last_name"
    | "employee_code"
    | "company_id"
  >;
  env: SupabaseEnv;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full flex flex-row gap-6 justify-between">
        <div className="flex flex-row max-sm:flex-col max-sm:mx-auto gap-6 items-center">
          <div>
            <Avatar
              className={cn(
                "w-28 h-28 border border-muted-foreground/30 shadow-sm hover:z-40",
              )}
            >
              {employee?.photo ? (
                <AvatarImage src={employee?.photo} alt={employee?.first_name} />
              ) : null}
              <AvatarFallback>
                <span className="md:text-lg tracking-wider uppercase">
                  {employee?.first_name?.charAt(0)}
                </span>
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex h-full flex-col items-start justify-start max-sm:items-center">
            <div
              className={cn(
                "rounded-sm flex items-center",
                employee.is_active ? "text-green" : "text-yellow-500",
              )}
            >
              <Icon name="dot-filled" className="mt-[1px]" />
              <p className={cn("ml-0.5 text-sm font-medium capitalize")}>
                {employee.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="mt-3">
              <h1 className="text-3xl tracking-wide font-bold capitalize text-center max-sm:mb-2">
                {`${employee?.first_name} ${employee?.middle_name ?? ""} ${employee?.last_name ?? ""
                  }`}
              </h1>
              <p className="w-max bg-muted text-sm text-muted-foreground px-1.5 pb-0.5 mt-0.5 rounded max-sm:mx-auto">
                {employee?.employee_code}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
