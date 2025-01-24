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
import {
  EmployeeWorkHistorySchema,
  getInitialValueFromZod,
  getValidDateForInput,
  hasPermission,
  isGoodStatus,
  positionArray,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import type { EmployeeWorkHistoryDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { useEffect, useState } from "react";
import { UPDATE_EMPLOYEE_WORK_HISTORY } from "./$workHistoryId.update-work-history";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const ADD_EMPLOYEE_WORK_HISTORY = "add-employee-work-history";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${updateRole}:employee_work_history`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    if (!employeeId) {
      return json(
        {
          status: "error",
          message: "Invalid employee id",
          employeeId: null,
        },
        { status: 400 }
      );
    }

    return json({
      status: "success",
      message: "Employee id found",
      employeeId,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        employeeId: null,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    if (!employeeId) {
      return json(
        {
          status: "error",
          message: "Invalid employee id",
          returnTo: "/employees",
        },
        { status: 400 }
      );
    }

    const submission = parseWithZod(formData, {
      schema: EmployeeWorkHistorySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createEmployeeWorkHistory({
      supabase,
      data: { ...submission.value, employee_id: employeeId },
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee work history created",
        error: null,
        returnTo: `/employees/${employeeId}/work-portfolio`,
      });
    }
    return json({
      status: "error",
      message: "",
      error,
      returnTo: `/employees/${employeeId}/work-portfolio`,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: `/employees/${employeeId}/work-portfolio`,
      },
      { status: 500 }
    );
  }
}

export default function AddEmployeeWorkHistory({
  updateValues,
}: {
  updateValues?: EmployeeWorkHistoryDatabaseUpdate | null;
}) {
  const { employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const EMPLOYEE_WORK_HISTORY_TAG = updateValues
    ? UPDATE_EMPLOYEE_WORK_HISTORY
    : ADD_EMPLOYEE_WORK_HISTORY;
  const currentSchema = EmployeeWorkHistorySchema;

  const initialValues = updateValues ?? getInitialValueFromZod(currentSchema);

  const [form, fields] = useForm({
    id: EMPLOYEE_WORK_HISTORY_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee work history created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee work history failed",
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo ?? -1);
    }
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(EMPLOYEE_WORK_HISTORY_TAG)}
              </CardTitle>
              <CardDescription>
                {EMPLOYEE_WORK_HISTORY_TAG.split("-")[0]} work history of the
                employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  positionArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.position, { type: "text" }),
                }}
                placeholder={`Select ${fields.position.name}`}
                labelProps={{
                  children: fields.position.name,
                }}
                errors={fields.position.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.company_name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(
                    fields.company_name.name
                  )}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.company_name.name),
                }}
                errors={fields.company_name.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.responsibilities),
                  autoFocus: true,
                  placeholder: `Enter ${fields.responsibilities.name}`,
                }}
                labelProps={{
                  children: fields.responsibilities.name,
                }}
                errors={fields.responsibilities.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.start_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.start_date.name
                    )}`,
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.start_date.initialValue
                    ),
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
                    placeholder: `Enter ${replaceUnderscore(
                      fields.end_date.name
                    )}`,
                    min: getValidDateForInput(fields.start_date.value),
                    defaultValue: getValidDateForInput(
                      fields.end_date.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.end_date.name),
                  }}
                  errors={fields.end_date.errors}
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
