const crypto = require('crypto')

const SECRET = process.env.CY_JWT_SECRET || 'change-me-in-cloud-function-config'
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

function signToken(userId) {
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = `${userId}.${expiresAt}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

// 需要在云函数配置里设置环境变量 WX_APPID / WX_SECRET
// (微信公众平台 mp.weixin.qq.com -> 开发 -> 开发管理 -> 开发设置 里获取)
exports.main = async (event) => {
  const { code } = event
  if (!code) return { code: 1, message: '缺少微信登录 code' }

  const appid = process.env.WX_APPID
  const secret = process.env.WX_SECRET
  if (!appid || !secret) {
    return { code: 4, message: '云函数未配置 WX_APPID / WX_SECRET' }
  }

  const res = await uniCloud.httpclient.request(
    'https://api.weixin.qq.com/sns/jscode2session',
    {
      method: 'GET',
      data: { appid, secret, js_code: code, grant_type: 'authorization_code' },
      dataType: 'json',
    }
  )
  const { openid, errmsg } = res.data || {}
  if (!openid) {
    return { code: 2, message: errmsg || '微信登录失败' }
  }

  const db = uniCloud.database()
  const users = db.collection('cy_users')
  const existing = await users.where({ openid }).get()

  let userId
  if (existing.data.length === 0) {
    const addRes = await users.add({ openid, create_date: Date.now() })
    userId = addRes.id
  } else {
    userId = existing.data[0]._id
  }

  const token = signToken(userId)
  return { code: 0, token, userId }
}
