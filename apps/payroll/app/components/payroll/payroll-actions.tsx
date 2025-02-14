import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { replaceDash } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

export function PayrollActions({ payrollId }: { payrollId: string }) {
  const navigate = useNavigate();

  const previewSalaryRegister = () => {
    navigate(`/payroll/payroll-history/${payrollId}/salary-register`);
  }

  const handleDownload = (document: string) => {
    navigate(`/payroll/payroll-history/${payrollId}/download-${document}`);
  }

  const epfDocuments = ["epf-return", "epf-register"];
  const esiDocuments = ["esi-return", "esi-register", "dispensary"];
  const otherDocuments = ["compensation-register", "gratuity-register", "wages-register", "overtime-register", "accident-register", "health-and-safety-register"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuItem onClick={previewSalaryRegister} className="space-x-2 flex items-center">
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Preview Salary register</span>
        </DropdownMenuItem>
        {
          otherDocuments.map((document) =>
            <DropdownMenuItem key={document} onClick={() => handleDownload(document)} className="space-x-2 flex items-center">
              <Icon name="import" size="sm" className="mb-0.5" />
              <span className="capitalize">Download {`${replaceDash(document)}`}</span>
            </DropdownMenuItem>
          )
        }
        <DropdownMenuSeparator />
        {
          epfDocuments.map((document) =>
            <DropdownMenuItem key={document} onClick={() => handleDownload(document)} className="space-x-2 flex items-center">
              <Icon name="import" size="sm" className="mb-0.5" />
              <span className="capitalize">Download {`${replaceDash(document)}`}</span>
            </DropdownMenuItem>
          )
        }
        <DropdownMenuSeparator />
        {
          esiDocuments.map((document) =>
            <DropdownMenuItem key={document} onClick={() => handleDownload(document)} className="space-x-2 flex items-center">
              <Icon name="import" size="sm" className="mb-0.5" />
              <span className="capitalize">Download {`${replaceDash(document)}`}</span>
            </DropdownMenuItem>
          )
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
