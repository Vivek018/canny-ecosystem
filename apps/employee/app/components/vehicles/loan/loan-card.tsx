import { Card } from "@canny_ecosystem/ui/card";
import type { VehiclesLoanDetailsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { formatDate } from "@canny_ecosystem/utils";
import { toast } from "@canny_ecosystem/ui/use-toast";
import { DetailItem } from "../details-card";

export type VehicleLoan = Omit<VehiclesLoanDetailsDatabaseRow, "created_at">;

export const VehicleLoanItem = ({ loan }: { loan: VehicleLoan }) => {
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
    <div className="w-full select-text flex flex-col gap-4 pb-1 justify-start">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DetailItem label="Bank Name" value={loan?.bank_name} />
        <DetailItem label="Period" value={loan?.period} />
        <DetailItem label="Amount" value={loan?.amount} />
        <DetailItem label="Interest" value={loan?.interest} />
        <DetailItem label="Monthly EMI" value={loan.monthly_emi} />
        <DetailItem label="Start Date" value={formatDate(loan.start_date)} />
        <DetailItem label="End Date" value={formatDate(loan.end_date)} />
        {!!loan.document && (
          <DetailItem
            label="Document"
            value={
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <p
                className="text-primary cursor-pointer"
                onClick={() =>
                  handleDownloadDocument(
                    loan?.document as string,
                    `${loan?.vehicle_id}`,
                  )
                }
              >
                Click to Download
              </p>
            }
          />
        )}
      </div>
    </div>
  );
};

export const VehicleLoanCard = ({
  vehicleLoan,
}: {
  vehicleLoan: VehicleLoan | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Vehicle Loan</h2>
      </div>

      <div className="w-full">
        {vehicleLoan?.vehicle_id ? (
          <VehicleLoanItem loan={vehicleLoan} />
        ) : (
          <div className="text-center py-8">
            <p>No Loan available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
