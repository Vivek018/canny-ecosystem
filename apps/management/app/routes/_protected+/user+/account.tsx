import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { UserAvatar } from "@/components/accounts/user-avatar";
import { UserName } from "@/components/accounts/user-name";
import { UserContact } from "@/components/accounts/user-contact";
import LoadingSpinner from "@/components/loading-spinner";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { user } = await getSessionUser({ request });
    const userEmail = user?.email;

    if (!userEmail) {
      throw new Error("No user email found");
    }

    const userDataPromise = getUserByEmail({
      supabase,
      email: userEmail,
    });

    return defer({
      status: "success",
      message: "User data found",
      error: null,
      userDataPromise,
    });
  } catch (error) {
    return defer({
      status: "error",
      message: "Failed to get user data",
      error,
      userDataPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.account, args);
}

clientLoader.hydrate = true;

export default function AccountSettings() {
  const { userDataPromise, error } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  useEffect(() => {
    setResetKey(Date.now());
  }, [userDataPromise]);

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.account);
    return (
      <ErrorBoundary error={error} message="Failed to load user details" />
    );
  }

  return (
    <section key={resetKey}>
      <div className="flex flex-col gap-6 w-full lg:w-2/3 py-4">
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={userDataPromise}>
            {(resolvedData) => {
              if (!resolvedData || resolvedData.error) {
                clearExactCacheEntry(cacheKeyPrefix.account);
                return <ErrorBoundary message="Failed to load user details" />;
              }

              const userData = resolvedData.data;
              const userId = userData?.id;

              return (
                <>
                  <UserAvatar
                    avatar={userData?.avatar ?? ""}
                    first_name={userData?.first_name ?? ""}
                  />
                  <UserName
                    key={`${userId}-${resetKey}`}
                    updateValues={userData}
                  />
                  <UserContact
                    key={`${userId}-${resetKey}-1`}
                    updateValues={userData}
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
