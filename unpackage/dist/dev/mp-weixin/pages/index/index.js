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
    let recognition = null;
    const addOptions = [
      { key: "photo", label: "照片", bg: "#ece5ff", color: "#7b6df0" }
    ];
    const messages = common_vendor.ref([
      {
        role: "ai",
        type: "text",
        title: "你好！我是你的计划助手 👋",
        content: "你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。",
        tip: "比如：明天上午10点开会，下午去健身，晚上学习2小时"
      }
    ]);
    common_vendor.computed(() => messages.value.length <= 2);
    setTimeout(() => {
      loaded.value = true;
    }, 80);
    common_vendor.onMounted(() => {
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
      messages.value.push({ role: "user", content: t });
      inputText.value = "";
      scroll();
      utils_api.sendChatMessage(t, sessionId.value || void 0).then((res) => {
        sessionId.value = res.sessionId;
        messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "" });
        scroll();
      }).catch((e) => {
        if (e && e.code === "UNAUTHORIZED") {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          messages.value.push({ role: "ai", type: "text", title: "", content: "网络异常，请稍后重试", tip: "" });
          scroll();
        }
      }).finally(() => {
        sending.value = false;
      });
    }
    function toggleVoice() {
      if (isRecording.value) {
        stopRecord();
      } else {
        startRecord();
      }
    }
    function startRecord() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        common_vendor.index.showToast({ title: "当前浏览器不支持语音识别", icon: "none" });
        return;
      }
      isRecording.value = true;
      recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        isRecording.value = false;
        messages.value.push({ role: "user", content: "[语音] " + text });
        scroll();
        sending.value = true;
        utils_api.sendChatMessage(text, sessionId.value || void 0).then((res) => {
          sessionId.value = res.sessionId;
          messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "" });
          scroll();
        }).catch((e2) => {
          if (e2 && e2.code === "UNAUTHORIZED") {
            common_vendor.index.showToast({ title: "请先登录", icon: "none" });
            setTimeout(() => {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }, 800);
          } else {
            messages.value.push({ role: "ai", type: "text", title: "", content: "网络异常，请稍后重试", tip: "" });
            scroll();
          }
        }).finally(() => {
          sending.value = false;
        });
      };
      recognition.onerror = () => {
        isRecording.value = false;
        common_vendor.index.showToast({ title: "语音识别失败", icon: "none" });
      };
      recognition.onend = () => {
        isRecording.value = false;
      };
      recognition.start();
    }
    function stopRecord() {
      if (!isRecording.value)
        return;
      isRecording.value = false;
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
    }
    function onQuick(t) {
      if (sending.value)
        return;
      sending.value = true;
      messages.value.push({ role: "user", content: t });
      scroll();
      utils_api.sendChatMessage(t, sessionId.value || void 0).then((res) => {
        sessionId.value = res.sessionId;
        messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "" });
        scroll();
      }).catch((e) => {
        if (e && e.code === "UNAUTHORIZED") {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 800);
        } else {
          messages.value.push({ role: "ai", type: "text", title: "", content: "网络异常，请稍后重试", tip: "" });
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
            A: i * 0.1 + "s"
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
        y: isRecording.value ? 1 : "",
        z: common_vendor.o(toggleVoice)
      }, {
        A: inputMode.value === "text"
      }, inputMode.value === "text" ? {} : {}, {
        B: common_vendor.o(toggleMode),
        C: inputMode.value === "text"
      }, inputMode.value === "text" ? {
        D: inputText.value.length > 0 ? 1 : "",
        E: common_vendor.o(onSend)
      } : {
        F: isRecording.value ? 1 : "",
        G: common_vendor.o(toggleVoice)
      }, {
        H: common_vendor.o(showAddMenu),
        I: addVisible.value
      }, addVisible.value ? {
        J: common_vendor.f(addOptions, (a, k0, i0) => {
          return {
            a: a.bg,
            b: common_vendor.t(a.label),
            c: a.key,
            d: common_vendor.o(($event) => onAdd(a.key), a.key)
          };
        }),
        K: common_vendor.o(() => {
        }),
        L: common_vendor.o(($event) => addVisible.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
