import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  return json({ employeeId });
}

export default function Employee() {
  const { employeeId } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <section>
      <div className="flex items-center gap-4">
        <Link
          prefetch="intent"
          to="/employees"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card w-9 h-9 px-0 rounded-full",
          )}
        >
          <Icon name="chevron-left" size="sm" />
        </Link>
        <SecondaryMenu
          items={[
            { label: "Overview", path: `/employees/${employeeId}` },
            { label: "Sites", path: `/employees/${employeeId}/sites` },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <Outlet />
    </section>
  );
}
