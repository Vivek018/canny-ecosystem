import { useInputControl } from "@conform-to/react";
import type React from "react";
import { useId } from "react";
import { Checkbox, type CheckboxProps } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { cn } from "@/utils";
import { Combobox, type ComboboxSelectOption } from "./combobox";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
  id,
  errors,
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul id={id} className="flex flex-col gap-1">
      {errorsToRender.map((e) => (
        <li key={e} className="text-[10px] text-destructive">
          {e}
        </li>
      ))}
    </ul>
  );
}

export function Field({
  labelProps,
  inputProps,
  errors,
  className,
}: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const isRequired = inputProps.required;

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className="flex flex-row gap-[1px]">
        <Label htmlFor={id} {...labelProps} />
        <sub className="text-primary">{isRequired ? "*" : ""}</sub>
      </div>
      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      <div className="min-h-[28px] px-4 pb-4 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

export function TextareaField({
  labelProps,
  textareaProps,
  errors,
  className,
}: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const isRequired = textareaProps.required;

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className="flex flex-row gap-[1px]">
        <Label htmlFor={id} {...labelProps} />
        <sub className="text-primary">{isRequired ? "*" : ""}</sub>
      </div>
      <Textarea
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...textareaProps}
      />
      <div className="min-h-[28px] px-4 pb-4 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

export function CheckboxField({
  labelProps,
  buttonProps,
  errors,
  className,
}: {
  labelProps: JSX.IntrinsicElements["label"];
  buttonProps: CheckboxProps & {
    name: string;
    form: string;
    value?: string;
  };
  errors?: ListOfErrors;
  className?: string;
}) {
  const { key, defaultChecked, ...checkboxProps } = buttonProps;
  const fallbackId = useId();
  const checkedValue = buttonProps.value ?? "on";
  const input = useInputControl({
    key,
    name: buttonProps.name,
    formId: buttonProps.form,
    initialValue: defaultChecked ? checkedValue : undefined,
  });
  const id = buttonProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Checkbox
          {...checkboxProps}
          id={id}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          checked={input.value === checkedValue}
          onCheckedChange={(state) => {
            input.change(state.valueOf() ? checkedValue : "");
            buttonProps.onCheckedChange?.(state);
          }}
          onFocus={(event) => {
            input.focus();
            buttonProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            input.blur();
            buttonProps.onBlur?.(event);
          }}
          type="button"
        />
        <Label
          htmlFor={id}
          {...labelProps}
          className="self-center text-foreground"
        />
      </div>
      <div className="px-4 pb-6 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

type SearchableSelectFieldProps = {
  options: ComboboxSelectOption[];
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
  placeholder?: string;
};

export function SearchableSelectField({
  options,
  labelProps,
  inputProps,
  errors,
  className,
  placeholder,
}: SearchableSelectFieldProps) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  const input = useInputControl({
    name: inputProps.name!,
    formId: inputProps.form!,
    initialValue: inputProps.defaultValue as string,
  });

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <Label {...labelProps} />
      <input
        type="hidden"
        id={id}
        name={inputProps.name}
        value={input.value ?? ""}
        onChange={input.change as any}
        onBlur={input.blur}
      />
      <Combobox
        key={input.value}
        options={options}
        value={input.value ?? ""}
        onChange={input.change}
        placeholder={placeholder}
      />
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}
