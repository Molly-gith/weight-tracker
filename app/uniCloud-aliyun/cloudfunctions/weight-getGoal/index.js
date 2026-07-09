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
  const res = await db.collection('cy_weight_goal').where({ user_id: userId }).get()
  if (res.data.length === 0) return { code: 0, goal: null }

  const g = res.data[0]
  return {
    code: 0,
    goal: {
      startWeight: g.start_weight,
      targetWeight: g.target_weight,
      startDate: g.start_date,
    },
  }
}
