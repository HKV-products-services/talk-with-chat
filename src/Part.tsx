import { Markdown } from '@/components/markdown'
import { CheckIcon, PencilIcon, RefreshCcwIcon, XIcon } from 'lucide-react'
import type { ChatAddToolApproveResponseFunction, UIDataTypes, UIMessagePart, UITools, UIMessage } from 'ai'
import { useEffect, useState } from 'react'
import { CopyButton } from '@/components/copy-button'
import { FOLLOW_UPS_TOOL, FollowUps } from '@/components/follow-ups'
import { ForkNavigation } from '@/components/fork-navigation'
import { MessageAction } from '@/components/message-action'
import { MessageUsage } from '@/components/message-usage'
import { ReasoningBlock } from '@/components/reasoning-block'
import { ToolPart } from '@/components/tool-part'
import { UserBubble } from '@/components/user-bubble'
import { toolNameOfPart } from '@/lib/tool-filters'

interface PartProps {
  part: UIMessagePart<UIDataTypes, UITools>
  message: UIMessage
  status: string
  regen: (id: string) => void
  index: number
  lastMessage: boolean
  onApprovalResponse: ChatAddToolApproveResponseFunction
  isEditing?: boolean
  editDraft?: string
  onStartEdit?: (messageId: string) => void
  onCancelEdit?: (messageId: string, draft: string) => void
  onSubmitEdit?: (messageId: string, newText: string) => void
  conversationId?: string
  messageIndex?: number
  onNavigateToFork?: (conversationId: string) => void
  /** Verstuurt een gekozen vervolgoptie als nieuw bericht. */
  onFollowUp?: (prompt: string) => void
}

export function Part({
  part,
  message,
  status,
  regen,
  index,
  lastMessage,
  onApprovalResponse,
  isEditing,
  editDraft,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  conversationId,
  messageIndex,
  onNavigateToFork,
  onFollowUp,
}: PartProps) {
  const [editText, setEditText] = useState('')

  // Intentionally deps on [isEditing] only — we want to initialize editText
  // from draft/part.text only when entering edit mode, not on subsequent changes
  useEffect(() => {
    if (isEditing && part.type === 'text') {
      setEditText(editDraft ?? part.text)
    }
  }, [isEditing])

  if (part.type === 'text') {
    if (message.role === 'user' && isEditing) {
      return (
        <div className="py-3">
          <UserBubble className="w-full max-w-full sm:max-w-full">
            <textarea
              className="min-h-[60px] w-full resize-none bg-transparent text-sm outline-none"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSubmitEdit?.(message.id, editText)
                } else if (e.key === 'Escape') {
                  onCancelEdit?.(message.id, editText)
                }
              }}
              autoFocus
            />
          </UserBubble>
          <div className="mt-1 flex items-center justify-end gap-0.5">
            <MessageAction
              label="Submit edit"
              onClick={() => {
                onSubmitEdit?.(message.id, editText)
              }}
              className="text-primary hover:text-primary"
            >
              <CheckIcon className="size-3.5" />
            </MessageAction>
            <MessageAction
              label="Cancel edit"
              onClick={() => {
                onCancelEdit?.(message.id, editText)
              }}
              className="text-destructive hover:text-destructive"
            >
              <XIcon className="size-3.5" />
            </MessageAction>
          </div>
        </div>
      )
    }

    if (message.role === 'user') {
      return (
        <div className="py-3">
          <UserBubble>
            <Markdown>{part.text}</Markdown>
          </UserBubble>
          {/* `-mr-[7px]` undoes the icon buttons' own padding — a `size-7`
              button around a `size-3.5` icon insets the glyph 7px — so the last
              icon lines up with the bubble's right edge instead of floating
              inside it. */}
          {index === message.parts.length - 1 && (
            <div className="mt-1 -mr-[7px] flex items-center justify-end gap-0.5">
              {status !== 'submitted' && status !== 'streaming' && (
                <>
                  <MessageAction
                    label="Edit message"
                    onClick={() => {
                      onStartEdit?.(message.id)
                    }}
                  >
                    <PencilIcon className="size-3.5" />
                  </MessageAction>
                  <CopyButton text={part.text} label="Copy message" />
                </>
              )}
              {conversationId && messageIndex !== undefined && onNavigateToFork && (
                <ForkNavigation
                  conversationId={conversationId}
                  messageIndex={messageIndex}
                  onNavigate={onNavigateToFork}
                />
              )}
            </div>
          )}
        </div>
      )
    }

    // Assistant prose runs full width with no bubble: tool cards, code blocks
    // and tables in the same turn then share one column and one measure.
    return (
      <div>
        {/* `h-auto` overrides the vendored Response's `size-full`, which stretched
            inside this flex column and pushed the actions row out of the turn. */}
        <Markdown className="h-auto text-[0.9375rem] leading-7">{part.text}</Markdown>
        {/* `-ml-[7px]`: same correction as the user row, mirrored — the copy
            glyph sits on the same left edge as the prose above it. */}
        {index === message.parts.length - 1 && (
          <div className="mt-1 -ml-[7px] flex items-center gap-0.5">
            <CopyButton text={part.text} label="Copy response" />
            <MessageAction
              label="Regenerate response"
              onClick={() => {
                regen(message.id)
              }}
            >
              <RefreshCcwIcon className="size-3.5" />
            </MessageAction>
            <MessageUsage message={message} />
          </div>
        )}
      </div>
    )
  } else if (part.type === 'reasoning') {
    return (
      <ReasoningBlock
        text={part.text}
        isStreaming={status === 'streaming' && index === message.parts.length - 1 && lastMessage}
      />
    )
  } else if (toolNameOfPart(part) === FOLLOW_UPS_TOOL && 'input' in part) {
    // talkwithoptimalen: een afgewezen poging (de controle vond bijv. "run") blijft als deel in het
    // bericht staan; alleen de laatste poging is het antwoord. Ook die laatste kan afgewezen zijn (de
    // herkansingen op): dan staat er de foutkaart, en geen vervolgvragen die niet door de
    // controle kwamen.
    if (message.parts.slice(index + 1).some((p) => toolNameOfPart(p) === FOLLOW_UPS_TOOL)) return null
    if ('state' in part && part.state === 'output-error') return null
    return (
      <FollowUps
        input={part.input}
        onSubmit={(prompt) => onFollowUp?.(prompt)}
        active={lastMessage && status === 'ready' && onFollowUp !== undefined}
      />
    )
  } else if (part.type === 'dynamic-tool' || 'toolCallId' in part) {
    return <ToolPart part={part} onApprovalResponse={onApprovalResponse} />
  }
}
