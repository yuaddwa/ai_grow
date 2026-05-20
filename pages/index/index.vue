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
        <view class="plan-entry" @tap="openHistory">
          <text style="font-size:28rpx;color:#fff;">💬</text>
        </view>
        <view class="plan-entry" @tap="createNewSession">
          <text style="font-size:28rpx;color:#fff;">＋</text>
        </view>
        <view class="plan-entry" @tap="goPlans">
          <text class="plan-entry-txt">计划 ›</text>
        </view>
      </view>
    </view>

    <scroll-view
      class="chat-scroll"
      scroll-y
      :bounces="false"
      :show-scrollbar="false"
      :scroll-top="scrollTop"
      scroll-with-animation
    >
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
            <view v-if="msg.type === 'loading'" class="ai-loading-wrap">
              <view class="wifi-loader">
                <svg class="circle-outer" viewBox="0 0 86 86">
                  <circle class="back" cx="43" cy="43" r="40" fill="none" />
                  <circle class="front" cx="43" cy="43" r="40" fill="none" />
                </svg>
                <svg class="circle-middle" viewBox="0 0 60 60">
                  <circle class="back" cx="30" cy="30" r="27" fill="none" />
                  <circle class="front" cx="30" cy="30" r="27" fill="none" />
                </svg>
                <svg class="circle-inner" viewBox="0 0 34 34">
                  <circle class="back" cx="17" cy="17" r="14" fill="none" />
                  <circle class="front" cx="17" cy="17" r="14" fill="none" />
                </svg>
                <view class="text" data-text="loading"></view>
              </view>
            </view>
            <view v-else-if="msg.type === 'text'">
              <text class="ai-hd" v-if="msg.title">{{ msg.title }}</text>
              <markdown-content class="ai-bd" :content="msg.content" />
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
            <view v-if="msg.type === 'planProposal'" class="proposal-wrap">
              <markdown-content v-if="msg.content" class="ai-bd proposal-intro" :content="msg.content" />
              <view v-if="msg.loading" class="proposal-loading">
                <text class="proposal-loading-txt">正在加载计划详情...</text>
              </view>
              <template v-else>
              <view
                v-if="msg.status"
                class="proposal-status-badge"
                :class="'status-' + String(msg.status).toLowerCase()"
              >
                <text>{{ proposalStatusText(msg.status) }}</text>
              </view>
              <view v-if="msg.detail" class="proposal-body">
                <text class="proposal-title">{{ msg.detail.goalTitle }}</text>
                <text v-if="msg.detail.goalDescription" class="proposal-desc">{{ msg.detail.goalDescription }}</text>
                <text class="proposal-summary">{{ msg.detail.summary }}</text>
                <text class="proposal-meta">
                  📅 {{ formatPlanDate(msg.detail.startDate || (msg.detail.days && msg.detail.days[0] && msg.detail.days[0].scheduledDate)) }}
                  <text v-if="msg.detail.endDate"> — {{ formatPlanDate(msg.detail.endDate) }}</text>
                  · ⏰ 每日 {{ msg.detail.dailyReminderTime || '08:00' }}
                </text>
                <view class="proposal-day" v-for="d in (msg.detail.days || [])" :key="d.dayIndex">
                  <view class="day-hd">
                    <text class="day-tag">第{{ d.dayIndex }}天</text>
                    <text class="day-date">{{ formatPlanDate(d.scheduledDate) }}</text>
                    <text class="day-mins">{{ formatMinutes(d.estimatedMinutes) }}</text>
                  </view>
                  <text class="day-title">{{ d.title }}</text>
                  <text v-if="d.description" class="day-desc">{{ d.description }}</text>
                </view>
                <text v-if="msg.detail.expiresAt" class="proposal-expire">
                  草案有效期至 {{ formatPlanExpire(msg.detail.expiresAt) }}
                </text>
              </view>
              <view
                v-if="!msg.resolved && msg.status === 'PENDING' && msg.detail"
                class="proposal-actions"
              >
                <view
                  class="btn-proposal-reject"
                  :class="{ disabled: msg.acting }"
                  @tap="onRejectProposal(msg)"
                >
                  <text>拒绝</text>
                </view>
                <view
                  class="btn-proposal-confirm"
                  :class="{ disabled: msg.acting }"
                  @tap="onConfirmProposal(msg)"
                >
                  <text>{{ msg.acting === 'confirm' ? '确认中...' : '确认计划' }}</text>
                </view>
              </view>
              <view v-else-if="msg.resolved" class="proposal-done">
                <text>{{ msg.resultMessage }}</text>
              </view>
              </template>
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
            <view
              v-if="msg.isVoice && msg.voiceUrl"
              class="voice-bubble"
              @tap="playVoice(msg)"
            >
              <text class="voice-play-icon">{{ isPlayingVoice(msg) ? '⏸' : '▶' }}</text>
              <view class="voice-wave">
                <view class="wave-bar" v-for="n in 4" :key="n" :class="{ active: isPlayingVoice(msg) }"></view>
              </view>
              <text class="voice-text">{{ formatVoiceLabel(msg) }}</text>
            </view>
            <text v-else class="user-txt">{{ msg.content }}</text>
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
      <view
        v-else
        class="voice-area"
        :class="{ recording: isRecording }"
        @touchstart.stop="onVoiceTouchStart"
        @touchend.stop="onVoiceTouchEnd"
        @touchcancel.stop="onVoiceTouchEnd"
        @touchmove.stop
      >
        <text class="voice-tip" :class="{ recording: isRecording }">
          {{ isRecording ? '松开 结束' : '按住 说话' }}
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
          @touchstart.stop="onVoiceTouchStart"
          @touchend.stop="onVoiceTouchEnd"
          @touchcancel.stop="onVoiceTouchEnd"
          @touchmove.stop
        >
          <text style="font-size:28rpx;color:#fff;">🎤</text>
        </view>

        <!-- 加号 -->
        <view class="inp-btn" @tap="showAddMenu">
          <text style="font-size:36rpx;color:#bbb;">＋</text>
        </view>
      </view>
    </view>

    <!-- 历史会话 -->
    <view class="history-mask" v-if="historyVisible" @tap="historyVisible = false">
      <view class="history-panel" @tap.stop>
        <view class="history-hd">
          <text class="history-title">对话历史</text>
          <view class="history-new" @tap="createNewSession">
            <text class="history-new-txt">＋ 新对话</text>
          </view>
        </view>
        <scroll-view
          class="history-scroll"
          scroll-y
          :show-scrollbar="false"
          :refresher-enabled="true"
          :refresher-triggered="sessionsRefreshing"
          @refresherrefresh="onSessionsRefresh"
          @scrolltolower="loadMoreSessions"
        >
          <view v-if="sessionList.length === 0 && !loadingSessions" class="history-empty">
            <text class="history-empty-txt">暂无历史对话</text>
          </view>
          <view
            v-for="s in sessionList"
            :key="s.id"
            class="history-item"
            :class="{ active: String(s.id) === String(sessionId) }"
            @tap="loadSession(s.id)"
          >
            <text class="history-item-title">{{ s.title || '新对话' }}</text>
            <text class="history-item-meta">
              {{ formatSessionTime(s.updatedAt) }}
              <text v-if="isSessionCached(s.id)" class="history-local"> · 本地</text>
            </text>
          </view>
          <view v-if="loadingSessions" class="history-loading">
            <text class="history-loading-txt">加载中...</text>
          </view>
          <view v-else-if="!sessionsHasNext && sessionList.length > 0" class="history-loading">
            <text class="history-loading-txt">没有更多了</text>
          </view>
        </scroll-view>
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
import { onShow } from '@dcloudio/uni-app'
import {
  getAccessToken, sendChatMessage, transcribeAudio, getUserInfo,
  getChatSessions, fetchAllChatMessages, resolveMediaUrl, BASE_URL,
  getPlanProposal, getPlanProposalsBySession, confirmPlanProposal, rejectPlanProposal
} from '../../utils/api.js'
import { store, refreshUnreadCount } from '../../utils/store.js'
import { onChatReply } from '../../utils/realtime.js'
import {
  isSessionCached, getCachedSession, setCachedSession,
  saveCurrentSessionId, getCurrentSessionId, clearCurrentSessionId
} from '../../utils/chatHistory.js'

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
const historyVisible = ref(false)
const sessionList = ref([])
const loadingSession = ref(false)
const loadingSessions = ref(false)
const sessionsRefreshing = ref(false)
const sessionsPage = ref(0)
const sessionsHasNext = ref(false)
const playingVoiceKey = ref(null)
let recorderManager = null
let innerAudioContext = null
let h5MediaRecorder = null
let isProcessingVoice = false
let touchRecording = false
let recordStarting = false
const MIN_RECORD_MS = 800

const addOptions = [
  { key: 'photo', label: '照片', bg: '#ece5ff', color: '#7b6df0' }
]

const WELCOME_MESSAGE = {
  role: 'ai', type: 'text', show: true,
  title: '你好！我是你的计划助手 👋',
  content: '你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。',
  tip: '比如：明天上午10点开会，下午去健身，晚上学习2小时'
}

function getWelcomeMessages() {
  return [{ ...WELCOME_MESSAGE }]
}

const messages = ref(getWelcomeMessages())

const showTags = computed(() => messages.value.length <= 2)

function openPendingSessionIfAny() {
  const pending = uni.getStorageSync('pendingOpenSessionId')
  if (!pending || !getAccessToken()) return
  uni.removeStorageSync('pendingOpenSessionId')
  loadSession(pending, true)
}

onShow(() => {
  if (getAccessToken()) {
    refreshUnreadCount()
    openPendingSessionIfAny()
  }
})

onMounted(() => {
  // 确保初始状态渲染后再触发入场动画
  nextTick(() => {
    setTimeout(() => { loaded.value = true }, 50)
  })

  if (getAccessToken()) {
    refreshUnreadCount()
    getUserInfo().then(res => {
      if (res.avatarUrl) {
        userAvatar.value = res.avatarUrl.replace(/^https?:\/\/[^\/]+/, BASE_URL)
      }
    }).catch(() => {})
    onChatReply((data) => {
      if (!data.sessionId) return
      if (sessionId.value && String(data.sessionId) === String(sessionId.value)) {
        loadSession(data.sessionId, true)
      }
      if (historyVisible.value) refreshSessions()
    })
    const pending = uni.getStorageSync('pendingOpenSessionId')
    if (pending) {
      openPendingSessionIfAny()
    } else {
      const cur = getCurrentSessionId()
      if (cur) loadSession(cur, true)
    }
  }
})

function scroll() { nextTick(() => { scrollTop.value = Math.random() * 99999 }) }

function pickVoiceUrl(m) {
  if (!m) return ''
  return m.voiceUrl || m.audioUrl || (m.voiceUrls && m.voiceUrls[0]) || ''
}

function pickProposalIdFromMessage(m) {
  if (!m) return null
  if (m.proposalId != null) return m.proposalId
  if (m.planProposalId != null) return m.planProposalId
  if (m.planProposal && m.planProposal.proposalId != null) return m.planProposal.proposalId
  return null
}

function looksLikePlanDraftReply(content) {
  if (!content) return false
  return /草案|确认计划|计划草案/.test(content)
}

function createPlanProposalShell({ id, content, proposalId, status, hint }) {
  const st = status || (hint && hint.status) || 'PENDING'
  const resolved = st !== 'PENDING'
  return {
    role: 'ai',
    type: 'planProposal',
    content: content || '',
    proposalId,
    status: st,
    detail: null,
    loading: true,
    resolved,
    resultMessage: resolved ? proposalResultMessage(st, hint) : '',
    acting: false,
    show: true,
    id
  }
}

function proposalResultMessage(status, detail) {
  if (status === 'CONFIRMED') {
    return (detail && detail.planId)
      ? '计划已确认，已写入日程'
      : '计划已确认'
  }
  if (status === 'REJECTED') return '已拒绝该计划草案'
  if (status === 'EXPIRED') return '计划草案已过期'
  return proposalStatusText(status)
}

function applyProposalDetail(msg, detail) {
  msg.detail = detail
  msg.status = detail.status || msg.status
  if (detail.status === 'PENDING') {
    msg.resolved = false
    msg.resultMessage = ''
  } else {
    msg.resolved = true
    msg.resultMessage = proposalResultMessage(detail.status, detail)
  }
}

function mapApiMessage(m) {
  const role = m.role === 'USER' ? 'user' : 'ai'
  if (role === 'ai') {
    const proposalId = pickProposalIdFromMessage(m)
    if (proposalId != null) {
      return createPlanProposalShell({
        id: m.id,
        content: m.content || '',
        proposalId,
        status: (m.planProposal && m.planProposal.status) || m.proposalStatus,
        hint: m.planProposal
      })
    }
    return { role: 'ai', type: 'text', title: '', content: m.content || '', tip: '', show: true, id: m.id }
  }
  const voiceUrl = pickVoiceUrl(m)
  const content = m.content || ''
  const isVoice = !!voiceUrl || /^\[语音\]/.test(content)
  return {
    role: 'user',
    content,
    voiceUrl,
    isVoice,
    show: true,
    id: m.id
  }
}

function mapApiToMessages(apiData) {
  return (apiData.messages || []).map(mapApiMessage)
}

function deriveSessionTitle() {
  const userMsg = [...messages.value].reverse().find(
    m => m.role === 'user' && m.content && !m.content.includes('识别中')
  )
  if (userMsg) {
    const t = userMsg.content.replace(/^\[语音\]\s*/, '').trim()
    if (t) return t.slice(0, 40)
  }
  return '新对话'
}

function pushAiLoading() {
  removeAiLoading()
  messages.value.push({ role: 'ai', type: 'loading', show: true })
  scroll()
}

function removeAiLoading() {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].type === 'loading') {
      messages.value.splice(i, 1)
      break
    }
  }
}

function persistSession() {
  if (!sessionId.value || !getAccessToken()) return
  const sid = sessionId.value
  const title = deriveSessionTitle()
  setCachedSession(sid, {
    sessionId: sid,
    sessionTitle: title,
    messages: messages.value.filter(m => m.type !== 'loading')
  })
  saveCurrentSessionId(sid)
}

function mapSessionItem(s) {
  return {
    id: s.sessionId != null ? s.sessionId : s.id,
    title: s.title || s.sessionTitle || '新对话',
    updatedAt: s.updatedAt || s.createdAt,
    provider: s.provider,
    model: s.model
  }
}

function applySessionsPage(data, append) {
  // 后端分页字段为 items（非 content / sessions）
  const raw = data.items || data.content || data.sessions || []
  const items = raw.map(mapSessionItem)
  sessionList.value = append ? sessionList.value.concat(items) : items
  sessionsHasNext.value = !!data.hasNext
}

function onSessionsRefresh() {
  sessionsRefreshing.value = true
  refreshSessions()
}

function refreshSessions() {
  if (!getAccessToken()) return Promise.resolve()
  loadingSessions.value = true
  sessionsPage.value = 0
  return getChatSessions(0, 20).then(data => {
    applySessionsPage(data, false)
  }).catch(() => {
    uni.showToast({ title: '加载会话列表失败', icon: 'none' })
  }).finally(() => {
    loadingSessions.value = false
    sessionsRefreshing.value = false
  })
}

function loadMoreSessions() {
  if (!sessionsHasNext.value || loadingSessions.value || !getAccessToken()) return
  loadingSessions.value = true
  const page = sessionsPage.value + 1
  getChatSessions(page, 20).then(data => {
    applySessionsPage(data, true)
    sessionsPage.value = page
  }).catch(() => {
    uni.showToast({ title: '加载更多失败', icon: 'none' })
  }).finally(() => {
    loadingSessions.value = false
  })
}

/** 从本地缓存合并语音 URL（API 消息可能不含录音地址） */
function mergeCachedPlanProposals(sid, list) {
  const cached = getCachedSession(sid)
  if (!cached || !cached.messages) return list
  const byMsgId = {}
  cached.messages.forEach(m => {
    if (m.type === 'planProposal' && m.proposalId != null && m.id != null) {
      byMsgId[m.id] = m
    }
  })
  return list.map(m => {
    if (m.role !== 'ai' || m.type === 'planProposal') return m
    const hit = byMsgId[m.id]
    if (hit) return { ...hit, show: true, loading: true }
    return m
  })
}

function enrichPlanProposalsForSession(sessionId, list) {
  return getPlanProposalsBySession(sessionId).then(res => {
    const proposals = res.items || res.proposals || res.content || []
    if (!proposals.length) return list
    const next = list.slice()
    const used = new Set()
    proposals.forEach(p => {
      const pid = p.proposalId != null ? p.proposalId : p.id
      if (pid == null) return
      let idx = next.findIndex((m, i) =>
        !used.has(i) && m.role === 'ai' && (m.id === p.assistantMessageId || m.id === p.messageId)
      )
      if (idx < 0) {
        idx = next.findIndex((m, i) =>
          !used.has(i) && m.role === 'ai' && m.type === 'text' && looksLikePlanDraftReply(m.content)
        )
      }
      if (idx < 0) return
      used.add(idx)
      next[idx] = createPlanProposalShell({
        id: next[idx].id,
        content: next[idx].content || '',
        proposalId: pid,
        status: p.status,
        hint: p
      })
    })
    return next
  }).catch(() => list)
}

function hydratePlanProposalMessages(list) {
  const jobs = list.map(msg => {
    if (msg.type !== 'planProposal' || msg.proposalId == null) return Promise.resolve()
    msg.loading = true
    return getPlanProposal(msg.proposalId)
      .then(detail => applyProposalDetail(msg, detail))
      .catch(() => {
        if (!msg.detail && msg.status && msg.status !== 'PENDING') {
          msg.resolved = true
          msg.resultMessage = proposalResultMessage(msg.status, null)
        }
      })
      .finally(() => { msg.loading = false })
  })
  return Promise.all(jobs).then(() => list)
}

function mergeVoiceFromCache(sid, uiMessages) {
  const cached = getCachedSession(sid)
  if (!cached || !cached.messages) return uiMessages
  const voiceById = {}
  const voiceByContent = []
  cached.messages.forEach(m => {
    if (!m.voiceUrl) return
    if (m.id != null) voiceById[m.id] = m.voiceUrl
    else if (m.content) voiceByContent.push({ content: m.content, voiceUrl: m.voiceUrl })
  })
  return uiMessages.map(m => {
    if (m.role !== 'user' || m.voiceUrl) return m
    let voiceUrl = m.id != null ? voiceById[m.id] : ''
    if (!voiceUrl && m.content) {
      const hit = voiceByContent.find(v => v.content === m.content)
      if (hit) voiceUrl = hit.voiceUrl
    }
    if (!voiceUrl) return m
    return { ...m, voiceUrl, isVoice: true }
  })
}

function formatMinutes(m) {
  if (m == null || m === '') return ''
  const n = Number(m)
  if (isNaN(n)) return ''
  if (n >= 60) {
    const h = Math.floor(n / 60)
    const rest = n % 60
    return rest ? h + '小时' + rest + '分钟' : h + '小时'
  }
  return n + '分钟'
}

function formatPlanDate(iso) {
  if (!iso) return ''
  const s = String(iso).slice(0, 10)
  const p = s.split('-')
  if (p.length >= 3) return parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日'
  return s
}

function formatPlanExpire(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = n => (n < 10 ? '0' + n : '' + n)
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

function proposalStatusText(status) {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    REJECTED: '已拒绝',
    EXPIRED: '已过期'
  }
  return map[status] || status || ''
}

function appendPlanProposalMessage(res) {
  const hint = res.planProposal || {}
  const msg = createPlanProposalShell({
    id: res.assistantMessageId,
    content: res.reply || '',
    proposalId: hint.proposalId,
    status: hint.status,
    hint
  })
  messages.value.push(msg)
  return getPlanProposal(msg.proposalId).then(detail => {
    applyProposalDetail(msg, detail)
  }).catch(() => {
    msg.detail = {
      goalTitle: hint.goalTitle || '计划草案',
      goalDescription: hint.summary || '',
      summary: hint.summary || '',
      startDate: hint.startDate,
      endDate: hint.endDate,
      dailyReminderTime: hint.dailyReminderTime,
      days: []
    }
    uni.showToast({ title: '加载计划详情失败', icon: 'none' })
  }).finally(() => {
    msg.loading = false
  })
}

function onConfirmProposal(msg) {
  if (msg.resolved || msg.acting || msg.status !== 'PENDING') return
  msg.acting = 'confirm'
  confirmPlanProposal(msg.proposalId).then(res => {
    return getPlanProposal(msg.proposalId).then(detail => {
      applyProposalDetail(msg, detail)
      if (res.message) msg.resultMessage = res.message
      uni.showToast({ title: '计划已确认', icon: 'success' })
      persistSession()
    })
  }).catch(e => {
    uni.showToast({ title: (e && e.message) || '确认失败', icon: 'none' })
  }).finally(() => {
    msg.acting = false
  })
}

function onRejectProposal(msg) {
  if (msg.resolved || msg.acting || msg.status !== 'PENDING') return
  uni.showModal({
    title: '拒绝计划',
    content: '确定拒绝这份计划草案吗？拒绝后不会创建任务与提醒。',
    success: (r) => {
      if (!r.confirm) return
      msg.acting = 'reject'
      rejectPlanProposal(msg.proposalId).then(() => {
        msg.resolved = true
        msg.status = 'REJECTED'
        msg.resultMessage = '已拒绝该计划草案'
        uni.showToast({ title: '已拒绝', icon: 'none' })
        persistSession()
      }).catch(e => {
        uni.showToast({ title: (e && e.message) || '操作失败', icon: 'none' })
      }).finally(() => {
        msg.acting = false
      })
    }
  })
}

function onChatSuccess(res) {
  removeAiLoading()
  sessionId.value = res.sessionId
  if (res.planProposal && res.planProposal.proposalId != null) {
    appendPlanProposalMessage(res).then(() => {
      persistSession()
      scroll()
    })
  } else {
    messages.value.push({ role: 'ai', type: 'text', title: '', content: res.reply, tip: '', show: true })
    persistSession()
    scroll()
  }
}

function formatSessionTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const pad = n => (n < 10 ? '0' + n : '' + n)
  if (isToday) return pad(d.getHours()) + ':' + pad(d.getMinutes())
  return (d.getMonth() + 1) + '/' + d.getDate()
}

function formatVoiceLabel(msg) {
  const t = (msg.content || '').replace(/^\[语音\]\s*/, '').trim()
  return t || '语音消息'
}

function voiceMsgKey(msg) {
  return msg.id != null ? 'id-' + msg.id : 'url-' + (msg.voiceUrl || '')
}

function isPlayingVoice(msg) {
  return playingVoiceKey.value === voiceMsgKey(msg)
}

function getInnerAudio() {
  if (!innerAudioContext) {
    innerAudioContext = uni.createInnerAudioContext()
    innerAudioContext.onEnded(() => { playingVoiceKey.value = null })
    innerAudioContext.onStop(() => { playingVoiceKey.value = null })
    innerAudioContext.onError(() => {
      playingVoiceKey.value = null
      uni.showToast({ title: '无法播放语音', icon: 'none' })
    })
  }
  return innerAudioContext
}

function playVoice(msg) {
  const url = resolveMediaUrl(msg.voiceUrl)
  if (!url) {
    uni.showToast({ title: '语音文件不可用', icon: 'none' })
    return
  }
  const key = voiceMsgKey(msg)
  const audio = getInnerAudio()
  if (playingVoiceKey.value === key) {
    audio.stop()
    playingVoiceKey.value = null
    return
  }
  playingVoiceKey.value = key
  audio.src = url
  audio.play()
}

function openHistory() {
  if (!getAccessToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    return
  }
  historyVisible.value = true
  refreshSessions()
}

function createNewSession() {
  if (innerAudioContext) innerAudioContext.stop()
  playingVoiceKey.value = null
  sessionId.value = null
  clearCurrentSessionId()
  messages.value = getWelcomeMessages()
  historyVisible.value = false
  scroll()
}

function loadSession(sid, silent) {
  if (String(sid) === String(sessionId.value) && !silent) {
    historyVisible.value = false
    return Promise.resolve()
  }
  if (loadingSession.value) return Promise.resolve()
  loadingSession.value = true
  if (!silent) historyVisible.value = false
  if (innerAudioContext) innerAudioContext.stop()
  playingVoiceKey.value = null

  sessionId.value = sid
  saveCurrentSessionId(sid)

  // 始终走图2接口拉消息；本地缓存仅用于合并语音 URL
  return fetchAllChatMessages(sid)
    .then(data => {
      let list = mapApiToMessages(data)
      list = mergeVoiceFromCache(sid, list)
      list = mergeCachedPlanProposals(sid, list)
      return enrichPlanProposalsForSession(sid, list).then(enriched => ({ data, list: enriched }))
    })
    .then(({ data, list }) => hydratePlanProposalMessages(list).then(() => ({ data, list })))
    .then(({ data, list }) => {
      messages.value = list.map(m => ({ ...m, show: true }))
      const title = data.sessionTitle || deriveSessionTitle()
      setCachedSession(sid, {
        sessionId: data.sessionId || sid,
        sessionTitle: title,
        messages: messages.value
      })
      scroll()
    }).catch(() => {
    if (!silent) uni.showToast({ title: '加载历史失败', icon: 'none' })
    messages.value = getWelcomeMessages()
    sessionId.value = null
    clearCurrentSessionId()
  }).finally(() => {
    loadingSession.value = false
  })
}

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
  pushAiLoading()
  sendChatMessage(t, sessionId.value || undefined).then(res => {
    onChatSuccess(res)
  }).catch((e) => {
    removeAiLoading()
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
let lastVoiceBlobUrl = null

function ensureRecordPermission() {
  return new Promise((resolve, reject) => {
    const sys = uni.getSystemInfoSync()
    if (sys.platform === 'android' && typeof plus !== 'undefined' && plus.android) {
      plus.android.requestPermissions(
        ['android.permission.RECORD_AUDIO'],
        (e) => {
          if (e.granted && e.granted.length > 0) resolve()
          else reject(new Error('denied'))
        },
        reject
      )
      return
    }
    if (sys.uniPlatform === 'mp-weixin') {
      uni.authorize({
        scope: 'scope.record',
        success: () => resolve(),
        fail: () => reject(new Error('denied'))
      })
      return
    }
    resolve()
  })
}

function initRecorderManager() {
  if (recorderManager) return
  recorderManager = uni.getRecorderManager()
  recorderManager.onStart(() => {
    console.log('recorderManager onStart')
    isRecording.value = true
  })
  recorderManager.onStop((res) => {
    console.log('recorderManager onStop:', JSON.stringify(res))
    isRecording.value = false
    touchRecording = false
    recordStarting = false
    if (isProcessingVoice) return
    const duration = res.duration || (Date.now() - recordStartTime)
    if (duration < MIN_RECORD_MS) {
      uni.showToast({ title: '说话时间太短，请按住多说一会儿', icon: 'none' })
      return
    }
    if (res.tempFilePath) {
      isProcessingVoice = true
      handleVoiceResult(res.tempFilePath)
    } else {
      uni.showToast({ title: '未获取到录音文件', icon: 'none' })
    }
  })
  recorderManager.onError((err) => {
    console.error('recorderManager onError:', JSON.stringify(err))
    isRecording.value = false
    touchRecording = false
    recordStarting = false
    uni.showToast({ title: '录音失败', icon: 'none' })
  })
}

async function onVoiceTouchStart() {
  if (touchRecording || recordStarting || isProcessingVoice) return
  if (!getAccessToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 800)
    return
  }

  touchRecording = true
  recordStarting = true
  recordStartTime = Date.now()

  try {
    await ensureRecordPermission()
    recordStarting = false
    if (!touchRecording) return
    startRecord()
  } catch (e) {
    touchRecording = false
    recordStarting = false
    uni.showModal({
      title: '需要麦克风权限',
      content: '请在系统设置中允许本应用使用麦克风',
      confirmText: '知道了',
      showCancel: false
    })
  }
}

function onVoiceTouchEnd() {
  if (!touchRecording && !recordStarting && !isRecording.value) return
  touchRecording = false
  if (recordStarting) {
    recordStarting = false
    return
  }
  recordStarting = false
  stopRecord()
}

function startRecord() {
  const platform = uni.getSystemInfoSync().platform

  if (platform !== 'web') {
    try {
      initRecorderManager()
      recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'mp3'
      })
    } catch (e) {
      touchRecording = false
      recordStarting = false
      uni.showToast({ title: '录音初始化失败', icon: 'none' })
    }
    return
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    touchRecording = false
    recordStarting = false
    uni.showToast({ title: '当前环境不支持录音', icon: 'none' })
    return
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    if (!touchRecording) {
      stream.getTracks().forEach(t => t.stop())
      return
    }
    const mr = new MediaRecorder(stream)
    const chunks = []
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    mr.onstart = () => { isRecording.value = true }
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      isRecording.value = false
      touchRecording = false
      const elapsed = Date.now() - recordStartTime
      if (elapsed < MIN_RECORD_MS) {
        uni.showToast({ title: '说话时间太短，请按住多说一会儿', icon: 'none' })
        return
      }
      const blob = new Blob(chunks, { type: 'audio/webm' })
      uploadAndTranscribeBlob(blob)
    }
    mr.start()
    h5MediaRecorder = mr
  }).catch(() => {
    touchRecording = false
    recordStarting = false
    uni.showToast({ title: '无法访问麦克风', icon: 'none' })
  })
}

function stopRecord() {
  if (recorderManager) {
    try { recorderManager.stop() } catch (e) { /* 可能尚未 start */ }
  } else if (h5MediaRecorder && h5MediaRecorder.state === 'recording') {
    h5MediaRecorder.stop()
  }
}

// H5 专用：XMLHttpRequest 上传音频 blob
function uploadAndTranscribeBlob(blob) {
  if (lastVoiceBlobUrl) URL.revokeObjectURL(lastVoiceBlobUrl)
  lastVoiceBlobUrl = URL.createObjectURL(blob)
  messages.value.push({
    role: 'user', content: '[语音] 识别中...', show: true,
    voiceUrl: lastVoiceBlobUrl, isVoice: true
  })
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
  messages.value.push({
    role: 'user', content: '[语音] 识别中...', show: true,
    voiceUrl: filePath, isVoice: true
  })
  scroll()

  transcribeAudio(filePath).then(res => {
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'user' && (res.audioUrl || res.voiceUrl || res.url)) {
      last.voiceUrl = res.audioUrl || res.voiceUrl || res.url
      last.isVoice = true
    }
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
    if (!lastUserMsg.voiceUrl && lastVoiceBlobUrl) lastUserMsg.voiceUrl = lastVoiceBlobUrl
    lastUserMsg.isVoice = true
  }
  scroll()
  sending.value = true
  pushAiLoading()
  sendChatMessage(text, sessionId.value || undefined).then(res => {
    onChatSuccess(res)
  }).catch((e) => {
    removeAiLoading()
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
  pushAiLoading()
  sendChatMessage(t, sessionId.value || undefined).then(res => {
    onChatSuccess(res)
  }).catch((e) => {
    removeAiLoading()
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
page { height: 100%; background: linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 40%, #ffffff 100%); }

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 40%, #ffffff 100%);
  padding-top: 100rpx;
  box-sizing: border-box;
}

/* 动画 */
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

.banner.show { opacity: 1; transform: translateY(0); }
.func-bar.show { opacity: 1; transform: translateY(0); }
.msg-item.show { opacity: 1; transform: none; }

/* Banner */
.banner {
  flex-shrink: 0;
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
  flex-shrink: 0;
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
.chat-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.msg-list { padding-bottom: 14rpx; }
.msg-item {
  margin-bottom: 14rpx;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.align-left { display: flex; justify-content: flex-start; align-items: flex-start; gap: 12rpx; }
.align-right { display: flex; justify-content: flex-end; }

.card-ai {
  background: #fff; border-radius: 16rpx; padding: 22rpx; max-width: 88%;
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
.ai-loading-wrap {
  display: flex; align-items: center; justify-content: center;
  padding: 16rpx 8rpx 56rpx; min-width: 140rpx; min-height: 180rpx;
}
.wifi-loader {
  --background: #62abff;
  --front-color: #4f29f0;
  --back-color: #c3c8de;
  --text-color: #414856;
  width: 64px;
  height: 64px;
  border-radius: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wifi-loader svg {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wifi-loader svg circle {
  position: absolute;
  fill: none;
  stroke-width: 6px;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: rotate(-100deg);
  transform-origin: center;
}
.wifi-loader svg circle.back {
  stroke: var(--back-color);
}
.wifi-loader svg circle.front {
  stroke: var(--front-color);
}
.wifi-loader svg.circle-outer {
  height: 86px;
  width: 86px;
}
.wifi-loader svg.circle-outer circle {
  stroke-dasharray: 62.75 188.25;
}
.wifi-loader svg.circle-outer circle.back {
  animation: circle-outer135 1.8s ease infinite 0.3s;
}
.wifi-loader svg.circle-outer circle.front {
  animation: circle-outer135 1.8s ease infinite 0.15s;
}
.wifi-loader svg.circle-middle {
  height: 60px;
  width: 60px;
}
.wifi-loader svg.circle-middle circle {
  stroke-dasharray: 42.5 127.5;
}
.wifi-loader svg.circle-middle circle.back {
  animation: circle-middle6123 1.8s ease infinite 0.25s;
}
.wifi-loader svg.circle-middle circle.front {
  animation: circle-middle6123 1.8s ease infinite 0.1s;
}
.wifi-loader svg.circle-inner {
  height: 34px;
  width: 34px;
}
.wifi-loader svg.circle-inner circle {
  stroke-dasharray: 22 66;
}
.wifi-loader svg.circle-inner circle.back {
  animation: circle-inner162 1.8s ease infinite 0.2s;
}
.wifi-loader svg.circle-inner circle.front {
  animation: circle-inner162 1.8s ease infinite 0.05s;
}
.wifi-loader .text {
  position: absolute;
  bottom: -40px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: lowercase;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.2px;
}
.wifi-loader .text::before,
.wifi-loader .text::after {
  content: attr(data-text);
}
.wifi-loader .text::before {
  color: var(--text-color);
}
.wifi-loader .text::after {
  color: var(--front-color);
  animation: text-animation76 3.6s ease infinite;
  position: absolute;
  left: 0;
}
@keyframes circle-outer135 {
  0% { stroke-dashoffset: 25; }
  25% { stroke-dashoffset: 0; }
  65% { stroke-dashoffset: 301; }
  80% { stroke-dashoffset: 276; }
  100% { stroke-dashoffset: 276; }
}
@keyframes circle-middle6123 {
  0% { stroke-dashoffset: 17; }
  25% { stroke-dashoffset: 0; }
  65% { stroke-dashoffset: 204; }
  80% { stroke-dashoffset: 187; }
  100% { stroke-dashoffset: 187; }
}
@keyframes circle-inner162 {
  0% { stroke-dashoffset: 9; }
  25% { stroke-dashoffset: 0; }
  65% { stroke-dashoffset: 106; }
  80% { stroke-dashoffset: 97; }
  100% { stroke-dashoffset: 97; }
}
@keyframes text-animation76 {
  0% { clip-path: inset(0 100% 0 0); }
  50% { clip-path: inset(0); }
  100% { clip-path: inset(0 0 0 100%); }
}

.ai-hd { display: block; font-size: 28rpx; font-weight: 600; color: #222; margin-bottom: 10rpx; }
.ai-bd { display: block; width: 100%; font-size: 24rpx; color: #555; line-height: 1.8; }
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

/* 计划草案卡片 */
.proposal-wrap { width: 100%; }
.proposal-status-badge {
  display: inline-block; padding: 6rpx 16rpx; border-radius: 8rpx;
  margin-bottom: 12rpx; font-size: 22rpx;
}
.proposal-status-badge.status-pending { background: rgba(255,165,0,0.15); color: #e67e00; }
.proposal-status-badge.status-confirmed { background: rgba(107,203,119,0.15); color: #3d9a4a; }
.proposal-status-badge.status-rejected { background: rgba(200,200,200,0.25); color: #888; }
.proposal-status-badge.status-expired { background: rgba(150,150,150,0.15); color: #999; }
.proposal-intro { margin-bottom: 16rpx; }
.proposal-loading { padding: 24rpx 0; text-align: center; }
.proposal-loading-txt { font-size: 24rpx; color: #99c4e8; }
.proposal-body {
  background: linear-gradient(135deg, #f8fbff, #eef7ff);
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(79,172,254,0.12);
}
.proposal-title {
  display: block; font-size: 30rpx; font-weight: 600; color: #222; margin-bottom: 8rpx;
}
.proposal-desc, .proposal-summary {
  display: block; font-size: 24rpx; color: #555; line-height: 1.7; margin-bottom: 8rpx;
}
.proposal-meta {
  display: block; font-size: 22rpx; color: #4facfe; margin-bottom: 16rpx;
}
.proposal-day {
  padding: 16rpx 0;
  border-top: 1rpx solid rgba(79,172,254,0.1);
}
.proposal-day:first-of-type { border-top: none; padding-top: 0; }
.day-hd { display: flex; align-items: center; gap: 12rpx; margin-bottom: 6rpx; flex-wrap: wrap; }
.day-tag {
  font-size: 20rpx; color: #fff; background: #4facfe;
  padding: 4rpx 12rpx; border-radius: 8rpx;
}
.day-date { font-size: 22rpx; color: #4a8cc7; }
.day-mins { font-size: 22rpx; color: #99c4e8; margin-left: auto; }
.day-title { display: block; font-size: 26rpx; font-weight: 500; color: #333; margin-bottom: 4rpx; }
.day-desc { display: block; font-size: 22rpx; color: #777; line-height: 1.6; }
.proposal-expire {
  display: block; font-size: 20rpx; color: #99c4e8; margin-top: 12rpx;
}
.proposal-actions {
  display: flex; gap: 16rpx; margin-top: 20rpx;
}
.btn-proposal-reject, .btn-proposal-confirm {
  flex: 1; text-align: center; padding: 18rpx 0; border-radius: 12rpx;
  font-size: 26rpx;
}
.btn-proposal-reject {
  background: #fff; border: 1rpx solid #ddd; color: #666;
}
.btn-proposal-reject.disabled { opacity: 0.5; }
.btn-proposal-confirm {
  background: linear-gradient(135deg, #4facfe, #6cb4ee); color: #fff;
}
.btn-proposal-confirm.disabled { opacity: 0.6; }
.proposal-done {
  margin-top: 16rpx; padding: 16rpx; background: #e8f4fd;
  border-radius: 10rpx; text-align: center;
}
.proposal-done text { font-size: 24rpx; color: #4a8cc7; }

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
  flex-shrink: 0;
  background: #fff; border-radius: 18rpx;
  padding: 16rpx 18rpx 20rpx; margin: 0 24rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(79,172,254,0.08);
}
.inp { font-size: 26rpx; color: #333; padding-bottom: 14rpx; }
.inp-ph { color: #b8d8f0; font-size: 24rpx; }

.voice-area {
  padding: 24rpx 0; text-align: center;
  min-height: 80rpx; box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.voice-area.recording {
  background: rgba(79,172,254,0.08);
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
  touch-action: none;
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

/* 历史会话 */
.history-mask {
  position: fixed; left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,0.35); z-index: 200;
  display: flex; align-items: flex-start; justify-content: flex-end;
}
.history-panel {
  width: 72%; max-width: 560rpx; height: 100%;
  background: #fff;
  display: flex; flex-direction: column;
  box-shadow: -4rpx 0 24rpx rgba(0,0,0,0.08);
}
.history-hd {
  flex-shrink: 0;
  padding: 120rpx 28rpx 20rpx;
  border-bottom: 1rpx solid #eef5fb;
  display: flex; align-items: center; justify-content: space-between;
}
.history-title { font-size: 32rpx; font-weight: 600; color: #222; }
.history-new {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  padding: 10rpx 20rpx; border-radius: 20rpx;
}
.history-new-txt { font-size: 22rpx; color: #fff; }
.history-scroll { flex: 1; height: 0; }
.history-empty { padding: 80rpx 28rpx; text-align: center; }
.history-empty-txt { font-size: 26rpx; color: #99c4e8; }
.history-item {
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f0f7ff;
}
.history-item.active { background: #e8f4fd; }
.history-item-title {
  display: block; font-size: 28rpx; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.history-item-meta {
  display: block; font-size: 22rpx; color: #99c4e8; margin-top: 6rpx;
}
.history-local { color: #4facfe; }
.history-loading { padding: 20rpx 28rpx 40rpx; text-align: center; }
.history-loading-txt { font-size: 22rpx; color: #99c4e8; }

/* 语音气泡 */
.voice-bubble {
  display: flex; align-items: center; gap: 12rpx;
  min-width: 160rpx;
}
.voice-play-icon {
  font-size: 28rpx; color: #fff; flex-shrink: 0;
}
.voice-wave {
  display: flex; align-items: flex-end; gap: 4rpx; height: 28rpx;
}
.wave-bar {
  width: 6rpx; height: 12rpx; background: rgba(255,255,255,0.5);
  border-radius: 3rpx;
}
.wave-bar.active { animation: voiceWave 0.6s ease-in-out infinite alternate; }
.wave-bar:nth-child(2).active { animation-delay: 0.1s; }
.wave-bar:nth-child(3).active { animation-delay: 0.2s; }
.wave-bar:nth-child(4).active { animation-delay: 0.3s; }
@keyframes voiceWave {
  from { height: 10rpx; }
  to { height: 26rpx; background: #fff; }
}
.voice-text {
  font-size: 24rpx; color: rgba(255,255,255,0.95);
  max-width: 320rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
</style>
