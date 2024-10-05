import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const projectId = params.projectId;


  return json({ projectId });
}

export default function Project() {
  const { projectId } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <section>
      <SecondaryMenu
        items={[
          { label: "Overview", path: `/projects/${projectId}` },
          { label: "Sites", path: `/projects/${projectId}/sites` },
        ]}
        pathname={pathname}
        Link={Link}
      />
      <Outlet />
    </section>
  );
}
