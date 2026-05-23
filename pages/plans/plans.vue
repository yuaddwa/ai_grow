<template>
  <view class="plans-page">
    <growth-task-mini-bar />
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
      <text class="selected-count">{{ taskCount }} 项任务</text>
    </view>

    <!-- 当日任务列表 -->
    <scroll-view class="plan-scroll" scroll-y :bounces="false" :show-scrollbar="false">
      <view class="plan-list">
        <view v-if="loadingTasks" class="empty">
          <text class="empty-text">加载中...</text>
        </view>

        <template v-else>
          <view
            v-for="(p, pi) in dayTasks"
            :key="p.id"
            class="plan-card"
            :class="{ show: loaded, locked: p.locked }"
            :style="{ transitionDelay: (pi * 0.08) + 's' }"
            @tap="onTaskTap(p)"
          >
            <view class="plan-left">
              <view class="plan-color-bar" :style="{ background: p.color }"></view>
              <view class="plan-info">
                <text
                  class="plan-name"
                  :class="{ done: p.done, incomplete: p.incomplete, skipped: p.skipped }"
                >{{ p.name }}</text>
                <view class="plan-meta">
                  <text style="font-size:22rpx;">{{ p.metaIcon }}</text>
                  <text class="plan-time">{{ p.time }}</text>
                </view>
              </view>
            </view>
            <view
              class="plan-check"
              :class="{
                done: p.done,
                running: p.running,
                locked: p.locked && !p.done,
                skipped: p.skipped,
                incomplete: p.incomplete,
                starting: startingTaskId === p.id
              }"
              @tap.stop="onCheckTap(p)"
            >
              <text v-if="p.done" style="font-size:28rpx;color:#fff;">✔</text>
              <text v-else-if="p.skipped" class="check-label">跳</text>
              <text v-else-if="p.incomplete" class="check-label muted">—</text>
              <view v-else-if="p.running" class="check-pulse"></view>
              <text v-else-if="p.canStart" style="font-size:28rpx;color:#4facfe;">▶</text>
              <text v-else class="check-label muted">—</text>
            </view>
          </view>

          <view class="empty" v-if="dayTasks.length === 0">
          <text style="font-size:60rpx;opacity:0.3;">📅</text>
          <text class="empty-text">这一天还没有任务</text>
          <text class="empty-sub">与 AI 对话确认成长计划后自动生成</text>
          </view>
        </template>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getGrowthTasksByDate, startGrowthTask } from '../../utils/api.js'
import { openGrowthTaskFocusPage } from '../../utils/growthTaskSession.js'

const loaded = ref(false)
const loadingTasks = ref(false)
const startingTaskId = ref(null)
let pollTimer = null
let endRefreshTimer = null
const weeks = ['日', '一', '二', '三', '四', '五', '六']

const today = new Date()
const curYear = ref(today.getFullYear())
const curMonth = ref(today.getMonth() + 1)
const selectedDate = ref(formatDate(today))
const dayTasks = ref([])
const datesWithTasks = ref({})

const taskCount = computed(() => dayTasks.value.length)

onMounted(() => {
  nextTick(() => { setTimeout(() => { loaded.value = true }, 50) })
  loadTasksForDate(selectedDate.value)
})

onShow(() => {
  if (selectedDate.value) loadTasksForDate(selectedDate.value)
})

onUnmounted(() => {
  clearTaskTimers()
})

watch(selectedDate, (date) => {
  clearTaskTimers()
  loadTasksForDate(date)
})

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
    const hasPlan = !!datesWithTasks.value[full]
    days.push({ day: d, full, isToday, hasPlan })
  }

  return days
})

const FINAL_STATUS = ['COMPLETED', 'SKIPPED', 'INCOMPLETE']

const STATUS_COLORS = {
  COMPLETED: '#67c23a',
  IN_PROGRESS: '#4facfe',
  PENDING: '#7b6df0',
  SKIPPED: '#c0c4cc',
  INCOMPLETE: '#f56c6c'
}

const STATUS_LABELS = {
  PENDING: '待执行',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  SKIPPED: '已跳过',
  INCOMPLETE: '未完成'
}

function formatTimeFromIso(iso) {
  if (!iso) return ''
  const m = String(iso).match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : ''
}

function isPlanActionDay(viewDate, scheduledDate) {
  return viewDate === formatDate(today) && scheduledDate === viewDate
}

function formatRemaining(plannedEndAt) {
  if (!plannedEndAt) return '进行中'
  const end = new Date(plannedEndAt).getTime()
  if (Number.isNaN(end)) return '进行中'
  const min = Math.ceil((end - Date.now()) / 60000)
  if (min <= 0) return '即将结束…'
  return `进行中 · 约 ${min} 分钟后结束`
}

function formatTaskTime(task, status) {
  if (status === 'INCOMPLETE') return '已过期未完成'
  if (status === 'SKIPPED') return '已跳过'
  if (status === 'IN_PROGRESS') return formatRemaining(task.plannedEndAt)
  const start = formatTimeFromIso(task.startedAt)
  const end = formatTimeFromIso(task.plannedEndAt)
  if (start && end) return `${start} - ${end}`
  if (start) return start
  if (task.estimatedMinutes) return `约 ${task.estimatedMinutes} 分钟`
  return ''
}

function mapGrowthTask(task, viewDate) {
  const status = task.status || 'PENDING'
  const scheduledDate = task.scheduledDate || viewDate
  const isFinal = FINAL_STATUS.includes(status)
  const canActOnDay = isPlanActionDay(viewDate, scheduledDate)
  const running = status === 'IN_PROGRESS'
  const done = status === 'COMPLETED'
  const skipped = status === 'SKIPPED'
  const incomplete = status === 'INCOMPLETE'
  const canStart = status === 'PENDING' && canActOnDay
  const canCompleteEarly = running && canActOnDay
  const locked = isFinal || (!canStart && !canCompleteEarly)

  let metaIcon = '⏰'
  if (running) metaIcon = '⏳'
  else if (incomplete) metaIcon = '⚠️'
  else if (skipped) metaIcon = '⊘'

  return {
    id: task.id,
    name: task.title || '未命名任务',
    time: formatTaskTime(task, status),
    date: scheduledDate,
    color: STATUS_COLORS[status] || '#7b6df0',
    done,
    skipped,
    incomplete,
    running,
    locked,
    canStart,
    canCompleteEarly,
    canActOnDay,
    status,
    metaIcon,
    description: task.description || '',
    plannedEndAt: task.plannedEndAt || '',
    startedAt: task.startedAt || '',
    estimatedMinutes: task.estimatedMinutes
  }
}

function toFocusTask(p) {
  return {
    id: p.id,
    title: p.name,
    description: p.description,
    scheduledDate: p.date,
    startedAt: p.startedAt,
    plannedEndAt: p.plannedEndAt,
    estimatedMinutes: p.estimatedMinutes,
    status: 'IN_PROGRESS'
  }
}

function openFocusSession(p) {
  openGrowthTaskFocusPage(toFocusTask(p))
}

function clearTaskTimers() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (endRefreshTimer) {
    clearTimeout(endRefreshTimer)
    endRefreshTimer = null
  }
}

function scheduleTaskRefresh() {
  clearTaskTimers()
  const running = dayTasks.value.filter(t => t.running && t.plannedEndAt)
  if (!running.length) return

  pollTimer = setInterval(() => {
    loadTasksForDate(selectedDate.value, { silent: true })
  }, 30000)

  let nearestEnd = Infinity
  for (const t of running) {
    const end = new Date(t.plannedEndAt).getTime()
    if (!Number.isNaN(end) && end > Date.now()) {
      nearestEnd = Math.min(nearestEnd, end)
    }
  }
  if (nearestEnd !== Infinity) {
    endRefreshTimer = setTimeout(() => {
      loadTasksForDate(selectedDate.value, { silent: true })
    }, nearestEnd - Date.now() + 800)
  }
}

function upsertDayTask(rawTask) {
  if (!rawTask || rawTask.id == null) return
  const mapped = mapGrowthTask(rawTask, selectedDate.value)
  const i = dayTasks.value.findIndex(t => t.id === mapped.id)
  if (i >= 0) {
    dayTasks.value = dayTasks.value.map((t, idx) => (idx === i ? mapped : t))
  } else {
    dayTasks.value = [...dayTasks.value, mapped]
  }
  scheduleTaskRefresh()
}

async function loadTasksForDate(date, options = {}) {
  if (!date) return
  const { silent = false } = options
  if (!silent) loadingTasks.value = true
  try {
    const res = await getGrowthTasksByDate(date)
    const list = (res.tasks || []).map(t => mapGrowthTask(t, date))
    dayTasks.value = list
    datesWithTasks.value = {
      ...datesWithTasks.value,
      [date]: (res.count != null ? res.count : list.length) > 0
    }
    scheduleTaskRefresh()
  } catch (e) {
    if (!silent) {
      dayTasks.value = []
      uni.showToast({ title: e.message || '加载任务失败', icon: 'none' })
    }
  } finally {
    if (!silent) loadingTasks.value = false
  }
}

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

function lockedToast(p) {
  if (p.incomplete) {
    return '该任务已过期未完成，无法开始或完成'
  }
  if (p.skipped) return '该任务已跳过'
  if (p.done) return '该任务已完成'
  if (p.status === 'PENDING' && !p.canActOnDay) {
    return selectedDate.value === formatDate(today)
      ? '仅可在计划日当天操作'
      : '请切换到计划日当天再操作'
  }
  return '当前状态无法操作'
}

async function onCheckTap(p) {
  if (p.locked) {
    uni.showToast({ title: lockedToast(p), icon: 'none' })
    return
  }
  if (startingTaskId.value) return

  if (p.canCompleteEarly) {
    openFocusSession(p)
    return
  }
  if (!p.canStart) return

  startingTaskId.value = p.id
  try {
    const updated = await startGrowthTask(p.id)
    if (updated && updated.id != null) {
      upsertDayTask(updated)
      if (updated.status === 'IN_PROGRESS') {
        openGrowthTaskFocusPage(updated)
        return
      }
    } else {
      await loadTasksForDate(selectedDate.value, { silent: true })
      const running = dayTasks.value.find(t => t.id === p.id && t.running)
      if (running) openFocusSession(running)
      return
    }
    uni.showToast({ title: '已开始执行', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: e.message || '开始失败', icon: 'none' })
  } finally {
    startingTaskId.value = null
  }
}

function goBack() {
  if (p.running) {
    openFocusSession(p)
    return
  }
  const statusLabel = STATUS_LABELS[p.status] || p.status
  let hint = ''
  if (p.canStart) hint = '，点击 ▶ 开始'
  else if (p.incomplete) hint = '，已过期不可操作'
  uni.showToast({
    title: p.name + ' · ' + statusLabel + hint,
    icon: 'none',
    duration: 2500
  })
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

.plan-card.locked:active {
  opacity: 1;
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

.plan-name.incomplete {
  color: #e6a0a0;
}

.plan-name.skipped {
  color: #bbb;
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

.plan-check.running {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.12);
}

.plan-check.locked,
.plan-check.incomplete,
.plan-check.skipped {
  border-color: #e8e8e8;
  background: #f7f7f7;
}

.plan-check.incomplete {
  border-color: #f5d0d0;
  background: #fff5f5;
}

.check-label {
  font-size: 22rpx;
  color: #999;
  font-weight: 600;
}

.check-label.muted {
  color: #ccc;
}

.plan-check.starting {
  opacity: 0.6;
}

.check-pulse {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #4facfe;
  animation: checkPulse 1s ease-in-out infinite;
}

@keyframes checkPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.75); opacity: 0.5; }
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
