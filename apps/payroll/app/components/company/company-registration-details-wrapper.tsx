import { useEffect } from "react";
import { CompanyRegistrationDetails } from "./company-registration-details";
import { DeleteCompany } from "./delete-company";
import { toast } from "@canny_ecosystem/ui/use-toast";
import type { CompanyRegistrationDetailsRow } from "@canny_ecosystem/supabase/types";

export default function CompanyRegistrationDetailsWrapper({
  data,
  error,
}: {
  data: Omit<CompanyRegistrationDetailsRow, "created_at" | "updated_at"> | null;
  error: Error | null | { message: string };
}) {
  const companyId = data?.company_id ?? "";

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error.message || "Failed to load",
        variant: "destructive",
      });
  }, [error]);

  return (
    <>
      <CompanyRegistrationDetails
        updateValues={{
          ...data,
          company_id: data?.company_id ?? companyId,
        }}
    
      />
      <DeleteCompany companyId={companyId} />
    </>
  );
}
