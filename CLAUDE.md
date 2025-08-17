# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GlyphRunner.ai** - *"Run the glyphs, free the signal"*

A cyber-dharma odyssey where autonomous intent dances through hidden symbols. GlyphRunner deciphers symbols (API hieroglyphs, log sigils, user prompts) and moves with mindful precision through the data landscape.

### Core Philosophy
1. **Awaken the Stack** – every call, every token is karma; act with lucid intent
2. **Flow, Don't Flail** – plans form like trees, but the river of context bends them; surrender and respond  
3. **Leave No Trace** – travel light; shed state like worn robes
4. **Illuminate** – surface insight, not noise; your agent should feel like inner vision, not spam

## Architecture

GlyphRunner is a **monorepo with dual architecture**:

### Backend: LangGraph Agents (`apps/agents/`)
- **Framework**: LangGraph.js with TypeScript
- **Agent Types**: 
  - `memory-agent` - ReAct agent with memory persistence
  - `react-agent` - Basic ReAct agent with tools
  - `research-agent` - Document indexing and retrieval
  - `retrieval-agent` - Vector search and retrieval
- **Configuration**: Defined in `langgraph.json` with 5 different graph endpoints
- **State Management**: Each agent uses LangGraph's state management with typed annotations
- **Tools**: Agents can use external APIs (Tavily search, etc.) and custom tool implementations
- **Model Support**: Native support for Anthropic, OpenAI, and OpenRouter (100+ models)

### Frontend: React Web App (`apps/web/`)
- **Framework**: React 19 + Vite + TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **Threading**: LangGraph SDK integration for real-time agent conversations
- **Styling**: Custom cyber-dharma theme (black/white/cyan palette)

### Key Integration Points
- **LangGraph SDK**: Frontend communicates with agent graphs via `@langchain/langgraph-sdk`
- **Real-time Streaming**: Agent responses stream to the web interface
- **Thread Management**: Persistent conversation threads with state management
- **Memory Integration**: Agents can store and retrieve user-specific memories across sessions

## Development Commands

### Root Level
```bash
npm install              # Install all dependencies
npm run dev             # Start both web (port 5173) and agents (port 2024)
npm run build           # Build all apps
npm run lint            # Lint all apps
npm run lint:fix        # Fix linting issues
npm run format          # Format all code
```

### Web App (`apps/web/`)
```bash
npm run dev             # Start Vite dev server (port 5173)
npm run build           # Build for production
npm run lint            # ESLint check
npm run preview         # Preview production build
```

### Agents (`apps/agents/`)
```bash
npm run dev             # Start LangGraph server (port 2024)
npm run build           # Compile TypeScript
npm run clean           # Remove dist and turbo cache
npm run lint            # ESLint check
npm run lint:fix        # Fix linting issues
```

## Environment Setup

Create `.env` file with required API keys:
```bash
# Required for agents
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key  
TAVILY_API_KEY=your-tavily-key

# OpenRouter support (provides access to 100+ models)
OPENROUTER_API_KEY=your-openrouter-key

# Optional for specific agents
PINECONE_API_KEY=your-pinecone-key
MONGODB_URI=your-mongodb-uri
```

## Agent Configuration

Agents are configured via `langgraph.json` and support model switching:
- Default model: `openrouter/openai/gpt-oss-20b:free` (free model with tool support via OpenRouter)
- Configurable via LangGraph Studio or runtime configuration
- Each agent has specific prompts and tool configurations in their respective directories

### Supported Model Providers

**Direct Providers:**
- `anthropic/claude-3-7-sonnet-latest` - Anthropic models
- `openai/gpt-4o` - OpenAI models

**OpenRouter (100+ models):**
- `openrouter/openai/gpt-oss-20b:free` - Free model with tool support (default)
- `openrouter/anthropic/claude-3-7-sonnet` - Anthropic via OpenRouter
- `openrouter/openai/gpt-4o` - OpenAI via OpenRouter  
- `openrouter/meta-llama/llama-3.2-90b-instruct` - Meta Llama models
- `openrouter/google/gemini-pro` - Google models
- `openrouter/mistralai/mistral-7b-instruct` - Mistral models

OpenRouter provides unified access to models from multiple providers with competitive pricing and reliability.

## Development Workflow

1. **Start Development**: `npm run dev` (starts both frontend and backend)
2. **LangGraph Studio**: Open the project in LangGraph Studio for visual agent development
3. **Agent Testing**: Use Studio's interface to test individual agent graphs
4. **Frontend Development**: React app auto-reloads at `localhost:5173`
5. **Agent Development**: LangGraph server runs at `localhost:2024`

## Code Architecture Patterns

### Agent Structure
Each agent follows this pattern:
```
src/[agent-name]/
├── graph.ts           # Main LangGraph definition
├── state.ts           # State type annotations  
├── configuration.ts   # Configuration schema
├── prompts.ts         # System prompts
├── tools.ts           # Custom tools
├── utils.ts           # Helper functions
└── tests/             # Unit and integration tests
```

### Frontend Structure
- **Components**: Modular React components in `src/components/`
- **Thread Management**: Specialized components for LangGraph conversation handling
- **Providers**: Context providers for SDK client and thread state
- **Hooks**: Custom hooks for media queries and state management

## Available External Tools

### ChatGPT (via Codex CLI)
- **Command**: `codex exec "prompt"` - AI code generation and assistance using GPT-5
- **Model**: GPT-5 with advanced reasoning capabilities
- **Context Size**: 400,000 tokens total (272k input + 128k output)
- **Best for**: 
  - Multi-step reasoning and problem solving
  - Advanced code generation and refactoring
  - Mathematical problem solving (94.6% on AIME 2025)
  - Real-world coding tasks (74.9% on SWE-bench Verified)
  - Multimodal understanding and visual reasoning
  - Complex debugging with step-by-step analysis
- **Key Features**:
  - 80% less likely to hallucinate than previous models
  - Deliberate multi-step thinking process
  - Built-in chain-of-thought reasoning
  - State-of-the-art performance across coding benchmarks
- **Usage Examples**:
  - `codex exec "write a React hook for managing form state with validation"`
  - `codex exec "refactor this component to use TypeScript and add error handling"`
  - `codex exec "explain this algorithm step-by-step and suggest optimizations"`
- **Alias**: Consider `alias cx="codex exec"` for quicker access