import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";

export const UserEmailSelect = ({
  options,
  setTo,
  to,
}: {
  to?: string[];
  options: any[];
  setTo: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}) => {
  const emails = options.map((email) => ({
    value: email,
    label: email,
  }));

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleFieldChange = (newSelectedFields: string[]) => {
    setSelectedFields(newSelectedFields);
    setTo(newSelectedFields);
  };

  const handleRenderSelectedItem = (values: string[]): string => {
    if (values.length === 0) return "";

    if (values.length <= 3) {
      return emails
        .reduce<string[]>((accumulator, email) => {
          if (values.includes(String(email.value))) {
            accumulator.push(email.label);
          }
          return accumulator;
        }, [])
        .join(", ");
    }

    return `${values.length} selected`;
  };

  return (
    <div>
      <MultiSelectCombobox
        label="User Email to send"
        options={emails}
        value={selectedFields}
        onChange={handleFieldChange}
        renderItem={(email) => (
          <div
            role="option"
            aria-selected={selectedFields.includes(String(email.value))}
          >
            {email.label}
          </div>
        )}
        renderSelectedItem={handleRenderSelectedItem}
        aria-label="Filter by user"
        aria-required="false"
        aria-multiselectable="true"
        aria-describedby="user-email-description"
      />
      <p
        className={cn(
          "text-xs text-destructive mt-1 hidden",
          (to?.length === 0 || to?.length === undefined) && "flex",
        )}
      >
        Required
      </p>
    </div>
  );
};
