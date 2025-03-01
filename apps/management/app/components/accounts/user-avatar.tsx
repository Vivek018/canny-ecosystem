import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import {Avatar,AvatarFallback,AvatarImage} from "@canny_ecosystem/ui/avatar";
import {Card,CardDescription,CardFooter,CardHeader,CardTitle} from "@canny_ecosystem/ui/card";
import { useRef } from "react";

export const UserAvatar = ({
  avatar,
  first_name,
}: {
  first_name: string;
  avatar?: string | undefined;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    clearExactCacheEntry(cacheKeyPrefix.account);
    console.log(evt.target.files);
  };
  return (
    <div>
      <Card>
        <div className="flex justify-between items-center pr-6">
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>
              This is your Avatar. Click on the avatar to upload a custom one
              from your files.
            </CardDescription>
          </CardHeader>

          <Avatar
            className="rounded-md w-16 h-16 flex items-center justify-center bg-accent cursor-pointer"
            onClick={() => inputRef?.current?.click()}
          >
            <>
              <AvatarImage src={avatar ?? ""} />
              <AvatarFallback className="rounded-md">
                <span className="text-md uppercase">
                  {first_name.charAt(0)}
                </span>
              </AvatarFallback>
            </>
            <input
              ref={inputRef}
              type="file"
              name="avatar"
              style={{ display: "none" }}
              multiple={false}
              onChange={handleUpload}
            />
          </Avatar>
        </div>
        <CardFooter className="border-t pt-6">
          Uploading it is optional but strongly recommended.
        </CardFooter>
      </Card>
    </div>
  );
};
