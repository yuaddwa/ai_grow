import { getAccessToken, BASE_URL } from './api.js'

const BACKOFF_MS = [1000, 2000, 5000, 10000, 30000]

let socketTask = null
let reconnectTimer = null
let listeners = []
let isConnected = false
let backoffIndex = 0

function getWsUrl() {
  const token = getAccessToken()
  if (!token) return null
  const wsBase = BASE_URL.replace(/^https?/, 'ws')
  return wsBase + '/ws/v1/chat?token=' + encodeURIComponent(token)
}

function connect(force = false) {
  if (isConnected && !force) return
  const url = getWsUrl()
  if (!url) return

  if (socketTask) {
    try { socketTask.close({}) } catch (e) {}
    socketTask = null
    isConnected = false
  }

  socketTask = uni.connectSocket({ url, complete: () => {} })

  socketTask.onOpen(() => {
    isConnected = true
    backoffIndex = 0
  })

  socketTask.onMessage((res) => {
    try {
      const data = JSON.parse(res.data)
      listeners.forEach(fn => fn(data))
    } catch (e) {}
  })

  socketTask.onClose(() => {
    isConnected = false
    scheduleReconnect()
  })

  socketTask.onError(() => {
    isConnected = false
    scheduleReconnect()
  })
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer)
  if (!getAccessToken()) return
  const delay = BACKOFF_MS[Math.min(backoffIndex, BACKOFF_MS.length - 1)]
  backoffIndex = Math.min(backoffIndex + 1, BACKOFF_MS.length - 1)
  reconnectTimer = setTimeout(() => connect(true), delay)
}

function disconnect() {
  clearTimeout(reconnectTimer)
  backoffIndex = 0
  if (socketTask) {
    try { socketTask.close({}) } catch (e) {}
    socketTask = null
  }
  isConnected = false
}

/** Token 刷新后换新连接 */
function reconnect() {
  disconnect()
  connect(true)
}

function onMessage(fn) {
  listeners.push(fn)
}

function offMessage(fn) {
  listeners = listeners.filter(l => l !== fn)
}

export { connect, disconnect, reconnect, onMessage, offMessage }
