import { useUser } from "@/utils/user";
import type { SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Card } from "@canny_ecosystem/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useParams } from "@remix-run/react";
import { DeleteSite } from "./delete-site";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";

// Site Details
type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {

  return (
    <div className='flex flex-col'>
      <h3 className='text-muted-foreground text-[13px] tracking-wide capitalize'>
        {label}
      </h3>
      <p className='truncate w-80'>{value ?? "--"}</p>
    </div>
  );
};

const SiteDetails = ({
  siteData,
}: {
  siteData: Omit<SitesWithLocation, "created_at" | "updated_at"> | null;
}) => {
  return (
    <section className='w-full select-text cursor-auto h-full flex flex-col justify-start p-4'>
      <ul className='grid grid-cols-3 gap-4'>
        <li>
          <DetailItem label='Site Name' value={siteData?.name} />
        </li>
        <li>
          <DetailItem label='Site Code' value={siteData?.site_code} />
        </li>
        <li>
          <DetailItem label='Address Line 1' value={siteData?.address_line_1} />
        </li>
        <li>
          <DetailItem label='Address Line 2' value={siteData?.address_line_2} />
        </li>
        <li>
          <DetailItem label='City' value={siteData?.city} />
        </li>
        <li>
          <DetailItem label='State' value={siteData?.state} />
        </li>
        <li>
          <DetailItem label='Pincode' value={siteData?.pincode} />
        </li>
        <li>
          <DetailItem label='Latitude' value={siteData?.latitude} />
        </li>
        <li>
          <DetailItem label='Longitude' value={siteData?.longitude} />
        </li>
        <li>
          <DetailItem
            label='Company Location'
            value={siteData?.company_location?.name}
          />
        </li>
        <li>
          <DetailItem
            label='Status'
            value={siteData?.is_active ? "Active" : "Inactive"}
          />
        </li>
      </ul>
    </section>
  );
};

export const SiteDetailsCard = ({
  siteData,
}: {
  siteData: Omit<SitesWithLocation, "created_at" | "updated_at"> | null;
}) => {
  const { role } = useUser();
  const { projectId, siteId } = useParams();

  return (
    <Card className='rounded w-full h-full p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Site Details</h2>
        <div className='flex gap-4'>
          <Link
            to={`/projects/${projectId}/sites/${siteId}/update-site`}
            className={cn(buttonVariants({ variant: "outline" }), "bg-card")}
          >
            <Icon name='edit' className='mr-2' />
            Edit
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline" }),
                "bg-card",
                !hasPermission(
                  role,
                  `${updateRole}:${attribute.projectSite}`
                ) && "hidden"
              )}
            >
              <Icon name='dots-vertical' size='xs' className='mr-1.5' />
              <p>More Options</p>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align='end'>
              <DropdownMenuGroup>
                <DeleteSite projectId={projectId!} siteId={siteId!} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='w-full overflow-scroll no-scrollbar'>
        <div className='flex items-center gap-4 min-w-max'>
          <SiteDetails siteData={siteData} />
        </div>
      </div>
    </Card>
  );
};
