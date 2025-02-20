import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, workingDaysOptions } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { useUser } from "@/utils/user";
import { getSitePaySequenceInSite } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { SitePaySequenceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Label } from "@canny_ecosystem/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, getOrdinalSuffix, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const siteId = params.siteId as string;
    const projectId = params.projectId as string;
    try {
        const { supabase } = getSupabaseWithHeaders({ request });
        const paySequencePromise = getSitePaySequenceInSite({ supabase, siteId });
        return defer({ paySequencePromise, siteId, projectId, error: null });
    } catch (error) {
        return defer({ paySequencePromise: null, siteId, projectId, error }, { status: 500 });
    }
}

export const PaySequenceItem = ({ paySequence }: { paySequence: Omit<SitePaySequenceDatabaseRow, "created_at" | "updated_at">}) => {
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
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    className="flex gap-2"
                    disabled={true}
                >
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

export const PaySequenceCard = (
    { paySequence, siteId, projectId }:
        {
            paySequence: Omit<SitePaySequenceDatabaseRow, "created_at" | "updated_at"> | null;
            siteId: string, projectId: string
        }) => {
    const { role } = useUser();

    return (
        <Card className='rounded w-full h-full p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold'>Pay Sequence</h2>
                <div>
                    <Link
                        to={`/projects/${projectId}/${siteId}/edit-pay-sequence`}
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

export default function PaySequence() {
    const { paySequencePromise, siteId, projectId } = useLoaderData<typeof loader>();

    return (
        <div className='w-full py-4 flex flex-col gap-8'>
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