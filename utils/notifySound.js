let audio = null
let lastPlayAt = 0
const MIN_INTERVAL_MS = 1200

/** 前台收到通知时播放提示音（防抖，避免 WS 与 Push 重复响） */
export function playNotificationSound() {
  const now = Date.now()
  if (now - lastPlayAt < MIN_INTERVAL_MS) return
  lastPlayAt = now

  // #ifdef APP-PLUS
  try {
    if (!audio) {
      audio = uni.createInnerAudioContext()
      audio.src = '/static/notify.mp3'
      audio.volume = 0.85
      audio.autoplay = false
      audio.onError(() => {
        tryBeep()
      })
    }
    try {
      audio.stop()
    } catch (e) {}
    audio.seek(0)
    audio.play()
    return
  } catch (e) {
    tryBeep()
  }
  // #endif
}

function tryBeep() {
  // #ifdef APP-PLUS
  try {
    if (typeof plus !== 'undefined' && plus.device && plus.device.beep) {
      plus.device.beep(1)
    }
  } catch (e) {}
  // #endif
}

export function destroyNotificationSound() {
  if (!audio) return
  try {
    audio.stop()
    audio.destroy()
  } catch (e) {}
  audio = null
}
