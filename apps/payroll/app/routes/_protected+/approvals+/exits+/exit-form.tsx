import { Step1 } from "@/components/exit-payment/exit-payment-step-1";
import { Step2 } from "@/components/exit-payment/exit-payment-step-2";
import { FormButtons } from "@/components/form/form-buttons";
import { FormStepHeader } from "@/components/form/form-step-header";
import { safeRedirect } from "@/utils/server/http.server";
import { commitSession, getSession } from "@/utils/sessions";

import { Card } from "@canny_ecosystem/ui/card";

import {
  ExitPaymentPage1Schema,
  ExitPaymentPage2Schema,
  getInitialValueFromZod,
  SIZE_1MB,
} from "@canny_ecosystem/utils";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/utils/hooks/isomorphic-layout-effect";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import { useState } from "react";

export const EXIT_PAYMENT = ["step-1", "step-2"];
export const STEP = "step";
const SESSION_KEY_PREFIX = "multiStepExitPayment_step_";
const schemas = [ExitPaymentPage1Schema, ExitPaymentPage2Schema];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const totalSteps = schemas.length;

  const session = await getSession(request.headers.get("Cookie"));
  const stepData: any[] = [];

  for (let i = 1; i <= totalSteps; i++) {
    stepData.push(await session.get(`${SESSION_KEY_PREFIX}${i}`));
  }

  if (step < 1 || step > totalSteps) {
    url.searchParams.set(STEP, "1");
    return redirect(url.toString(), { status: 302 });
  }

  return json({ step, totalSteps, stepData });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const url = new URL(request.url);
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({ maxPartSize: SIZE_1MB })
  );
  const action = formData.get("_action") as string;

  const submission = parseWithZod(formData, {
    schema: currentSchema,
  });
  if (action === "submit") {
    if (submission.status === "success") {
      const page1Data = session.get(`${SESSION_KEY_PREFIX}1`);
      const page2Data = submission.value;

      const data = { ...page1Data, ...page2Data };

      for (let i = 1; i <= totalSteps; i++) {
        session.unset(`${SESSION_KEY_PREFIX}${i}`);
      }
      const headers = new Headers();

      headers.append("Set-Cookie", await commitSession(session));
      return safeRedirect("/approvals/exits");
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

export default function ExitForm() {
  const { step, totalSteps, stepData } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const EXIT_PAYMENT_TAG = EXIT_PAYMENT[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues = getInitialValueFromZod(currentSchema);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

  const [form, fields] = useForm({
    id: EXIT_PAYMENT_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: stepData[step - 1] ?? initialValues,
  });

  return (
    <section className="md:px-20 lg:px-28 2xl:px-40 py-4">
      <div className="w-full mx-auto mb-8">
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
            <div className="h-[650px] overflow-scroll">
              {step === 1 ? (
                <Step1 key={resetKey} fields={fields as any} />
              ) : null}
              {step === 2 ? (
                <Step2 key={resetKey} fields={fields as any} />
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
