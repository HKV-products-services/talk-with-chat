// The levels of pydantic_ai.settings.ThinkingEffort. Update by hand when Pydantic AI adds or drops one.
export const THINKING_EFFORT_LEVELS = ['minimal', 'low', 'medium', 'high', 'xhigh'] as const

export type ThinkingEffort = (typeof THINKING_EFFORT_LEVELS)[number]
