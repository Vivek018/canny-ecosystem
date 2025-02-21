import { DEFAULT_ROUTE } from "@/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

type ErrorBoundaryProps = {
  error?: Error | { message: string; [key: string]: unknown } | null | object;
  message?: string;
};

export function ErrorBoundary({ error, message }: ErrorBoundaryProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Error",
      description:
        (error as { message: string })?.message ||
        message ||
        "Something went wrong",
      variant: "destructive",
    });
  }, [error]);

  return (
    <div className="mt-20 flex justify-center items-center">
      <div className="text-center p-5 flex justify-between items-center flex-col gap-10 w-2/5">
        <div className="text-2xl font-semibold w-10/12">
          {message || "Something went wrong"}
        </div>
        <div className="flex flex-col justify-between items-center gap-4 w-full">
          <Button
            type="button"
            variant={"secondary"}
            className="px-5 py-2 w-1/2"
            onClick={() => navigate(DEFAULT_ROUTE)}
          >
            Go to home page
          </Button>
          <Button
            type="button"
            variant={"destructive-outline"}
            className="px-5 py-2 w-1/2"
            onClick={() => navigate(0)}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
