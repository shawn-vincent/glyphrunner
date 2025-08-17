import { initChatModel } from "langchain/chat_models/universal";
import { configureOpenRouterEnvironment } from "../shared/openrouter-config.js";

/**
 * Load a chat model from a fully specified name.
 * @param fullySpecifiedName - String in the format 'provider/model' or 'provider/account/provider/model'.
 * @returns A Promise that resolves to a BaseChatModel instance.
 */
export async function loadChatModel(
  fullySpecifiedName: string,
): Promise<ReturnType<typeof initChatModel>> {
  // Configure OpenRouter environment if needed
  configureOpenRouterEnvironment();
  
  const index = fullySpecifiedName.indexOf("/");
  if (index === -1) {
    // If there's no "/", assume it's just the model
    return await initChatModel(fullySpecifiedName);
  } else {
    const provider = fullySpecifiedName.slice(0, index);
    const model = fullySpecifiedName.slice(index + 1);
    
    // Handle OpenRouter models specially
    if (provider === "openrouter") {
      // For OpenRouter models, we need to use "openai" as the provider
      // since OpenRouter provides an OpenAI-compatible API
      return await initChatModel(model, { modelProvider: "openai" });
    } else {
      return await initChatModel(model, { modelProvider: provider });
    }
  }
}
