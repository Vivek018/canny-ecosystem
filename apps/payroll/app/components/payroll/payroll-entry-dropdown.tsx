import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@canny_ecosystem/ui/dropdown-menu";
import { replaceDash } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";
import type React from "react";
export const PayrollEntryDropdown = ({ payrollId, employeeId, triggerChild }: { payrollId: string, employeeId: string, triggerChild: React.ReactElement }) => {

  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, document: string) => {
    e.preventDefault();
    navigate(`/payroll/payroll-history/${payrollId}/${employeeId}/${document}`);
  };

  const employeeDocuments: string[] = ["salary-slip", "nomination-form", "accident-form"];

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          {
            employeeDocuments.map((document) =>
              <DropdownMenuItem key={document} onClick={(e) => handleClick(e, document)}>
                Preview {`${replaceDash(document)}`}
              </DropdownMenuItem>)
          }
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
