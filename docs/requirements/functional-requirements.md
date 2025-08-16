# GlyphRunner Prototype – Functional Requirements Document (FRD)

---

## 1  Purpose & Scope

Deliver a **minimum-viable GlyphRunner** that demonstrates an autonomous LangGraph-powered agent conversing through a web chat UI and invoking a single “Hello-World” tool. The prototype is for internal evaluation and developer onboarding; no production data or authentication is required.

---

## 2  Stakeholders

| Role              | Interest                                                       |
| ----------------- | -------------------------------------------------------------- |
| **Product Owner** | Validate agent loop, ensure UX is coherent.                    |
| **Front-end Dev** | Build SPA chat and integrate streaming.                        |
| **Edge Engineer** | Implement Cloudflare Worker, LangGraph executor, tool adapter. |
| **QA**            | Verify functional flows and edge cases.                        |

---

## 3  Glossary

| Term      | Definition                                                     |
| --------- | -------------------------------------------------------------- |
| **Agent** | LangGraph executor that reasons, plans and produces responses. |
| **Tool**  | A callable function the agent can invoke (HelloWorldTool).     |
| **SSE**   | Server-Sent Events stream delivering incremental chat tokens.  |

---

## 4  Assumptions & Constraints

1. **Edge Runtime**: Cloudflare Workers; < 1 MiB bundle.
2. **Vector Store**: In-memory stub (no Qdrant) for this prototype.
3. **LLM**: OpenAI `gpt-3.5-turbo` (cheapest viable).
4. **No Auth**: Public demo; rate-limiting handled later.
5. **Browser Support**: Latest Chrome, Firefox, Safari.

---

## 5  User Stories & Acceptance Criteria

### 5.1 Chat Conversation

*As a user I can send a message in the web UI and see the agent stream a reply token-by-token.*

\| AC-5.1-1 | Message appears instantly in the local thread (“optimistic echo”). |
\| AC-5.1-2 | SSE stream starts within 2 s (P95) and displays tokens progressively. |
\| AC-5.1-3 | On stream end, cursor stops blinking and input box is re-enabled. |

### 5.2 Hello-World Tool Invocation

*As a user I can type “run hello” and the agent responds using the HelloWorldTool.*

\| AC-5.2-1 | Agent decides to call HelloWorldTool by emitting a `tool-call` chunk. |
\| AC-5.2-2 | Worker executes the tool (returns string “Hello, world! 🌐”). |
\| AC-5.2-3 | Agent streams the final answer containing the tool result. |

### 5.3 Error Handling

*As a user I receive a graceful message if the agent or tool fails.*

\| AC-5.3-1 | Network errors show a toast “Connection lost – retry”. |
\| AC-5.3-2 | Tool errors return “⚠️  Tool failed: <reason>” preceded by apology. |

---

## 6  Functional Requirements

### 6.1 Front-end (SPA)

| ID   | Requirement                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| FE-1 | Render a full-height chat panel using `<Thread>` from assistant-ui.            |
| FE-2 | Use Tailwind accent `#00D1FF`; dark theme by default.                          |
| FE-3 | POST `/api/chat` with JSON `{ messages: ChatMessage[] }`.                      |
| FE-4 | Open SSE connection; append incoming `token` chunks to last assistant message. |
| FE-5 | Render markdown, code fences, and inline emojis.                               |
| FE-6 | Disable send button while stream is active; re-enable on `end`.                |

### 6.2 API Proxy

| ID    | Requirement                                                         |
| ----- | ------------------------------------------------------------------- |
| API-1 | Next/Vite dev proxy rewrites `/api/chat` → `https://<WORKER>/chat`. |
| API-2 | Forward request body verbatim; pipe response stream unchanged.      |

### 6.3 Edge Worker

| ID                                   | Requirement                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| BE-1                                 | Accept POST `/chat` with messages array; reject other methods (405). |
| BE-2                                 | Instantiate LangGraph with:                                          |
|   • Node graph (Think → Plan → Act). |                                                                      |
|   • In-memory history (array).       |                                                                      |
| BE-3                                 | Register **HelloWorldTool**:                                         |

````ts
export const helloWorld = {
  name: "helloWorld",
  description: "Returns a universal greeting.",
  run: async () => "Hello, world! 🌐",
};
``` |
| BE-4 | System prompt instructs agent to use helloWorld when user says “run hello”. |
| BE-5 | Stream chunks as `data:{"type":"token"|"tool-call"|"end", ...}\n\n`. |
| BE-6 | Maximum streaming duration 30 s; abort otherwise and send error chunk. |

### 6.4 Tool Adapter

| ID | Requirement |
|----|-------------|
| TOOL-1 | Expose `HelloWorldTool` via LangChain `DynamicTool`. |
| TOOL-2 | Resolve promise < 50 ms to meet latency budget. |

### 6.5 Logging & Metrics

| ID | Requirement |
|----|-------------|
| LOG-1 | Log each request id, prompt tokens, completion tokens (console.log). |
| LOG-2 | Capture tool invocation counts for HelloWorldTool. |

---

## 7  Non-functional Requirements  

| Category | Metric |
|----------|--------|
| **Performance** | First token ≤ 2 s (P95, cold start), stream ≥ 5 tokens / s. |
| **Bundle Size** | Worker script ≤ 900 KiB gzipped. |
| **Accessibility** | Chat input and send button keyboard-navigable; sufficient colour contrast. |
| **Browser Support** | ES2020; no polyfills required on evergreen browsers. |
| **Security** | Reject bodies > 4 KB; sanitize user input before echo. |

---

## 8  Out-of-Scope (Prototype)  

- Persistent vector store (Qdrant)  
- Authentication & multi-tenant isolation  
- Advanced tools, media uploads, or file generation  
- Mobile-first responsive layout (desktop only)

---

## 9  Open Issues  

| # | Question | Owner | Due |
|---|----------|-------|-----|
| 1 | Which OpenAI org & key to use for dev? | PO | T-0 |
| 2 | Rate-limit strategy for public demo? | Edge Eng | T-2 |

---

## 10  Acceptance Checklist  

- [ ] Chat UI streams assistant reply.  
- [ ] Typing “run hello” triggers HelloWorldTool and returns greeting.  
- [ ] Worker bundle size verified under limit.  
- [ ] README updated with dev setup and deploy steps.  

---

_End of FRD_
::contentReference[oaicite:0]{index=0}
````
