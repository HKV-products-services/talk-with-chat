import type { ChatAddToolApproveResponseFunction, DynamicToolUIPart, ToolUIPart } from 'ai'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { startupConfig, type Voorstel } from '@/lib/config'
import { meldHost } from '@/lib/host'
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
 */
export function VoorstelKaart({ part, config, onApprovalResponse }: VoorstelKaartProps) {
  const voorstel = isRecord(part.input) ? part.input : {}
  const huidig = useHuidig(config, voorstel)
  const approval = 'approval' in part && isRecord(part.approval) ? part.approval : undefined
  const reden = approval && typeof approval.reason === 'string' ? approval.reason : undefined
  const gemeld = useRef(false)

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
    if (keuze === 'aanpassen') meldHost({ soort: 'aanpassen', tool: config.tool, voorstel })
    void onApprovalResponse({
      id: approval.id,
      approved: keuze === 'overnemen',
      reason: keuze === 'overnemen' ? undefined : REDENEN[keuze],
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
            <span>{tekst(voorstel[v.sleutel])}</span>
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

/** De kaart voor deze tool, als de app een voorstel heeft ingesteld. */
export const VOORSTEL = startupConfig.voorstel
