import { reactive } from 'vue'
import { getGrowthTasksByDate } from './api.js'

export const growthTaskSession = reactive({
  active: false,
  minimized: false,
  onFocusPage: false,
  task: null,
  tick: 0
})

const QUOTES = [
  '专注的每一分钟，都在为更好的自己蓄力。',
  '不必和别人比，今天比昨天更进一步就够了。',
  '行动是治愈焦虑最好的方式，你已经在路上了。',
  '坚持不是不累，而是累了仍然选择继续。',
  '把眼前这一件事做好，就是最好的成长策略。',
  '你比想象中更有力量，再专注一会儿试试。',
  '慢一点没关系，重要的是你没有停下来。',
  '每一次认真完成，都会让你更靠近目标。',
  '此刻的专注，是未来感谢现在的理由。',
  '相信自己，你正在变成更自律、更优秀的人。',
  '完成比完美更重要，先把它做完！',
  '呼吸、专注、行动——这就是进步的节奏。'
]

let tickTimer = null

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function normalizeGrowthTask(task) {
  if (!task) return null
  return {
    id: task.id,
    title: task.title || task.name || '成长任务',
    description: task.description || '',
    scheduledDate: task.scheduledDate || task.date || '',
    startedAt: task.startedAt || '',
    plannedEndAt: task.plannedEndAt || '',
    estimatedMinutes: task.estimatedMinutes,
    status: task.status || 'IN_PROGRESS'
  }
}

export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`
  return `${pad2(m)}:${pad2(s)}`
}

export function getRemainingMs() {
  void growthTaskSession.tick
  const task = growthTaskSession.task
  if (!task?.plannedEndAt) return 0
  const end = new Date(task.plannedEndAt).getTime()
  if (Number.isNaN(end)) return 0
  return Math.max(0, end - Date.now())
}

export function getElapsedMs() {
  void growthTaskSession.tick
  const task = growthTaskSession.task
  if (!task?.startedAt) return 0
  const start = new Date(task.startedAt).getTime()
  if (Number.isNaN(start)) return 0
  return Math.max(0, Date.now() - start)
}

export function getProgressPercent() {
  void growthTaskSession.tick
  const task = growthTaskSession.task
  if (!task) return 0
  const start = task.startedAt ? new Date(task.startedAt).getTime() : NaN
  const end = task.plannedEndAt ? new Date(task.plannedEndAt).getTime() : NaN
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  const p = ((Date.now() - start) / (end - start)) * 100
  return Math.min(100, Math.max(0, p))
}

export function getCurrentQuote() {
  void growthTaskSession.tick
  const idx = Math.floor(Date.now() / 8000) % QUOTES.length
  return QUOTES[idx]
}

function startTick() {
  stopTick()
  tickTimer = setInterval(() => {
    growthTaskSession.tick += 1
    if (!growthTaskSession.active) return
    const left = getRemainingMs()
    if (left <= 0 && growthTaskSession.task) {
      refreshActiveGrowthTask().catch(() => {})
    }
  }, 1000)
}

function stopTick() {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

export function setActiveGrowthTask(task) {
  const normalized = normalizeGrowthTask(task)
  if (!normalized || normalized.status !== 'IN_PROGRESS') return false
  growthTaskSession.task = normalized
  growthTaskSession.active = true
  growthTaskSession.minimized = false
  startTick()
  return true
}

export function clearActiveGrowthTask() {
  growthTaskSession.active = false
  growthTaskSession.minimized = false
  growthTaskSession.onFocusPage = false
  growthTaskSession.task = null
  stopTick()
}

export function minimizeGrowthTask() {
  growthTaskSession.minimized = true
  growthTaskSession.onFocusPage = false
}

export function showMiniBar() {
  return growthTaskSession.active
    && growthTaskSession.task
    && growthTaskSession.task.status === 'IN_PROGRESS'
    && growthTaskSession.minimized
    && !growthTaskSession.onFocusPage
}

export function openGrowthTaskFocusPage(task) {
  if (!setActiveGrowthTask(task)) return
  growthTaskSession.minimized = false
  growthTaskSession.onFocusPage = true
  uni.navigateTo({ url: '/pages/growth-task-focus/growth-task-focus' })
}

export function reopenGrowthTaskFocusPage() {
  if (!growthTaskSession.active || !growthTaskSession.task) return
  growthTaskSession.minimized = false
  growthTaskSession.onFocusPage = true
  uni.navigateTo({ url: '/pages/growth-task-focus/growth-task-focus' })
}

export async function refreshActiveGrowthTask() {
  const task = growthTaskSession.task
  if (!task?.id || !task.scheduledDate) return null
  try {
    const res = await getGrowthTasksByDate(task.scheduledDate)
    const found = (res.tasks || []).find(t => t.id === task.id)
    if (!found) {
      clearActiveGrowthTask()
      return null
    }
    if (found.status !== 'IN_PROGRESS') {
      clearActiveGrowthTask()
      if (found.status === 'COMPLETED') {
        uni.showToast({ title: '任务已完成', icon: 'success' })
      }
      return found
    }
    growthTaskSession.task = normalizeGrowthTask(found)
    return found
  } catch (e) {
    return null
  }
}
