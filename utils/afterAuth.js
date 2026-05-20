import { connect, onMessage } from './websocket.js'
import { refreshUnreadCount } from './store.js'
import { registerPushIfAllowed } from './push.js'
import { handleRealtimeMessage } from './realtime.js'

let realtimeBound = false

export function bindRealtimeHandler() {
  if (realtimeBound) return
  realtimeBound = true
  onMessage(handleRealtimeMessage)
}

/** 登录/注册成功后：角标、WebSocket、FCM 注册（文档 7.1） */
export function onAuthSuccess() {
  bindRealtimeHandler()
  refreshUnreadCount()
  connect()
  registerPushIfAllowed()
}
