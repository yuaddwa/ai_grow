<template>
  <view
    v-if="visible"
    class="mini-bar"
    :style="{ paddingTop: statusBarHeight + 'px' }"
    @tap="onTap"
  >
    <view class="mini-inner">
      <view class="mini-pulse"></view>
      <view class="mini-texts">
        <text class="mini-title">{{ taskTitle }}</text>
        <text class="mini-countdown">剩余 {{ countdown }}</text>
      </view>
      <view class="mini-progress-wrap">
        <view class="mini-progress" :style="{ width: progress + '%' }"></view>
      </view>
      <text class="mini-enter">进入 ›</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  growthTaskSession,
  showMiniBar,
  getRemainingMs,
  getProgressPercent,
  formatCountdown,
  reopenGrowthTaskFocusPage
} from '../../utils/growthTaskSession.js'

const statusBarHeight = ref(20)

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 20
})

const visible = computed(() => showMiniBar())

const taskTitle = computed(() => {
  void growthTaskSession.tick
  const t = growthTaskSession.task?.title || '进行中'
  return t.length > 12 ? t.slice(0, 12) + '…' : t
})

const countdown = computed(() => {
  void growthTaskSession.tick
  return formatCountdown(getRemainingMs())
})

const progress = computed(() => {
  void growthTaskSession.tick
  return getProgressPercent()
})

function onTap() {
  reopenGrowthTaskFocusPage()
}
</script>

<style scoped>
.mini-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.96), rgba(108, 180, 238, 0.96));
  box-shadow: 0 4rpx 20rpx rgba(79, 172, 254, 0.35);
}

.mini-inner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 24rpx 16rpx;
  position: relative;
}

.mini-pulse {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #fff;
  flex-shrink: 0;
  animation: miniPulse 1.2s ease-in-out infinite;
}

@keyframes miniPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.7); opacity: 0.6; }
}

.mini-texts {
  flex: 1;
  min-width: 0;
}

.mini-title {
  display: block;
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
  line-height: 1.3;
}

.mini-countdown {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2rpx;
  font-variant-numeric: tabular-nums;
}

.mini-progress-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.25);
}

.mini-progress {
  height: 100%;
  background: #fff;
  transition: width 1s linear;
}

.mini-enter {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}
</style>
