<template>
  <view class="register-page">
    <!-- 动态背景气泡 -->
    <view class="bg-bubbles">
      <view class="bubble b1"></view>
      <view class="bubble b2"></view>
      <view class="bubble b3"></view>
      <view class="bubble b4"></view>
      <view class="bubble b5"></view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <text style="font-size:36rpx;color:#333;">‹</text>
    </view>

    <!-- 内容区 -->
    <view class="content" :class="{ show: loaded }">
      <!-- 标题 -->
      <view class="title-area">
        <text class="title">创建账号</text>
        <text class="subtitle">加入 REDSPIDER，开始高效成长</text>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
        <!-- 邮箱 -->
        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">✉</text>
          </view>
          <input
            class="form-input"
            v-model="form.email"
            type="text"
            placeholder="请输入邮箱"
            placeholder-class="ph"
          />
        </view>

        <!-- 验证码 -->
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

        <!-- 密码 -->
        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">🔒</text>
          </view>
          <input
            class="form-input"
            v-model="form.password"
            placeholder="请输入密码"
            placeholder-class="ph"
            :password="!showPw"
          />
          <view class="toggle-pw" @tap="showPw = !showPw">
            <text style="font-size:24rpx;color:#bbb;">{{ showPw ? '隐藏' : '显示' }}</text>
          </view>
        </view>

        <!-- 昵称 -->
        <view class="input-group">
          <view class="input-icon">
            <text style="font-size:32rpx;color:#4facfe;">👤</text>
          </view>
          <input
            class="form-input"
            v-model="form.nickname"
            placeholder="昵称（非必填）"
            placeholder-class="ph"
          />
        </view>

        <button class="btn-register" :class="{ active: canRegister }" @tap="onRegister">
          <text class="btn-text">注 册</text>
        </button>
      </view>

      <!-- 底部登录链接 -->
      <view class="bottom-area">
        <text class="bottom-text">已有账号？</text>
        <text class="bottom-link" @tap="goLogin">去登录</text>
      </view>

      <!-- 协议 -->
      <view class="agreement">
        <text>注册即代表同意《用户协议》《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { sendRegisterCode, register } from '../../utils/api.js'

const loaded = ref(false)
const showPw = ref(false)
const countdown = ref(0)
const submitting = ref(false)

const form = ref({ email: '', code: '', password: '', nickname: '' })

const canRegister = computed(() => {
  return form.value.email && form.value.code && form.value.password && form.value.nickname && !submitting.value
})

onMounted(() => { nextTick(() => { setTimeout(() => { loaded.value = true }, 50) }) })

async function sendCode() {
  if (!form.value.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  try {
    await sendRegisterCode(form.value.email)
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

async function onRegister() {
  if (!form.value.email || !form.value.code || !form.value.password || !form.value.nickname) {
    uni.showToast({ title: '请填写必要信息', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await register({
      email: form.value.email,
      password: form.value.password,
      nickname: form.value.nickname,
      verificationCode: form.value.code
    })
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1000)
  } catch (e) {
    uni.showToast({ title: e.message || '注册失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function goLogin() {
  uni.navigateBack()
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0e6ff 0%, #e0ecff 30%, #e8f4fd 60%, #f0f7ff 100%);
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
  opacity: 0.12;
}

.b1 {
  width: 280rpx; height: 280rpx;
  background: #7b6df0;
  top: -60rpx; right: -40rpx;
  animation: float1 6s ease-in-out infinite;
}

.b2 {
  width: 180rpx; height: 180rpx;
  background: #4facfe;
  top: 180rpx; left: -30rpx;
  animation: float2 8s ease-in-out infinite;
}

.b3 {
  width: 140rpx; height: 140rpx;
  background: #a8d8ff;
  bottom: 350rpx; right: 60rpx;
  animation: float3 7s ease-in-out infinite;
}

.b4 {
  width: 100rpx; height: 100rpx;
  background: #89f7fe;
  bottom: 120rpx; left: 80rpx;
  animation: float1 9s ease-in-out infinite;
}

.b5 {
  width: 70rpx; height: 70rpx;
  background: #c3b8ff;
  top: 45%; left: 60%;
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

/* 内容入场动画 */
.content {
  position: relative;
  z-index: 1;
  padding: 180rpx 48rpx 60rpx;
  opacity: 0;
  transform: translateY(60rpx);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.content.show {
  opacity: 1;
  transform: translateY(0);
}

.title-area {
  margin-bottom: 50rpx;
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
  box-shadow: 0 8rpx 40rpx rgba(123, 109, 240, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

.input-group {
  display: flex;
  align-items: center;
  background: #f5f3ff;
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
  color: #c8c0f0;
}

.toggle-pw {
  flex-shrink: 0;
  padding: 8rpx;
}

.btn-code {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #7b6df0;
  background: none;
  border: none;
  padding: 0 20rpx;
  margin: 0;
  line-height: 1.4;
  border-left: 1rpx solid #e8e4f8;
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

.btn-register {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #d8d0f0, #e0daf0);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  border-radius: 48rpx;
  margin-top: 8rpx;
  transition: all 0.3s;
  box-shadow: none;
}

.btn-register.active {
  background: linear-gradient(135deg, #7b6df0, #a18cd1);
  box-shadow: 0 8rpx 24rpx rgba(123, 109, 240, 0.3);
}

.btn-register::after {
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
  color: #7b6df0;
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
