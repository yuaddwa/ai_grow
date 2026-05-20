<template>
  <view class="login-page">
    <!-- 动态背景气泡 -->
    <view class="bg-bubbles">
      <view class="bubble b1"></view>
      <view class="bubble b2"></view>
      <view class="bubble b3"></view>
      <view class="bubble b4"></view>
      <view class="bubble b5"></view>
    </view>

    <!-- 启动动画 -->
    <view class="splash" :class="{ hide: splashHide }">
      <!-- 浮动粒子 -->
      <view class="particles" v-if="!splashHide">
        <view class="particle p1"></view>
        <view class="particle p2"></view>
        <view class="particle p3"></view>
        <view class="particle p4"></view>
        <view class="particle p5"></view>
        <view class="particle p6"></view>
        <view class="particle p7"></view>
        <view class="particle p8"></view>
        <view class="particle p9"></view>
        <view class="particle p10"></view>
        <view class="particle p11"></view>
        <view class="particle p12"></view>
      </view>

      <!-- 扩散涟漪 -->
      <view class="ripple r1" :class="{ show: rippleShow }"></view>
      <view class="ripple r2" :class="{ show: rippleShow }"></view>
      <view class="ripple r3" :class="{ show: rippleShow }"></view>

      <!-- 光环 -->
      <view class="ring ring-outer" :class="{ show: splashReady }"></view>
      <view class="ring ring-inner" :class="{ show: splashReady }"></view>

      <!-- 浮动几何图形 -->
      <view class="shapes" v-if="!splashHide">
        <view class="shape s1" :class="{ show: shapeShow }"></view>
        <view class="shape s2" :class="{ show: shapeShow }"></view>
        <view class="shape s3" :class="{ show: shapeShow }"></view>
        <view class="shape s4" :class="{ show: shapeShow }"></view>
        <view class="shape s5" :class="{ show: shapeShow }"></view>
        <view class="shape s6" :class="{ show: shapeShow }"></view>
      </view>

      <!-- 机器人 -->
      <view class="splash-center" :class="{ show: splashReady }">
        <view class="robot-glow"></view>
        <view class="robot-glow g2"></view>
        <text class="splash-robot" style="font-size:140rpx;">🤖</text>
      </view>

      <!-- 标题文字（逐字动画） -->
      <view class="splash-title-wrap">
        <view class="splash-title">
          <view v-for="(item, ci) in titleChars" :key="ci" class="title-char" :class="{ visible: item.show }">{{ item.ch }}</view>
        </view>
      </view>

      <view class="splash-sub-wrap" :class="{ show: subShow }">
        <text class="splash-sub">你的智能成长助手</text>
      </view>

      <!-- 进度条 -->
      <view class="splash-progress" :class="{ show: splashReady }">
        <view class="progress-bar" :class="{ go: progressGo }"></view>
      </view>

      <!-- 底部波浪 -->
      <view class="wave-wrap" :class="{ show: waveShow }">
        <view class="wave wave1"></view>
        <view class="wave wave2"></view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content" :class="{ show: loaded }">
      <!-- 标题 -->
      <view class="title-area">
        <text class="title">欢迎回来</text>
        <text class="subtitle">登录你的 REDSPIDER 账号</text>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">✉</text>
          </view>
          <input
            class="form-input"
            v-model="loginForm.email"
            type="text"
            placeholder="请输入邮箱"
            placeholder-class="ph"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">🔒</text>
          </view>
          <input
            class="form-input"
            v-model="loginForm.password"
            placeholder="请输入密码"
            placeholder-class="ph"
            :password="!showPw"
          />
          <view class="toggle-pw" @tap="showPw = !showPw">
            <text style="font-size:24rpx;color:#bbb;">{{ showPw ? '隐藏' : '显示' }}</text>
          </view>
        </view>

        <view class="forgot-link">
          <text @tap="onForgotPw">忘记密码？</text>
        </view>

        <button class="btn-login" :class="{ active: canLogin }" @tap="onLogin">
          <text class="btn-text">登 录</text>
        </button>
      </view>

      <!-- 底部注册链接 -->
      <view class="bottom-area">
        <text class="bottom-text">还没有账号？</text>
        <text class="bottom-link" @tap="goRegister">去注册</text>
      </view>

      <!-- 协议 -->
      <view class="agreement">
        <text>登录即代表同意《用户协议》《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { login } from '../../utils/api.js'

// 模块级标记：同一会话内只播一次
let splashPlayed = false

const loaded = ref(false)
const splashReady = ref(false)
const splashHide = ref(false)
const textShow = ref(false)
const subShow = ref(false)
const progressGo = ref(false)
const rippleShow = ref(false)
const shapeShow = ref(false)
const waveShow = ref(false)
const showPw = ref(false)
const logging = ref(false)

const titleChars = ref([
  { ch: 'R', show: false },
  { ch: 'E', show: false },
  { ch: 'D', show: false },
  { ch: 'S', show: false },
  { ch: 'P', show: false },
  { ch: 'I', show: false },
  { ch: 'D', show: false },
  { ch: 'E', show: false },
  { ch: 'R', show: false }
])

function showTitleChars() {
  titleChars.value.forEach((item, i) => {
    setTimeout(() => { item.show = true }, i * 180)
  })
}

const loginForm = ref({ email: '', password: '' })

const canLogin = computed(() => {
  return loginForm.value.email && loginForm.value.password && !logging.value
})

if (splashPlayed) {
  // 已播放过，直接显示内容
  splashHide.value = true
  loaded.value = true
} else {
  splashPlayed = true
  setTimeout(() => { rippleShow.value = true }, 200)
  setTimeout(() => { splashReady.value = true }, 500)
  setTimeout(() => { shapeShow.value = true }, 800)
  setTimeout(() => { showTitleChars() }, 1200)
  setTimeout(() => { subShow.value = true }, 2400)
  setTimeout(() => { waveShow.value = true }, 2600)
  setTimeout(() => { progressGo.value = true }, 2800)
  setTimeout(() => { splashHide.value = true }, 4800)
  setTimeout(() => { loaded.value = true }, 5100)
}

async function onLogin() {
  if (!canLogin.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  logging.value = true
  try {
    const res = await login(loginForm.value.email, loginForm.value.password)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 1000)
  } catch (e) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    logging.value = false
  }
}

function goRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
}

function onForgotPw() {
  uni.navigateTo({ url: '/pages/forgot/forgot' })
}
</script>

<style scoped>
.login-page {
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f4fd 0%, #d4ecff 30%, #e0f0ff 60%, #f0f7ff 100%);
  position: relative;
  overflow: hidden;
}

/* 动态气泡背景 */
.bg-bubbles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.b1 {
  width: 300rpx; height: 300rpx;
  background: #4facfe;
  top: -80rpx; right: -60rpx;
  animation: float1 6s ease-in-out infinite;
}

.b2 {
  width: 200rpx; height: 200rpx;
  background: #6cb4ee;
  top: 200rpx; left: -40rpx;
  animation: float2 8s ease-in-out infinite;
}

.b3 {
  width: 160rpx; height: 160rpx;
  background: #a8d8ff;
  bottom: 300rpx; right: 40rpx;
  animation: float3 7s ease-in-out infinite;
}

.b4 {
  width: 120rpx; height: 120rpx;
  background: #89f7fe;
  bottom: 100rpx; left: 60rpx;
  animation: float1 9s ease-in-out infinite;
}

.b5 {
  width: 80rpx; height: 80rpx;
  background: #74b9ff;
  top: 50%; left: 50%;
  animation: float2 5s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-40rpx) scale(1.05); }
}

@keyframes float2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(30rpx) translateX(20rpx); }
}

@keyframes float3 {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20rpx) translateX(-30rpx); }
}

/* 启动动画 */
.splash {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
  background: linear-gradient(135deg, #e8f4fd 0%, #d4ecff 30%, #c3e8fd 60%, #e0f0ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.8s ease-out;
  overflow: hidden;
}

.splash.hide {
  opacity: 0;
  pointer-events: none;
}

/* 浮动粒子 */
.particles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(79, 172, 254, 0.35);
}

.p1 { width: 6rpx; height: 6rpx; top: 8%; left: 12%; animation: drift 4s ease-in-out infinite; }
.p2 { width: 10rpx; height: 10rpx; top: 20%; right: 18%; animation: drift 5s ease-in-out infinite 0.5s; background: rgba(79, 172, 254, 0.25); }
.p3 { width: 4rpx; height: 4rpx; top: 55%; left: 8%; animation: drift 3.5s ease-in-out infinite 1s; }
.p4 { width: 8rpx; height: 8rpx; top: 70%; right: 12%; animation: drift 4.5s ease-in-out infinite 0.3s; background: rgba(108, 180, 238, 0.3); }
.p5 { width: 5rpx; height: 5rpx; top: 35%; left: 78%; animation: drift 3s ease-in-out infinite 0.8s; }
.p6 { width: 12rpx; height: 12rpx; top: 82%; left: 35%; animation: drift 5.5s ease-in-out infinite 0.2s; background: rgba(168, 216, 255, 0.25); }
.p7 { width: 4rpx; height: 4rpx; top: 12%; left: 62%; animation: drift 4s ease-in-out infinite 1.2s; }
.p8 { width: 8rpx; height: 8rpx; top: 48%; left: 28%; animation: drift 6s ease-in-out infinite 0.6s; background: rgba(255, 217, 61, 0.25); }
.p9 { width: 7rpx; height: 7rpx; top: 30%; left: 45%; animation: drift 4.2s ease-in-out infinite 0.4s; background: rgba(79, 172, 254, 0.25); }
.p10 { width: 5rpx; height: 5rpx; top: 65%; right: 30%; animation: drift 3.8s ease-in-out infinite 0.9s; background: rgba(79, 172, 254, 0.3); }
.p11 { width: 9rpx; height: 9rpx; top: 15%; right: 40%; animation: drift 5.2s ease-in-out infinite 1.1s; background: rgba(195, 232, 253, 0.3); }
.p12 { width: 4rpx; height: 4rpx; top: 90%; left: 70%; animation: drift 3.3s ease-in-out infinite 0.7s; background: rgba(255, 217, 61, 0.2); }

@keyframes drift {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
  25% { transform: translateY(-40rpx) translateX(20rpx) scale(1.2); opacity: 1; }
  50% { transform: translateY(-15rpx) translateX(-25rpx) scale(0.8); opacity: 0.3; }
  75% { transform: translateY(-30rpx) translateX(15rpx) scale(1.1); opacity: 0.8; }
}

/* 扩散涟漪 */
.ripple {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2rpx solid rgba(79, 172, 254, 0.2);
  opacity: 0;
}

.ripple.show {
  animation: rippleOut 2s ease-out infinite;
}

.r1 { width: 100rpx; height: 100rpx; animation-delay: 0s !important; }
.r2 { width: 100rpx; height: 100rpx; animation-delay: 0.6s !important; }
.r3 { width: 100rpx; height: 100rpx; animation-delay: 1.2s !important; }

@keyframes rippleOut {
  0% { width: 100rpx; height: 100rpx; opacity: 0.5; border-width: 2rpx; }
  100% { width: 600rpx; height: 600rpx; opacity: 0; border-width: 0.5rpx; }
}

/* 光环 */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(79, 172, 254, 0.15);
  opacity: 0;
  transition: opacity 0.8s ease-out;
}

.ring.show { opacity: 1; }

.ring-outer {
  width: 380rpx; height: 380rpx;
  animation: spinSlow 8s linear infinite;
  border-style: dashed;
  border-color: rgba(79, 172, 254, 0.15);
}

.ring-inner {
  width: 300rpx; height: 300rpx;
  animation: spinSlow 6s linear infinite reverse;
  border-color: rgba(108, 180, 238, 0.2);
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 浮动几何图形 */
.shapes {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  opacity: 0;
  transition: opacity 1s ease-out;
}

.shape.show { opacity: 1; }

.s1 {
  width: 16rpx; height: 16rpx;
  border: 2rpx solid rgba(79, 172, 254, 0.3);
  top: 18%; left: 20%;
  animation: floatShape 5s ease-in-out infinite, spinShape 8s linear infinite;
}

.s2 {
  width: 10rpx; height: 10rpx;
  background: rgba(255, 217, 61, 0.3);
  border-radius: 50%;
  top: 22%; right: 22%;
  animation: floatShape 4s ease-in-out infinite 0.5s;
}

.s3 {
  width: 0; height: 0;
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-bottom: 14rpx solid rgba(79, 172, 254, 0.2);
  top: 72%; left: 15%;
  animation: floatShape 4.5s ease-in-out infinite 1s, spinShape 10s linear infinite;
}

.s4 {
  width: 14rpx; height: 14rpx;
  border: 2rpx solid rgba(108, 180, 238, 0.25);
  border-radius: 4rpx;
  top: 78%; right: 18%;
  animation: floatShape 5.5s ease-in-out infinite 0.3s, spinShape 7s linear infinite reverse;
}

.s5 {
  width: 8rpx; height: 8rpx;
  background: rgba(79, 172, 254, 0.2);
  border-radius: 50%;
  top: 55%; left: 12%;
  animation: floatShape 3.5s ease-in-out infinite 0.8s;
}

.s6 {
  width: 12rpx; height: 12rpx;
  border: 2rpx solid rgba(255, 217, 61, 0.2);
  top: 40%; right: 10%;
  animation: floatShape 6s ease-in-out infinite 0.2s, spinShape 9s linear infinite;
}

@keyframes floatShape {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-25rpx) translateX(15rpx); }
}

@keyframes spinShape {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 机器人 */
.splash-center {
  position: relative;
  opacity: 0;
  transform: scale(0) translateY(60rpx);
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 40rpx;
}

.splash-center.show {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.robot-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 220rpx; height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 172, 254, 0.12) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

.robot-glow.g2 {
  width: 300rpx; height: 300rpx;
  background: radial-gradient(circle, rgba(79, 172, 254, 0.06) 0%, transparent 70%);
  animation: pulse 3.5s ease-in-out infinite 0.5s;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.9; }
}

.splash-robot {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 20rpx rgba(79, 172, 254, 0.25)) drop-shadow(0 4rpx 12rpx rgba(0,0,0,0.08));
  animation: robotFloat 3.5s ease-in-out infinite;
}

@keyframes robotFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

/* 标题（逐字） */
.splash-title-wrap {
  margin-top: 20rpx;
}

.splash-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  letter-spacing: 4rpx;
}

.title-char {
  font-size: 64rpx;
  font-weight: 900;
  color: #2563eb;
  text-shadow: 0 0 20rpx rgba(37, 99, 235, 0.5), 0 0 40rpx rgba(79, 172, 254, 0.3), 0 2rpx 4rpx rgba(0,0,0,0.1);
  margin: 0 4rpx;
  opacity: 0;
  transform: translateY(60rpx) scale(0.3);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.title-char.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.splash-sub-wrap {
  opacity: 0;
  transform: translateY(16rpx);
  transition: all 0.5s ease-out;
  margin-top: 12rpx;
}

.splash-sub-wrap.show {
  opacity: 1;
  transform: translateY(0);
}

.splash-sub {
  display: block;
  font-size: 28rpx;
  color: #7a8ba8;
  letter-spacing: 6rpx;
}

/* 进度条 */
.splash-progress {
  position: absolute;
  bottom: 180rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 200rpx;
  height: 3rpx;
  background: rgba(79, 172, 254, 0.1);
  border-radius: 2rpx;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s;
}

.splash-progress.show {
  opacity: 1;
}

.progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #4facfe, #6cb4ee, #a8d8ff);
  border-radius: 2rpx;
  transition: width 1.8s ease-out;
}

.progress-bar.go {
  width: 100%;
}

/* 底部波浪 */
.wave-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  opacity: 0;
  transform: translateY(40rpx);
  transition: all 0.8s ease-out;
}

.wave-wrap.show {
  opacity: 1;
  transform: translateY(0);
}

.wave-svg {
  width: 100%;
  height: 100%;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 120rpx;
  border-radius: 50% 50% 0 0;
}

.wave1 {
  background: rgba(79,172,254,0.06);
  animation: waveMove1 3s ease-in-out infinite;
}

.wave2 {
  background: rgba(79,172,254,0.04);
  animation: waveMove2 4s ease-in-out infinite;
  bottom: -10rpx;
}

@keyframes waveMove1 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
}

@keyframes waveMove2 {
  0%, 100% { transform: translateX(-25%); }
  50% { transform: translateX(0); }
}

/* 内容入场动画 */
.content {
  position: relative;
  z-index: 1;
  padding: 160rpx 48rpx 60rpx;
  opacity: 0;
  transform: translateY(60rpx);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.content.show {
  opacity: 1;
  transform: translateY(0);
}

.title-area {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: 800;
  color: #222;
  letter-spacing: 2rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: #888;
  margin-top: 12rpx;
}

/* 表单卡片 */
.form-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 32rpx;
  padding: 40rpx 36rpx;
  box-shadow: 0 8rpx 40rpx rgba(79, 172, 254, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

.input-group {
  display: flex;
  align-items: center;
  background: #f5f9fd;
  border-radius: 20rpx;
  padding: 0 24rpx;
  height: 100rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
}

.input-icon {
  flex-shrink: 0;
  margin-right: 16rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 100rpx;
}

.ph {
  color: #b8d8f0;
}

.toggle-pw {
  flex-shrink: 0;
  padding: 8rpx;
}

.forgot-link {
  text-align: right;
  margin-bottom: 32rpx;
}

.forgot-link text {
  font-size: 24rpx;
  color: #999;
}

.btn-login {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(135deg, #b8d8f0, #c8e0f0);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  border-radius: 50rpx;
  transition: all 0.3s;
  box-shadow: none;
}

.btn-login.active {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  box-shadow: 0 8rpx 24rpx rgba(79, 172, 254, 0.35);
}

.btn-login::after {
  border: none;
}

.btn-text {
  letter-spacing: 8rpx;
}

/* 底部 */
.bottom-area {
  text-align: center;
  margin-top: 48rpx;
}

.bottom-text {
  font-size: 26rpx;
  color: #999;
}

.bottom-link {
  font-size: 26rpx;
  color: #4facfe;
  font-weight: 600;
  margin-left: 8rpx;
}

.agreement {
  text-align: center;
  margin-top: 32rpx;
}

.agreement text {
  font-size: 20rpx;
  color: #bbb;
}
</style>
