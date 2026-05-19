<template>
  <view class="plans-page">
    <!-- 背景装饰 -->
    <view class="bg-decor">
      <view class="bg-ball b1"></view>
      <view class="bg-ball b2"></view>
    </view>

    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text style="font-size:36rpx;color:#333;">‹</text>
      </view>
      <text class="nav-title">我的计划</text>
      <view class="nav-add" @tap="addPlan">
        <text style="font-size:36rpx;color:#4facfe;">＋</text>
      </view>
    </view>

    <!-- 日历卡片 -->
    <view class="calendar-card" :class="{ show: loaded }">
      <!-- 月份切换 -->
      <view class="month-row">
        <view class="month-arrow" @tap="prevMonth">
          <text style="font-size:32rpx;color:#333;">‹</text>
        </view>
        <text class="month-title">{{ curYear }}年{{ curMonth }}月</text>
        <view class="month-arrow" @tap="nextMonth">
          <text style="font-size:32rpx;color:#333;">›</text>
        </view>
      </view>

      <!-- 星期头 -->
      <view class="week-header">
        <text class="week-cell" v-for="w in weeks" :key="w">{{ w }}</text>
      </view>

      <!-- 日期格子 -->
      <view class="days-grid">
        <view
          v-for="(d, i) in calendarDays"
          :key="i"
          class="day-cell"
          :class="{
            empty: !d.day,
            today: d.isToday,
            selected: d.full === selectedDate,
            hasPlan: d.hasPlan
          }"
          @tap="d.day && selectDate(d.full)"
        >
          <text class="day-num">{{ d.day || '' }}</text>
          <view class="day-dot" v-if="d.hasPlan && d.day"></view>
        </view>
      </view>
    </view>

    <!-- 选中日期标题 -->
    <view class="selected-header" v-if="selectedDate">
      <text class="selected-label">{{ selectedLabel }}</text>
      <text class="selected-count">{{ selectedPlans.length }} 项计划</text>
    </view>

    <!-- 当日计划列表 -->
    <scroll-view class="plan-scroll" scroll-y :bounces="false" :show-scrollbar="false">
      <view class="plan-list">
        <view
          v-for="(p, pi) in selectedPlans"
          :key="p.id"
          class="plan-card"
          :class="{ show: loaded }" :style="{ transitionDelay: (pi * 0.08) + 's' }"
        >
          <view class="plan-left">
            <view class="plan-color-bar" :style="{ background: p.color }"></view>
            <view class="plan-info">
              <text class="plan-name" :class="{ done: p.done }">{{ p.name }}</text>
              <view class="plan-meta">
                <text style="font-size:22rpx;">⏰</text>
                <text class="plan-time">{{ p.time }}</text>
              </view>
            </view>
          </view>
          <view class="plan-check" :class="{ done: p.done }" @tap="toggleDone(p)">
            <text v-if="p.done" style="font-size:28rpx;color:#fff;">✔</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty" v-if="selectedPlans.length === 0">
          <text style="font-size:60rpx;opacity:0.3;">📅</text>
          <text class="empty-text">这一天还没有计划</text>
          <text class="empty-sub">点击右上角 + 添加</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const loaded = ref(false)
const weeks = ['日', '一', '二', '三', '四', '五', '六']

const today = new Date()
const curYear = ref(today.getFullYear())
const curMonth = ref(today.getMonth() + 1)
const selectedDate = ref(formatDate(today))

onMounted(() => { nextTick(() => { setTimeout(() => { loaded.value = true }, 50) }) })

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 生成日历数据
const calendarDays = computed(() => {
  const year = curYear.value
  const month = curMonth.value - 1
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  // 前面空格
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0 })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const full = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = full === formatDate(today)
    const hasPlan = allPlans.value.some(p => p.date === full)
    days.push({ day: d, full, isToday, hasPlan })
  }

  return days
})

// 模拟计划数据
const allPlans = ref([
  { id: 1, name: '晨会', time: '09:00 - 09:30', date: formatDate(today), color: '#7b6df0', done: false },
  { id: 2, name: '开发任务', time: '10:00 - 12:00', date: formatDate(today), color: '#67c23a', done: false },
  { id: 3, name: '午餐', time: '12:00 - 13:00', date: formatDate(today), color: '#e6a23c', done: true },
  { id: 4, name: '项目复盘', time: '15:00 - 16:00', date: formatDate(today), color: '#f56c6c', done: false },
])

// 补充更多日期的计划
const addDays = (n) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

allPlans.value.push(
  { id: 5, name: '会议', time: '10:00 - 11:00', date: addDays(1), color: '#7b6df0', done: false },
  { id: 6, name: '健身', time: '14:00 - 15:30', date: addDays(1), color: '#67c23a', done: false },
  { id: 7, name: '学习', time: '20:00 - 22:00', date: addDays(1), color: '#409eff', done: false },
  { id: 8, name: '阅读', time: '08:00 - 09:00', date: addDays(3), color: '#e6a23c', done: false },
  { id: 9, name: '团队周会', time: '10:00 - 11:30', date: addDays(5), color: '#f56c6c', done: false },
  { id: 10, name: '健身', time: '18:00 - 19:30', date: addDays(5), color: '#67c23a', done: false },
  { id: 11, name: '月度总结', time: '14:00 - 16:00', date: addDays(-2), color: '#7b6df0', done: true },
  { id: 12, name: '需求评审', time: '10:00 - 11:00', date: addDays(-2), color: '#e6a23c', done: true },
)

const selectedPlans = computed(() => {
  return allPlans.value.filter(p => p.date === selectedDate.value)
})

const selectedLabel = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value)
  const ws = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const isToday = selectedDate.value === formatDate(today)
  const prefix = isToday ? '今天 · ' : ''
  return `${prefix}${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${ws[d.getDay()]}`
})

function selectDate(full) {
  selectedDate.value = full
}

function prevMonth() {
  if (curMonth.value === 1) {
    curMonth.value = 12
    curYear.value--
  } else {
    curMonth.value--
  }
}

function nextMonth() {
  if (curMonth.value === 12) {
    curMonth.value = 1
    curYear.value++
  } else {
    curMonth.value++
  }
}

function toggleDone(p) {
  p.done = !p.done
}

function goBack() {
  uni.navigateBack()
}

function addPlan() {
  uni.showToast({ title: '添加计划功能开发中', icon: 'none' })
}
</script>

<style scoped>
.plans-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
  position: relative;
  overflow: hidden;
}

.bg-decor {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 300rpx;
  overflow: hidden;
}

.bg-ball {
  position: absolute;
  border-radius: 50%;
}

.b1 {
  width: 300rpx; height: 300rpx;
  background: rgba(79, 172, 254, 0.08);
  top: -160rpx; right: -80rpx;
  animation: floatB 7s ease-in-out infinite;
}

.b2 {
  width: 160rpx; height: 160rpx;
  background: rgba(123, 109, 240, 0.06);
  top: 40rpx; left: -40rpx;
  animation: floatB 5s ease-in-out infinite reverse;
}

@keyframes floatB {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(16rpx); }
}


/* 导航栏 */
.nav-bar {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100rpx 32rpx 16rpx;
}

.nav-back {
  width: 56rpx; height: 56rpx;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.8);
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
}

.nav-add {
  width: 56rpx; height: 56rpx;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.8);
}

/* 日历卡片 */
.calendar-card {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  margin: 16rpx 24rpx;
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx 20rpx 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(79, 172, 254, 0.08);
  opacity: 0;
}

.calendar-card.show {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s;
}

/* 月份切换 */
.month-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding: 0 12rpx;
}

.month-arrow {
  width: 48rpx; height: 48rpx;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;
}

.month-arrow:active {
  background: #f0f4f8;
}

.month-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

/* 星期头 */
.week-header {
  display: flex;
  margin-bottom: 12rpx;
}

.week-cell {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #bbb;
  padding: 8rpx 0;
}

/* 日期格子 */
.days-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  transition: all 0.2s;
  position: relative;
}

.day-cell:not(.empty):active {
  transform: scale(0.9);
}

.day-num {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.day-cell.today .day-num {
  color: #4facfe;
  font-weight: 700;
}

.day-cell.selected {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  box-shadow: 0 4rpx 16rpx rgba(79, 172, 254, 0.3);
}

.day-cell.selected .day-num {
  color: #fff;
  font-weight: 700;
}

.day-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #4facfe;
  margin-top: 4rpx;
  position: absolute;
  bottom: 10rpx;
}

.day-cell.selected .day-dot {
  background: rgba(255,255,255,0.8);
}

/* 选中日期标题 */
.selected-header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 36rpx 12rpx;
}

.selected-label {
  font-size: 26rpx;
  color: #555;
  font-weight: 600;
}

.selected-count {
  font-size: 22rpx;
  color: #bbb;
}

/* 计划列表滚动区 */
.plan-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  position: relative;
  z-index: 10;
}

.plan-list {
  padding: 0 24rpx 40rpx;
}

.plan-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 14rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.plan-card.show {
  opacity: 1;
}

.plan-card:active {
  opacity: 0.85;
}

.plan-left {
  display: flex;
  align-items: center;
  gap: 18rpx;
  flex: 1;
}

.plan-color-bar {
  width: 6rpx;
  height: 44rpx;
  border-radius: 3rpx;
  flex-shrink: 0;
}

.plan-info {
  flex: 1;
}

.plan-name {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  transition: all 0.2s;
}

.plan-name.done {
  color: #ccc;
  text-decoration: line-through;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 8rpx;
}

.plan-time {
  font-size: 22rpx;
  color: #aaa;
}

.plan-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  flex-shrink: 0;
}

.plan-check:active {
  transform: scale(0.9);
}

.plan-check.done {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  border-color: transparent;
  box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.3);
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 80rpx 0 40rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.empty-sub {
  display: block;
  font-size: 22rpx;
  color: #ccc;
  margin-top: 8rpx;
}
</style>
