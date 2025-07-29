import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { useNavigate } from "@remix-run/react";
import { DeleteCase } from "./delete-case";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { toast } from "@canny_ecosystem/ui/use-toast";

export const CaseOptionsDropdown = ({
  caseId,
  triggerChild,
  documentUrl,
  caseTitle,
}: {
  caseId: string;
  triggerChild: React.ReactElement;
  documentUrl: string;
  caseTitle: string;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/events/cases/${caseId}/update-case`);
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
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleEdit}
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.cases}`) && "flex",
            )}
          >
            Update Case
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.cases}`) && "flex",
            )}
          />
          <DropdownMenuItem
            className={cn(
              (!hasPermission(role, `${updateRole}:${attribute.cases}`) ||
                !documentUrl) &&
                "hidden",
            )}
            onClick={() => handleDownloadDocument(documentUrl, `${caseTitle}`)}
          >
            Download document
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "flex",
              (!hasPermission(role, `${updateRole}:${attribute.cases}`) ||
                !documentUrl) &&
                "hidden",
            )}
          />
          <DeleteCase id={caseId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
