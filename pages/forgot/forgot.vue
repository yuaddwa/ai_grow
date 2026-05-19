<template>
  <view class="forgot-page">
    <!-- 动态背景气泡 -->
    <view class="bg-bubbles">
      <view class="bubble b1"></view>
      <view class="bubble b2"></view>
      <view class="bubble b3"></view>
      <view class="bubble b4"></view>
      <view class="bubble b5"></view>
      <view class="bubble b6"></view>
      <view class="bubble b7"></view>
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
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <text style="font-size:36rpx;color:#333;">‹</text>
    </view>

    <!-- 锁图标动画 -->
    <view class="lock-area" :class="{ show: loaded }">
      <view class="lock-glow"></view>
      <view class="lock-glow g2"></view>
      <text style="font-size:60rpx;color:#7b6df0;">🔒</text>
    </view>

    <!-- 步骤指示器 -->
    <view class="steps" :class="{ show: loaded }">
      <view class="step-item" :class="{ active: step >= 1, done: step > 1 }">
        <view class="step-dot">
          <text v-if="step > 1">✓</text>
          <text v-else>1</text>
        </view>
        <text class="step-label">验证邮箱</text>
      </view>
      <view class="step-line" :class="{ active: step > 1 }"></view>
      <view class="step-item" :class="{ active: step >= 2, done: step > 2 }">
        <view class="step-dot">
          <text v-if="step > 2">✓</text>
          <text v-else>2</text>
        </view>
        <text class="step-label">重置密码</text>
      </view>
      <view class="step-line" :class="{ active: step > 2 }"></view>
      <view class="step-item" :class="{ active: step >= 3 }">
        <view class="step-dot">
          <text>3</text>
        </view>
        <text class="step-label">完成</text>
      </view>
    </view>

    <!-- 表单卡片 -->
    <view class="form-card" :class="{ show: loaded }">
      <!-- 第一步：验证邮箱 -->
      <view class="step-content" :class="{ active: step === 1 }" v-if="step === 1">
        <view class="step-title">
          <text class="title">验证邮箱</text>
          <text class="desc">输入注册邮箱，获取验证码</text>
        </view>

        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">✉</text>
          </view>
          <input
            class="form-input"
            v-model="form.email"
            type="text"
            placeholder="请输入注册邮箱"
            placeholder-class="ph"
          />
        </view>

        <view class="input-group code-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">🛡️</text>
          </view>
          <input
            class="form-input"
            v-model="form.code"
            type="number"
            placeholder="请输入验证码"
            placeholder-class="ph"
          />
          <button
            class="btn-code"
            :class="{ disabled: countdown > 0 }"
            :disabled="countdown > 0"
            @tap="sendCode"
          >
            {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
          </button>
        </view>

        <button class="btn-submit" :class="{ active: canVerify }" @tap="verifyCode">
          <text class="btn-text">下一步</text>
        </button>
      </view>

      <!-- 第二步：重置密码 -->
      <view class="step-content" :class="{ active: step === 2 }" v-if="step === 2">
        <view class="step-title">
          <text class="title">重置密码</text>
          <text class="desc">设置你的新密码</text>
        </view>

        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">🔒</text>
          </view>
          <input
            class="form-input"
            v-model="form.password"
            placeholder="请输入新密码"
            placeholder-class="ph"
            :password="!showPw"
          />
          <view class="toggle-pw" @tap="showPw = !showPw">
            <text style="font-size:24rpx;color:#bbb;">{{ showPw ? '隐藏' : '显示' }}</text>
          </view>
        </view>

        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">🔒</text>
          </view>
          <input
            class="form-input"
            v-model="form.confirmPassword"
            placeholder="请再次输入新密码"
            placeholder-class="ph"
            :password="!showPw2"
          />
          <view class="toggle-pw" @tap="showPw2 = !showPw2">
            <text style="font-size:24rpx;color:#bbb;">{{ showPw2 ? '隐藏' : '显示' }}</text>
          </view>
        </view>

        <!-- 密码强度条 -->
        <view class="strength-bar" v-if="form.password">
          <view class="strength-track">
            <view class="strength-fill" :class="pwStrength" :style="{ width: pwWidth }"></view>
          </view>
          <text class="strength-text" :class="pwStrength">{{ pwText }}</text>
        </view>

        <button class="btn-submit" :class="{ active: canReset }" @tap="handleResetPassword">
          <text class="btn-text">重置密码</text>
        </button>
      </view>

      <!-- 第三步：成功 -->
      <view class="step-content success-content" :class="{ active: step === 3 }" v-if="step === 3">
        <view class="success-icon" :class="{ show: successShow }">
          <text style="font-size:80rpx;color:#6bcb77;">✔</text>
        </view>
        <text class="success-title">重置成功</text>
        <text class="success-desc">密码已重置，请使用新密码登录</text>
        <button class="btn-submit active" @tap="goLogin">
          <text class="btn-text">返回登录</text>
        </button>
      </view>
    </view>

    <!-- 底部 -->
    <view class="bottom-area" :class="{ show: loaded }">
      <text class="bottom-text">想起密码了？</text>
      <text class="bottom-link" @tap="goLogin">去登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { sendResetCode, resetPassword as apiResetPassword } from '../../utils/api.js'

const loaded = ref(false)
const step = ref(1)
const showPw = ref(false)
const showPw2 = ref(false)
const countdown = ref(0)
const successShow = ref(false)
const submitting = ref(false)

const form = ref({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => { nextTick(() => { setTimeout(() => { loaded.value = true }, 50) }) })

const canVerify = computed(() => {
  return form.value.email && form.value.code && !submitting.value
})

const canReset = computed(() => {
  return form.value.password && form.value.confirmPassword && form.value.password === form.value.confirmPassword && !submitting.value
})

const pwStrength = computed(() => {
  const pw = form.value.password
  if (!pw) return ''
  if (pw.length < 8) return 'weak'
  if (pw.length < 10 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'medium'
  return 'strong'
})

const pwWidth = computed(() => {
  const s = pwStrength.value
  if (s === 'weak') return '33%'
  if (s === 'medium') return '66%'
  if (s === 'strong') return '100%'
  return '0%'
})

const pwText = computed(() => {
  const s = pwStrength.value
  if (s === 'weak') return '弱'
  if (s === 'medium') return '中'
  if (s === 'strong') return '强'
  return ''
})

async function sendCode() {
  if (!form.value.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  try {
    await sendResetCode(form.value.email)
    uni.showToast({ title: '验证码已发送', icon: 'none' })
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' })
  }
}

async function verifyCode() {
  if (!form.value.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (!form.value.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  // 验证码在重置密码时一起校验，此处直接进入下一步
  step.value = 2
}

async function handleResetPassword() {
  if (!form.value.password || !form.value.confirmPassword) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }
  if (form.value.password.length < 8) {
    uni.showToast({ title: '密码至少8位', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await apiResetPassword({
      account: form.value.email,
      verificationCode: form.value.code,
      newPassword: form.value.password
    })
    step.value = 3
    setTimeout(() => { successShow.value = true }, 200)
  } catch (e) {
    uni.showToast({ title: e.message || '重置失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function goLogin() {
  uni.navigateBack()
}

function goBack() {
  if (step.value > 1 && step.value < 3) {
    step.value--
  } else {
    uni.navigateBack()
  }
}
</script>

<style scoped>
.forgot-page {
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #e0f4ff 0%, #d4ecff 25%, #e8f0ff 50%, #f0f7ff 100%);
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
  opacity: 0.13;
}

.b1 { width: 260rpx; height: 260rpx; background: #4facfe; top: -60rpx; right: -40rpx; animation: float1 7s ease-in-out infinite; }
.b2 { width: 180rpx; height: 180rpx; background: #00f2fe; top: 160rpx; left: -50rpx; animation: float2 9s ease-in-out infinite; }
.b3 { width: 140rpx; height: 140rpx; background: #a8d8ff; bottom: 400rpx; right: 30rpx; animation: float3 8s ease-in-out infinite; }
.b4 { width: 100rpx; height: 100rpx; background: #89f7fe; bottom: 140rpx; left: 50rpx; animation: float1 10s ease-in-out infinite; }
.b5 { width: 70rpx; height: 70rpx; background: #74b9ff; top: 50%; left: 55%; animation: float2 6s ease-in-out infinite; }
.b6 { width: 200rpx; height: 200rpx; background: #6cb4ee; bottom: -80rpx; right: -60rpx; animation: float3 7.5s ease-in-out infinite; }
.b7 { width: 60rpx; height: 60rpx; background: #00f2fe; top: 35%; left: 20%; animation: float1 5.5s ease-in-out infinite; }

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
  50% { transform: translateY(-25rpx) translateX(-20rpx); }
}

/* 浮动粒子 */
.particles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(79, 172, 254, 0.3);
}

.p1 { width: 6rpx; height: 6rpx; top: 10%; left: 15%; animation: drift 4s ease-in-out infinite; }
.p2 { width: 10rpx; height: 10rpx; top: 25%; right: 20%; animation: drift 5s ease-in-out infinite 0.5s; background: rgba(0, 242, 254, 0.25); }
.p3 { width: 4rpx; height: 4rpx; top: 50%; left: 8%; animation: drift 3.5s ease-in-out infinite 1s; }
.p4 { width: 8rpx; height: 8rpx; top: 65%; right: 10%; animation: drift 4.5s ease-in-out infinite 0.3s; }
.p5 { width: 5rpx; height: 5rpx; top: 80%; left: 30%; animation: drift 3s ease-in-out infinite 0.8s; }
.p6 { width: 12rpx; height: 12rpx; top: 40%; right: 35%; animation: drift 5.5s ease-in-out infinite 0.2s; background: rgba(168, 216, 255, 0.2); }
.p7 { width: 4rpx; height: 4rpx; top: 15%; left: 70%; animation: drift 4s ease-in-out infinite 1.2s; }
.p8 { width: 7rpx; height: 7rpx; top: 75%; right: 45%; animation: drift 4.2s ease-in-out infinite 0.6s; background: rgba(0, 242, 254, 0.2); }

@keyframes drift {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
  25% { transform: translateY(-40rpx) translateX(20rpx) scale(1.2); opacity: 1; }
  50% { transform: translateY(-15rpx) translateX(-25rpx) scale(0.8); opacity: 0.3; }
  75% { transform: translateY(-30rpx) translateX(15rpx) scale(1.1); opacity: 0.8; }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 锁图标 */
.lock-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 160rpx auto 20rpx;
  opacity: 0;
  transform: scale(0) translateY(40rpx);
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lock-area.show {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.lock-glow {
  position: absolute;
  width: 160rpx; height: 160rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 172, 254, 0.12) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

.lock-glow.g2 {
  width: 220rpx; height: 220rpx;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.06) 0%, transparent 70%);
  animation: pulse 3.5s ease-in-out infinite 0.5s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.3); opacity: 0.9; }
}

.lock-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 20rpx rgba(79, 172, 254, 0.3));
  animation: lockFloat 3.5s ease-in-out infinite;
}

@keyframes lockFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

/* 步骤指示器 */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60rpx;
  margin-bottom: 40rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.6s ease-out 0.2s;
}

.steps.show {
  opacity: 1;
  transform: translateY(0);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.step-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(79, 172, 254, 0.1);
  border: 2rpx solid #d0e8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #b0c8d8;
  transition: all 0.4s;
}

.step-item.active .step-dot {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(79, 172, 254, 0.35);
}

.step-item.done .step-dot {
  background: #4facfe;
  border-color: transparent;
  color: #fff;
  font-size: 20rpx;
}

.step-label {
  font-size: 22rpx;
  color: #b0c8d8;
  transition: color 0.4s;
}

.step-item.active .step-label {
  color: #4facfe;
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 3rpx;
  background: #d0e8f8;
  margin: 0 16rpx;
  margin-bottom: 30rpx;
  transition: background 0.4s;
  border-radius: 2rpx;
}

.step-line.active {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

/* 表单卡片 */
.form-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 32rpx;
  padding: 48rpx 36rpx;
  margin: 0 32rpx;
  box-shadow: 0 8rpx 40rpx rgba(79, 172, 254, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(40rpx);
  transition: all 0.6s ease-out 0.3s;
}

.form-card.show {
  opacity: 1;
  transform: translateY(0);
}

.step-content {
  opacity: 0;
  transform: translateY(30rpx);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.step-content.active {
  opacity: 1;
  transform: translateY(0);
}

.step-title {
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #222;
  letter-spacing: 2rpx;
}

.desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f0f7ff;
  border-radius: 20rpx;
  padding: 0 24rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
}

.code-group {
  padding-right: 8rpx;
}

.input-icon {
  flex-shrink: 0;
  margin-right: 16rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 96rpx;
}

.ph {
  color: #b8d8f0;
}

.toggle-pw {
  flex-shrink: 0;
  padding: 8rpx;
}

.btn-code {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #4facfe;
  background: none;
  border: none;
  padding: 0 20rpx;
  margin: 0;
  line-height: 1.4;
  border-left: 1rpx solid #e0eff8;
  margin-left: 12rpx;
  padding-left: 20rpx;
  transition: color 0.3s;
}

.btn-code::after {
  border: none;
}

.btn-code.disabled {
  color: #ccc;
}

/* 密码强度 */
.strength-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: -8rpx 0 24rpx;
}

.strength-track {
  flex: 1;
  height: 6rpx;
  background: #e8f0f8;
  border-radius: 3rpx;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3rpx;
  transition: all 0.4s;
}

.strength-fill.weak { background: #ff6b6b; }
.strength-fill.medium { background: #ffa94d; }
.strength-fill.strong { background: #51cf66; }

.strength-text {
  font-size: 22rpx;
  font-weight: 600;
}

.strength-text.weak { color: #ff6b6b; }
.strength-text.medium { color: #ffa94d; }
.strength-text.strong { color: #51cf66; }

.btn-submit {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #c8e4f8, #d0eaf8);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  border-radius: 48rpx;
  margin-top: 8rpx;
  transition: all 0.3s;
  box-shadow: none;
}

.btn-submit.active {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  box-shadow: 0 8rpx 24rpx rgba(79, 172, 254, 0.35);
}

.btn-submit::after {
  border: none;
}

.btn-text {
  letter-spacing: 8rpx;
}

/* 成功页面 */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon {
  margin: 20rpx 0 40rpx;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-icon.show {
  opacity: 1;
  transform: scale(1);
}

.success-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #222;
  margin-bottom: 12rpx;
}

.success-desc {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

/* 底部 */
.bottom-area {
  text-align: center;
  margin-top: 48rpx;
  padding-bottom: 60rpx;
  opacity: 0;
  transition: opacity 0.6s ease-out 0.5s;
}

.bottom-area.show {
  opacity: 1;
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
</style>
