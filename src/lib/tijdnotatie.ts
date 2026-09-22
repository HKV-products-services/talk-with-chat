/**
 * De tijdnotatie van talkwithoptimalen (issue #10): mensentaal, direct gevolgd door de absolute tijd
 * tussen dubbele blokhaken. "vannacht 1.00 [[2026-09-15T01:00]]", of een periode "[[van/tot]]".
 *
 * Dezelfde notatie als `tijdtaal.NOTATIE` in de server en `dashboard/src/tijdnotatie.ts`. Hier wordt
 * hij vóór de Markdown-weergave vervangen door `<time datetime>`, dat `Tijdstip` als klein klokje
 * toont (zie `markdown.tsx`); in een vervolgvraag wordt hij een klokteken (zie `follow-ups.tsx`).
 */

export const NOTATIE = /\[\[([^[\]]*)\]\]/g
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/
const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const DAGEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

const twee = (n: number) => String(n).padStart(2, '0')
const dag = (d: Date) => `${DAGEN[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()]}`
const uur = (d: Date) => `${twee(d.getHours())}:${twee(d.getMinutes())}`

/** De absolute tijd voor de tooltip: "di 15 sep 01:00", of "di 15 sep 01:00–05:00". Null: geen tijd. */
export function tijdLabel(inhoud: string): string | null {
  const delen = inhoud.split('/').map((d) => d.trim())
  if (delen.length > 2 || !delen.every((d) => ISO.test(d))) return null
  const [van, tot] = [delen[0], delen[delen.length - 1]].map((d) => new Date(d.slice(0, 16)))
  if (Number.isNaN(van.getTime()) || Number.isNaN(tot.getTime()) || tot < van) return null
  if (tot.getTime() === van.getTime()) return `${dag(van)} ${uur(van)}`
  return dag(van) === dag(tot)
    ? `${dag(van)} ${uur(van)}–${uur(tot)}`
    : `${dag(van)} ${uur(van)} – ${dag(tot)} ${uur(tot)}`
}

/** Markdown met de notatie vervangen door `<time datetime="…"></time>`; de haken ziet de lezer nooit. */
export function notatieNaarHtml(tekst: string): string {
  return tekst.replace(NOTATIE, (heel, inhoud: string) =>
    tijdLabel(inhoud) === null ? heel : `<time datetime="${inhoud.trim()}"></time>`,
  )
}

// Een eigen klokteken per tijd (🕐, 🕑 …): verwijdert de gebruiker er één, dan weten we welke.
const KLOKKEN = Array.from({ length: 12 }, (_, i) => String.fromCodePoint(0x1f550 + i))

/** Een vervolgvraag zoals het invoerveld hem toont: elke notatie een klokteken, met de tijden. */
export function naarVeld(vraag: string): { weergave: string; tijden: Map<string, string>; uitleg: string } {
  const tijden = new Map<string, string>()
  const uitleg: string[] = []
  const weergave = vraag.replace(NOTATIE, (heel, inhoud: string) => {
    const label = tijdLabel(inhoud)
    const klok = KLOKKEN[tijden.size] as string | undefined
    if (label === null || klok === undefined) return heel
    tijden.set(klok, heel)
    uitleg.push(`${klok} ${label}`)
    return klok
  })
  return { weergave, tijden, uitleg: uitleg.join(' · ') }
}

/** Terug naar de notatie: elk klokteken dat er nog staat, wordt weer zijn `[[…]]`. */
export function uitVeld(weergave: string, tijden: Map<string, string>): string {
  let uit = weergave
  for (const [klok, notatie] of tijden) uit = uit.replace(klok, notatie)
  return uit
}
