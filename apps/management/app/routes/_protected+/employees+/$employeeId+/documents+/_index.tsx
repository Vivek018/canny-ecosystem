import { Card, CardTitle } from "@canny_ecosystem/ui/card";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { createRole, hasPermission, replaceUnderscore, updateRole } from "@canny_ecosystem/utils";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeDocuments } from "../../../../../../../../packages/supabase/src/media/employee";
import { Await, type ClientLoaderFunctionArgs, Link, Outlet, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { ErrorBoundary } from "@/components/error-boundary";
import { toast, useToast } from "@canny_ecosystem/ui/use-toast";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useUser } from "@/utils/user";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@canny_ecosystem/ui/command";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteEmployeeDocument } from "@/components/employees/documents/delete-employee-document";
import { Avatar, AvatarFallback, AvatarImage } from "@canny_ecosystem/ui/avatar";

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
            employeeId
        });
    } catch (error) {
        return defer({
            status: "error",
            message: "Failed to fetch employee documents",
            error,
            documentsPromise: null,
            employeeId
        });
    }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
    return await clientCaching(
        `${cacheKeyPrefix.employee_documents}${args.params.employeeId}`,
        args,
    );
}
clientLoader.hydrate = true;

// document page
export default function Documents() {
    const { role } = useUser();
    const { documentsPromise, employeeId, error } = useLoaderData<typeof loader>();
    const { isDocument } = useIsDocument();

    if (error) {
        clearExactCacheEntry(`${cacheKeyPrefix.employee_documents}${employeeId}`);
        return <ErrorBoundary error={error} message="Failed to fetch documents" />;
    }

    return (
        <section className="pb-4">
            <div className="w-full flex items-end justify-between">
                <Command className="overflow-visible">
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
                                "flex items-center gap-1",
                                !hasPermission(
                                    role,
                                    `${createRole}:${attribute.employeeDocuments}`,
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
                    <CommandList className="max-h-full py-2 overflow-x-visible overflow-y-visible">
                        <Suspense fallback={<div>Loading...</div>}>
                            <Await resolve={documentsPromise}>
                                {(resolvedData) => {
                                    if (!resolvedData) {
                                        clearExactCacheEntry(`${cacheKeyPrefix.employee_documents}${employeeId}`);
                                        return <ErrorBoundary message="Failed to fetch documents" />;
                                    }
                                    return <DocumentsWrapper
                                        data={resolvedData.data}
                                        error={resolvedData.error}
                                    />
                                }}
                            </Await>
                        </Suspense>
                    </CommandList>
                </Command>
            </div>
            <Outlet />
        </section>
    );
}

// document wrapper
export function DocumentsWrapper({ data, error }: {
    data: {
        name: string,
        url: string
    }[];
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
        <CommandGroup className="p-4">
            <div className="w-full grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {data?.map((documentData) => (
                    <CommandItem
                        key={documentData.name}
                        value={documentData?.name}
                        className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                    >
                        <DocumentCard documentData={documentData} />
                    </CommandItem>
                ))}
            </div>
        </CommandGroup>
    );
}

// document card
export function DocumentCard({ documentData }: {
    documentData: {
        name: string;
        url: string;
    }
}) {
    const { role } = useUser();
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Free memory after download
            window.URL.revokeObjectURL(blobUrl);

            toast({
                title: "Success",
                description: `${filename} downloaded successfully`,
                variant: "success",
            });
        } catch (error) {
            console.error("Download failed", error);
            toast({
                title: "Error",
                description: "Download failed, please try again",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (documentName: string) => {
        navigate(`/employees/${employeeId}/documents/edit-document?documentName=${documentName}`);
    }

    return (
        <Card
            key={documentData.name}
            className="w-full max-w-[200px] mx-auto select-text cursor-pointer dark:border-[1.5px] flex flex-col overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.02]"
        >
            <div
                className="flex items-center justify-center bg-muted/30 hover:bg-muted/50 h-48 w-full"
            >
                <Avatar className="h-full w-full rounded-md">
                    <>
                        <AvatarImage src={documentData.url} alt={documentData.name} className="h-full w-full object-cover" />
                        <AvatarFallback className="h-full w-full rounded-md bg-secondary/70 flex items-center justify-center capitalize text-sm font-medium">
                            {replaceUnderscore(documentData.name)}
                        </AvatarFallback>
                    </>
                </Avatar>
            </div>

            <div className="px-4 py-3 flex justify-between items-center border-t">
                {/* Card Title */}
                <CardTitle
                    className="text-sm tracking-wide hover:text-primary capitalize truncate"
                    onClick={() => window.open(documentData.url, '_blank')}
                >
                    {replaceUnderscore(documentData.name)}
                </CardTitle>

                {/* Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded-full hover:bg-secondary grid place-items-center">
                        <Icon name="dots-vertical" size="xs" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={8} align="end">
                        <DropdownMenuItem
                            onClick={() => documentData.url && handleDownload(documentData.url, `${documentData.name}_${employeeId}.pdf`)}
                            className={cn(
                                "hidden",
                                hasPermission(role, `${updateRole}:${attribute.employeeDocuments}`) &&
                                "flex",
                            )}
                        >
                            Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleEdit(documentData.name)}
                            className={cn(
                                "hidden",
                                hasPermission(role, `${updateRole}:${attribute.employeeDocuments}`) &&
                                "flex",
                            )}
                        >
                            Edit document
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteEmployeeDocument employeeId={employeeId as string} documentName={documentData.name} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}