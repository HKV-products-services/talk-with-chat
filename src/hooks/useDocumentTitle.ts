import { useEffect } from 'react'

import { startupConfig } from '@/lib/config'

// Talk with Optimalen: de naam van deze chat (OptiMalen of de kennisbank), niet de <title> van de pagina.
const BASE_TITLE = startupConfig.naam

/**
 * Reflect the active conversation in the tab title, so several agent runs open
 * side by side stay tellable apart.
 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
  }, [title])
}
