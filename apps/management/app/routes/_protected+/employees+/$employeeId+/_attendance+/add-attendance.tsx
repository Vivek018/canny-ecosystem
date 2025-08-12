import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  getInitialValueFromZod,
  isGoodStatus,
  createRole,
  hasPermission,
  AttendanceSchema,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  getYears,
  defaultYear,
} from "@canny_ecosystem/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import type { EmployeeMonthlyAttendanceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { attribute, payoutMonths } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { AddAttendance } from "@canny_ecosystem/supabase/mutations";
import { UPDATE_ATTENDANCE_TAG } from "../../../time-tracking+/attendance+/$attendanceId.update-attendance";

export const CREATE_ATTENDANCE_TAG = "Create-Attendance";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.attendance}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const employeeId = params.employeeId;

  return json({ employeeId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: AttendanceSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }
    const data = submission.value;

    const { status, error } = await AddAttendance({
      supabase,
      data,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Attedance registered successfully",
        error: null,
        returnTo: "/time-tracking/attendance",
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to register attendance",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  }
}

export default function AddMonthlyAttendance({
  updateValues,
}: {
  updateValues?: EmployeeMonthlyAttendanceDatabaseUpdate | null;
}) {
  const { employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearCacheEntry(cacheKeyPrefix.attendance);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      }
      if (actionData.status === "error") {
        toast({
          title: "Error",
          description: actionData?.error?.message ?? actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  const ATTENDANCE_TAG = updateValues
    ? UPDATE_ATTENDANCE_TAG
    : CREATE_ATTENDANCE_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(AttendanceSchema);

  const [form, fields] = useForm({
    id: ATTENDANCE_TAG,
    constraint: getZodConstraint(AttendanceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AttendanceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className="flex flex-col w-full mx-auto lg:px-10 xl:px-14 2xl:px-40 p-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>
                {updateValues ? "Update" : "Add"} Attendance
              </CardTitle>
              <CardDescription>
                {updateValues ? "Update" : "Add"} the Attendance here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.month, { type: "text" }),
                    placeholder: "Select Month",
                  }}
                  options={payoutMonths}
                  labelProps={{
                    children: "Month",
                  }}
                  errors={fields.month.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(fields.year, { type: "text" }),
                    placeholder: "Select Year",
                  }}
                  options={transformStringArrayIntoOptions(
                    getYears(25, defaultYear) as unknown as string[],
                  )}
                  labelProps={{
                    children: "Year",
                  }}
                  errors={fields.year.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.working_days, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.working_days.name,
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.working_days.name),
                  }}
                  errors={fields.working_days.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.present_days, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.present_days.name,
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.present_days.name),
                  }}
                  errors={fields.present_days.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.absent_days, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.absent_days.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.absent_days.name),
                  }}
                  errors={fields.absent_days.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.paid_holidays, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.paid_holidays.name,
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.paid_holidays.name),
                  }}
                  errors={fields.paid_holidays.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.working_hours, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.working_hours.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.working_hours.name),
                  }}
                  errors={fields.working_hours.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.overtime_hours, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.overtime_hours.name,
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.overtime_hours.name),
                  }}
                  errors={fields.overtime_hours.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.paid_leaves, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.paid_leaves.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.paid_leaves.name),
                  }}
                  errors={fields.paid_leaves.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.casual_leaves, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.casual_leaves.name,
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.casual_leaves.name),
                  }}
                  errors={fields.casual_leaves.errors}
                />
              </div>
            </CardContent>
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
