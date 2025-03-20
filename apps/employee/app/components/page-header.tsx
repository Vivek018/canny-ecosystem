import { clearAllCache } from "@/utils/cache";
import type { CompanyDatabaseRow, UserDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@canny_ecosystem/ui/avatar";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate, useSubmit } from "@remix-run/react";

export function PageHeader({ company, user }: { company: Omit<CompanyDatabaseRow, "created_at" | "updated_at" | "is_active"> | null, user: Pick<UserDatabaseRow, "id" | "email" | "role" | "company_id"> | null }) {
	const navigate = useNavigate();
	const submit = useSubmit();

	const handleLogout = () => {
		clearAllCache();
		submit({}, { method: "post", action: "/logout", replace: true, });
	};

	return (
		<header className="flex justify-between items-center mx-5 mt-4 max-sm:mx-1 md:mt-4">
			<div className="flex items-center gap-4 w-1/3">
				<Button variant="outline" size="icon" className="h-10 w-10" onClick={() => navigate(-1)}>
					<Icon name="chevron-left" className="h-[18px] w-[18px] m-1" />
				</Button>
				<div className="flex gap-4 items-center">
					<Avatar
						className={cn(
							"w-16 h-16 max-sm:w-12 max-sm:h-12 shadow-sm hover:z-40",
						)}
					>
						{company?.logo ? (
							<AvatarImage src={company?.logo} alt={company?.name} />
						) : null}
						<AvatarFallback>
							<span className="md:text-lg tracking-wider uppercase">
								{company?.name?.charAt(0)}
							</span>
						</AvatarFallback>
					</Avatar>
					<h1 className="truncate text-lg font-semibold tracking-wider w-11/12 max-sm:w-4/6">{company?.name}</h1>
				</div>
			</div>
			<Button className={cn("mx-2", !user && "hidden")} variant={"outline"} onClick={handleLogout}>{"Logout"}</Button>
		</header>
	)
}
