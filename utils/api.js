// API 基础配置
import { clearAllChatHistory } from './chatHistory.js'
import { getOrCreateDeviceId } from './deviceId.js'

const BASE_URL = 'http://192.168.3.3:8080'

// 获取存储的令牌
function getAccessToken() {
  return uni.getStorageSync('accessToken') || ''
}

function getRefreshToken() {
  return uni.getStorageSync('refreshToken') || ''
}

// 保存令牌
function saveTokens(data) {
  if (data.accessToken) uni.setStorageSync('accessToken', data.accessToken)
  if (data.refreshToken) uni.setStorageSync('refreshToken', data.refreshToken)
  if (data.uid) uni.setStorageSync('uid', data.uid)
  uni.setStorageSync('isLogin', true)
}

// 清除令牌
function clearTokens() {
  uni.removeStorageSync('accessToken')
  uni.removeStorageSync('refreshToken')
  uni.removeStorageSync('uid')
  uni.removeStorageSync('isLogin')
  uni.removeStorageSync('userInfo')
  clearAllChatHistory()
}

// 统一请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    const { url, method = 'POST', data = {}, auth = false } = options

    const header = { 'Content-Type': 'application/json' }
    if (auth) {
      header['Authorization'] = 'Bearer ' + getAccessToken()
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      success: (res) => {
        // HTTP 401 → 尝试刷新令牌
        if (res.statusCode === 401 && auth) {
          refreshToken().then(() => {
            // 刷新成功，重试原请求
            header['Authorization'] = 'Bearer ' + getAccessToken()
            uni.request({
              url: BASE_URL + url,
              method,
              data,
              header,
              success: (retryRes) => {
                if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
                  resolve(retryRes.data)
                } else {
                  reject(retryRes.data || { code: 'ERROR', message: '请求失败' })
                }
              },
              fail: (err) => reject({ code: 'NETWORK_ERROR', message: '网络异常' })
            })
          }).catch(() => {
            clearTokens()
            uni.reLaunch({ url: '/pages/login/login' })
            reject({ code: 'UNAUTHORIZED', message: '登录已过期' })
          })
          return
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res.data || { code: 'ERROR', message: '请求失败(' + res.statusCode + ')' })
        }
      },
      fail: (err) => {
        reject({ code: 'NETWORK_ERROR', message: '网络连接失败，请检查网络' })
      }
    })
  })
}

// 刷新令牌
function refreshToken() {
  return new Promise((resolve, reject) => {
    const rt = getRefreshToken()
    if (!rt) {
      reject(new Error('无刷新令牌'))
      return
    }
    uni.request({
      url: BASE_URL + '/api/v1/auth/refresh',
      method: 'POST',
      data: { refreshToken: rt },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          saveTokens(res.data)
          import('./websocket.js').then(m => m.reconnect())
          resolve(res.data)
        } else {
          clearTokens()
          reject(new Error('刷新失败'))
        }
      },
      fail: () => {
        clearTokens()
        reject(new Error('刷新失败'))
      }
    })
  })
}

// ============ 业务接口 ============

// 更新用户资料
export function updateProfile(data) {
  return request({
    url: '/api/v1/users/me',
    method: 'PATCH',
    data,
    auth: true
  })
}

// 上传头像（multipart）
export function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    const token = getAccessToken()
    uni.uploadFile({
      url: BASE_URL + '/api/v1/users/me/avatar',
      filePath,
      name: 'file',
      header: { 'Authorization': 'Bearer ' + token },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(res.data))
          } catch (e) {
            reject({ code: 'ERROR', message: '响应解析失败' })
          }
        } else {
          try {
            reject(JSON.parse(res.data))
          } catch (e) {
            reject({ code: 'ERROR', message: '上传失败(' + res.statusCode + ')' })
          }
        }
      },
      fail: () => reject({ code: 'NETWORK_ERROR', message: '上传失败' })
    })
  })
}

// 更新首次画像
export function updateOnboarding(data) {
  return request({
    url: '/api/v1/users/me/onboarding',
    method: 'PATCH',
    data,
    auth: true
  })
}

// 注销账号（软删除）
export function deleteAccount() {
  return request({
    url: '/api/v1/users/me',
    method: 'DELETE',
    auth: true
  }).finally(() => {
    clearTokens()
  })
}

// 登录
export function login(account, password) {
  return request({
    url: '/api/v1/auth/login',
    data: { account, password }
  }).then(res => {
    saveTokens(res)
    return res
  })
}

// 注册 - 发送验证码
export function sendRegisterCode(email) {
  return request({
    url: '/api/v1/auth/register/send-code',
    data: { email }
  })
}

// 注册
export function register({ email, password, nickname, verificationCode }) {
  return request({
    url: '/api/v1/auth/register',
    data: { email, password, nickname, verificationCode }
  }).then(res => {
    saveTokens(res)
    return res
  })
}

// 忘记密码 - 发送验证码
export function sendResetCode(account) {
  return request({
    url: '/api/v1/auth/password/reset/send-code',
    data: { account }
  })
}

// 重置密码
export function resetPassword({ account, verificationCode, newPassword }) {
  return request({
    url: '/api/v1/auth/password/reset',
    data: { account, verificationCode, newPassword }
  })
}

// 获取当前用户资料
export function getUserInfo() {
  return request({
    url: '/api/v1/users/me',
    method: 'GET',
    auth: true
  })
}

// 登出（先注销 FCM，再断 WS，再清 token — 文档 7.5）
export function logout(allDevices = false) {
  const deviceId = getOrCreateDeviceId()
  const pushUrl = allDevices
    ? '/api/v1/users/me/push-tokens'
    : '/api/v1/users/me/push-tokens?deviceId=' + encodeURIComponent(deviceId)

  return request({ url: pushUrl, method: 'DELETE', auth: true })
    .catch(() => {})
    .then(() => request({
      url: '/api/v1/auth/logout',
      data: { allDevices },
      auth: true
    }))
    .catch(() => {})
    .finally(() => {
      import('./websocket.js').then(m => m.disconnect())
      clearTokens()
    })
}

// ============ FCM 推送 token（文档 6.2 / 6.3） ============

export function registerPushToken({ platform, token, deviceId }) {
  return request({
    url: '/api/v1/users/me/push-tokens',
    method: 'PUT',
    data: { platform, token, deviceId },
    auth: true
  })
}

export function deletePushToken(deviceId) {
  const q = deviceId ? '?deviceId=' + encodeURIComponent(deviceId) : ''
  return request({
    url: '/api/v1/users/me/push-tokens' + q,
    method: 'DELETE',
    auth: true
  })
}

// 修改密码
export function changePassword(oldPassword, newPassword) {
  return request({
    url: '/api/v1/auth/change-password',
    data: { oldPassword, newPassword },
    auth: true
  })
}

// ============ AI 对话 ============

// 语音转文字
export function transcribeAudio(filePath) {
  return new Promise((resolve, reject) => {
    const token = getAccessToken()
    let tried = 0
    const doUpload = () => {
      uni.uploadFile({
        url: BASE_URL + '/api/v1/speech/transcribe',
        filePath,
        name: 'file',
        header: { 'Authorization': 'Bearer ' + token },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(res.data)) }
            catch (e) { reject({ code: 'ERROR', message: '响应解析失败' }) }
          } else if (res.statusCode === 401) {
            reject({ code: 'UNAUTHORIZED', message: '登录已过期' })
          } else {
            try { reject(JSON.parse(res.data)) }
            catch (e) { reject({ code: 'ERROR', message: '语音识别失败(' + res.statusCode + ')' }) }
          }
        },
        fail: (err) => {
          const msg = (err && err.errMsg) || ''
          console.error('transcribeAudio upload fail:', msg)
          if (msg.includes('exceed max upload') && tried < 3) {
            tried++
            console.warn('uploadFile retry', tried, 'in', tried * 500, 'ms')
            setTimeout(doUpload, tried * 500)
          } else {
            reject({ code: 'NETWORK_ERROR', message: msg.includes('fail') ? '上传失败，请检查网络' : '上传失败' })
          }
        }
      })
    }
    doUpload()
  })
}

// 发送对话消息
export function sendChatMessage(message, sessionId, provider) {
  const data = { message }
  if (sessionId) data.sessionId = sessionId
  if (provider) data.provider = provider
  return request({
    url: '/api/v1/ai/chat',
    data,
    auth: true
  })
}

// 用户历史会话列表（按最近更新倒序）
export function getChatSessions(page = 0, size = 20) {
  return request({
    url: '/api/v1/ai/chat/sessions?page=' + page + '&size=' + size,
    method: 'GET',
    auth: true
  })
}

// 某会话的消息（按时间升序分页）
export function getChatMessages(sessionId, page = 0, size = 50) {
  return request({
    url: '/api/v1/ai/chat/sessions/' + sessionId + '/messages?page=' + page + '&size=' + size,
    method: 'GET',
    auth: true
  })
}

// 拉取某会话全部消息（自动翻页）
export function fetchAllChatMessages(sessionId, size = 50) {
  let page = 0
  let allMessages = []
  let sessionTitle = ''
  let sessionIdOut = sessionId
  let hasNext = true

  const loadPage = () => {
    return getChatMessages(sessionId, page, size).then(data => {
      sessionTitle = data.sessionTitle || sessionTitle
      sessionIdOut = data.sessionId != null ? data.sessionId : sessionIdOut
      const batch = data.messages || []
      allMessages = allMessages.concat(batch)
      hasNext = !!data.hasNext
      if (hasNext) {
        page += 1
        if (page > 200) return { sessionId: sessionIdOut, sessionTitle, messages: allMessages }
        return loadPage()
      }
      return { sessionId: sessionIdOut, sessionTitle, messages: allMessages }
    })
  }

  return loadPage()
}

// 解析媒体 URL（相对路径补全为 BASE_URL）
export function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^(https?:|wxfile:|file:|blob:|data:)/.test(url)) return url
  return BASE_URL + (url.startsWith('/') ? url : '/' + url)
}

// ============ 成长计划草案 ============

export function getPlanProposal(proposalId) {
  return request({
    url: '/api/v1/growth/plan-proposals/' + proposalId,
    method: 'GET',
    auth: true
  })
}

// 某会话下的计划草案列表（用于历史对话还原；若无此接口则返回空列表）
export function getPlanProposalsBySession(sessionId) {
  return request({
    url: '/api/v1/growth/plan-proposals?sessionId=' + sessionId,
    method: 'GET',
    auth: true
  })
}

export function confirmPlanProposal(proposalId) {
  return request({
    url: '/api/v1/growth/plan-proposals/' + proposalId + '/confirm',
    method: 'POST',
    data: {},
    auth: true
  })
}

export function rejectPlanProposal(proposalId) {
  return request({
    url: '/api/v1/growth/plan-proposals/' + proposalId + '/reject',
    method: 'POST',
    data: {},
    auth: true
  })
}

// ============ 助手任务 ============

// 查询当前用户的助手任务
export function getMyTasks(status) {
  const params = status ? '?status=' + status : ''
  return request({
    url: '/api/v1/users/me/tasks' + params,
    method: 'GET',
    auth: true
  })
}

// ============ 站内通知 ============

// 未读数量
export function getUnreadCount() {
  return request({
    url: '/api/v1/users/me/notifications/unread-count',
    method: 'GET',
    auth: true
  })
}

// 通知列表（unreadOnly=true 为未读收件箱；默认 false 为含已读历史）
export function getNotifications(unreadOnly = false) {
  const params = unreadOnly ? '?unreadOnly=true' : ''
  return request({
    url: '/api/v1/users/me/notifications' + params,
    method: 'GET',
    auth: true
  })
}

// 标记单条已读
export function markNotificationRead(id) {
  return request({
    url: '/api/v1/users/me/notifications/' + id + '/read',
    method: 'PATCH',
    auth: true
  })
}

// 全部标记已读
export function markAllNotificationsRead() {
  return request({
    url: '/api/v1/users/me/notifications/read-all',
    method: 'PATCH',
    auth: true
  })
}

export { saveTokens, clearTokens, getAccessToken, BASE_URL }
