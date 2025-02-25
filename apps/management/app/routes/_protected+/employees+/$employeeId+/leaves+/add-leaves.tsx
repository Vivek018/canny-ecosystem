import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
  LeaveSchema,
  leaveTypeArray,
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
import type { LeavesDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { useEffect, useState } from "react";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { addLeavesFromData } from "@canny_ecosystem/supabase/mutations";
import { UPDATE_LEAVES_TAG } from "./$leaveId.update-leave";
import { getUsersByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const ADD_LEAVES_TAG = "Create_Leave";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.employeeLeaves}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const employeeId = params.employeeId;
  const { data: userData, error: userError } = await getUsersByCompanyId({
    supabase,
    companyId,
  });
  if (userError || !userData) {
    throw userError;
  }

  const userOptions = userData.map((userData) => ({
    label: userData.email!.toLowerCase(),
    value: userData.id,
  }));

  return json({ employeeId, userOptions });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: LeaveSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await addLeavesFromData({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee Leave create successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee leave create failed",
    error,
  });
}

export default function AddLeaves({
  updateValues,
  userOptionsFromUpdate,
}: {
  updateValues?: LeavesDatabaseUpdate | null;
  userOptionsFromUpdate?: ComboboxSelectOption[] | null;
}) {
  const { employeeId, userOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.employee_leaves}${employeeId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Employee Leaves created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee Leaves create failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/leaves`);
    }
  }, [actionData]);

  const LEAVES_TAG = updateValues ? UPDATE_LEAVES_TAG : ADD_LEAVES_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(LeaveSchema);

  const [form, fields] = useForm({
    id: LEAVES_TAG,
    constraint: getZodConstraint(LeaveSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LeaveSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form method='POST' {...getFormProps(form)} className='flex flex-col'>
          <Card>
            <CardHeader>
              <CardTitle className='capitalize'>
                {replaceUnderscore(LEAVES_TAG)}
              </CardTitle>
              <CardDescription className='lowercase'>
                {`${replaceUnderscore(LEAVES_TAG)} by filling this form`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <div className='grid grid-cols-2 place-content-center justify-between gap-x-8 mt-4'>
                <SearchableSelectField
                  key={resetKey}
                  className='w-full capitalize flex-1 '
                  options={transformStringArrayIntoOptions(
                    leaveTypeArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.leave_type, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.leave_type.name
                  )}`}
                  labelProps={{
                    children: "Leave Type",
                  }}
                  errors={fields.leave_type.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(fields.user_id, {
                      type: "text",
                    }),
                    placeholder: "Select an authority that approved",
                  }}
                  className='lowercase'
                  options={userOptions ?? userOptionsFromUpdate}
                  labelProps={{
                    children: "Approved By",
                  }}
                  errors={fields.user_id.errors}
                />
              </div>
              <div className='grid grid-cols-2 place-content-center justify-between gap-x-8 '>
                <Field
                  inputProps={{
                    ...getInputProps(fields.start_date, {
                      type: "date",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.start_date.name),
                  }}
                  errors={fields.start_date.errors}
                />

                <Field
                  inputProps={{
                    ...getInputProps(fields.end_date, {
                      type: "date",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.end_date.name),
                  }}
                  errors={fields.end_date.errors}
                />
              </div>

              <Field
                inputProps={{
                  ...getInputProps(fields.reason, {
                    type: "text",
                  }),

                  className: "",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.reason.name),
                }}
                errors={fields.reason.errors}
              />
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
