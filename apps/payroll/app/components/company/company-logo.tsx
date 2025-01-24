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
import { useRef } from "react";

export const CompanyLogo = ({
  name,
  logo,
}: { name: string; logo?: string | undefined }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.files);
  };

  return (
    <Card>
      <div className="flex justify-between items-center pr-6">
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
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
      <CardFooter className="border-t pt-6">
        Uploading it is optional but strongly recommended.
      </CardFooter>
    </Card>
  );
};
