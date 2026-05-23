import { reactive } from 'vue'
import { getUnreadCount } from './api.js'
import { getAccessToken } from './api.js'

export const store = reactive({ unreadCount: 0 })

/** 从接口刷新角标未读数 */
export function refreshUnreadCount() {
  if (!getAccessToken()) {
    store.unreadCount = 0
    return Promise.resolve(0)
  }
  return getUnreadCount()
    .then(res => {
      const n = res.unreadCount ?? res.count
      store.unreadCount = Number(n) || 0
      return store.unreadCount
    })
    .catch(() => {
      store.unreadCount = 0
      return 0
    })
}
