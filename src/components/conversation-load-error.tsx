import { DatabaseBackupIcon } from 'lucide-react'

import { RetryBanner } from '@/components/retry-banner'

/**
 * Shown when a conversation's history could not be read from browser storage.
 *
 * The failure is almost always transient, and the messages are still there — so
 * this offers the read again rather than dropping the reader into what looks
 * like an empty chat. Sending stays blocked until it succeeds: a reply written
 * now would be saved over the history that failed to load.
 */
export function ConversationLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <RetryBanner icon={DatabaseBackupIcon} onRetry={onRetry} retryLabel="Opnieuw proberen">
      Dit gesprek kon niet uit de browser worden geopend. De berichten zijn nog bewaard; versturen staat stil, zodat
      een nieuw antwoord ze niet overschrijft.
    </RetryBanner>
  )
}
