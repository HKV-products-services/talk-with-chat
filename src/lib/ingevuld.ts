/**
 * Een waarde van de pagina in een startvraag: `{sleutel}` in label of vraag wordt gevuld uit de context die de host
 * doorgeeft (bijvoorbeeld de term die open staat). In de vraag staat de waarde tussen «», zodat hij in het bericht
 * herkenbaar blijft als ingevuld.
 */
export type Stuk = string | { waarde: string }

const PLEK = /\{(\w+)\}/g

/** De tekst in stukken, met de waarden uit `context`; null als er een ontbreekt (dan past de vraag nu niet). */
export function vul(tekst: string, context: unknown): Stuk[] | null {
  const stukken: Stuk[] = []
  let rest = 0
  for (const plek of tekst.matchAll(PLEK)) {
    const waarde =
      typeof context === 'object' && context !== null ? (context as Record<string, unknown>)[plek[1]] : null
    if (typeof waarde !== 'string' || !waarde) return null
    stukken.push(tekst.slice(rest, plek.index), { waarde })
    rest = plek.index + plek[0].length
  }
  stukken.push(tekst.slice(rest))
  return stukken.filter((s) => s !== '')
}

/** De vraag zoals hij verstuurd wordt: een ingevulde waarde tussen «». */
export function alsTekst(stukken: Stuk[]): string {
  return stukken.map((s) => (typeof s === 'string' ? s : `«${s.waarde}»`)).join('')
}

/** «waarde» in een bericht als `<mark>`, zodat hij anders oogt dan wat er getypt is. */
export function ingevuldNaarHtml(tekst: string): string {
  return tekst.replace(/«([^«»\n]+)»/g, '<mark>$1</mark>')
}
