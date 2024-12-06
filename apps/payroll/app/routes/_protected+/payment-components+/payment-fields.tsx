import { Spinner } from "@canny_ecosystem/ui/spinner";
import { Outlet, useNavigation } from "@remix-run/react";

export default function PaymentFields() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  if (isLoading) {
    return (
      <div className="h-1/2 flex items-center justify-center">
        <Spinner size={50} />
      </div>
    );
  }

  return <Outlet />;
}
