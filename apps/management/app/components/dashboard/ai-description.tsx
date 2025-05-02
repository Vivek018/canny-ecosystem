import {
  Card,
  CardContent,
} from "@canny_ecosystem/ui/card";
import { Button } from "@canny_ecosystem/ui/button";

export function AiDescription() {
  return (
    <Card className="flex flex-col bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]">
      <CardContent className="h-full flex justify-center items-center">
        <Button>Click to generate AI Summary</Button>
      </CardContent>
    </Card>
  );
}
