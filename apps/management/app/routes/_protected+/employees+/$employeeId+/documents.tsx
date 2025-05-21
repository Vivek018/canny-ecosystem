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
  useParams,
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
import type { EmployeeDocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";
import DocumentCard from "@/components/employees/documents/document-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getEmployeeDocuments } from "@canny_ecosystem/supabase/queries";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId ?? "";
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const documentsPromise = getEmployeeDocuments({ supabase, employeeId });
    return defer({
      status: "success",
      message: "Employee documents found",
      error: null,
      documentsPromise,
      employeeId,
    });
  } catch (error) {
    return defer({
      status: "error",
      message: "Failed to fetch employee documents",
      error,
      documentsPromise: null,
      employeeId,
    });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(
    `${cacheKeyPrefix.employee_documents}${args.params.employeeId}`,
    args
  );
}
clientLoader.hydrate = true;

// document page
export default function Documents() {
  const { role } = useUser();
  const { documentsPromise, employeeId, error } =
    useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.employee_documents}${employeeId}`);
    return <ErrorBoundary error={error} message="Failed to fetch documents" />;
  }

  return (
    <section className="w-full px-0">
      <div className="w-full mb-6">
        <Suspense fallback={<LoadingSpinner />}>
          <Await resolve={documentsPromise}>
            {(resolvedData) => {
              if (!resolvedData || !resolvedData.data) {
                clearExactCacheEntry(
                  `${cacheKeyPrefix.employee_documents}${employeeId}`
                );
                return <ErrorBoundary message="Failed to fetch documents" />;
              }
              return (
                <Command className="overflow-visible w-full">
                  <div className="w-full md:w-3/4 lg:w-1/2 2xl:w-1/3 py-4 flex items-center gap-4">
                    <CommandInput
                      divClassName="border border-input rounded-md h-10 flex-1"
                      placeholder="Search Documents"
                      autoFocus={true}
                    />
                    <Link
                      to={`/employees/${employeeId}/documents/add-document`}
                      className={cn(
                        buttonVariants({ variant: "primary-outline" }),
                        "flex items-center gap-1 whitespace-nowrap",
                        !hasPermission(
                          role,
                          `${createRole}:${attribute.employeeDocuments}`
                        ) && "hidden"
                      )}
                    >
                      <span>Add Document</span>
                    </Link>
                  </div>
                  <CommandEmpty
                    className={cn(
                      "w-full py-40 capitalize text-lg tracking-wide text-center",
                      !isDocument && "hidden"
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
  data: Pick<EmployeeDocumentsDatabaseRow, "document_type" | "url" | "id">[];
  error: unknown;
}) {
  const { employeeId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(`${cacheKeyPrefix.employee_documents}${employeeId}`);
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
              key={document.document_type}
              value={document.document_type + document.url}
              className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
            >
              <DocumentCard
                documentData={{
                  name: document.document_type,
                  url: document.url,
                  documentId: document.id,
                }}
              />
            </CommandItem>
          );
        })}
      </div>
    </CommandGroup>
  );
}
