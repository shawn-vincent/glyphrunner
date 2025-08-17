/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

/**
 * Get available tools based on environment configuration
 * Only includes tools for which API keys are available
 */
function getAvailableTools() {
  const tools = [];

  // Only add Tavily search if API key is available
  if (process.env.TAVILY_API_KEY) {
    console.info("🔍 Adding Tavily search tool");
    const searchTavily = new TavilySearchResults({
      maxResults: 3,
    });
    tools.push(searchTavily);
  } else {
    console.error("⚠️  TAVILY_API_KEY not found - Tavily search tool disabled");
  }

  return tools;
}

/**
 * Export an array of all available tools
 * Add new tools to this array to make them available to the agent
 *
 * Note: You can create custom tools by implementing the Tool interface from @langchain/core/tools
 * and add them to this array.
 * See https://js.langchain.com/docs/how_to/custom_tools/#tool-function for more information.
 */
export const TOOLS = getAvailableTools();
