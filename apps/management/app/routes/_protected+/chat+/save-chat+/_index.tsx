import { useOutletContext } from "@remix-run/react"

export default function ChatIdIndex() {
  const { dataLength } = useOutletContext<{ dataLength: number }>();
  return (
    <div className="w-full h-full flex items-center justify-center"><p className="text-xl text-muted-foreground tracking-wide mb-20">{dataLength ? 'Select any prompt for table and chart to be shown here.' : 'Saved Chats will be shown here.'}</p></div>
  )
}
