<template>
  <view class="page">
    <template v-if="loggedIn">
      <view class="status">
        <text class="status-title">已登录</text>
        <text class="status-sub">数据会自动同步到云端,换设备登录同一账号即可看到</text>
      </view>
      <view class="btn ghost" @tap="onLogout">退出登录</view>
    </template>

    <template v-else>
      <view class="tabs">
        <text class="tab" :class="{ active: mode === 'login' }" @tap="mode = 'login'">登录</text>
        <text class="tab" :class="{ active: mode === 'register' }" @tap="mode = 'register'">注册</text>
      </view>

      <view class="field">
        <text class="field-label">用户名</text>
        <input class="field-input" v-model="username" placeholder="用户名" />
      </view>
      <view class="field">
        <text class="field-label">密码</text>
        <input class="field-input" v-model="password" password placeholder="至少 6 位" />
      </view>

      <text v-if="error" class="error">{{ error }}</text>

      <view class="btn primary" @tap="onSubmit">{{ mode === 'login' ? '登录' : '注册并登录' }}</view>

      <!-- #ifdef MP-WEIXIN -->
      <view class="divider">或</view>
      <view class="btn wx" @tap="onWxLogin">微信一键登录</view>
      <!-- #endif -->
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authToken, isLoggedIn, login, register, loginWithWeixin, logout } from '@/utils/auth.js'

const mode = ref('login')
const username = ref('')
const password = ref('')
const error = ref('')

const loggedIn = computed(() => isLoggedIn())

async function onSubmit() {
  error.value = ''
  try {
    if (mode.value === 'login') {
      await login(username.value, password.value)
    } else {
      await register(username.value, password.value)
    }
    uni.$emit && uni.$emit('cy:refresh')
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 600)
  } catch (e) {
    error.value = e.message || '操作失败,请稍后重试'
  }
}

async function onWxLogin() {
  error.value = ''
  try {
    await loginWithWeixin()
    uni.$emit && uni.$emit('cy:refresh')
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 600)
  } catch (e) {
    error.value = e.message || '微信登录失败'
  }
}

function onLogout() {
  logout()
  uni.$emit && uni.$emit('cy:refresh')
}
</script>

<style scoped>
.page {
  padding: 60rpx 48rpx;
  min-height: 100vh;
}
.status {
  margin-bottom: 40rpx;
}
.status-title {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--ink);
  display: block;
  margin-bottom: 8rpx;
}
.status-sub {
  font-size: 24rpx;
  color: var(--ink-soft);
}
.tabs {
  display: flex;
  gap: 40rpx;
  margin-bottom: 40rpx;
}
.tab {
  font-size: 30rpx;
  color: var(--ink-faint);
  padding-bottom: 10rpx;
}
.tab.active {
  color: var(--ink);
  border-bottom: 3rpx solid var(--dawn);
}
.field {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: 22rpx 0;
}
.field-label {
  width: 140rpx;
  font-size: 26rpx;
  color: var(--ink-soft);
}
.field-input {
  flex: 1;
  font-size: 30rpx;
  color: var(--ink);
}
.error {
  font-size: 24rpx;
  color: #c0524d;
  margin-top: 20rpx;
  display: block;
}
.btn {
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-top: 40rpx;
}
.btn.primary {
  background: var(--ink);
  color: var(--paper);
}
.btn.ghost {
  border: 1px solid var(--line);
  color: var(--ink-soft);
}
.btn.wx {
  background: var(--sage);
  color: #fff;
}
.divider {
  text-align: center;
  color: var(--ink-faint);
  font-size: 22rpx;
  margin-top: 32rpx;
}
</style>
