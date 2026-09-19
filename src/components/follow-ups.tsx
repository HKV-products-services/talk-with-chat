import {
  ArrowRightIcon,
  ArrowUpIcon,
  GitCompareArrowsIcon,
  RotateCcwIcon,
  SearchIcon,
  type LucideIcon,
} from 'lucide-react'
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

import { isRecord } from '@/lib/is-record'
import { cn } from '@/lib/utils'

/** Naam van de output-functie in `talkwithoptimalen.agent`. */
export const FOLLOW_UPS_TOOL = 'vervolgopties'

type KindKey = 'inzoomen' | 'vergelijken' | 'verklaren'

interface Kind {
  key: KindKey
  label: string
  icon: LucideIcon
}

// Vaste volgorde en een vast icoon per soort: de gebruiker leert zo dat de eerste
// optie altijd dieper gaat, de tweede altijd naast iets anders legt, de derde naar het
// waarom vraagt. Dezelfde drie soorten als in de instructies van de agent.
const KINDS: Kind[] = [
  { key: 'inzoomen', label: 'Inzoomen', icon: SearchIcon },
  { key: 'vergelijken', label: 'Vergelijken', icon: GitCompareArrowsIcon },
  { key: 'verklaren', label: 'Verklaren', icon: ArrowRightIcon },
]

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
  const [draft, setDraft] = useState<string | undefined>(undefined)
  const value = draft ?? prompt
  const edited = draft !== undefined && draft !== prompt
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
    onSubmit(value.trim())
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

  return (
    <div
      className={cn(
        'group/followup flex items-start gap-2.5 rounded-xl border px-3.5 py-2 text-sm transition-colors',
        active
          ? 'focus-within:border-primary/50 focus-within:ring-primary/20 hover:border-primary/40 focus-within:ring-2'
          : 'text-muted-foreground opacity-70',
        edited && 'border-primary/40 bg-accent/30',
      )}
    >
      <Icon className="text-primary mt-1.5 size-4 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-muted-foreground pt-1 text-xs font-medium">
          {label}
          {edited && <span className="text-primary ml-1.5">· aangepast</span>}
        </span>
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
            'w-full resize-none overflow-hidden bg-transparent py-0.5 leading-6 outline-none',
            !active && 'cursor-default',
          )}
        />
      </div>
      {active && (
        <div className="flex shrink-0 items-center gap-1 self-center">
          {edited && (
            <button
              type="button"
              onClick={() => {
                setDraft(undefined)
              }}
              aria-label={`${label}: terug naar het voorstel`}
              title="Terug naar het voorstel (Esc)"
              className="text-muted-foreground hover:text-foreground hover:bg-accent flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
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
              'flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-default disabled:opacity-40',
              edited
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground border',
            )}
          >
            <ArrowUpIcon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
