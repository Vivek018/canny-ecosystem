import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";
import { useState } from "react";

export const UserEmailSelect = ({
  options,
  setTo,
}: {
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
      <span id="user-email-description" className="sr-only">
        Select one or more user-email. Shows individual email names when 3 or
        fewer are selected.
      </span>
    </div>
  );
};
