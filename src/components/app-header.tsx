import { SquarePenIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import logoSvg from '@/assets/logo.svg'
import { KeyboardShortcutsDialog, shortcutLabel } from '@/components/keyboard-shortcuts-dialog'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useConversationIdFromUrl } from '@/hooks/useConversationIdFromUrl'
import { useConversationsState } from '@/hooks/useConversations'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { stripBasePath, withBasePath } from '@/lib/base-path'
import { startupConfig } from '@/lib/config'
import { conversationTitle } from '@/lib/conversation-title'

function startNewConversation() {
  // Already on a new chat: pushing again stacks identical `/` entries, and Back
  // then has to walk through every one of them before it appears to do
  // anything.
  if (stripBasePath(window.location.pathname) === '/') return
  window.history.pushState({}, '', withBasePath('/'))
  window.dispatchEvent(new Event('history-state-changed'))
}

// talkwithoptimalen: vanuit de lade van het dashboard naar de chat op volle pagina (?terug=…). Het
// adres gaat mee in deze sessie, ook als je daarna een nieuw gesprek begint (dat laat de query weg).
// Alleen een pad op dezelfde oorsprong, nooit een ander domein.
const TERUG = 'optimalen.terug'
function terugNaarDashboard(): string | null {
  if (typeof window === 'undefined' || window.self !== window.top) return null // in de lade: geen knop
  try {
    const terug = new URLSearchParams(window.location.search).get('terug')
    if (terug?.startsWith('/') && !terug.startsWith('//')) window.sessionStorage.setItem(TERUG, terug)
    return window.sessionStorage.getItem(TERUG) ?? '/'
  } catch {
    return '/'
  }
}

/**
 * Slim application bar above the conversation. It gives the chat a fixed
 * anchor: where you are (the conversation title), how to get out of a
 * collapsed sidebar, and the actions people reach for most.
 */
export function AppHeader() {
  const [conversationId] = useConversationIdFromUrl()
  const { conversations, loaded, failed } = useConversationsState()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const [terug] = useState(terugNaarDashboard)
  const current = conversations.find((entry) => entry.id === conversationId)
  const isNew = conversationId === '/'
  // Until the store has been read there is no entry to find, which is not the
  // same as the conversation having no name — resolving it early flashed
  // "Untitled chat" in the header and the tab on every reload. A read that
  // failed never resolves it either: the name is in the store and unreadable,
  // so the heading says the neutral thing it does know rather than asserting
  // the conversation is untitled, and the tab keeps the app's own title.
  const named = loaded && !failed
  const title = isNew ? 'Nieuw gesprek' : named ? conversationTitle(current) : failed ? 'Gesprek' : ''

  useDocumentTitle(isNew || !named ? null : title)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      // A modal owns the keyboard while it is up. Navigating out from under an
      // open dialog left it mounted over a conversation it no longer belonged
      // to, still holding a half-typed rename.
      const modalOpen = document.querySelector('[role="dialog"][data-state="open"]') !== null
      if (event.shiftKey && event.key.toLowerCase() === 'o') {
        if (modalOpen) return
        event.preventDefault()
        startNewConversation()
      } else if (event.key === '/') {
        event.preventDefault()
        // Still closes its own dialog; it just cannot open on top of another.
        setShortcutsOpen((open) => (open ? false : !modalOpen))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // talkwithoptimalen: een rustige kop zoals het dashboard (naar america.gov): woordmerk, de titel van
  // het gesprek klein in het midden, en "Nieuw gesprek". Geen rand, geen thema- of sneltoetsknop
  // (de sneltoetsen werken nog; het thema volgt het systeem).
  return (
    <header className="bg-background/90 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 px-4 backdrop-blur-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1" />
        </TooltipTrigger>
        <TooltipContent>Gesprekken &middot; {shortcutLabel('toggle-sidebar')}</TooltipContent>
      </Tooltip>

      <button type="button" className="woordmerk" onClick={startNewConversation}>
        <img src={logoSvg} alt="" className="size-6" />
        <span>{startupConfig.naam}</span>
      </button>

      <div className="min-w-0 flex-1 text-center">
        {/* The app's h1: without it the document outline started at h2 on any
            open conversation. */}
        <h1 className="text-muted-foreground truncate text-[15px] font-normal" title={title}>
          {isNew ? '' : title}
        </h1>
      </div>

      {terug && (
        <a className="terug-dashboard" href={terug}>
          ← Dashboard
        </a>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="nieuw-gesprek" onClick={startNewConversation}>
            <SquarePenIcon className="size-4" />
            <span className="hidden sm:inline">Nieuw gesprek</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>Nieuw gesprek &middot; {shortcutLabel('new-chat')}</TooltipContent>
      </Tooltip>

      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </header>
  )
}
