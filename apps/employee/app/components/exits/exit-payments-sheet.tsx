import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@canny_ecosystem/ui/sheet";
import { useNavigate } from "@remix-run/react";

type ExitPaymentsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: {
    employee_id: string;
    employees?: {
      first_name: string;
      middle_name?: string;
      last_name: string;
    };
    note?: string;
    bonus?: number;
    leave_encashment?: number;
    gratuity?: number;
    deduction?: number;
  };
};

export function ExitPaymentsSheet({
  open,
  onOpenChange,
  rowData,
}: ExitPaymentsSheetProps) {
  const navigate = useNavigate();

  const netPay =
    (rowData?.bonus ?? 0) +
    (rowData?.leave_encashment ?? 0) +
    (rowData?.gratuity ?? 0) -
    (rowData?.deduction ?? 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px]">
        <SheetHeader className="m-5">
          <SheetTitle
            className="flex justify-between cursor-pointer"
            onClick={() => {
              navigate(`/employees/${rowData.employee_id}/payments`);
            }}
          >
            <div>
              <h1 className="text-primary text-3xl">
                {rowData?.employees
                  ? `${rowData?.employees?.first_name} ${
                      rowData?.employees?.middle_name ?? ""
                    } ${rowData?.employees?.last_name}`
                  : "--"}
              </h1>
              <p className="mt-2 pr-5 text-sm">{rowData?.note}</p>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">{netPay}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <hr />
        <div className="mx-5 flex justify-between">
          <h3 className="my-3 text-green font-semibold">(+) EARNINGS</h3>
          <p className="my-3 font-bold">Amount</p>
        </div>
        <hr />
        <div className="flex justify-between mx-5">
          <div>
            <h3 className="my-3 text-muted-foreground font-semibold">Bonus</h3>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Leave Encashment
            </h3>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Gratuity
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData?.bonus ?? "--"}</p>
            <p className="my-3">Rs {rowData?.leave_encashment ?? "--"}</p>
            <p className="my-3">Rs {rowData?.gratuity ?? "--"}</p>
          </div>
        </div>

        <hr />
        <div className="mx-5 flex justify-between">
          <h3 className="my-3 text-destructive font-semibold">(-) DEDUCTION</h3>
          <p className="my-3 font-bold">Amount</p>
        </div>
        <hr />
        <div className="flex justify-between mx-5">
          <div>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Deduction
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData?.deduction ?? "--"}</p>
          </div>
        </div>

        <hr />
        <div className="flex justify-between mx-5">
          <h3 className="my-3 text-muted-foreground font-semibold">Net Pay</h3>
          <p className="my-3 font-bold">Rs {netPay}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
