<template>
  <view v-if="visible" class="mask" @tap="onCancel">
    <view class="card" @tap.stop>
      <view class="card-title">{{ dateLabel }}</view>
      <view class="field">
        <text class="field-label dawn">晨重</text>
        <input
          class="field-input"
          type="digit"
          v-model="amInput"
          placeholder="未记录"
          placeholder-class="ph"
        />
        <text class="field-unit">kg</text>
      </view>
      <view class="field">
        <text class="field-label dusk">晚重</text>
        <input
          class="field-input"
          type="digit"
          v-model="pmInput"
          placeholder="未记录"
          placeholder-class="ph"
        />
        <text class="field-unit">kg</text>
      </view>
      <view class="actions">
        <view class="btn ghost" @tap="onCancel">取消</view>
        <view class="btn primary" @tap="onSave">保存</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  date: { type: String, default: '' },
  dateLabel: { type: String, default: '' },
  initialAm: { type: [Number, null], default: null },
  initialPm: { type: [Number, null], default: null },
})
const emit = defineEmits(['close', 'save'])

const amInput = ref('')
const pmInput = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      amInput.value = props.initialAm != null ? String(props.initialAm) : ''
      pmInput.value = props.initialPm != null ? String(props.initialPm) : ''
    }
  }
)

function onCancel() {
  emit('close')
}

function onSave() {
  const am = amInput.value === '' ? null : parseFloat(amInput.value)
  const pm = pmInput.value === '' ? null : parseFloat(pmInput.value)
  emit('save', { date: props.date, am, pm })
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(43, 38, 32, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.card {
  width: 80%;
  max-width: 560rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 40rpx 36rpx;
  box-shadow: 0 20rpx 60rpx rgba(43, 38, 32, 0.18);
}
.card-title {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 32rpx;
  text-align: center;
}
.field {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: 20rpx 0;
}
.field-label {
  width: 100rpx;
  font-size: 28rpx;
  font-weight: 500;
}
.field-label.dawn {
  color: var(--dawn);
}
.field-label.dusk {
  color: var(--dusk);
}
.field-input {
  flex: 1;
  font-size: 32rpx;
  color: var(--ink);
  text-align: right;
  padding-right: 12rpx;
}
.ph {
  color: var(--ink-faint);
}
.field-unit {
  font-size: 24rpx;
  color: var(--ink-faint);
  width: 40rpx;
}
.actions {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}
.btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.btn.ghost {
  border: 1px solid var(--line);
  color: var(--ink-soft);
}
.btn.primary {
  background: var(--ink);
  color: var(--paper);
}
</style>
