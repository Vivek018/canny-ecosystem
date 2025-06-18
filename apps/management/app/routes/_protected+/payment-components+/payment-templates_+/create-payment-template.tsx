import { FormButtons } from "@/components/form/form-buttons";
import { FormStepHeader } from "@/components/form/form-step-header";
import { CreatePaymentTemplateComponentDetails } from "@/components/payment-templates/form/create-payment-template-component";
import { CreatePaymentTemplateDetails } from "@/components/payment-templates/form/create-payment-template-details";
import { usePaymentComponentsStore } from "@/store/payment-components";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { commitSession, getSession } from "@/utils/sessions";
import { getPaymentFieldNamesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaymentTemplateComponentDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  PaymentTemplateComponentsSchema,
  PaymentTemplateSchema,
  createRole,
  z,
} from "@canny_ecosystem/utils";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/utils/hooks/isomorphic-layout-effect";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  getBonusComponentFromField,
  getEPFComponentFromField,
  getESIComponentFromField,
  getGrossValue,
  getLWFComponentFromField,
  getPTComponentFromField,
  getSelectedPaymentComponentFromField,
  getValueforEPF,
  getValueforESI,
} from "@canny_ecosystem/utils";
import { createPaymentTemplateWithComponents } from "@canny_ecosystem/supabase/mutations";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { toast } from "@canny_ecosystem/ui/use-toast";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_PAYMENT_TEMPLATE = [
  "create-payment-template",
  "create-payment-template-components",
];

export const STEP = "step";

const SESSION_KEY_PREFIX = "multiStepPaymentTemplateForm_step_";

const schemas = [PaymentTemplateSchema, PaymentTemplateComponentsSchema];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.paymentTemplates}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const url = new URL(request.url);
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const totalSteps = schemas.length;

  const session = await getSession(request.headers.get("Cookie"));
  const stepData: (typeof schemas)[number][] = [];

  for (let i = 1; i <= totalSteps; i++) {
    stepData.push(await session.get(`${SESSION_KEY_PREFIX}${i}`));
  }

  if (step < 1 || step > totalSteps) {
    url.searchParams.set(STEP, "1");
    return redirect(url.toString(), { status: 302 });
  }

  let paymentFieldOptions = null;
  if (step === 2) {
    const { data, error } = await getPaymentFieldNamesByCompanyId({
      supabase,
      companyId,
    });

    if (!error && data) {
      paymentFieldOptions = data.map((paymentField) => ({
        label: paymentField.name,
        value: paymentField.id,
      }));
    }
  }

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({
    env,
    step,
    totalSteps,
    stepData,
    companyId,
    paymentFieldOptions,
  });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;
  const { supabase } = getSupabaseWithHeaders({ request });

  const formData = await request.formData();
  const actionType = formData.get("_action") as string;
  const submission = parseWithZod(formData, { schema: currentSchema });

  try {
    if (actionType === "submit") {
      if (submission.status !== "success") {
        return json(
          {
            status: "error",
            message: "Form validation failed",
            returnTo: `/payment-templates?step=${step}`,
          },
          { status: 400 }
        );
      }

      const paymentTemplateDetailsData = session.get(`${SESSION_KEY_PREFIX}1`);
      const paymentTemplateComponentsData = submission.value as {
        monthly_ctc: number;
        state: string;
        payment_template_components: Omit<
          PaymentTemplateComponentDatabaseInsert,
          "template_id"
        >[];
      };

      const { status, templateError, templateComponentsError } =
        await createPaymentTemplateWithComponents({
          supabase,
          templateData: {
            ...paymentTemplateDetailsData,
            monthly_ctc: paymentTemplateComponentsData.monthly_ctc,
            state: paymentTemplateComponentsData.state,
          },
          templateComponentsData:
            paymentTemplateComponentsData.payment_template_components,
        });

      if (templateError) {
        return json(
          {
            status: "error",
            message: "Failed to create payment template",
            returnTo: "/payment-templates",
          },
          { status: 500 }
        );
      }

      if (templateComponentsError) {
        return json(
          {
            status: "error",
            message: "Failed to create template components",
            returnTo: DEFAULT_ROUTE,
          },
          { status: 500 }
        );
      }

      if (isGoodStatus(status)) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", await commitSession(session));

        return json(
          {
            status: "success",
            message: "Payment template created successfully",
            returnTo: "/payment-components/payment-templates",
          },
          {
            status: status,
            headers: headers,
          }
        );
      }
    } else if (
      actionType === "next" ||
      actionType === "back" ||
      actionType === "skip"
    ) {
      if (submission.status === "success") {
        session.set(`${SESSION_KEY_PREFIX}${step}`, submission.value);
      }

      if (submission.status === "error") {
        return json(
          {
            status: "error",
            message: "Form validation failed",
            returnTo: `/payment-templates?step=${step}`,
          },
          { status: 400 }
        );
      }

      let nextStep = step;
      if (actionType === "next" || actionType === "skip") {
        nextStep = Math.min(step + 1, totalSteps);
      } else if (actionType === "back") {
        nextStep = Math.max(step - 1, 1);
      }

      url.searchParams.set(STEP, String(nextStep));
      return redirect(url.toString(), {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (error) {
    return json(
      {
        status: "error",
        message: `An unexpected error occurred: ${error}`,
        returnTo: "/payment-templates",
      },
      { status: 500 }
    );
  }

  return json({
    status: "success",
    message: "Action completed",
    returnTo: url.toString(),
  });
}

export default function CreatePaymentTemplate() {
  const { env, step, totalSteps, stepData, companyId, paymentFieldOptions } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [resetKey, setResetKey] = useState(Date.now());
  const navigate = useNavigate();

  const PAYMENT_TEMPLATE_TAG = CREATE_PAYMENT_TEMPLATE[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues =
    currentSchema instanceof z.ZodObject
      ? getInitialValueFromZod(currentSchema)
      : undefined;

  const defaultValues =
    step === 1
      ? stepData[step - 1]
        ? {
          ...stepData[step - 1],
          company_id: companyId,
        }
        : {
          ...initialValues,
          company_id: companyId,
        }
      : stepData[step - 1] ?? initialValues;

  const [form, fields] = useForm({
    id: PAYMENT_TEMPLATE_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.payment_templates);
        toast({
          title: "Success",
          description: actionData?.message || "Company created successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message ||
            "Failed to create company",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/payment-components/payment-templates");
    }
  }, [actionData]);

  const {
    valueForEPF,
    valueForESI,
    grossValue,
    basicValue,
    selectedPaymentFields,
    selectedStatutoryFields,
  } = usePaymentComponentsStore();

  useEffect(() => {
    const maxValue = Number.parseFloat(fields.monthly_ctc.value ?? "0");

    const existingComponents =
      (fields.payment_template_components.value as Exclude<
        typeof fields.payment_template_components.value,
        string
      >) || [];

    const updatedComponents = [
      ...selectedPaymentFields.map((paymentField) => {
        const existingComponent = existingComponents?.find(
          (component) => component?.payment_field_id === paymentField?.id
        );

        return {
          ...getSelectedPaymentComponentFromField({
            field: paymentField,
            monthlyCtc: maxValue,
            priortizedComponent: {
              ...existingComponent,
              calculation_value: null,
            } as any,
            existingComponent: {
              calculation_value: existingComponent?.calculation_value,
            } as any,
          }),
        };
      }),
      getEPFComponentFromField({
        field: selectedStatutoryFields.epf,
        value: getValueforEPF({
          epf: selectedStatutoryFields.epf!,
          values: valueForEPF,
        }),
      }),
      getESIComponentFromField({
        field: selectedStatutoryFields.esi,
        value: getValueforESI({
          esi: selectedStatutoryFields.esi!,
          values: valueForESI,
        }),
      }),
      getPTComponentFromField({
        field: selectedStatutoryFields.pt,
        value: getGrossValue({ values: grossValue }),
      }),
      getLWFComponentFromField({
        field: selectedStatutoryFields.lwf,
      }),
      getBonusComponentFromField({
        field: selectedStatutoryFields.bonus,
        value: basicValue,
      }),
    ];

    form.update({
      value: {
        ...form.value,
        payment_template_components: updatedComponents as any,
      },
    });
  }, [
    valueForEPF,
    valueForESI,
    grossValue,
    basicValue,
    selectedPaymentFields,
    selectedStatutoryFields,
    fields.monthly_ctc.value,
    fields.state.value,
  ]);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <div className="w-full mx-auto mb-4">
        <FormStepHeader
          totalSteps={totalSteps}
          step={step}
          stepData={stepData}
        />
      </div>
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <div className="h-[500px] overflow-scroll">
              {step === 1 ? (
                <CreatePaymentTemplateDetails
                  key={resetKey}
                  fields={fields as any}
                />
              ) : null}
              {step === 2 ? (
                <CreatePaymentTemplateComponentDetails
                  key={resetKey + 1}
                  fields={fields as any}
                  paymentFieldOptions={paymentFieldOptions ?? []}
                  env={env}
                />
              ) : null}
            </div>
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              step={step}
              totalSteps={totalSteps}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
