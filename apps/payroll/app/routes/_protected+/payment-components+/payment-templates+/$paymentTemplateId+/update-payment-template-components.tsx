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
  PaymentTemplateComponentsSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { Suspense, useEffect, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { FormButtons } from "@/components/form/form-buttons";
import {
  getPaymentFieldNamesByCompanyId,
  getPaymentTemplateWithComponentsById,
  type PaymentTemplateWithComponentsType,
} from "@canny_ecosystem/supabase/queries";
import { CreatePaymentTemplateComponentDetails } from "@/components/payment-templates/form/create-payment-template-component";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { updatePaymentTemplateWithComponents } from "@canny_ecosystem/supabase/mutations";
import {
  getBonusComponentFromField,
  getEPFComponentFromField,
  getESIComponentFromField,
  getGrossValue,
  getLWFComponentFromField,
  getPTComponentFromField,
  getSelectedPaymentComponentFromField,
  getValueforEPF,
  getValueforESI,
} from "@/utils/payment";
import { usePaymentComponentsStore } from "@/store/payment-components";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";

export const UPDATE_PAYMENT_TEMPLATE_COMPONENTS =
  "update-payment-template-componetns";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paymentTemplateId = params.paymentTemplateId;

  const env: SupabaseEnv = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.paymentTemplates}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: paymentFieldNamesData } =
      await getPaymentFieldNamesByCompanyId({ supabase, companyId });

    const paymentFieldOptions = paymentFieldNamesData?.map((field) => ({
      label: field.name,
      value: field.id,
    }));

    let paymentTemplateWithComponentsPromise = null;
    if (paymentTemplateId) {
      paymentTemplateWithComponentsPromise =
        getPaymentTemplateWithComponentsById({
          supabase,
          id: paymentTemplateId,
        });
    }

    return defer({
      paymentTemplateWithComponentsPromise,
      paymentFieldOptions,
      env,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        paymentTemplateWithComponentsPromise: null,
        paymentFieldOptions: null,
        env,
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
      schema: PaymentTemplateComponentsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updatePaymentTemplateWithComponents({
      supabase,
      templateData: {
        monthly_ctc: submission.value.monthly_ctc,
        state: submission.value.state,
        id: submission.value.id,
      },
      templateComponentsData: submission.value.payment_template_components,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payment Template Components Updated",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Payment Template Components Update Failed",
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

export default function UpdatePaymentTemplateComonents() {
  const { paymentTemplateWithComponentsPromise, paymentFieldOptions, env } =
    useLoaderData<typeof loader>();
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
          actionData?.error?.message ||
          "Payment Template Components Update Failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/payment-templates", {
      replace: true,
    });
  }, [actionData]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={paymentTemplateWithComponentsPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load payment template" />;
          return (
            <UpdatePaymentTemplateComponentsWrapper
              data={resolvedData?.data}
              paymentFieldOptions={paymentFieldOptions ?? []}
              env={env}
              error={resolvedData?.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdatePaymentTemplateComponentsWrapper({
  data,
  paymentFieldOptions,
  env,
  error,
}: {
  data: PaymentTemplateWithComponentsType | null;
  paymentFieldOptions: ComboboxSelectOption[];
  env: SupabaseEnv;
  error: Error | null | { message: string };
}) {
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  const [resetKey, setResetKey] = useState(Date.now());

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
          description: actionData?.message || "Template Components Updated",
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

  const currentSchema = PaymentTemplateComponentsSchema;

  const [form, fields] = useForm({
    id: UPDATE_PAYMENT_TEMPLATE_COMPONENTS,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: data,
  });

  const {
    valueForEPF,
    valueForESI,
    grossValue,
    basicValue,
    selectedPaymentFields,
    selectedStatutoryFields,
  } = usePaymentComponentsStore();

  useEffect(() => {
    const maxValue = Number.parseFloat(fields.monthly_ctc.value ?? "0");

    const fieldsComponents =
      (fields?.payment_template_components?.value as Exclude<
        typeof fields.payment_template_components.value,
        string
      >) || [];
    const updateComponents = data?.payment_template_components || [];

    const updatedComponents = [
      ...selectedPaymentFields.map((paymentField) => {
        const priortizedComponent = fieldsComponents?.find(
          (component) => component?.payment_field_id === paymentField?.id
        );

        const existingComponent = updateComponents?.find(
          (component) => component?.payment_field_id === paymentField?.id
        );

        return {
          ...getSelectedPaymentComponentFromField({
            field: paymentField,
            monthlyCtc: maxValue,
            priortizedComponent: priortizedComponent as any,
            existingComponent: existingComponent as any,
          }),
        };
      }),
      getEPFComponentFromField({
        field: selectedStatutoryFields.epf,
        value: getValueforEPF({
          epf: selectedStatutoryFields.epf!,
          values: valueForEPF,
        }),
        existingComponent: updateComponents?.find(
          (component) => component?.epf_id === selectedStatutoryFields.epf?.id
        ) as any,
      }),
      getESIComponentFromField({
        field: selectedStatutoryFields.esi,
        value: getValueforESI({
          esi: selectedStatutoryFields.esi!,
          values: valueForESI,
        }),
        existingComponent: updateComponents?.find(
          (component) => component?.esi_id === selectedStatutoryFields.esi?.id
        ) as any,
      }),
      getPTComponentFromField({
        field: selectedStatutoryFields.pt,
        value: getGrossValue({ values: grossValue }),
        existingComponent: updateComponents?.find(
          (component) => component?.pt_id === selectedStatutoryFields.pt?.id
        ) as any,
      }),
      getLWFComponentFromField({
        field: selectedStatutoryFields.lwf,
        existingComponent: updateComponents?.find(
          (component) => component?.lwf_id === selectedStatutoryFields.lwf?.id
        ) as any,
      }),
      getBonusComponentFromField({
        field: selectedStatutoryFields.bonus,
        value: basicValue,
        existingComponent: updateComponents?.find(
          (component) =>
            component?.bonus_id === selectedStatutoryFields.bonus?.id
        ) as any,
      }),
    ];

    form.update({
      value: {
        ...form.value,
        payment_template_components: updatedComponents.filter(Boolean) as any,
      },
    });
  }, [
    valueForEPF,
    valueForESI,
    grossValue,
    basicValue,
    selectedPaymentFields,
    selectedStatutoryFields,
    fields.monthly_ctc.value,
    fields.state.value,
  ]);

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
            <CreatePaymentTemplateComponentDetails
              resetKey={resetKey}
              fields={fields as any}
              paymentFieldOptions={paymentFieldOptions ?? []}
              env={env}
              isUpdate={true}
            />
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
