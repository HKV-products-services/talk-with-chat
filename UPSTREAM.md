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
| `src/lib/ingevuld.ts`, `src/components/welcome-screen.tsx`, `src/Chat.tsx`, `src/Part.tsx` | **nieuw**: `{sleutel}` in een startvraag gevuld uit de context van de host (bijv. de term die open staat); een vraag zonder die waarde staat er niet. In de vraag staat de waarde tussen «», in de startvraag en in het bericht als `<mark>` |
| `src/components/welcome-screen.tsx` | grote titel met schreef, één zin eronder, startvragen als stille pillen zonder icoon |
| `src/components/assistant-turn.tsx`, `reasoning-block.tsx`, `thinking-indicator.tsx` | geen avatar naast het antwoord; "Denkt na" / "Nagedacht" |
| `src/assets/logo.svg` | een gemaal in plaats van het Pydantic-logo (zoals het laadscherm van het dashboard) |
| `src/lib/config.ts`, `chat-db.ts`, `welcome-screen.tsx`, `chat-composer.tsx`, `app-header.tsx`, `app-sidebar.tsx`, `hooks/useDocumentTitle.ts` | naam, welkom (titel, zin, invoerveld, startvragen) en de opslag van de gesprekken uit `PYDANTIC_AI_CHAT_CONFIG`, zodat dezelfde chat ook `/chat-kennisbank/` dient met eigen gesprekken; zonder is het de chat van OptiMalen (7 okt) |
| `src/components/turn-activity.tsx`, `tool-call-group.tsx`, `tool-part-header.tsx`, `tool-part.tsx`, `tool-error.tsx`, `app-sidebar.tsx`, `conversation-*.tsx`, dialogen, `Part.tsx`, `copy-button.tsx`, `chat-composer.tsx`, `Chat.tsx`, `lib/format-time.ts`, `lib/conversation-title.ts` | zichtbare teksten in het Nederlands ("4 s gewerkt", "Klaar", "Zojuist", "Nieuw gesprek"), tijden in `nl-NL`; een geslaagde tool grijs, een fout als rood vierkant met kruis (7 okt) |
| `src/components/chat-error.tsx`, `src/index.css` | een mislukte run als rustige kaart (`.fout`) met het alarm voor prioriteit hoog en de pillen van "Nieuw gesprek" en de startvragen; de melding achter "Foutmelding" (7 okt) |
| `src/index.css` (palet), `app-sidebar.tsx`, `conversation-menu.tsx`, `tool-part-header.tsx`, `turn-activity.tsx` | één palet met de basistokens van het dashboard (`--page`, `--surface`, `--surface-2`, `--ink`, `--ink-2`, `--plan`, `--paneel`, `--critical`, `--schaduw`, …); elke shadcn-kleur verwijst daarnaar en donker definieert alleen de basis opnieuw. Rechte hoeken (`--radius-*` op 0), een rij in een lijst of menu in de paneeltint, geen rood voor "Verwijderen", geen vaste Tailwind-kleuren meer (`text-warning`, `text-plan`) (7 okt) |
| `src/lib/config.ts`, `src/components/follow-ups.tsx` | de soorten vervolgvragen (tool, sleutel, label, pictogram) uit `PYDANTIC_AI_CHAT_CONFIG.vervolgopties`; zonder die van OptiMalen |
| `src/components/voorstel-kaart.tsx` | **nieuw**: een tool die goedkeuring vraagt en in `PYDANTIC_AI_CHAT_CONFIG.voorstel` staat, als kaart: wat verandert ten opzichte van de waarden van nu (van het adres `huidig`), de toelichting, en Overnemen, Aanpassen en Laten |
| `src/lib/host.ts`, `src/Chat.tsx` | **nieuw**: berichten met de pagina eromheen als de chat in een iframe staat: `context` gaat bij elke volgende vraag mee, `vraag` stelt een vraag; terug gaan `aanpassen` en `uitgevoerd` |
| `src/Part.tsx`, `src/Chat.tsx` (idem) | de kaart van een voorstel in plaats van de toolkaart, en niet in het ingevouwen activiteitenblok |
| `src/components/app-header.tsx` (idem) | "Nieuw gesprek" heeft een `aria-label`: in een smalle lade staat alleen het pictogram |
| `UPSTREAM.md` | dit bestand |

## Bouwen

```bash
pnpm install
pnpm build:offline      # -> offline/index.html, één bestand, geen CDN
```

De backend (`talkwithoptimalen.server`) serveert `offline/index.html` op `/chat/`, en zet daarbij
`window.PYDANTIC_AI_CHAT_CONFIG` in de pagina (basePath `/chat/`). Het dashboard staat op `/`.

**Opgeruimd.** Alles uit ai-chat-ui dat hier niet gebruikt wordt, is weg: de demo-backend (`agent/`),
`specs/`, `CHANGELOG.md`, `bun.lock`, de hooks en releaseconfiguratie (`.husky/`, `lefthook.yml`,
`commitlint.config.js`, `cspell.json`, `.releaserc.json`, `.github/`) en de pakketten die daarbij hoorden.
`package.json` heet `talkwithoptimalen-chat` en is privé: niet publiceerbaar. `pnpm dev` stuurt `/api`
naar de server van talkwithoptimalen (7932). `README.md` beschrijft deze fork; `LICENSE` blijft die van
ai-chat-ui.

**Tests.** De testsuite van ai-chat-ui (vitest, Playwright en hun testserver in `tests/`, met
`playwright*.config.ts`, `vitest.config.ts` en `tsconfig.test.json`) is weggehaald: die testte de
demo-app van ai-chat-ui, niet OptiMalen, en draaide hier nergens. De backend van de chat valt onder de
Python-tests van talkwithoptimalen; een wijziging in de frontend controleer je met `pnpm typecheck`,
`pnpm lint`, `pnpm build:offline` en in de browser. Haal je een nieuwe versie van ai-chat-ui op, laat
de tests dan weg.
