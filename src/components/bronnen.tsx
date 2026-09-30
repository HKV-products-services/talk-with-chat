import { ChevronRightIcon, DatabaseIcon, LoaderIcon } from 'lucide-react'
import { useState } from 'react'

/**
 * Eén kaartje "Bronnen" onder het antwoord, in plaats van een toolkaart per query (naar het voorbeeld
 * van america.gov). Dicht noemt het in gewone woorden welke gegevens het
 * antwoord gebruikte; open staan de zoekvragen zelf, voor wie het wil nalopen. Het antwoord rust
 * altijd op meerdere queries: een kaart per query is te veel.
 */
export const QUERY_TOOL = 'query'

export interface Bron {
  sql: string | null
  /** Aantal rijen dat de query opleverde; null zolang hij loopt of als hij faalde. */
  rijen: number | null
  bezig: boolean
}

// Tabellen en views van het store-contract in woorden van een beheerder.
const NAAM: Record<string, string> = {
  planning: 'planning',
  operatieve_planning: 'planning die gold',
  aangepast: 'aangepaste planning',
  gedraaid: 'wat de pompen deden',
  bedrijfsvorm: 'pompmodes',
  pompmodes: 'pompmodes',
  toelichtingen: 'redenen van beheerders',
  regeling: 'regeling',
  verwacht_peil: 'verwacht peil',
  gemeten_peil: 'gemeten peil',
  invoer: 'verwachtingen (afvoer, prijs, neerslag)',
  afvoer_gemeten: 'gemeten afvoer',
  neerslag_gemeten: 'gemeten neerslag',
  prijs: 'stroomprijs',
  runs: 'planningen',
  gemalen: 'gemalen',
  gemalen_per_afdeling: 'gemalen',
  pompen: 'pompen',
  afdelingen: 'afdelingen',
  doelen: 'doelen van het model',
  doeldefinities: 'doelen van het model',
  prioriteiten: 'doelen van het model',
  varianten: 'varianten',
  variant_planning: 'varianten',
  variant_peil: 'varianten',
  variant_uitkomst: 'varianten',
}

/** De tabellen die een query leest, in de volgorde waarin ze voor het eerst voorkomen. */
function tabellen(sql: string): string[] {
  // namen van een WITH-blok zijn geen bron: die komen zelf uit de tabellen erin
  const hulp = new Set([...sql.matchAll(/\b([a-z_][a-z0-9_]*)\s+as\s*\(/gi)].map((m) => m[1].toLowerCase()))
  return [...sql.matchAll(/\b(?:from|join)\s+([a-z_][a-z0-9_.]*)/gi)]
    .map((m) => m[1].toLowerCase().split('.').at(-1) ?? '')
    .filter((t) => t && !hulp.has(t))
}

export function Bronnen({ bronnen }: { bronnen: Bron[] }) {
  const [open, setOpen] = useState(false)
  const bezig = bronnen.some((b) => b.bezig)
  const namen = [
    ...new Set(bronnen.flatMap((b) => (b.sql ? tabellen(b.sql) : [])).map((t) => NAAM[t] ?? t.replace(/_/g, ' '))),
  ]
  const aantal = bronnen.length

  return (
    <div className="bronnen not-prose" data-slot="bronnen">
      <button
        type="button"
        className="bronnen-kop"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o)
        }}
      >
        {bezig ? (
          <LoaderIcon className="size-4 shrink-0 animate-spin" />
        ) : (
          <DatabaseIcon className="size-4 shrink-0" />
        )}
        <span className="bronnen-titel">Bronnen</span>
        <span className="bronnen-namen">{namen.length ? namen.join(', ') : bezig ? 'gegevens opzoeken…' : '—'}</span>
        <span className="bronnen-aantal">
          {aantal} {aantal === 1 ? 'zoekvraag' : 'zoekvragen'}
        </span>
        <ChevronRightIcon className="bronnen-pijl size-4 shrink-0" />
      </button>
      {open && (
        <ol className="bronnen-lijst">
          {bronnen.map((b, i) => (
            <li key={i}>
              <div className="bronnen-onderschrift">
                Zoekvraag {i + 1}
                {b.bezig
                  ? ' · bezig'
                  : b.rijen === null
                    ? ' · geen resultaat'
                    : ` · ${b.rijen} ${b.rijen === 1 ? 'rij' : 'rijen'}`}
              </div>
              {b.sql && <pre className="bronnen-sql">{b.sql.trim()}</pre>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
