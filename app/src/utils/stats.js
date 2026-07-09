import { todayStr, daysBetween } from './date.js'

// average of the entry's recorded points; used for the calendar's "daily value"
export function entryAvg(entry) {
  if (!entry) return null
  const vals = [entry.am, entry.pm].filter((v) => v != null)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// latest recorded weight across all entries, most recent date first
export function latestWeight(entries) {
  const dates = Object.keys(entries).sort().reverse()
  for (const d of dates) {
    const avg = entryAvg(entries[d])
    if (avg != null) return { date: d, value: avg }
  }
  return null
}

export function journeyProgress(goal, entries) {
  if (!goal) return null
  const latest = latestWeight(entries)
  const current = latest ? latest.value : goal.startWeight
  const totalToLose = goal.startWeight - goal.targetWeight
  const lostSoFar = goal.startWeight - current
  const pct = totalToLose > 0 ? Math.max(0, Math.min(1, lostSoFar / totalToLose)) : 0
  const dayNum = Math.max(1, daysBetween(goal.startDate, todayStr()) + 1)
  return {
    current,
    dayNum,
    pct,
    remaining: Math.max(0, current - goal.targetWeight),
  }
}

// change vs the most recent prior day that has a value
export function dayDelta(entries, date) {
  const avg = entryAvg(entries[date])
  if (avg == null) return null
  const dates = Object.keys(entries)
    .filter((d) => d < date)
    .sort()
    .reverse()
  for (const d of dates) {
    const prevAvg = entryAvg(entries[d])
    if (prevAvg != null) return avg - prevAvg
  }
  return null
}

export function monthSummary(entries, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const daysWithEntry = Object.keys(entries).filter(
    (d) => d.startsWith(prefix) && entryAvg(entries[d]) != null
  )
  const values = daysWithEntry.map((d) => entryAvg(entries[d]))
  if (!values.length) {
    return { checkedDays: 0, lightest: null, rangeChange: null }
  }
  const sorted = [...daysWithEntry].sort()
  const first = entryAvg(entries[sorted[0]])
  const last = entryAvg(entries[sorted[sorted.length - 1]])
  return {
    checkedDays: daysWithEntry.length,
    lightest: Math.min(...values),
    rangeChange: last - first,
  }
}
