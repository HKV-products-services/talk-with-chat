import { NOTATIE } from '@/lib/tijdnotatie'
import type { ConversationEntry } from '@/types'

const UNTITLED = 'Nieuw gesprek'

/**
 * Display name for a conversation: the name the user gave it, else the opening
 * message it was derived from. Every surface that shows a conversation (sidebar
 * row, header, tab title, delete confirmation) goes through here so a rename
 * lands everywhere at once.
 */
export function conversationTitle(entry: Pick<ConversationEntry, 'title' | 'firstMessage'> | undefined): string {
  return namedTitle(entry) || UNTITLED
}

/**
 * talkwithoptimalen: de naam of de eerste vraag, leeg als er nog geen van beide is. De kop en de tab tonen
 * dan niets, in plaats van "Nieuw gesprek" boven een gesprek dat nog moet beginnen.
 */
export function namedTitle(entry: Pick<ConversationEntry, 'title' | 'firstMessage'> | undefined): string {
  const title = entry?.title?.trim()
  if (title) return title
  // Blank counts as absent, matching the `title` branch above. `??` here let an
  // empty first message through, so every surface rendered an empty name.
  // talkwithoptimalen: zonder de tijdnotatie `[[…]]`; een titel is platte tekst.
  const firstMessage = entry?.firstMessage
    ?.replace(NOTATIE, '')
    .replace(/\s+([?.!,])/g, '$1')
    .trim()
  return firstMessage ?? ''
}
