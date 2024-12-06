import { columns } from "@/components/sites/table/columns";
import { DataTable } from "@/components/sites/table/data-table";
import type { PaymentTemplateAssignmentsType } from "@canny_ecosystem/supabase/queries";
import { Input } from "@canny_ecosystem/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSearchParams } from "@remix-run/react";

export function SiteLinkedTemplates({ linkedTemplates }: { linkedTemplates: PaymentTemplateAssignmentsType[] | null }) {
    const [searchString, setSearchString] = useState("");
    const [tableData, setTableData] = useState(linkedTemplates);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const filteredData = linkedTemplates?.filter((item: PaymentTemplateAssignmentsType) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(searchString.toLowerCase()),
            ),
        );
        setTableData(filteredData as any);
    }, [searchString, linkedTemplates]);

    const linkNewTemplate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        searchParams.set("action", "create");
        setSearchParams(searchParams);
    }

    return (
        <section className="py-4 px-4">
            <div className="w-full flex items-center justify-between pb-4">
                <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Icon
                                name="magnifying-glass"
                                size="sm"
                                className="text-gray-400"
                            />
                        </div>
                        <Input
                            placeholder="Search linked templates"
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                            className="pl-8 h-10 w-full focus-visible:ring-0"
                        />
                    </div>
                    <Button
                        className={cn(buttonVariants({ variant: "primary-outline" }), "flex items-center gap-1")}
                        onClick={(e) => linkNewTemplate(e)}
                    >
                        Link new template
                    </Button>
                </div>
            </div>
            <DataTable data={tableData ?? []} columns={columns()} />
        </section >
    );
}