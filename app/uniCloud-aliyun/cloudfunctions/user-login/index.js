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
  if (!username || !password) {
    return { code: 1, message: '请输入用户名和密码' }
  }

  const db = uniCloud.database()
  const users = db.collection('cy_users')

  const res = await users.where({ username }).get()
  if (res.data.length === 0) {
    return { code: 2, message: '用户不存在' }
  }

  const user = res.data[0]
  const [salt, hash] = (user.password_hash || '').split(':')
  if (!salt || hashPassword(password, salt) !== hash) {
    return { code: 3, message: '密码错误' }
  }

  const token = signToken(user._id)
  return { code: 0, token, userId: user._id }
}
