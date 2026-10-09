# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The chat used by the HKV talk-with apps: a React chat interface for Pydantic AI (Vite + React + TypeScript, Vercel AI SDK and Elements), forked from `pydantic/ai-chat-ui`. `UPSTREAM.md` lists every change against it. The backend is not in this repository: each app serves `offline/index.html` with its own `PYDANTIC_AI_CHAT_CONFIG` and its own agent.

## Development Commands

```bash
pnpm install
pnpm dev                 # Vite dev server; proxies /api to the talkwithoptimalen server on localhost:7932
pnpm build:offline       # offline/index.html, one self-contained file: what the server serves on /chat/
pnpm typecheck           # Type check without emitting
pnpm lint                # ESLint
pnpm lint-fix            # Fix ESLint issues
pnpm format              # Prettier
```

A backend for `pnpm dev`: for example talk-with-optimalen (`uv run python -m talkwithoptimalen`, port 7932).

**Testing:**

The test suite of upstream ai-chat-ui (vitest, Playwright, its FastAPI test server) is not part of
this fork: it tested the upstream demo app. Each app tests its own backend. Check a frontend change with
`pnpm typecheck`, `pnpm lint`, `pnpm build:offline`, and in the browser.

## Architecture

### Frontend Structure

- **src/Chat.tsx**: Main chat component handling conversation state, message sending, and persistence coordination
- **src/Part.tsx**: Renders individual message parts (text, reasoning, tools, etc.)
- **src/App.tsx**: Root component with theme provider, sidebar, and React Query setup
- **src/components/ai-elements/**: Vercel AI Elements wrappers (conversation, prompt-input, message, tool, reasoning, sources, etc.)
- **src/components/ui/**: Radix UI and shadcn/ui components

The shell is composed as sidebar → `AppHeader` → conversation → `ChatComposer`:

- **app-header.tsx**: sidebar toggle, conversation title (also the tab title), new chat, theme toggle
- **welcome-screen.tsx**: empty-conversation state with suggested prompts
- **assistant-turn.tsx** / **user-bubble.tsx**: per-role message layout. An assistant turn is one avatar-gutter column holding that turn's reasoning, tool cards and prose
- **chat-composer.tsx**: message box plus the per-run settings (model, effort, builtin tools) and the stop control
- **tool-part-header.tsx**: collapsed tool-card row, including the one-line argument preview from `lib/tool-summary.ts`

### Key Frontend Concepts

**Conversation Management:**

- Conversations and messages are stored by ID in the `chat-storage` IndexedDB database
- URL-based routing: `/` for new chat, `/{nanoid}` for existing
- Messages are persisted from the active SDK chat session on a 500ms throttle
- Access persistence through `src/lib/chat-db.ts`
- Include both stores in message-write and deletion transactions to serialize them across tabs
- `App` migrates legacy `localStorage` conversations once on startup

**Model & Tool Selection:**

- Dynamic model/tool configuration fetched from the configured API path (`/api/configure` by default)
- Models and available builtin tools configured per-model
- Tools toggled via checkboxes in prompt toolbar

**Message Parts:**

- Messages contain multiple parts: text, reasoning, tool calls, sources
- Part rendering delegated to `Part.tsx` component
- Tool calls show input/output with collapsible UI

### Backend Structure

In each app, for example talk-with-optimalen: `src/talkwithoptimalen/server.py` (the chat endpoint and
`/api/configure`) and `src/talkwithoptimalen/agent.py` (the Pydantic AI agent with the `query` tool and the
`vervolgopties` output function).

### Backend Integration

**Default endpoints:**

- `GET /api/configure`: Returns available models and builtin tools (camelCase)
- `POST /api/chat`: Handles chat messages via `VercelAIAdapter`
  - Accepts `model` and `builtinTools` in request body extra data
  - Streams responses using SSE

Set `window.PYDANTIC_AI_CHAT_CONFIG` before the UI module executes to override paths at runtime.

- Use `basePath` to control conversation navigation.
- Use `apiPath` as the complete same-origin directory containing `configure` and `chat`.
- Keep `apiPath` independent of `basePath`; its default is `/api/`.

**Token usage:**

The UI shows per-reply and per-conversation token counts, read from `UIMessage.metadata.usage` on assistant messages:

```json
{ "usage": { "inputTokens": 120, "outputTokens": 30, "totalTokens": 150, "requests": 1, "toolCalls": 0 } }
```

`snake_case` keys are accepted too. A backend puts them there by writing `ModelResponse.metadata` before the adapter emits its `message-metadata` chunk — see `UsageEventStream` in `tests/server/server.py` for a working ~20-line implementation. The figures are per-message, not per-run: when the trailing message a run receives is already an assistant message (an approval continuation), the client keeps that message and deep-merges the new metadata into it, so a backend must add its run's usage to what that message already carries rather than assign it. `Agent.to_web()` does not report usage today (it hardcodes `VercelAIAdapter` with no seam), so agents served that way fall back to a locally-derived estimate, which the UI labels with `~`.

**Builtin Tools:**

- `web_search`, `code_execution`, `image_generation`
- Enabled per-model in AI_MODELS configuration
- Selected tools passed to agent via `VercelAIAdapter.dispatch_request`

## Frontend code structure

### One component per file

Non-trivial React components live in their own file. Trivial means: pure JSX, no state/effects, used in exactly one place, ~10 lines or fewer — those can be inline functions in the parent file. Everything else gets its own file.

File names are kebab-case (`tool-approval-prompt.tsx`); exported component names are PascalCase (`ToolApprovalPrompt`). Place files under:

- `src/components/{name}.tsx` — domain-specific compositions (`edit-message-dialog.tsx`, `tool-approval-prompt.tsx`)
- `src/components/ai-elements/{name}.tsx` — wrappers around `@ai-sdk` UI elements (`confirmation.tsx`, `tool.tsx`)
- `src/components/ui/{name}.tsx` — pure shadcn/ui primitives (`button.tsx`, `alert.tsx`)

`src/Chat.tsx` and `src/Part.tsx` are top-level composition orchestrators; the pieces they render belong in their own files.

### Vendored components are read-only

`src/components/ui/` (shadcn) and `src/components/ai-elements/` (Vercel AI Elements) are vendored from upstream registries. Treat them as read-only: never modify in place. To customize behavior, wrap the primitive in a new file under `src/components/`. To upgrade, re-run `npx shadcn@latest add <name>` (or `@ai-elements/<name>`) and review the diff.

Two normalizations are part of vendoring itself, not local modifications: files are formatted with the repo's Prettier config, and Radix imports use the granular `@radix-ui/react-<name>` package instead of the `radix-ui` umbrella the current shadcn generator emits — the umbrella pins its own copies of internal primitives (react-dismissable-layer, react-focus-scope, react-primitive), which made the single-file offline artifact ship two of each. Apply both when re-vendoring; a diff that consists only of these is not a modification.

## Configuration

- **TypeScript paths**: `@/*` maps to `./src/*`
- **Vite base URL**: CDN path for production (`jsdelivr.net/npm/@pydantic/pydantic-ai-chat/dist/`)
- **Runtime paths**: `window.PYDANTIC_AI_CHAT_CONFIG` supplies independent `basePath` and `apiPath` values
- **Dev proxy**: `/api` proxied to `localhost:7932` (the talkwithoptimalen server)
- **Package**: private (`talk-with-chat`), never published

## Tech Stack

- React 19, TypeScript, Vite, Tailwind CSS 4
- Vercel AI SDK (`@ai-sdk/react`, `ai`)
- Radix UI primitives
- Backend: in each app (Starlette, Pydantic AI)
- ESLint (neostandard), Prettier
