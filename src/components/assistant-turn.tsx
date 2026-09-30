import type { ReactNode } from 'react'

/**
 * One assistant turn: an avatar gutter plus a single column holding everything
 * the agent produced — reasoning, tool cards, and the answer. Keeping the whole
 * turn in one column (rather than styling each part on its own) is what makes a
 * multi-step run read as a sequence instead of a pile of unrelated cards.
 *
 * While the turn is live the avatar pulses, so a long stretch of tool calls
 * with no prose still reads as "working" rather than "stuck".
 */
export function AssistantTurn({ children }: { children: ReactNode; isStreaming?: boolean }) {
  return (
    <div className="animate-message-in group/assistant flex w-full gap-3 py-3">
      {/* talkwithoptimalen: geen avatar naast het antwoord (rust); de tekst loopt op dezelfde lijn
          als de vraag en het invoerveld. Dat hij werkt, zeggen "Denkt na" en het bronnenkaartje. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
    </div>
  )
}
