/**
 * Een vaste of ingevulde waarde staat in de tekst tussen «» (een term, een relatie, een keuze uit een lijst). Die tekens
 * zie je niet: de waarde valt op met een markering, in een bericht als `<mark>`, in een bewerkbaar veld met een laag
 * erachter. Een startvraag vult `{sleutel}` in label of vraag uit de context die de host doorgeeft (bijvoorbeeld de term
 * die open staat).
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

const GEMARKEERD = /«([^«»\n]+)»/g

/** «waarde» in een bericht als `<mark>`, zodat hij anders oogt dan gewone tekst. */
export function ingevuldNaarHtml(tekst: string): string {
  return tekst.replace(GEMARKEERD, '<mark>$1</mark>')
}

/** De tekst zonder «», zoals hij in een veld staat, met de waarden die ertussen stonden. */
export function zonderTekens(tekst: string): { tekst: string; waarden: string[] } {
  const waarden = [...new Set([...tekst.matchAll(GEMARKEERD)].map((m) => m[1]))]
  return { tekst: tekst.replace(GEMARKEERD, '$1'), waarden }
}

// de waarden als één patroon, de langste eerst, zodat «soort van» niet als «soort» wordt herkend
const patroon = (waarden: string[]) =>
  new RegExp(
    [...waarden]
      .sort((a, b) => b.length - a.length)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    'g',
  )

/** De waarden weer tussen «», waar ze nog in de tekst staan: zo blijft een aangepaste vraag gemarkeerd. */
export function metTekens(tekst: string, waarden: string[]): string {
  return waarden.length ? tekst.replace(patroon(waarden), '«$&»') : tekst
}

/** Een tekst in stukken: gewone tekst en de waarden, voor de markering achter een veld. */
export function inStukken(tekst: string, waarden: string[]): Stuk[] {
  if (!waarden.length) return [tekst]
  const waarde = new Set(waarden)
  return tekst
    .split(new RegExp(`(${patroon(waarden).source})`))
    .filter(Boolean)
    .map((s) => (waarde.has(s) ? { waarde: s } : s))
}
