import { getAccessToken, markNotificationRead } from './api.js'
import { store, refreshUnreadCount } from './store.js'

function toStr(v) {
  if (v == null || v === '') return null
  return String(v)
}

/** 将 FCM data / plus.push 载荷规范为统一对象 */
export function normalizePushPayload(raw) {
  if (!raw) return null
  let data = raw
  if (typeof raw === 'string') {
    try { data = JSON.parse(raw) } catch { return null }
  }
  if (data.payload) data = data.payload
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { return null }
  }
  const type = data.type || data.msgType
  if (!type) return null
  return {
    type,
    notificationId: data.notificationId != null ? Number(data.notificationId) : null,
    sessionId: data.sessionId != null ? Number(data.sessionId) : null,
    messageId: data.messageId != null ? Number(data.messageId) : null,
    taskId: data.taskId != null && data.taskId !== '' ? Number(data.taskId) : null,
    title: data.title || '',
    body: data.body || '',
    unreadCount: data.unreadCount != null ? Number(data.unreadCount) : undefined
  }
}

export function stashPendingSession(sessionId) {
  if (sessionId == null) return
  uni.setStorageSync('pendingOpenSessionId', toStr(sessionId))
}

/** 点击系统通知 / 冷启动：按 type 导航 */
export function navigateFromPushPayload(raw) {
  const data = normalizePushPayload(raw)
  if (!data) return

  if (data.unreadCount !== undefined && !isNaN(data.unreadCount)) {
    store.unreadCount = data.unreadCount
  }

  if (data.notificationId && getAccessToken()) {
    markNotificationRead(data.notificationId)
      .then(() => refreshUnreadCount())
      .catch(() => {})
  }

  switch (data.type) {
    case 'CHAT_REPLY':
    case 'WEEKLY_COMPANION_DIGEST':
    case 'TASK_DUE_REMINDER':
      if (data.sessionId != null) {
        stashPendingSession(data.sessionId)
        uni.reLaunch({ url: '/pages/index/index' })
        return
      }
      if (data.taskId != null) {
        uni.navigateTo({ url: '/pages/tasks/tasks?status=OPEN' })
        return
      }
      if (data.type !== 'CHAT_REPLY') {
        uni.navigateTo({ url: '/pages/notifications/notifications' })
      }
      break
    default:
      break
  }
}
