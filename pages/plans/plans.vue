<template>
  <view class="plans-page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polyline points="15,18 9,12 15,6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </view>
      <text class="nav-title">我的计划</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="plan-group" v-for="(group, gi) in grouped" :key="gi">
      <text class="group-date">{{ group.date }}</text>
      <view class="plan-card" v-for="p in group.items" :key="p.id">
        <view class="plan-left">
          <view class="plan-dot" :style="{ background: p.color }"></view>
          <view class="plan-info">
            <text class="plan-name">{{ p.name }}</text>
            <text class="plan-time">{{ p.time }}</text>
          </view>
        </view>
        <view class="plan-check" :class="{ done: p.done }" @tap="toggleDone(p)">
          <svg v-if="p.done" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="20,6 9,17 4,12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
      </view>
    </view>

    <view class="empty" v-if="allPlans.length === 0">
      <text class="empty-text">暂无计划</text>
      <text class="empty-sub">去首页让 AI 帮你创建吧</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const allPlans = ref([
  { id: 1, name: '晨会', time: '09:00 - 09:30', date: '今天 5月19日', color: '#7b6df0', done: false },
  { id: 2, name: '开发任务', time: '10:00 - 12:00', date: '今天 5月19日', color: '#67c23a', done: false },
  { id: 3, name: '午餐', time: '12:00 - 13:00', date: '今天 5月19日', color: '#e6a23c', done: true },
  { id: 4, name: '项目复盘', time: '15:00 - 16:00', date: '今天 5月19日', color: '#f56c6c', done: false },
  { id: 5, name: '会议', time: '10:00 - 11:00', date: '明天 5月20日', color: '#7b6df0', done: false },
  { id: 6, name: '健身', time: '14:00 - 15:30', date: '明天 5月20日', color: '#67c23a', done: false },
  { id: 7, name: '学习', time: '20:00 - 22:00', date: '明天 5月20日', color: '#409eff', done: false }
])

const grouped = computed(() => {
  const map = {}
  allPlans.value.forEach(p => {
    if (!map[p.date]) map[p.date] = []
    map[p.date].push(p)
  })
  return Object.entries(map).map(([date, items]) => ({ date, items }))
})

function goBack() {
  uni.navigateBack()
}

function toggleDone(p) {
  p.done = !p.done
}
</script>

<style scoped>
.plans-page {
  min-height: 100vh;
  background: #f0f1f6;
  padding: 100rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.nav-back {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
}

.nav-back:active {
  background: rgba(0,0,0,0.1);
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}

.nav-placeholder {
  width: 56rpx;
}

.group-date {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 14rpx;
  margin-top: 20rpx;
}

.group-date:first-of-type {
  margin-top: 0;
}

.plan-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.plan-dot {
  width: 10rpx;
  height: 40rpx;
  border-radius: 6rpx;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.plan-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.plan-time {
  font-size: 22rpx;
  color: #aaa;
}

.plan-check {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.plan-check.done {
  background: #7b6df0;
  border-color: #7b6df0;
}

.empty {
  text-align: center;
  padding-top: 200rpx;
}

.empty-text {
  display: block;
  font-size: 30rpx;
  color: #999;
}

.empty-sub {
  display: block;
  font-size: 24rpx;
  color: #ccc;
  margin-top: 10rpx;
}
</style>
