import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@canny_ecosystem/ui/dropdown-menu";
import { replaceDash } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

export const SalaryEntryDropdown = ({
  data,
  triggerChild,
}: {
  data: any;
  triggerChild: React.ReactElement;
  editable: boolean;
}) => {
  const navigate = useNavigate();

  const employeeId = data?.employee.id;

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    document: string
  ) => {
    e.preventDefault();
    navigate(`${employeeId}/${document}`);
  };

  const employeeDocuments = ["salary-slip"];

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {employeeDocuments.map((document) => (
            <DropdownMenuItem
              key={document}
              onClick={(e) => handleClick(e, document)}
            >
              Preview {`${replaceDash(document)}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
