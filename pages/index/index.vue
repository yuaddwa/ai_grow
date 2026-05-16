<template>
  <view class="page">
    <view class="banner" :class="{ show: loaded }">
      <view class="banner-row">
        <svg class="robot" width="44" height="50" viewBox="0 0 140 160" fill="none">
          <defs>
            <radialGradient id="bGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stop-color="#f0f4f8"/>
              <stop offset="100%" stop-color="#d8e2ec"/>
            </radialGradient>
            <radialGradient id="hGrad" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stop-color="#f5f8fc"/>
              <stop offset="100%" stop-color="#dde5ef"/>
            </radialGradient>
          </defs>

          <!-- 底座光环 -->
          <ellipse cx="70" cy="148" rx="40" ry="8" fill="rgba(79,172,254,0.15)"/>
          <ellipse cx="70" cy="148" rx="28" ry="5" fill="rgba(79,172,254,0.25)"/>

          <!-- 身体 -->
          <rect x="40" y="92" width="60" height="50" rx="22" fill="url(#bGrad)" stroke="#c8d6e5" stroke-width="0.8"/>
          <!-- 身体蓝光条 -->
          <rect x="52" y="102" width="36" height="3" rx="1.5" fill="#4facfe" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/>
          </rect>
          <rect x="58" y="108" width="24" height="2" rx="1" fill="#4facfe" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" begin="0.3s" repeatCount="indefinite"/>
          </rect>
          <!-- 胸口圆形 -->
          <circle cx="70" cy="120" r="6" fill="none" stroke="#4facfe" stroke-width="1" opacity="0.5"/>
          <circle cx="70" cy="120" r="3" fill="#4facfe" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
          </circle>

          <!-- 左臂 -->
          <rect x="26" y="98" width="14" height="36" rx="7" fill="url(#bGrad)" stroke="#c8d6e5" stroke-width="0.8"/>
          <!-- 右臂 -->
          <rect x="100" y="98" width="14" height="36" rx="7" fill="url(#bGrad)" stroke="#c8d6e5" stroke-width="0.8"/>

          <!-- 头部 -->
          <ellipse cx="70" cy="58" rx="44" ry="40" fill="url(#hGrad)" stroke="#c8d6e5" stroke-width="0.8"/>

          <!-- 耳朵 -->
          <rect x="20" y="48" width="10" height="18" rx="5" fill="#e0e8f0" stroke="#c8d6e5" stroke-width="0.8"/>
          <rect x="110" y="48" width="10" height="18" rx="5" fill="#e0e8f0" stroke="#c8d6e5" stroke-width="0.8"/>

          <!-- 天线 -->
          <line x1="70" y1="18" x2="70" y2="26" stroke="#b8c8d8" stroke-width="2" stroke-linecap="round"/>
          <circle cx="70" cy="15" r="4" fill="#4facfe" opacity="0.8">
            <animate attributeName="r" values="3;4.5;3" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
          </circle>

          <!-- 脸部 - 黑色显示屏 -->
          <rect x="38" y="40" width="64" height="42" rx="14" fill="#0a0e14" stroke="#1a2030" stroke-width="1"/>

          <!-- 眼睛 - 弯曲线条 -->
          <path d="M46 58 Q55 52 64 58" stroke="#4facfe" stroke-width="3" stroke-linecap="round" fill="none">
            <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M76 58 Q85 52 94 58" stroke="#4facfe" stroke-width="3" stroke-linecap="round" fill="none">
            <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite"/>
          </path>

          <!-- 嘴巴 - 微笑弧线 -->
          <path d="M62 69 Q70 75 78 69" stroke="#4facfe" stroke-width="2.5" stroke-linecap="round" fill="none">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
          </path>
        </svg>
        <view class="banner-texts">
          <text class="banner-title">AI成长</text>
          <text class="banner-sub">你的智能计划助手</text>
        </view>
        <view class="plan-entry" @tap="goLogin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="1.5"/>
            <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="plan-entry" @tap="goPlans">
          <text class="plan-entry-txt">计划</text>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <polyline points="9,6 15,12 9,18" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
      </view>
    </view>

    <scroll-view class="chat-scroll" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <view class="msg-list">
        <view
          v-for="(msg, i) in messages"
          :key="i"
          class="msg-item"
          :class="msg.role === 'user' ? 'align-right' : 'align-left'"
          :style="{ animationDelay: (i * 0.1) + 's' }"
        >
          <view v-if="msg.role === 'ai'" class="ai-avatar">
              <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                <!-- 天线 -->
                <line x1="30" y1="5" x2="30" y2="12" stroke="#4facfe" stroke-width="2" stroke-linecap="round"/>
                <circle cx="30" cy="4" r="2.5" fill="#FFD93D"/>
                <!-- 头 -->
                <rect x="14" y="12" width="32" height="26" rx="8" fill="#e8f4fd"/>
                <rect x="14" y="12" width="32" height="26" rx="8" stroke="#d4ecff" stroke-width="1"/>
                <!-- 耳朵 -->
                <rect x="10" y="20" width="5" height="10" rx="2.5" fill="#c3e8fd"/>
                <rect x="45" y="20" width="5" height="10" rx="2.5" fill="#c3e8fd"/>
                <!-- 眼睛 -->
                <circle cx="24" cy="25" r="4" fill="#4facfe"/>
                <circle cx="36" cy="25" r="4" fill="#4facfe"/>
                <circle cx="24" cy="25" r="2" fill="#2b7de9"/>
                <circle cx="36" cy="25" r="2" fill="#2b7de9"/>
                <circle cx="25.5" cy="23" r="1.3" fill="#fff"/>
                <circle cx="37.5" cy="23" r="1.3" fill="#fff"/>
                <!-- 腮红 -->
                <ellipse cx="19" cy="31" rx="3.5" ry="2" fill="#FFB5C5" opacity="0.3"/>
                <ellipse cx="41" cy="31" rx="3.5" ry="2" fill="#FFB5C5" opacity="0.3"/>
                <!-- 嘴巴 -->
                <path d="M25 33 Q30 38 35 33" stroke="#4facfe" stroke-width="2" stroke-linecap="round" fill="none"/>
                <!-- 身体 -->
                <rect x="20" y="40" width="20" height="12" rx="6" fill="#e8f4fd"/>
                <rect x="20" y="40" width="20" height="12" rx="6" stroke="#d4ecff" stroke-width="1"/>
                <circle cx="30" cy="46" r="2.5" fill="#FFD93D" opacity="0.7"/>
              </svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#4facfe" stroke-width="1.5"/>
                    <line x1="12" y1="7" x2="12" y2="12" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="12" y1="12" x2="16" y2="14" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
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
          placeholder="输入计划..."
          placeholder-class="inp-ph"
          confirm-type="send"
          :focus="inputFocus"
          @confirm="onSend"
          @blur="inputFocus = false"
        />
      </view>
      <!-- 语音模式 -->
      <view v-else class="voice-area" @tap="toggleVoice">
        <text class="voice-tip" :class="{ recording: isRecording }">
          {{ isRecording ? '正在录音...点击停止' : '点击说话' }}
        </text>
      </view>

      <view class="inp-tools">
        <!-- 键盘/语音切换 -->
        <view class="inp-btn" @tap="toggleMode">
          <svg v-if="inputMode === 'text'" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="#bbb" stroke-width="1.5"/>
            <line x1="7" y1="10" x2="7" y2="10.01" stroke="#bbb" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="11" y1="10" x2="11" y2="10.01" stroke="#bbb" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="15" y1="10" x2="15" y2="10.01" stroke="#bbb" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="19" y1="10" x2="19" y2="10.01" stroke="#bbb" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="7" y1="14" x2="17" y2="14" stroke="#bbb" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="12" height="16" rx="2" stroke="#bbb" stroke-width="1.5"/>
            <line x1="10" y1="8" x2="14" y2="8" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="10" y1="11" x2="14" y2="11" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="10" y1="14" x2="14" y2="14" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </view>

        <!-- 发送 / 麦克风 -->
        <view
          v-if="inputMode === 'text'"
          class="inp-send"
          :class="{ active: inputText.length > 0 }"
          @tap="onSend"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
        <view
          v-else
          class="inp-mic"
          :class="{ pressed: isRecording }"
          @tap="toggleVoice"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="#fff" stroke-width="1.6"/>
            <path d="M5 11v1a7 7 0 0014 0v-1" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </view>

        <!-- 加号 -->
        <view class="inp-btn" @tap="showAddMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="6" x2="12" y2="18" stroke="#bbb" stroke-width="2" stroke-linecap="round"/>
            <line x1="6" y1="12" x2="18" y2="12" stroke="#bbb" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </view>
      </view>
    </view>

    <!-- 附件菜单弹窗 -->
    <view class="add-mask" v-if="addVisible" @tap="addVisible = false">
      <view class="add-panel" @tap.stop>
        <view class="add-item" v-for="a in addOptions" :key="a.key" @tap="onAdd(a.key)">
          <view class="add-icon-box" :style="{ background: a.bg }">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path v-if="a.key==='photo'" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M21 15l-5-5L5 21" :stroke="a.color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <template v-if="a.key==='file'">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" :stroke="a.color" stroke-width="1.5"/>
                <polyline points="14,2 14,8 20,8" :stroke="a.color" stroke-width="1.5"/>
              </template>
              <template v-if="a.key==='location'">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" :stroke="a.color" stroke-width="1.5"/>
                <circle cx="12" cy="10" r="3" :stroke="a.color" stroke-width="1.5"/>
              </template>
            </svg>
          </view>
          <text class="add-label">{{ a.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

const loaded = ref(false)
const scrollTop = ref(0)
const inputText = ref('')
const inputMode = ref('voice')
const inputFocus = ref(false)
const isRecording = ref(false)
const addVisible = ref(false)
const recordTimer = ref(null)
let recognition = null

const addOptions = [
  { key: 'photo', label: '照片', bg: '#ece5ff', color: '#7b6df0' }
]

const messages = ref([
  {
    role: 'ai', type: 'text',
    title: '你好！我是你的计划助手 👋',
    content: '你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。',
    tip: '比如：明天上午10点开会，下午去健身，晚上学习2小时'
  }
])

const showTags = computed(() => messages.value.length <= 2)

setTimeout(() => { loaded.value = true }, 80)

function scroll() { nextTick(() => { scrollTop.value = Math.random() * 99999 }) }

function goPlans() {
  uni.navigateTo({ url: '/pages/plans/plans' })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function toggleMode() {
  inputMode.value = inputMode.value === 'text' ? 'voice' : 'text'
  if (inputMode.value === 'text') {
    inputFocus.value = true
  }
}

function onSend() {
  const t = inputText.value.trim()
  if (!t) return
  messages.value.push({ role: 'user', content: t })
  inputText.value = ''
  scroll()
  setTimeout(() => { messages.value.push(reply(t)); scroll() }, 700)
}

function toggleVoice() {
  if (isRecording.value) {
    stopRecord()
  } else {
    startRecord()
  }
}

function startRecord() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    uni.showToast({ title: '当前浏览器不支持语音识别', icon: 'none' })
    return
  }

  isRecording.value = true
  recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript
    isRecording.value = false
    messages.value.push({ role: 'user', content: '[语音] ' + text })
    scroll()
    setTimeout(() => { messages.value.push(reply(text)); scroll() }, 700)
  }

  recognition.onerror = () => {
    isRecording.value = false
    uni.showToast({ title: '语音识别失败', icon: 'none' })
  }

  recognition.onend = () => {
    isRecording.value = false
  }

  recognition.start()
}

function stopRecord() {
  if (!isRecording.value) return
  isRecording.value = false
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}

function onQuick(t) {
  messages.value.push({ role: 'user', content: t })
  scroll()
  setTimeout(() => { messages.value.push(reply(t)); scroll() }, 700)
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

function reply(input) {
  const t = input.toLowerCase()
  if (t.includes('安排') || t.includes('计划') || t.includes('开会') || t.includes('健身'))
    return { role: 'ai', type: 'plan', content: '好的，已为你创建以下计划并安排到明天（5月20日）',
      plans: [{ icon: '', name: '会议', time: '10:00 - 11:00' }, { icon: '', name: '健身', time: '14:00 - 15:30' }, { icon: '', name: '学习', time: '20:00 - 22:00' }] }
  if (t.includes('推荐') || t.includes('习惯'))
    return { role: 'ai', type: 'recommend', content: '为你推荐以下高效习惯：',
      items: ['每天早起30分钟，做晨间冥想', '睡前1小时不看手机', '每天写3件感恩的事'] }
  if (t.includes('复盘') || t.includes('喝水'))
    return { role: 'ai', type: 'text', title: '已为你设置提醒 ✅',
      content: t.includes('复盘') ? '每天晚上21:00会提醒你进行今日复盘。' : '已设置每小时喝水提醒，保持充足水分哦！', tip: '' }
  if (t.includes('日程') || t.includes('查看'))
    return { role: 'ai', type: 'plan', content: '这是你今天的日程安排：',
      plans: [{ icon: '', name: '晨会', time: '09:00 - 09:30' }, { icon: '', name: '开发任务', time: '10:00 - 12:00' }, { icon: '', name: '午餐', time: '12:00 - 13:00' }, { icon: '', name: '项目复盘', time: '15:00 - 16:00' }] }
  if (t.includes('数据') || t.includes('统计'))
    return { role: 'ai', type: 'stats', content: '这是你最近7天的数据概览：',
      stats: [{ label: '完成计划', value: '18', color: '#7b6df0' }, { label: '学习时长', value: '12.5h', color: '#67c23a' }, { label: '运动次数', value: '4', color: '#e6a23c' }, { label: '早起天数', value: '5', color: '#f56c6c' }] }
  return { role: 'ai', type: 'text', title: '', content: '收到！我会帮你记住这个计划。你可以继续告诉我更多安排。', tip: '' }
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
@keyframes aIn { from { opacity:0; transform:translateY(-24rpx); } to { opacity:1; transform:translateY(0); } }
@keyframes aUp { from { opacity:0; transform:translateY(32rpx); } to { opacity:1; transform:translateY(0); } }
@keyframes aPop { from { opacity:0; transform:scale(0.94) translateY(12rpx); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

.banner.show { animation: aIn 0.45s ease-out both; }
.func-bar.show { animation: aUp 0.45s ease-out 0.12s both; }
.msg-item { animation: aPop 0.3s ease-out both; }

/* Banner */
.banner {
  background: linear-gradient(135deg, #4facfe 0%, #6cb4ee 50%, #a8d8ff 100%);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin: 0 24rpx 14rpx;
  opacity: 0;
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
}
.plan-entry-txt {
  font-size: 22rpx;
  color: #fff;
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
.msg-item { margin-bottom: 14rpx; }
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
}
.user-txt { font-size: 27rpx; color: #fff; line-height: 1.7; }

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
  padding: 20rpx 0; text-align: center;
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
