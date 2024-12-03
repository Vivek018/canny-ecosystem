import {
  deductionCycleArray,
  isGoodStatus,
  ProfessionalTaxSchema,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  Field,
  RangeField,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createProfessionalTax } from "@canny_ecosystem/supabase/mutations";
import type { ProfessionalTaxDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { FormButtons } from "@/components/form/form-buttons";
import { UPDATE_PROFESSIONAL_TAX } from "./$professionalTaxId.update-professional-tax";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const CREATE_PROFESSIONAL_TAX = "create-professional-tax";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  return json({ status: "success", message: "Company ID found", companyId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: ProfessionalTaxSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createProfessionalTax({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Professional Tax created successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Error creating Professional Tax",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    }, { status: 500 });
  }
}

export default function CreateProfessionalTax({
  updateValues,
}: {
  updateValues?: ProfessionalTaxDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const PROFESSIONAL_TAX_TAG = updateValues
    ? UPDATE_PROFESSIONAL_TAX
    : CREATE_PROFESSIONAL_TAX;

  const initialValues =
    updateValues ?? getInitialValueFromZod(ProfessionalTaxSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: PROFESSIONAL_TAX_TAG,
    constraint: getZodConstraint(ProfessionalTaxSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProfessionalTaxSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData.status === "success") {
      toast({
        title: "Success",
        description: actionData.message || "Professional Tax created",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData.error.message || "Professional Tax create failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/statutory-fields/professional-tax", {
      replace: true,
    });
  }, [actionData, toast]);

  return (
    <section className="p-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(PROFESSIONAL_TAX_TAG)}
              </CardTitle>
              <CardDescription>
                {PROFESSIONAL_TAX_TAG.split("-")[0]} professional tax of a
                company that will be central in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={statesAndUTs}
                inputProps={{
                  ...getInputProps(fields.state, { type: "text" }),
                }}
                placeholder={`Select ${fields.state.name}`}
                labelProps={{
                  children: fields.state.name,
                }}
                errors={fields.state.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.pt_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.pt_number.name,
                  )}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.pt_number.name),
                }}
                errors={fields.pt_number.errors}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  deductionCycleArray as unknown as string[],
                )}
                inputProps={{
                  ...getInputProps(fields.deduction_cycle, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(
                  fields.deduction_cycle.name,
                )}`}
                labelProps={{
                  children: replaceUnderscore(fields.deduction_cycle.name),
                }}
                errors={fields.deduction_cycle.errors}
              />
              <RangeField
                key={resetKey + 2}
                labelProps={{ children: "Gross Salary Range" }}
                inputProps={{
                  ...getInputProps(fields.gross_salary_range, {
                    type: "hidden",
                  }),
                }}
                fields={[
                  { key: "start", type: "number", placeholder: "Start Range" },
                  { key: "end", type: "number", placeholder: "End Range" },
                  { key: "value", type: "number", placeholder: "Value" },
                ]}
                errors={fields.gross_salary_range.errors}
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
