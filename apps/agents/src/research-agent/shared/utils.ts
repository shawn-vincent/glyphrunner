import { Document } from "@langchain/core/documents";

import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { initChatModel } from "langchain/chat_models/universal";
import { configureOpenRouterEnvironment } from "../../shared/openrouter-config.js";

export function formatDoc(doc: Document): string {
  const metadata = doc.metadata || {};
  const meta = Object.entries(metadata)
    .map(([k, v]) => ` ${k}=${v}`)
    .join("");
  const metaStr = meta ? ` ${meta}` : "";

  return `<document${metaStr}>\n${doc.pageContent}\n</document>`;
}

export function formatDocs(docs?: Document[]): string {
  /**Format a list of documents as XML. */
  if (!docs || docs.length === 0) {
    return "<documents></documents>";
  }
  const formatted = docs.map(formatDoc).join("\n");
  return `<documents>\n${formatted}\n</documents>`;
}

/**
 * Load a chat model from a fully specified name.
 * @param fullySpecifiedName - String in the format 'provider/model' or 'provider/account/provider/model'.
 * @returns A Promise that resolves to a BaseChatModel instance.
 */
export async function loadChatModel(
  fullySpecifiedName: string,
): Promise<BaseChatModel> {
  console.info("🤖 Research agent loading chat model:", fullySpecifiedName);
  
  // Configure OpenRouter environment if needed
  configureOpenRouterEnvironment();
  
  const index = fullySpecifiedName.indexOf("/");
  if (index === -1) {
    // If there's no "/", assume it's just the model
    console.info("📦 Using model without provider:", fullySpecifiedName);
    return await initChatModel(fullySpecifiedName);
  } else {
    const provider = fullySpecifiedName.slice(0, index);
    const model = fullySpecifiedName.slice(index + 1);
    
    console.info("🏭 Detected provider:", provider, "model:", model);
    
    // Handle OpenRouter models specially
    if (provider === "openrouter") {
      // For OpenRouter models, we need to use "openai" as the provider
      // since OpenRouter provides an OpenAI-compatible API
      // The model should be the part after "openrouter/" (e.g., "provider/model-name")
      console.info("🔀 OpenRouter routing - using model:", model, "with provider: openai");
      return await initChatModel(model, { modelProvider: "openai" });
    } else {
      console.info("🎯 Direct provider routing - using model:", model, "with provider:", provider);
      return await initChatModel(model, { modelProvider: provider });
    }
  }
}
