import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  PaymentTemplateSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { Suspense, useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";

import { getPaymentTemplateById } from "@canny_ecosystem/supabase/queries";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import type { PaymentTemplateDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import { CreatePaymentTemplateDetails } from "@/components/payment-templates/form/create-payment-template-details";
import { FormButtons } from "@/components/form/form-buttons";
import { updatePaymentTemplate } from "@canny_ecosystem/supabase/mutations";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const UPDATE_PAYMENT_TEMPLATE = "update-payment-template";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paymentTemplateId = params.paymentTemplateId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:payment_templates`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let paymentTemplatePromise = null;

    if (paymentTemplateId) {
      paymentTemplatePromise = getPaymentTemplateById({
        supabase,
        id: paymentTemplateId,
      });
    }

    return defer({
      paymentTemplatePromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        paymentTemplatePromise: null,
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
      schema: PaymentTemplateSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updatePaymentTemplate({
      supabase,
      data: {
        ...submission.value,
      },
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payment Template Updated",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Payment Template Update Failed",
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function UpdatePaymentTemplate() {
  const { paymentTemplatePromise } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Payment Template Update Failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/payment-templates", {
      replace: true,
    });
  }, [actionData]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={paymentTemplatePromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load payment template" />;
          return (
            <UpdatePaymentTemplateWrapper
              data={resolvedData?.data}
              error={resolvedData?.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdatePaymentTemplateWrapper({
  data,
  error,
}: {
  data: Omit<PaymentTemplateDatabaseRow, "created_at" | "updated_at"> | null;
  error: Error | null | { message: string };
}) {
  const actionData = useActionData<typeof action>();
  const currentSchema = PaymentTemplateSchema;

  const [form, fields] = useForm({
    id: UPDATE_PAYMENT_TEMPLATE,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: data,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Template Updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Template Update Failed",
          variant: "destructive",
        });
      }
      navigate("/payment-components/payment-templates", { replace: true });
    }
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CreatePaymentTemplateDetails
              fields={fields as any}
              isUpdate={true}
            />
            <FormButtons form={form} isSingle={true} />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
