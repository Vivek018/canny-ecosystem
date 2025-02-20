import { SiteDialog } from "@/components/link-template/site-dialog";
import { EditPaySequenceSheet } from "@/components/pay-sequence/edit-pay-sequence-sheet";
import { ViewPaySequenceDialog } from "@/components/pay-sequence/view-pay-sequence-dialog";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getPaymentTemplateAssignmentsBySiteId,
  getPaymentTemplatesByCompanyId,
  getSitePaySequenceInSite,
  type PaymentTemplateAssignmentsType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { SitePaySequenceDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const projectId = params.projectId;
  const siteId = params.siteId;

  let paymentTemplatesOptions: ComboboxSelectOption[] = [];
  let linkTemplates: PaymentTemplateAssignmentsType[] = [];
  let paySequenceData: Omit<SitePaySequenceDatabaseRow, "created_at"> | null =
    null;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    if (searchParams.get("step")?.includes("pay-sequence")) {
      const { data } = await getSitePaySequenceInSite({
        supabase,
        siteId: siteId!,
      });
      if (data) {
        paySequenceData = data;
      }
    }

    if (searchParams.get("step")?.includes("link-template")) {
      const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

      const { data: paymentTemplatesData } =
        await getPaymentTemplatesByCompanyId({
          supabase,
          companyId: companyId,
        });

      if (paymentTemplatesData) {
        paymentTemplatesOptions = paymentTemplatesData?.map(
          (paymentTemplate) => ({
            label: paymentTemplate.name,
            value: paymentTemplate.id ?? "",
          }),
        );
      }

      const { data: linkTemplatesData } =
        await getPaymentTemplateAssignmentsBySiteId({
          supabase,
          siteId: siteId!,
        });

      if (linkTemplatesData) {
        linkTemplates = linkTemplatesData;
      }
    }

    return json({
      siteId,
      projectId,
      paySequenceData,
      paymentTemplatesOptions,
      linkTemplates,
    });
  } catch (error) {
    return json(
      {
        siteId,
        projectId,
        error,
        paySequenceData,
        paymentTemplatesOptions,
        linkTemplates,
      },
      { status: 500 },
    );
  }
}

export default function EditPaySequence() {
  const {
    siteId,
    projectId,
    paySequenceData,
    linkTemplates,
    paymentTemplatesOptions,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <SiteDialog
        siteId={siteId!}
        projectId={projectId!}
        paymentTemplateOptions={paymentTemplatesOptions}
        linkTemplates={linkTemplates}
      />
      {paySequenceData && <ViewPaySequenceDialog values={paySequenceData} />}
      {paySequenceData && <EditPaySequenceSheet updateValues={paySequenceData} />}
    </>
  );
}
