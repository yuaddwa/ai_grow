const STORAGE_KEY = 'clientDeviceId'

/** 客户端稳定设备 UUID（与登录 deviceId 无关；FCM 注册用） */
export function getOrCreateDeviceId() {
  let id = uni.getStorageSync(STORAGE_KEY)
  if (id && typeof id === 'string' && id.length <= 64) return id
  id = 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12)
  if (id.length > 64) id = id.slice(0, 64)
  uni.setStorageSync(STORAGE_KEY, id)
  return id
}
