import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteInvoice } from "./delete-invoice";
import { toast } from "@canny_ecosystem/ui/use-toast";

export const InvoiceOptionsDropdown = ({
  invoiceId,
  triggerChild,
  proofUrl,
  invoiceNumber,
  hide,
}: {
  hide: boolean;
  invoiceId: string;
  triggerChild: React.ReactElement;
  proofUrl: string;
  invoiceNumber: string;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleViewInvoice = () => {
    navigate(`/payroll/invoices/${invoiceId}/preview-invoice`);
  };

  const handleInvoiceUpdate = () => {
    navigate(`/payroll/invoices/${invoiceId}/update-invoice`);
  };

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

  const handleDownloadProof = async (url: string, filename: string) => {
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
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleViewInvoice}>
            View Invoice
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator
          className={cn(
            !hasPermission(role, `${updateRole}:${attribute.invoice}`) &&
              !hasPermission(role, `${deleteRole}:${attribute.invoice}`) &&
              "hidden",
            hide && "hidden",
          )}
        />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.invoice}`) &&
                "flex",
              hide && "hidden",
            )}
            onClick={handleInvoiceUpdate}
          >
            Update Invoice
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.invoice}`) &&
                "flex",
              hide && "hidden",
            )}
          />
          <DropdownMenuItem
            className={cn(
              (!hasPermission(role, `${updateRole}:${attribute.invoice}`) ||
                !proofUrl) &&
                "hidden",
            )}
            onClick={() => handleDownloadProof(proofUrl, `${invoiceNumber}`)}
          >
            Download Proof
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "flex",
              (!hasPermission(role, `${updateRole}:${attribute.invoice}`) ||
                !proofUrl) &&
                "hidden",
              hide && "hidden",
            )}
          />
          <DeleteInvoice hide={hide} invoiceId={invoiceId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
