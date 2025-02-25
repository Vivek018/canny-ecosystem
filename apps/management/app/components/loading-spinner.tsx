import { Spinner } from "@canny_ecosystem/ui/spinner";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export const LoadingSpinner = ({ className = "" }) => {
  return (
    <Spinner
      size={30}
      className={cn("absolute left-1/2 -translate-x-1/2 m-20", className)}
      barClassName="bg-primary"
    />
  );
};
