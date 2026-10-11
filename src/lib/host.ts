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
 * `paginatool` naar de host, die met `uitkomst` antwoordt: wat er nu te zien is, of een `fout`.
 */
export type VanHost = { soort: 'context'; context: unknown } | { soort: 'vraag'; tekst: string }

export type NaarHost =
  | { soort: 'aanpassen'; tool: string; voorstel: Record<string, unknown> }
  | { soort: 'uitgevoerd'; tool: string; voorstel: Record<string, unknown> }
  | { soort: 'paginatool'; id: string; tool: string; invoer: unknown }

const inIframe = () => window.parent !== window

export function meldHost(bericht: NaarHost): void {
  if (inIframe()) window.parent.postMessage(bericht, window.location.origin)
}

/** Een paginatool door de host laten uitvoeren; `id` is die van de toolaanroep. */
export function vraagHost(
  id: string,
  tool: string,
  invoer: unknown,
): Promise<{ uitkomst: unknown } | { fout: string }> {
  if (!inIframe()) return Promise.resolve({ fout: 'Geen pagina om te bedienen: de chat staat niet in een pagina' })
  return new Promise((resolve) => {
    const ontvang = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent || !isRecord(e.data)) return
      if (e.data.soort !== 'uitkomst' || e.data.id !== id) return
      window.removeEventListener('message', ontvang)
      resolve(typeof e.data.fout === 'string' ? { fout: e.data.fout } : { uitkomst: e.data.uitkomst })
    }
    window.addEventListener('message', ontvang)
    meldHost({ soort: 'paginatool', id, tool, invoer })
  })
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
