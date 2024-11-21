import { Button } from "@canny_ecosystem/ui/button";
import { StatusButton } from "@canny_ecosystem/ui/status-button";
import { CardFooter } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { FormMetadata } from "@conform-to/react";
import { useNavigation, useSearchParams } from "@remix-run/react";

export const FormButtons = ({
  form,
  setResetKey,
  step,
  totalSteps,
  isSingle = false,
}: {
  form: FormMetadata<any, string[]>;
  setResetKey?: React.Dispatch<React.SetStateAction<number>>;
  step?: number;
  totalSteps?: number;
  isSingle?: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const disableAll = navigation.state === "submitting" || (navigation.state === "loading");

  return (
    <CardFooter className='flex items-center justify-between'>
      <div className={cn("flex flex-row items-center justify-center gap-4")}>
        <Button
          variant='outline'
          size='full'
          onClick={(e) => {
            e.preventDefault();
            if (step && totalSteps) {
              const nextStep = Math.min(step + 1, totalSteps);
              searchParams.set("step", String(nextStep));
              setSearchParams(searchParams);
            }
          }}
          disabled={step === 1 || step === totalSteps || disableAll}
          className={cn(isSingle && "hidden")}
        >
          Skip
        </Button>
      </div>
      <div className='ml-auto flex flex-row items-center justify-center gap-4'>
        <Button
          variant='secondary'
          size='full'
          type='reset'
          disabled={disableAll}
          onClick={() => {
            if (setResetKey) {
              setResetKey(Date.now());
            }
          }}
          {...form.reset.getButtonProps()}
        >
          Reset
        </Button>
        <Button
          disabled={step === 1 || disableAll}
          variant='outline'
          size='full'
          onClick={(e) => {
            e.preventDefault();
            if (step) {
              const nextStep = Math.max(step - 1, 1);
              searchParams.set("step", String(nextStep));
              setSearchParams(searchParams);
            }
          }}
          className={cn(isSingle && "hidden")}
        >
          Back
        </Button>
        <StatusButton
          status={
            navigation.state === "submitting"
              ? "pending"
              : "idle"
          }
          form={form.id}
          disabled={!form.valid || disableAll}
          variant='primary-outline'
          size='full'
          type='submit'
          name='_action'
          value='next'
          className={cn(
            "min-w-28",
            step === totalSteps && "hidden",
            isSingle && "hidden"
          )}
        >
          Next
        </StatusButton>
        <StatusButton
          status={
            navigation.state === "submitting" 
              ? "pending"
              : "idle"
          }
          form={form.id}
          disabled={!form.valid || disableAll}
          variant='default'
          size='full'
          type='submit'
          name='_action'
          value='submit'
          className={cn(
            "min-w-28",
            !isSingle && step !== totalSteps ? "hidden" : "flex"
          )}
        >
          Submit
        </StatusButton>
      </div>
    </CardFooter>
  );
};
