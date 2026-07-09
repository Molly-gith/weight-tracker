import { ref } from 'vue'

const TOKEN_KEY = 'cy_auth_token'

export const authToken = ref(uni.getStorageSync(TOKEN_KEY) || '')

export function isLoggedIn() {
  return !!authToken.value
}

function setToken(token) {
  authToken.value = token
  uni.setStorageSync(TOKEN_KEY, token)
}

export function logout() {
  authToken.value = ''
  uni.removeStorageSync(TOKEN_KEY)
}

export async function register(username, password) {
  const res = await uniCloud.callFunction({ name: 'user-register', data: { username, password } })
  const { code, message, token } = res.result
  if (code !== 0) throw new Error(message || '注册失败')
  setToken(token)
}

export async function login(username, password) {
  const res = await uniCloud.callFunction({ name: 'user-login', data: { username, password } })
  const { code, message, token } = res.result
  if (code !== 0) throw new Error(message || '登录失败')
  setToken(token)
}

// 微信小程序端一键登录,H5 网页端不可用（uni.login 仅小程序/App 支持）
export async function loginWithWeixin() {
  let loginRes
  try {
    loginRes = await uni.login({ provider: 'weixin' })
  } catch (e) {
    throw new Error('微信登录失败')
  }
  if (!loginRes || !loginRes.code) throw new Error('微信登录失败')
  const res = await uniCloud.callFunction({ name: 'user-wxlogin', data: { code: loginRes.code } })
  const { code, message, token } = res.result
  if (code !== 0) throw new Error(message || '微信登录失败')
  setToken(token)
}
