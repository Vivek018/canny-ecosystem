import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
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
      <div className="flex items-center gap-4 pt-4 pb-2">
        <Link
          prefetch="intent"
          to="/projects"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card w-9 h-9 px-0 rounded-md",
          )}
        >
          <Icon name="chevron-left" size="sm" />
        </Link>

        <SecondaryMenu
          items={[
            { label: "Overview", path: `/projects/${projectId}` },
            { label: "Sites", path: `/projects/${projectId}/sites` },
          ]}
          className="pt-0 pb-0"
          pathname={pathname}
          Link={Link}
        />
      </div>
      <Outlet />
    </section>
  );
}
