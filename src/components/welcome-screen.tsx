import { ActivityIcon, GaugeIcon, MapPinIcon, WrenchIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import logoSvg from '@/assets/logo.svg'

export interface Suggestion {
  icon: LucideIcon
  label: string
  prompt: string
}

// Talk with Optimalen: startvragen over de vijf vaste vergelijkingen. Open eindigende prompts (zonder
// vraagteken) worden in het invoerveld gezet om af te maken; de rest is een hele vraag.
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    icon: GaugeIcon,
    label: 'Planning en inzet',
    prompt: 'Waar week de gedraaide inzet de afgelopen twee weken af van de planning, en waarom?',
  },
  {
    icon: ActivityIcon,
    label: 'Herplanning',
    prompt:
      'Hoe veranderde de planning voor 9 september 20:00-23:00 tussen de runs, en welke invoer veroorzaakte dat?',
  },
  { icon: WrenchIcon, label: 'Ingrepen', prompt: 'Welke ingrepen deden de beheerders, en met welke reden?' },
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
      <img src={logoSvg} alt="" className="mb-5 size-11" />
      {/* h2: the header's conversation title is the page's h1. */}
      <h2 className="px-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Waar wil je naar kijken?</h2>
      <p className="text-muted-foreground mt-2 max-w-md px-4 text-sm text-balance">
        Duid de pompplanning: wat was er gepland, wat draaide er, en waarom. Je ziet welke query de agent draait.
      </p>

      {composer && <div className="mt-7 w-full">{composer}</div>}

      <ul className="mt-5 flex flex-wrap justify-center gap-2 px-4">
        {suggestions.map((suggestion) => (
          <li key={suggestion.label}>
            <button
              type="button"
              onClick={() => {
                onSelect(suggestion.prompt)
              }}
              className="text-muted-foreground hover:border-primary/40 hover:bg-accent/50 hover:text-foreground focus-visible:ring-ring flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <suggestion.icon className="text-primary size-3.5" />
              {suggestion.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
