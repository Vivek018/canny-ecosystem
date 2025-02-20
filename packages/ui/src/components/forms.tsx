import { useInputControl } from "@conform-to/react";
import type React from "react";
import {
  type ChangeEventHandler,
  type LabelHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useId,
  useState,
} from "react";
import { Checkbox, type CheckboxProps } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { cn } from "@/utils";
import { Combobox, type ComboboxSelectOption } from "./combobox";
import { Button } from "./button";
import { parseStringValue } from "@canny_ecosystem/utils";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/utils/hooks/isomorphic-layout-effect";
import { Icon } from "./icon";
import {
  KitchenSinkToolbar,
  MDXEditor,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";

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
  errorClassName,
  prefix,
  suffix,
}: {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
  errorClassName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const isRequired = inputProps.required;

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className='flex flex-row gap-[1px]'>
        <Label htmlFor={id} {...labelProps} />
        <sub
          className={cn(
            "hidden text-primary",
            labelProps?.children && isRequired && "inline"
          )}
        >
          *
        </sub>
      </div>
      <div className='relative flex items-center'>
        {prefix && <span className='absolute left-2 text-muted'>{prefix}</span>}
        <Input
          id={id}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          {...inputProps}
          className={cn(
            prefix && "pl-8",
            suffix && "pr-8",
            inputProps.className
          )}
        />
        {suffix && (
          <span className='absolute right-2 text-muted'>{suffix}</span>
        )}
      </div>
      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
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
  errorClassName,
}: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  errors?: ListOfErrors;
  className?: string;
  errorClassName?: string;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const isRequired = textareaProps.required;

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className='flex flex-row gap-[1px]'>
        <Label htmlFor={id} {...labelProps} />
        <sub
          className={cn(
            "hidden text-primary",
            labelProps?.children && isRequired && "inline"
          )}
        >
          *
        </sub>
      </div>
      <Textarea
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...textareaProps}
      />
      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
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
  errorClassName,
}: {
  labelProps: JSX.IntrinsicElements["label"];
  buttonProps: CheckboxProps & {
    name: string;
    form: string;
    value?: string;
    disabled?: boolean;
  };
  errors?: ListOfErrors;
  className?: string;
  errorClassName?: string;
}) {
  const { key, ...checkboxProps } = buttonProps;
  const fallbackId = useId();
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
          checked={buttonProps.checked}
          onCheckedChange={buttonProps.onCheckedChange}
          onFocus={buttonProps.onFocus}
          onBlur={buttonProps.onBlur}
          type='button'
        />
        <Label
          htmlFor={id}
          {...labelProps}
          className='self-center text-foreground'
        />
        <sub
          className={cn(
            "hidden text-primary",
            labelProps?.children && isRequired && "inline"
          )}
        >
          *
        </sub>
      </div>
      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
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
  errorClassName?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export function SearchableSelectField({
  options,
  labelProps,
  inputProps,
  errors,
  className,
  errorClassName,
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
        <sub
          className={cn(
            "hidden text-primary",
            labelProps?.children && isRequired && "inline"
          )}
        >
          *
        </sub>
      </div>
      <input
        type='hidden'
        id={id}
        name={inputProps.name}
        value={input.value ?? ""}
        onChange={
          input.change as unknown as ChangeEventHandler<HTMLInputElement>
        }
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
        disabled={inputProps.disabled || inputProps.readOnly}
      />
      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
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
  errorClassName?: string;
};

export function JSONBField({
  labelProps,
  inputProps,
  errors,
  className,
  errorClassName,
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
        <sub
          className={cn(
            "hidden text-primary",
            labelProps?.children && isRequired && "inline"
          )}
        >
          *
        </sub>
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
      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
        {errors && errors.length > 0 ? <ErrorList errors={errors} /> : null}
      </div>
    </div>
  );
}

export type FieldConfig = {
  key: string;
  type: "number" | "text";
  placeholder?: string;
};

export type RangeFieldProps = {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: {
    id?: string;
    name: string;
    required?: boolean;
    defaultValue?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  errors?: string[];
  className?: string;
  errorClassName?: string;
  fields: FieldConfig[];
};

export const RangeField = ({
  labelProps,
  inputProps,
  errors,
  className,
  errorClassName,
  fields,
}: RangeFieldProps) => {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const isRequired = inputProps.required;

  const [ranges, setRanges] = useState<Array<Record<string, any>>>([
    (() => {
      const acc: Record<string, any> = {};
      for (const field of fields) {
        acc[field.key] = "";
      }
      return acc;
    })(),
  ]);

  useEffect(() => {
    try {
      if (inputProps.defaultValue) {
        const parsedValue = JSON.parse(inputProps.defaultValue);
        if (Array.isArray(parsedValue)) {
          setRanges(parsedValue);
        }
      }
    } catch (error) {
      console.error("Failed to parse range value:", error);
    }
  }, [inputProps.defaultValue]);

  const updateValue = (newRanges: Array<Record<string, any>>) => {
    const event = {
      target: {
        name: inputProps.name,
        value: JSON.stringify(newRanges),
      },
    } as React.ChangeEvent<HTMLInputElement>;

    inputProps?.onChange?.(event);
  };

  const handleFieldChange = (
    index: number,
    fieldKey: string,
    value: string
  ) => {
    const newRanges = [...ranges];
    newRanges[index] = {
      ...newRanges[index],
      [fieldKey]:
        fields.find((f) => f.key === fieldKey)?.type === "number"
          ? Number(value) || 0
          : value,
    };
    setRanges(newRanges);
    updateValue(newRanges);
  };

  const addRange = () => {
    const newRange = fields.reduce((acc: Record<string, any>, field) => {
      acc[field.key] = field.type === "number" ? 0 : "";
      return acc;
    }, {} as Record<string, any>);

    const newRanges = [...ranges, newRange];
    setRanges(newRanges);
    updateValue(newRanges);
  };

  const removeRange = (index: number) => {
    const newRanges = ranges.filter((_, i) => i !== index);
    setRanges(newRanges);
    updateValue(newRanges);
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className='flex'>
        <Label htmlFor={inputProps.id} {...labelProps} />
        <sub
          className={cn(
            "hidden text-primary",
            labelProps?.children && isRequired && "inline"
          )}
        >
          *
        </sub>
      </div>

      {ranges.map((range, index) => (
        <div key={String(index)} className='flex gap-2 mb-2'>
          {fields.map((field) => (
            <Input
              key={field.key}
              type={field.type}
              placeholder={field.placeholder || field.key}
              value={range[field.key]}
              onChange={(e) =>
                handleFieldChange(index, field.key, e.target.value)
              }
              className='flex-1'
            />
          ))}
          <Button
            type='button'
            onClick={() => removeRange(index)}
            variant='destructive-outline'
            className='px-3'
          >
            <Icon name='cross' />
          </Button>
        </div>
      ))}

      <Button
        type='button'
        onClick={addRange}
        variant='primary-outline'
        className='mt-2'
      >
        Add Range
      </Button>

      <input
        {...inputProps}
        type='hidden'
        id={id}
        defaultValue={undefined}
        value={JSON.stringify(ranges)}
      />

      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
        {errors && errors.length > 0 ? (
          <div className='text-destructive'>
            {errors.map((error, index) => (
              <div key={String(index)}>{error}</div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export function MarkdownField({
  labelProps,
  textareaProps,
  theme = "light",
  errors,
  className,
  errorClassName,
}: {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement>;
  theme?: "dark" | "light" | "system";
  errors?: string[];
  className?: string;
  errorClassName?: string;
}) {
  const { isDocument } = useIsDocument();
  const fallbackId = useId();
  const id = textareaProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  const input = useInputControl({
    name: textareaProps.name!,
    formId: textareaProps.form!,
    initialValue: String(textareaProps.defaultValue!),
  });

  return isDocument ? (
    <div className={className}>
      {/* Label */}
      <Label htmlFor={id} {...labelProps} />
      <sub
        className={cn(
          "hidden text-primary",
          textareaProps?.children && textareaProps.required && "inline"
        )}
      >
        *
      </sub>
      <input
        type='hidden'
        id={id}
        name={textareaProps.name}
        value={input.value ?? ""}
        onChange={
          input.change as unknown as ChangeEventHandler<HTMLInputElement>
        }
        onBlur={input.blur}
      />
      {/* Markdown Editor */}
      <MDXEditor
        placeholder={textareaProps.placeholder}
        markdown={input.value ?? ""}
        onChange={(value) => {
          input.change(value ?? ("" as string));
        }}
        plugins={[
          toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
          listsPlugin(),
          quotePlugin(),
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: "JavaScript",
              css: "CSS",
              txt: "text",
              tsx: "TypeScript",
            },
          }),
          diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
          markdownShortcutPlugin(),
        ]}
        className={cn("border rounded", theme === "dark" && "dark-theme")}
      />

      {/* Errors */}
      <div className={cn("min-h-6 px-4 pb-2", errorClassName)}>
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  ) : (
    <></>
  );
}
