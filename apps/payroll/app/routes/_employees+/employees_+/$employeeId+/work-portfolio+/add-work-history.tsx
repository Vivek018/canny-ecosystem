import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  EmployeeWorkHistorySchema,
  getInitialValueFromZod,
  getValidDateForInput,
  isGoodStatus,
  positionArray,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Button } from "@canny_ecosystem/ui/button";
import { createEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import type { EmployeeWorkHistoryDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { useState } from "react";
import { UPDATE_EMPLOYEE_WORK_HISTORY } from "./$workHistoryId.update-work-history";

export const ADD_EMPLOYEE_WORK_HISTORY = "add-employee-work-history";

export async function loader({ params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  return json({ employeeId });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const employeeId = params.employeeId;
  if (!employeeId) {
    return safeRedirect("/employees");
  }

  const submission = parseWithZod(formData, {
    schema: EmployeeWorkHistorySchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createEmployeeWorkHistory({
    supabase,
    data: { ...submission.value, employee_id: employeeId },
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function AddEmployeeWorkHistory({
  updateValues,
}: {
  updateValues?: EmployeeWorkHistoryDatabaseUpdate | null;
}) {
  const { employeeId } = useLoaderData<typeof loader>();
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

  return (
    <section className="lg:px-40 2xl:px-80 py-2">
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
                  positionArray as unknown as string[],
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
                    fields.company_name.name,
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
                  className: "capitalize",
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
                      fields.start_date.name,
                    )}`,
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.start_date.initialValue,
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
                      fields.end_date.name,
                    )}`,
                    min: getValidDateForInput(fields.start_date.value),
                    defaultValue: getValidDateForInput(
                      fields.end_date.initialValue,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.end_date.name),
                  }}
                  errors={fields.end_date.errors}
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="full"
                  type="reset"
                  onClick={() => setResetKey(Date.now())}
                  {...form.reset.getButtonProps()}
                >
                  Reset
                </Button>
                <Button
                  form={form.id}
                  disabled={!form.valid}
                  variant="default"
                  size="full"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
