/**
 * De tijdnotatie van talkwithoptimalen (issue #10): mensentaal, direct gevolgd door de absolute tijd
 * tussen dubbele blokhaken. "vannacht 1.00 [[2026-09-15T01:00]]", of een periode "[[van/tot]]".
 *
 * Dezelfde notatie als `tijdtaal.NOTATIE` in de server en `dashboard/src/tijdnotatie.ts`. Hier wordt
 * hij vóór de Markdown-weergave vervangen door `<time datetime>`, dat `Tijdstip` als klein klokje
 * toont (zie `markdown.tsx`); in een vervolgvraag staat alleen de mensentaal (zie `alsVeld`, `follow-ups.tsx`).
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

/** De tekst zonder haken: de mensentaal blijft staan. */
export function zonderNotatie(tekst: string): string {
  return tekst.replace(NOTATIE, '').replace(/[ \t]+([.,;:?!])/g, '$1').replace(/[ \t]{2,}/g, ' ').trim()
}

/**
 * Een vervolgvraag in een invoerveld toont alleen de mensentaal, zonder notatie en zonder klokje: wat
 * er staat, is wat er verstuurd wordt. De precisie gaat onzichtbaar mee, met één regel:
 * - onveranderd verstuurd: het voorstel mét `[[…]]`, dus met de absolute tijden;
 * - aangepast: precies de tekst in het veld. De chat leest "morgenochtend 7.00" dan vanaf het anker
 *   (T0 en de woordenlijst gaan verborgen mee), en de tekst die de gebruiker las gaat mee als context.
 * Zo kan een aangepaste tijd nooit botsen met een verborgen tijd erachter.
 */
export function alsVeld(vraag: string): string {
  return zonderNotatie(vraag)
}

export function teVersturen(voorstel: string, veld: string): string {
  return veld.trim() === alsVeld(voorstel).trim() ? voorstel.trim() : veld.trim()
}
