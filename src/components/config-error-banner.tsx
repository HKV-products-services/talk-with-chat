import { WifiOffIcon } from 'lucide-react'

import { RetryBanner } from '@/components/retry-banner'

/**
 * Shown when `/api/configure` cannot be reached. Without it the composer just
 * sits there with an empty model select and sending fails silently — this says
 * what is wrong and offers the one useful action.
 */
export function ConfigErrorBanner({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <RetryBanner
      icon={WifiOffIcon}
      onRetry={onRetry}
      disabled={isRetrying}
      retryLabel={isRetrying ? 'Opnieuw proberen…' : 'Opnieuw proberen'}
    >
      De server is niet bereikbaar; er is nog geen model.
    </RetryBanner>
  )
}
