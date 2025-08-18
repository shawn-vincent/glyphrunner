/**
 * OpenRouter configuration utilities for LangChain integration
 */

/**
 * Configure environment variables for OpenRouter integration with LangChain
 * 
 * This function sets up the necessary environment variables to enable
 * OpenRouter models to work with LangChain's initChatModel() function.
 * 
 * When using models with the "openrouter/" prefix, this configuration
 * ensures they route through OpenRouter's API.
 */
export function configureOpenRouterEnvironment() {
  // Only configure if OPENROUTER_API_KEY is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.info("🔍 OpenRouter API key not found, skipping OpenRouter configuration");
    return;
  }

  console.info("🔧 Configuring OpenRouter environment...");

  // For models using "openrouter/" prefix, we need to configure
  // the OpenAI client to use OpenRouter's endpoint
  if (!process.env.OPENAI_BASE_URL) {
    // Set OpenRouter as the base URL for OpenAI client when using OpenRouter models
    process.env.OPENAI_BASE_URL = "https://openrouter.ai/api/v1";
    console.info("📡 Set OPENAI_BASE_URL to:", process.env.OPENAI_BASE_URL);
  }

  // Set the API key for OpenRouter
  if (!process.env.OPENAI_API_KEY && process.env.OPENROUTER_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;
    console.info("🔑 Set OPENAI_API_KEY from OPENROUTER_API_KEY");
  }
}

/**
 * Check if a model string refers to an OpenRouter model
 */
export function isOpenRouterModel(model: string): boolean {
  return model.startsWith("openrouter/");
}

/**
 * Transform model name for OpenRouter usage
 * 
 * OpenRouter uses model names in the format "provider/model" 
 * but without the "openrouter/" prefix in the actual API call
 */
export function transformOpenRouterModelName(model: string): string {
  if (model.startsWith("openrouter/")) {
    return model.substring("openrouter/".length);
  }
  return model;
}

/**
 * Get OpenRouter headers for API requests
 */
export function getOpenRouterHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Optional: Add site URL for rankings on openrouter.ai
  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }
  
  // Optional: Add site name for rankings on openrouter.ai
  if (process.env.OPENROUTER_SITE_NAME) {
    headers["X-Title"] = process.env.OPENROUTER_SITE_NAME;
  }
  
  return headers;
}

/**
 * Default model configuration - centralized to maintain DRY principle
 */
export const DEFAULT_MODEL = "openrouter/qwen/qwen3-coder:free";

/**
 * Popular OpenRouter model configurations
 */
export const OPENROUTER_MODELS = {
  // Free models
  [DEFAULT_MODEL]: "qwen/qwen3-coder:free", // Free model with reliable tool support (default)
  
  // Anthropic models via OpenRouter
  "openrouter/anthropic/claude-3-7-sonnet": "anthropic/claude-3-7-sonnet",
  "openrouter/anthropic/claude-3-5-sonnet": "anthropic/claude-3-5-sonnet",
  "openrouter/anthropic/claude-3-haiku": "anthropic/claude-3-haiku",
  "openrouter/anthropic/claude-3-opus": "anthropic/claude-3-opus",
  
  // OpenAI models via OpenRouter
  "openrouter/openai/gpt-4o": "openai/gpt-4o",
  "openrouter/openai/gpt-4o-mini": "openai/gpt-4o-mini",
  "openrouter/openai/gpt-4-turbo": "openai/gpt-4-turbo",
  "openrouter/openai/gpt-3.5-turbo": "openai/gpt-3.5-turbo",
  
  // Google Gemini models via OpenRouter
  "openrouter/google/gemini-pro": "google/gemini-pro",
  "openrouter/google/gemini-flash-1.5": "google/gemini-flash-1.5",
  "openrouter/google/gemini-flash-1.5-8b": "google/gemini-flash-1.5-8b",
  
  // Native Google Gemini models (using GEMINI_API_KEY)
  "google/gemini-2.5-flash": "gemini-2.5-flash", // Best price-performance, well-rounded capabilities (recommended)
  "google/gemini-2.5-pro": "gemini-2.5-pro", // Most powerful but very limited free tier (5 RPM, 25/day)
  "google/gemini-2.0-flash-exp": "gemini-2.0-flash-exp",
  "google/gemini-1.5-pro": "gemini-1.5-pro",
  "google/gemini-1.5-flash": "gemini-1.5-flash",
  
  // Other popular models via OpenRouter
  "openrouter/meta-llama/llama-3.2-90b-instruct": "meta-llama/llama-3.2-90b-instruct",
  "openrouter/mistralai/mistral-7b-instruct": "mistralai/mistral-7b-instruct",
} as const;