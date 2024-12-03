import { statutorySideNavList } from "@/constant";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { Outlet, useNavigation } from "@remix-run/react";

export default function StatutoryFields() {
  const navigation = useNavigation();
  const isLoading =
    navigation.state === "loading" &&
    navigation?.location?.pathname.startsWith(
      "/payment-components/statutory-fields",
    );

  return (
    <div className="flex h-full">
      <SecondarySidebar
        items={statutorySideNavList}
        className="flex-shrink-0"
      />
      <div className="h-full w-full">
        {isLoading ? (
          <div className="h-1/2 flex items-center justify-center">
            <Spinner size={50} />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
