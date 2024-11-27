import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getCompanyById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getCompanyById({ supabase, id: companyId });

  if (error || !data) {
    throw new Error(`Company not found${error}`);
  }

  return json({ data });
}

export default function Account() {
  const { data } = useLoaderData<typeof loader>();

  const { pathname } = useLocation();

  return (
    <section>
      <SecondaryMenu
        items={[
          { label: "Account", path: "/account" },
          { label: "Help", path: "/account/help" },
          { label: "Feedback Form", path: "/account/feedback-form" },
          data.company_type === "app_creator"
            ? { label: "Feedback List", path: "/account/feedback-list" }
            : {},
        ]}
        pathname={pathname}
        Link={Link}
      />
      <Outlet />
    </section>
  );
}
