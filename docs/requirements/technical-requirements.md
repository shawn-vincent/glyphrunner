# GlyphRunner – System Specification v1.0

---

## 1. Architecture Overview

```mermaid
graph TD
  subgraph Browser (SPA)
    UI[assistant-ui<br/>shadcn components]
    Proxy[/api/chat proxy/]
  end
  subgraph Edge (Cloudflare Worker)
    Worker[Chat Worker<br/>LangGraph Executor]
    Qdrant[(Qdrant Cloud<br/>1 GB cluster)]
  end
  UI -->|SSE| Proxy -->|POST /chat| Worker
  Worker -->|HTTP| OpenAI[(LLM APIs)]
  Worker -->|REST| Qdrant
```

*Pattern:* **Hexagonal** – clear APP (domain) vs. ADAPTER (infra) boundaries.
*Flows:* Command → Domain (LangGraph) → Port to external tools/vector → Stream to client.

---

## 2. Folder & Package Structure

```text
glyphrunner/
├─ apps/
│  ├─ worker/          # Cloudflare Worker
│  └─ spa/             # Vite + React
├─ packages/
│  ├─ core/            # pure domain: messages, graph builders
│  ├─ adapters/        # infra: qdrant, openai, tool calls
│  └─ shared-types/    # strict DTOs used everywhere
├─ .github/            # CI workflows
└─ pnpm-workspace.yaml
```

Scripts (`package.json` root):

```jsonc
{
  "dev": "concurrently \"pnpm --filter worker dev\" \"pnpm --filter spa dev\"",
  "build": "pnpm -r build",
  "lint": "eslint . --ext .ts,.tsx",
  "test": "vitest run"
}
```

---

## 3. Key Interfaces & Types

```ts
// packages/shared-types/src/chat.ts
export type Role = "user" | "assistant" | "tool";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface ToolInvocation {
  name: string;
  args: Record<string, unknown>;
}

export type StreamChunk =
  | { type: "token"; value: string }
  | { type: "tool-call"; tool: ToolInvocation }
  | { type: "end" };

// LangGraph tickets
export interface Checkpoint {
  id: string;
  graphState: unknown;
  updatedAt: number;
}
```

---

## 4. Edge Worker Design

```ts
// apps/worker/src/handler.ts
import { buildChatGraph } from "@glyphrunner/core";
import { createQdrantStore } from "@glyphrunner/adapters/qdrant";
import { streamSSE } from "@vercel/fetch-eventsource";

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") return new Response("OK");
    const { messages } = await req.json<{
      messages: ChatMessage[];
    }>();

    const graph = buildChatGraph({
      vectorStore: createQdrantStore(env.QDRANT_URL, env.QDRANT_KEY),
      llm: createOpenAI(env.OPENAI_KEY),
    });

    const stream = new ReadableStream({
      async start(ctrl) {
        for await (const chunk of graph.stream({ input: messages })) {
          ctrl.enqueue(`data:${JSON.stringify(chunk)}\n\n`);
        }
        ctrl.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  },
};
```

*Bundle target:* `< 1 MiB compressed` (Wrangler enforces).
*Edge-safe APIs:* `fetch`, `crypto.subtle`, no Node polyfills.

---

## 5. React SPA Layout

```
src/
├─ components/      # shadcn primitives & wrappers
│  └─ Chat.tsx      # <Thread> from assistant-ui
├─ hooks/
│  └─ useServerChat.ts
├─ pages/
│  └─ index.tsx     # single-page chat
└─ theme/
   └─ tailwind.css  # includes accent #00D1FF
```

```tsx
// hooks/useServerChat.ts
import { useChat } from "@assistant-ui/react";

export const useServerChat = () =>
  useChat({ endpoint: "/api/chat", streamMode: "sse" });
```

```tsx
// pages/index.tsx
export default function ChatPage() {
  const chat = useServerChat();
  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <Thread {...chat} accentColor="#00D1FF" />
    </div>
  );
}
```

*Proxy during dev:* Vite `server.proxy` → `https://glyphrunner.workers.dev/chat`.

---

## 6. Tooling & Dev-Ops

| Tooling                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| **Wrangler**           | Build & deploy Worker (`wrangler deploy`).       |
| **Cloudflare Pages**   | Static SPA deploy (`pages publish dist`).        |
| **PNPM workspaces**    | Hoist deps; strict versioning.                   |
| **ESLint + Prettier**  | Airbnb + TypeScript rules.                       |
| **Commitlint + Husky** | Conventional commits & pre-push tests.           |
| **GitHub Actions**     | `test → build → deploy` matrix (push to `main`). |

Secrets: store `OPENAI_KEY`, `QDRANT_KEY` in GitHub → Wrangler secrets.

---

## 7. Testing Strategy

| Layer        | Framework      | Example                                         |
| ------------ | -------------- | ----------------------------------------------- |
| **Domain**   | **Vitest**     | Graph unit tests (tool routing, retries).       |
| **Adapters** | **MSW**        | Mock OpenAI/Qdrant HTTP.                        |
| **Edge**     | **Miniflare**  | Integration: POST `/chat` stream assertions.    |
| **SPA**      | **Playwright** | E2E: type message, expect token stream display. |

*Coverage target:* ≥ 90 % for `packages/core`.

---

## 8. Extensibility Points

1. **Tool Plugins** – implement `Tool` interface in `packages/adapters/tools`, import in `buildChatGraph()`.
2. **Vector Store Swap** – expose `VectorStore` port; add pgvector or Pinecone adapter.
3. **Multi-Tenant** – prefix Qdrant collection & KV keys with `tenantId`; use Cloudflare Access for auth.
4. **Alternate UIs** – keep `/api/chat` contract; any client that speaks SSE will work.

---

## 9. Rationale (high-altitude)

* **Cloudflare Workers** – best free tier, global PoPs; fits tiny codebase requirement.
* **LangGraph** – deterministic, resumable agent flow; easier to test than raw LangChain loops.
* **Qdrant Cloud** – external vector & checkpoint store → avoids Worker KV size limits.
* **Vite + shadcn/ui** – fastest DX, Tailwind-native, widely adopted.
* **assistant-ui** – production-ready chat without reinventing scroll/stream logic.

---

## 10. Risks & Mitigations

| Risk                         | Mitigation                                                               |
| ---------------------------- | ------------------------------------------------------------------------ |
| **< 1 MiB bundle limit**     | Tree-shake; keep `packages/core` pure-TS; avoid huge loaders.            |
| **LLM rate/cost spikes**     | Cloudflare AI Gateway for caching & quotas; retry with lower-cost model. |
| **Edge cold starts**         | Static imports only; no dynamic `require`; Wrangler optimise flag.       |
| **Vendor lock-in**           | Hexagonal ports for vector & LLM; documented swap procedure.             |
| **Abuse / prompt-injection** | System prompts with tool call whitelists; user input sanitisation.       |
| **GDPR / data residency**    | Option to route vector store to EU cluster; encrypt PII before store.    |

---

*End of specification.*
