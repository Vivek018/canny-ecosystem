import { useAssistantStore } from "@/store/assistant";
import { Button } from "@canny_ecosystem/ui/button";

export function AssistantButton() {
  const { setOpen } = useAssistantStore();

  return (
    <Button
      variant="ghost"
      className="relative min-w-[265px] w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 p-0 hover:bg-transparent font-normal no-drag"
      onClick={() => setOpen()}
    >
      <span className="ml-4 md:ml-0">Ask Canny A Question...</span>
      <kbd className="pointer-events-none ml-16 h-5 select-none flex justify-center items-center border bg-accent pt-[1.5px] px-1.5 font-mono text-[12px] font-medium opacity-100 sm:flex -mt-1.5">
        ⌘
      </kbd>
      <kbd className="pointer-events-none ml-0.5 h-5 select-none flex justify-center items-center border bg-accent px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex -mt-1.5">
        k
      </kbd>
    </Button>
  );
}
