import { getAccessToken, BASE_URL } from './api.js'

let socketTask = null
let reconnectTimer = null
let listeners = []
let isConnected = false

function getWsUrl() {
  const token = getAccessToken()
  if (!token) return null
  const wsBase = BASE_URL.replace(/^http/, 'ws')
  return wsBase + '/ws/v1/chat?token=' + encodeURIComponent(token)
}

function connect() {
  if (isConnected) return
  const url = getWsUrl()
  if (!url) return

  socketTask = uni.connectSocket({ url, complete: () => {} })

  socketTask.onOpen(() => {
    isConnected = true
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
  reconnectTimer = setTimeout(() => {
    const token = getAccessToken()
    if (token) connect()
  }, 3000)
}

function disconnect() {
  clearTimeout(reconnectTimer)
  if (socketTask) {
    socketTask.close({})
    socketTask = null
  }
  isConnected = false
}

function onMessage(fn) {
  listeners.push(fn)
}

function offMessage(fn) {
  listeners = listeners.filter(l => l !== fn)
}

export { connect, disconnect, onMessage, offMessage }
