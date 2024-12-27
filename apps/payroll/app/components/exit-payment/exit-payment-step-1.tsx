import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import {
  reasonForExitArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { getInputProps, getTextareaProps } from "@conform-to/react";

export function ExitPaymentStep1({ fields }: { fields: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee's Exit Details Page 1</CardTitle>
      </CardHeader>
      <CardContent>
        <Field
          inputProps={{
            ...getInputProps(fields.last_working_day, { type: "date" }),
          }}
          labelProps={{
            children: replaceUnderscore(fields.last_working_day.name),
          }}
          errors={fields.last_working_day.errors}
        />

        <SearchableSelectField
          className='capitalize'
          options={transformStringArrayIntoOptions(
            reasonForExitArray as unknown as string[]
          )}
          inputProps={{
            ...getInputProps(fields.reason_for_exit, { type: "text" }),
          }}
          placeholder={`Select ${fields.reason_for_exit.name}`}
          labelProps={{
            children: replaceUnderscore(fields.reason_for_exit.name),
          }}
          errors={fields.reason_for_exit.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.final_settlement_date, {
              type: "date",
            }),
          }}
          labelProps={{
            children: replaceUnderscore(fields.final_settlement_date.name),
          }}
          errors={fields.final_settlement_date.errors}
        />

        <TextareaField
          textareaProps={{
            ...getTextareaProps(fields.note),
            placeholder: `Enter ${fields.note.name}`,
          }}
          labelProps={{ children: fields.note.name }}
          errors={fields.note.errors}
        />
      </CardContent>
    </Card>
  );
}
