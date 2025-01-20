import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@canny_ecosystem/ui/dropdown-menu";
import { useNavigate } from "@remix-run/react";
export const PayrollEntryDropdown = ({ payrollId, employeeId, triggerChild }: { payrollId: string, employeeId: string, triggerChild: React.ReactElement }) => {

  const navigate = useNavigate();

  const handleSalarySlip = (e) => {
    e.preventDefault();
    navigate(`/payroll/payroll-history/${payrollId}/${employeeId}/salary-slip`);
  };


  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(e) => handleSalarySlip(e)}>
            Preview Salary Slip
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleSalarySlip(e)}>
            Preview
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
