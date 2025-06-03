import {
  type AgentNamespace,

  routeAgentRequest,
} from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  createDataStreamResponse,
  streamText,
  type StreamTextOnFinishCallback,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { processToolCalls } from "./utils";
import { tools, executions } from "./tools";
import { AsyncLocalStorage } from "node:async_hooks";

export type Env = {
  HYPERDRIVE: any;
  OPENAI_API_KEY: string;
  Chat: AgentNamespace<Chat>;
};

export const agentContext = new AsyncLocalStorage<Chat>();
export class Chat extends AIChatAgent<Env> {
  getEnv() {
    return process.env;
  }
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    return agentContext.run(this, async () => {
      const dataStreamResponse = createDataStreamResponse({
        execute: async (dataStream) => {
          const processedMessages = await processToolCalls({
            messages: this.messages,
            dataStream,
            tools,
            executions,
          });

          const openai = createOpenAI({
            apiKey: process.env.OPENAI_KEY,
          });

          const result = streamText({
            model: openai("gpt-4o-2024-11-20"),
            system: "You are a helpful assistant",
            messages: processedMessages,
            tools,
            onFinish,
            maxSteps: 10,
          });

          result.mergeIntoDataStream(dataStream);
        },
      });

      return dataStreamResponse;
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: any) {
    if (!env.OPENAI_API_KEY) {
      console.error(
        "OPENAI_API_KEY is not set, don't forget to set it locally in .dev.vars, and use `wrangler secret bulk .dev.vars` to upload it to production"
      );
      return new Response("OPENAI_API_KEY is not set", { status: 500 });
    }
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
}