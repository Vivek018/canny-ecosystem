import { ErrorBoundary } from "@/components/error-boundary";
import PaginationButton from "@/components/form/pagination-button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LIST_LIMIT } from "@canny_ecosystem/supabase/constant";
import { getFeedbacksByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  formatDateTime,
  hasPermission,
  readRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") ?? "1");
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.feedbackList}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const feedbackPromise = getFeedbacksByCompanyId({
      supabase,
      companyId,
      page,
      limit: LIST_LIMIT,
    });

    return defer({
      status: "success",
      message: null,
      page,
      feedbackPromise,
    });
  } catch (error) {
    return defer({
      status: "error",
      message: "Failed to load feedback data",
      error,
      page: 1,
      feedbackPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.feedback_list}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

function FeedbackCard({ feedback }: { feedback: any }) {
  return (
    <Card className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row space-y-0 items-center justify-between py-4">
        <CardTitle className="font-bold">{feedback.category}</CardTitle>
        <CardTitle
          className={cn(
            "px-1",
            feedback.severity === "urgent"
              ? "text-destructive"
              : feedback.severity === "normal"
              ? "text-purple-500"
              : "text-yellow-400"
          )}
        >
          {feedback.severity}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-0.5">
        <article className="py-2">
          <h3 className="capitalize text-sm">{feedback.subject}</h3>
          <p className="pt-1 capitalize text-xs text-muted-foreground break-words line-clamp-4">
            {feedback.message}
          </p>
        </article>
      </CardContent>

      <CardFooter className="flex-col items-center">
        <div className="w-full flex flex-shrink items-center justify-start">
          <Avatar className="w-10 h-10 cursor-pointer">
            {feedback.users?.avatar && (
              <AvatarImage
                src={feedback.users?.avatar}
                alt={`${feedback.users?.first_name} ${feedback.users?.last_name}`}
              />
            )}
            <AvatarFallback>
              <span className="text-xs">
                {feedback.users?.first_name?.charAt(0)?.toUpperCase()}
              </span>
            </AvatarFallback>
          </Avatar>
          <div className="w-full flex justify-between text-wrap items-center">
            <div className="flex flex-col ml-3">
              <span className="text-wrap">
                {`${feedback.users.first_name} ${feedback.users.last_name}`}
              </span>
              <span className="truncate w-36 text-xs text-[#606060] font-normal">
                {feedback.users.email}
              </span>
            </div>
            <div className="ml-2 truncate text-xs text-[#606060] font-normal text-wrap">
              {formatDateTime(feedback.created_at)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function FeedbackList() {
  const { toast } = useToast();
  const { feedbackPromise, page, status, message } =
    useLoaderData<typeof loader>();

  useEffect(() => {
    if (status === "error" && message) {
      clearCacheEntry(cacheKeyPrefix.feedback_list);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  }, [status, message, toast]);

  if (status === "error") {
    clearCacheEntry(cacheKeyPrefix.feedback_list);
    return <ErrorBoundary message="Failed to load feedback list" />;
  }

  return (
    <section className="pt-4 flex flex-col h-full">
      <div className="h-full flex flex-col w-full flex-grow justify-between items-end">
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={feedbackPromise}>
            {(feedbackResult) => {
              if (feedbackResult?.error || !feedbackResult?.data) {
                clearCacheEntry(cacheKeyPrefix.feedback_list);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to load feedback data",
                });
                return <ErrorBoundary message="Failed to load feedback data" />;
              }

              return (
                <>
                  <div className="flex-1 w-full grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 justify-start auto-rows-min">
                    {feedbackResult?.data.map((feedback) => (
                      <FeedbackCard key={feedback.id} feedback={feedback} />
                    ))}
                  </div>
                    {feedbackResult?.data.length === 0 && (
                      <div className="flex  justify-center items-center w-full h-full text-lg">
                        No feedbacks found
                      </div>
                    )}
                  <PaginationButton
                    page={page}
                    totalCount={feedbackResult?.totalCount ?? 0}
                    limit={LIST_LIMIT}
                  />
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
