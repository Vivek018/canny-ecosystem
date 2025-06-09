
import { z } from "zod";
import { tool } from "ai";
import { Client } from "pg";
import { agentContext } from "./server";

const queryDatabase = tool({
  description: "queries the database with sql and returns the result",
  parameters: z.object({ sql_query: z.string() }),
  execute: async ({ sql_query }) => {
    const agent = agentContext.getStore();
    if (!agent) throw new Error("No agent found");

    console.log(`running query: ${sql_query}`);
    try {
      const env = agent.getEnv();
      if (!env.HYPERDRIVE) {
        throw new Error("HYPERDRIVE is undefined");
      }
      let hyperdriveConfig: any;
      try {
        hyperdriveConfig = JSON.parse(env.HYPERDRIVE);
      } catch {
        throw new Error("Failed to parse HYPERDRIVE as JSON");
      }
      if (!hyperdriveConfig.connectionString) {
        throw new Error("connectionString is undefined in HYPERDRIVE");
      }
      const connectionString = hyperdriveConfig.connectionString;
      const client = new Client({ connectionString });
      await client.connect();

      const result = await client.query(sql_query);
      await client.end();
      return JSON.stringify(result);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
});

export const tools = {
  // confirmBeforeQueryingDatabase,
  queryDatabase,
};

export const executions = {
  // confirmBeforeQueryingDatabase: async ({ sql_query }) => {
  //   //setup query logic
  // },
};