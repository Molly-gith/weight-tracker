<template>
  <view class="page">
    <view class="account-entry" @tap="goAccount">
      <text>{{ loggedIn ? '☁ 已同步' : '账号'}}</text>
    </view>

    <view v-if="!goal" class="empty-state">
      <text class="empty-title">还没有设定目标</text>
      <text class="empty-sub">先记录起点体重和目标,才能开始你的减重旅程</text>
      <view class="btn primary" @tap="goOnboarding">设定目标</view>
    </view>

    <template v-else>
      <view class="journey">
        <text class="j-eyebrow">减重第 {{ progress.dayNum }} 天</text>
        <view class="j-bar-track">
          <view class="j-bar-fill" :style="{ width: (progress.pct * 100) + '%' }"></view>
        </view>
        <view class="j-meta">
          <text>{{ progress.current.toFixed(1) }} kg</text>
          <text class="j-target">目标 {{ goal.targetWeight.toFixed(1) }} kg · 还差 {{ progress.remaining.toFixed(1) }} kg</text>
        </view>
      </view>

      <view class="cards">
        <view class="wcard" @tap="openInput('am')">
          <text class="wc-label dawn">晨重</text>
          <text v-if="entry.am != null" class="wc-value">{{ entry.am.toFixed(1) }}</text>
          <text v-else class="wc-empty">点击记录</text>
          <text v-if="amDelta != null" class="wc-delta" :class="amDelta <= 0 ? 'down' : 'up'">
            {{ amDelta <= 0 ? '↓' : '↑' }} {{ Math.abs(amDelta).toFixed(1) }} kg
          </text>
        </view>
        <view class="wcard" @tap="openInput('pm')">
          <text class="wc-label dusk">晚重</text>
          <text v-if="entry.pm != null" class="wc-value">{{ entry.pm.toFixed(1) }}</text>
          <text v-else class="wc-empty">点击记录</text>
          <text v-if="pmDelta != null" class="wc-delta" :class="pmDelta <= 0 ? 'down' : 'up'">
            {{ pmDelta <= 0 ? '↓' : '↑' }} {{ Math.abs(pmDelta).toFixed(1) }} kg
          </text>
        </view>
      </view>
    </template>

    <weight-input-card
      :visible="inputVisible"
      :date="today"
      date-label="今天"
      :initial-am="entry.am"
      :initial-pm="entry.pm"
      @close="inputVisible = false"
      @save="onSave"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import WeightInputCard from '@/components/WeightInputCard.vue'
import { getAllEntries, getGoal, upsertEntry } from '@/utils/storage.js'
import { todayStr } from '@/utils/date.js'
import { journeyProgress, dayDelta } from '@/utils/stats.js'
import { isLoggedIn } from '@/utils/auth.js'

const today = todayStr()
const goal = ref(null)
const entries = ref({})
const inputVisible = ref(false)

const entry = computed(() => entries.value[today] || { am: null, pm: null })
const progress = computed(() => journeyProgress(goal.value, entries.value) || {})
const amDelta = computed(() => (entry.value.am != null ? dayDelta(entries.value, today) : null))
const pmDelta = computed(() => (entry.value.pm != null ? dayDelta(entries.value, today) : null))

async function load() {
  goal.value = await getGoal()
  entries.value = await getAllEntries()
}

function openInput() {
  inputVisible.value = true
}

async function onSave({ date, am, pm }) {
  if (am != null) await upsertEntry(date, 'am', am)
  if (pm != null) await upsertEntry(date, 'pm', pm)
  inputVisible.value = false
  await load()
}

function goOnboarding() {
  uni.navigateTo({ url: '/pages/onboarding/onboarding' })
}

const loggedIn = computed(() => isLoggedIn())

function goAccount() {
  uni.navigateTo({ url: '/pages/account/account' })
}

onMounted(load)
uni.$on && uni.$on('cy:refresh', load)
</script>

<style scoped>
.page {
  padding: 32rpx 32rpx 60rpx;
  min-height: 100vh;
}
.account-entry {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16rpx;
}
.account-entry text {
  font-size: 22rpx;
  color: var(--ink-faint);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 40rpx;
  gap: 16rpx;
}
.empty-title {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--ink);
}
.empty-sub {
  font-size: 26rpx;
  color: var(--ink-soft);
  text-align: center;
  margin-bottom: 24rpx;
}
.btn.primary {
  background: var(--ink);
  color: var(--paper);
  padding: 20rpx 48rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.journey {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.j-eyebrow {
  font-size: 24rpx;
  letter-spacing: 2rpx;
  color: var(--dawn);
  display: block;
  margin-bottom: 20rpx;
}
.j-bar-track {
  height: 12rpx;
  background: var(--paper-deep);
  border-radius: 8rpx;
  overflow: hidden;
}
.j-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--dawn), var(--sage));
  border-radius: 8rpx;
}
.j-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 16rpx;
  font-size: 30rpx;
  color: var(--ink);
}
.j-target {
  font-size: 22rpx;
  color: var(--ink-faint);
}

.cards {
  display: flex;
  gap: 20rpx;
}
.wcard {
  flex: 1;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}
.wc-label {
  font-size: 22rpx;
  letter-spacing: 2rpx;
}
.wc-label.dawn {
  color: var(--dawn);
}
.wc-label.dusk {
  color: var(--dusk);
}
.wc-value {
  font-size: 44rpx;
  font-weight: 500;
  color: var(--ink);
}
.wc-empty {
  font-size: 26rpx;
  color: var(--ink-faint);
  padding: 10rpx 0;
}
.wc-delta {
  font-size: 22rpx;
}
.wc-delta.down {
  color: var(--sage);
}
.wc-delta.up {
  color: var(--dusk);
}
</style>
