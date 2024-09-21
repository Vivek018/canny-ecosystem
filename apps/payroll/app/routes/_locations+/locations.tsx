import { getLocationsQuery } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { json } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { data } = await getLocationsQuery({ supabase });
  return json({ data });
}

export default function Locations() {
  const { data } = useLoaderData<typeof loader>();

  const { pathname } = useLocation();
  return (
    <section className="py-2">
      <div className="w-full flex items-end justify-between">
        <SecondaryMenu
          items={[{ label: "General", path: "/locations" }]}
          Link={Link}
          pathname={pathname}
        />
        <Link
          to="/create-location"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Add Location
        </Link>
      </div>
      <div className="py-6 w-full justify-between gap-4 grid grid-cols-3 auto-rows-auto">
        {data.map((location) => (
          <div
            key={location.id}
            className="w-96 flex flex-col justify-between bg-accent rounded-md"
          >
            <div className="p-4 gap-5 flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium tracking-wide">
                  {location.name}
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/update-location/${location.id}`}
                    className="p-2 rounded-full bg-background grid place-items-center border-foreground"
                  >
                    <Icon name="edit" size="xs" />
                  </Link>
                  <Link
                    to={`/update-location/${location.id}`}
                    className="p-2 rounded-full bg-background grid place-items-center border-foreground"
                  >
                    <Icon name="dots" size="xs" />
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <address className="not-italic">{location.address}</address>
                <div className="flex items-center capitalize gap-2">
                  <p>{`${location.city},`}</p>
                  <p>{`${location.state}`}</p>
                  <p>{`- ${location.pin_code}`}</p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "px-2.5 ml-auto bg-primary text-primary-foreground py-1.5 text-sm rounded-tl-lg border-foreground flex gap-1 justify-center",
                !location.is_main && "hidden",
              )}
            >
              <Icon name="dot-filled" size="xs" />
              Main
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
