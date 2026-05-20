/**
 * 对话本地缓存：最近 10 个会话的完整消息 + 当前 sessionId
 */

const CACHE_KEY = 'ai_chat_sessions_cache'
const CURRENT_KEY = 'ai_chat_current_session_id'
const MAX_CACHED_SESSIONS = 10

function readCache() {
  try {
    const raw = uni.getStorageSync(CACHE_KEY)
    return raw && typeof raw === 'object' ? raw : {}
  } catch (e) {
    return {}
  }
}

function writeCache(map) {
  uni.setStorageSync(CACHE_KEY, map)
}

export function isSessionCached(sessionId) {
  const map = readCache()
  const data = map[String(sessionId)]
  return !!(data && Array.isArray(data.messages) && data.messages.length > 0)
}

export function getCachedSession(sessionId) {
  const map = readCache()
  return map[String(sessionId)] || null
}

export function setCachedSession(sessionId, data) {
  if (!sessionId || !data) return
  const id = String(sessionId)
  const map = readCache()
  map[id] = {
    sessionId: data.sessionId ?? sessionId,
    sessionTitle: data.sessionTitle || '新对话',
    messages: data.messages || [],
    updatedAt: new Date().toISOString()
  }

  const keys = Object.keys(map)
  if (keys.length > MAX_CACHED_SESSIONS) {
    const sorted = keys.sort((a, b) => {
      const ta = new Date((map[a] && map[a].updatedAt) || 0).getTime()
      const tb = new Date((map[b] && map[b].updatedAt) || 0).getTime()
      return tb - ta
    })
    while (Object.keys(map).length > MAX_CACHED_SESSIONS) {
      const removeKey = sorted.pop()
      if (removeKey && removeKey !== id) delete map[removeKey]
      else break
    }
  }

  writeCache(map)
}

export function saveCurrentSessionId(sessionId) {
  if (sessionId) uni.setStorageSync(CURRENT_KEY, sessionId)
}

export function getCurrentSessionId() {
  const v = uni.getStorageSync(CURRENT_KEY)
  return v || null
}

export function clearCurrentSessionId() {
  uni.removeStorageSync(CURRENT_KEY)
}

export function clearAllChatHistory() {
  uni.removeStorageSync(CACHE_KEY)
  uni.removeStorageSync(CURRENT_KEY)
}
