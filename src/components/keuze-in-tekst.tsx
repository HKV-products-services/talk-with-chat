import { cn } from '@/lib/utils'

/** Een vaste waarde in een zin als keuzelijst, in de stijl van de markering. */
export function KeuzeInTekst({
  waarde,
  opties,
  onKies,
  uit = false,
  label,
}: {
  waarde: string
  opties: string[]
  onKies: (waarde: string) => void
  uit?: boolean
  label: string
}) {
  return (
    <select
      className={cn('keuze-in-tekst', uit && 'cursor-default')}
      value={waarde}
      disabled={uit}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
      }}
      onChange={(e) => {
        onKies(e.target.value)
      }}
    >
      {(opties.includes(waarde) ? opties : [waarde, ...opties]).map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
