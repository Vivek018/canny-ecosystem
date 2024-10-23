import { useInputControl } from "@conform-to/react";
import type React from "react";
import { useId, useState } from "react";
import { Checkbox, type CheckboxProps } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { cn } from "@/utils";
import { Combobox, type ComboboxSelectOption } from "./combobox";
import { Button } from "./button";
import { parseStringValue } from "@canny_ecosystem/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/isomorphic-layout-effect";
import { Icon } from "./icon";

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
    <ul id={id} className='flex flex-col gap-1'>
      {errorsToRender.map((e) => (
        <li key={e} className='text-[10px] text-destructive'>
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
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
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
      <div className='flex flex-row gap-[1px]'>
        <Label htmlFor={id} {...labelProps} />
        <sub className='text-primary'>
          {isRequired && labelProps ? "*" : ""}
        </sub>
      </div>
      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      <div className='min-h-[28px] px-4 pb-4 pt-1'>
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
      <div className='flex flex-row gap-[1px]'>
        <Label htmlFor={id} {...labelProps} />
        <sub className='text-primary'>{isRequired ? "*" : ""}</sub>
      </div>
      <Textarea
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...textareaProps}
      />
      <div className='min-h-[28px] px-4 pb-4 pt-1'>
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

// BUG: when default value is true in schema, it is not changing back to false when unchecked, if the default is false, its working properly
// BUG UPDATE: it only works when the default value is false, it is not working in any other case
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
  const isRequired = buttonProps.required;

  return (
    <div className={className}>
      <div className='flex items-center gap-2'>
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
          type='button'
        />
        <Label
          htmlFor={id}
          {...labelProps}
          className='self-center text-foreground'
        />
        <sub className='text-primary'>{isRequired ? "*" : ""}</sub>
      </div>
      <div className='px-4 pb-6 pt-1'>
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

type SearchableSelectFieldProps = {
  options: ComboboxSelectOption[];
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export function SearchableSelectField({
  options,
  labelProps,
  inputProps,
  errors,
  className,
  placeholder,
  onChange,
}: SearchableSelectFieldProps) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const isRequired = inputProps.required;

  const input = useInputControl({
    name: inputProps.name!,
    formId: inputProps.form!,
    initialValue: inputProps.defaultValue as string,
  });

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className='flex'>
        <Label {...labelProps} />
        <sub className='text-primary'>{isRequired ? "*" : ""}</sub>
      </div>
      <input
        type='hidden'
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
        onChange={(value) => {
          input.change(value);
          onChange?.(value);
        }}
        placeholder={placeholder ?? inputProps.placeholder}
      />
      <div className='min-h-[32px] px-4 pb-3 pt-1'>
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}

type JSONBFieldProps = {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: string[];
  className?: string;
};

export function JSONBField({
  labelProps,
  inputProps,
  errors,
  className,
}: JSONBFieldProps) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const isRequired = inputProps.required;

  const [pairs, setPairs] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  useIsomorphicLayoutEffect(() => {
    try {
      const parsedValue = JSON.parse(
        inputProps.defaultValue?.toString() || "{}"
      );
      const initialPairs = Object.entries(parsedValue).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setPairs(
        initialPairs.length > 0 ? initialPairs : [{ key: "", value: "" }]
      );
    } catch (error) {
      console.error("Failed to parse JSONB value:", error);
    }
  }, [inputProps.defaultValue]);

  const updateJSONBValue = (newPairs: { key: string; value: string }[]) => {
    const jsonbValue = newPairs.reduce((acc, { key, value }) => {
      if (key) {
        try {
          acc[key] = parseStringValue(value);
        } catch {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as Record<string, any>);
    const event = {
      target: {
        name: inputProps.name,
        value: JSON.stringify(jsonbValue),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    inputProps?.onChange?.(event);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const newPairs = [...pairs];
    newPairs[index].key = newKey;
    setPairs(newPairs);
    updateJSONBValue(newPairs);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newPairs = [...pairs];
    newPairs[index].value = newValue;
    setPairs(newPairs);
    updateJSONBValue(newPairs);
  };

  const addPair = () => {
    const newPairs = [...pairs, { key: "", value: "" }];
    setPairs(newPairs);
    updateJSONBValue(newPairs);
  };

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
    updateJSONBValue(newPairs);
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className='flex'>
        <Label htmlFor={inputProps.id} {...labelProps} />
        <sub className='text-primary'>{isRequired ? "*" : ""}</sub>
      </div>
      {pairs.map((pair, index) => (
        <div key={index.toString()} className='flex gap-2 mb-2'>
          <Input
            placeholder='Key'
            value={pair.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            className='flex-1'
          />
          <Input
            placeholder='Value'
            value={pair.value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            className='flex-1'
          />
          <Button
            type='button'
            onClick={() => removePair(index)}
            variant='destructive-outline'
            className='px-3'
          >
            <Icon name='cross' size='md' />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        onClick={addPair}
        variant='primary-outline'
        className='mt-2'
      >
        Add Key-Value Pair
      </Button>
      <input
        {...inputProps}
        type='hidden'
        id={id}
        defaultValue={undefined}
        value={JSON.stringify(
          pairs.reduce((acc, { key, value }) => {
            if (key) acc[key] = parseStringValue(value);
            return acc;
          }, {} as Record<string, string>)
        )}
      />
      <div className='min-h-[28px] px-4 pb-4 pt-1'>
        {errors && errors.length > 0 ? <ErrorList errors={errors} /> : null}
      </div>
    </div>
  );
}
