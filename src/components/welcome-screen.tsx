import type { ReactNode } from 'react'

import { startupConfig } from '@/lib/config'

interface WelcomeScreenProps {
  onSelect: (prompt: string) => void
  /** The composer, rendered inline so an empty chat opens on one centred column. */
  composer?: ReactNode
}

/**
 * First-run view for an empty conversation. An empty chat with only a text box
 * gives no sense of what the agent is for, so this states the purpose, puts the
 * composer where the eye already is, and offers a few one-click ways in.
 */
export function WelcomeScreen({ onSelect, composer }: WelcomeScreenProps) {
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
        {vragen.map((suggestion) => (
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
