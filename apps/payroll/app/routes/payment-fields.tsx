import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";
import React from "react";

const PaymentFields = () => {
  const { pathname } = useLocation();

  return (
    <section>
      <SecondaryMenu
        items={[
          {
            label: "Payment Fields",
            path: "/payment-fields",
          },
          {
            label: "Statutory fields",
            path: "/payment-fields/statutory-fields",
          },
        ]}
        pathname={pathname}
        Link={Link}
        // className="p-4"  
      />
      <hr />
      <Outlet />
    </section>
  );
};

export default PaymentFields;
