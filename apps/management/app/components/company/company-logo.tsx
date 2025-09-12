import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { toast } from "@canny_ecosystem/ui/use-toast";
import { zImage } from "@canny_ecosystem/utils";
import { useSubmit } from "@remix-run/react";
import { useRef } from "react";

export const CompanyLogo = ({
  name,
  logo,
}: {
  name: string;
  logo?: string | undefined;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useSubmit();

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt?.target?.files?.[0];

    if (!file) {
      toast({
        title: "Error",
        description: "File not uploaded, please try again!",
        variant: "destructive",
      });
      return;
    }
    const validationResult = zImage.safeParse(file);
    if (!validationResult.success) {
      toast({
        title: "Error",
        description: validationResult.error.errors
          .map((err) => err.message)
          .join("\n"),
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("returnTo", "/settings/general");
    submit(formData, {
      method: "post",
      action: "/upload-logo",
      encType: "multipart/form-data",
    });
    clearExactCacheEntry(cacheKeyPrefix.general);
  };

  return (
    <Card>
      <div className="flex justify-between items-center pr-6">
        <CardHeader className="max-sm:text-sm">
          <CardTitle>Company Logo</CardTitle>
          <CardDescription className="max-sm:text-xs">
            This is your company's logo. Click on the avatar to upload a custom
            one from your files.
          </CardDescription>
        </CardHeader>

        <Avatar
          className="rounded-md w-16 h-16 flex items-center justify-center bg-accent cursor-pointer"
          onClick={() => inputRef?.current?.click()}
        >
          <>
            <AvatarImage src={logo} />
            <AvatarFallback className="rounded-md">
              <span className="text-md">{name?.charAt(0)}</span>
            </AvatarFallback>
          </>

          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            multiple={false}
            onChange={handleUpload}
          />
        </Avatar>
      </div>
      <CardFooter className="border-t pt-6 max-sm:text-sm">
        Uploading it is optional but strongly recommended.
      </CardFooter>
    </Card>
  );
};
