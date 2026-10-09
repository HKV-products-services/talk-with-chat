# talk-with-chat

Chat voor de talk-with-apps van HKV: een React-interface voor een Pydantic AI-agent, gebouwd tot één HTML-bestand
dat de app zelf serveert. Een kleine fork van [pydantic/ai-chat-ui](https://github.com/pydantic/ai-chat-ui); wat
afwijkt staat in [UPSTREAM.md](UPSTREAM.md), de licentie van het origineel in [LICENSE](LICENSE).

```bash
pnpm install
pnpm build:offline   # offline/index.html: wat een app serveert
pnpm dev             # ontwikkelen tegen een server op localhost:7932
```

Een app serveert `offline/index.html` met `window.PYDANTIC_AI_CHAT_CONFIG` erin (paden, naam, welkom) en biedt
`configure` en `chat` volgens het contract van ai-chat-ui (`VercelAIAdapter` van Pydantic AI).

Controleren: `pnpm typecheck`, `pnpm lint`, `pnpm build:offline`, en in de browser.
