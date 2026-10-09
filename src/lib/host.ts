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
