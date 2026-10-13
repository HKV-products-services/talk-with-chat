import { useSyncExternalStore } from 'react'
import { z } from 'zod'

import { startupConfig, type Keuzelijsten } from '@/lib/config'
import { isRecord } from '@/lib/is-record'

/**
 * Berichten tussen de chat in een iframe en de pagina eromheen (de host), op dezelfde oorsprong.
 *
 * Van de host: `context` gaat bij elke volgende vraag verborgen mee (wat de gebruiker nu ziet), en `vraag` stelt een
 * vraag alsof hij getypt is. Naar de host: `aanpassen` (de gebruiker zet een voorstel in het formulier van de pagina)
 * en `uitgevoerd` (een goedgekeurd voorstel is opgeslagen, de pagina kan vernieuwen). Een paginatool gaat als
 * `paginatool` naar de host, die antwoordt met `uitkomst` of `fout`; de chat geeft dat als uitvoer van de tool terug.
 * `klaar` meldt dat de chat luistert: een context die de host eerder stuurde, kan verloren zijn gegaan.
 */
export type VanHost = { soort: 'context'; context: unknown } | { soort: 'vraag'; tekst: string }

export type NaarHost =
  | { soort: 'klaar' }
  | { soort: 'aanpassen'; tool: string; voorstel: Record<string, unknown> }
  | { soort: 'uitgevoerd'; tool: string; voorstel: Record<string, unknown> }
  | { soort: 'paginatool'; id: string; tool: string; invoer: unknown }

const inIframe = () => window.parent !== window
const WACHTEN = 60_000 // ms

/** Een bericht van de pagina eromheen, op dezelfde oorsprong; anders null. Niet op `e.source`: Safari geeft daar het
 * venster van de chat zelf als de pagina het bericht vanuit een timer stuurt. */
function vanHost(e: MessageEvent): Record<string, unknown> | null {
  return inIframe() && e.origin === window.location.origin && isRecord(e.data) ? e.data : null
}

export function meldHost(bericht: NaarHost): void {
  if (inIframe()) window.parent.postMessage(bericht, window.location.origin)
}

/** Een paginatool door de host laten uitvoeren (`id`: die van de toolaanroep); zonder antwoord na een minuut een fout. */
export function vraagHost(
  id: string,
  tool: string,
  invoer: unknown,
): Promise<{ uitkomst: unknown } | { fout: string }> {
  if (!inIframe()) return Promise.resolve({ fout: 'Geen pagina om te bedienen: de chat staat niet in een pagina' })
  return new Promise((resolve) => {
    const klaar = (antwoord: { uitkomst: unknown } | { fout: string }) => {
      clearTimeout(wekker)
      window.removeEventListener('message', ontvang)
      resolve(antwoord)
    }
    const ontvang = (e: MessageEvent) => {
      const bericht = vanHost(e)
      if (bericht?.soort !== 'uitkomst' || bericht.id !== id) return
      klaar(typeof bericht.fout === 'string' ? { fout: bericht.fout } : { uitkomst: bericht.uitkomst })
    }
    const wekker = setTimeout(() => {
      klaar({ fout: `De pagina antwoordde niet binnen een minuut op ${tool}` })
    }, WACHTEN)
    window.addEventListener('message', ontvang)
    meldHost({ soort: 'paginatool', id, tool, invoer })
  })
}

export function luisterNaarHost(op: (bericht: VanHost) => void): () => void {
  const ontvang = (e: MessageEvent) => {
    const bericht = vanHost(e)
    if (bericht?.soort === 'context') op({ soort: 'context', context: bericht.context })
    else if (bericht?.soort === 'vraag' && typeof bericht.tekst === 'string')
      op({ soort: 'vraag', tekst: bericht.tekst })
  }
  window.addEventListener('message', ontvang)
  meldHost({ soort: 'klaar' })
  return () => {
    window.removeEventListener('message', ontvang)
  }
}

// De context van de host, voor de onderdelen buiten Chat.
let hostContext: unknown
const luisteraars = new Set<() => void>()

export function zetHostContext(context: unknown): void {
  hostContext = context
  luisteraars.forEach((l) => {
    l()
  })
}

function luister(l: () => void): () => void {
  luisteraars.add(l)
  return () => luisteraars.delete(l)
}

const KEUZELIJSTEN = z.record(z.string(), z.array(z.string()))

/** De keuzelijsten uit de configuratie; een lijst die de host in zijn context meegeeft, gaat voor. */
export function useKeuzelijsten(): Keuzelijsten {
  const context = useSyncExternalStore(luister, () => hostContext)
  const vanHost = isRecord(context) && 'keuzelijsten' in context ? KEUZELIJSTEN.parse(context.keuzelijsten) : {}
  return { ...startupConfig.keuzelijsten, ...vanHost }
}

/** De lijst met deze waarde erin, of null: dan blijft het een markering. */
export function lijstMet(waarde: string, lijsten: Keuzelijsten): string[] | null {
  return Object.values(lijsten).find((l) => l.includes(waarde)) ?? null
}
