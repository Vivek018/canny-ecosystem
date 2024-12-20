import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field } from "@canny_ecosystem/ui/forms";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { getInputProps } from "@conform-to/react";

export function Step2({ fields }: { fields: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee's Exit Details Page-2</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-10 my-4">
          <Field
            inputProps={{
              ...getInputProps(fields.organization_payable_days, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(
                fields.organization_payable_days.name
              ),
            }}
            errors={fields.organization_payable_days.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.employee_payable_days, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.employee_payable_days.name),
            }}
            errors={fields.employee_payable_days.errors}
          />
        </div>

        <h2>Additional Earnings</h2>
        <div className="grid grid-cols-3 gap-6 my-4">
          <Field
            inputProps={{
              ...getInputProps(fields.bonus, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.bonus.name),
            }}
            errors={fields.bonus.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.diwali_bonus, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.diwali_bonus.name),
            }}
            errors={fields.diwali_bonus.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.commission, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.commission.name),
            }}
            errors={fields.commission.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.joining_bonus, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.joining_bonus.name),
            }}
            errors={fields.joining_bonus.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.yearly_bonus, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.yearly_bonus.name),
            }}
            errors={fields.yearly_bonus.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.leave_encashment, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.leave_encashment.name),
            }}
            errors={fields.leave_encashment.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.gift_coupon, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.gift_coupon.name),
            }}
            errors={fields.gift_coupon.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.gratuity, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.gratuity.name),
            }}
            errors={fields.gratuity.errors}
          />
        </div>

        <hr />
        <div className="my-4">
          <Field
            inputProps={{
              ...getInputProps(fields.deduction, {
                type: "number",
              }),
            }}
            labelProps={{
              children: replaceUnderscore(fields.deduction.name),
            }}
            errors={fields.deduction.errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
