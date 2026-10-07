import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToolFilters } from '@/contexts/tool-filters'
import { XIcon } from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'

interface ToolFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolFiltersDialog({ open, onOpenChange }: ToolFiltersDialogProps) {
  const { filters, addFilter, removeFilter } = useToolFilters()
  const [draft, setDraft] = useState('')

  const submit = (e: SyntheticEvent) => {
    e.preventDefault()
    addFilter(draft)
    setDraft('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verborgen tools</DialogTitle>
          <DialogDescription>Verberg toolkaarten op naam of patroon, bijvoorbeeld sql_* of sparql.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Er is nog niets verborgen. Voeg hieronder een toolnaam of patroon toe.
            </p>
          ) : (
            filters.map((filter) => (
              <div key={filter} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5">
                <span className="font-mono text-sm">{filter}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  aria-label={`${filter} weer tonen`}
                  onClick={() => {
                    removeFilter(filter)
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <form className="flex items-center gap-2" onSubmit={submit}>
          <Input
            value={draft}
            placeholder="Toolnaam of patroon (bijv. sql_*)"
            onChange={(e) => {
              setDraft(e.target.value)
            }}
          />
          <Button type="submit" disabled={draft.trim() === ''}>
            Toevoegen
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
