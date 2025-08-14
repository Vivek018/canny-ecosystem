import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { VehiclesInsuranceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Link } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  createRole,
  deleteRole,
  formatDate,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteInsurance } from "./delete-insurance";
import { toast } from "@canny_ecosystem/ui/use-toast";

type VehicleInsurance = Omit<VehiclesInsuranceDatabaseRow, "created_at">;

export const VehicleInsuranceItem = ({
  insurance,
}: {
  insurance: VehicleInsurance;
}) => {
  const { role } = useUser();
  const getExtensionFromContentType = (contentType: string | null) => {
    if (!contentType) return "";

    if (contentType.includes("pdf")) return ".pdf";
    if (contentType.includes("jpeg")) return ".jpg";
    if (contentType.includes("png")) return ".png";
    if (contentType.includes("gif")) return ".gif";
    if (contentType.includes("bmp")) return ".bmp";
    if (contentType.includes("webp")) return ".webp";

    return ""; // fallback no extension
  };

  const handleDownloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get("Content-Type");

      const extension = getExtensionFromContentType(contentType);

      let finalFilename = filename;

      if (!filename.toLowerCase().endsWith(extension) && extension) {
        finalFilename += extension;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Success",
        description: `${finalFilename} downloaded successfully`,
        variant: "success",
      });
    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Error",
        description: "Download failed, please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      key={insurance.id}
      className="w-[420px] shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {insurance?.insurance_company ?? "--"}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/vehicles/${insurance.vehicle_id}/${insurance.id}/update-vehicle-insurance`}
                  className={cn(
                    buttonVariants({ variant: "muted" }),
                    "px-2.5 h-min",
                    !hasPermission(
                      role,
                      `${updateRole}:${attribute.vehicle_insurance}`
                    ) && "hidden"
                  )}
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "muted" }),
                "px-2.5 h-min",
                !insurance.document &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.vehicle_insurance}`
                  ) &&
                  "hidden"
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={cn(
                    (!hasPermission(
                      role,
                      `${updateRole}:${attribute.vehicle_insurance}`
                    ) ||
                      !insurance.document) &&
                      "hidden"
                  )}
                  onClick={() =>
                    handleDownloadDocument(
                      insurance?.document as string,
                      `${insurance.insurance_number}`
                    )
                  }
                >
                  Download Proof
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={cn(!insurance.document && "hidden")}
                />
                <DeleteInsurance
                  vehicleId={insurance.vehicle_id}
                  insuranceId={insurance.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <h1 className="not-italic line-clamp-3">
          {insurance?.insurance_number}
        </h1>
        <div className="flex items-center capitalize gap-2">
          <p>{insurance?.insurance_yearly_amount}</p>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "mx-4 mb-1.5 mt-auto p-0 py-1.5 text-foreground text-xs flex gap-1 justify-between font-semibold"
        )}
      >
        <p
          className={cn(
            "text-green bg-green/25 rounded-md p-1 flex items-center gap-1 capitalize",
            !formatDate(insurance?.start_date) && "hidden"
          )}
        >
          <Icon name="clock" size="xs" className="scale-x-[-1]" />
          {formatDate(insurance?.start_date)}
        </p>
        <p
          className={cn(
            "text-destructive bg-destructive/25 rounded-md flex items-center gap-1 p-1 capitalize",
            !formatDate(insurance?.end_date) && "hidden"
          )}
        >
          <Icon name="clock" size="xs" />
          {formatDate(insurance?.end_date)}
        </p>
      </CardFooter>
    </Card>
  );
};

export const VehicleInsuranceCard = ({
  vehicleInsurance,
}: {
  vehicleInsurance: VehicleInsurance[] | null;
}) => {
  const { role } = useUser();
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Vehicle Insurance</h2>
        <div>
          <Link
            to={
              hasPermission(
                role,
                `${createRole}:${attribute.vehicle_insurance}`
              )
                ? "add-vehicle-insurance"
                : DEFAULT_ROUTE
            }
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-card",
              !hasPermission(
                role,
                `${createRole}:${attribute.vehicle_insurance}`
              ) && "hidden"
            )}
          >
            <Icon name="plus-circled" className="mr-2" />
            Add
          </Link>
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {vehicleInsurance?.length ? (
          <div className="flex items-center gap-4 min-w-max">
            {vehicleInsurance.map((insurance, index) => (
              <VehicleInsuranceItem
                key={insurance?.id + index.toString()}
                insurance={insurance}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No Insurance available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
