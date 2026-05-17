<template>
  <view class="profile-page">
    <!-- 动态背景 -->
    <view class="bg-bubbles">
      <view class="bubble b1"></view>
      <view class="bubble b2"></view>
      <view class="bubble b3"></view>
      <view class="bubble b4"></view>
      <view class="bubble b5"></view>
      <view class="bubble b6"></view>
    </view>

    <!-- 浮动粒子 -->
    <view class="particles">
      <view class="particle p1"></view>
      <view class="particle p2"></view>
      <view class="particle p3"></view>
      <view class="particle p4"></view>
      <view class="particle p5"></view>
      <view class="particle p6"></view>
      <view class="particle p7"></view>
      <view class="particle p8"></view>
      <view class="particle p9"></view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="15,18 9,12 15,6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </view>

    <!-- 头部区域 -->
    <view class="hero" :class="{ show: loaded }">
      <view class="hero-bg">
        <svg class="hero-wave" viewBox="0 0 750 200" preserveAspectRatio="none">
          <path d="M0,80 C180,20 360,140 750,80 L750,0 L0,0 Z" fill="rgba(79,172,254,0.08)">
            <animate attributeName="d" values="M0,80 C180,20 360,140 750,80 L750,0 L0,0 Z;M0,80 C180,140 360,20 750,80 L750,0 L0,0 Z;M0,80 C180,20 360,140 750,80 L750,0 L0,0 Z" dur="4s" repeatCount="indefinite"/>
          </path>
          <path d="M0,100 C200,50 400,150 750,100 L750,0 L0,0 Z" fill="rgba(0,242,254,0.05)">
            <animate attributeName="d" values="M0,100 C200,50 400,150 750,100 L750,0 L0,0 Z;M0,100 C200,150 400,50 750,100 L750,0 L0,0 Z;M0,100 C200,50 400,150 750,100 L750,0 L0,0 Z" dur="5s" repeatCount="indefinite"/>
          </path>
        </svg>
      </view>

      <!-- 头像 -->
      <view class="avatar-area">
        <view class="avatar-ring"></view>
        <view class="avatar-ring ring2"></view>
        <view class="avatar-box">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#4facfe" stroke-width="1.5"/>
            <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </view>
        <view class="online-dot"></view>
      </view>

      <!-- 用户信息 -->
      <text class="nickname">{{ userInfo.nickname || 'REDSPIDER用户' }}</text>
      <text class="email">{{ userInfo.email || '未设置邮箱' }}</text>

      <!-- 编辑资料按钮 -->
      <view class="edit-btn" @tap="editProfile">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <text>编辑资料</text>
      </view>
    </view>

    <!-- 数据统计卡片 -->
    <view class="stats-card" :class="{ show: loaded }">
      <view class="stat-item" v-for="(s, i) in stats" :key="i" :style="{ animationDelay: (i * 0.1 + 0.3) + 's' }">
        <view class="stat-icon" :style="{ background: s.bg }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path v-if="s.key === 'plans'" d="M9 11l3 3L22 4" :stroke="s.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <template v-if="s.key === 'plans'"><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" :stroke="s.color" stroke-width="1.5"/></template>
            <template v-if="s.key === 'days'">
              <rect x="3" y="4" width="18" height="18" rx="2" :stroke="s.color" stroke-width="1.5"/>
              <line x1="16" y1="2" x2="16" y2="6" :stroke="s.color" stroke-width="1.5"/>
              <line x1="8" y1="2" x2="8" y2="6" :stroke="s.color" stroke-width="1.5"/>
              <line x1="3" y1="10" x2="21" y2="10" :stroke="s.color" stroke-width="1.5"/>
            </template>
            <template v-if="s.key === 'streak'">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" :stroke="s.color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </template>
            <template v-if="s.key === 'hours'">
              <circle cx="12" cy="12" r="10" :stroke="s.color" stroke-width="1.5"/>
              <polyline points="12,6 12,12 16,14" :stroke="s.color" stroke-width="1.5" stroke-linecap="round"/>
            </template>
          </svg>
        </view>
        <text class="stat-value">{{ s.value }}</text>
        <text class="stat-label">{{ s.label }}</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card" :class="{ show: loaded }">
      <view
        class="menu-item"
        v-for="(m, i) in menus"
        :key="i"
        :style="{ animationDelay: (i * 0.08 + 0.5) + 's' }"
        @tap="onMenu(m.key)"
      >
        <view class="menu-icon" :style="{ background: m.bg }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <template v-if="m.key === 'plan'">
              <rect x="3" y="4" width="18" height="18" rx="2" :stroke="m.color" stroke-width="1.5"/>
              <line x1="16" y1="2" x2="16" y2="6" :stroke="m.color" stroke-width="1.5"/>
              <line x1="8" y1="2" x2="8" y2="6" :stroke="m.color" stroke-width="1.5"/>
              <line x1="3" y1="10" x2="21" y2="10" :stroke="m.color" stroke-width="1.5"/>
              <line x1="8" y1="14" x2="16" y2="14" :stroke="m.color" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="8" y1="18" x2="13" y2="18" :stroke="m.color" stroke-width="1.2" stroke-linecap="round"/>
            </template>
            <template v-if="m.key === 'stats'">
              <path d="M18 20V10" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M12 20V4" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M6 20v-6" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
            </template>
            <template v-if="m.key === 'reminder'">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" :stroke="m.color" stroke-width="1.5"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
            </template>
            <template v-if="m.key === 'theme'">
              <circle cx="12" cy="12" r="5" :stroke="m.color" stroke-width="1.5"/>
              <line x1="12" y1="1" x2="12" y2="3" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="21" x2="12" y2="23" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="1" y1="12" x2="3" y2="12" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="21" y1="12" x2="23" y2="12" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
            </template>
            <template v-if="m.key === 'about'">
              <circle cx="12" cy="12" r="10" :stroke="m.color" stroke-width="1.5"/>
              <line x1="12" y1="16" x2="12" y2="12" :stroke="m.color" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="8" x2="12.01" y2="8" :stroke="m.color" stroke-width="2" stroke-linecap="round"/>
            </template>
            <template v-if="m.key === 'feedback'">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" :stroke="m.color" stroke-width="1.5"/>
              <line x1="8" y1="8" x2="16" y2="8" :stroke="m.color" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="8" y1="12" x2="13" y2="12" :stroke="m.color" stroke-width="1.2" stroke-linecap="round"/>
            </template>
          </svg>
        </view>
        <text class="menu-label">{{ m.label }}</text>
        <view class="menu-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="9,6 15,12 9,18" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-area" :class="{ show: loaded }">
      <button class="btn-logout" @tap="onLogout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#ff6b6b" stroke-width="1.5" stroke-linecap="round"/>
          <polyline points="16,17 21,12 16,7" stroke="#ff6b6b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="#ff6b6b" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <text>退出登录</text>
      </button>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserInfo, logout as apiLogout } from '../../utils/api.js'

const loaded = ref(false)
const userInfo = ref({ nickname: '', email: '', uid: '' })

const stats = [
  { key: 'plans', value: '36', label: '完成计划', bg: 'rgba(79,172,254,0.1)', color: '#4facfe' },
  { key: 'days', value: '28', label: '活跃天数', bg: 'rgba(107,203,119,0.1)', color: '#6bcb77' },
  { key: 'streak', value: '7', label: '连续打卡', bg: 'rgba(255,165,0,0.1)', color: '#ffa500' },
  { key: 'hours', value: '42h', label: '学习时长', bg: 'rgba(123,109,240,0.1)', color: '#7b6df0' }
]

const menus = [
  { key: 'plan', label: '我的计划', bg: 'rgba(79,172,254,0.1)', color: '#4facfe' },
  { key: 'stats', label: '数据统计', bg: 'rgba(107,203,119,0.1)', color: '#6bcb77' },
  { key: 'reminder', label: '提醒设置', bg: 'rgba(255,165,0,0.1)', color: '#ffa500' },
  { key: 'feedback', label: '意见反馈', bg: 'rgba(123,109,240,0.1)', color: '#7b6df0' },
  { key: 'theme', label: '主题设置', bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
  { key: 'about', label: '关于我们', bg: 'rgba(0,242,254,0.1)', color: '#00c6fb' }
]

async function loadUserInfo() {
  try {
    const res = await getUserInfo()
    userInfo.value = {
      nickname: res.nickname || 'REDSPIDER用户',
      email: res.phone || uni.getStorageSync('uid') || '',
      uid: res.uid || ''
    }
    uni.setStorageSync('userInfo', JSON.stringify(userInfo.value))
  } catch (e) {
    // 如果接口失败，读本地缓存
    const info = uni.getStorageSync('userInfo')
    if (info) {
      try {
        userInfo.value = typeof info === 'string' ? JSON.parse(info) : info
      } catch(e2) {
        userInfo.value = { nickname: '', email: '' }
      }
    }
  }
}

onMounted(() => {
  loadUserInfo()
  setTimeout(() => { loaded.value = true }, 80)
})

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

function editProfile() {
  uni.showToast({ title: '编辑资料功能开发中', icon: 'none' })
}

function onMenu(key) {
  if (key === 'plan') {
    uni.navigateTo({ url: '/pages/plans/plans' })
  } else {
    const labels = { stats: '数据统计', reminder: '提醒设置', feedback: '意见反馈', theme: '主题设置', about: '关于我们' }
    uni.showToast({ title: labels[key] + '功能开发中', icon: 'none' })
  }
}

function onLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiLogout()
        } catch (e) {
          // 即使接口失败也清除本地状态
        }
        uni.showToast({ title: '已退出登录', icon: 'none' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' })
        }, 800)
      }
    }
  })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e0f4ff 0%, #eaf5ff 30%, #f5f9ff 60%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

/* 动态气泡 */
.bg-bubbles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.b1 { width: 240rpx; height: 240rpx; background: #4facfe; top: -60rpx; right: -40rpx; animation: float1 7s ease-in-out infinite; }
.b2 { width: 160rpx; height: 160rpx; background: #00f2fe; top: 200rpx; left: -50rpx; animation: float2 9s ease-in-out infinite; }
.b3 { width: 120rpx; height: 120rpx; background: #a8d8ff; bottom: 500rpx; right: 40rpx; animation: float3 8s ease-in-out infinite; }
.b4 { width: 180rpx; height: 180rpx; background: #6cb4ee; bottom: 100rpx; left: -40rpx; animation: float1 10s ease-in-out infinite; }
.b5 { width: 80rpx; height: 80rpx; background: #74b9ff; top: 45%; left: 60%; animation: float2 6s ease-in-out infinite; }
.b6 { width: 100rpx; height: 100rpx; background: #00f2fe; bottom: 300rpx; right: -30rpx; animation: float3 7.5s ease-in-out infinite; }

@keyframes float1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30rpx) scale(1.05); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(25rpx) translateX(15rpx); }
}
@keyframes float3 {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20rpx) translateX(-15rpx); }
}

/* 粒子 */
.particles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(79, 172, 254, 0.25);
}

.p1 { width: 6rpx; height: 6rpx; top: 8%; left: 12%; animation: drift 4s ease-in-out infinite; }
.p2 { width: 8rpx; height: 8rpx; top: 18%; right: 15%; animation: drift 5s ease-in-out infinite 0.5s; background: rgba(0,242,254,0.2); }
.p3 { width: 5rpx; height: 5rpx; top: 35%; left: 5%; animation: drift 3.5s ease-in-out infinite 1s; }
.p4 { width: 10rpx; height: 10rpx; top: 55%; right: 8%; animation: drift 4.5s ease-in-out infinite 0.3s; background: rgba(168,216,255,0.2); }
.p5 { width: 4rpx; height: 4rpx; top: 70%; left: 25%; animation: drift 3s ease-in-out infinite 0.8s; }
.p6 { width: 7rpx; height: 7rpx; top: 42%; left: 75%; animation: drift 5.5s ease-in-out infinite 0.2s; }
.p7 { width: 5rpx; height: 5rpx; top: 12%; left: 60%; animation: drift 4s ease-in-out infinite 1.2s; }
.p8 { width: 6rpx; height: 6rpx; top: 65%; right: 30%; animation: drift 4.2s ease-in-out infinite 0.6s; background: rgba(123,109,240,0.2); }
.p9 { width: 4rpx; height: 4rpx; top: 85%; left: 50%; animation: drift 3.8s ease-in-out infinite 0.9s; }

@keyframes drift {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
  25% { transform: translateY(-35rpx) translateX(15rpx) scale(1.2); opacity: 0.9; }
  50% { transform: translateY(-10rpx) translateX(-20rpx) scale(0.8); opacity: 0.3; }
  75% { transform: translateY(-25rpx) translateX(10rpx) scale(1.1); opacity: 0.7; }
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  top: 100rpx;
  left: 32rpx;
  z-index: 10;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头部区域 */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.6s ease-out;
}

.hero.show {
  opacity: 1;
  transform: translateY(0);
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 300rpx;
  z-index: 0;
  pointer-events: none;
}

.hero-wave {
  width: 100%;
  height: 100%;
}

/* 头像 */
.avatar-area {
  position: relative;
  z-index: 1;
  margin-bottom: 20rpx;
}

.avatar-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 170rpx;
  height: 170rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(79,172,254,0.15);
  animation: spinSlow 8s linear infinite;
}

.avatar-ring.ring2 {
  width: 190rpx;
  height: 190rpx;
  border-style: dashed;
  border-color: rgba(0,242,254,0.1);
  animation: spinSlow 12s linear infinite reverse;
}

@keyframes spinSlow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.avatar-box {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f4fd, #d4ecff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.2);
  animation: avatarPulse 3s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%, 100% { box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.2); }
  50% { box-shadow: 0 8rpx 40rpx rgba(79,172,254,0.35); }
}

.online-dot {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #6bcb77;
  border: 4rpx solid #fff;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.nickname {
  display: block;
  font-size: 38rpx;
  font-weight: 800;
  color: #222;
  letter-spacing: 2rpx;
  margin-top: 8rpx;
}

.email {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 24rpx;
  padding: 12rpx 28rpx;
  background: rgba(79,172,254,0.08);
  border-radius: 30rpx;
  border: 1rpx solid rgba(79,172,254,0.15);
  transition: all 0.3s;
}

.edit-btn:active {
  transform: scale(0.95);
  background: rgba(79,172,254,0.15);
}

.edit-btn text {
  font-size: 24rpx;
  color: #4facfe;
}

/* 数据统计卡片 */
.stats-card {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12rpx;
  margin: 40rpx 32rpx 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20rpx);
  border-radius: 28rpx;
  padding: 32rpx 16rpx;
  box-shadow: 0 8rpx 40rpx rgba(79,172,254,0.08);
  border: 1rpx solid rgba(255,255,255,0.6);
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.6s ease-out 0.2s;
}

.stats-card.show {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 34rpx;
  font-weight: 800;
  color: #222;
}

.stat-label {
  font-size: 20rpx;
  color: #aaa;
}

/* 菜单卡片 */
.menu-card {
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20rpx);
  border-radius: 28rpx;
  margin: 24rpx 32rpx 0;
  padding: 8rpx 0;
  box-shadow: 0 8rpx 40rpx rgba(79,172,254,0.08);
  border: 1rpx solid rgba(255,255,255,0.6);
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.6s ease-out 0.3s;
}

.menu-card.show {
  opacity: 1;
  transform: translateY(0);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  transition: background 0.2s;
  animation: fadeInUp 0.4s ease-out both;
}

.menu-item:active {
  background: rgba(79,172,254,0.04);
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  margin-left: 20rpx;
  font-weight: 500;
}

.menu-arrow {
  flex-shrink: 0;
}

/* 退出按钮 */
.logout-area {
  position: relative;
  z-index: 1;
  margin: 32rpx 32rpx 0;
  opacity: 0;
  transition: opacity 0.6s ease-out 0.6s;
}

.logout-area.show {
  opacity: 1;
}

.btn-logout {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: rgba(255,107,107,0.06);
  border: 1rpx solid rgba(255,107,107,0.15);
  border-radius: 48rpx;
  transition: all 0.3s;
}

.btn-logout::after {
  border: none;
}

.btn-logout:active {
  transform: scale(0.97);
  background: rgba(255,107,107,0.12);
}

.btn-logout text {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: 600;
}

.safe-bottom {
  height: 60rpx;
}
</style>
