/**
 * This file defines the tools available to the ReAct agent.
 * Tools are functions that the agent can use to interact with external systems or perform specific tasks.
 */
import { TavilySearch } from "@langchain/tavily";

/**
 * Wrapper class to add detailed logging to TavilySearch tool
 */
class LoggingTavilySearch extends TavilySearch {
  
  private formatSearchResults(result: any): string {
    const { query, results, answer } = result;
    let formatted = `Search Query: ${query}\n\n`;
    
    if (answer) {
      formatted += `Answer: ${answer}\n\n`;
    }
    
    if (results && results.length > 0) {
      formatted += "Search Results:\n";
      results.forEach((item: any, index: number) => {
        formatted += `${index + 1}. ${item.title || "No title"}\n`;
        formatted += `   URL: ${item.url}\n`;
        if (item.content) {
          formatted += `   Content: ${item.content.substring(0, 200)}${item.content.length > 200 ? "..." : ""}\n`;
        }
        formatted += "\n";
      });
    }
    
    return formatted;
  }
  
  async invoke(input: any): Promise<string> {
    console.log("🔍 TavilySearch.invoke received input:");
    console.log("  Type:", typeof input);
    console.log("  Value:", JSON.stringify(input, null, 2));
    console.log("  Schema expected:", JSON.stringify(this.schema, null, 2));
    
    try {
      const result = await super.invoke(input);
      console.log("✅ TavilySearch.invoke successful result:");
      console.log("  Type:", typeof result);
      console.log("  Raw result:", JSON.stringify(result, null, 2).substring(0, 300) + "...");
      
      // Convert object result to string for LangGraph compatibility
      if (typeof result === 'object') {
        const formattedResult = this.formatSearchResults(result);
        console.log("  Converted to string, length:", formattedResult.length);
        console.log("  Preview:", formattedResult.substring(0, 200) + "...");
        return formattedResult;
      } else {
        console.log("  Already string, length:", (result as string).length);
        console.log("  Preview:", (result as string).substring(0, 200) + "...");
        return result as string;
      }
    } catch (error) {
      console.error("❌ TavilySearch.invoke failed:");
      console.error("  Error:", error);
      console.error("  Error message:", error instanceof Error ? error.message : String(error));
      console.error("  Error stack:", error instanceof Error ? error.stack : "No stack");
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
    console.info("🔍 Adding Tavily search tool");
    const searchTavily = new LoggingTavilySearch({
      maxResults: 3,
      name: "web_search",
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
