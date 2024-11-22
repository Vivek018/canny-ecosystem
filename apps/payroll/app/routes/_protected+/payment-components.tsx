import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function PaymentComponents() {
  const { pathname } = useLocation();

  return (
    <section>
      <SecondaryMenu
        items={[
          {
            label: "Payment Fields",
            path: "/payment-components/payment-fields",
          },
          {
            label: "Statutory fields",
            path: "/payment-components/statutory-fields",
          },
        ]}
        pathname={pathname}
        Link={Link}
      />
      <Outlet />
    </section>
  );
};
