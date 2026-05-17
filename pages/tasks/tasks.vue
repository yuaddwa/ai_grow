<template>
  <view class="tasks-page">
    <!-- 动态背景 -->
    <view class="bg-bubbles">
      <view class="bubble b1"></view>
      <view class="bubble b2"></view>
      <view class="bubble b3"></view>
      <view class="bubble b4"></view>
      <view class="bubble b5"></view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="15,18 9,12 15,6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </view>

    <!-- 标题 -->
    <view class="header" :class="{ show: loaded }">
      <text class="title">我的任务</text>
      <text class="subtitle">管理你的待办事项</text>
    </view>

    <!-- 状态筛选 -->
    <view class="tab-bar" :class="{ show: loaded }">
      <view
        class="tab-pill"
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @tap="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view class="task-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view v-if="tasks.length === 0 && !loading" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="#d4ecff" stroke-width="1.2"/>
          <path d="M9 12l2 2 4-4" stroke="#a8d8ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <text class="empty-text">暂无任务</text>
        <text class="empty-sub">与 AI 对话，创建你的第一个任务</text>
      </view>

      <view
        class="task-card"
        v-for="(task, i) in tasks"
        :key="task.id"
        :style="{ animationDelay: (i * 0.08) + 's' }"
        @tap="onTaskTap(task)"
      >
        <view class="task-left">
          <view class="task-status-dot" :class="statusClass(task.status)"></view>
        </view>
        <view class="task-body">
          <text class="task-title">{{ task.title }}</text>
          <text class="task-desc" v-if="task.description">{{ task.description }}</text>
          <view class="task-meta">
            <view class="meta-item" v-if="task.dueDate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#99c4e8" stroke-width="1.3"/>
                <polyline points="12,6 12,12 16,14" stroke="#99c4e8" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <text class="meta-text">{{ task.dueDate }}</text>
            </view>
            <view class="task-tag" :class="statusClass(task.status)">{{ statusText(task.status) }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyTasks } from '../../utils/api.js'

const loaded = ref(false)
const loading = ref(false)
const refreshing = ref(false)
const activeTab = ref('')
const tasks = ref([])

const tabs = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'OPEN' },
  { label: '已完成', value: 'DONE' },
  { label: '已取消', value: 'CANCELLED' }
]

setTimeout(() => { loaded.value = true }, 80)

onMounted(() => { loadTasks() })

async function loadTasks() {
  loading.value = true
  try {
    const res = await getMyTasks(activeTab.value || undefined)
    tasks.value = res.tasks || []
  } catch (e) {
    tasks.value = []
  } finally {
    loading.value = false
  }
}

function switchTab(value) {
  activeTab.value = value
  loadTasks()
}

function onRefresh() {
  refreshing.value = true
  loadTasks().finally(() => {
    refreshing.value = false
    uni.stopPullDownRefresh()
  })
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

function onTaskTap(task) {
  uni.showToast({ title: task.title, icon: 'none' })
}

function statusClass(status) {
  return { OPEN: 'open', DONE: 'done', CANCELLED: 'cancelled' }[status] || 'open'
}

function statusText(status) {
  return { OPEN: '进行中', DONE: '已完成', CANCELLED: '已取消' }[status] || '进行中'
}
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 40%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

/* 动态气泡 */
.bg-bubbles {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0; overflow: hidden;
}
.bubble { position: absolute; border-radius: 50%; opacity: 0.1; }
.b1 { width: 200rpx; height: 200rpx; background: #4facfe; top: -40rpx; right: -30rpx; animation: float1 7s ease-in-out infinite; }
.b2 { width: 140rpx; height: 140rpx; background: #00f2fe; top: 260rpx; left: -40rpx; animation: float2 9s ease-in-out infinite; }
.b3 { width: 100rpx; height: 100rpx; background: #a8d8ff; bottom: 400rpx; right: 50rpx; animation: float3 8s ease-in-out infinite; }
.b4 { width: 160rpx; height: 160rpx; background: #6cb4ee; bottom: 80rpx; left: -30rpx; animation: float1 10s ease-in-out infinite; }
.b5 { width: 70rpx; height: 70rpx; background: #74b9ff; top: 50%; left: 65%; animation: float2 6s ease-in-out infinite; }

@keyframes float1 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30rpx) scale(1.05); } }
@keyframes float2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(25rpx) translateX(15rpx); } }
@keyframes float3 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20rpx) translateX(-15rpx); } }

/* 返回按钮 */
.back-btn {
  position: absolute; top: 100rpx; left: 32rpx; z-index: 10;
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: rgba(255,255,255,0.7); backdrop-filter: blur(10rpx);
  display: flex; align-items: center; justify-content: center;
}

/* 头部 */
.header {
  position: relative; z-index: 1;
  padding: 120rpx 48rpx 20rpx;
  opacity: 0; transform: translateY(30rpx);
  transition: all 0.6s ease-out;
}
.header.show { opacity: 1; transform: translateY(0); }
.title { display: block; font-size: 48rpx; font-weight: 800; color: #222; letter-spacing: 2rpx; }
.subtitle { display: block; font-size: 26rpx; color: #888; margin-top: 8rpx; }

/* 筛选 tab */
.tab-bar {
  position: relative; z-index: 1;
  display: flex; gap: 16rpx; padding: 20rpx 48rpx;
  opacity: 0; transition: opacity 0.6s ease-out 0.15s;
}
.tab-bar.show { opacity: 1; }
.tab-pill {
  padding: 12rpx 28rpx; border-radius: 24rpx;
  background: rgba(255,255,255,0.7); border: 1rpx solid rgba(79,172,254,0.12);
  font-size: 24rpx; color: #888; transition: all 0.3s;
}
.tab-pill.active {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  color: #fff; border-color: transparent;
  box-shadow: 0 4rpx 16rpx rgba(79,172,254,0.3);
}

/* 任务列表 */
.task-scroll {
  position: relative; z-index: 1;
  flex: 1; height: calc(100vh - 340rpx); padding: 10rpx 32rpx;
}

/* 空状态 */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 160rpx; gap: 16rpx;
}
.empty-text { font-size: 30rpx; color: #aaa; font-weight: 600; }
.empty-sub { font-size: 24rpx; color: #ccc; }

/* 任务卡片 */
.task-card {
  display: flex; gap: 20rpx; padding: 28rpx;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(20rpx);
  border-radius: 24rpx; margin-bottom: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(79,172,254,0.06);
  border: 1rpx solid rgba(255,255,255,0.6);
  animation: fadeInUp 0.4s ease-out both;
  transition: transform 0.2s;
}
.task-card:active { transform: scale(0.98); }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.task-left { flex-shrink: 0; padding-top: 8rpx; }
.task-status-dot {
  width: 16rpx; height: 16rpx; border-radius: 50%;
}
.task-status-dot.open { background: #4facfe; }
.task-status-dot.done { background: #6bcb77; }
.task-status-dot.cancelled { background: #ccc; }

.task-body { flex: 1; min-width: 0; }
.task-title {
  display: block; font-size: 28rpx; font-weight: 600; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.task-desc {
  display: block; font-size: 24rpx; color: #999; margin-top: 8rpx;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.task-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12rpx;
}
.meta-item { display: flex; align-items: center; gap: 6rpx; }
.meta-text { font-size: 22rpx; color: #99c4e8; }

.task-tag {
  padding: 4rpx 16rpx; border-radius: 12rpx; font-size: 20rpx;
}
.task-tag.open { background: rgba(79,172,254,0.1); color: #4facfe; }
.task-tag.done { background: rgba(107,203,119,0.1); color: #6bcb77; }
.task-tag.cancelled { background: rgba(200,200,200,0.2); color: #aaa; }
</style>
