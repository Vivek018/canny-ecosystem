import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { DeleteProjectAssignment } from "./delete-project-assignment";
import type { EmployeeProjectAssignmentDataType } from "@canny_ecosystem/supabase/queries";
import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  formatter?: (date: string | Date) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, formatter }) => {
  const formattedValue = value
    ? formatter
      ? formatter(value as string)
      : value
    : "--";

  return (
    <div className='flex flex-col items-start'>
      <h3 className='text-muted-foreground text-[13px] tracking-wide capitalize'>
        {label}
      </h3>
      <p className='capitalize'>{formattedValue}</p>
    </div>
  );
};

export const ProjectAssignmentItem = ({
  projectAssignment,
}: {
  projectAssignment: EmployeeProjectAssignmentDataType;
}) => {
  return (
    <Card
      key={projectAssignment.id}
      className='w-[840px] shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start'
    >
      <CardHeader className='flex flex-row space-y-0 items-center justify-between p-4'>
        <CardTitle className='text-lg tracking-wide'>
          {projectAssignment.position ?? "--"}
        </CardTitle>
        <div className='flex items-center gap-3'>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch='intent'
                  to={`/employees/${projectAssignment.employee_id}/work-portfolio/${projectAssignment.id}/update-project-assignment`}
                  className={cn(
                    buttonVariants({ variant: "muted" }),
                    "px-2.5 h-min"
                  )}
                >
                  <Icon name='edit' size='xs' />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "muted" }),
                "px-2.5 h-min"
              )}
            >
              <Icon name='dots' size='xs' />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align='end'>
              <DropdownMenuGroup>
                <DeleteProjectAssignment
                  employeeId={projectAssignment.employee_id}
                  projectAssignmentId={projectAssignment.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className='grid grid-cols-3 gap-4 px-4'>
        <DetailItem
          label='Project Site'
          value={projectAssignment.project_site.name}
        />
        <DetailItem
          label='Supervisor Code'
          value={projectAssignment.supervisor?.employee_code}
        />
        <DetailItem
          label='Assignment Type'
          value={replaceUnderscore(projectAssignment?.assignment_type ?? "")}
        />
        <DetailItem
          label='Skill Level'
          value={replaceUnderscore(projectAssignment?.skill_level ?? "")}
        />
        <DetailItem
          label='Probation Period'
          value={projectAssignment?.probation_period ? "Yes" : "No"}
        />
        <DetailItem
          label='Prob. End Date'
          value={projectAssignment?.probation_end_date}
          formatter={formatDate}
        />
        <DetailItem
          label='Start Date'
          value={projectAssignment?.start_date}
          formatter={formatDate}
        />
        <DetailItem
          label='End Date'
          value={projectAssignment?.end_date}
          formatter={formatDate}
        />
      </CardContent>
      <CardFooter
        className={cn(
          "px-2.5 ml-auto bg-secondary text-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
          !projectAssignment?.is_current && "opacity-0"
        )}
      >
        <Icon name='dot-filled' size='xs' />
        Current
      </CardFooter>
    </Card>
  );
};

export const EmployeeProjectAssignmentsCard = ({
  employeeProjectAssignments,
}: {
  employeeProjectAssignments: EmployeeProjectAssignmentDataType[] | null;
}) => {
  return (
    <Card className='rounded w-full h-full p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Project Assignments</h2>
        <div>
          <Link
            to='add-project-assignment'
            className={cn(buttonVariants({ variant: "outline" }), "bg-card")}
          >
            <Icon name='plus-circled' className='mr-2' />
            Add
          </Link>
        </div>
      </div>

      <div className='w-full overflow-scroll no-scrollbar'>
        {employeeProjectAssignments?.length ? (
          <div className='flex items-center gap-4 min-w-max'>
            {employeeProjectAssignments.map((projectAssignment, index) => (
              <ProjectAssignmentItem
                key={projectAssignment?.id + index.toString()}
                projectAssignment={projectAssignment}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <p>No employee project assignments available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
