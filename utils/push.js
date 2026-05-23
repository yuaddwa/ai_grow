import { registerPushToken, deletePushToken, getAccessToken } from './api.js'
import { getOrCreateDeviceId } from './deviceId.js'
import { navigateFromPushPayload, normalizePushPayload } from './pushNavigate.js'
import { handleRealtimeMessage } from './realtime.js'

let listenersBound = false

function getPushPlatform() {
  const sys = uni.getSystemInfoSync()
  return sys.platform === 'ios' ? 'IOS' : 'ANDROID'
}

function requestNotificationPermission() {
  // #ifdef APP-PLUS
  return new Promise((resolve) => {
    if (typeof plus === 'undefined') {
      resolve(false)
      return
    }
    if (plus.os.name === 'Android' && plus.android) {
      try {
        const Build = plus.android.importClass('android.os.Build')
        if (Build.VERSION.SDK_INT >= 33) {
          plus.android.requestPermissions(
            ['android.permission.POST_NOTIFICATIONS'],
            (e) => resolve(!!(e.granted && e.granted.length)),
            () => resolve(false)
          )
          return
        }
      } catch (e) {}
      resolve(true)
      return
    }
    resolve(true)
  })
  // #endif
  // #ifndef APP-PLUS
  return Promise.resolve(false)
  // #endif
}

/** 登录后注册 FCM token（需 manifest Push 模块 + google-services.json） */
export function registerPushIfAllowed() {
  if (!getAccessToken()) return Promise.resolve()
  // #ifdef APP-PLUS
  return requestNotificationPermission().then(() => {
    return new Promise((resolve) => {
      uni.getPushClientId({
        success: async (res) => {
          const token = res && res.cid
          if (!token) {
            resolve()
            return
          }
          try {
            await registerPushToken({
              platform: getPushPlatform(),
              token,
              deviceId: getOrCreateDeviceId()
            })
          } catch (e) {
            console.warn('[push] register failed', e)
          }
          resolve()
        },
        fail: () => resolve()
      })
    })
  })
  // #endif
  // #ifndef APP-PLUS
  return Promise.resolve()
  // #endif
}

export function unregisterPush(allDevices = false) {
  if (!getAccessToken()) return Promise.resolve()
  const deviceId = getOrCreateDeviceId()
  return deletePushToken(allDevices ? null : deviceId).catch(() => {})
}

function storePendingPayload(raw) {
  const data = normalizePushPayload(raw)
  if (data) uni.setStorageSync('pendingPushPayload', data)
}

/** 前台收到 FCM：即时更新角标/列表，并走与 WebSocket 相同的处理逻辑 */
function handleForegroundPush(raw) {
  if (!getAccessToken()) {
    storePendingPayload(raw)
    return
  }
  const data = normalizePushPayload(raw)
  if (!data) return
  handleRealtimeMessage(data)
  storePendingPayload(raw)
}

export function consumePendingPushNavigation() {
  const raw = uni.getStorageSync('pendingPushPayload')
  if (!raw) return
  uni.removeStorageSync('pendingPushPayload')
  if (!getAccessToken()) {
    uni.setStorageSync('pendingPushPayload', raw)
    return
  }
  navigateFromPushPayload(raw)
}

/** App 启动时绑定系统推送（文档 6.4） */
export function setupPushListeners() {
  if (listenersBound) return
  listenersBound = true

  // #ifdef APP-PLUS
  try {
    uni.onPushMessage((res) => {
      const payload = (res && res.data) || res
      handleForegroundPush(payload)
    })
  } catch (e) {}

  try {
    if (typeof plus !== 'undefined' && plus.push) {
      plus.push.addEventListener('click', (msg) => {
        const payload = (msg && msg.payload) || msg
        navigateFromPushPayload(payload)
      }, false)
      plus.push.addEventListener('receive', (msg) => {
        const payload = (msg && msg.payload) || msg
        handleForegroundPush(payload)
      }, false)
    }
  } catch (e) {}
  // #endif
}
