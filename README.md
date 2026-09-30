# Chat van talkwithoptimalen

De chat op `/chat/` van talkwithoptimalen: een React-interface voor de Pydantic AI-agent in
`src/talkwithoptimalen/agent.py`. Een kleine fork van [pydantic/ai-chat-ui](https://github.com/pydantic/ai-chat-ui);
wat afwijkt staat in [UPSTREAM.md](UPSTREAM.md), de licentie van het origineel in [LICENSE](LICENSE).

```bash
pnpm install
pnpm build:offline   # offline/index.html: wat de server op /chat/ serveert
pnpm dev             # ontwikkelen tegen de server op localhost:7932 (uv run python -m talkwithoptimalen)
```

Controleren: `pnpm typecheck`, `pnpm lint`, `pnpm build:offline`, en in de browser.
