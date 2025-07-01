import { useUser } from "@/utils/user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import { Card, CardTitle } from "@canny_ecosystem/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { toast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  deleteRole,
  hasPermission,
  readRole,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useNavigate, useParams } from "@remix-run/react";
import { DeleteEmployeeDocument } from "./delete-employee-document";

export default function DocumentCard({
  documentData,
}: {
  documentData: {
    name: string;
    url: string;
    documentId: string;
  };
}) {
  const { role } = useUser();
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Free memory after download
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Success",
        description: `${filename} downloaded successfully`,
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

  const handleEdit = () => {
    navigate(
      `/employees/${employeeId}/documents/${documentData.documentId}/update-document`
    );
  };

  return (
    <Card
      key={documentData.documentId}
      className="w-full select-text cursor-pointer flex flex-col overflow-hidden rounded-lg shadow-md transition-transform duration-300"
    >
      <div className="flex items-center justify-center bg-muted/30 hover:bg-muted/50 h-60 w-full">
        <Avatar className="h-full w-full rounded-md">
          <>
            <AvatarImage
              src={documentData.url}
              alt={documentData.name}
              className="h-full w-full object-cover"
            />
            <AvatarFallback className="h-full w-full rounded-md bg-secondary/70 flex items-center justify-center capitalize text-sm font-medium">
              {replaceUnderscore(documentData.name)}
            </AvatarFallback>
          </>
        </Avatar>
      </div>

      <div className="px-4 py-3 flex justify-between items-center border-t">
        <CardTitle
          className="text-sm tracking-wide hover:text-primary truncate"
          onClick={() => window.open(documentData.url, "_blank")}
        >
          {replaceUnderscore(documentData.name)}
        </CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-full hover:bg-secondary grid place-items-center">
            <Icon name="dots-vertical" size="xs" />
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={8} align="end">
            <DropdownMenuItem
              onClick={() =>
                documentData.url &&
                handleDownload(
                  documentData.url,
                  `${documentData.name}_${employeeId}.pdf`
                )
              }
              className={cn(
                "hidden",
                hasPermission(
                  role,
                  `${readRole}:${attribute.employeeDocuments}`
                ) && "flex"
              )}
            >
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator
              className={cn(
                !hasPermission(
                  `${role}`,
                  `${updateRole}:${attribute.employeeDocuments}`
                ) && "hidden"
              )}
            />
            <DropdownMenuItem
              onClick={handleEdit}
              className={cn(
                "hidden",
                hasPermission(
                  role,
                  `${updateRole}:${attribute.employeeDocuments}`
                ) && "flex"
              )}
            >
              Edit document
            </DropdownMenuItem>
            <DropdownMenuSeparator
              className={cn(
                !hasPermission(
                  `${role}`,
                  `${deleteRole}:${attribute.employeeDocuments}`
                ) && "hidden"
              )}
            />
            <DeleteEmployeeDocument
              employeeId={employeeId as string}
              documentType={documentData.name}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
