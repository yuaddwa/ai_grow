<template>
  <view class="page">
    <view class="banner" :class="{ show: loaded }">
      <view class="banner-row">
        <text style="font-size:48rpx;">🤖</text>
        <view class="banner-texts">
          <text class="banner-title">AI成长</text>
          <text class="banner-sub">你的智能计划助手</text>
        </view>
        <view class="plan-entry" @tap="goNotifications">
          <text style="font-size:28rpx;color:#fff;">🔔</text>
          <view class="badge" v-if="store.unreadCount > 0">
            <text class="badge-text">{{ store.unreadCount > 99 ? '99+' : store.unreadCount }}</text>
          </view>
        </view>
        <view class="plan-entry" @tap="goTasks">
          <text style="font-size:28rpx;color:#fff;">📋</text>
        </view>
        <view class="plan-entry" @tap="goLogin">
          <text style="font-size:28rpx;color:#fff;">👤</text>
        </view>
        <view class="plan-entry" @tap="goPlans">
          <text class="plan-entry-txt">计划 ›</text>
        </view>
      </view>
    </view>

    <scroll-view class="chat-scroll" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <view class="msg-list">
        <view
          v-for="(msg, i) in messages"
          :key="i"
          class="msg-item"
          :class="[msg.role === 'user' ? 'align-right' : 'align-left', { show: msg.show }]"
          :style="{ transitionDelay: (i * 0.06) + 's' }"
        >
          <view v-if="msg.role === 'ai'" class="ai-avatar">
              <text style="font-size:36rpx;">🤖</text>
            </view>
            <view v-if="msg.role === 'ai'" class="card-ai">
            <view v-if="msg.type === 'text'">
              <text class="ai-hd" v-if="msg.title">{{ msg.title }}</text>
              <text class="ai-bd">{{ msg.content }}</text>
              <text class="ai-tip" v-if="msg.tip">{{ msg.tip }}</text>
            </view>
            <view v-if="msg.type === 'plan'">
              <text class="card-hd">{{ msg.content }}</text>
              <view class="plan-row" v-for="p in msg.plans" :key="p.name">
                <view class="plan-l">
                  <text style="font-size:22rpx;">⏰</text>
                  <text class="plan-nm">{{ p.name }}</text>
                </view>
                <text class="plan-tm">{{ p.time }}</text>
              </view>
              <view class="link-row" @tap="goPlans">
                <text class="link-txt">查看计划 ></text>
              </view>
            </view>
            <view v-if="msg.type === 'recommend'">
              <text class="card-hd">{{ msg.content }}</text>
              <view class="rec-row" v-for="(r, ri) in msg.items" :key="ri">
                <text class="rec-txt">{{ r }}</text>
              </view>
            </view>
            <view v-if="msg.type === 'stats'">
              <text class="card-hd">{{ msg.content }}</text>
              <view class="stats-grid">
                <view class="stat-item" v-for="(s, si) in msg.stats" :key="si">
                  <text class="stat-value" :style="{ color: s.color }">{{ s.value }}</text>
                  <text class="stat-label">{{ s.label }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="msg.role === 'user'" class="card-user">
            <text class="user-txt">{{ msg.content }}</text>
          </view>
          <view v-if="msg.role === 'user'" class="user-avatar">
            <image
              v-if="userAvatar"
              :src="userAvatar"
              class="user-avatar-img"
              mode="aspectFill"
            />
            <text v-else style="font-size:36rpx;color:#4facfe;">👤</text>
          </view>
        </view>
      </view>
    </scroll-view>


    <view class="func-bar" :class="{ show: loaded }">
      <view class="func-pill" @tap="onFeature('plan')">
        <text> 录入计划</text>
      </view>
      <view class="func-pill" @tap="onFeature('recommend')">
        <text> 智能推荐</text>
      </view>
      <view class="func-pill" @tap="onFeature('calendar')">
        <text> 日程视图</text>
      </view>
      <view class="func-pill" @tap="onFeature('stats')">
        <text> 数据统计</text>
      </view>
    </view>

    <view class="input-card">
      <!-- 文字输入模式 -->
      <view v-if="inputMode === 'text'">
        <input
          class="inp"
          v-model="inputText"
          type="text"
          placeholder="输入计划..."
          placeholder-class="inp-ph"
          confirm-type="send"
          :focus="inputFocus"
          @confirm="onSend"
          @blur="inputFocus = false"
          @compositionstart="composing = true"
          @compositionend="composing = false"
        />
      </view>
      <!-- 语音模式 -->
      <view v-else class="voice-area" hover-class="voice-area-hover" :hover-start-time="10">
        <text class="voice-tip" :class="{ recording: isRecording }">
          {{ isRecording ? '正在录音...点击停止' : '点击说话' }}
        </text>
      </view>

      <view class="inp-tools">
        <!-- 键盘/语音切换 -->
        <view class="inp-btn" @tap="toggleMode">
          <text v-if="inputMode === 'text'" style="font-size:28rpx;color:#bbb;">⌨</text>
          <text v-else style="font-size:28rpx;color:#bbb;">🎤</text>
        </view>

        <!-- 发送 / 麦克风 -->
        <view
          v-if="inputMode === 'text'"
          class="inp-send"
          :class="{ active: inputText.length > 0 }"
          @tap="onSend"
        >
          <text style="font-size:28rpx;color:#fff;">发送</text>
        </view>
        <view
          v-else
          class="inp-mic"
          :class="{ pressed: isRecording }"
          @click="toggleVoice"
        >
          <text style="font-size:28rpx;color:#fff;">🎤</text>
        </view>

        <!-- 加号 -->
        <view class="inp-btn" @tap="showAddMenu">
          <text style="font-size:36rpx;color:#bbb;">＋</text>
        </view>
      </view>
    </view>

    <!-- 附件菜单弹窗 -->
    <view class="add-mask" v-if="addVisible" @tap="addVisible = false">
      <view class="add-panel" @tap.stop>
        <view class="add-item" v-for="a in addOptions" :key="a.key" @tap="onAdd(a.key)">
          <view class="add-icon-box" :style="{ background: a.bg }">
            <text style="font-size:36rpx;color:#7b6df0;">🖼️</text>
          </view>
          <text class="add-label">{{ a.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, computed, onMounted } from 'vue'
import { getAccessToken, sendChatMessage, transcribeAudio, getUnreadCount, getUserInfo, BASE_URL } from '../../utils/api.js'
import { store } from '../../utils/store.js'

const loaded = ref(false)
const scrollTop = ref(0)
const inputText = ref('')
const inputMode = ref('voice')
const inputFocus = ref(false)
const isRecording = ref(false)
const addVisible = ref(false)
const recordTimer = ref(null)
const sessionId = ref(null)
const sending = ref(false)
const userAvatar = ref('')
const composing = ref(false)
let recorderManager = null
let h5MediaRecorder = null
let isProcessingVoice = false

const addOptions = [
  { key: 'photo', label: '照片', bg: '#ece5ff', color: '#7b6df0' }
]

const messages = ref([
  {
    role: 'ai', type: 'text', show: true,
    title: '你好！我是你的计划助手 👋',
    content: '你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。',
    tip: '比如：明天上午10点开会，下午去健身，晚上学习2小时'
  }
])

const showTags = computed(() => messages.value.length <= 2)

onMounted(() => {
  // 确保初始状态渲染后再触发入场动画
  nextTick(() => {
    setTimeout(() => { loaded.value = true }, 50)
  })

  if (getAccessToken()) {
    getUnreadCount().then(res => {
      store.unreadCount = res.count || 0
    }).catch(() => {})
    getUserInfo().then(res => {
      if (res.avatarUrl) {
        userAvatar.value = res.avatarUrl.replace(/^https?:\/\/[^\/]+/, BASE_URL)
      }
    }).catch(() => {})
  }
})

function scroll() { nextTick(() => { scrollTop.value = Math.random() * 99999 }) }

function goPlans() {
  uni.navigateTo({ url: '/pages/plans/plans' })
}

function goNotifications() {
  uni.navigateTo({ url: '/pages/notifications/notifications' })
}

function goTasks() {
  uni.navigateTo({ url: '/pages/tasks/tasks' })
}

function goLogin() {
  const token = getAccessToken()
  if (token) {
    uni.navigateTo({ url: '/pages/profile/profile' })
  } else {
    uni.navigateTo({ url: '/pages/login/login' })
  }
}

function toggleMode() {
  inputMode.value = inputMode.value === 'text' ? 'voice' : 'text'
  if (inputMode.value === 'text') {
    inputFocus.value = true
  }
}

function onSend() {
  if (composing.value) return
  const t = inputText.value.trim()
  if (!t || sending.value) return
  sending.value = true
  messages.value.push({ role: 'user', content: t, show: true })
  inputText.value = ''
  scroll()
  sendChatMessage(t, sessionId.value || undefined).then(res => {
    sessionId.value = res.sessionId
    messages.value.push({ role: 'ai', type: 'text', title: '', content: res.reply, tip: '', show: true })
    scroll()
  }).catch((e) => {
    if (e && e.code === 'UNAUTHORIZED') {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    } else {
      messages.value.push({ role: 'ai', type: 'text', title: '', content: '网络异常，请稍后重试', tip: '', show: true })
      scroll()
    }
  }).finally(() => {
    sending.value = false
  })
}

let recordStartTime = 0

function toggleVoice() {
  if (isRecording.value) {
    if (Date.now() - recordStartTime < 800) return // 录音不足 0.8s 忽略
    stopRecord()
  } else {
    recordStartTime = Date.now()
    startRecord()
  }
}

function startRecord() {
  if (!getAccessToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    return
  }

  isRecording.value = true

  const platform = uni.getSystemInfoSync().platform

  // App / 小程序：uni.getRecorderManager
  if (platform !== 'web') {
    try {
      if (!recorderManager) {
        recorderManager = uni.getRecorderManager()
        recorderManager.onStop((res) => {
          console.log('recorderManager onStop:', JSON.stringify(res))
          isRecording.value = false
          if (isProcessingVoice) return
          if (res.tempFilePath) {
            isProcessingVoice = true
            handleVoiceResult(res.tempFilePath)
          }
        })
        recorderManager.onError((err) => {
          console.error('recorderManager onError:', JSON.stringify(err))
          isRecording.value = false
          uni.showToast({ title: '录音失败', icon: 'none' })
        })
      }
      recorderManager.start({
        duration: 60, sampleRate: 16000,
        numberOfChannels: 1, encodeBitRate: 48000, format: 'mp3'
      })
      return
    } catch (e) {
      isRecording.value = false
      uni.showToast({ title: '录音初始化失败', icon: 'none' })
      return
    }
  }

  // H5 浏览器：MediaRecorder API
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    isRecording.value = false
    uni.showToast({ title: '当前环境不支持录音', icon: 'none' })
    return
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const mr = new MediaRecorder(stream)
    const chunks = []
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      isRecording.value = false
      const blob = new Blob(chunks, { type: 'audio/webm' })
      // H5 用 fetch 直接上传，不走 uni.uploadFile
      uploadAndTranscribeBlob(blob)
    }
    mr.start()
    h5MediaRecorder = mr
  }).catch(() => {
    isRecording.value = false
    uni.showToast({ title: '无法访问麦克风', icon: 'none' })
  })
}

function stopRecord() {
  if (!isRecording.value) return
  isRecording.value = false
  if (recorderManager) {
    recorderManager.stop()
  } else if (h5MediaRecorder && h5MediaRecorder.state === 'recording') {
    h5MediaRecorder.stop()
  }
}

// H5 专用：XMLHttpRequest 上传音频 blob
function uploadAndTranscribeBlob(blob) {
  messages.value.push({ role: 'user', content: '[语音] 识别中...', show: true })
  scroll()

  const form = new FormData()
  form.append('file', blob, 'speech.webm')

  const token = getAccessToken()
  const xhr = new XMLHttpRequest()
  xhr.open('POST', BASE_URL + '/api/v1/speech/transcribe')
  xhr.setRequestHeader('Authorization', 'Bearer ' + token)
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const res = JSON.parse(xhr.responseText)
        onTranscribeSuccess(res.text)
      } catch (e) {
        uni.showToast({ title: '语音识别失败', icon: 'none' })
      }
    } else if (xhr.status === 401) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    } else {
      try {
        const err = JSON.parse(xhr.responseText)
        uni.showToast({ title: err.message || '语音识别失败', icon: 'none' })
      } catch (e) {
        uni.showToast({ title: '语音识别失败', icon: 'none' })
      }
    }
  }
  xhr.onerror = function () {
    uni.showToast({ title: '网络连接失败', icon: 'none' })
  }
  xhr.send(form)
}

function handleVoiceResult(filePath) {
  console.log('handleVoiceResult filePath:', filePath)
  messages.value.push({ role: 'user', content: '[语音] 识别中...', show: true })
  scroll()

  transcribeAudio(filePath).then(res => {
    onTranscribeSuccess(res.text || '')
  }).catch((e) => {
    if (e && e.code === 'UNAUTHORIZED') {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    } else {
      uni.showToast({ title: e.message || '语音识别失败', icon: 'none' })
    }
  }).finally(() => {
    isProcessingVoice = false
  })
}

function onTranscribeSuccess(text) {
  if (!text) {
    messages.value.push({ role: 'ai', type: 'text', title: '', content: '未识别到内容，请重试', tip: '', show: true })
    scroll()
    return
  }
  const lastUserMsg = messages.value[messages.value.length - 1]
  if (lastUserMsg && lastUserMsg.role === 'user') {
    lastUserMsg.content = '[语音] ' + text
  }
  scroll()
  sending.value = true
  sendChatMessage(text, sessionId.value || undefined).then(res => {
    sessionId.value = res.sessionId
    messages.value.push({ role: 'ai', type: 'text', title: '', content: res.reply, tip: '', show: true })
    scroll()
  }).catch((e) => {
    if (e && e.code === 'UNAUTHORIZED') {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    } else {
      messages.value.push({ role: 'ai', type: 'text', title: '', content: '网络异常，请稍后重试', tip: '', show: true })
      scroll()
    }
  }).finally(() => { sending.value = false })
}

function onQuick(t) {
  if (sending.value) return
  sending.value = true
  messages.value.push({ role: 'user', content: t, show: true })
  scroll()
  sendChatMessage(t, sessionId.value || undefined).then(res => {
    sessionId.value = res.sessionId
    messages.value.push({ role: 'ai', type: 'text', title: '', content: res.reply, tip: '', show: true })
    scroll()
  }).catch((e) => {
    if (e && e.code === 'UNAUTHORIZED') {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    } else {
      messages.value.push({ role: 'ai', type: 'text', title: '', content: '网络异常，请稍后重试', tip: '', show: true })
      scroll()
    }
  }).finally(() => { sending.value = false })
}

function onFeature(type) {
  const map = { plan: '我想录入今天的计划', recommend: '帮我推荐一些高效的习惯', calendar: '查看今天的日程安排', stats: '帮我看看最近的数据统计' }
  onQuick(map[type])
}

function showAddMenu() {
  addVisible.value = true
}

function onAdd(key) {
  addVisible.value = false
  uni.showToast({ title: '已选择照片', icon: 'none' })
}


</script>

<style scoped>
page { background: linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 40%, #ffffff 100%); }

.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 40%, #ffffff 100%);
  padding-top: 100rpx;
  box-sizing: border-box;
}

/* 动画 */
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

.banner.show { opacity: 1; transform: translateY(0); }
.func-bar.show { opacity: 1; transform: translateY(0); }
.msg-item.show { opacity: 1; transform: scale(1) translateY(0); }

/* Banner */
.banner {
  background: linear-gradient(135deg, #4facfe 0%, #6cb4ee 50%, #a8d8ff 100%);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin: 0 24rpx 14rpx;
  opacity: 0;
  transform: translateY(-24rpx);
  transition: opacity 0.45s ease-out, transform 0.45s ease-out;
}
.banner-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.robot {
  flex-shrink: 0;
}
.plan-entry {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: rgba(255,255,255,0.25);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-left: auto;
  position: relative;
}
.plan-entry-txt {
  font-size: 22rpx;
  color: #fff;
}
.badge {
  position: absolute;
  top: -8rpx; right: -8rpx;
  min-width: 28rpx; height: 28rpx;
  border-radius: 14rpx;
  background: #ff4757;
  display: flex; align-items: center; justify-content: center;
  padding: 0 6rpx;
}
.badge-text {
  font-size: 18rpx;
  color: #fff;
  font-weight: 600;
}
.banner-texts { flex: 1; }
.banner-title { display: block; color: #fff; font-size: 32rpx; font-weight: bold; }
.banner-sub { display: block; color: rgba(255,255,255,0.8); font-size: 22rpx; margin-top: 4rpx; }

/* 功能标签 */
.func-bar {
  display: flex;
  gap: 12rpx;
  padding: 0 24rpx;
  margin-bottom: 12rpx;
  opacity: 0;
  transform: translateY(32rpx);
  transition: opacity 0.45s ease-out 0.12s, transform 0.45s ease-out 0.12s;
  flex-wrap: wrap;
}
.func-pill {
  background: linear-gradient(135deg, #e8f4fd, #f0f7ff);
  font-size: 22rpx;
  color: #4a8cc7;
  padding: 10rpx 18rpx;
  border-radius: 22rpx;
  transition: all 0.15s;
  border: 1rpx solid rgba(79,172,254,0.15);
}
.func-pill:active {
  background: #d4ecff;
  transform: scale(0.96);
}

/* 聊天 */
.chat-scroll { flex: 1; padding: 0 24rpx; overflow: hidden; }
.msg-list { padding-bottom: 14rpx; }
.msg-item {
  margin-bottom: 14rpx;
  opacity: 0;
  transform: scale(0.94) translateY(12rpx);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
.align-left { display: flex; justify-content: flex-start; align-items: flex-start; gap: 12rpx; }
.align-right { display: flex; justify-content: flex-end; }

.card-ai {
  background: #fff; border-radius: 16rpx; padding: 22rpx; max-width: 78%;
  box-shadow: 0 2rpx 10rpx rgba(79,172,254,0.06);
}
.ai-avatar {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #e8f4fd, #d4ecff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(79,172,254,0.12);
}
.ai-hd { display: block; font-size: 28rpx; font-weight: 600; color: #222; margin-bottom: 10rpx; }
.ai-bd { display: block; font-size: 24rpx; color: #555; line-height: 1.8; }
.ai-tip { display: block; font-size: 24rpx; color: #99c4e8; line-height: 1.8; margin-top: 4rpx; }

.card-user {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  border-radius: 24rpx 24rpx 6rpx 24rpx;
  padding: 20rpx 26rpx;
  max-width: 76%;
  box-shadow: 0 4rpx 16rpx rgba(79,172,254,0.2);
  word-break: break-all;
}
.user-txt { font-size: 27rpx; color: #fff; line-height: 1.7; word-break: break-all; }

.user-avatar {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f4fd, #d4ecff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(79,172,254,0.12);
}
.user-avatar-img {
  width: 100%;
  height: 100%;
}

.card-hd { display: block; font-size: 26rpx; color: #333; line-height: 1.6; margin-bottom: 6rpx; }
.plan-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #eef5fb; }
.plan-row:last-of-type { border-bottom: none; }
.plan-l { display: flex; align-items: center; gap: 10rpx; }
.plan-nm { font-size: 26rpx; color: #333; }
.plan-tm { font-size: 24rpx; color: #99c4e8; }
.link-row { text-align: right; margin-top: 8rpx; }
.link-txt { font-size: 24rpx; color: #4facfe; }

.rec-row { padding: 12rpx 0; border-bottom: 1rpx solid #eef5fb; }
.rec-row:last-child { border-bottom: none; }
.rec-txt { font-size: 24rpx; color: #555; }

/* 数据统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
  margin-top: 10rpx;
}
.stat-item {
  background: linear-gradient(135deg, #e8f4fd, #f0f7ff);
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #4facfe;
}
.stat-label {
  display: block;
  font-size: 20rpx;
  color: #99c4e8;
  margin-top: 4rpx;
}

/* 快捷标签 */
.quick-bar { display: flex; gap: 12rpx; padding: 0 24rpx; margin-bottom: 8rpx; }
.quick-pill {
  background: linear-gradient(135deg, #e8f4fd, #f0f7ff);
  font-size: 22rpx; color: #4a8cc7;
  padding: 10rpx 18rpx; border-radius: 22rpx; transition: all 0.15s;
  border: 1rpx solid rgba(79,172,254,0.15);
}
.quick-pill:active { background: #d4ecff; transform: scale(0.96); }

/* 输入栏 */
.input-card {
  background: #fff; border-radius: 18rpx;
  padding: 16rpx 18rpx 20rpx; margin: 0 24rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(79,172,254,0.08);
}
.inp { font-size: 26rpx; color: #333; padding-bottom: 14rpx; }
.inp-ph { color: #b8d8f0; font-size: 24rpx; }

.voice-area {
  padding: 24rpx 0; text-align: center;
  min-height: 80rpx; box-sizing: border-box;
}
.voice-area-hover {
  background: rgba(79,172,254,0.05);
  border-radius: 12rpx;
}
.voice-tip {
  font-size: 26rpx; color: #99c4e8;
}
.voice-tip.recording {
  color: #4facfe;
  animation: pulse 1s ease-in-out infinite;
}

.inp-tools { display: flex; align-items: center; justify-content: space-between; }
.inp-btn {
  width: 48rpx; height: 48rpx;
  display: flex; align-items: center; justify-content: center;
}
.inp-mic {
  width: 66rpx; height: 66rpx; border-radius: 50%;
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.inp-mic.pressed {
  transform: scale(1.1);
  box-shadow: 0 4rpx 20rpx rgba(79,172,254,0.45);
}

.inp-send {
  width: 66rpx; height: 66rpx; border-radius: 50%;
  background: #ddd;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.inp-send.active {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
}

/* 附件菜单 */
.add-mask {
  position: fixed; left: 0; right: 0; bottom: 0; top: 0;
  background: rgba(0,0,0,0.2); z-index: 100;
  display: flex; align-items: flex-end;
}
.add-panel {
  width: 100%; background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 40rpx 80rpx;
  display: flex; justify-content: space-around;
}
.add-item {
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
}
.add-icon-box {
  width: 80rpx; height: 80rpx; border-radius: 20rpx;
  display: flex; align-items: center; justify-content: center;
}
.add-label { font-size: 22rpx; color: #555; }
</style>
