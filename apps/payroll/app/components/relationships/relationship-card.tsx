import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useNavigate } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { DeleteRelationship } from "./delete-relationship";
import {
  getAutoTimeDifference,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import type { RelationshipWithCompany } from "@canny_ecosystem/supabase/queries";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";

export function RelationshipCard({
  relationship,
}: {
  relationship: Omit<RelationshipWithCompany, "created_at" | "updated_at">;
}) {

  const navigate = useNavigate();
  const viewRelationshipTermsParam = `${modalSearchParamNames.view_relationship_terms}=true`;

  return (
    <Card
      key={relationship.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {replaceUnderscore(relationship.relationship_type)}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/settings/${relationship.id}/update-relationship`}
                  className="p-2 rounded-md bg-secondary grid place-items-center border-foreground"
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center border-foreground">
              <Icon name="dots" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={cn(
                    "py-2 text-[13px]",
                    !relationship.terms && "hidden",
                  )}
                  onClick={() => {
                    navigate(
                      `/settings/relationships/${relationship.id}?${viewRelationshipTermsParam}`,
                    );
                  }}
                >
                  View Terms
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={cn(!relationship.terms && "hidden")}
                />
                <DeleteRelationship relationshipId={relationship.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4 mt-4">
        <div className="flex flex-row w-full items-center justify-between">
          <h2 className="capitalize w-max p-2 border border-input rounded-md bg-muted/75">
            {relationship.parent_company.name}
          </h2>
          <div
            className={cn(
              "bg-input flex-1 h-[0.5px]",
              relationship.is_active && "bg-primary",
            )}
          >
            &nbsp;
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full bg-primary/75",
                    !relationship.is_active && "hidden",
                  )}
                >
                  &nbsp;
                </div>
              </TooltipTrigger>
              <TooltipContent>Active</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div
            className={cn(
              "bg-input flex-1 h-[0.5px]",
              relationship.is_active && "bg-primary",
            )}
          >
            &nbsp;
          </div>
          <h2 className="capitalize p-2 border border-input rounded-md bg-muted/75">
            {relationship.child_company.name}
          </h2>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "mx-4 mb-1.5 mt-auto p-0 py-1.5 text-foreground text-xs flex gap-1 justify-between font-semibold",
        )}
      >
        <p
          className={cn(
            "text-green bg-green/25 rounded-md p-1 flex items-center gap-1 capitalize",
          )}
        >
          <Icon name="clock" size="xs" className=" scale-x-[-1]" />
          {getAutoTimeDifference(
            relationship.start_date,
            new Date().toISOString(),
          )}{" "}
          days ago
        </p>
        <p
          className={cn(
            "text-destructive bg-destructive/25 rounded-md flex items-center gap-1 p-1 capitalize",
            !getAutoTimeDifference(
              new Date().toISOString(),
              relationship.end_date,
            ) && "hidden",
          )}
        >
          <Icon name="clock" size="xs" />
          {getAutoTimeDifference(
            new Date().toISOString(),
            relationship.end_date,
          )! > 0
            ? ` In ${getAutoTimeDifference(new Date().toISOString(), relationship.end_date)} Days`
            : `${getAutoTimeDifference(
                relationship.start_date,
                new Date().toISOString(),
              )} days ago`}
        </p>
      </CardFooter>
    </Card>
  );
}
