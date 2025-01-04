import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useNavigate, useSearchParams } from "@remix-run/react";

export function AddEmployeeDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuItem
          onClick={() => navigate("/employees/create-employee")}
          className="space-x-2"
        >
          <Icon name="plus-circled" size="sm" />
          <span>Create employee</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_employee_personals
            );
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Personals</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_employee_statutory
            );
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Statutory</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_employee_banking
            );
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Banking</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_employee_address
            );
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Address</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_employee_guardians
            );
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Guardian's</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
