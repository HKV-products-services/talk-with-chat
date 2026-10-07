import { ArrowRightIcon, ChevronRightIcon, RefreshCcwIcon } from 'lucide-react'
import { useState } from 'react'

import { CopyButton } from '@/components/copy-button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Anything longer than a sentence is a provider dump, not a message a person
// reads at a glance; it moves behind the details toggle.
const SUMMARY_LENGTH = 140

/**
 * A run that failed.
 *
 * Talk with Optimalen: in de stijl van het dashboard (ISA-101). Een rustige kaart; kleur alleen in de
 * aanduiding: het alarm voor prioriteit hoog, een rood vierkant met kruis, met de tekst ernaast. De
 * melding van de server staat achter "Foutmelding"; opnieuw of verder staan waar het oog eindigt.
 */
export function ChatError({
  message,
  onRetry,
  onContinue,
}: {
  message: string
  onRetry: () => void
  onContinue: () => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const trimmed = message.trim()
  const firstLine = trimmed.split('\n')[0]
  // Only ellipsize when the first line itself was cut — appending one to a
  // sentence that already ended read as "Unavailable....".
  const summary = firstLine.length > SUMMARY_LENGTH ? firstLine.slice(0, SUMMARY_LENGTH).trimEnd() + '…' : firstLine
  // Compared against the summary, not the first line: a long single-line
  // provider dump has no newline to give it away, and keying off the line
  // alone hid Details on exactly the errors that needed it.
  const hasMore = trimmed !== summary

  return (
    <div role="alert" className="fout animate-message-in my-2">
      <div className="flex gap-3 p-4">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 shrink-0">
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" className="fout-vlak" />
          <path d="M5.2 5.2 L10.8 10.8 M10.8 5.2 L5.2 10.8" className="fout-teken" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Het antwoord kwam niet af</p>
          <p className="text-muted-foreground mt-1 text-sm break-words">
            {summary || 'Het model stopte zonder antwoord.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="nieuw-gesprek" onClick={onRetry}>
              <RefreshCcwIcon className="size-4" />
              Opnieuw
            </button>
            <button type="button" className="startvraag inline-flex items-center gap-1.5" onClick={onContinue}>
              <ArrowRightIcon className="size-4" />
              Ga verder
            </button>
          </div>
        </div>
      </div>

      {hasMore && (
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="text-muted-foreground hover:text-foreground group flex w-full items-center gap-1.5 border-t px-4 py-2 text-xs transition-colors">
            <ChevronRightIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
            Foutmelding
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="group/details relative border-t">
              <div className="absolute top-1.5 right-2 z-10 opacity-0 transition-opacity group-hover/details:opacity-100 focus-within:opacity-100">
                <CopyButton text={trimmed} label="Foutmelding kopiëren" />
              </div>
              <pre className="text-muted-foreground max-h-64 overflow-auto px-4 py-3 pr-11 font-mono text-xs break-words whitespace-pre-wrap">
                {trimmed}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
