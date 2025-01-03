import {
  isGoodStatus,
  LabourWelfareFundSchema,
  lwfDeductionCycleArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
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
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { UPDATE_LABOUR_WELFARE_FUND } from "./$labourWelfareFundId.update-labour-welfare-fund";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createLabourWelfareFund } from "@canny_ecosystem/supabase/mutations";
import type { LabourWelfareFundDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const CREATE_LABOUR_WELFARE_FUND = "create-labour-welfare-fund";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    return json({ companyId, error: null });
  } catch (error) {
    return json(
      {
        error,
        companyId: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema: LabourWelfareFundSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createLabourWelfareFund({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Labour Welfare Fund created successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create Labour Welfare Fund",
      error,
    });
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

export default function CreateLabourWelfareFund({
  updateValues,
}: {
  updateValues?: LabourWelfareFundDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const LABOUR_WELFARE_FUND_TAG = updateValues
    ? UPDATE_LABOUR_WELFARE_FUND
    : CREATE_LABOUR_WELFARE_FUND;
  const initialValues =
    updateValues ?? getInitialValueFromZod(LabourWelfareFundSchema);

  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: LABOUR_WELFARE_FUND_TAG,
    constraint: getZodConstraint(LabourWelfareFundSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LabourWelfareFundSchema });
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

    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message || "Labour Welfare Fund created",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Labour Welfare Fund create failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/statutory-fields/labour-welfare-fund", {
      replace: true,
    });
  }, [actionData]);

  return (
    <section className="p-4 w-full">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(LABOUR_WELFARE_FUND_TAG)}
              </CardTitle>
              <CardDescription>
                {LABOUR_WELFARE_FUND_TAG.split("-")[0]} labour welfare fund of a
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
                  ...getInputProps(fields.employee_contribution, {
                    type: "number",
                  }),
                  className: "capitalize",
                  placeholder: `Enter ${fields.employee_contribution.name}`,
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.employee_contribution.name,
                  ),
                }}
                errors={fields.employee_contribution.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.employer_contribution, {
                    type: "number",
                  }),
                  className: "capitalize",
                  placeholder: `Enter ${fields.employer_contribution.name}`,
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.employer_contribution.name,
                  ),
                }}
                errors={fields.employer_contribution.errors}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  lwfDeductionCycleArray as unknown as string[],
                )}
                inputProps={{
                  ...getInputProps(fields.deduction_cycle, { type: "text" }),
                }}
                placeholder={`Select ${fields.deduction_cycle.name}`}
                labelProps={{
                  children: replaceUnderscore(fields.deduction_cycle.name),
                }}
                errors={fields.deduction_cycle.errors}
              />
              <CheckboxField
                buttonProps={getInputProps(fields.status, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.status.id,
                  children: "Is this currently active?",
                }}
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
