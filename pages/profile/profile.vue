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
      <text style="font-size:36rpx;color:#333;">‹</text>
    </view>

    <scroll-view class="profile-scroll" scroll-y :bounces="false" :show-scrollbar="false">
    <!-- 头部区域 -->
    <view class="hero" :class="{ show: loaded }">
      <view class="hero-bg">
        <view class="hero-wave" style="width:100%;height:100%;background:linear-gradient(135deg,rgba(79,172,254,0.08),rgba(0,242,254,0.05));"></view>
      </view>

      <!-- 头像 -->
      <view class="avatar-area" @tap="chooseAvatar">
        <view class="avatar-ring"></view>
        <view class="avatar-ring ring2"></view>
        <view class="avatar-box">
          <image
            v-if="userInfo.avatarUrl"
            :src="userInfo.avatarUrl + '?t=' + avatarKey"
            class="avatar-img"
            mode="aspectFill"
          />
          <text v-else style="font-size:48rpx;color:#4facfe;">👤</text>
        </view>
        <view class="avatar-edit-hint">
          <text style="font-size:24rpx;color:#fff;">📷</text>
        </view>
      </view>

      <!-- 用户信息 -->
      <text class="nickname">{{ userInfo.nickname || 'REDSPIDER用户' }}</text>
      <text class="email">{{ userInfo.phone || '未绑定手机号' }}</text>

      <!-- 编辑资料按钮 -->
      <view class="edit-btn" @tap="editProfile">
        <text style="font-size:24rpx;color:#4facfe;">✏️ 编辑资料</text>
      </view>
    </view>

    <!-- 数据统计卡片 -->
    <view class="stats-card" :class="{ show: loaded }">
      <view class="stat-item" :class="{ show: loaded }" v-for="(s, i) in stats" :key="i" :style="{ transitionDelay: (i * 0.1 + 0.3) + 's' }">
        <view class="stat-icon" :style="{ background: s.bg }">
          <text v-if="s.key === 'plans'" style="font-size:32rpx;">✔</text>
          <text v-else-if="s.key === 'days'" style="font-size:32rpx;">📅</text>
          <text v-else-if="s.key === 'streak'" style="font-size:32rpx;">⚡</text>
          <text v-else-if="s.key === 'hours'" style="font-size:32rpx;">⏰</text>
        </view>
        <text class="stat-value">{{ s.value }}</text>
        <text class="stat-label">{{ s.label }}</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card" :class="{ show: loaded }">
      <view
        class="menu-item"
        :class="{ show: loaded }"
        v-for="(m, i) in menus"
        :key="i"
        :style="{ transitionDelay: (i * 0.08 + 0.5) + 's' }"
        @tap="onMenu(m.key)"
      >
        <view class="menu-icon" :style="{ background: m.bg }">
        </view>
        <text class="menu-label">{{ m.label }}</text>
        <view class="menu-arrow">
          <text style="font-size:24rpx;color:#ccc;">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-area" :class="{ show: loaded }">
      <button class="btn-logout" @tap="onLogout">
        <text style="font-size:28rpx;color:#ff6b6b;">🚪 退出登录</text>
      </button>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 编辑资料弹窗 -->
    <view class="modal-mask" v-if="editVisible" @tap="editVisible = false">
      <view class="modal-card" @tap.stop>
        <text class="modal-title">编辑资料</text>
        <view class="modal-input-group">
          <text class="modal-label">昵称</text>
          <input
            class="modal-input"
            v-model="editNickname"
            placeholder="请输入昵称"
            maxlength="50"
            placeholder-class="modal-ph"
          />
        </view>
        <view class="modal-actions">
          <button class="modal-btn cancel" @tap="editVisible = false">取消</button>
          <button class="modal-btn confirm" :class="{ loading: saving }" :disabled="saving" @tap="saveProfile">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getUserInfo, logout as apiLogout, uploadAvatar, updateProfile, deleteAccount, BASE_URL } from '../../utils/api.js'

const loaded = ref(false)
const uploading = ref(false)
const editVisible = ref(false)
const editNickname = ref('')
const saving = ref(false)
const avatarKey = ref(0)
const userInfo = ref({ nickname: '', phone: '', uid: '', avatarUrl: '', weeklyHours: null })

function fixAvatarUrl(url) {
  if (!url) return ''
  // 把服务器返回的主机替换为客户端 BASE_URL
  return url.replace(/^https?:\/\/[^\/]+/, BASE_URL)
}

const stats = ref([
  { key: 'hours', value: '-', label: '每周投入', bg: 'rgba(79,172,254,0.1)', color: '#4facfe' },
  { key: 'plans', value: '-', label: '完成计划', bg: 'rgba(107,203,119,0.1)', color: '#6bcb77' },
  { key: 'streak', value: '-', label: '连续打卡', bg: 'rgba(255,165,0,0.1)', color: '#ffa500' },
  { key: 'days', value: '-', label: '活跃天数', bg: 'rgba(123,109,240,0.1)', color: '#7b6df0' }
])

const menus = [
  { key: 'plan', label: '我的计划', bg: 'rgba(79,172,254,0.1)', color: '#4facfe' },
  { key: 'tasks', label: '我的任务', bg: 'rgba(123,109,240,0.1)', color: '#7b6df0' },
  { key: 'notifications', label: '通知中心', bg: 'rgba(255,165,0,0.1)', color: '#ffa500' },
  { key: 'stats', label: '数据统计', bg: 'rgba(107,203,119,0.1)', color: '#6bcb77' },
  { key: 'reminder', label: '提醒设置', bg: 'rgba(255,165,0,0.1)', color: '#ffa500' },
  { key: 'feedback', label: '意见反馈', bg: 'rgba(123,109,240,0.1)', color: '#7b6df0' },
  { key: 'theme', label: '主题设置', bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
  { key: 'about', label: '关于我们', bg: 'rgba(0,242,254,0.1)', color: '#00c6fb' },
  { key: 'delete', label: '注销账号', bg: 'rgba(255,107,107,0.06)', color: '#ff6b6b' }
]

async function loadUserInfo() {
  try {
    const res = await getUserInfo()
    userInfo.value = {
      nickname: res.nickname || 'REDSPIDER用户',
      phone: res.phone || '',
      uid: res.uid || '',
      avatarUrl: fixAvatarUrl(res.avatarUrl),
      weeklyHours: res.weeklyHours
    }
    stats.value[0].value = res.weeklyHours != null ? res.weeklyHours + 'h' : '-'
    uni.setStorageSync('userInfo', JSON.stringify(userInfo.value))
  } catch (e) {
    const info = uni.getStorageSync('userInfo')
    if (info) {
      try {
        const parsed = typeof info === 'string' ? JSON.parse(info) : info
        userInfo.value = { ...userInfo.value, ...parsed }
      } catch(e2) {}
    }
  }
}

onMounted(() => {
  loadUserInfo()
  nextTick(() => { setTimeout(() => { loaded.value = true }, 50) })
})

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    crop: { width: 300, height: 300 },
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      uploading.value = true
      try {
        const profile = await uploadAvatar(filePath)
        userInfo.value.avatarUrl = fixAvatarUrl(profile.avatarUrl)
        avatarKey.value++
        uni.showToast({ title: '头像已更新', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: e.message || '上传失败', icon: 'none' })
      } finally {
        uploading.value = false
      }
    }
  })
}

function editProfile() {
  editNickname.value = userInfo.value.nickname === 'REDSPIDER用户' ? '' : userInfo.value.nickname
  editVisible.value = true
}

async function saveProfile() {
  const nickname = editNickname.value.trim()
  if (!nickname) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }
  saving.value = true
  try {
    const res = await updateProfile({ nickname })
    userInfo.value.nickname = res.nickname || nickname
    editVisible.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function onMenu(key) {
  if (key === 'plan') {
    uni.navigateTo({ url: '/pages/plans/plans' })
  } else if (key === 'tasks') {
    uni.navigateTo({ url: '/pages/tasks/tasks' })
  } else if (key === 'notifications') {
    uni.navigateTo({ url: '/pages/notifications/notifications' })
  } else if (key === 'delete') {
    onDeleteAccount()
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
        } catch (e) {}
        uni.showToast({ title: '已退出登录', icon: 'none' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' })
        }, 800)
      }
    }
  })
}

function onDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后账号将无法使用，确定要注销吗？',
    confirmColor: '#ff6b6b',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteAccount()
          uni.showToast({ title: '账号已注销', icon: 'none' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' })
          }, 800)
        } catch (e) {
          uni.showToast({ title: e.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped>
.profile-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #e0f4ff 0%, #eaf5ff 30%, #f5f9ff 60%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.profile-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  position: relative;
  z-index: 1;
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
  overflow: hidden;
}

.avatar-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
}

.avatar-edit-hint {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(79,172,254,0.3);
  z-index: 2;
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
  opacity: 0;
  transform: translateY(20rpx);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.stat-item.show {
  opacity: 1;
  transform: translateY(0);
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
  transition: background 0.2s, opacity 0.4s ease-out, transform 0.4s ease-out;
  opacity: 0;
  transform: translateY(16rpx);
}

.menu-item.show {
  opacity: 1;
  transform: translateY(0);
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

/* 编辑资料弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  width: 600rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 16rpx 60rpx rgba(0,0,0,0.15);
  animation: modalPop 0.25s ease-out;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.9) translateY(20rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-input-group {
  margin-bottom: 40rpx;
}

.modal-label {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 12rpx;
}

.modal-input {
  width: 100%;
  height: 88rpx;
  background: #f5f3ff;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  border: 1rpx solid transparent;
  box-sizing: border-box;
}

.modal-input:focus {
  border-color: rgba(123,109,240,0.3);
  background: #fff;
}

.modal-ph {
  color: #c8c0f0;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.modal-btn::after {
  border: none;
}

.modal-btn.cancel {
  background: #f0f0f0;
  color: #666;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #4facfe, #6cb4ee);
  color: #fff;
}

.modal-btn.loading {
  opacity: 0.7;
}
</style>
