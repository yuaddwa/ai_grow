import { store, refreshUnreadCount } from './store.js'

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

/** WebSocket 下行统一处理（文档 4.2 / 4.3） */
export function handleRealtimeMessage(data) {
  if (!data) return

  if (data.unreadCount !== undefined && data.type == null) {
    store.unreadCount = Number(data.unreadCount) || 0
    return
  }

  if (!data.type) return

  switch (data.type) {
    case 'TASK_DUE_REMINDER':
    case 'WEEKLY_COMPANION_DIGEST':
      if (data.unreadCount !== undefined) {
        store.unreadCount = Number(data.unreadCount) || 0
      } else {
        refreshUnreadCount()
      }
      emitNotifyChange()
      // #ifdef APP-PLUS
      if (data.title) {
        uni.showToast({ title: data.title, icon: 'none', duration: 2500 })
      }
      // #endif
      break
    case 'CHAT_REPLY':
      if (data.unreadCount !== undefined) {
        store.unreadCount = Number(data.unreadCount) || 0
      }
      chatReplyListeners.forEach(fn => {
        try { fn(data) } catch (e) {}
      })
      break
    default:
      break
  }
}
