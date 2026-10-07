const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Midnight (local time) of the day `timestamp` falls in. */
function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/**
 * Short, human relative time for a conversation entry: `Zojuist`, `12 min geleden`,
 * `3 uur geleden`, `Gisteren`, then a calendar date once it is older than a week.
 */
export function relativeTime(timestamp: number, now = Date.now()): string {
  const elapsed = now - timestamp
  if (elapsed < MINUTE) return 'Zojuist'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min geleden`

  const dayDelta = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY)
  if (dayDelta === 0) return `${Math.floor(elapsed / HOUR)} uur geleden`
  if (dayDelta === 1) return 'Gisteren'
  if (dayDelta < 7) return `${dayDelta} dagen geleden`

  const date = new Date(timestamp)
  const sameYear = date.getFullYear() === new Date(now).getFullYear()
  return date.toLocaleDateString('nl-NL', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

// Constructing an Intl formatter is expensive and these run per sidebar row on
// every render; build each one once.
const absoluteFormatter = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })

/** Full timestamp, for the tooltip behind the relative label. */
export function absoluteTime(timestamp: number): string {
  return absoluteFormatter.format(timestamp)
}

/**
 * Bucket label used to group the conversation list. Buckets are contiguous and
 * ordered, so grouping a timestamp-sorted list keeps the list sorted.
 */
export function dateGroupLabel(timestamp: number, now = Date.now()): string {
  const dayDelta = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY)
  if (dayDelta <= 0) return 'Vandaag'
  if (dayDelta === 1) return 'Gisteren'
  if (dayDelta < 7) return 'Afgelopen 7 dagen'
  if (dayDelta < 30) return 'Afgelopen 30 dagen'
  return 'Ouder'
}

export interface DateGroup<T> {
  label: string
  items: T[]
}

/** Group already-sorted (newest first) entries into contiguous date buckets. */
export function groupByDate<T>(items: T[], getTimestamp: (item: T) => number, now = Date.now()): DateGroup<T>[] {
  const groups: DateGroup<T>[] = []
  for (const item of items) {
    const label = dateGroupLabel(getTimestamp(item), now)
    const last = groups.at(-1)
    if (last?.label === label) {
      last.items.push(item)
    } else {
      groups.push({ label, items: [item] })
    }
  }
  return groups
}
