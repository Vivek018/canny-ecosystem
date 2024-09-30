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
import { Fragment, useState } from "react";
import { commitSession, getSession } from "@/utils/sessions";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { DEFAULT_ROUTE } from "@/constant";
import { CreateCompanyStep1 } from "@/components/company/create-company-step-1";
import { FormButtons } from "@/components/form-buttons";
import { CreateCompanyStep2 } from "@/components/company/create-company-step-2";
import type { CompanyDatabaseInsert } from "@canny_ecosystem/supabase/types";

export const CREATE_COMPANY = [
  "create-company",
  "create-company-registration-details",
];

const SESSION_KEY_PREFIX = "multiStepForm_step_";

const schemas = [CompanySchema, CompanyRegistrationDetailsSchema];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const step = Number.parseInt(url.searchParams.get("step") || "1");
  const totalSteps = schemas.length;

  const session = await getSession(request.headers.get("Cookie"));
  const stepData = await session.get(`${SESSION_KEY_PREFIX}${step}`);

  if (step < 1 || step > totalSteps) {
    url.searchParams.set("step", "1");
    return redirect(url.toString(), { status: 302 });
  }

  return json({ step, totalSteps, stepData });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  const step = Number.parseInt(url.searchParams.get("step") || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;

  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_1MB }),
  );
  const action = formData.get("_action") as string;

  const submission = parseWithZod(formData, {
    schema: currentSchema,
  });

  if (action === "submit") {
    try {
      if (submission.status === "success") {
        const companyData = session.get(`${SESSION_KEY_PREFIX}1`);
        const companyRegistrationDetails = submission.value as Omit<
          CompanyDatabaseInsert,
          "company_id"
        >;

        const { status, error, id } = await createCompany({
          supabase,
          companyData,
          companyRegistrationDetails,
        });

        if (error) {
          return json({ status, error }, { status: 500 });
        }

        if (isGoodStatus(status)) {
          for (let i = 1; i <= totalSteps; i++) {
            session.unset(`${SESSION_KEY_PREFIX}${i}`);
          }
          const headers = new Headers();
          headers.append("Set-Cookie", setCompanyId(id));
          headers.append("Set-Cookie", await commitSession(session));
          return redirect(DEFAULT_ROUTE, { headers });
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      return json(
        {
          errors: "An error occurred during form submission. Please try again.",
        },
        { status: 500 },
      );
    }
  } else if (action === "next" || action === "back" || action === "skip") {
    if (action === "next") {
      if (submission.status === "success") {
        session.set(`${SESSION_KEY_PREFIX}${step}`, submission.value);
      }
      if (submission.status === "error") {
        return json(
          { result: submission.reply() },
          { status: submission.status === "error" ? 400 : 200 },
        );
      }
    }

    let nextStep = step;
    if (action === "next" || action === "skip") {
      nextStep = Math.min(step + 1, totalSteps);
    } else if (action === "back") {
      nextStep = Math.max(step - 1, 1);
    }

    url.searchParams.set("step", String(nextStep));
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

  const [form, fields] = useForm({
    id: COMPANY_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: stepData ?? initialValues,
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
      <div className="w-full mx-auto mb-8">
        <div className="flex items-center justify-center">
          {[...Array(totalSteps).keys()].map((stepNumber) => (
            <Fragment key={stepNumber}>
              <div
                className={cn(
                  "grid place-items-center px-4 rounded-md",
                  step - 1 === stepNumber
                    ? "h-9 bg-primary text-primary-foreground"
                    : "h-10 border border-input bg-background",
                )}
              >
                <p>{stepNumber + 1}</p>
              </div>

              <div
                className={cn(
                  "bg-foreground/75 h-[0.5px] mx-4 w-20",
                  stepNumber + 1 === totalSteps && "hidden",
                )}
              >
                &nbsp;
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            {step === 1 && (
              <CreateCompanyStep1 fields={fields as any} resetKey={resetKey} />
            )}
            {step === 2 && <CreateCompanyStep2 fields={fields as any} />}
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
