import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function AIChat4o({
  messages,
  temperature,
}: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  temperature?: number | null | undefined;
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: messages,
    temperature: temperature ?? 0.1,
  });

  return completion;
}
