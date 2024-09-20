import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, useLocation } from "@remix-run/react";

export const LOCATION = "locations";

export default function Locations() {
  const location = useLocation();
  return (
    <div>
      {/* <SecondaryMenu
        items={[
          { path: `/${LOCATION}`, label: "General" },
          { path: `/${LOCATION}/analytics`, label: "Analytics" },
        ]}
        pathname={location.pathname}
        Link={Link}
      /> */}
    </div>
  );
}
