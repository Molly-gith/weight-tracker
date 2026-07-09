const crypto = require('crypto')

const SECRET = process.env.CY_JWT_SECRET || 'change-me-in-cloud-function-config'
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function signToken(userId) {
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = `${userId}.${expiresAt}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

exports.main = async (event) => {
  const { username, password } = event
  if (!username || !password || password.length < 6) {
    return { code: 1, message: '用户名不能为空,密码至少 6 位' }
  }

  const db = uniCloud.database()
  const users = db.collection('cy_users')

  const existing = await users.where({ username }).get()
  if (existing.data.length > 0) {
    return { code: 2, message: '用户名已被注册' }
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = `${salt}:${hashPassword(password, salt)}`

  const res = await users.add({
    username,
    password_hash: passwordHash,
    create_date: Date.now(),
  })

  const token = signToken(res.id)
  return { code: 0, token, userId: res.id }
}
