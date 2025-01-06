import { FormButtons } from "@/components/form/form-buttons";
import { FormStepHeader } from "@/components/form/form-step-header";
import { CreatePaymentTemplateComponentDetails } from "@/components/payment-templates/form/create-payment-template-component";
import { CreatePaymentTemplateDetails } from "@/components/payment-templates/form/create-payment-template-details";
import { usePaymentComponentsStore } from "@/store/payment-components";
import {
  getBonusComponentFromField,
  getEPFComponentFromField,
  getESIComponentFromField,
  getLWFComponentFromField,
  getPTComponentFromField,
  getSelectedPaymentComponentFromField,
} from "@/utils/payment";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { commitSession, getSession } from "@/utils/sessions";
import { getPaymentFieldNamesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaymentTemplateComponentDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import {
  getInitialValueFromZod,
  PaymentTemplateComponentsSchema,
  PaymentTemplateSchema,
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
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export const CREATE_PAYMENT_TEMPLATE = [
  "create-payment-template",
  "create-payment-template-components",
];

export const STEP = "step";

const SESSION_KEY_PREFIX = "multiStepPaymentTemplateForm_step_";

const schemas = [PaymentTemplateSchema, PaymentTemplateComponentsSchema];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
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

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;

  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  const submission = parseWithZod(formData, {
    schema: currentSchema,
  });

  if (action === "submit") {
    if (submission.status === "success") {
      const paymentTemplateDetailsData = session.get(`${SESSION_KEY_PREFIX}1`);

      const paymentTemplateComponentsData = submission.value as {
        monthly_ctc: number;
        state: string;
        payment_template_components: Omit<
          PaymentTemplateComponentDatabaseInsert,
          "template_id"
        >[];
      };

      // const {
      //   status,
      //   employeeError,
      //   employeeStatutoryDetailsError,
      // } = await createEmployee({
      //   supabase,
      //   employeeData,
      //   employeeStatutoryDetailsData,
      // });

      // if (employeeError) {
      //   for (let i = 1; i <= totalSteps; i++) {
      //     session.unset(`${SESSION_KEY_PREFIX}${i}`);
      //   }
      //   const headers = new Headers();
      //   headers.append("Set-Cookie", await commitSession(session));
      //   url.searchParams.delete(STEP);
      //   return redirect(url.toString(), { headers });
      // }

      // if (
      //   employeeStatutoryDetailsError
      // ) {
      //   for (let i = 1; i <= totalSteps; i++) {
      //     session.unset(`${SESSION_KEY_PREFIX}${i}`);
      //   }
      //   const headers = new Headers();
      //   headers.append("Set-Cookie", await commitSession(session));
      //   return redirect(DEFAULT_ROUTE, {
      //     headers,
      //   });
      // }

      // if (isGoodStatus(status)) {
      //   for (let i = 1; i <= totalSteps; i++) {
      //     session.unset(`${SESSION_KEY_PREFIX}${i}`);
      //   }
      //   const headers = new Headers();
      //   headers.append("Set-Cookie", await commitSession(session));
      //   return redirect("/employees", {
      //     headers,
      //   });
      // }
    }
  } else if (action === "next" || action === "back" || action === "skip") {
    if (action === "next") {
      if (submission.status === "success") {
        session.set(`${SESSION_KEY_PREFIX}${step}`, submission.value);
      }
      if (submission.status === "error") {
        return json(
          { result: submission.reply() },
          { status: submission.status === "error" ? 400 : 200 }
        );
      }
    }

    let nextStep = step;
    if (action === "next" || action === "skip") {
      nextStep = Math.min(step + 1, totalSteps);
    } else if (action === "back") {
      nextStep = Math.max(step - 1, 1);
    }

    url.searchParams.set(STEP, String(nextStep));
    return redirect(url.toString(), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return json({});
}

export default function CreatePaymentTemplate() {
  const { env, step, totalSteps, stepData, companyId, paymentFieldOptions } =
    useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const PAYMENT_TEMPLATE_TAG = CREATE_PAYMENT_TEMPLATE[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues =
    currentSchema instanceof z.ZodObject
      ? getInitialValueFromZod(currentSchema)
      : undefined;

  const { selectedPaymentFields, selectedStatutoryFields } =
    usePaymentComponentsStore();

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
    if (step === 2) {
      const maxValue = Number.parseFloat(fields.monthly_ctc.value ?? "0");
      form.update({
        value: {
          ...form.value,
          payment_template_components: [
            ...selectedPaymentFields.map((paymentField) =>
              getSelectedPaymentComponentFromField({
                field: paymentField,
                monthlyCtc: maxValue,
              })
            ),
            getEPFComponentFromField({
              field: selectedStatutoryFields.epf,
              value: maxValue,
            }),
            getESIComponentFromField({
              field: selectedStatutoryFields.esi,
              value: maxValue,
            }),
            getPTComponentFromField({
              field: selectedStatutoryFields.pt,
              value: maxValue,
            }),
            getLWFComponentFromField({
              field: selectedStatutoryFields.lwf,
            }),
            getBonusComponentFromField({
              field: selectedStatutoryFields.bonus,
              value: maxValue,
            }),
          ],
        },
      });
    }
  }, [
    selectedPaymentFields,
    selectedStatutoryFields,
    fields.monthly_ctc.value,
    fields.state.value,
  ]);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <div className='w-full mx-auto mb-8'>
        <FormStepHeader
          totalSteps={totalSteps}
          step={step}
          stepData={stepData}
        />
      </div>
      <FormProvider context={form.context}>
        <Form
          method='POST'
          encType='multipart/form-data'
          {...getFormProps(form)}
          className='flex flex-col'
        >
          <Card>
            <div className='h-[500px] overflow-scroll'>
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
