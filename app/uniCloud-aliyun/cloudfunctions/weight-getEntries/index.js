const crypto = require('crypto')

const SECRET = process.env.CY_JWT_SECRET || 'change-me-in-cloud-function-config'

function verifyToken(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, expiresAt, sig] = parts
  const payload = `${userId}.${expiresAt}`
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  if (sig !== expected || Date.now() > Number(expiresAt)) return null
  return userId
}

exports.main = async (event) => {
  const userId = verifyToken(event.token)
  if (!userId) return { code: 401, message: '未登录或登录已过期' }

  const db = uniCloud.database()
  const res = await db
    .collection('cy_weight_entries')
    .where({ user_id: userId })
    .limit(2000)
    .get()

  const entries = {}
  for (const row of res.data) {
    entries[row.date] = {
      am: row.am,
      pm: row.pm,
      amTime: row.am_time,
      pmTime: row.pm_time,
    }
  }

  return { code: 0, entries }
}
