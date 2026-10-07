import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GitForkIcon, PenLineIcon } from 'lucide-react'

interface EditMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onModify: () => void
  onFork: () => void
}

export function EditMessageDialog({ open, onOpenChange, onModify, onFork }: EditMessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Vraag aanpassen</DialogTitle>
          <DialogDescription>Wat wil je met de aangepaste vraag doen?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start gap-3 h-auto py-3 px-4" onClick={onModify}>
            <PenLineIcon className="size-4 shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Gesprek bijwerken</span>
              <span className="text-xs text-muted-foreground">Vervang deze vraag en krijg een nieuw antwoord</span>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-auto py-3 px-4" onClick={onFork}>
            <GitForkIcon className="size-4 shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Nieuw gesprek vanaf hier</span>
              <span className="text-xs text-muted-foreground">Begin een nieuw gesprek vanaf deze vraag</span>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Annuleren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
