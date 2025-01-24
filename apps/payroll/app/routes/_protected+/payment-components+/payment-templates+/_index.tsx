import { ErrorBoundary } from "@/components/error-boundary";
import { PaymentTemplateComponentsCard } from "@/components/payment-templates/payment-template-components-card";
import { PaymentTemplatesTableWrapper } from "@/components/payment-templates/payment-templates-table-wrapper";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useUserRole } from "@/utils/user";
import {
  getPaymentTemplateComponentsByTemplateId,
  getPaymentTemplatesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { defer, json, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Suspense, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const paymentTemplatesPromise = getPaymentTemplatesByCompanyId({
      supabase,
      companyId,
    });

    let paymentTemplateComponentsPromise = null;
    if (
      searchParams.get("step") ===
        modalSearchParamNames.view_template_components &&
      searchParams.get("templateId")?.length
    ) {
      const templateId = searchParams.get("templateId");
      paymentTemplateComponentsPromise =
        getPaymentTemplateComponentsByTemplateId({
          supabase,
          templateId: templateId!,
        });
    }

    return defer({
      paymentTemplatesPromise,
      paymentTemplateComponentsPromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        paymentTemplatesPromise: null,
        paymentTemplateComponentsPromise: null,
        error,
      },
      { status: 500 }
    );
  }
}

export default function PaymentTemplatesIndex() {
  const { role } = useUserRole();
  const { paymentTemplatesPromise, paymentTemplateComponentsPromise, error } =
    useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step");

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load payment fields" />
    );

  return (
    <>
      <section className="p-4">
        <div className="w-full flex items-center justify-between pb-4">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icon
                  name="magnifying-glass"
                  size="sm"
                  className="text-gray-400"
                />
              </div>
              <Input
                placeholder="Search Payment Templates"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className="pl-8 h-10 w-full focus-visible:ring-0"
              />
            </div>
            <Link
              to="/payment-components/payment-templates/create-payment-template"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",

                !hasPermission(`${role}`, `${updateRole}:payment_fields`) &&
                  "hidden"
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">
                Payment Template
              </span>
            </Link>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={paymentTemplatesPromise}>
            {(resolvedData) => {
              if (!resolvedData)
                return (
                  <ErrorBoundary message="Failed to load payment fields" />
                );
              return (
                <PaymentTemplatesTableWrapper
                  data={resolvedData?.data}
                  error={resolvedData?.error}
                  searchString={searchString}
                />
              );
            }}
          </Await>
          <Await resolve={paymentTemplateComponentsPromise}>
            {(resolvedData) => {
              if (
                step === modalSearchParamNames.view_template_components &&
                resolvedData?.data?.length
              ) {
                return (
                  <PaymentTemplateComponentsCard
                    paymentTemplateComponents={resolvedData?.data}
                  />
                );
              }
            }}
          </Await>
        </Suspense>
      </section>
    </>
  );
}
