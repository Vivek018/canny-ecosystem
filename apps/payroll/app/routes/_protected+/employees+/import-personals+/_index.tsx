import {
  ImportEmployeePersonalsHeaderSchema,
  ImportEmployeePersonalsDataSchema,
} from "@canny_ecosystem/utils";

import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getInitialValueFromZod } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useLocation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { Card } from "@canny_ecosystem/ui/card";

import { useState } from "react";
import { commitSession, getSession } from "@/utils/sessions";
import { FormButtons } from "@/components/form/form-buttons";
import { FormStepHeader } from "@/components/form/form-step-header";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/utils/hooks/isomorphic-layout-effect";

import { EmployeePersonalsImportHeader } from "@/components/employees/import-export/employee-personals-import-header";
import { EmployeePersonalsImportData } from "@/components/employees/import-export/employee-personals-import-data";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const IMPORT_EMPLOYEE_PERSONALS = [
  "personals-map-headers",
  "personals-validate-imported-data",
];

export const STEP = "step";

const SESSION_KEY_PREFIX = "multiStepEmployeePersonalsImport_step_";

const schemas = [
  ImportEmployeePersonalsHeaderSchema,
  ImportEmployeePersonalsDataSchema,
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const totalSteps = schemas.length;

  const session = await getSession(request.headers.get("Cookie"));
  const headers = {
    "Set-Cookie": await commitSession(await getSession()),
  };
  const stepData: any[] = [];

  for (let i = 1; i <= totalSteps; i++) {
    stepData.push(await session.get(`${SESSION_KEY_PREFIX}${i}`));
  }

  if (step < 1 || step > totalSteps) {
    url.searchParams.set(STEP, "1");
    return redirect(url.toString(), { status: 302 });
  }

  return json({ step, totalSteps, stepData });
  // return json({ step, totalSteps, stepData }, { headers });
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
    const parsedData = ImportEmployeePersonalsDataSchema.safeParse(
      JSON.parse(formData.get("stringified_data") as string)
    );
    console.log("========>", parsedData.error);
    if (parsedData.success) {
      const importedData = parsedData.data?.data;

      const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

      const updatedData = importedData.map((entry) => ({
        ...entry,
        company_id: companyId,
      }));

      console.log("personalsData", updatedData);

      // const { status, error: dataEntryError } =
      //   await createReimbursementsFromImportedData({
      //     supabase,
      //     data: updatedData,
      //   });
      // if (isGoodStatus(status))
      //   return safeRedirect("/approvals/reimbursements", { status: 303 });
      // if (dataEntryError) {
      //   throw error;
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

export default function EmployeePersonalsImportFieldMapping() {
  const { step, totalSteps, stepData } = useLoaderData<typeof loader>();
  const stepOneData = stepData[0];

  const [resetKey, setResetKey] = useState(Date.now());

  const location = useLocation();
  const [file] = useState(location.state?.file);

  const IMPORT_TAG = IMPORT_EMPLOYEE_PERSONALS[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues = getInitialValueFromZod(currentSchema);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

  const [form, fields] = useForm({
    id: IMPORT_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
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
            <div className="h-[500px] overflow-scroll">
              {step === 1 ? (
                <EmployeePersonalsImportHeader
                  key={resetKey}
                  file={file}
                  fields={fields as any}
                />
              ) : null}
              {step === 2 ? (
                <EmployeePersonalsImportData
                  fieldMapping={stepOneData}
                  file={file}
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
