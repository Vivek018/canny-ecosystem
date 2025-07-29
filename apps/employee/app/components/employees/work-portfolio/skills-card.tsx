import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { EmployeeSkillDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useUser } from "@/utils/user";

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
  return (
    <Card
      key={skill.id}
      className="w-[420px] max-sm:w-72 max-sm:h-40 max-sm:justify-between shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {skill.skill_name ?? "--"}
        </CardTitle>
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
