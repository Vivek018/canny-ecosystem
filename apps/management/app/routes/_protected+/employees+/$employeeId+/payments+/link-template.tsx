import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData, useParams } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  EmployeeLinkSchema,
  getInitialValueFromZod,
  getValidDateForInput,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getPaymentTemplateAssignmentByEmployeeId,
  getPaymentTemplatesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useEffect, useState } from "react";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { FormButtons } from "@/components/form/form-buttons";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId as string;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      `${user?.role!}`,
      `${updateRole}:${attribute.employeeProjectAssignment}`
    )
  )
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const paymentTemplateAssignmentData =
      await getPaymentTemplateAssignmentByEmployeeId({
        supabase,
        employeeId,
      });

    const paymentTemplatesData = await getPaymentTemplatesByCompanyId({
      supabase,
      companyId,
    });

    if (paymentTemplatesData?.error) {
      return json({
        status: "error",
        message: "Failed to fetch payment templates",
        error: paymentTemplatesData.error,
      });
    }

    return json({
      status: "success",
      paymentTemplateAssignmentData: paymentTemplateAssignmentData?.data,
      paymentTemplatesData: paymentTemplatesData?.data,
      message: "Payment Template assignment found",
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      paymentTemplateAssignmentData: null,
      paymentTemplatesData: null,
      message: "Error fetching payment template",
      error,
    });
  }
}

export default function EmployeeLinkTemplateForm() {
  const { paymentTemplateAssignmentData, paymentTemplatesData } =
    useLoaderData<typeof loader>();

  const { employeeId } = useParams();

  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<
    ComboboxSelectOption[]
  >([]);
  const [initialValues, setInitialValues] = useState(
    paymentTemplateAssignmentData
      ? {
          effective_from: paymentTemplateAssignmentData.effective_from,
          effective_to: paymentTemplateAssignmentData.effective_to,
          template_id: paymentTemplateAssignmentData.template_id,
          name: paymentTemplateAssignmentData.name,
        }
      : null
  );
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: "payment-template-form",
    constraint: getZodConstraint(EmployeeLinkSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeLinkSchema });
    },
    defaultValue: initialValues ?? getInitialValueFromZod(EmployeeLinkSchema),
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (paymentTemplateAssignmentData) {
      const values = {
        effective_from: paymentTemplateAssignmentData.effective_from,
        effective_to: paymentTemplateAssignmentData.effective_to,
        template_id: paymentTemplateAssignmentData.template_id,
        name: paymentTemplateAssignmentData.name,
      };
      setInitialValues(values);
      setResetKey(Date.now());
      form.update({ value: values });
    }

    if (paymentTemplatesData) {
      const newPaymentTemplatesOptions = paymentTemplatesData?.map(
        (paymentTemplate: any) => ({
          label: paymentTemplate.name,
          value: paymentTemplate.id ?? "",
        })
      );
      setPaymentTemplatesOptions(newPaymentTemplatesOptions);
    }
  }, []);

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form
          method='POST'
          {...getFormProps(form)}
          className='flex flex-col'
          action={`/employees/${employeeId}/payments/${
            initialValues ? "update" : "create"
          }-link-template`}
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-3xl capitalize'>
                {initialValues ? "Update" : "Create"} Link Template
              </CardTitle>
              <CardDescription>
                {initialValues ? "Update" : "Create"} payment template link for
                the employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field
                className='w-full mb-6'
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: "Name",
                }}
                labelProps={{ children: fields.name.name }}
                errors={fields.name.errors}
              />
              <div className='grid grid-cols-2 place-content-center justify-between gap-6 mb-6'>
                <Field
                  className='w-full'
                  inputProps={{
                    ...getInputProps(fields.effective_from, { type: "date" }),
                    placeholder: replaceUnderscore(fields.effective_from.name),
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.effective_from.initialValue as string
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.effective_from.name),
                  }}
                  errors={fields.effective_from.errors}
                />
                <Field
                  className='w-full'
                  inputProps={{
                    ...getInputProps(fields.effective_to, { type: "date" }),
                    placeholder: replaceUnderscore(fields.effective_to.name),
                    min: getValidDateForInput(
                      fields.effective_from.value as string
                    ),
                    defaultValue: getValidDateForInput(
                      fields.effective_to.initialValue as string
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
                className='capitalize w-full'
                options={paymentTemplatesOptions}
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
