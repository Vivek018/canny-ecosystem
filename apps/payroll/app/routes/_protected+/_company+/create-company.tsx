import {
  CompanyRegistrationDetailsSchema,
  CompanySchema,
  isGoodStatus,
  SIZE_1MB,
} from "@canny_ecosystem/utils";
import { createCompany } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getInitialValueFromZod } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  redirect,
} from "@remix-run/node";
import { Card } from "@canny_ecosystem/ui/card";
import { setCompanyId } from "@/utils/server/company.server";
import { useState } from "react";
import { commitSession, getSession } from "@/utils/sessions";
import { DEFAULT_ROUTE } from "@/constant";
import { CreateCompanyDetails } from "@/components/company/form/create-company-details";
import { FormButtons } from "@/components/form/form-buttons";
import { CreateCompanyRegistrationDetails } from "@/components/company/form/create-company-registration-details";
import type { CompanyRegistrationDetailsInsert } from "@canny_ecosystem/supabase/types";
import { FormStepHeader } from "@/components/form/form-step-header";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/utils/hooks/isomorphic-layout-effect";

export const CREATE_COMPANY = [
  "create-company",
  "create-company-registration-details",
];

export const STEP = "step";

const SESSION_KEY_PREFIX = "multiStepCompanyForm_step_";

const schemas = [CompanySchema, CompanyRegistrationDetailsSchema];

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
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;

  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_1MB })
  );
  const action = formData.get("_action") as string;

  const submission = parseWithZod(formData, {
    schema: currentSchema,
  });

  if (action === "submit") {
    if (submission.status === "success") {
      const companyData = session.get(`${SESSION_KEY_PREFIX}1`);
      const companyRegistrationDetails = submission.value as Omit<
        CompanyRegistrationDetailsInsert,
        "company_id"
      >;

      const { status, companyError, registrationDetailsError, id } =
        await createCompany({
          supabase,
          companyData,
          companyRegistrationDetails,
        });

      if (companyError) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", await commitSession(session));
        url.searchParams.delete(STEP);
        return redirect(url.toString(), { headers });
      }

      if (registrationDetailsError) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", setCompanyId(id));
        headers.append("Set-Cookie", await commitSession(session));
        return redirect(DEFAULT_ROUTE, {
          headers,
        });
      }

      if (isGoodStatus(status)) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", setCompanyId(id));
        headers.append("Set-Cookie", await commitSession(session));
        return redirect(DEFAULT_ROUTE, {
          headers,
        });
      }
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

export default function CreateCompany() {
  const { step, totalSteps, stepData } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const COMPANY_TAG = CREATE_COMPANY[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues = getInitialValueFromZod(currentSchema);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

  const [form, fields] = useForm({
    id: COMPANY_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: stepData[step - 1] ?? initialValues,
  });

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
                <CreateCompanyDetails key={resetKey} fields={fields as any} />
              ) : null}
              {step === 2 ? (
                <CreateCompanyRegistrationDetails fields={fields as any} />
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
