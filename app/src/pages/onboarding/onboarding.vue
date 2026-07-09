<template>
  <view class="page">
    <text class="title">开始你的<text class="em">减重旅程</text></text>
    <text class="sub">记下起点,才看得见每一步的靠近</text>

    <view class="field">
      <text class="field-label">目前体重</text>
      <input class="field-input" type="digit" v-model="startWeight" placeholder="例如 70" />
      <text class="field-unit">kg</text>
    </view>
    <view class="field">
      <text class="field-label">目标体重</text>
      <input class="field-input" type="digit" v-model="targetWeight" placeholder="例如 60" />
      <text class="field-unit">kg</text>
    </view>

    <text v-if="error" class="error">{{ error }}</text>

    <view class="btn primary" @tap="submit">开始记录</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { setGoal } from '@/utils/storage.js'
import { todayStr } from '@/utils/date.js'

const startWeight = ref('')
const targetWeight = ref('')
const error = ref('')

async function submit() {
  const sw = parseFloat(startWeight.value)
  const tw = parseFloat(targetWeight.value)
  if (!sw || !tw) {
    error.value = '请填写目前体重和目标体重'
    return
  }
  if (tw >= sw) {
    error.value = '目标体重应该小于目前体重'
    return
  }
  error.value = ''
  await setGoal({ startWeight: sw, targetWeight: tw, startDate: todayStr() })
  uni.$emit && uni.$emit('cy:refresh')
  uni.reLaunch({ url: '/pages/today/today' })
}
</script>

<style scoped>
.page {
  padding: 80rpx 48rpx;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.title {
  font-size: 44rpx;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.3;
  margin-bottom: 12rpx;
}
.title .em {
  color: var(--dusk);
}
.sub {
  font-size: 26rpx;
  color: var(--ink-soft);
  margin-bottom: 56rpx;
}
.field {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: 24rpx 0;
}
.field-label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--ink-soft);
}
.field-input {
  flex: 1;
  font-size: 32rpx;
  color: var(--ink);
  text-align: right;
  padding-right: 12rpx;
}
.field-unit {
  font-size: 24rpx;
  color: var(--ink-faint);
  width: 48rpx;
}
.error {
  font-size: 24rpx;
  color: #c0524d;
  margin-top: 20rpx;
}
.btn.primary {
  margin-top: 56rpx;
  background: var(--ink);
  color: var(--paper);
  text-align: center;
  padding: 26rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
}
</style>
