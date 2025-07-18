import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, Outlet, useLocation, useParams } from "@remix-run/react";

export default function Project() {
  const { projectId } = useParams();
  const { siteId } = useParams();
  const { pathname } = useLocation();

  return (
    <section>
      <div className="flex items-center gap-4 py-2.5 px-4 border-b">
        <Link
          prefetch="intent"
          to={`/projects/${projectId}/sites`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card w-9 h-9 px-0 rounded-full"
          )}
        >
          <Icon name="chevron-left" size="sm" />
        </Link>

        <SecondaryMenu
          items={[
            {
              label: "Overview",
              path: `/projects/${projectId}/${siteId}/overview`,
            },
            {
              label: "Link Templates",
              path: `/projects/${projectId}/${siteId}/link-templates`,
            },
            {
              label: "Departments",
              path: `/projects/${projectId}/${siteId}/departments`,
            },
          ]}
          className="pt-0 pb-0"
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className="px-4">
        <Outlet />
      </div>
    </section>
  );
}
