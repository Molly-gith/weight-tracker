export function todayStr() {
  return formatDate(new Date())
}

export function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(str, n) {
  const d = parseDate(str)
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

export function daysBetween(a, b) {
  const ms = parseDate(b) - parseDate(a)
  return Math.round(ms / 86400000)
}

// weeks (Sun-Sat) grid for a given year/month, padded with prev/next month days
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)
  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    cells.push({
      date: formatDate(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    })
  }
  return cells
}

export function monthLabel(year, month) {
  return `${year}年${month + 1}月`
}
