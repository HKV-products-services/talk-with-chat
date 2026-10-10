/**
 * Een vaste of ingevulde waarde staat tussen «» (een term, een relatie, een keuze uit een lijst) en valt op: in een
 * bericht als `<mark>`, in een bewerkbaar veld met een markering erachter. Een startvraag vult `{sleutel}` in label of
 * vraag uit de context die de host doorgeeft (bijvoorbeeld de term die open staat), en zet de waarde tussen «».
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

/** Een tekst in stukken: gewone tekst, en «waarden» (met de tekens erbij, zoals ze in een veld staan). */
export function inStukken(tekst: string): Stuk[] {
  return tekst
    .split(/(«[^«»\n]+»)/)
    .filter(Boolean)
    .map((s) => (s.startsWith('«') && s.endsWith('»') ? { waarde: s } : s))
}
