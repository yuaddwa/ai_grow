"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const utils_store = require("../../utils/store.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const scrollTop = common_vendor.ref(0);
    const inputText = common_vendor.ref("");
    const inputMode = common_vendor.ref("voice");
    const inputFocus = common_vendor.ref(false);
    const isRecording = common_vendor.ref(false);
    const addVisible = common_vendor.ref(false);
    common_vendor.ref(null);
    const sessionId = common_vendor.ref(null);
    const sending = common_vendor.ref(false);
    const userAvatar = common_vendor.ref("");
    const composing = common_vendor.ref(false);
    let recorderManager = null;
    let h5MediaRecorder = null;
    let isProcessingVoice = false;
    const addOptions = [
      { key: "photo", label: "照片", bg: "#ece5ff", color: "#7b6df0" }
    ];
    const messages = common_vendor.ref([
      {
        role: "ai",
        type: "text",
        show: true,
        title: "你好！我是你的计划助手 👋",
        content: "你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。",
        tip: "比如：明天上午10点开会，下午去健身，晚上学习2小时"
      }
    ]);
    common_vendor.computed(() => messages.value.length <= 2);
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(() => {
        setTimeout(() => {
          loaded.value = true;
        }, 50);
      });
      if (utils_api.getAccessToken()) {
        utils_api.getUnreadCount().then((res) => {
          utils_store.store.unreadCount = res.count || 0;
        }).catch(() => {
        });
        utils_api.getUserInfo().then((res) => {
          if (res.avatarUrl) {
            userAvatar.value = res.avatarUrl.replace(/^https?:\/\/[^\/]+/, utils_api.BASE_URL);
          }
        }).catch(() => {
        });
      }
    });
    function scroll() {
      common_vendor.nextTick$1(() => {
        scrollTop.value = Math.random() * 99999;
      });
    }
    function goPlans() {
      common_vendor.index.navigateTo({ url: "/pages/plans/plans" });
    }
    function goNotifications() {
      common_vendor.index.navigateTo({ url: "/pages/notifications/notifications" });
    }
    function goTasks() {
      common_vendor.index.navigateTo({ url: "/pages/tasks/tasks" });
    }
    function goLogin() {
      const token = utils_api.getAccessToken();
      if (token) {
        common_vendor.index.navigateTo({ url: "/pages/profile/profile" });
      } else {
        common_vendor.index.navigateTo({ url: "/pages/login/login" });
      }
    }
    function toggleMode() {
      inputMode.value = inputMode.value === "text" ? "voice" : "text";
      if (inputMode.value === "text") {
        inputFocus.value = true;
      }
    }
    function onSend() {
      if (composing.value)
        return;
      const t = inputText.value.trim();
      if (!t || sending.value)
        return;
      sending.value = true;
      messages.value.push({ role: "user", content: t, show: true });
      inputText.value = "";
      scroll();
      utils_api.sendChatMessage(t, sessionId.value || void 0).then((res) => {
        sessionId.value = res.sessionId;
        messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
        scroll();
      }).catch((e) => {
        if (e && e.code === "UNAUTHORIZED") {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          messages.value.push({ role: "ai", type: "text", title: "", content: "网络异常，请稍后重试", tip: "", show: true });
          scroll();
        }
      }).finally(() => {
        sending.value = false;
      });
    }
    let recordStartTime = 0;
    function toggleVoice() {
      if (isRecording.value) {
        if (Date.now() - recordStartTime < 800)
          return;
        stopRecord();
      } else {
        recordStartTime = Date.now();
        startRecord();
      }
    }
    function startRecord() {
      if (!utils_api.getAccessToken()) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 800);
        return;
      }
      isRecording.value = true;
      const platform = common_vendor.index.getSystemInfoSync().platform;
      if (platform !== "web") {
        try {
          if (!recorderManager) {
            recorderManager = common_vendor.index.getRecorderManager();
            recorderManager.onStop((res) => {
              common_vendor.index.__f__("log", "at pages/index/index.vue:316", "recorderManager onStop:", JSON.stringify(res));
              isRecording.value = false;
              if (isProcessingVoice)
                return;
              if (res.tempFilePath) {
                isProcessingVoice = true;
                handleVoiceResult(res.tempFilePath);
              }
            });
            recorderManager.onError((err) => {
              common_vendor.index.__f__("error", "at pages/index/index.vue:325", "recorderManager onError:", JSON.stringify(err));
              isRecording.value = false;
              common_vendor.index.showToast({ title: "录音失败", icon: "none" });
            });
          }
          recorderManager.start({
            duration: 60,
            sampleRate: 16e3,
            numberOfChannels: 1,
            encodeBitRate: 48e3,
            format: "mp3"
          });
          return;
        } catch (e) {
          isRecording.value = false;
          common_vendor.index.showToast({ title: "录音初始化失败", icon: "none" });
          return;
        }
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        isRecording.value = false;
        common_vendor.index.showToast({ title: "当前环境不支持录音", icon: "none" });
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mr = new MediaRecorder(stream);
        const chunks = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0)
            chunks.push(e.data);
        };
        mr.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          isRecording.value = false;
          const blob = new Blob(chunks, { type: "audio/webm" });
          uploadAndTranscribeBlob(blob);
        };
        mr.start();
        h5MediaRecorder = mr;
      }).catch(() => {
        isRecording.value = false;
        common_vendor.index.showToast({ title: "无法访问麦克风", icon: "none" });
      });
    }
    function stopRecord() {
      if (!isRecording.value)
        return;
      isRecording.value = false;
      if (recorderManager) {
        recorderManager.stop();
      } else if (h5MediaRecorder && h5MediaRecorder.state === "recording") {
        h5MediaRecorder.stop();
      }
    }
    function uploadAndTranscribeBlob(blob) {
      messages.value.push({ role: "user", content: "[语音] 识别中...", show: true });
      scroll();
      const form = new FormData();
      form.append("file", blob, "speech.webm");
      const token = utils_api.getAccessToken();
      const xhr = new XMLHttpRequest();
      xhr.open("POST", utils_api.BASE_URL + "/api/v1/speech/transcribe");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            onTranscribeSuccess(res.text);
          } catch (e) {
            common_vendor.index.showToast({ title: "语音识别失败", icon: "none" });
          }
        } else if (xhr.status === 401) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            common_vendor.index.showToast({ title: err.message || "语音识别失败", icon: "none" });
          } catch (e) {
            common_vendor.index.showToast({ title: "语音识别失败", icon: "none" });
          }
        }
      };
      xhr.onerror = function() {
        common_vendor.index.showToast({ title: "网络连接失败", icon: "none" });
      };
      xhr.send(form);
    }
    function handleVoiceResult(filePath) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:417", "handleVoiceResult filePath:", filePath);
      messages.value.push({ role: "user", content: "[语音] 识别中...", show: true });
      scroll();
      utils_api.transcribeAudio(filePath).then((res) => {
        onTranscribeSuccess(res.text || "");
      }).catch((e) => {
        if (e && e.code === "UNAUTHORIZED") {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          common_vendor.index.showToast({ title: e.message || "语音识别失败", icon: "none" });
        }
      }).finally(() => {
        isProcessingVoice = false;
      });
    }
    function onTranscribeSuccess(text) {
      if (!text) {
        messages.value.push({ role: "ai", type: "text", title: "", content: "未识别到内容，请重试", tip: "", show: true });
        scroll();
        return;
      }
      const lastUserMsg = messages.value[messages.value.length - 1];
      if (lastUserMsg && lastUserMsg.role === "user") {
        lastUserMsg.content = "[语音] " + text;
      }
      scroll();
      sending.value = true;
      utils_api.sendChatMessage(text, sessionId.value || void 0).then((res) => {
        sessionId.value = res.sessionId;
        messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
        scroll();
      }).catch((e) => {
        if (e && e.code === "UNAUTHORIZED") {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          messages.value.push({ role: "ai", type: "text", title: "", content: "网络异常，请稍后重试", tip: "", show: true });
          scroll();
        }
      }).finally(() => {
        sending.value = false;
      });
    }
    function onQuick(t) {
      if (sending.value)
        return;
      sending.value = true;
      messages.value.push({ role: "user", content: t, show: true });
      scroll();
      utils_api.sendChatMessage(t, sessionId.value || void 0).then((res) => {
        sessionId.value = res.sessionId;
        messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
        scroll();
      }).catch((e) => {
        if (e && e.code === "UNAUTHORIZED") {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          messages.value.push({ role: "ai", type: "text", title: "", content: "网络异常，请稍后重试", tip: "", show: true });
          scroll();
        }
      }).finally(() => {
        sending.value = false;
      });
    }
    function onFeature(type) {
      const map = { plan: "我想录入今天的计划", recommend: "帮我推荐一些高效的习惯", calendar: "查看今天的日程安排", stats: "帮我看看最近的数据统计" };
      onQuick(map[type]);
    }
    function showAddMenu() {
      addVisible.value = true;
    }
    function onAdd(key) {
      addVisible.value = false;
      common_vendor.index.showToast({ title: "已选择照片", icon: "none" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(utils_store.store).unreadCount > 0
      }, common_vendor.unref(utils_store.store).unreadCount > 0 ? {
        b: common_vendor.t(common_vendor.unref(utils_store.store).unreadCount > 99 ? "99+" : common_vendor.unref(utils_store.store).unreadCount)
      } : {}, {
        c: common_vendor.o(goNotifications),
        d: common_vendor.o(goTasks),
        e: common_vendor.o(goLogin),
        f: common_vendor.o(goPlans),
        g: loaded.value ? 1 : "",
        h: common_vendor.f(messages.value, (msg, i, i0) => {
          return common_vendor.e({
            a: msg.role === "ai"
          }, msg.role === "ai" ? {} : {}, {
            b: msg.role === "ai"
          }, msg.role === "ai" ? common_vendor.e({
            c: msg.type === "text"
          }, msg.type === "text" ? common_vendor.e({
            d: msg.title
          }, msg.title ? {
            e: common_vendor.t(msg.title)
          } : {}, {
            f: common_vendor.t(msg.content),
            g: msg.tip
          }, msg.tip ? {
            h: common_vendor.t(msg.tip)
          } : {}) : {}, {
            i: msg.type === "plan"
          }, msg.type === "plan" ? {
            j: common_vendor.t(msg.content),
            k: common_vendor.f(msg.plans, (p, k1, i1) => {
              return {
                a: common_vendor.t(p.name),
                b: common_vendor.t(p.time),
                c: p.name
              };
            }),
            l: common_vendor.o(goPlans, i)
          } : {}, {
            m: msg.type === "recommend"
          }, msg.type === "recommend" ? {
            n: common_vendor.t(msg.content),
            o: common_vendor.f(msg.items, (r, ri, i1) => {
              return {
                a: common_vendor.t(r),
                b: ri
              };
            })
          } : {}, {
            p: msg.type === "stats"
          }, msg.type === "stats" ? {
            q: common_vendor.t(msg.content),
            r: common_vendor.f(msg.stats, (s, si, i1) => {
              return {
                a: common_vendor.t(s.value),
                b: s.color,
                c: common_vendor.t(s.label),
                d: si
              };
            })
          } : {}) : {}, {
            s: msg.role === "user"
          }, msg.role === "user" ? {
            t: common_vendor.t(msg.content)
          } : {}, {
            v: msg.role === "user"
          }, msg.role === "user" ? common_vendor.e({
            w: userAvatar.value
          }, userAvatar.value ? {
            x: userAvatar.value
          } : {}) : {}, {
            y: i,
            z: common_vendor.n(msg.role === "user" ? "align-right" : "align-left"),
            A: common_vendor.n({
              show: msg.show
            }),
            B: i * 0.06 + "s"
          });
        }),
        i: scrollTop.value,
        j: common_vendor.o(($event) => onFeature("plan")),
        k: common_vendor.o(($event) => onFeature("recommend")),
        l: common_vendor.o(($event) => onFeature("calendar")),
        m: common_vendor.o(($event) => onFeature("stats")),
        n: loaded.value ? 1 : "",
        o: inputMode.value === "text"
      }, inputMode.value === "text" ? {
        p: inputFocus.value,
        q: common_vendor.o(onSend),
        r: common_vendor.o(($event) => inputFocus.value = false),
        s: common_vendor.o(($event) => composing.value = true),
        t: common_vendor.o(($event) => composing.value = false),
        v: inputText.value,
        w: common_vendor.o(($event) => inputText.value = $event.detail.value)
      } : {
        x: common_vendor.t(isRecording.value ? "正在录音...点击停止" : "点击说话"),
        y: isRecording.value ? 1 : ""
      }, {
        z: inputMode.value === "text"
      }, inputMode.value === "text" ? {} : {}, {
        A: common_vendor.o(toggleMode),
        B: inputMode.value === "text"
      }, inputMode.value === "text" ? {
        C: inputText.value.length > 0 ? 1 : "",
        D: common_vendor.o(onSend)
      } : {
        E: isRecording.value ? 1 : "",
        F: common_vendor.o(toggleVoice)
      }, {
        G: common_vendor.o(showAddMenu),
        H: addVisible.value
      }, addVisible.value ? {
        I: common_vendor.f(addOptions, (a, k0, i0) => {
          return {
            a: a.bg,
            b: common_vendor.t(a.label),
            c: a.key,
            d: common_vendor.o(($event) => onAdd(a.key), a.key)
          };
        }),
        J: common_vendor.o(() => {
        }),
        K: common_vendor.o(($event) => addVisible.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
