import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import {
  createStatutoryBonus,
} from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Json,
  StatutoryBonusDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  StatutoryBonusSchema,
} from "@canny_ecosystem/utils";
import {
  paymentFrequencies,
  payoutMonths,
} from "@canny_ecosystem/utils/constant";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: StatutoryBonusSchema,
  });


  console.log("-------formData", formData)

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createStatutoryBonus({
    supabase,
    data: submission.value as any,
    bypassAuth: true,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(
      "/payment-components/statutory-fields/statutory-bonus",
      {
        status: 303,
      }
    );
  }

  return json({ status, error });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  return json({ companyId });
};

export default function CreateStatutoryBonus({
  updateValues = null,
}: {
  updateValues?: Json;
}) {
  
  const STATUTORY_BONUS_TAG = updateValues
  ? "update-statutory-bonus"
  : "create-statutory-bonus";
  
  const initialValues =
  updateValues ?? getInitialValueFromZod(StatutoryBonusSchema);
  
  const { companyId } = useLoaderData<{ companyId: string }>();
  const [form, fields] = useForm({
    id: STATUTORY_BONUS_TAG,
    constraint: getZodConstraint(StatutoryBonusSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: StatutoryBonusSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...(initialValues as {
        [key: string]: StatutoryBonusDatabaseRow | null;
      }),
      company_id: companyId,
    },
  });

  return (
    <section className="md-px-10 w-full lg:px-12 2xl:px-10 py-3">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-6">
              {replaceDash(STATUTORY_BONUS_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="flex flex-col w-1/4 items-start justify-between gap-2">
              <SearchableSelectField
                // key={resetKey}
                className="capitalize"
                options={paymentFrequencies}
                inputProps={{
                  ...getInputProps(fields.payment_frequency, { type: "text" }),
                }}
                placeholder={`Select an option`}
                labelProps={{
                  children: replaceUnderscore(fields.payment_frequency.name),
                }}
                errors={fields.payment_frequency.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.percentage, { type: "number" }),
                  autoFocus: true,
                  placeholder: `Enter ${fields.percentage.name}`,
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: fields.percentage.name,
                }}
                errors={fields.percentage.errors}
              />
              <SearchableSelectField
                className="capitalize"
                options={payoutMonths}
                inputProps={{
                  disabled: form.value?.payment_frequency !== "monthly",
                  ...getInputProps(fields.payout_month, { type: "text" }),
                }}
                placeholder={`Select an option`}
                labelProps={{
                  children: replaceUnderscore(fields.payout_month.name),
                }}
                errors={fields.payout_month.errors}
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="full"
                type="reset"
                {...form.reset.getButtonProps()}
              >
                Reset
              </Button>
              <Button
                form={form.id}
                disabled={!form.valid}
                variant="default"
                size="full"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Form>
    </section>
  );
}
