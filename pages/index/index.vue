<template>
  <view class="page">
    <!-- 顶部全部替换为 1.png 图片 -->
    <view class="top-image">
      <image class="top-bg-img" src="/static/3.png" mode="widthFix" />
    </view>

    <!-- 对话卡片 -->
    <view class="chat-card intro">
      <text class="intro-title">你好！我是你的计划助手 👋</text>
      <text class="intro-text">
        你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。
      </text>
      <text class="example">
        比如：明天上午10点开会，下午去健身，晚上学习2小时
      </text>
    </view>

 

    <!-- 结果卡片 -->
    <view class="result-card">
      <text class="result-title">好的，已为你创建以下计划并安排到明天（5月20日）</text>

      <view class="schedule-item" v-for="item in plans" :key="item.name">
        <view class="left">
          <view class="mini-icon">{{ item.icon }}</view>
          <text>{{ item.name }}</text>
        </view>
        <text class="time">{{ item.time }}</text>
      </view>

      <view class="footer-link">查看计划 ></view>
    </view>

    <!-- 快捷按钮 -->
    <view class="quick-actions">
      <view class="quick-btn">帮我安排周末计划</view>
      <view class="quick-btn">提醒我喝水</view>
      <view class="quick-btn">每天晚上复盘</view>
    </view>

    <!-- 输入框 -->
    <view class="input-bar">
      <text class="placeholder">输入计划，或按住说话...</text>
      <view class="bottom-tools">
        <view>⌨</view>
        <view class="voice-btn">🎤</view>
        <view>＋</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    icon: '📝',
    title: '录入计划',
    sub: '帮你记录计划'
  },
  {
    icon: '💡',
    title: '智能推荐',
    sub: 'AI 为你出建议'
  },
  {
    icon: '📅',
    title: '日程视图',
    sub: '查看日程安排'
  },
  {
    icon: '📊',
    title: '统计分析',
    sub: '时间分配分析'
  },
  {
    icon: '🛡',
    title: '习惯打卡',
    sub: '养成好习惯'
  }
])

const plans = ref([
  {
    icon: '📘',
    name: '会议',
    time: '10:00 - 11:00'
  },
  {
    icon: '🏃',
    name: '健身',
    time: '14:00 - 15:30'
  },
  {
    icon: '📗',
    name: '学习',
    time: '20:00 - 22:00'
  }
])
</script>

<style scoped>
page {
  background: #f6f7ff;
}

.page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(to bottom, #f5f7ff, #ffffff);
}

/* 顶部图片区域 */
.top-image {
  width: 100%;
  margin-bottom: 20rpx;
  border-radius: 32rpx;
  overflow: hidden;
}

.top-bg-img {
  width: 100%;
  display: block;
}

/* 功能区卡片样式保持不变 */
.feature-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.03);
}

.feature-item {
  width: 18%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  font-size: 40rpx;
}

.f-title {
  font-size: 24rpx;
  margin-top: 10rpx;
}

.f-sub {
  font-size: 20rpx;
  color: #999;
  margin-top: 6rpx;
  text-align: center;
}

.chat-card,
.result-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-top: 24rpx;
}

.intro-title {
  font-size: 30rpx;
  font-weight: 600;
}

.intro-text,
.example {
  display: block;
  margin-top: 14rpx;
  color: #666;
  font-size: 24rpx;
  line-height: 1.7;
}

.user-msg {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.msg-bubble {
  background: #e9e4ff;
  padding: 20rpx;
  border-radius: 20rpx;
  max-width: 80%;
  font-size: 26rpx;
}

.msg-time {
  margin-top: 8rpx;
  color: #999;
  font-size: 20rpx;
}

.result-title {
  font-size: 26rpx;
  line-height: 1.6;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;
}

.left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.mini-icon {
  font-size: 30rpx;
}

.time {
  color: #666;
}

.footer-link {
  margin-top: 24rpx;
  color: #6a6ff5;
  text-align: right;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  flex-wrap: wrap;
}

.quick-btn {
  background: #fff;
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.input-bar {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 28rpx;
  padding: 24rpx;
}

.placeholder {
  color: #aaa;
  font-size: 26rpx;
}

.bottom-tools {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #7a73ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
}
</style>