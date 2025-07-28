import { buttonVariants } from "@canny_ecosystem/ui/button";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  type ClientLoaderFunctionArgs,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { ErrorBoundary } from "@/components/error-boundary";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useUser } from "@/utils/user";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { DocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getCompanyDocumentsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import DocumentCard from "@/components/company/documents/document-card";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  try {
    const documentsPromise = getCompanyDocumentsByCompanyId({
      supabase,
      companyId,
    });
    return defer({
      status: "success",
      message: "Company documents found",
      error: null,
      documentsPromise,
    });
  } catch (error) {
    return defer({
      status: "error",
      message: "Failed to fetch company documents",
      error,
      documentsPromise: null,
    });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(`${cacheKeyPrefix.company_document}`, args);
}
clientLoader.hydrate = true;

// document page
export default function Documents() {
  const { role } = useUser();
  const { documentsPromise, error } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.company_document}`);
    return <ErrorBoundary error={error} message="Failed to fetch documents" />;
  }

  return (
    <section className="w-full py-4 px-0">
      <div className="w-full mb-6">
        <Suspense fallback={<LoadingSpinner />}>
          <Await resolve={documentsPromise}>
            {(resolvedData) => {
              if (!resolvedData || !resolvedData.data) {
                clearExactCacheEntry(`${cacheKeyPrefix.company_document}`);
                return <ErrorBoundary message="Failed to fetch documents" />;
              }
              return (
                <Command className="overflow-visible w-full">
                  <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                    <CommandInput
                      divClassName="border border-input rounded-md h-10 flex-1"
                      placeholder="Search Documents"
                      autoFocus={true}
                    />
                    <Link
                      to={"/settings/documents/add-document"}
                      className={cn(
                        buttonVariants({ variant: "primary-outline" }),
                        "flex items-center gap-1 whitespace-nowrap",
                        !hasPermission(
                          role,
                          `${createRole}:${attribute.companyDocuments}`,
                        ) && "hidden",
                      )}
                    >
                      <span>Add Document</span>
                    </Link>
                  </div>
                  <CommandEmpty
                    className={cn(
                      "w-full py-40 capitalize text-lg tracking-wide text-center",
                      !isDocument && "hidden",
                    )}
                  >
                    No document found.
                  </CommandEmpty>
                  <CommandList className="max-h-full py-2 px-0 overflow-x-visible overflow-y-visible">
                    <DocumentsWrapper
                      data={resolvedData.data}
                      error={resolvedData.error}
                    />
                  </CommandList>
                </Command>
              );
            }}
          </Await>
        </Suspense>
      </div>
      <Outlet />
    </section>
  );
}

export function DocumentsWrapper({
  data,
  error,
}: {
  data: Pick<DocumentsDatabaseRow, "id" | "name" | "url">[];
  error: unknown;
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(`${cacheKeyPrefix.company_document}`);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <CommandGroup className="w-full px-0">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 px-0">
        {data.map((document) => {
          return (
            <CommandItem
              key={document.id}
              value={document.name + document.id + document.url}
              className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
            >
              <DocumentCard
                documentData={{
                  name: document.name,
                  url: document.url,
                  id: document.id,
                }}
              />
            </CommandItem>
          );
        })}
      </div>
    </CommandGroup>
  );
}
