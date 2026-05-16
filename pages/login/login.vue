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

    <!-- 内容区 -->
    <view class="content" :class="{ show: loaded }">
      <!-- 标题 -->
      <view class="title-area">
        <text class="title">欢迎回来</text>
        <text class="subtitle">登录你的 AiGROW 账号</text>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
        <view class="input-group">
          <view class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="#4facfe" stroke-width="1.5"/>
              <path d="M2 7l10 6 10-6" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#4facfe" stroke-width="1.5"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#4facfe" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </view>
          <input
            class="form-input"
            v-model="loginForm.password"
            placeholder="请输入密码"
            placeholder-class="ph"
            :password="!showPw"
          />
          <view class="toggle-pw" @tap="showPw = !showPw">
            <svg v-if="!showPw" width="20" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M1 8s5-7 10-7 10 7 10 7-5 7-10 7S1 8 1 8z" stroke="#bbb" stroke-width="1.3"/>
              <circle cx="11" cy="8" r="3" stroke="#bbb" stroke-width="1.3"/>
            </svg>
            <svg v-else width="20" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M1 8s5-7 10-7 10 7 10 7-5 7-10 7S1 8 1 8z" stroke="#4facfe" stroke-width="1.3"/>
              <circle cx="11" cy="8" r="3" stroke="#4facfe" stroke-width="1.3"/>
            </svg>
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

const loaded = ref(false)
const showPw = ref(false)

const loginForm = ref({ email: '', password: '' })

const canLogin = computed(() => {
  return loginForm.value.email && loginForm.value.password
})

setTimeout(() => { loaded.value = true }, 80)

function onLogin() {
  if (!canLogin.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  uni.showToast({ title: '登录成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 1000)
}

function goRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
}

function onForgotPw() {
  uni.showToast({ title: '找回密码功能开发中', icon: 'none' })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
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

/* 内容入场动画 */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(60rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.content {
  position: relative;
  z-index: 1;
  padding: 160rpx 48rpx 60rpx;
  opacity: 0;
}

.content.show {
  animation: slideUp 0.6s ease-out both;
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
  backdrop-filter: blur(20rpx);
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

.input-group:focus-within {
  border-color: rgba(79, 172, 254, 0.4);
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(79, 172, 254, 0.1);
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
