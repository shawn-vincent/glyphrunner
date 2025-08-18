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
  console.info("🤖 Loading chat model:", fullySpecifiedName);
  
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
    } 
    // Handle Google models specially
    else if (provider === "google") {
      // For Google models, use the google-genai provider
      console.info("🟢 Google Gemini routing - using model:", model, "with provider: google-genai");
      return await initChatModel(model, { modelProvider: "google-genai" });
    } 
    else {
      console.info("🎯 Direct provider routing - using model:", model, "with provider:", provider);
      return await initChatModel(model, { modelProvider: provider });
    }
  }
}
