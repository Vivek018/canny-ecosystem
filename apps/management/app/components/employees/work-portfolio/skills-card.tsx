import {
  Card,
  CardContent,
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
import type { EmployeeSkillDatabaseRow } from "@canny_ecosystem/supabase/types";
import { DeleteSkill } from "./delete-skill";
import {
  createRole,
  deleteRole,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

type EmployeeSkill = Omit<
  EmployeeSkillDatabaseRow,
  "created_at" | "updated_at"
>;

export const SkillItem = ({ skill }: { skill: EmployeeSkill }) => {
  const { role } = useUser();
  return (
    <Card
      key={skill.id}
      className="w-[420px] shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {skill.skill_name ?? "--"}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/employees/${skill.employee_id}/work-portfolio/${skill.id}/update-employee-skill`}
                  className={cn(
                    buttonVariants({ variant: "muted" }),
                    "px-2.5 h-min",
                    !hasPermission(
                      role,
                      `${updateRole}:${attribute.employeeSkills}`,
                    ) && "hidden",
                  )}
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "muted" }),
                "px-2.5 h-min hidden",
                hasPermission(
                  role,
                  `${deleteRole}:${attribute.employeeSkills}`,
                ) && "flex",
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeleteSkill
                  employeeId={skill.employee_id}
                  skillId={skill.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-row justify-between gap-0.5 px-4">
        <DetailItem label="Proficiency" value={skill.proficiency} />
        <DetailItem
          label="Years of experience"
          value={skill.years_of_experience}
        />
      </CardContent>
    </Card>
  );
};

export const EmployeeSkillsCard = ({
  employeeSkills,
}: {
  employeeSkills: EmployeeSkill[] | null;
}) => {
  const { role } = useUser();
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Skills</h2>
        <div>
          <Link
            to="add-employee-skill"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-card",
              !hasPermission(
                role,
                `${createRole}:${attribute.employeeSkills}`,
              ) && "hidden",
            )}
          >
            <Icon name="plus-circled" className="mr-2" />
            Add
          </Link>
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {employeeSkills?.length ? (
          <div className="flex items-center gap-4 min-w-max">
            {employeeSkills.map((skill, index) => (
              <SkillItem key={skill?.id + index.toString()} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No employee skills available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
