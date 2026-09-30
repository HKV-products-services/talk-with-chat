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
| `src/Part.tsx` | toolpart `vervolgopties` rendert als `FollowUps` in plaats van als toolkaart; alleen de laatste poging in een bericht (een afgewezen poging blijft anders zichtbaar), en niet als ook die afgewezen is (`output-error`: de herkansingen op, dan alleen de foutkaart) |
| `src/Chat.tsx` | `vervolgopties` niet in het ingevouwen activiteitenblok; klik verstuurt direct; startvraag via `?vraag=` en verborgen moment, gebied, afdeling en schermcontext via `?anker=`, `?gebied=`, `?afdeling=` en `?context=` (vanuit het dashboard) |
| `src/lib/tijdnotatie.ts` | **nieuw**: de tijdnotatie `mensentaal [[2026-09-15T01:00]]` van talkwithoptimalen (issue #10): tooltiptekst, omzetten naar `<time datetime>`, en de regel voor een invoerveld (`alsVeld`, `teVersturen`) |
| `src/lib/conversation-title.ts` | de titel uit de eerste vraag zonder de notatie `[[…]]` |
| `src/components/markdown.tsx` | tekst gaat eerst door `notatieNaarHtml` (vóór de Markdown), en `time` rendert als `Tijdstip`: een klein klokje met de absolute tijd als tooltip bij hover en focus |
| `src/lib/markdown-plugins.ts` | `time` in de allowlist van de sanitizer (`dateTime` stond er al voor elk element) |
| `src/components/follow-ups.tsx` (idem) | het veld toont alleen de mensentaal van een vervolgoptie (`alsVeld`); onveranderd verstuurd gaat de notatie `[[…]]` mee, aangepast precies wat er staat (`teVersturen`) |
| `src/components/bronnen.tsx` | **nieuw**: één kaartje "Bronnen" onder het antwoord met de gebruikte gegevens in gewone woorden; de zoekvragen (SQL) uitklapbaar (29 sep, naar america.gov) |
| `src/Chat.tsx` (idem) | toolaanroepen `query` niet als losse kaarten in het werkblok maar samen in `Bronnen`, vóór de vervolgvragen |
| `src/components/welcome-screen.tsx` | kop en ondertitel in het Nederlands |
| `src/components/ai-elements/prompt-input.tsx` | standaardtekst in het invoerveld in het Nederlands |
| `src/index.css` | **drie blokken aan het eind**: het bronnenkaartje, de tooltip van `.tijdstip`, en de kleuren van het dashboard (koel neutraal grijs, bijna-zwart voor acties, blauw alleen voor focus en "aangepast") en `--plan`, `--veld`, `--veld-rand` |
| `index.html`, `src/components/app-sidebar.tsx` | de naam "OptiMalen" in plaats van "Pydantic AI" (tabtitel en zijbalk; 30 sep) |
| `src/App.tsx`, `src/components/app-sidebar.tsx` | de gesprekken standaard dicht en helemaal weg als ze dicht zijn (`offcanvas` i.p.v. een icoonstrook; 30 sep, "minder zijpaneel") |
| `src/components/app-header.tsx` | "← Dashboard" terug naar het scherm waar "Volledig scherm" vandaan kwam (`?terug=`, alleen een pad op dezelfde oorsprong; niet in de lade); rustige kop: woordmerk, titel klein in het midden, pil "Nieuw gesprek"; geen rand, geen thema- en sneltoetsknop (de sneltoetsen werken nog) |
| `src/components/chat-composer.tsx` | het invoerveld als één pil met een ronde blauwe knop; filter, model en denkniveau alleen als er iets te kiezen valt; geen regel met sneltoetsen en tokens eronder |
| `src/components/welcome-screen.tsx` | grote titel met schreef, één zin eronder, startvragen als stille pillen zonder icoon |
| `src/components/assistant-turn.tsx`, `reasoning-block.tsx`, `thinking-indicator.tsx` | geen avatar naast het antwoord; "Denkt na" / "Nagedacht" |
| `src/assets/logo.svg` | een gemaal in plaats van het Pydantic-logo (zoals het laadscherm van het dashboard) |
| `UPSTREAM.md` | dit bestand |

## Bouwen

```bash
pnpm install
pnpm build:offline      # -> offline/index.html, één bestand, geen CDN
```

De backend (`talkwithoptimalen.server`) serveert `offline/index.html` op `/chat/`, en zet daarbij
`window.PYDANTIC_AI_CHAT_CONFIG` in de pagina (basePath `/chat/`). Het dashboard staat op `/`.

**Tests.** De testsuite van ai-chat-ui (vitest, Playwright en hun testserver in `tests/`, met
`playwright*.config.ts`, `vitest.config.ts` en `tsconfig.test.json`) is weggehaald: die testte de
demo-app van ai-chat-ui, niet OptiMalen, en draaide hier nergens. De backend van de chat valt onder de
Python-tests van talkwithoptimalen; een wijziging in de frontend controleer je met `pnpm typecheck`,
`pnpm lint`, `pnpm build:offline` en in de browser. Haal je een nieuwe versie van ai-chat-ui op, laat
de tests dan weg.
