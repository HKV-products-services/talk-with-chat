# Fork van pydantic/ai-chat-ui

Upstream: https://github.com/pydantic/ai-chat-ui
Basis: `8014d57f8fccda48ff643126c6a10f91812f61a6 2026-08-19` (package-versie 2.3.0)

Dit is een bewust **kleine** fork. Het bevindingenrapport (A-12) waarschuwt voor forks
die bij elke upstream-release een merge worden; daarom staat hier precies wat afwijkt,
zodat bijwerken neerkomt op: nieuwe upstream ophalen en deze wijzigingen opnieuw toepassen.

## Wijzigingen ten opzichte van upstream

| bestand | wat |
| --- | --- |
| `src/components/follow-ups.tsx` | **nieuw**: de drie vervolgopties als bewerkbare velden, elk met een eigen verzendknop; zelfde vorm als in het dashboard (label erboven, invoervak met de knop erin) |
| `src/Part.tsx` | toolpart `vervolgopties` rendert als `FollowUps` in plaats van als toolkaart |
| `src/Chat.tsx` | `vervolgopties` niet in het ingevouwen activiteitenblok; klik verstuurt direct; startvraag via `?vraag=` en verborgen moment, gebied en schermcontext via `?anker=`, `?gebied=` en `?context=` (vanuit het dashboard) |
| `src/components/welcome-screen.tsx` | kop en ondertitel in het Nederlands |
| `src/index.css` | **één blok aan het eind**: de kleuren van het dashboard (warm grijs, zwart voor acties, blauw alleen voor focus en "aangepast") en `--plan`, `--veld`, `--veld-rand` |
| `src/assets/logo.svg` | een gemaal in plaats van het Pydantic-logo (zoals het laadscherm van het dashboard) |
| `UPSTREAM.md` | dit bestand |

## Bouwen

```bash
pnpm install
pnpm build:offline      # -> offline/index.html, één bestand, geen CDN
```

De backend (`talkwithoptimalen.server`) serveert `offline/index.html` op `/chat/`, en zet daarbij
`window.PYDANTIC_AI_CHAT_CONFIG` in de pagina (basePath `/chat/`). Het dashboard staat op `/`.
