import { ErrorBoundary } from "@/components/error-boundary";
import { EditPaySequenceForm } from "@/components/pay-sequence/form/edit-pay-sequence-form";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { getSitePaySequenceInSite } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
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

export default function EditPaySequence() {
    const { paySequencePromise, siteId, projectId, error } = useLoaderData<typeof loader>();
    if (error) {
        clearExactCacheEntry(`${cacheKeyPrefix.sites}${siteId}`);
        return <ErrorBoundary error={error} message='Failed to load data' />;
    }
    return (
        <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
            <Suspense fallback={<div>Loading...</div>}>
                <Await resolve={paySequencePromise}>
                    {(resolvedPaySequence) => {
                        if (!resolvedPaySequence) {
                            clearExactCacheEntry(`${cacheKeyPrefix.sites}${siteId}`);
                            return <ErrorBoundary message='Failed to load link template' />;
                        }
                        return <Card>
                            <CardHeader>
                                <CardTitle className="text-3xl capitalize">
                                    Update Pay sequence
                                </CardTitle>
                                <CardDescription>
                                    Update Pay sequence for the site
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EditPaySequenceForm
                                    updateValues={resolvedPaySequence?.data}
                                    projectId={projectId!}
                                />
                            </CardContent>
                        </Card>
                    }}
                </Await>
            </Suspense>
        </section>
    );
}