// Define the configurable parameters for the agent

import { Annotation, LangGraphRunnableConfig } from "@langchain/langgraph";
import { SYSTEM_PROMPT } from "./prompts.js";
import { DEFAULT_MODEL } from "../shared/openrouter-config.js";

export const ConfigurationAnnotation = Annotation.Root({
  userId: Annotation<string>(),
  model: Annotation<string>(),
  systemPrompt: Annotation<string>(),
});

export type Configuration = typeof ConfigurationAnnotation.State;

export function ensureConfiguration(config?: LangGraphRunnableConfig) {
  const configurable = config?.configurable || {};
  return {
    userId: configurable?.userId || "default",
    model: configurable?.model || DEFAULT_MODEL, // Free model with reliable tool support via OpenRouter
    systemPrompt: configurable?.systemPrompt || SYSTEM_PROMPT,
  };
}
