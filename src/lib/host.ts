import { useSyncExternalStore } from 'react'

import { startupConfig, type Keuzelijsten } from '@/lib/config'
import { isRecord } from '@/lib/is-record'

/**
 * Berichten tussen de chat in een iframe en de pagina eromheen (de host), op dezelfde oorsprong.
 *
 * Van de host: `context` gaat bij elke volgende vraag verborgen mee (wat de gebruiker nu ziet), en `vraag` stelt een
 * vraag alsof hij getypt is. Naar de host: `aanpassen` (de gebruiker zet een voorstel in het formulier van de pagina)
 * en `uitgevoerd` (een goedgekeurd voorstel is opgeslagen, de pagina kan vernieuwen).
 */
export type VanHost = { soort: 'context'; context: unknown } | { soort: 'vraag'; tekst: string }

export type NaarHost =
  | { soort: 'aanpassen'; tool: string; voorstel: Record<string, unknown> }
  | { soort: 'uitgevoerd'; tool: string; voorstel: Record<string, unknown> }

const inIframe = () => window.parent !== window

export function meldHost(bericht: NaarHost): void {
  if (inIframe()) window.parent.postMessage(bericht, window.location.origin)
}

export function luisterNaarHost(op: (bericht: VanHost) => void): () => void {
  const ontvang = (e: MessageEvent) => {
    if (e.origin !== window.location.origin || e.source !== window.parent || !isRecord(e.data)) return
    if (e.data.soort === 'context') op({ soort: 'context', context: e.data.context })
    else if (e.data.soort === 'vraag' && typeof e.data.tekst === 'string') op({ soort: 'vraag', tekst: e.data.tekst })
  }
  window.addEventListener('message', ontvang)
  return () => {
    window.removeEventListener('message', ontvang)
  }
}

// De context van nu, voor elk onderdeel dat hem nodig heeft (welkomstscherm, vervolgvragen, kaart).
let hostContext: unknown
const luisteraars = new Set<() => void>()

export function zetHostContext(context: unknown): void {
  hostContext = context
  luisteraars.forEach((l) => {
    l()
  })
}

export function useHostContext(): unknown {
  return useSyncExternalStore(
    (l) => {
      luisteraars.add(l)
      return () => luisteraars.delete(l)
    },
    () => hostContext,
  )
}

/**
 * De keuzelijsten van nu: die uit de configuratie, met per lijst die van de host als die er een meegeeft (zoals de
 * relaties die bij de soort van de open term passen).
 */
export function useKeuzelijsten(): Keuzelijsten {
  const context = useHostContext()
  const vanHost = isRecord(context) && isRecord(context.keuzelijsten) ? context.keuzelijsten : {}
  return {
    ...startupConfig.keuzelijsten,
    ...Object.fromEntries(Object.entries(vanHost).filter((e): e is [string, string[]] => Array.isArray(e[1]))),
  }
}

/** De lijst met deze waarde erin, of null: dan blijft het een markering. */
export function lijstMet(waarde: string, lijsten: Keuzelijsten): string[] | null {
  return Object.values(lijsten).find((l) => l.includes(waarde)) ?? null
}
