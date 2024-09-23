import { DropdownMenuItem } from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export function SignOut() {
  const [isLoading, setLoading] = useState(false);
  const submit = useSubmit();

  const handleSignOut = () => {
    setLoading(true);
    submit({}, { method: "post", action: "/sign-out", replace: true });
  };

  return (
    <DropdownMenuItem
      className={cn(!isLoading && "text-destructive focus:text-destructive")}
      onClick={handleSignOut}
    >
      {isLoading ? "Loading..." : "Sign out"}
    </DropdownMenuItem>
  );
}
