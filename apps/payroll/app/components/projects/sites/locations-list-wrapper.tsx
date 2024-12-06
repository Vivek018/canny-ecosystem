import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getInputProps } from "@conform-to/react";
import { useEffect } from "react";

export function LocationsListWrapper({
  locationOptions: { data: locationOptions, error },
  resetKey,
  fields,
}: any) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load locations",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <>
      <SearchableSelectField
        key={resetKey}
        className="capitalize"
        options={locationOptions}
        inputProps={{
          ...getInputProps(fields.company_location_id, {
            type: "text",
          }),
        }}
        placeholder={"Select Company Location"}
        labelProps={{
          children: "Company Location",
        }}
        errors={fields.company_location_id.errors}
      />
    </>
  );
}
