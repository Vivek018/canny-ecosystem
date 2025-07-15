import { CompanySchema, isGoodStatus } from "@canny_ecosystem/utils";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getInitialValueFromZod } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { CreateCompanyDetails } from "@/components/company/form/create-company-details";
import { FormButtons } from "@/components/form/form-buttons";

import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearAllCache } from "@/utils/cache";
import { createCompany } from "@canny_ecosystem/supabase/mutations";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: CompanySchema });
    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }
    const { status, error } = await createCompany({
      supabase,
      companyData: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Company created successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to create Company",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        returnTo: "/companies",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreateCompany() {
  const [resetKey, setResetKey] = useState(Date.now());

  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const initialValues = getInitialValueFromZod(CompanySchema);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearAllCache();
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
      navigate(actionData?.returnTo ?? "/companies");
    }
  }, [actionData]);

  const [form, fields] = useForm({
    id: "Create-Company",
    constraint: getZodConstraint(CompanySchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: CompanySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <div className="h-[500px] overflow-scroll">
              <CreateCompanyDetails key={resetKey} fields={fields as any} />
            </div>
            <FormButtons form={form} setResetKey={setResetKey} />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
