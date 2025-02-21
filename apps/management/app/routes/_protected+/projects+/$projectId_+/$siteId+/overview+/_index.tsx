import { OverViewSiteCardDropdown } from "@/components/employees/overview-site-card-dropdown";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, workingDaysOptions } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { useUser } from "@/utils/user";
import { getSiteById, getSitePaySequenceInSite, type SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { SitePaySequenceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Card } from "@canny_ecosystem/ui/card";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Label } from "@canny_ecosystem/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, getOrdinalSuffix, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

// loader
export async function loader({ request, params }: LoaderFunctionArgs) {
    const siteId = params.siteId as string;
    const projectId = params.projectId as string;
    try {
        const { supabase } = getSupabaseWithHeaders({ request });
        const paySequencePromise = getSitePaySequenceInSite({ supabase, siteId });
        const sitePromise = getSiteById({ supabase, id: siteId });
        return defer({ sitePromise, paySequencePromise, siteId, projectId, error: null });
    } catch (error) {
        return defer({ sitePromise: null, paySequencePromise: null, siteId, projectId, error }, { status: 500 });
    }
}

// Pay Sequence
export const PaySequenceItem = ({ paySequence }: { paySequence: Omit<SitePaySequenceDatabaseRow, "created_at" | "updated_at"> }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <Label className="font-bold">Pay Day:</Label>
                <p className="text-base">
                    {getOrdinalSuffix(paySequence.pay_day)} of every month
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Label className="font-bold">Pay Frequency:</Label>
                <p className="capitalize">{paySequence.pay_frequency}</p>
            </div>
            <div className="flex items-center gap-2">
                <Label className="w-max font-bold">Working Days:</Label>
                <ToggleGroup type="multiple" variant="outline" className="flex gap-2" disabled={true}>
                    {workingDaysOptions.map(({ label, value }) => (
                        <ToggleGroupItem
                            key={value}
                            className={cn(
                                "flex items-center space-x-2 disabled:opacity-100",
                                paySequence.working_days.includes(Number.parseInt(value)) &&
                                "bg-secondary",
                            )}
                        >
                            {label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </div>
    );
};

export const PaySequenceCard = ({
    paySequence, siteId, projectId
}: {
    paySequence: Omit<SitePaySequenceDatabaseRow, "created_at" | "updated_at"> | null;
    siteId: string, projectId: string
}
) => {
    const { role } = useUser();

    return (
        <Card className='rounded w-full h-full p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold'>Pay Sequence</h2>
                <div>
                    <Link
                        to={`/projects/${projectId}/${siteId}/overview/edit-pay-sequence`}
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "bg-card",
                            !hasPermission(
                                `${role}`,
                                `${createRole}:${attribute.employeePaymentTemplateLink}`
                            ) && "hidden"
                        )}
                    >
                        <Icon name={"edit"} className='mr-2' />
                        Edit
                    </Link>
                </div>
            </div>

            <div className='w-full overflow-scroll no-scrollbar'>
                {paySequence ? (
                    <div className='flex items-center gap-4 min-w-max'>
                        <PaySequenceItem paySequence={paySequence} />
                    </div>
                ) : (
                    <div className='text-center py-8'>
                        <p>Pay squence not available</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Site Details
type DetailItemProps = {
    label: string;
    value: string | number | null | undefined;
    formatter?: (value: string | number) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, formatter }) => {
    const formattedValue = value ? (formatter ? formatter(value.toString()) : value) : "--";

    return (
        <div className='flex flex-col'>
            <h3 className='text-muted-foreground text-[13px] tracking-wide capitalize'>
                {label}
            </h3>
            <p className='truncate w-80'>{formattedValue}</p>
        </div>
    );
};

const SiteDetails = ({ siteData }: { siteData: Omit<SitesWithLocation, "created_at" | "updated_at"> | null }) => {
    return (
        <section className='w-full select-text cursor-auto h-full flex flex-col justify-start p-4'>
            <ul className='grid grid-cols-3 gap-4'>
                <li><DetailItem label='Site Name' value={siteData?.name} /></li>
                <li><DetailItem label='Site Code' value={siteData?.site_code} /></li>
                <li><DetailItem label='Address Line 1' value={siteData?.address_line_1} /></li>
                <li><DetailItem label='Address Line 2' value={siteData?.address_line_2} /></li>
                <li><DetailItem label='City' value={siteData?.city} /></li>
                <li><DetailItem label='State' value={siteData?.state} /></li>
                <li><DetailItem label='Pincode' value={siteData?.pincode} /></li>
                <li><DetailItem label='Latitude' value={siteData?.latitude} /></li>
                <li><DetailItem label='Longitude' value={siteData?.longitude} /></li>
                <li><DetailItem label='Company Location' value={siteData?.company_location?.name} /></li>
                <li><DetailItem label='Status' value={siteData?.is_active ? 'Active' : 'Inactive'} /></li>
            </ul>
        </section>
    );
};

export const SiteCard = (
    { siteData, siteId, projectId }:
        {
            siteData: Omit<SitesWithLocation, "created_at" | "updated_at"> | null;
            siteId: string;
            projectId: string;
        }
) => {
    const { role } = useUser();
    return (
        <Card className='rounded w-full h-full p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold'>Site Details</h2>
                <div className='flex gap-4'>
                    <Link
                        to={`/projects/${projectId}/sites/${siteId}/update-site`}
                        className={cn(buttonVariants({ variant: "outline" }), "bg-card")}
                    >
                        <Icon name="edit" className='mr-2' />
                        Edit
                    </Link>
                    <OverViewSiteCardDropdown
                        siteId={siteId}
                        projectId={projectId}
                        triggerChild={
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
                        }
                    />
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

export default function Overview() {
    const { sitePromise, paySequencePromise, siteId, projectId } = useLoaderData<typeof loader>();

    return (
        <div className='w-full py-4 flex flex-col gap-8'>
            <Suspense fallback={<div>Loading...</div>}>
                <Await resolve={sitePromise}>
                    {(resolvedSiteData) => {
                        if (!resolvedSiteData) {
                            clearExactCacheEntry(`${cacheKeyPrefix.sites}${siteId}`);
                            return <ErrorBoundary message='Failed to load link template' />;
                        }
                        return <SiteCard
                            siteData={resolvedSiteData.data}
                            siteId={siteId}
                            projectId={projectId}
                        />
                    }}
                </Await>
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
                <Await resolve={paySequencePromise}>
                    {(resolvedPaySequence) => {
                        if (!resolvedPaySequence) {
                            clearExactCacheEntry(`${cacheKeyPrefix.sites}${siteId}`);
                            return <ErrorBoundary message='Failed to load link template' />;
                        }
                        return <PaySequenceCard
                            paySequence={resolvedPaySequence?.data}
                            siteId={siteId}
                            projectId={projectId}
                        />
                    }}
                </Await>
            </Suspense>
        </div>
    );
}