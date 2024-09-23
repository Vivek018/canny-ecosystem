import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Loader } from "@canny_ecosystem/ui/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@canny_ecosystem/ui/popover";
import { Textarea } from "@canny_ecosystem/ui/textarea";

import { useState } from "react";

export function FeedbackForm() {
  const [value, setValue] = useState("");
  const [key, setKey] = useState("initial-key");

  const action = { status: "idle" };
  return (
    <Popover key={key}>
      <PopoverTrigger asChild className="md:flex-inline">
        <Button
          variant="ghost"
          className="rounded-full px-2.5 border border-input font-normal h-10 text-xs"
        >
          <Icon name="feedback" size="md" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px]" sideOffset={10} align="end">
        {action.status === "hasSucceeded" ? (
          <div className="flex items-center justify-center flex-col space-y-1 mt-10 text-center">
            <p className="font-medium text-sm">Thank you for your feedback!</p>
            <p className="text-sm text-[#4C4C4C]">
              We will be back with you as soon as possible
            </p>
          </div>
        ) : (
          <form>
            <Textarea
              name="feedback"
              value={value}
              required
              autoFocus
              placeholder="Ideas to improve this website or issues you are experiencing."
              className="resize-none h-[120px]"
              onChange={(evt: any) => setValue(evt.target.value)}
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setKey("cancel-key");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                // onClick={() => action.execute({ feedback: value })}
                disabled={value.length === 0 || action.status === "executing"}
              >
                {action.status === "executing" ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
