// import { getUser } from "@midday/supabase/cached-queries";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { SignOut } from "./sign-out";
import type { Database } from "@canny_ecosystem/supabase/types";

export function UserMenu({
  onlySignOut = false,
  userData,
  Link,
}: {
  onlySignOut?: boolean;
  userData: Database["public"]["Tables"]["user"]["Row"];
  Link: React.ElementType;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus:dark:brightness-150 hover:dark:brightness-150 focus:brightness-90 hover:brightness-90">
        <Avatar className="rounded-full w-[44px] h-[44px] cursor-pointer">
          {userData?.avatar && (
            <img
              src={userData?.avatar}
              alt={userData?.first_name + userData?.last_name}
              width={32}
              height={32}
            />
          )}
          <AvatarFallback>
            <span className="text-xs">
              {userData?.first_name?.charAt(0)?.toUpperCase()}
            </span>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" sideOffset={10} align="end">
        {!onlySignOut && (
          <>
            <DropdownMenuLabel>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="truncate">
                    {`${userData.first_name} ${userData.last_name}`}
                  </span>
                  <span className="truncate text-xs text-[#606060] font-normal">
                    {userData.email}
                  </span>
                </div>
                <div className="border py-0.5 px-3 rounded-full text-[11px] font-normal">
                  Beta
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link prefetch="render" to="/account">
                <DropdownMenuItem>
                  Account
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
              </Link>

              <Link prefetch="render" to="/account/support">
                <DropdownMenuItem>Support</DropdownMenuItem>
              </Link>

              <Link prefetch="render" to="/account/teams">
                <DropdownMenuItem>
                  Teams
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <SignOut />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
