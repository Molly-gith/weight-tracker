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

  const { startWeight, targetWeight, startDate } = event
  if (typeof startWeight !== 'number' || typeof targetWeight !== 'number' || !startDate) {
    return { code: 1, message: '参数不正确' }
  }

  const db = uniCloud.database()
  const goals = db.collection('cy_weight_goal')
  const existing = await goals.where({ user_id: userId }).get()

  const field = {
    start_weight: startWeight,
    target_weight: targetWeight,
    start_date: startDate,
  }

  if (existing.data.length === 0) {
    await goals.add({ user_id: userId, ...field })
  } else {
    await goals.doc(existing.data[0]._id).update(field)
  }

  return { code: 0 }
}
