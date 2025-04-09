import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { updateOrAddAttendance } from "@canny_ecosystem/supabase/mutations";
import { getAttendanceByEmployeeIdAndDate } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import { Button } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  AttendanceDataSchema,
  attendanceHolidayTypeArray,
  attendanceWorkShiftArray,
  deleteRole,
  getInitialValueFromZod,
  getValidDateForInput,
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useEffect } from "react";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { useUser } from "@/utils/user";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.employeeAttendance}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const employeeId = params.employeeId!;
  const date = params.date;

  const { data, error } = await getAttendanceByEmployeeIdAndDate({
    employeeId,
    date: date!,
    supabase,
  });

  if (error) {
    console.error("Attendance", error);
  }
  return { updatableData: data, employeeId, date, error };
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.attendance}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: AttendanceDataSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const attendanceData = submission.value;
  const { type, ...filteredData } = attendanceData;

  const { status, error } = await updateOrAddAttendance({
    supabase,
    data: filteredData,
    type,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee attendance update successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee attendance update failed",
    error,
  });
}

export default function UpdateAttendance() {
  const { role } = useUser();
  const submit = useSubmit();

  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updatableData, employeeId, date } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.attendance}${employeeId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Employee address updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee address update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/attendance`);
    }
  }, [actionData]);

  const initialValues =
    updatableData ?? getInitialValueFromZod(AttendanceDataSchema);

  const [form, fields] = useForm({
    id: "update-attendance",
    constraint: getZodConstraint(AttendanceDataSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: AttendanceDataSchema,
      });
    },
    defaultValue: {
      ...initialValues,
      date: initialValues.date ?? getValidDateForInput(date),
      employee_id: initialValues.employee_id ?? employeeId,
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  const handleDelete = () => {
    submit(
      {
        employeeId,
      },
      {
        method: "post",
        action: `/employees/${employeeId}/attendance/${date}/delete-attendance`,
        replace: true,
      }
    );
  };

  const onChange = () => {
    navigate(-1);
  };
  return (
    <Dialog open={true} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {updatableData ? "Update" : "Add"} Attendance
          </DialogTitle>
        </DialogHeader>
        <FormProvider context={form.context}>
          <Form method="POST" {...getFormProps(form)}>
            <input {...getInputProps(fields.employee_id, { type: "hidden" })} />

            <input
              type="hidden"
              name="type"
              value={updatableData ? "update" : "add"}
            />
            <div
              className="grid mt-4
 grid-cols-2 place-content-center justify-between gap-3"
            >
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.date, { type: "date" }),
                  placeholder: replaceUnderscore(fields.date.name),
                  readOnly: true,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.date.name),
                }}
                errors={fields.date.errors}
              />
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.no_of_hours, { type: "number" }),
                  placeholder: "No Of Hours",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.no_of_hours.name),
                }}
                errors={fields.no_of_hours.errors}
              />
            </div>
            <div
              className="grid mt-4
 grid-cols-2 place-content-center justify-between gap-3"
            >
              <CheckboxField
                className=""
                buttonProps={getInputProps(fields.present, {
                  type: "checkbox",
                })}
                labelProps={{
                  children: "Present",
                }}
              />

              <CheckboxField
                className=""
                buttonProps={getInputProps(fields.holiday, {
                  type: "checkbox",
                })}
                labelProps={{
                  children: "Holiday",
                }}
              />
            </div>
            <div className="grid grid-cols-2 place-content-center mt-4 justify-between gap-3">
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  attendanceWorkShiftArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.working_shift, { type: "text" }),
                }}
                placeholder={"Select Shift"}
                labelProps={{
                  children: "Working Shift",
                }}
                errors={fields.working_shift.errors}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  attendanceHolidayTypeArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.holiday_type, { type: "text" }),
                }}
                placeholder={"Select Holiday Type"}
                labelProps={{
                  children: "Holiday Type",
                }}
                errors={fields.holiday_type.errors}
              />
            </div>
          </Form>
        </FormProvider>
        <div
          className={cn(
            "flex  pb-0 h-10",
            updatableData ? "justify-between" : "justify-end"
          )}
        >
          {updatableData && (
            <Button
              className={
                cn(
                  "h-10",
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.employeeAddresses}`
                  )
                ) && "hidden"
              }
              variant={"destructive-outline"}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <FormButtons
            className="mr-[-29px] pb-0 relative left-52"
            form={form}
            setResetKey={setResetKey}
            isSingle={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
