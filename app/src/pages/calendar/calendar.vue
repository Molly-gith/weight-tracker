<template>
  <view class="page">
    <view class="month-nav">
      <text class="nav-btn" @tap="prevMonth">‹</text>
      <text class="month-label">{{ monthLabel(year, month) }}</text>
      <text class="nav-btn" @tap="nextMonth">›</text>
    </view>

    <view class="weekdays">
      <text v-for="w in weekdays" :key="w" class="weekday">{{ w }}</text>
    </view>

    <view class="grid">
      <view
        v-for="cell in cells"
        :key="cell.date"
        class="cell"
        :class="{ dim: !cell.inMonth, today: cell.date === today }"
        @tap="openInput(cell)"
      >
        <text class="cell-day">{{ cell.day }}</text>
        <text v-if="cell.delta != null" class="cell-delta" :class="cell.delta <= 0 ? 'down' : 'up'">
          {{ cell.delta <= 0 ? '↓' : '↑' }}{{ Math.abs(cell.delta).toFixed(1) }}
        </text>
        <view class="dots">
          <view class="dot" :class="cell.hasAm ? 'dawn' : 'grey'"></view>
          <view class="dot" :class="cell.hasPm ? 'dusk' : 'grey'"></view>
        </view>
      </view>
    </view>

    <view class="summary">
      <text class="summary-title">本月小结</text>
      <view class="summary-row">
        <view class="summary-item">
          <text class="s-value">{{ summary.checkedDays }}</text>
          <text class="s-label">打卡天数</text>
        </view>
        <view class="summary-item">
          <text class="s-value">{{ summary.lightest != null ? summary.lightest.toFixed(1) : '--' }}</text>
          <text class="s-label">最轻体重</text>
        </view>
        <view class="summary-item">
          <text class="s-value" :class="summary.rangeChange != null && summary.rangeChange <= 0 ? 'down' : 'up'">
            {{ summary.rangeChange != null ? (summary.rangeChange <= 0 ? '↓' : '↑') + Math.abs(summary.rangeChange).toFixed(1) : '--' }}
          </text>
          <text class="s-label">区间变化</text>
        </view>
      </view>
    </view>

    <weight-input-card
      :visible="inputVisible"
      :date="selectedDate"
      :date-label="selectedLabel"
      :initial-am="selectedEntry.am"
      :initial-pm="selectedEntry.pm"
      @close="inputVisible = false"
      @save="onSave"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import WeightInputCard from '@/components/WeightInputCard.vue'
import { getAllEntries, upsertEntry } from '@/utils/storage.js'
import { todayStr, monthGrid, monthLabel, parseDate } from '@/utils/date.js'
import { entryAvg, dayDelta, monthSummary } from '@/utils/stats.js'

const today = todayStr()
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth())
const entries = ref({})
const inputVisible = ref(false)
const selectedDate = ref('')

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const cells = computed(() =>
  monthGrid(year.value, month.value).map((c) => {
    const e = entries.value[c.date]
    return {
      ...c,
      hasAm: !!(e && e.am != null),
      hasPm: !!(e && e.pm != null),
      delta: entryAvg(e) != null ? dayDelta(entries.value, c.date) : null,
    }
  })
)

const summary = computed(() => monthSummary(entries.value, year.value, month.value))

const selectedEntry = computed(() => entries.value[selectedDate.value] || { am: null, pm: null })
const selectedLabel = computed(() => {
  if (!selectedDate.value) return ''
  const d = parseDate(selectedDate.value)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

async function load() {
  entries.value = await getAllEntries()
}

function prevMonth() {
  month.value--
  if (month.value < 0) {
    month.value = 11
    year.value--
  }
}
function nextMonth() {
  month.value++
  if (month.value > 11) {
    month.value = 0
    year.value++
  }
}

function openInput(cell) {
  selectedDate.value = cell.date
  inputVisible.value = true
}

async function onSave({ date, am, pm }) {
  if (am != null) await upsertEntry(date, 'am', am)
  if (pm != null) await upsertEntry(date, 'pm', pm)
  inputVisible.value = false
  await load()
}

onMounted(load)
</script>

<style scoped>
.page {
  padding: 24rpx 24rpx 60rpx;
  min-height: 100vh;
}
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  padding: 16rpx 0 24rpx;
}
.nav-btn {
  font-size: 40rpx;
  color: var(--ink-soft);
  padding: 0 20rpx;
}
.month-label {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--ink);
  min-width: 200rpx;
  text-align: center;
}
.weekdays {
  display: flex;
}
.weekday {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: var(--ink-faint);
  padding-bottom: 12rpx;
}
.grid {
  display: flex;
  flex-wrap: wrap;
}
.cell {
  width: 14.2857%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  gap: 4rpx;
}
.cell.today {
  background: var(--paper-deep);
}
.cell.dim {
  opacity: 0.32;
}
.cell-day {
  font-size: 24rpx;
  color: var(--ink);
}
.cell-delta {
  font-size: 18rpx;
}
.cell-delta.down {
  color: var(--sage);
}
.cell-delta.up {
  color: var(--dusk);
}
.dots {
  display: flex;
  gap: 6rpx;
  margin-top: 2rpx;
}
.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
}
.dot.dawn {
  background: var(--dawn);
}
.dot.dusk {
  background: var(--dusk);
}
.dot.grey {
  background: var(--line);
}

.summary {
  margin-top: 32rpx;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
}
.summary-title {
  font-size: 22rpx;
  letter-spacing: 2rpx;
  color: var(--ink-faint);
  text-transform: uppercase;
  margin-bottom: 20rpx;
  display: block;
}
.summary-row {
  display: flex;
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}
.s-value {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--ink);
}
.s-value.down {
  color: var(--sage);
}
.s-value.up {
  color: var(--dusk);
}
.s-label {
  font-size: 20rpx;
  color: var(--ink-faint);
}
</style>
