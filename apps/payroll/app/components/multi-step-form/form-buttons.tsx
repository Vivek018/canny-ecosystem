import { Button } from "@canny_ecosystem/ui/button";
import { CardFooter } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { FormMetadata } from "@conform-to/react";
import { useSearchParams } from "@remix-run/react";

export const FormButtons = ({
  form,
  setResetKey,
  step,
  totalSteps,
  isSingle = false,
}: {
  form: FormMetadata<any, string[]>;
  setResetKey: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  totalSteps: number;
  isSingle?: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <CardFooter className="flex items-center justify-between">
      <div className={cn("flex flex-row items-center justify-center gap-4")}>
        <Button
          variant="outline"
          size="full"
          onClick={(e) => {
            e.preventDefault();

            const nextStep = Math.min(step + 1, totalSteps);
            searchParams.set("step", String(nextStep));
            setSearchParams(searchParams);
          }}
          disabled={step === 1 || step === totalSteps}
          className={cn(isSingle && "hidden")}
        >
          Skip
        </Button>
      </div>
      <div className="ml-auto flex flex-row items-center justify-center gap-4">
        <Button
          variant="secondary"
          size="full"
          type="reset"
          onClick={() => setResetKey(Date.now())}
          {...form.reset.getButtonProps()}
        >
          Reset
        </Button>
        <Button
          disabled={step === 1}
          variant="outline"
          size="full"
          onClick={(e) => {
            e.preventDefault();

            const nextStep = Math.max(step - 1, 1);
            searchParams.set("step", String(nextStep));
            setSearchParams(searchParams);
          }}
          className={cn(isSingle && "hidden")}
        >
          Back
        </Button>
        <Button
          form={form.id}
          disabled={!form.valid}
          variant="primary-outline"
          size="full"
          type="submit"
          name="_action"
          value="next"
          className={cn(
            "min-w-28 px-0",
            step === totalSteps && "hidden",
            isSingle && "hidden",
          )}
        >
          Next
        </Button>
        <Button
          form={form.id}
          disabled={!form.valid}
          variant="default"
          size="full"
          type="submit"
          name="_action"
          value="submit"
          className={cn(
            "min-w-28 px-0",
            !isSingle && step !== totalSteps ? "hidden" : "flex",
          )}
        >
          Submit
        </Button>
      </div>
    </CardFooter>
  );
};

// import { Button } from "@canny_ecosystem/ui/button";
// import { CardFooter } from "@canny_ecosystem/ui/card";
// import { cn } from "@canny_ecosystem/ui/utils/cn";
// import type { FormMetadata } from "@conform-to/react";

// export const FormButtons = ({
//   form,
//   setResetKey,
//   step,
//   totalSteps,
//   isSingle = false,
// }: {
//   form: FormMetadata<any, string[]>;
//   setResetKey: React.Dispatch<React.SetStateAction<number>>;
//   step: number;
//   totalSteps: number;
//   isSingle?: boolean;
// }) => {
//   return (
//     <CardFooter className="flex items-center justify-between">
//       <div className={cn("flex flex-row items-center justify-center gap-4")}>
//         <Button
//           variant="outline"
//           type="submit"
//           size="full"
//           name="_action"
//           value="skip"
//           disabled={step === 1 || step === totalSteps}
//           className={cn(isSingle && "hidden")}
//         >
//           Skip
//         </Button>
//       </div>
//       <div className="ml-auto flex flex-row items-center justify-center gap-4">
//         <Button
//           variant="secondary"
//           size="full"
//           type="reset"
//           onClick={() => setResetKey(Date.now())}
//           {...form.reset.getButtonProps()}
//         >
//           Reset
//         </Button>
//         <Button
//           disabled={step === 1 || !form.valid}
//           variant="outline"
//           type="submit"
//           size="full"
//           name="_action"
//           value="back"
//           className={cn(isSingle && "hidden")}
//         >
//           Back
//         </Button>
//         <Button
//           form={form.id}
//           disabled={!form.valid}
//           variant="primary-outline"
//           size="full"
//           type="submit"
//           name="_action"
//           value="next"
//           className={cn(
//             "min-w-28 px-0",
//             step === totalSteps && "hidden",
//             isSingle && "hidden",
//           )}
//         >
//           Next
//         </Button>
//         <Button
//           form={form.id}
//           disabled={!form.valid}
//           variant="default"
//           size="full"
//           type="submit"
//           name="_action"
//           value="submit"
//           className={cn(
//             "min-w-28 px-0",
//             !isSingle && step !== totalSteps ? "hidden" : "flex",
//           )}
//         >
//           Submit
//         </Button>
//       </div>
//     </CardFooter>
//   );
// };
