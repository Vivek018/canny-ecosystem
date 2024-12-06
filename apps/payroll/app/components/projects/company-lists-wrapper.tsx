import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getInputProps } from "@conform-to/react";
import { useEffect } from "react";

export function CompanyListsWrapper({
  companyOptions: { data: companyOptions, error },
  fields,
  resetKey,
  companyOptionsFromUpdate,
}: any) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="grid grid-cols-2 place-content-center justify-between gap-6">
      <SearchableSelectField
        key={resetKey + 1}
        inputProps={{
          ...getInputProps(fields.primary_contractor_id, {
            type: "text",
          }),
          placeholder: "Select Primary Contractor",
        }}
        options={companyOptionsFromUpdate ?? companyOptions}
        labelProps={{
          children: "Primary Contactor",
        }}
        errors={fields.primary_contractor_id.errors}
      />
      <SearchableSelectField
        key={resetKey + 2}
        inputProps={{
          ...getInputProps(fields.end_client_id, {
            type: "text",
          }),
          placeholder: "Select End Client",
        }}
        options={companyOptionsFromUpdate ?? companyOptions}
        labelProps={{
          children: "End Client",
        }}
        errors={fields.end_client_id.errors}
      />
    </div>
  );
}
