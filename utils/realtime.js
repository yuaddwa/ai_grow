import { store, refreshUnreadCount } from './store.js'
import { playNotificationSound } from './notifySound.js'
import { normalizePushPayload } from './pushNavigate.js'

const chatReplyListeners = []
const notifyListeners = []

export function onChatReply(fn) {
  chatReplyListeners.push(fn)
  return () => {
    const i = chatReplyListeners.indexOf(fn)
    if (i >= 0) chatReplyListeners.splice(i, 1)
  }
}

export function onNotificationsChanged(fn) {
  notifyListeners.push(fn)
  return () => {
    const i = notifyListeners.indexOf(fn)
    if (i >= 0) notifyListeners.splice(i, 1)
  }
}

function emitNotifyChange() {
  notifyListeners.forEach(fn => {
    try { fn() } catch (e) {}
  })
}

function parseRealtimeRaw(raw) {
  if (!raw) return null
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return raw
}

/** WebSocket 下行统一处理（文档 4.2 / 4.3） */
export function handleRealtimeMessage(raw) {
  const incoming = parseRealtimeRaw(raw)
  if (!incoming) return

  if (incoming.unreadCount !== undefined && (incoming.type == null || incoming.type === '')) {
    store.unreadCount = Number(incoming.unreadCount) || 0
    return
  }

  const data = normalizePushPayload(incoming)
  if (!data || !data.type) return

  switch (data.type) {
    case 'TASK_DUE_REMINDER':
    case 'WEEKLY_COMPANION_DIGEST':
      if (data.unreadCount !== undefined) {
        store.unreadCount = Number(data.unreadCount) || 0
      } else {
        refreshUnreadCount()
      }
      emitNotifyChange()
      playNotificationSound()
      uni.showToast({
        title: data.title || (data.type === 'WEEKLY_COMPANION_DIGEST' ? '本周回顾' : '任务提醒'),
        icon: 'none',
        duration: 2800
      })
      break
    case 'CHAT_REPLY':
      if (data.unreadCount !== undefined) {
        store.unreadCount = Number(data.unreadCount) || 0
      }
      playNotificationSound()
      chatReplyListeners.forEach(fn => {
        try { fn(data) } catch (e) {}
      })
      break
    default:
      break
  }
}
