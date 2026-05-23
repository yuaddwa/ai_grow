<template>
  <view class="focus-page">
    <view class="bg-glow g1"></view>
    <view class="bg-glow g2"></view>

    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="top-btn" @tap="onMinimize">
        <text class="top-btn-icon">⌄</text>
        <text class="top-btn-txt">退出</text>
      </view>
      <text class="top-label">专注进行中</text>
      <view class="top-btn ghost"></view>
    </view>

    <view class="player-body" v-if="hasTask">
      <view class="disc-wrap">
        <view class="disc-glow"></view>
        <view class="disc" :class="{ spinning: playing }">
          <view class="disc-inner">
            <text class="disc-emoji">🎯</text>
          </view>
        </view>
      </view>

      <text class="task-title">{{ taskTitle }}</text>
      <text class="task-desc" v-if="taskDesc">{{ taskDesc }}</text>

      <text class="countdown">{{ countdown }}</text>
      <text class="countdown-label">剩余时间</text>

      <view class="progress-block">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
          <view class="progress-thumb" :style="{ left: progress + '%' }"></view>
        </view>
        <view class="progress-times">
          <text>{{ elapsedLabel }}</text>
          <text>{{ totalLabel }}</text>
        </view>
      </view>

      <view class="quote-card">
        <text class="quote-mark">"</text>
        <text class="quote-text">{{ quote }}</text>
      </view>

      <view class="actions">
        <view class="action-btn secondary" @tap="onMinimize">
          <text>最小化</text>
        </view>
        <view class="action-btn primary" @tap="onComplete">
          <text>提前完成</text>
        </view>
      </view>
    </view>

    <view class="empty-body" v-else>
      <text class="empty-txt">暂无进行中的任务</text>
      <view class="action-btn primary solo" @tap="goBack">
        <text>返回</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { completeGrowthTask } from '../../utils/api.js'
import {
  growthTaskSession,
  clearActiveGrowthTask,
  minimizeGrowthTask,
  getRemainingMs,
  getElapsedMs,
  getProgressPercent,
  formatCountdown,
  getCurrentQuote,
  refreshActiveGrowthTask
} from '../../utils/growthTaskSession.js'

const statusBarHeight = ref(20)
const playing = ref(true)
const completing = ref(false)

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 20
})

onShow(() => {
  growthTaskSession.onFocusPage = true
  growthTaskSession.minimized = false
  if (growthTaskSession.task) {
    refreshActiveGrowthTask()
  }
})

onHide(() => {
  if (growthTaskSession.active && growthTaskSession.task?.status === 'IN_PROGRESS') {
    growthTaskSession.onFocusPage = false
    growthTaskSession.minimized = true
  }
})

onUnmounted(() => {
  if (growthTaskSession.active && !growthTaskSession.minimized) {
    growthTaskSession.onFocusPage = false
  }
})

const hasTask = computed(() => growthTaskSession.active && !!growthTaskSession.task)

const taskTitle = computed(() => growthTaskSession.task?.title || '')
const taskDesc = computed(() => {
  const d = growthTaskSession.task?.description || ''
  return d.length > 60 ? d.slice(0, 60) + '…' : d
})

const countdown = computed(() => {
  void growthTaskSession.tick
  return formatCountdown(getRemainingMs())
})

const progress = computed(() => {
  void growthTaskSession.tick
  return getProgressPercent()
})

const quote = computed(() => getCurrentQuote())

const elapsedLabel = computed(() => {
  void growthTaskSession.tick
  return formatCountdown(getElapsedMs())
})

const totalLabel = computed(() => {
  void growthTaskSession.tick
  const task = growthTaskSession.task
  if (!task?.startedAt || !task?.plannedEndAt) {
    return task?.estimatedMinutes ? `${task.estimatedMinutes}:00` : '--:--'
  }
  const start = new Date(task.startedAt).getTime()
  const end = new Date(task.plannedEndAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return '--:--'
  return formatCountdown(end - start)
})

function goBack() {
  uni.navigateBack({
    fail: () => uni.reLaunch({ url: '/pages/plans/plans' })
  })
}

function onMinimize() {
  minimizeGrowthTask()
  goBack()
}

async function onComplete() {
  const task = growthTaskSession.task
  if (!task || completing.value) return

  uni.showModal({
    title: '提前完成',
    content: '确认现在完成这项任务吗？',
    success: async (res) => {
      if (!res.confirm) return
      completing.value = true
      try {
        const body = { qualityScore: 4 }
        if (task.estimatedMinutes) body.actualMinutes = task.estimatedMinutes
        await completeGrowthTask(task.id, body)
        clearActiveGrowthTask()
        uni.showToast({ title: '已完成', icon: 'success' })
        setTimeout(() => goBack(), 400)
      } catch (e) {
        uni.showToast({ title: e.message || '完成失败', icon: 'none' })
      } finally {
        completing.value = false
      }
    }
  })
}
</script>

<style scoped>
.focus-page {
  min-height: 100vh;
  background: linear-gradient(165deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  pointer-events: none;
}

.g1 {
  width: 500rpx;
  height: 500rpx;
  background: rgba(79, 172, 254, 0.35);
  top: -100rpx;
  right: -120rpx;
}

.g2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(123, 109, 240, 0.25);
  bottom: 200rpx;
  left: -100rpx;
}

.top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 28rpx 24rpx;
}

.top-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  min-width: 120rpx;
}

.top-btn.ghost {
  opacity: 0;
}

.top-btn-icon {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
}

.top-btn-txt {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
}

.top-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.player-body {
  flex: 1;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 48rpx 80rpx;
}

.disc-wrap {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  margin-bottom: 48rpx;
}

.disc-glow {
  position: absolute;
  inset: -20rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 172, 254, 0.4) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #2d3561, #1a1f3a);
  box-shadow:
    0 20rpx 60rpx rgba(0, 0, 0, 0.4),
    inset 0 2rpx 8rpx rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.08);
}

.disc.spinning {
  animation: discSpin 12s linear infinite;
}

@keyframes discSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.disc-inner {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(79, 172, 254, 0.5);
}

.disc-emoji {
  font-size: 64rpx;
}

.task-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.task-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  line-height: 1.5;
  margin-bottom: 32rpx;
  padding: 0 20rpx;
}

.countdown {
  font-size: 88rpx;
  font-weight: 300;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 4rpx;
  line-height: 1.1;
}

.countdown-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 8rpx;
  margin-bottom: 40rpx;
}

.progress-block {
  width: 100%;
  margin-bottom: 36rpx;
}

.progress-track {
  position: relative;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4rpx;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #6cb4ee);
  border-radius: 4rpx;
  transition: width 1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 20rpx;
  height: 20rpx;
  margin-top: -10rpx;
  margin-left: -10rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(79, 172, 254, 0.6);
  transition: left 1s linear;
}

.progress-times {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.45);
  font-variant-numeric: tabular-nums;
}

.quote-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 48rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  position: relative;
}

.quote-mark {
  position: absolute;
  top: 8rpx;
  left: 20rpx;
  font-size: 48rpx;
  color: rgba(79, 172, 254, 0.5);
  line-height: 1;
}

.quote-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
  padding-left: 16rpx;
}

.actions {
  width: 100%;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.15);
}

.action-btn.primary {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(79, 172, 254, 0.4);
}

.action-btn.solo {
  margin-top: 40rpx;
  width: 280rpx;
}

.empty-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.empty-txt {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
