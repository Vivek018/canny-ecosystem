import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, Outlet, useLocation, useParams } from "@remix-run/react";

export default function Vehicle() {
  const { vehicleId } = useParams();
  const { pathname } = useLocation();

  const items = [
    { label: "Overview", path: `/vehicles/${vehicleId}/overview` },
    {
      label: "Vehicle Usage",
      path: `/vehicles/${vehicleId}/vehicle-usage`,
    },
  ];

  return (
    <section className="relative">
      <div className="flex items-center gap-4 py-2.5 px-4 border-b">
        <Link
          prefetch="intent"
          to="/vehicles"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card w-9 h-9 px-0 rounded-full"
          )}
        >
          <Icon name="chevron-left" size="sm" />
        </Link>
        <SecondaryMenu items={items} pathname={pathname} Link={Link} />
      </div>
      <div className="px-4">
        <Outlet />
      </div>
    </section>
  );
}
