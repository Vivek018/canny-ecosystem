import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";
import { useState } from "react";

export const FilesSelect = ({
  setFiles,
}: {
  setFiles: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}) => {
  const files = [
    { value: "CSV-Data", label: "CSV Data" },
    { value: "Leaves-Register", label: "Leaves Register" },
    
  ];

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleFieldChange = (newSelectedFields: string[]) => {
    setSelectedFields(newSelectedFields);
    setFiles(newSelectedFields);
  };

  const handleRenderSelectedItem = (values: string[]): string => {
    if (values.length === 0) return "";

    if (values.length <= 1) {
      return files
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
        label="Files to be sent"
        options={files}
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
        aria-label="Filter by files"
        aria-required="false"
        aria-multiselectable="true"
        aria-describedby="files-description"
      />
      <span id="files-description" className="sr-only">
        Select one or more files. Shows individual email names when 3 or fewer
        are selected.
      </span>
    </div>
  );
};
