<template>
  <view class="md-root">
    <block v-for="(block, bi) in blocks" :key="bi">
      <text v-if="block.type === 'h1'" class="md-h1">
        <text
          v-for="(seg, si) in inlineSegments(block.text)"
          :key="'h1-' + si"
          :class="{ 'md-bold': seg.bold }"
        >{{ seg.text }}</text>
      </text>
      <text v-else-if="block.type === 'h2'" class="md-h2">
        <text
          v-for="(seg, si) in inlineSegments(block.text)"
          :key="'h2-' + si"
          :class="{ 'md-bold': seg.bold }"
        >{{ seg.text }}</text>
      </text>
      <text v-else-if="block.type === 'h3'" class="md-h3">
        <text
          v-for="(seg, si) in inlineSegments(block.text)"
          :key="'h3-' + si"
          :class="{ 'md-bold': seg.bold }"
        >{{ seg.text }}</text>
      </text>

      <view v-else-if="block.type === 'hr'" class="md-hr" />

      <view v-else-if="block.type === 'list'" class="md-list">
        <view v-for="(item, li) in block.items" :key="li" class="md-li">
          <text class="md-li-dot">•</text>
          <text class="md-li-text">
            <text
              v-for="(seg, si) in inlineSegments(item)"
              :key="si"
              :class="{ 'md-bold': seg.bold }"
            >{{ seg.text }}</text>
          </text>
        </view>
      </view>

      <scroll-view
        v-else-if="block.type === 'table'"
        scroll-x
        class="md-table-scroll"
        :show-scrollbar="false"
      >
        <view class="md-table" :style="{ minWidth: tableMinWidth(block) }">
          <view class="md-tr md-tr-head">
            <view
              v-for="(cell, ci) in block.headers"
              :key="'th-' + ci"
              class="md-th"
            >
              <text class="md-cell">
                <text
                  v-for="(seg, si) in inlineSegments(cell)"
                  :key="si"
                  :class="{ 'md-bold': seg.bold }"
                >{{ seg.text }}</text>
              </text>
            </view>
          </view>
          <view
            v-for="(row, ri) in block.rows"
            :key="'tr-' + ri"
            class="md-tr"
            :class="{ 'md-tr-alt': ri % 2 === 1 }"
          >
            <view
              v-for="(cell, ci) in row"
              :key="'td-' + ci"
              class="md-td"
            >
              <text class="md-cell">
                <text
                  v-for="(seg, si) in inlineSegments(cell)"
                  :key="si"
                  :class="{ 'md-bold': seg.bold }"
                >{{ seg.text }}</text>
              </text>
            </view>
          </view>
        </view>
      </scroll-view>

      <text v-else-if="block.type === 'p'" class="md-p">
        <text
          v-for="(seg, si) in inlineSegments(block.text)"
          :key="'p-' + si"
          :class="{ 'md-bold': seg.bold }"
        >{{ seg.text }}</text>
      </text>
    </block>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { parseMarkdown, parseInline } from '../../utils/markdown.js'

const props = defineProps({
  content: { type: String, default: '' }
})

const blocks = computed(() => parseMarkdown(props.content))

function inlineSegments(text) {
  return parseInline(text)
}

function tableMinWidth(block) {
  const cols = block.headers?.length || 1
  return (cols * 160) + 'rpx'
}
</script>

<style scoped>
.md-root {
  width: 100%;
}

.md-h1 {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
  margin: 16rpx 0 10rpx;
  line-height: 1.5;
}
.md-h2 {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #222;
  margin: 14rpx 0 8rpx;
  line-height: 1.5;
}
.md-h3 {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin: 12rpx 0 8rpx;
  line-height: 1.5;
}

.md-bold {
  font-weight: 600;
  color: #333;
}

.md-p {
  display: block;
  font-size: 24rpx;
  color: #555;
  line-height: 1.75;
  margin-bottom: 8rpx;
  white-space: pre-wrap;
  word-break: break-word;
}

.md-hr {
  height: 1rpx;
  background: #e8f0f8;
  margin: 16rpx 0;
}

.md-list {
  margin: 8rpx 0 12rpx;
}
.md-li {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin-bottom: 6rpx;
}
.md-li-dot {
  font-size: 24rpx;
  color: #4facfe;
  line-height: 1.75;
  flex-shrink: 0;
}
.md-li-text {
  flex: 1;
  font-size: 24rpx;
  color: #555;
  line-height: 1.75;
  word-break: break-word;
}

.md-table-scroll {
  width: 100%;
  margin: 12rpx 0 16rpx;
}
.md-table {
  border: 1rpx solid #d4e8f8;
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
}
.md-tr {
  display: flex;
  flex-direction: row;
}
.md-tr-head {
  background: linear-gradient(135deg, #e8f4fd, #f0f7ff);
}
.md-tr-alt {
  background: #fafcff;
}
.md-th,
.md-td {
  flex: 1;
  min-width: 140rpx;
  padding: 14rpx 12rpx;
  border-right: 1rpx solid #e8f0f8;
  border-bottom: 1rpx solid #e8f0f8;
  box-sizing: border-box;
}
.md-th:last-child,
.md-td:last-child {
  border-right: none;
}
.md-tr:last-child .md-td {
  border-bottom: none;
}
.md-th {
  font-weight: 600;
}
.md-cell {
  font-size: 22rpx;
  color: #444;
  line-height: 1.55;
  word-break: break-word;
}
.md-tr-head .md-cell {
  color: #2a6fa8;
  font-size: 22rpx;
}
</style>
