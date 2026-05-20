<template>
  <view class="notify-page">
    <view class="bg-bubbles">
      <view class="bubble b1"></view>
      <view class="bubble b2"></view>
      <view class="bubble b3"></view>
      <view class="bubble b4"></view>
      <view class="bubble b5"></view>
    </view>

    <view class="back-btn" @tap="goBack">
      <text style="font-size:36rpx;color:#333;">‹</text>
    </view>

    <view class="header" :class="{ show: loaded }">
      <view class="header-row">
        <view class="header-texts">
          <text class="title">通知中心</text>
          <text class="subtitle">{{ listMode === 'unread' ? '未读消息' : '全部通知（含已读）' }}</text>
        </view>
        <view
          class="read-all-btn"
          @tap="onReadAll"
          v-if="listMode === 'unread' && hasUnread"
        >
          <text style="font-size:26rpx;color:#4facfe;">✔</text>
          <text>全部已读</text>
        </view>
      </view>
    </view>

    <view class="tab-bar" :class="{ show: loaded }">
      <view
        class="tab-pill"
        :class="{ active: listMode === 'unread' }"
        @tap="switchMode('unread')"
      >
        <text>未读</text>
      </view>
      <view
        class="tab-pill"
        :class="{ active: listMode === 'history' }"
        @tap="switchMode('history')"
      >
        <text>历史</text>
      </view>
    </view>

    <scroll-view
      class="notify-scroll"
      scroll-y
      :bounces="false"
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="notifications.length === 0 && !loading" class="empty-state">
        <text style="font-size:80rpx;opacity:0.3;">📋</text>
        <text class="empty-text">{{ listMode === 'unread' ? '暂无未读通知' : '暂无通知' }}</text>
        <text class="empty-sub">{{ listMode === 'unread' ? '一键已读后这里会为空' : '已读通知也会显示在历史里' }}</text>
      </view>

      <view
        class="notify-card"
        v-for="(item, i) in notifications"
        :key="item.id"
        :class="[{ unread: !item.readAt }, { read: !!item.readAt }, { show: loaded }]"
        :style="{ transitionDelay: (i * 0.06) + 's' }"
        @tap="onTapNotify(item)"
      >
        <view class="notify-dot" v-if="!item.readAt"></view>
        <view class="notify-icon" :class="iconClass(item.type)">
          <text v-if="item.type === 'TASK_DUE_REMINDER'" style="font-size:32rpx;">🔔</text>
          <text v-else-if="item.type === 'WEEKLY_COMPANION_DIGEST'" style="font-size:32rpx;">📅</text>
          <text v-else style="font-size:32rpx;">ℹ️</text>
        </view>
        <view class="notify-body">
          <text class="notify-title">{{ item.title }}</text>
          <text class="notify-text">{{ item.body }}</text>
          <text class="notify-time">{{ formatTime(item.createdAt) }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../utils/api.js'
import { store, refreshUnreadCount } from '../../utils/store.js'
import { onNotificationsChanged } from '../../utils/realtime.js'
import { stashPendingSession } from '../../utils/pushNavigate.js'

const loaded = ref(false)
const loading = ref(false)
const refreshing = ref(false)
const listMode = ref('unread')
const notifications = ref([])

const hasUnread = computed(() => notifications.value.some(n => !n.readAt))

let offNotifyChange = null

onMounted(() => {
  nextTick(() => { setTimeout(() => { loaded.value = true }, 50) })
  loadNotifications()
  offNotifyChange = onNotificationsChanged(() => loadNotifications())
})

onShow(() => {
  refreshUnreadCount()
  loadNotifications()
})

onUnmounted(() => {
  if (offNotifyChange) offNotifyChange()
  offNotifyChange = null
})

async function loadNotifications() {
  loading.value = true
  try {
    const unreadOnly = listMode.value === 'unread'
    const res = await getNotifications(unreadOnly)
    notifications.value = res.items || []
  } catch (e) {
    notifications.value = []
  } finally {
    loading.value = false
  }
}

function switchMode(mode) {
  if (listMode.value === mode) return
  listMode.value = mode
  loadNotifications()
}

function onRefresh() {
  refreshing.value = true
  Promise.all([loadNotifications(), refreshUnreadCount()]).finally(() => {
    refreshing.value = false
  })
}

async function onReadAll() {
  try {
    await markAllNotificationsRead()
    await refreshUnreadCount()
    if (listMode.value === 'unread') {
      notifications.value = []
    } else {
      await loadNotifications()
    }
    uni.showToast({ title: '已全部标记已读', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: (e && e.message) || '操作失败', icon: 'none' })
  }
}

async function onTapNotify(item) {
  if (!item.readAt) {
    try {
      await markNotificationRead(item.id)
      item.readAt = new Date().toISOString()
      await refreshUnreadCount()
      if (listMode.value === 'unread') {
        notifications.value = notifications.value.filter(n => n.id !== item.id)
      }
    } catch (e) {
      uni.showToast({ title: '标记已读失败', icon: 'none' })
      return
    }
  }

  if (item.sessionId) {
    stashPendingSession(item.sessionId)
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }
  if (item.taskId) {
    uni.navigateTo({ url: '/pages/tasks/tasks?status=OPEN' })
  }
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

function iconClass(type) {
  if (type === 'TASK_DUE_REMINDER') return 'icon-task'
  if (type === 'WEEKLY_COMPANION_DIGEST') return 'icon-weekly'
  return 'icon-info'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  const month = d.getMonth() + 1
  const day = d.getDate()
  return month + '月' + day + '日'
}
</script>

<style scoped>
.notify-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fff5e6 0%, #fff8f0 30%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.bg-bubbles { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; overflow: hidden; }
.bubble { position: absolute; border-radius: 50%; opacity: 0.08; }
.b1 { width: 200rpx; height: 200rpx; background: #ffa500; top: -40rpx; right: -30rpx; animation: float1 7s ease-in-out infinite; }
.b2 { width: 140rpx; height: 140rpx; background: #ffb74d; top: 260rpx; left: -40rpx; animation: float2 9s ease-in-out infinite; }
.b3 { width: 100rpx; height: 100rpx; background: #ffcc80; bottom: 400rpx; right: 50rpx; animation: float3 8s ease-in-out infinite; }
.b4 { width: 160rpx; height: 160rpx; background: #ff9800; bottom: 80rpx; left: -30rpx; animation: float1 10s ease-in-out infinite; }
.b5 { width: 70rpx; height: 70rpx; background: #ffe0b2; top: 50%; left: 65%; animation: float2 6s ease-in-out infinite; }

@keyframes float1 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30rpx) scale(1.05); } }
@keyframes float2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(25rpx) translateX(15rpx); } }
@keyframes float3 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20rpx) translateX(-15rpx); } }

.back-btn {
  position: absolute; top: 100rpx; left: 32rpx; z-index: 10;
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: rgba(255,255,255,0.7);
  display: flex; align-items: center; justify-content: center;
}

.header {
  position: relative; z-index: 1;
  padding: 120rpx 48rpx 12rpx 112rpx;
  opacity: 0; transform: translateY(30rpx);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.header.show { opacity: 1; transform: translateY(0); }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; }
.title { display: block; font-size: 48rpx; font-weight: 800; color: #222; letter-spacing: 2rpx; }
.subtitle { display: block; font-size: 26rpx; color: #888; margin-top: 8rpx; }

.read-all-btn {
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 24rpx; border-radius: 24rpx;
  background: rgba(79,172,254,0.08); margin-top: 12rpx;
}
.read-all-btn:active { transform: scale(0.95); }
.read-all-btn text { font-size: 22rpx; color: #4facfe; }

.tab-bar {
  position: relative; z-index: 1;
  display: flex; gap: 16rpx; padding: 12rpx 48rpx 16rpx;
  opacity: 0; transition: opacity 0.6s ease-out 0.1s;
}
.tab-bar.show { opacity: 1; }
.tab-pill {
  padding: 12rpx 28rpx; border-radius: 24rpx;
  background: rgba(255,255,255,0.7); border: 1rpx solid rgba(255,165,0,0.15);
  font-size: 24rpx; color: #888;
}
.tab-pill.active {
  background: linear-gradient(135deg, #ffa500, #ffb74d);
  color: #fff; border-color: transparent;
}

.notify-scroll {
  position: relative; z-index: 1;
  flex: 1; height: 0; min-height: 0; width: 100%;
  padding: 10rpx 32rpx; box-sizing: border-box;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 160rpx; gap: 16rpx;
}
.empty-text { font-size: 30rpx; color: #aaa; font-weight: 600; }
.empty-sub { font-size: 24rpx; color: #ccc; text-align: center; padding: 0 40rpx; }

.notify-card {
  display: flex; gap: 16rpx; padding: 24rpx; position: relative;
  background: rgba(255,255,255,0.92);
  border-radius: 20rpx; margin-bottom: 14rpx;
  box-shadow: 0 2rpx 16rpx rgba(255,165,0,0.05);
  border: 1rpx solid rgba(255,255,255,0.6);
  opacity: 0; transition: opacity 0.35s ease-out;
}
.notify-card.show { opacity: 1; }
.notify-card:active { opacity: 0.85; }
.notify-card.unread { border-left: 6rpx solid #ffa500; }
.notify-card.read { opacity: 0.85; }
.notify-card.read .notify-title { color: #888; font-weight: 500; }

.notify-dot {
  position: absolute; top: 20rpx; right: 20rpx;
  width: 12rpx; height: 12rpx; border-radius: 50%;
  background: #ffa500;
}

.notify-icon {
  flex-shrink: 0; width: 52rpx; height: 52rpx;
  border-radius: 16rpx; display: flex;
  align-items: center; justify-content: center;
}
.icon-task { background: rgba(255,165,0,0.1); color: #ffa500; }
.icon-weekly { background: rgba(123,109,240,0.1); color: #7b6df0; }
.icon-info { background: rgba(79,172,254,0.1); color: #4facfe; }

.notify-body { flex: 1; min-width: 0; }
.notify-title {
  display: block; font-size: 28rpx; font-weight: 600; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.notify-text {
  display: block; font-size: 24rpx; color: #888; margin-top: 6rpx;
  line-height: 1.6; overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.notify-time { display: block; font-size: 20rpx; color: #ccc; margin-top: 8rpx; }
</style>
