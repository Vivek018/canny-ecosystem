import { clearAllCache } from "@/utils/cache";
import { DropdownMenuItem } from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export function Logout() {
  const [isLoading, setLoading] = useState(false);
  const submit = useSubmit();

  const handleLogout = () => {
    setLoading(true);
    clearAllCache();
    submit({}, { method: "post", action: "/logout", replace: true });
  };

  return (
    <DropdownMenuItem
      className={cn(!isLoading && "text-destructive focus:text-destructive")}
      onClick={handleLogout}
    >
      {isLoading ? "Loading..." : "Logout"}
    </DropdownMenuItem>
  );
}
