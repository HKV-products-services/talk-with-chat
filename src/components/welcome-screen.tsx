import { ActivityIcon, GaugeIcon, MapPinIcon, WrenchIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface Suggestion {
  icon: LucideIcon
  label: string
  prompt: string
}

// Talk with Optimalen: startvragen over de vaste vergelijkingen. Open eindigende prompts (zonder
// vraagteken) worden in het invoerveld gezet om af te maken; de rest is een hele vraag.
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    icon: GaugeIcon,
    label: 'Planning en inzet',
    prompt: 'Waar week de gedraaide inzet de afgelopen twee weken af van de planning, en waarom?',
  },
  {
    icon: ActivityIcon,
    label: 'Controle',
    prompt: 'Waarom zou de controle van 9 september 22:00 anders kiezen dan de goedgekeurde planning?',
  },
  { icon: WrenchIcon, label: 'Pompmodes', prompt: 'Welke pompen stonden niet op OptiMalen, en met welke reden?' },
  {
    icon: MapPinIcon,
    label: 'Gebiedsregeling',
    prompt: 'Wat deed OptiMalen anders dan de gebiedsregeling in de eerste dagen van september?',
  },
]

interface WelcomeScreenProps {
  onSelect: (prompt: string) => void
  /** The composer, rendered inline so an empty chat opens on one centred column. */
  composer?: ReactNode
  suggestions?: Suggestion[]
}

/**
 * First-run view for an empty conversation. An empty chat with only a text box
 * gives no sense of what the agent is for, so this states the purpose, puts the
 * composer where the eye already is, and offers a few one-click ways in.
 */
export function WelcomeScreen({ onSelect, composer, suggestions = DEFAULT_SUGGESTIONS }: WelcomeScreenProps) {
  return (
    // The padding sits on the children rather than here: the composer brings its
    // own, and the same box it occupies on this screen it occupies once the
    // conversation starts — otherwise it visibly narrowed on the first send.
    <div className="animate-fade-in mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      {/* h2: the header's conversation title is the page's h1. */}
      <h2 className="welkom-titel px-4 text-balance">Waar wil je naar kijken?</h2>
      <p className="text-muted-foreground mt-3 max-w-xl px-4 text-lg">
        Vraag wat er gepland was, wat de gemalen deden, en waarom.
      </p>

      {composer && <div className="mt-9 w-full">{composer}</div>}

      <ul className="mt-6 flex flex-wrap justify-center gap-2 px-4">
        {suggestions.map((suggestion) => (
          <li key={suggestion.label}>
            <button
              type="button"
              onClick={() => {
                onSelect(suggestion.prompt)
              }}
              className="startvraag"
            >
              {suggestion.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
