import type { ReactNode } from 'react'

import { startupConfig } from '@/lib/config'
import { alsTekst, vul } from '@/lib/ingevuld'

interface WelcomeScreenProps {
  onSelect: (prompt: string) => void
  /** Wat de pagina eromheen doorgeeft; vult `{sleutel}` in de startvragen. */
  context: unknown
  /** The composer, rendered inline so an empty chat opens on one centred column. */
  composer?: ReactNode
}

/**
 * First-run view for an empty conversation. An empty chat with only a text box
 * gives no sense of what the agent is for, so this states the purpose, puts the
 * composer where the eye already is, and offers a few one-click ways in.
 */
export function WelcomeScreen({ onSelect, context, composer }: WelcomeScreenProps) {
  // Talk with Optimalen: titel, zin en startvragen van deze chat (OptiMalen of de kennisbank)
  const { titel, zin, vragen } = startupConfig.welkom
  return (
    // The padding sits on the children rather than here: the composer brings its
    // own, and the same box it occupies on this screen it occupies once the
    // conversation starts — otherwise it visibly narrowed on the first send.
    <div className="animate-fade-in mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      {/* h2: the header's conversation title is the page's h1. */}
      <h2 className="welkom-titel px-4 text-balance">{titel}</h2>
      <p className="text-muted-foreground mt-3 max-w-xl px-4 text-lg">{zin}</p>

      {composer && <div className="mt-9 w-full">{composer}</div>}

      <ul className="mt-6 flex flex-wrap justify-center gap-2 px-4">
        {vragen.map((suggestion) => {
          // een vraag met een waarde die de pagina nu niet heeft (geen term open), staat er niet
          const label = vul(suggestion.label, context)
          const prompt = vul(suggestion.prompt, context)
          if (!label || !prompt) return null
          return (
            <li key={suggestion.label}>
              <button
                type="button"
                onClick={() => {
                  onSelect(alsTekst(prompt))
                }}
                className="startvraag"
              >
                {label.map((s, i) =>
                  typeof s === 'string' ? (
                    s
                  ) : (
                    <mark key={i} className="ingevuld">
                      {s.waarde}
                    </mark>
                  ),
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
