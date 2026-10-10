import { inStukken } from '@/lib/ingevuld'
import { cn } from '@/lib/utils'

/**
 * De markering van vaste of ingevulde waarden achter een tekstveld, dat zelf geen opmaak kan tonen: dezelfde tekst in
 * dezelfde cel, onzichtbaar, met alleen de achtergrond van de waarden. Maten (lettertype, regelhoogte, opvulling) komen
 * uit `className`, gelijk aan die van het veld.
 */
export function Markering({ tekst, waarden, className }: { tekst: string; waarden: string[]; className: string }) {
  return (
    <div aria-hidden className={cn('markering-achter', className)}>
      {inStukken(tekst, waarden).map((s, i) => (typeof s === 'string' ? s : <mark key={i}>{s.waarde}</mark>))}
      {'\u200b'}
    </div>
  )
}
