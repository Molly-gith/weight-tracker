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

  const { date, period, value } = event
  if (!date || !['am', 'pm'].includes(period) || typeof value !== 'number') {
    return { code: 1, message: '参数不正确' }
  }

  const db = uniCloud.database()
  const entries = db.collection('cy_weight_entries')
  const existing = await entries.where({ user_id: userId, date }).get()

  const field = {
    [period]: value,
    [`${period}_time`]: Date.now(),
  }

  if (existing.data.length === 0) {
    await entries.add({
      user_id: userId,
      date,
      am: null,
      pm: null,
      am_time: null,
      pm_time: null,
      ...field,
    })
  } else {
    await entries.doc(existing.data[0]._id).update(field)
  }

  return { code: 0 }
}
