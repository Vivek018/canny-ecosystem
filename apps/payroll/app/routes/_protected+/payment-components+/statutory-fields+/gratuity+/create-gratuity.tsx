import { FormButtons } from "@/components/form/form-buttons";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createGratuity } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { GratuityDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field } from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  GratuitySchema,
  hasPermission,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  createRole,
} from "@canny_ecosystem/utils";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { UPDATE_GRATUITY } from "./$gratuityId.update-gratuity";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_GRATUITY = "create-gratuity";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.statutoryFieldsGraduity}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    return json({
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        companyId: null,
      },
      { status: 500 }
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
      schema: GratuitySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createGratuity({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Gratuity created",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create Gratuity",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to create Gratuity",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreateGratuity({
  updateValues,
}: {
  updateValues?: GratuityDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<{ companyId: string }>();
  const actionData = useActionData<typeof action>();
  const GRATUITY_TAG = updateValues ? UPDATE_GRATUITY : CREATE_GRATUITY;

  const initialValues = updateValues ?? getInitialValueFromZod(GratuitySchema);

  const [form, fields] = useForm({
    id: GRATUITY_TAG,
    constraint: getZodConstraint(GratuitySchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GratuitySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: companyId,
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.gratuity);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message,
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/gratuity");
  }, [actionData]);

  return (
    <section className="p-4 w-full">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl pb-5 capitalize">
              {replaceDash(GRATUITY_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <input {...getInputProps(fields.is_default, { type: "hidden" })} />
            <div className="grid grid-cols-2 gap-6">
              <Field
                inputProps={{
                  ...getInputProps(fields.eligibility_years, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(fields.eligibility_years.name),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.eligibility_years.name),
                }}
                errors={fields.eligibility_years.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.present_day_per_year, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.present_day_per_year.name
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.present_day_per_year.name),
                }}
                errors={fields.present_day_per_year.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.payment_days_per_year, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.payment_days_per_year.name
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(
                    fields.payment_days_per_year.name
                  ),
                }}
                errors={fields.payment_days_per_year.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.max_multiply_limit, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.max_multiply_limit.name
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.max_multiply_limit.name),
                }}
                errors={fields.max_multiply_limit.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.max_amount_limit, { type: "number" }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(fields.max_amount_limit.name),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.max_amount_limit.name),
                }}
                errors={fields.max_amount_limit.errors}
              />
            </div>
          </CardContent>
          <FormButtons form={form} isSingle={true} />
        </Card>
      </Form>
    </section>
  );
}
