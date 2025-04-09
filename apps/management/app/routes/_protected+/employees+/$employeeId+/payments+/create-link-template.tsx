import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { createPaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaymentTemplateAssignmentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  createRole,
  EmployeeLinkSchema,
  getInitialValueFromZod,
  getValidDateForInput,
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { UPDATE_LINK_TEMPLATE } from "./$templateAssignmentId+/update-link-template";

export const CREATE_LINK_TEMPLATE = "create-link-template";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${createRole}:${attribute.employeeProjectAssignment}`
    )
  )
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const { data, error } = await getPaymentTemplatesByCompanyId({
    supabase,
    companyId,
  });

  let paymentTemplateOptions = null;
  if (data && !error) {
    paymentTemplateOptions =
      data?.map((template) => ({
        label: template.name,
        value: template.id ?? "",
      })) ?? [];
  }

  return json({
    paymentTemplateOptions,
    error,
  });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId as string;
  const returnTo = `/employees/${employeeId}/payments`;

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: EmployeeLinkSchema });

  if (submission.status !== "success")
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );

  try {
    const { status, error } = await createPaymentTemplateAssignment({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Successfully created payment template link",
        returnTo,
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Failed to create payment template link.",
      returnTo,
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to create payment template link.",
      returnTo,
      error,
    });
  }
}

export default function CreateEmployeeLinkTemplate({
  updateValues,
  updatePaymentTemplateOptions,
}: {
  updateValues?: PaymentTemplateAssignmentsDatabaseUpdate | null;
  updatePaymentTemplateOptions?: ComboboxSelectOption[] | null;
}) {
  const { paymentTemplateOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const LINK_TEMPLATE_TAG = updateValues
    ? UPDATE_LINK_TEMPLATE
    : CREATE_LINK_TEMPLATE;

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeLinkSchema);

  const [form, fields] = useForm({
    id: LINK_TEMPLATE_TAG,
    constraint: getZodConstraint(EmployeeLinkSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeLinkSchema });
    },
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_payments}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {updateValues ? "Update" : "Create"} Link Template
              </CardTitle>
              <CardDescription>
                {updateValues ? "Update" : "Create"} payment template link for
                the employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.assignment_type, { type: "hidden" })}
              />
              <Field
                className="w-full mb-6"
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: "Name",
                }}
                labelProps={{ children: fields.name.name }}
                errors={fields.name.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6 mb-6">
                <Field
                  className="w-full"
                  inputProps={{
                    ...getInputProps(fields.effective_from, { type: "date" }),
                    placeholder: replaceUnderscore(fields.effective_from.name),
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.effective_from.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.effective_from.name),
                  }}
                  errors={fields.effective_from.errors}
                />
                <Field
                  className="w-full"
                  inputProps={{
                    ...getInputProps(fields.effective_to, { type: "date" }),
                    placeholder: replaceUnderscore(fields.effective_to.name),
                    min: getValidDateForInput(fields.effective_from.value),
                    defaultValue: getValidDateForInput(
                      fields.effective_to.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.effective_to.name),
                  }}
                  errors={fields.effective_to.errors}
                />
              </div>
              <SearchableSelectField
                key={resetKey}
                className="capitalize w-full"
                options={updatePaymentTemplateOptions ?? paymentTemplateOptions}
                inputProps={{
                  ...getInputProps(fields.template_id, { type: "text" }),
                }}
                placeholder={"Select templates"}
                labelProps={{ children: "Payment templates" }}
                errors={fields.template_id.errors}
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
