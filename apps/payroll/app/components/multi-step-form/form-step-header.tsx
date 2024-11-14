import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Fragment } from "react";

export const FormStepHeader = ({
  totalSteps,
  step,
  stepData,
}: {
  totalSteps: number;
  step: number;
  stepData: any[];
}) => {
  return (
    <div className="flex items-center justify-center">
      {[...Array(totalSteps).keys()].map((stepNumber) => (
        <Fragment key={stepNumber}>
          <div
            className={cn(
              "h-10 border grid place-items-center px-4 rounded-md",
              step - 1 === stepNumber
                ? "border-primary text-primary"
                : "border-input",
              stepData[stepNumber] &&
                "border-primary bg-primary text-primary-foreground",
            )}
          >
            <p className={cn(stepData[stepNumber] && "hidden")}>
              {stepNumber + 1}
            </p>
            <Icon
              name="check"
              className={cn(!stepData[stepNumber] && "hidden")}
            />
          </div>

          <div
            className={cn(
              "bg-foreground/75 h-[0.5px] mx-4 w-20",
              stepNumber + 1 === totalSteps && "hidden",
            )}
          >
            &nbsp;
          </div>
        </Fragment>
      ))}
    </div>
  );
};
