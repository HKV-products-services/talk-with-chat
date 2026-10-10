import { ClockIcon } from 'lucide-react'
import { type ComponentProps } from 'react'

import { Response } from '@/components/ai-elements/response'
import { rehypePlugins } from '@/lib/markdown-plugins'
import { ingevuldNaarHtml } from '@/lib/ingevuld'
import { notatieNaarHtml, tijdLabel } from '@/lib/tijdnotatie'

/**
 * Model-authored markdown, rendered the way this app renders it.
 *
 * A thin wrapper over the vendored `Response` so the corrected rehype pipeline
 * (see `lib/markdown-plugins.ts`) is not something each call site has to
 * remember — a message rendered through the bare primitive would silently go
 * back to garbled math.
 *
 * `rehypePlugins` is off the prop list on purpose: Streamdown replaces the list
 * wholesale, so a call site passing its own would drop sanitisation from a
 * component that renders untrusted model output. Rejecting it at the type level
 * keeps that from being a thing anyone can do by accident.
 *
 * talkwithoptimalen: een tijd in de notatie `[[…]]` wordt vóór de Markdown een
 * `<time datetime>`, dat `Tijdstip` als klein klokje toont; een vaste of ingevulde waarde
 * tussen «» een `<mark>`.
 */
export function Markdown({ children, components, ...props }: Omit<ComponentProps<typeof Response>, 'rehypePlugins'>) {
  return (
    <Response {...props} components={{ ...components, time: Tijdstip }} rehypePlugins={rehypePlugins}>
      {typeof children === 'string' ? notatieNaarHtml(ingevuldNaarHtml(children)) : children}
    </Response>
  )
}

/**
 * Een tijd van het model: een klokje direct na de mensentaal, met de absolute tijd als tooltip bij hover
 * én focus (Tab), en als aria-label voor een schermlezer.
 */
function Tijdstip({ dateTime }: { dateTime?: string }) {
  const label = dateTime ? tijdLabel(dateTime) : null
  if (!dateTime || label === null) return null
  return (
    <time
      dateTime={dateTime}
      tabIndex={0}
      aria-label={label}
      data-tijd={label}
      className="tijdstip text-muted-foreground hover:text-plan focus-visible:text-plan focus-visible:outline-plan relative ml-0.5 inline-flex cursor-help rounded-sm align-[-1px] focus-visible:outline-2"
    >
      <ClockIcon className="size-3" aria-hidden />
    </time>
  )
}
