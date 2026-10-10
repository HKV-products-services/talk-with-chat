import type { ChatAddToolApproveResponseFunction, DynamicToolUIPart, ToolUIPart } from 'ai'
import { useEffect, useRef, useState } from 'react'

import { KeuzeInTekst } from '@/components/keuze-in-tekst'
import { Button } from '@/components/ui/button'
import { startupConfig, type Voorstel } from '@/lib/config'
import { meldHost, useKeuzelijsten } from '@/lib/host'
import { isRecord } from '@/lib/is-record'
import { cn } from '@/lib/utils'

// De reden bij een afwijzing: de agent leest hem terug, de kaart toont er de afloop mee.
const REDENEN = {
  aanpassen: 'De gebruiker past het voorstel zelf aan in het formulier van de pagina.',
  laten: 'De gebruiker laat dit voorstel liggen; niet opgeslagen.',
}

// een waarde zoals de kaart hem toont: een lijst met komma's, een object als JSON, leeg als streepje
const tekst = (waarde: unknown): string =>
  Array.isArray(waarde)
    ? waarde.map(tekst).join(', ') || '—'
    : waarde === null || waarde === undefined || waarde === ''
      ? '—'
      : typeof waarde === 'object'
        ? JSON.stringify(waarde)
        : String(waarde as string | number | boolean)

/** De waarden van nu, van het adres uit de configuratie; null als er nog niets is (404). */
function useHuidig(config: Voorstel, voorstel: Record<string, unknown>): Record<string, unknown> | null | undefined {
  const [huidig, setHuidig] = useState<Record<string, unknown> | null | undefined>(undefined)
  const adres = config.huidig.replace(/\{(\w+)\}/g, (_, naam: string) => encodeURIComponent(tekst(voorstel[naam])))
  // pas als de titel binnen is: tijdens het streamen van de argumenten is hij er nog niet
  const klaar = typeof voorstel[config.titel] === 'string'
  useEffect(() => {
    if (!klaar) return
    let weg = false
    void fetch(adres, { credentials: 'same-origin' })
      .then(async (r) => {
        if (r.status === 404) return null
        if (!r.ok) throw new Error(`${adres}: ${r.status}`)
        const waarden: unknown = await r.json()
        return isRecord(waarden) ? waarden : null
      })
      .then((waarden) => {
        if (!weg) setHuidig(waarden)
      })
    return () => {
      weg = true
    }
  }, [adres, klaar])
  return huidig
}

interface VoorstelKaartProps {
  part: ToolUIPart | DynamicToolUIPart
  config: Voorstel
  onApprovalResponse: ChatAddToolApproveResponseFunction
}

/**
 * Een voorgestelde wijziging als kaart: wat verandert ten opzichte van nu (het oude doorgestreept), en waarom. De
 * gebruiker beslist: Overnemen keurt de tool goed, Aanpassen zet het voorstel in het formulier van de pagina en
 * Laten wijst het af. Daarna blijft één regel staan met wat er gekozen is.
 *
 * Een veld met een keuzelijst kies je op de kaart om; Overnemen geeft dan de gekozen argumenten mee als reden (JSON),
 * en de server voert de tool daarmee uit.
 */
export function VoorstelKaart({ part, config, onApprovalResponse }: VoorstelKaartProps) {
  const voorstel = isRecord(part.input) ? part.input : {}
  const huidig = useHuidig(config, voorstel)
  const approval = 'approval' in part && isRecord(part.approval) ? part.approval : undefined
  const reden = approval && typeof approval.reason === 'string' ? approval.reason : undefined
  const gemeld = useRef(false)
  const lijsten = useKeuzelijsten()
  const [keuzes, setKeuzes] = useState<Record<string, unknown>>({})
  // overgenomen met andere keuzes: die staan in de reden
  const overgenomen: unknown = approval?.approved === true && reden ? JSON.parse(reden) : null
  const gekozen = isRecord(overgenomen) ? overgenomen : { ...voorstel, ...keuzes }

  // een goedgekeurd voorstel is opgeslagen: de pagina eromheen kan vernieuwen
  useEffect(() => {
    if (part.state === 'output-available' && approval?.approved === true && !gemeld.current) {
      gemeld.current = true
      meldHost({ soort: 'uitgevoerd', tool: config.tool, voorstel })
    }
  }, [part.state, approval?.approved, config.tool, voorstel])

  const rijen = config.velden.filter((v) => !huidig || tekst(huidig[v.sleutel]) !== tekst(voorstel[v.sleutel]))
  const kies = (keuze: 'overnemen' | 'aanpassen' | 'laten') => {
    if (!approval || typeof approval.id !== 'string') return
    if (keuze === 'aanpassen') meldHost({ soort: 'aanpassen', tool: config.tool, voorstel: gekozen })
    const anders = Object.keys(keuzes).length > 0
    void onApprovalResponse({
      id: approval.id,
      approved: keuze === 'overnemen',
      reason: keuze !== 'overnemen' ? REDENEN[keuze] : anders ? JSON.stringify(gekozen) : undefined,
    })
  }
  const afloop =
    part.state === 'approval-requested'
      ? null
      : approval?.approved === true
        ? part.state === 'output-error'
          ? 'Overgenomen, maar niet opgeslagen'
          : 'Overgenomen'
        : reden === REDENEN.aanpassen
          ? 'In het formulier'
          : approval?.approved === false
            ? 'Gelaten'
            : null

  return (
    <div
      className={cn(
        'border-border border-l-plan flex flex-col gap-1.5 border border-l-[3px] px-3.5 py-3',
        afloop === 'Gelaten' && 'border-l-muted-foreground opacity-60',
      )}
    >
      <div className="flex items-baseline gap-2">
        <strong className="text-sm">{tekst(voorstel[config.titel])}</strong>
        <span className="text-muted-foreground text-xs">
          {huidig === undefined ? '' : huidig === null ? 'nieuw' : 'wijziging'}
        </span>
      </div>
      {huidig !== undefined && rijen.length === 0 && (
        <p className="text-muted-foreground text-sm">Gelijk aan wat er nu staat.</p>
      )}
      {huidig !== undefined &&
        rijen.map((v) => (
          <div key={v.sleutel} className="grid grid-cols-[84px_1fr] gap-x-2 text-sm">
            <span className="text-muted-foreground row-span-2 pt-0.5 text-xs font-semibold">{v.label}</span>
            {huidig && <del className="text-muted-foreground">{tekst(huidig[v.sleutel])}</del>}
            <span>
              <Waarde
                veld={v}
                waarde={gekozen[v.sleutel]}
                opties={v.lijst && part.state === 'approval-requested' ? lijsten[v.lijst] : undefined}
                onKies={(nieuw) => {
                  setKeuzes({ ...keuzes, [v.sleutel]: nieuw })
                }}
              />
            </span>
          </div>
        ))}
      <p className="text-muted-foreground text-[13px]">{tekst(voorstel[config.toelichting])}</p>
      {afloop === null && part.state === 'approval-requested' ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Button
            size="sm"
            onClick={() => {
              kies('overnemen')
            }}
          >
            Overnemen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              kies('aanpassen')
            }}
          >
            Aanpassen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              kies('laten')
            }}
          >
            Laten
          </Button>
        </div>
      ) : (
        afloop && <p className="text-plan text-[13px] font-semibold">{afloop}</p>
      )}
    </div>
  )
}

/**
 * De waarde van een veld: tekst, of een keuzelijst als het veld er een heeft en er nog gekozen wordt. Bij een lijst van
 * teksten met een scheiding ("soort van → gemaal") kies je per regel het deel ervoor.
 */
function Waarde({
  veld,
  waarde,
  opties,
  onKies,
}: {
  veld: Voorstel['velden'][number]
  waarde: unknown
  opties: string[] | undefined
  onKies: (waarde: unknown) => void
}) {
  if (!opties) return tekst(waarde)
  if (typeof waarde === 'string')
    return (
      <KeuzeInTekst waarde={waarde} opties={opties} onKies={onKies} label={`${veld.label}: kies een andere waarde`} />
    )
  const scheiding = veld.scheiding
  if (!Array.isArray(waarde) || !scheiding || waarde.length === 0) return tekst(waarde)
  return waarde.map((regel: unknown, i) => {
    const [keuze, ...rest] = String(regel).split(scheiding)
    return (
      <span key={i}>
        {i > 0 && ', '}
        <KeuzeInTekst
          waarde={keuze}
          opties={opties}
          label={`${veld.label}: kies een andere waarde voor ${rest.join(scheiding)}`}
          onKies={(nieuw) => {
            onKies(waarde.map((r: unknown, j) => (j === i ? [nieuw, ...rest].join(scheiding) : r)))
          }}
        />
        {scheiding}
        {rest.join(scheiding)}
      </span>
    )
  })
}

/** De kaart voor deze tool, als de app een voorstel heeft ingesteld. */
export const VOORSTEL = startupConfig.voorstel
