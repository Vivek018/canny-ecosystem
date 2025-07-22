import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
  z,
  getInitialValueFromZod,
  AttendanceSchema,
  getYears,
  defaultYear,
} from "@canny_ecosystem/utils";

import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";
import type {
  EmployeeMonthlyAttendanceDatabaseInsert,
} from "@canny_ecosystem/supabase/types";
import { getEmployeesBySiteId, getSiteNamesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { useEffect, useState } from "react";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute, payoutMonths } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Label } from "@canny_ecosystem/ui/label";
import { AddAttendance } from "@canny_ecosystem/supabase/mutations";

export const ADD_ATTENDANCES_TAG = "Add_Attendance";
const BulkAttendanceSchema = z.object(
  {
    singleValue: AttendanceSchema.pick({ month: true, year: true }),
    attendances: z.array(AttendanceSchema.pick({
      employee_id: true,
      present_days: true,
      overtime_hours: true,
      working_days: true,
      absent_days: true,
      working_hours: true,
      paid_holidays: true,
      paid_leaves: true,
      casual_leaves: true
    }))
  }
);

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${createRole}:${attribute.attendance}`
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const url = new URL(request.url);
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const searchParams = new URLSearchParams(url.searchParams);

  const { data: siteData } = await getSiteNamesByCompanyId({ supabase, companyId });

  const site = searchParams.get("site") ?? "";

  let employeeData = null;
  if (site) {
    const { data } = await getEmployeesBySiteId({ supabase, siteId: site });
    employeeData = data;
  }

  const siteOptions = siteData?.map((siteData) => ({
    label: siteData.name,
    pseudoLabel: siteData?.projects?.name,
    value: siteData.id,
  }));

  const employeeOptions = employeeData?.map((employeeData: any) => ({
    label: employeeData.employee_code as string,
    pseudoLabel: `${employeeData?.first_name
      } ${employeeData?.middle_name ?? ""} ${employeeData?.last_name ?? ""
      }`,
    value: employeeData.id as string,
  }));

  return json({ siteOptions, employeeOptions, companyId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: BulkAttendanceSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const data = submission.value.attendances.map((value) => ({
    ...value,
    ...submission.value.singleValue,
  }));

  const { status, error } = await AddAttendance({ supabase, data: data as unknown as EmployeeMonthlyAttendanceDatabaseInsert });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee Attendance Create Successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee Attendance Create Failed",
    error,
  });
}

export default function AddBulkAttendances() {
  const { siteOptions, employeeOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const site = searchParams.get("site");
  const navigate = useNavigate();

  const initialValues = getInitialValueFromZod(BulkAttendanceSchema);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.attendance);
        toast({
          title: "Success",
          description: actionData?.message || "Attendance Created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ?? actionData?.message ?? "Attendance Create Failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/attendance");
    }
  }, [actionData]);

  const ATTENDANCES_TAG = ADD_ATTENDANCES_TAG;

  const [form, fields] = useForm({
    id: ATTENDANCES_TAG,
    constraint: getZodConstraint(BulkAttendanceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: BulkAttendanceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: { attendances: initialValues.attendances },
  });

  const singleField = fields.singleValue.getFieldset();

  const addAttendance = () => {
    if (form.value?.attendances) {
      form.update({
        value: {
          ...form.value,
          attendances: [...form.value?.attendances as any, initialValues.attendances]
        }
      })
    } else {
      form.update({
        value: {
          ...form.value,
          attendances: [initialValues.attendances]
        }
      })
    }
  }

  const removeAttendance = (index: number) => {
    if (form.value?.attendances) {
      const updated = [...form.value.attendances];
      updated.splice(index, 1);

      form.update({
        value: {
          ...form.value,
          attendances: updated
        }
      });
    }
  }

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {`${replaceUnderscore(ATTENDANCES_TAG)}s`}
              </CardTitle>
              <CardDescription className="lowercase">
                {`${replaceUnderscore(ATTENDANCES_TAG)}s by filling this form`}
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col px-6">
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8">
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(singleField.month, { type: "text" }),
                    placeholder: "Select Month",
                  }}
                  options={payoutMonths}
                  labelProps={{
                    children: "Month",
                  }}
                  errors={singleField.month.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(singleField.year, { type: "text" }),
                    placeholder: "Select Year",
                  }}
                  options={transformStringArrayIntoOptions(
                    getYears(25, defaultYear) as unknown as string[]
                  )}
                  labelProps={{
                    children: "Year",
                  }}
                  errors={singleField.year.errors}
                />
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                <Label>Site</Label>
                <Combobox
                  key={resetKey + 3}
                  placeholder="Select Site to filter Employees"
                  className="mb-6 w-full"
                  options={siteOptions ?? []}
                  value={site ?? ""}
                  onChange={(value) => {
                    searchParams.set("site", value);
                    if (!value.length) {
                      searchParams.delete("site")
                    }
                    setSearchParams(searchParams);
                  }}
                />
              </div>
            </div>
            <CardContent className="max-h-[190px] overflow-scroll mb-4 border mx-6 py-4 rounded-md">
              {fields?.attendances.getFieldList().map((fieldSet, index) => {
                const field = fieldSet.getFieldset();
                return (
                  <div key={String(fields?.attendances.key! + index + resetKey + 4)} className="flex flex-row items-center justify-center gap-1.5">
                    <div className="mb-6 py-[7px] px-3 border shadow rounded text-sm">{index + 1}</div>
                    <SearchableSelectField
                      key={String(resetKey + site! + index + 5)}
                      inputProps={{
                        ...getInputProps(field.employee_id, { type: "text" }),
                        placeholder: "Select Employee",
                      }}
                      options={employeeOptions ?? []}
                      errors={field.employee_id.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.present_days, { type: "number" }),
                        placeholder: 'PR Days',
                      }}
                      errors={field.present_days.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.overtime_hours, { type: "number" }),
                        placeholder: 'OT Hrs',
                      }}
                      errors={field.overtime_hours.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.working_days, { type: "number" }),
                        placeholder: 'WO Days',
                      }}
                      errors={field.working_days.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.absent_days, { type: "number" }),
                        placeholder: 'AB Days',
                      }}
                      errors={field.absent_days.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.working_hours, { type: "number" }),
                        placeholder: 'WO Hrs',
                      }}
                      errors={field.working_hours.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.paid_holidays, { type: "number" }),
                        placeholder: 'PH Days',
                      }}
                      errors={field.paid_holidays.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.paid_leaves, { type: "number" }),
                        placeholder: 'PA Leaves',
                      }}
                      errors={field.paid_leaves.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.casual_leaves, { type: "number" }),
                        placeholder: 'CA Leaves',
                      }}
                      errors={field.casual_leaves.errors}
                    />
                    <Button
                      type="button"
                      onClick={() => removeAttendance(index)}
                      variant="destructive-outline"
                      className="mb-6 h-min py-2.5"
                    >
                      <Icon name="cross" />
                    </Button>
                  </div>
                )
              })}
              <Button
                type="button"
                onClick={addAttendance}
                variant="primary-outline"
                size="full"
              >
                <Icon name="plus-circled" className="mr-2" /> Add Attendance
              </Button>
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
