// Data layer. Always writes to local device storage first (instant, works
// offline / before uniCloud is set up). When a user is logged in, also syncs
// to the uniCloud backend so data carries across the mini program and web.

import { authToken, isLoggedIn } from './auth.js'

const ENTRIES_KEY = 'cy_weight_entries' // { [date]: { am, pm, amTime, pmTime } }
const GOAL_KEY = 'cy_weight_goal' // { startWeight, targetWeight, startDate }

function readJSON(key, fallback) {
  try {
    const raw = uni.getStorageSync(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

function writeJSON(key, value) {
  uni.setStorageSync(key, JSON.stringify(value))
}

async function callCloud(name, data) {
  try {
    const res = await uniCloud.callFunction({ name, data: { ...data, token: authToken.value } })
    return res.result
  } catch (e) {
    // cloud space not linked yet, or offline — silently fall back to local-only
    return null
  }
}

export async function getAllEntries() {
  if (isLoggedIn()) {
    const res = await callCloud('weight-getEntries')
    if (res && res.code === 0) {
      writeJSON(ENTRIES_KEY, res.entries)
      return res.entries
    }
  }
  return readJSON(ENTRIES_KEY, {})
}

export async function getEntry(date) {
  const all = readJSON(ENTRIES_KEY, {})
  return all[date] || null
}

export async function upsertEntry(date, period, value) {
  const all = readJSON(ENTRIES_KEY, {})
  const entry = all[date] || { am: null, pm: null, amTime: null, pmTime: null }
  entry[period] = value
  entry[period + 'Time'] = Date.now()
  all[date] = entry
  writeJSON(ENTRIES_KEY, all)

  if (isLoggedIn()) {
    await callCloud('weight-upsertEntry', { date, period, value })
  }
  return entry
}

export async function deleteEntryField(date, period) {
  const all = readJSON(ENTRIES_KEY, {})
  if (!all[date]) return
  all[date][period] = null
  all[date][period + 'Time'] = null
  if (all[date].am == null && all[date].pm == null) {
    delete all[date]
  }
  writeJSON(ENTRIES_KEY, all)
}

export async function getGoal() {
  if (isLoggedIn()) {
    const res = await callCloud('weight-getGoal')
    if (res && res.code === 0 && res.goal) {
      writeJSON(GOAL_KEY, res.goal)
      return res.goal
    }
  }
  return readJSON(GOAL_KEY, null)
}

export async function setGoal(goal) {
  writeJSON(GOAL_KEY, goal)
  if (isLoggedIn()) {
    await callCloud('weight-setGoal', goal)
  }
  return goal
}
