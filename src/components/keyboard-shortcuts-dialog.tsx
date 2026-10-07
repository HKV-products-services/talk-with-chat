import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const IS_MAC = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')

const MOD = IS_MAC ? '⌘' : 'Ctrl'
const SHIFT = IS_MAC ? '⇧' : 'Shift'

const SHORTCUTS = [
  // macOS orders modifiers ⌃⌥⇧⌘ and writes them unseparated, so the Mac
  // spelling is ⇧⌘O rather than ⌘ShiftO.
  { id: 'new-chat', keys: IS_MAC ? [SHIFT, MOD, 'O'] : [MOD, SHIFT, 'O'], description: 'Nieuw gesprek' },
  { id: 'toggle-sidebar', keys: [MOD, 'B'], description: 'Gesprekken tonen of verbergen' },
  { id: 'shortcuts', keys: [MOD, '/'], description: 'Deze lijst tonen' },
  { id: 'send', keys: ['Enter'], description: 'Versturen' },
  { id: 'newline', keys: [SHIFT, 'Enter'], description: 'Nieuwe regel in het invoerveld' },
  { id: 'cancel-edit', keys: ['Esc'], description: 'Aanpassen annuleren' },
] as const

/**
 * The same binding spelled for a tooltip. One table behind both surfaces, so
 * the help dialog cannot advertise a shortcut the tooltip contradicts.
 */
export function shortcutLabel(id: (typeof SHORTCUTS)[number]['id']): string {
  const shortcut = SHORTCUTS.find((entry) => entry.id === id)
  return shortcut ? shortcut.keys.join(IS_MAC ? '' : '+') : ''
}

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The shortcuts exist either way; this makes them discoverable instead of
 * folklore. Reached with Cmd/Ctrl+/ or from the header.
 */
export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sneltoetsen</DialogTitle>
          <DialogDescription>Alles bereikbaar zonder muis.</DialogDescription>
        </DialogHeader>

        <dl className="divide-border divide-y">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.description} className="flex items-center justify-between gap-4 py-2">
              <dt className="text-sm">{shortcut.description}</dt>
              <dd className="flex shrink-0 items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-sans text-xs"
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
