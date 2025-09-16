import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  bringDefaultLetterContent,
  createRole,
  EmployeeLetterSchema,
  employeeLetterTypesArray,
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
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
import {
  CheckboxField,
  Field,
  MarkdownField,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";
import { createEmployeeLetter } from "@canny_ecosystem/supabase/mutations";
import type { ReimbursementsUpdate } from "@canny_ecosystem/supabase/types";
import { useEffect, useState } from "react";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { UPDATE_LETTER_TAG } from "./$letterId_+/update-letter";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { useTheme } from "@/utils/theme";
import {
  getLinkedPaymentTemplateIdByEmployeeId,
  getPaymentTemplateComponentsByTemplateId,
} from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const CREATE_LETTER_TAG = "create-letter";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId ?? "";
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  try {
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (
      !hasPermission(user?.role!, `${createRole}:${attribute.employeeLetters}`)
    ) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    let templateId = null;

    let templateComponentData = null;
    let employeeSalaryData = null;

    const { data, error } = await getLinkedPaymentTemplateIdByEmployeeId({
      supabase,
      employeeId,
      companyId,
    });

    if (!error && data) {
      templateId = data.template_id;
    }

    ({ data: templateComponentData } =
      await getPaymentTemplateComponentsByTemplateId({
        supabase,
        templateId: templateId ?? "",
      }));

    employeeSalaryData = templateComponentData?.reduce(
      (acc, curr) => {
        const category = curr.component_type;

        if (!acc[category]) {
          acc[category] = {};
        }

        if (curr.target_type === "payment_field" && curr.payment_fields.name) {
          const fieldName = curr.payment_fields.name + "".replaceAll(" ", "_");
          acc[category][fieldName] = curr.calculation_value ?? 0;
        } else {
          acc[category][curr.target_type] = curr.calculation_value ?? 0;
        }

        return acc;
      },
      {} as Record<string, Record<string, number>>,
    );

    return json({ employeeSalaryData, error: null });
  } catch (error) {
    return json({
      error,
      employeeSalaryData: null,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: EmployeeLetterSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }
    const employeeLetterData = submission.value;

    const { status, error } = await createEmployeeLetter({
      supabase,
      letterData: employeeLetterData,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Employee Letter created",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Employee Letter creation failed",
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function CreateEmployeeLetter({
  updateValues,
}: {
  reimbursementId?: string;
  updateValues?: ReimbursementsUpdate | null;
  userOptionsFromUpdate?: any;
}) {
  const [resetKey, setResetKey] = useState(Date.now());
  const { employeeSalaryData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const LETTERS_TAG = updateValues ? UPDATE_LETTER_TAG : CREATE_LETTER_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeLetterSchema);

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
      toast({
        title: "Success",
        description: "Employee created successfully",
        variant: "success",
      });
      navigate(`/employees/${employeeId}/letters`);
    } else {
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    }
  }, [actionData]);

  const [form, fields] = useForm({
    id: LETTERS_TAG,
    constraint: getZodConstraint(EmployeeLetterSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeLetterSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(LETTERS_TAG)}
              </CardTitle>
              <CardDescription>
                You can {LETTERS_TAG.split("-")[0]} letters by filling this form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8 mt-5">
                <SearchableSelectField
                  key={resetKey}
                  className="w-full capitalize flex-1"
                  options={transformStringArrayIntoOptions(
                    employeeLetterTypesArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.letter_type, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.letter_type.name,
                  )}`}
                  labelProps={{
                    children: "Letter Type",
                  }}
                  errors={fields.letter_type.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.date, {
                      type: "date",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.date.name),
                  }}
                  errors={fields.date.errors}
                />
              </div>

              <div className="grid grid-cols-1 place-content-center justify-between gap-x-8 mt-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.subject, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.subject.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.subject.name),
                  }}
                  errors={fields.subject.errors}
                />
                <MarkdownField
                  key={
                    fields.letter_type.value ?? fields.letter_type.initialValue
                  }
                  theme={theme}
                  inputProps={{
                    ...getInputProps(fields.content, { type: "hidden" }),
                    placeholder: "Write your letter content here...",
                    defaultValue: !updateValues
                      ? bringDefaultLetterContent(
                          fields.letter_type.value,
                          employeeSalaryData,
                        ) ?? fields.content.value
                      : fields.content.value ??
                        bringDefaultLetterContent(
                          fields.letter_type.value,
                          employeeSalaryData,
                        ),
                  }}
                  labelProps={{
                    children: "Content",
                  }}
                  errorClassName={"min-h-min pt-0 pb-0"}
                  errors={fields.content.errors}
                />
              </div>

              <div className="grid grid-cols-3 max-sm:grid-cols-2 place-content-center justify-between gap-x-8 px-2">
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_letter_head, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Letter Head",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_client_address, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Client Address",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_employee_address, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Employee Address",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_signatuory, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Signatuory",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(
                    fields.include_employee_signature,
                    {
                      type: "checkbox",
                    },
                  )}
                  labelProps={{
                    children: "Include Employee Signature",
                  }}
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
