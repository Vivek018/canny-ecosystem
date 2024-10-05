import { useInputControl } from "@conform-to/react";
import { ErrorList, type ListOfErrors } from "@canny_ecosystem/ui/forms";
import { Label } from "@canny_ecosystem/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useId } from "react";
import { workingDaysOptions } from "@/constant";

export function WorkingDaysField({
  labelProps,
  errors,
  className,
  selectProps,
}: {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  errors?: ListOfErrors;
  className?: string;
  selectProps: React.SelectHTMLAttributes<HTMLSelectElement> & {
    defaultValue?: string[];
  };
}) {
  const fallbackId = useId();
  const id = labelProps?.htmlFor ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  // Using Conform's useField hook to manage the field
  const selectInput: any = useInputControl({
    name: selectProps.name!,
    formId: selectProps.form!,
    initialValue: selectProps.defaultValue as string[],
  });

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className="flex flex-row gap-[1px]">
        <Label {...labelProps}>Working Days</Label>
      </div>

      <ToggleGroup
        type="multiple"
        variant="outline"
        className="flex gap-2"
        value={selectInput.value ?? ""}
        onValueChange={selectInput.change as any}
        onBlur={selectInput.blur}
      >
        {workingDaysOptions.map((day) => (
          <ToggleGroupItem
            key={day.value}
            value={day.value}
            className="flex items-center space-x-2"
          >
            {day.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <select
        multiple
        value={selectInput.value ?? ""}
        onChange={selectInput.change as any}
        onBlur={selectInput.blur}
        className="hidden"
      >
        {workingDaysOptions.map((day) => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>

      {/* Error Display */}
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}
