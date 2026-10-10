import {
  ArrowRightIcon,
  ArrowUpIcon,
  CircleHelpIcon,
  GitCompareArrowsIcon,
  LinkIcon,
  PencilIcon,
  RotateCcwIcon,
  SearchIcon,
  type LucideIcon,
} from 'lucide-react'
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

import { startupConfig, type Icoon } from '@/lib/config'
import { isRecord } from '@/lib/is-record'
import { Markering } from '@/components/markering'
import { metTekens, zonderTekens } from '@/lib/ingevuld'
import { alsVeld } from '@/lib/tijdnotatie'
import { cn } from '@/lib/utils'

/** Naam van de output-functie van de agent die het antwoord met vervolgvragen afsluit. */
export const FOLLOW_UPS_TOOL = startupConfig.vervolgopties.tool

const ICONEN: Record<Icoon, LucideIcon> = {
  zoeken: SearchIcon,
  vergelijken: GitCompareArrowsIcon,
  verklaren: ArrowRightIcon,
  onderbouwen: CircleHelpIcon,
  verbeteren: PencilIcon,
  verbinden: LinkIcon,
}

// Vaste volgorde en een vast icoon per soort, uit de configuratie van de app: de gebruiker leert zo
// waar elke optie heen gaat. Dezelfde soorten als in de instructies van de agent.
const KINDS = startupConfig.vervolgopties.soorten.map((s) => ({
  key: s.sleutel,
  label: s.label,
  icon: ICONEN[s.icoon],
}))

interface FollowUpsProps {
  input: unknown
  /** Verstuurt de vraag, zoals hij er na eventueel aanpassen staat. */
  onSubmit: (prompt: string) => void
  /** Alleen de opties onder het laatste antwoord zijn te bewerken en te versturen. */
  active: boolean
}

export function FollowUps({ input, onSubmit, active }: FollowUpsProps) {
  const options = KINDS.flatMap((kind) => {
    const value = isRecord(input) ? input[kind.key] : undefined
    return typeof value === 'string' && value.trim() !== '' ? [{ ...kind, prompt: value.trim() }] : []
  })
  // Tijdens het streamen komen de velden één voor één binnen; toon niets half.
  if (options.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Verder vragen</p>
      <ul className="flex flex-col gap-2">
        {options.map((option) => (
          <li key={option.key}>
            <FollowUpField
              label={option.label}
              icon={option.icon}
              prompt={option.prompt}
              active={active}
              onSubmit={onSubmit}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

interface FollowUpFieldProps {
  label: string
  icon: LucideIcon
  prompt: string
  active: boolean
  onSubmit: (prompt: string) => void
}

/**
 * Eén vervolgvraag als bewerkbaar veld: de tekst van de agent is een voorstel, geen
 * knoplabel. Een tijdstip of gemaal aanpassen gebeurt ter plekke, zonder de vraag over
 * te typen of naar het invoerveld te verplaatsen.
 */
function FollowUpField({ label, icon: Icon, prompt, active, onSubmit }: FollowUpFieldProps) {
  // `undefined` zolang er niet bewerkt is, zodat een voorstel dat nog binnenstreamt
  // gewoon doorloopt in het veld in plaats van op de eerste letters te bevriezen.
  // talkwithoptimalen: het veld toont alleen de mensentaal; onveranderd verstuurd gaat de notatie
  // `[[…]]` mee, aangepast precies wat er staat.
  // en zonder de tekens «»: een vaste waarde valt op met de markering achter het veld
  const { tekst: weergave, waarden } = zonderTekens(alsVeld(prompt))
  const [draft, setDraft] = useState<string | undefined>(undefined)
  const value = draft ?? weergave
  const edited = draft !== undefined && draft !== weergave
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Het veld groeit mee met de tekst, zodat een lange vraag niet in een scrollvak verdwijnt.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const submit = () => {
    if (!active || value.trim() === '') return
    onSubmit(value === weergave ? prompt : metTekens(value, waarden))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Zelfde toetsen als het invoerveld: Enter verstuurt, Shift+Enter is een nieuwe regel.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    } else if (e.key === 'Escape' && edited) {
      e.preventDefault()
      setDraft(undefined)
    }
  }

  // Zelfde vorm als in het dashboard (Duiding.tsx): het label erboven, daaronder één invoervak met de
  // knop erin, zoals een zoekbalk, zodat zonder uitleg te zien is dat de vraag aan te passen is.
  return (
    <div className={cn('flex flex-col gap-1', !active && 'opacity-70')}>
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
        <Icon className="text-plan size-3.5 shrink-0" aria-hidden />
        {label}
        {edited && <span className="text-plan font-normal">· aangepast</span>}
      </span>
      <div
        onClick={() => {
          textareaRef.current?.focus()
        }}
        className={cn(
          'bg-veld border-veld-rand flex cursor-text items-end gap-1.5 rounded-lg border py-1.5 pr-1.5 pl-2.5 text-sm shadow-[inset_0_1px_2px_rgb(11_11_11/0.06)] transition-[border-color,box-shadow]',
          active &&
            'hover:border-muted-foreground focus-within:border-plan focus-within:ring-plan/15 focus-within:ring-3',
          edited && 'border-plan',
        )}
      >
        <div className="veldmarkering">
          <Markering tekst={value} waarden={waarden} className="py-0.5 leading-6" />
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            readOnly={!active}
            aria-label={`${label}: vervolgvraag, aan te passen voor versturen`}
            onChange={(e) => {
              setDraft(e.target.value)
            }}
            onKeyDown={onKeyDown}
            className={cn(
              'min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-0.5 leading-6 outline-none',
              !active && 'cursor-default',
            )}
          />
        </div>
        {active && (
          <div className="flex shrink-0 items-center gap-1">
            {edited && (
              <button
                type="button"
                onClick={() => {
                  setDraft(undefined)
                }}
                aria-label={`${label}: terug naar het voorstel`}
                title="Terug naar het voorstel (Esc)"
                className="text-muted-foreground hover:text-foreground bg-muted flex size-7 cursor-pointer items-center justify-center rounded-md border transition-colors"
              >
                <RotateCcwIcon className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={value.trim() === ''}
              aria-label={`${label}: versturen`}
              title="Versturen (Enter)"
              className={cn(
                'flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-default disabled:opacity-40',
                edited ? 'bg-plan text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              <ArrowUpIcon className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
