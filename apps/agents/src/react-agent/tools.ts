/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { TavilySearch } from "@langchain/tavily";

/**
 * Wrapper class to add detailed logging to TavilySearch tool  
 * Uses the latest LangGraph patterns for optimal compatibility
 */
class LoggingTavilySearch extends TavilySearch {
  
  async invoke(input: any): Promise<string> {
    console.log("🔍 TavilySearch.invoke received input:");
    console.log("  Type:", typeof input);
    console.log("  Value:", JSON.stringify(input, null, 2));
    
    try {
      const result = await super.invoke(input);
      console.log("✅ TavilySearch.invoke successful result:");
      console.log("  Type:", typeof result);
      console.log("  Length:", typeof result === 'string' ? result.length : 'N/A');
      console.log("  Preview:", typeof result === 'string' ? result.substring(0, 200) + "..." : JSON.stringify(result).substring(0, 200) + "...");
      
      return result;
    } catch (error) {
      console.error("❌ TavilySearch.invoke failed:");
      console.error("  Error:", error);
      console.error("  Error message:", error instanceof Error ? error.message : String(error));
      console.error("  Input that caused error:", JSON.stringify(input, null, 2));
      throw error;
    }
  }
}

/**
 * Get available tools based on environment configuration
 * Only includes tools for which API keys are available
 */
function getAvailableTools() {
  const tools = [];

  // Only add Tavily search if API key is available
  if (process.env.TAVILY_API_KEY) {
    console.info("🔍 Adding Tavily search tool (TavilySearch)");
    const searchTavily = new LoggingTavilySearch({
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
