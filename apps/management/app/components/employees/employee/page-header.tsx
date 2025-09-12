import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useSubmit } from "@remix-run/react";
import { EmployeeOptionsDropdown } from "../employee-option-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import type {
  EmployeeDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { hasPermission, updateRole, zImage } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type React from "react";
import { useRef } from "react";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { toast } from "@canny_ecosystem/ui/use-toast";

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
  const { role } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useSubmit();

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt?.target?.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "File not uploaded, please try again!",
        variant: "destructive",
      });
      return;
    }
    const validationResult = zImage.safeParse(file);
    if (!validationResult.success) {
      toast({
        title: "Error",
        description: validationResult.error.errors
          .map((err) => err.message)
          .join("\n"),
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("returnTo", `/employees/${employee.id}/overview`);
    submit(formData, {
      method: "post",
      action: `/employees/${employee.id}/media/upload-profile-photo`,
      encType: "multipart/form-data",
    });
    clearExactCacheEntry(`${cacheKeyPrefix.employee_overview}${employee.id}`);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full flex flex-col md:flex-row gap-6 justify-between">
        <div className="flex flex-row gap-6 items-center">
          <div>
            <Avatar
              className="w-20 h-20 sm:w-28 sm:h-28 border border-muted-foreground/30 shadow-sm hover:z-40 cursor-pointer"
              onClick={() => inputRef?.current?.click()}
            >
              <>
                <AvatarImage src={employee.photo ?? undefined} />
                <AvatarFallback className="rounded-md">
                  <span className="text-md">
                    {employee.first_name?.charAt(0)}
                  </span>
                </AvatarFallback>
              </>

              <input
                ref={inputRef}
                type="file"
                style={{ display: "none" }}
                multiple={false}
                onChange={handleUpload}
              />
            </Avatar>
          </div>
          <div className="flex h-full flex-col items-start justify-start">
            <div
              className={cn(
                "rounded-sm flex items-center",
                employee.is_active ? "text-green" : "text-yellow-500"
              )}
            >
              <Icon name="dot-filled" className="mt-[1px]" />
              <p className={cn("ml-0.5 text-sm font-medium capitalize")}>
                {employee.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="mt-3">
              <h1 className="text:lg sm:text-3xl tracking-wide font-bold capitalize">
                {`${employee?.first_name} ${employee?.middle_name ?? ""} ${
                  employee?.last_name ?? ""
                }`}
              </h1>
              <p className="w-max bg-muted text-sm text-muted-foreground px-1.5 pb-0.5 mt-0.5 rounded">
                {employee?.employee_code}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start gap-3">
          <Link
            prefetch="intent"
            to={`/employees/${employee.id}/update-employee-details`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full bg-card",
              !hasPermission(
                role,
                `${updateRole}:${attribute.employeeDetails}`
              ) && "hidden"
            )}
          >
            <Icon name="edit" size="xs" className="mr-1.5" />
            <p>Edit</p>
          </Link>
          <EmployeeOptionsDropdown
            employee={{
              id: employee.id,
              is_active: employee.is_active ?? false,
              returnTo: `/employees/${employee.id}/overview`,
              companyId: employee.company_id,
            }}
            triggerChild={
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full bg-card",
                  !hasPermission(
                    role,
                    `${updateRole}:${attribute.employees}`
                  ) && "hidden"
                )}
              >
                <Icon name="dots-vertical" size="xs" className="mr-1.5" />
                <p>More Options</p>
              </DropdownMenuTrigger>
            }
          />
        </div>
      </div>
    </div>
  );
}
