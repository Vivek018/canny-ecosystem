import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@canny_ecosystem/ui/tooltip";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useNavigate } from "@remix-run/react";
import { DeleteSite } from "./delete-site";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import type { SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { SiteDialog } from "../link-template/site-dialog";

export function SiteCard({ site, env, companyId }: { site: Omit<SitesWithLocation, "created_at" | "updated_at">, env: SupabaseEnv, companyId: string }) {
  const navigate = useNavigate();

  const viewPaySequenceSearchParam = `${modalSearchParamNames.view_pay_sequence}=true`;
  const editPaySequenceSearchParam = `${modalSearchParamNames.edit_pay_sequence}=true`;

  return (
    <Card
      key={site.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-start justify-between p-4">
        <div className="flex flex-col items-start">
          <CardTitle className="text-lg tracking-wide">{site.name}</CardTitle>
          <p className="text-[12px] w-max text-muted-foreground -mt-1 rounded-md">
            {site.site_code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/projects/${site.project_id}/${site.id}/update-site`}
                  className="p-2 rounded-md bg-secondary grid place-items-center"
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center">
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/projects/${site.project_id}/sites/${site.id}?${viewPaySequenceSearchParam}`);
                  }}
                >
                  View Pay Sequence
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/projects/${site.project_id}/sites/${site.id}?${editPaySequenceSearchParam}`);
                  }}
                >
                  Edit Pay Sequence
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SiteDialog env={env} site={site} companyId={companyId} />
                <DropdownMenuSeparator className={cn(!site.latitude && !site.longitude && "hidden")} />
                <DeleteSite projectId={site.project_id} siteId={site.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <address className="not-italic line-clamp-3">
          {`${site.address_line_1} ${site.address_line_2 ? site.address_line_2 : ""}`}
        </address>
        <div className="flex items-center capitalize gap-2">
          <p>{`${site.city},`}</p>
          <p>{`${replaceUnderscore(site.state)}`}</p>
          <p>{`- ${site.pincode}`}</p>
        </div>
      </CardContent>
      <CardFooter className={cn("p-0")}>
        <div
          className={cn(
            "border-t border-r bg-secondary rounded-tr-md text-foreground px-2.5 py-1.5",
            !site.company_location?.name && "opacity-0",
          )}
        >
          {site.company_location?.name}
        </div>
        <div
          className={cn(
            "px-2.5 ml-auto bg-secondary text-foreground py-1.5 h-full items-center text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
            !site.is_active && "opacity-0",
          )}
        >
          <Icon name="dot-filled" size="xs" />
          Active
        </div>
      </CardFooter>
    </Card >
  );
}