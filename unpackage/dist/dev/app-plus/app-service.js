if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  function isTableRow(line) {
    return line.startsWith("|") && line.includes("|");
  }
  function parseTableRow(line) {
    const parts = line.replace(/^\|/, "").replace(/\|$/, "").split("|");
    return parts.map((c) => c.trim());
  }
  function parseTable(lines) {
    if (lines.length < 1)
      return null;
    const headers = parseTableRow(lines[0]);
    let startIdx = 1;
    if (lines.length > 1 && /^\|[\s\-:|]+\|$/.test(lines[1]))
      startIdx = 2;
    const rows = [];
    for (let j = startIdx; j < lines.length; j++) {
      rows.push(parseTableRow(lines[j]));
    }
    return { type: "table", headers, rows };
  }
  function parseMarkdown(content) {
    if (!content || typeof content !== "string")
      return [];
    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (!trimmed) {
        i++;
        continue;
      }
      if (isTableRow(trimmed)) {
        const tableLines = [];
        while (i < lines.length && isTableRow(lines[i].trim())) {
          tableLines.push(lines[i].trim());
          i++;
        }
        const table = parseTable(tableLines);
        if (table)
          blocks.push(table);
        continue;
      }
      if (/^[-*_]{3,}$/.test(trimmed)) {
        blocks.push({ type: "hr" });
        i++;
        continue;
      }
      const hm = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (hm) {
        blocks.push({ type: "h" + hm[1].length, text: hm[2] });
        i++;
        continue;
      }
      if (/^[-*]\s+/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        blocks.push({ type: "list", items });
        continue;
      }
      const paraLines = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t)
          break;
        if (isTableRow(t) || /^(#{1,3})\s+/.test(t) || /^[-*_]{3,}$/.test(t) || /^[-*]\s+/.test(t))
          break;
        paraLines.push(t);
        i++;
      }
      if (paraLines.length)
        blocks.push({ type: "p", text: paraLines.join("\n") });
    }
    return blocks;
  }
  function parseInline(text) {
    if (!text)
      return [{ text: "", bold: false }];
    const segments = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last)
        segments.push({ text: text.slice(last, m.index), bold: false });
      segments.push({ text: m[1], bold: true });
      last = m.index + m[0].length;
    }
    if (last < text.length)
      segments.push({ text: text.slice(last), bold: false });
    if (!segments.length)
      segments.push({ text: String(text), bold: false });
    return segments;
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$9 = {
    __name: "markdown-content",
    props: {
      content: { type: String, default: "" }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const blocks = vue.computed(() => parseMarkdown(props.content));
      function inlineSegments(text) {
        return parseInline(text);
      }
      function tableMinWidth(block) {
        var _a;
        const cols = ((_a = block.headers) == null ? void 0 : _a.length) || 1;
        return cols * 160 + "rpx";
      }
      const __returned__ = { props, blocks, inlineSegments, tableMinWidth, computed: vue.computed, get parseMarkdown() {
        return parseMarkdown;
      }, get parseInline() {
        return parseInline;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "md-root" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.blocks, (block, bi) => {
          return vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: bi },
            [
              block.type === "h1" ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "md-h1"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.inlineSegments(block.text), (seg, si) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: "h1-" + si,
                        class: vue.normalizeClass({ "md-bold": seg.bold })
                      },
                      vue.toDisplayString(seg.text),
                      3
                      /* TEXT, CLASS */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : block.type === "h2" ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 1,
                class: "md-h2"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.inlineSegments(block.text), (seg, si) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: "h2-" + si,
                        class: vue.normalizeClass({ "md-bold": seg.bold })
                      },
                      vue.toDisplayString(seg.text),
                      3
                      /* TEXT, CLASS */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : block.type === "h3" ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 2,
                class: "md-h3"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.inlineSegments(block.text), (seg, si) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: "h3-" + si,
                        class: vue.normalizeClass({ "md-bold": seg.bold })
                      },
                      vue.toDisplayString(seg.text),
                      3
                      /* TEXT, CLASS */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : block.type === "hr" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 3,
                class: "md-hr"
              })) : block.type === "list" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 4,
                class: "md-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(block.items, (item, li) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: li,
                      class: "md-li"
                    }, [
                      vue.createElementVNode("text", { class: "md-li-dot" }, "•"),
                      vue.createElementVNode("text", { class: "md-li-text" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($setup.inlineSegments(item), (seg, si) => {
                            return vue.openBlock(), vue.createElementBlock(
                              "text",
                              {
                                key: si,
                                class: vue.normalizeClass({ "md-bold": seg.bold })
                              },
                              vue.toDisplayString(seg.text),
                              3
                              /* TEXT, CLASS */
                            );
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : block.type === "table" ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
                key: 5,
                "scroll-x": "",
                class: "md-table-scroll",
                "show-scrollbar": false
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "md-table",
                    style: vue.normalizeStyle({ minWidth: $setup.tableMinWidth(block) })
                  },
                  [
                    vue.createElementVNode("view", { class: "md-tr md-tr-head" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(block.headers, (cell, ci) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: "th-" + ci,
                            class: "md-th"
                          }, [
                            vue.createElementVNode("text", { class: "md-cell" }, [
                              (vue.openBlock(true), vue.createElementBlock(
                                vue.Fragment,
                                null,
                                vue.renderList($setup.inlineSegments(cell), (seg, si) => {
                                  return vue.openBlock(), vue.createElementBlock(
                                    "text",
                                    {
                                      key: si,
                                      class: vue.normalizeClass({ "md-bold": seg.bold })
                                    },
                                    vue.toDisplayString(seg.text),
                                    3
                                    /* TEXT, CLASS */
                                  );
                                }),
                                128
                                /* KEYED_FRAGMENT */
                              ))
                            ])
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(block.rows, (row, ri) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: "tr-" + ri,
                            class: vue.normalizeClass(["md-tr", { "md-tr-alt": ri % 2 === 1 }])
                          },
                          [
                            (vue.openBlock(true), vue.createElementBlock(
                              vue.Fragment,
                              null,
                              vue.renderList(row, (cell, ci) => {
                                return vue.openBlock(), vue.createElementBlock("view", {
                                  key: "td-" + ci,
                                  class: "md-td"
                                }, [
                                  vue.createElementVNode("text", { class: "md-cell" }, [
                                    (vue.openBlock(true), vue.createElementBlock(
                                      vue.Fragment,
                                      null,
                                      vue.renderList($setup.inlineSegments(cell), (seg, si) => {
                                        return vue.openBlock(), vue.createElementBlock(
                                          "text",
                                          {
                                            key: si,
                                            class: vue.normalizeClass({ "md-bold": seg.bold })
                                          },
                                          vue.toDisplayString(seg.text),
                                          3
                                          /* TEXT, CLASS */
                                        );
                                      }),
                                      128
                                      /* KEYED_FRAGMENT */
                                    ))
                                  ])
                                ]);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ],
                          2
                          /* CLASS */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  4
                  /* STYLE */
                )
              ])) : block.type === "p" ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 6,
                class: "md-p"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.inlineSegments(block.text), (seg, si) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: "p-" + si,
                        class: vue.normalizeClass({ "md-bold": seg.bold })
                      },
                      vue.toDisplayString(seg.text),
                      3
                      /* TEXT, CLASS */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true)
            ],
            64
            /* STABLE_FRAGMENT */
          );
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-00310203"], ["__file", "E:/HTML/ai_grow/components/markdown-content/markdown-content.vue"]]);
  const BASE_URL = "http://192.168.3.3:8080";
  function getAccessToken() {
    return uni.getStorageSync("accessToken") || "";
  }
  function getRefreshToken() {
    return uni.getStorageSync("refreshToken") || "";
  }
  function saveTokens(data) {
    if (data.accessToken)
      uni.setStorageSync("accessToken", data.accessToken);
    if (data.refreshToken)
      uni.setStorageSync("refreshToken", data.refreshToken);
    if (data.uid)
      uni.setStorageSync("uid", data.uid);
    uni.setStorageSync("isLogin", true);
  }
  function clearTokens() {
    uni.removeStorageSync("accessToken");
    uni.removeStorageSync("refreshToken");
    uni.removeStorageSync("uid");
    uni.removeStorageSync("isLogin");
    uni.removeStorageSync("userInfo");
  }
  function request(options) {
    return new Promise((resolve, reject) => {
      const { url, method = "POST", data = {}, auth = false } = options;
      const header = { "Content-Type": "application/json" };
      if (auth) {
        header["Authorization"] = "Bearer " + getAccessToken();
      }
      uni.request({
        url: BASE_URL + url,
        method,
        data,
        header,
        success: (res) => {
          if (res.statusCode === 401 && auth) {
            refreshToken().then(() => {
              header["Authorization"] = "Bearer " + getAccessToken();
              uni.request({
                url: BASE_URL + url,
                method,
                data,
                header,
                success: (retryRes) => {
                  if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
                    resolve(retryRes.data);
                  } else {
                    reject(retryRes.data || { code: "ERROR", message: "请求失败" });
                  }
                },
                fail: (err) => reject({ code: "NETWORK_ERROR", message: "网络异常" })
              });
            }).catch(() => {
              clearTokens();
              uni.reLaunch({ url: "/pages/login/login" });
              reject({ code: "UNAUTHORIZED", message: "登录已过期" });
            });
            return;
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(res.data || { code: "ERROR", message: "请求失败(" + res.statusCode + ")" });
          }
        },
        fail: (err) => {
          reject({ code: "NETWORK_ERROR", message: "网络连接失败，请检查网络" });
        }
      });
    });
  }
  function refreshToken() {
    return new Promise((resolve, reject) => {
      const rt = getRefreshToken();
      if (!rt) {
        reject(new Error("无刷新令牌"));
        return;
      }
      uni.request({
        url: BASE_URL + "/api/v1/auth/refresh",
        method: "POST",
        data: { refreshToken: rt },
        header: { "Content-Type": "application/json" },
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            saveTokens(res.data);
            resolve(res.data);
          } else {
            clearTokens();
            reject(new Error("刷新失败"));
          }
        },
        fail: () => {
          clearTokens();
          reject(new Error("刷新失败"));
        }
      });
    });
  }
  function updateProfile(data) {
    return request({
      url: "/api/v1/users/me",
      method: "PATCH",
      data,
      auth: true
    });
  }
  function uploadAvatar(filePath) {
    return new Promise((resolve, reject) => {
      const token = getAccessToken();
      uni.uploadFile({
        url: BASE_URL + "/api/v1/users/me/avatar",
        filePath,
        name: "file",
        header: { "Authorization": "Bearer " + token },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(res.data));
            } catch (e) {
              reject({ code: "ERROR", message: "响应解析失败" });
            }
          } else {
            try {
              reject(JSON.parse(res.data));
            } catch (e) {
              reject({ code: "ERROR", message: "上传失败(" + res.statusCode + ")" });
            }
          }
        },
        fail: () => reject({ code: "NETWORK_ERROR", message: "上传失败" })
      });
    });
  }
  function deleteAccount() {
    return request({
      url: "/api/v1/users/me",
      method: "DELETE",
      auth: true
    }).finally(() => {
      clearTokens();
    });
  }
  function login(account, password) {
    return request({
      url: "/api/v1/auth/login",
      data: { account, password }
    }).then((res) => {
      saveTokens(res);
      return res;
    });
  }
  function sendRegisterCode(email) {
    return request({
      url: "/api/v1/auth/register/send-code",
      data: { email }
    });
  }
  function register({ email, password, nickname, verificationCode }) {
    return request({
      url: "/api/v1/auth/register",
      data: { email, password, nickname, verificationCode }
    }).then((res) => {
      saveTokens(res);
      return res;
    });
  }
  function sendResetCode(account) {
    return request({
      url: "/api/v1/auth/password/reset/send-code",
      data: { account }
    });
  }
  function resetPassword({ account, verificationCode, newPassword }) {
    return request({
      url: "/api/v1/auth/password/reset",
      data: { account, verificationCode, newPassword }
    });
  }
  function getUserInfo() {
    return request({
      url: "/api/v1/users/me",
      method: "GET",
      auth: true
    });
  }
  function logout(allDevices = false) {
    return request({
      url: "/api/v1/auth/logout",
      data: { allDevices },
      auth: true
    }).finally(() => {
      clearTokens();
    });
  }
  function transcribeAudio(filePath) {
    return new Promise((resolve, reject) => {
      const token = getAccessToken();
      let tried = 0;
      const doUpload = () => {
        uni.uploadFile({
          url: BASE_URL + "/api/v1/speech/transcribe",
          filePath,
          name: "file",
          header: { "Authorization": "Bearer " + token },
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(res.data));
              } catch (e) {
                reject({ code: "ERROR", message: "响应解析失败" });
              }
            } else if (res.statusCode === 401) {
              reject({ code: "UNAUTHORIZED", message: "登录已过期" });
            } else {
              try {
                reject(JSON.parse(res.data));
              } catch (e) {
                reject({ code: "ERROR", message: "语音识别失败(" + res.statusCode + ")" });
              }
            }
          },
          fail: (err) => {
            const msg = err && err.errMsg || "";
            formatAppLog("error", "at utils/api.js:279", "transcribeAudio upload fail:", msg);
            if (msg.includes("exceed max upload") && tried < 3) {
              tried++;
              formatAppLog("warn", "at utils/api.js:282", "uploadFile retry", tried, "in", tried * 500, "ms");
              setTimeout(doUpload, tried * 500);
            } else {
              reject({ code: "NETWORK_ERROR", message: msg.includes("fail") ? "上传失败，请检查网络" : "上传失败" });
            }
          }
        });
      };
      doUpload();
    });
  }
  function sendChatMessage(message, sessionId, provider) {
    const data = { message };
    if (sessionId)
      data.sessionId = sessionId;
    if (provider)
      data.provider = provider;
    return request({
      url: "/api/v1/ai/chat",
      data,
      auth: true
    });
  }
  function getMyTasks(status) {
    const params = status ? "?status=" + status : "";
    return request({
      url: "/api/v1/users/me/tasks" + params,
      method: "GET",
      auth: true
    });
  }
  function getUnreadCount() {
    return request({
      url: "/api/v1/users/me/notifications/unread-count",
      method: "GET",
      auth: true
    });
  }
  function getNotifications(unreadOnly) {
    const params = unreadOnly ? "?unreadOnly=true" : "";
    return request({
      url: "/api/v1/users/me/notifications" + params,
      method: "GET",
      auth: true
    });
  }
  function markNotificationRead(id) {
    return request({
      url: "/api/v1/users/me/notifications/" + id + "/read",
      method: "PATCH",
      auth: true
    });
  }
  function markAllNotificationsRead() {
    return request({
      url: "/api/v1/users/me/notifications/read-all",
      method: "PATCH",
      auth: true
    });
  }
  const store = vue.reactive({ unreadCount: 0 });
  const MIN_RECORD_MS = 800;
  const _sfc_main$8 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const scrollTop = vue.ref(0);
      const inputText = vue.ref("");
      const inputMode = vue.ref("voice");
      const inputFocus = vue.ref(false);
      const isRecording = vue.ref(false);
      const addVisible = vue.ref(false);
      const recordTimer = vue.ref(null);
      const sessionId = vue.ref(null);
      const sending = vue.ref(false);
      const userAvatar = vue.ref("");
      const composing = vue.ref(false);
      let recorderManager = null;
      let h5MediaRecorder = null;
      let isProcessingVoice = false;
      let touchRecording = false;
      let recordStarting = false;
      const addOptions = [
        { key: "photo", label: "照片", bg: "#ece5ff", color: "#7b6df0" }
      ];
      const messages = vue.ref([
        {
          role: "ai",
          type: "text",
          show: true,
          title: "你好！我是你的计划助手 👋",
          content: "你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。",
          tip: "比如：明天上午10点开会，下午去健身，晚上学习2小时"
        }
      ]);
      const showTags = vue.computed(() => messages.value.length <= 2);
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
        if (getAccessToken()) {
          getUnreadCount().then((res) => {
            store.unreadCount = res.count || 0;
          }).catch(() => {
          });
          getUserInfo().then((res) => {
            if (res.avatarUrl) {
              userAvatar.value = res.avatarUrl.replace(/^https?:\/\/[^\/]+/, BASE_URL);
            }
          }).catch(() => {
          });
        }
      });
      function scroll() {
        vue.nextTick(() => {
          scrollTop.value = Math.random() * 99999;
        });
      }
      function goPlans() {
        uni.navigateTo({ url: "/pages/plans/plans" });
      }
      function goNotifications() {
        uni.navigateTo({ url: "/pages/notifications/notifications" });
      }
      function goTasks() {
        uni.navigateTo({ url: "/pages/tasks/tasks" });
      }
      function goLogin() {
        const token = getAccessToken();
        if (token) {
          uni.navigateTo({ url: "/pages/profile/profile" });
        } else {
          uni.navigateTo({ url: "/pages/login/login" });
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
        sendChatMessage(t, sessionId.value || void 0).then((res) => {
          sessionId.value = res.sessionId;
          messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
          scroll();
        }).catch((e) => {
          if (e && e.code === "UNAUTHORIZED") {
            uni.showToast({ title: "请先登录", icon: "none" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/login" });
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
      function ensureRecordPermission() {
        return new Promise((resolve, reject) => {
          const sys = uni.getSystemInfoSync();
          if (sys.platform === "android" && typeof plus !== "undefined" && plus.android) {
            plus.android.requestPermissions(
              ["android.permission.RECORD_AUDIO"],
              (e) => {
                if (e.granted && e.granted.length > 0)
                  resolve();
                else
                  reject(new Error("denied"));
              },
              reject
            );
            return;
          }
          if (sys.uniPlatform === "mp-weixin") {
            uni.authorize({
              scope: "scope.record",
              success: () => resolve(),
              fail: () => reject(new Error("denied"))
            });
            return;
          }
          resolve();
        });
      }
      function initRecorderManager() {
        if (recorderManager)
          return;
        recorderManager = uni.getRecorderManager();
        recorderManager.onStart(() => {
          formatAppLog("log", "at pages/index/index.vue:340", "recorderManager onStart");
          isRecording.value = true;
        });
        recorderManager.onStop((res) => {
          formatAppLog("log", "at pages/index/index.vue:344", "recorderManager onStop:", JSON.stringify(res));
          isRecording.value = false;
          touchRecording = false;
          recordStarting = false;
          if (isProcessingVoice)
            return;
          const duration = res.duration || Date.now() - recordStartTime;
          if (duration < MIN_RECORD_MS) {
            uni.showToast({ title: "说话时间太短，请按住多说一会儿", icon: "none" });
            return;
          }
          if (res.tempFilePath) {
            isProcessingVoice = true;
            handleVoiceResult(res.tempFilePath);
          } else {
            uni.showToast({ title: "未获取到录音文件", icon: "none" });
          }
        });
        recorderManager.onError((err) => {
          formatAppLog("error", "at pages/index/index.vue:362", "recorderManager onError:", JSON.stringify(err));
          isRecording.value = false;
          touchRecording = false;
          recordStarting = false;
          uni.showToast({ title: "录音失败", icon: "none" });
        });
      }
      async function onVoiceTouchStart() {
        if (touchRecording || recordStarting || isProcessingVoice)
          return;
        if (!getAccessToken()) {
          uni.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            uni.navigateTo({ url: "/pages/login/login" });
          }, 800);
          return;
        }
        touchRecording = true;
        recordStarting = true;
        recordStartTime = Date.now();
        try {
          await ensureRecordPermission();
          recordStarting = false;
          if (!touchRecording)
            return;
          startRecord();
        } catch (e) {
          touchRecording = false;
          recordStarting = false;
          uni.showModal({
            title: "需要麦克风权限",
            content: "请在系统设置中允许本应用使用麦克风",
            confirmText: "知道了",
            showCancel: false
          });
        }
      }
      function onVoiceTouchMove() {
      }
      function onVoiceTouchEnd() {
        if (!touchRecording && !recordStarting && !isRecording.value)
          return;
        touchRecording = false;
        if (recordStarting) {
          recordStarting = false;
          return;
        }
        recordStarting = false;
        stopRecord();
      }
      function startRecord() {
        const platform = uni.getSystemInfoSync().platform;
        if (platform !== "web") {
          try {
            initRecorderManager();
            recorderManager.start({
              duration: 6e4,
              sampleRate: 16e3,
              numberOfChannels: 1,
              encodeBitRate: 48e3,
              format: "mp3"
            });
          } catch (e) {
            touchRecording = false;
            recordStarting = false;
            uni.showToast({ title: "录音初始化失败", icon: "none" });
          }
          return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          touchRecording = false;
          recordStarting = false;
          uni.showToast({ title: "当前环境不支持录音", icon: "none" });
          return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          if (!touchRecording) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          const mr = new MediaRecorder(stream);
          const chunks = [];
          mr.ondataavailable = (e) => {
            if (e.data.size > 0)
              chunks.push(e.data);
          };
          mr.onstart = () => {
            isRecording.value = true;
          };
          mr.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            isRecording.value = false;
            touchRecording = false;
            const elapsed = Date.now() - recordStartTime;
            if (elapsed < MIN_RECORD_MS) {
              uni.showToast({ title: "说话时间太短，请按住多说一会儿", icon: "none" });
              return;
            }
            const blob = new Blob(chunks, { type: "audio/webm" });
            uploadAndTranscribeBlob(blob);
          };
          mr.start();
          h5MediaRecorder = mr;
        }).catch(() => {
          touchRecording = false;
          recordStarting = false;
          uni.showToast({ title: "无法访问麦克风", icon: "none" });
        });
      }
      function stopRecord() {
        if (recorderManager) {
          try {
            recorderManager.stop();
          } catch (e) {
          }
        } else if (h5MediaRecorder && h5MediaRecorder.state === "recording") {
          h5MediaRecorder.stop();
        }
      }
      function uploadAndTranscribeBlob(blob) {
        messages.value.push({ role: "user", content: "[语音] 识别中...", show: true });
        scroll();
        const form = new FormData();
        form.append("file", blob, "speech.webm");
        const token = getAccessToken();
        const xhr = new XMLHttpRequest();
        xhr.open("POST", BASE_URL + "/api/v1/speech/transcribe");
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              onTranscribeSuccess(res.text);
            } catch (e) {
              uni.showToast({ title: "语音识别失败", icon: "none" });
            }
          } else if (xhr.status === 401) {
            uni.showToast({ title: "请先登录", icon: "none" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/login" });
            }, 800);
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              uni.showToast({ title: err.message || "语音识别失败", icon: "none" });
            } catch (e) {
              uni.showToast({ title: "语音识别失败", icon: "none" });
            }
          }
        };
        xhr.onerror = function() {
          uni.showToast({ title: "网络连接失败", icon: "none" });
        };
        xhr.send(form);
      }
      function handleVoiceResult(filePath) {
        formatAppLog("log", "at pages/index/index.vue:519", "handleVoiceResult filePath:", filePath);
        messages.value.push({ role: "user", content: "[语音] 识别中...", show: true });
        scroll();
        transcribeAudio(filePath).then((res) => {
          onTranscribeSuccess(res.text || "");
        }).catch((e) => {
          if (e && e.code === "UNAUTHORIZED") {
            uni.showToast({ title: "请先登录", icon: "none" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/login" });
            }, 800);
          } else {
            uni.showToast({ title: e.message || "语音识别失败", icon: "none" });
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
        sendChatMessage(text, sessionId.value || void 0).then((res) => {
          sessionId.value = res.sessionId;
          messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
          scroll();
        }).catch((e) => {
          if (e && e.code === "UNAUTHORIZED") {
            uni.showToast({ title: "请先登录", icon: "none" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/login" });
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
        sendChatMessage(t, sessionId.value || void 0).then((res) => {
          sessionId.value = res.sessionId;
          messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
          scroll();
        }).catch((e) => {
          if (e && e.code === "UNAUTHORIZED") {
            uni.showToast({ title: "请先登录", icon: "none" });
            setTimeout(() => {
              uni.navigateTo({ url: "/pages/login/login" });
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
        uni.showToast({ title: "已选择照片", icon: "none" });
      }
      const __returned__ = { loaded, scrollTop, inputText, inputMode, inputFocus, isRecording, addVisible, recordTimer, sessionId, sending, userAvatar, composing, get recorderManager() {
        return recorderManager;
      }, set recorderManager(v) {
        recorderManager = v;
      }, get h5MediaRecorder() {
        return h5MediaRecorder;
      }, set h5MediaRecorder(v) {
        h5MediaRecorder = v;
      }, get isProcessingVoice() {
        return isProcessingVoice;
      }, set isProcessingVoice(v) {
        isProcessingVoice = v;
      }, get touchRecording() {
        return touchRecording;
      }, set touchRecording(v) {
        touchRecording = v;
      }, get recordStarting() {
        return recordStarting;
      }, set recordStarting(v) {
        recordStarting = v;
      }, MIN_RECORD_MS, addOptions, messages, showTags, scroll, goPlans, goNotifications, goTasks, goLogin, toggleMode, onSend, get recordStartTime() {
        return recordStartTime;
      }, set recordStartTime(v) {
        recordStartTime = v;
      }, ensureRecordPermission, initRecorderManager, onVoiceTouchStart, onVoiceTouchMove, onVoiceTouchEnd, startRecord, stopRecord, uploadAndTranscribeBlob, handleVoiceResult, onTranscribeSuccess, onQuick, onFeature, showAddMenu, onAdd, ref: vue.ref, nextTick: vue.nextTick, computed: vue.computed, onMounted: vue.onMounted, get getAccessToken() {
        return getAccessToken;
      }, get sendChatMessage() {
        return sendChatMessage;
      }, get transcribeAudio() {
        return transcribeAudio;
      }, get getUnreadCount() {
        return getUnreadCount;
      }, get getUserInfo() {
        return getUserInfo;
      }, get BASE_URL() {
        return BASE_URL;
      }, get store() {
        return store;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_markdown_content = resolveEasycom(vue.resolveDynamicComponent("markdown-content"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["banner", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", { class: "banner-row" }, [
            vue.createElementVNode("text", { style: { "font-size": "48rpx" } }, "🤖"),
            vue.createElementVNode("view", { class: "banner-texts" }, [
              vue.createElementVNode("text", { class: "banner-title" }, "AI成长"),
              vue.createElementVNode("text", { class: "banner-sub" }, "你的智能计划助手")
            ]),
            vue.createElementVNode("view", {
              class: "plan-entry",
              onClick: $setup.goNotifications
            }, [
              vue.createElementVNode("text", { style: { "font-size": "28rpx", "color": "#fff" } }, "🔔"),
              $setup.store.unreadCount > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "badge"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "badge-text" },
                  vue.toDisplayString($setup.store.unreadCount > 99 ? "99+" : $setup.store.unreadCount),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("view", {
              class: "plan-entry",
              onClick: $setup.goTasks
            }, [
              vue.createElementVNode("text", { style: { "font-size": "28rpx", "color": "#fff" } }, "📋")
            ]),
            vue.createElementVNode("view", {
              class: "plan-entry",
              onClick: $setup.goLogin
            }, [
              vue.createElementVNode("text", { style: { "font-size": "28rpx", "color": "#fff" } }, "👤")
            ]),
            vue.createElementVNode("view", {
              class: "plan-entry",
              onClick: $setup.goPlans
            }, [
              vue.createElementVNode("text", { class: "plan-entry-txt" }, "计划 ›")
            ])
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("scroll-view", {
        class: "chat-scroll",
        "scroll-y": "",
        bounces: false,
        "show-scrollbar": false,
        "scroll-top": $setup.scrollTop,
        "scroll-with-animation": ""
      }, [
        vue.createElementVNode("view", { class: "msg-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.messages, (msg, i) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: i,
                  class: vue.normalizeClass(["msg-item", [msg.role === "user" ? "align-right" : "align-left", { show: msg.show }]]),
                  style: vue.normalizeStyle({ transitionDelay: i * 0.06 + "s" })
                },
                [
                  msg.role === "ai" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "ai-avatar"
                  }, [
                    vue.createElementVNode("text", { style: { "font-size": "36rpx" } }, "🤖")
                  ])) : vue.createCommentVNode("v-if", true),
                  msg.role === "ai" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "card-ai"
                  }, [
                    msg.type === "text" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                      msg.title ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "ai-hd"
                        },
                        vue.toDisplayString(msg.title),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      vue.createVNode(_component_markdown_content, {
                        class: "ai-bd",
                        content: msg.content
                      }, null, 8, ["content"]),
                      msg.tip ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 1,
                          class: "ai-tip"
                        },
                        vue.toDisplayString(msg.tip),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])) : vue.createCommentVNode("v-if", true),
                    msg.type === "plan" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                      vue.createElementVNode(
                        "text",
                        { class: "card-hd" },
                        vue.toDisplayString(msg.content),
                        1
                        /* TEXT */
                      ),
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(msg.plans, (p) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            class: "plan-row",
                            key: p.name
                          }, [
                            vue.createElementVNode("view", { class: "plan-l" }, [
                              vue.createElementVNode("text", { style: { "font-size": "22rpx" } }, "⏰"),
                              vue.createElementVNode(
                                "text",
                                { class: "plan-nm" },
                                vue.toDisplayString(p.name),
                                1
                                /* TEXT */
                              )
                            ]),
                            vue.createElementVNode(
                              "text",
                              { class: "plan-tm" },
                              vue.toDisplayString(p.time),
                              1
                              /* TEXT */
                            )
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      vue.createElementVNode("view", {
                        class: "link-row",
                        onClick: $setup.goPlans
                      }, [
                        vue.createElementVNode("text", { class: "link-txt" }, "查看计划 >")
                      ])
                    ])) : vue.createCommentVNode("v-if", true),
                    msg.type === "recommend" ? (vue.openBlock(), vue.createElementBlock("view", { key: 2 }, [
                      vue.createElementVNode(
                        "text",
                        { class: "card-hd" },
                        vue.toDisplayString(msg.content),
                        1
                        /* TEXT */
                      ),
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(msg.items, (r, ri) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            class: "rec-row",
                            key: ri
                          }, [
                            vue.createElementVNode(
                              "text",
                              { class: "rec-txt" },
                              vue.toDisplayString(r),
                              1
                              /* TEXT */
                            )
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : vue.createCommentVNode("v-if", true),
                    msg.type === "stats" ? (vue.openBlock(), vue.createElementBlock("view", { key: 3 }, [
                      vue.createElementVNode(
                        "text",
                        { class: "card-hd" },
                        vue.toDisplayString(msg.content),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "stats-grid" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(msg.stats, (s, si) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              class: "stat-item",
                              key: si
                            }, [
                              vue.createElementVNode(
                                "text",
                                {
                                  class: "stat-value",
                                  style: vue.normalizeStyle({ color: s.color })
                                },
                                vue.toDisplayString(s.value),
                                5
                                /* TEXT, STYLE */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "stat-label" },
                                vue.toDisplayString(s.label),
                                1
                                /* TEXT */
                              )
                            ]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ])) : vue.createCommentVNode("v-if", true),
                  msg.role === "user" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 2,
                    class: "card-user"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "user-txt" },
                      vue.toDisplayString(msg.content),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  msg.role === "user" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 3,
                    class: "user-avatar"
                  }, [
                    $setup.userAvatar ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      src: $setup.userAvatar,
                      class: "user-avatar-img",
                      mode: "aspectFill"
                    }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      style: { "font-size": "36rpx", "color": "#4facfe" }
                    }, "👤"))
                  ])) : vue.createCommentVNode("v-if", true)
                ],
                6
                /* CLASS, STYLE */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ], 8, ["scroll-top"]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["func-bar", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", {
            class: "func-pill",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.onFeature("plan"))
          }, [
            vue.createElementVNode("text", null, " 录入计划")
          ]),
          vue.createElementVNode("view", {
            class: "func-pill",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.onFeature("recommend"))
          }, [
            vue.createElementVNode("text", null, " 智能推荐")
          ]),
          vue.createElementVNode("view", {
            class: "func-pill",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.onFeature("calendar"))
          }, [
            vue.createElementVNode("text", null, " 日程视图")
          ]),
          vue.createElementVNode("view", {
            class: "func-pill",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.onFeature("stats"))
          }, [
            vue.createElementVNode("text", null, " 数据统计")
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("view", { class: "input-card" }, [
        $setup.inputMode === "text" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          vue.withDirectives(vue.createElementVNode("input", {
            class: "inp",
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.inputText = $event),
            type: "text",
            placeholder: "输入计划...",
            "placeholder-class": "inp-ph",
            "confirm-type": "send",
            focus: $setup.inputFocus,
            onConfirm: $setup.onSend,
            onBlur: _cache[5] || (_cache[5] = ($event) => $setup.inputFocus = false),
            onCompositionstart: _cache[6] || (_cache[6] = ($event) => $setup.composing = true),
            onCompositionend: _cache[7] || (_cache[7] = ($event) => $setup.composing = false)
          }, null, 40, ["focus"]), [
            [vue.vModelText, $setup.inputText]
          ])
        ])) : (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: vue.normalizeClass(["voice-area", { recording: $setup.isRecording }]),
            onTouchstart: vue.withModifiers($setup.onVoiceTouchStart, ["stop"]),
            onTouchend: vue.withModifiers($setup.onVoiceTouchEnd, ["stop"]),
            onTouchcancel: vue.withModifiers($setup.onVoiceTouchEnd, ["stop"]),
            onTouchmove: vue.withModifiers($setup.onVoiceTouchMove, ["stop", "prevent"])
          },
          [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["voice-tip", { recording: $setup.isRecording }])
              },
              vue.toDisplayString($setup.isRecording ? "松开 结束" : "按住 说话"),
              3
              /* TEXT, CLASS */
            )
          ],
          34
          /* CLASS, NEED_HYDRATION */
        )),
        vue.createElementVNode("view", { class: "inp-tools" }, [
          vue.createElementVNode("view", {
            class: "inp-btn",
            onClick: $setup.toggleMode
          }, [
            $setup.inputMode === "text" ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              style: { "font-size": "28rpx", "color": "#bbb" }
            }, "⌨")) : (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              style: { "font-size": "28rpx", "color": "#bbb" }
            }, "🎤"))
          ]),
          $setup.inputMode === "text" ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 0,
              class: vue.normalizeClass(["inp-send", { active: $setup.inputText.length > 0 }]),
              onClick: $setup.onSend
            },
            [
              vue.createElementVNode("text", { style: { "font-size": "28rpx", "color": "#fff" } }, "发送")
            ],
            2
            /* CLASS */
          )) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: vue.normalizeClass(["inp-mic", { pressed: $setup.isRecording }]),
              onTouchstart: vue.withModifiers($setup.onVoiceTouchStart, ["stop"]),
              onTouchend: vue.withModifiers($setup.onVoiceTouchEnd, ["stop"]),
              onTouchcancel: vue.withModifiers($setup.onVoiceTouchEnd, ["stop"]),
              onTouchmove: vue.withModifiers($setup.onVoiceTouchMove, ["stop", "prevent"])
            },
            [
              vue.createElementVNode("text", { style: { "font-size": "28rpx", "color": "#fff" } }, "🎤")
            ],
            34
            /* CLASS, NEED_HYDRATION */
          )),
          vue.createElementVNode("view", {
            class: "inp-btn",
            onClick: $setup.showAddMenu
          }, [
            vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#bbb" } }, "＋")
          ])
        ])
      ]),
      $setup.addVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "add-mask",
        onClick: _cache[9] || (_cache[9] = ($event) => $setup.addVisible = false)
      }, [
        vue.createElementVNode("view", {
          class: "add-panel",
          onClick: _cache[8] || (_cache[8] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.addOptions, (a) => {
              return vue.createElementVNode("view", {
                class: "add-item",
                key: a.key,
                onClick: ($event) => $setup.onAdd(a.key)
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "add-icon-box",
                    style: vue.normalizeStyle({ background: a.bg })
                  },
                  [
                    vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#7b6df0" } }, "🖼️")
                  ],
                  4
                  /* STYLE */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "add-label" },
                  vue.toDisplayString(a.label),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/HTML/ai_grow/pages/index/index.vue"]]);
  const _sfc_main$7 = {
    __name: "plans",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const weeks = ["日", "一", "二", "三", "四", "五", "六"];
      const today = /* @__PURE__ */ new Date();
      const curYear = vue.ref(today.getFullYear());
      const curMonth = vue.ref(today.getMonth() + 1);
      const selectedDate = vue.ref(formatDate(today));
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
      });
      function formatDate(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
      const calendarDays = vue.computed(() => {
        const year = curYear.value;
        const month = curMonth.value - 1;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) {
          days.push({ day: 0 });
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const full = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isToday = full === formatDate(today);
          const hasPlan = allPlans.value.some((p) => p.date === full);
          days.push({ day: d, full, isToday, hasPlan });
        }
        return days;
      });
      const allPlans = vue.ref([
        { id: 1, name: "晨会", time: "09:00 - 09:30", date: formatDate(today), color: "#7b6df0", done: false },
        { id: 2, name: "开发任务", time: "10:00 - 12:00", date: formatDate(today), color: "#67c23a", done: false },
        { id: 3, name: "午餐", time: "12:00 - 13:00", date: formatDate(today), color: "#e6a23c", done: true },
        { id: 4, name: "项目复盘", time: "15:00 - 16:00", date: formatDate(today), color: "#f56c6c", done: false }
      ]);
      const addDays = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() + n);
        return formatDate(d);
      };
      allPlans.value.push(
        { id: 5, name: "会议", time: "10:00 - 11:00", date: addDays(1), color: "#7b6df0", done: false },
        { id: 6, name: "健身", time: "14:00 - 15:30", date: addDays(1), color: "#67c23a", done: false },
        { id: 7, name: "学习", time: "20:00 - 22:00", date: addDays(1), color: "#409eff", done: false },
        { id: 8, name: "阅读", time: "08:00 - 09:00", date: addDays(3), color: "#e6a23c", done: false },
        { id: 9, name: "团队周会", time: "10:00 - 11:30", date: addDays(5), color: "#f56c6c", done: false },
        { id: 10, name: "健身", time: "18:00 - 19:30", date: addDays(5), color: "#67c23a", done: false },
        { id: 11, name: "月度总结", time: "14:00 - 16:00", date: addDays(-2), color: "#7b6df0", done: true },
        { id: 12, name: "需求评审", time: "10:00 - 11:00", date: addDays(-2), color: "#e6a23c", done: true }
      );
      const selectedPlans = vue.computed(() => {
        return allPlans.value.filter((p) => p.date === selectedDate.value);
      });
      const selectedLabel = vue.computed(() => {
        if (!selectedDate.value)
          return "";
        const d = new Date(selectedDate.value);
        const ws = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const isToday = selectedDate.value === formatDate(today);
        const prefix = isToday ? "今天 · " : "";
        return `${prefix}${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${ws[d.getDay()]}`;
      });
      function selectDate(full) {
        selectedDate.value = full;
      }
      function prevMonth() {
        if (curMonth.value === 1) {
          curMonth.value = 12;
          curYear.value--;
        } else {
          curMonth.value--;
        }
      }
      function nextMonth() {
        if (curMonth.value === 12) {
          curMonth.value = 1;
          curYear.value++;
        } else {
          curMonth.value++;
        }
      }
      function toggleDone(p) {
        p.done = !p.done;
      }
      function goBack() {
        uni.navigateBack();
      }
      function addPlan() {
        uni.showToast({ title: "添加计划功能开发中", icon: "none" });
      }
      const __returned__ = { loaded, weeks, today, curYear, curMonth, selectedDate, formatDate, calendarDays, allPlans, addDays, selectedPlans, selectedLabel, selectDate, prevMonth, nextMonth, toggleDone, goBack, addPlan, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, nextTick: vue.nextTick };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "plans-page" }, [
      vue.createElementVNode("view", { class: "bg-decor" }, [
        vue.createElementVNode("view", { class: "bg-ball b1" }),
        vue.createElementVNode("view", { class: "bg-ball b2" })
      ]),
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("view", {
          class: "nav-back",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#333" } }, "‹")
        ]),
        vue.createElementVNode("text", { class: "nav-title" }, "我的计划"),
        vue.createElementVNode("view", {
          class: "nav-add",
          onClick: $setup.addPlan
        }, [
          vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#4facfe" } }, "＋")
        ])
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["calendar-card", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", { class: "month-row" }, [
            vue.createElementVNode("view", {
              class: "month-arrow",
              onClick: $setup.prevMonth
            }, [
              vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#333" } }, "‹")
            ]),
            vue.createElementVNode(
              "text",
              { class: "month-title" },
              vue.toDisplayString($setup.curYear) + "年" + vue.toDisplayString($setup.curMonth) + "月",
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "month-arrow",
              onClick: $setup.nextMonth
            }, [
              vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#333" } }, "›")
            ])
          ]),
          vue.createElementVNode("view", { class: "week-header" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.weeks, (w) => {
                return vue.createElementVNode(
                  "text",
                  {
                    class: "week-cell",
                    key: w
                  },
                  vue.toDisplayString(w),
                  1
                  /* TEXT */
                );
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "days-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.calendarDays, (d, i) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: i,
                  class: vue.normalizeClass(["day-cell", {
                    empty: !d.day,
                    today: d.isToday,
                    selected: d.full === $setup.selectedDate,
                    hasPlan: d.hasPlan
                  }]),
                  onClick: ($event) => d.day && $setup.selectDate(d.full)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "day-num" },
                    vue.toDisplayString(d.day || ""),
                    1
                    /* TEXT */
                  ),
                  d.hasPlan && d.day ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "day-dot"
                  })) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ],
        2
        /* CLASS */
      ),
      $setup.selectedDate ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "selected-header"
      }, [
        vue.createElementVNode(
          "text",
          { class: "selected-label" },
          vue.toDisplayString($setup.selectedLabel),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "selected-count" },
          vue.toDisplayString($setup.selectedPlans.length) + " 项计划",
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("scroll-view", {
        class: "plan-scroll",
        "scroll-y": "",
        bounces: false,
        "show-scrollbar": false
      }, [
        vue.createElementVNode("view", { class: "plan-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.selectedPlans, (p, pi) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: p.id,
                  class: vue.normalizeClass(["plan-card", { show: $setup.loaded }]),
                  style: vue.normalizeStyle({ transitionDelay: pi * 0.08 + "s" })
                },
                [
                  vue.createElementVNode("view", { class: "plan-left" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "plan-color-bar",
                        style: vue.normalizeStyle({ background: p.color })
                      },
                      null,
                      4
                      /* STYLE */
                    ),
                    vue.createElementVNode("view", { class: "plan-info" }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["plan-name", { done: p.done }])
                        },
                        vue.toDisplayString(p.name),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode("view", { class: "plan-meta" }, [
                        vue.createElementVNode("text", { style: { "font-size": "22rpx" } }, "⏰"),
                        vue.createElementVNode(
                          "text",
                          { class: "plan-time" },
                          vue.toDisplayString(p.time),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]),
                  vue.createElementVNode("view", {
                    class: vue.normalizeClass(["plan-check", { done: p.done }]),
                    onClick: ($event) => $setup.toggleDone(p)
                  }, [
                    p.done ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      style: { "font-size": "28rpx", "color": "#fff" }
                    }, "✔")) : vue.createCommentVNode("v-if", true)
                  ], 10, ["onClick"])
                ],
                6
                /* CLASS, STYLE */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $setup.selectedPlans.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty"
          }, [
            vue.createElementVNode("text", { style: { "font-size": "60rpx", "opacity": "0.3" } }, "📅"),
            vue.createElementVNode("text", { class: "empty-text" }, "这一天还没有计划"),
            vue.createElementVNode("text", { class: "empty-sub" }, "点击右上角 + 添加")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const PagesPlansPlans = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-80c07444"], ["__file", "E:/HTML/ai_grow/pages/plans/plans.vue"]]);
  const _sfc_main$6 = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      let splashPlayed = false;
      const loaded = vue.ref(false);
      const splashReady = vue.ref(false);
      const splashHide = vue.ref(false);
      const textShow = vue.ref(false);
      const subShow = vue.ref(false);
      const progressGo = vue.ref(false);
      const rippleShow = vue.ref(false);
      const shapeShow = vue.ref(false);
      const waveShow = vue.ref(false);
      const showPw = vue.ref(false);
      const logging = vue.ref(false);
      const titleChars = vue.ref([
        { ch: "R", show: false },
        { ch: "E", show: false },
        { ch: "D", show: false },
        { ch: "S", show: false },
        { ch: "P", show: false },
        { ch: "I", show: false },
        { ch: "D", show: false },
        { ch: "E", show: false },
        { ch: "R", show: false }
      ]);
      function showTitleChars() {
        titleChars.value.forEach((item, i) => {
          setTimeout(() => {
            item.show = true;
          }, i * 180);
        });
      }
      const loginForm = vue.ref({ email: "", password: "" });
      const canLogin = vue.computed(() => {
        return loginForm.value.email && loginForm.value.password && !logging.value;
      });
      if (splashPlayed) {
        splashHide.value = true;
        loaded.value = true;
      } else {
        splashPlayed = true;
        setTimeout(() => {
          rippleShow.value = true;
        }, 200);
        setTimeout(() => {
          splashReady.value = true;
        }, 500);
        setTimeout(() => {
          shapeShow.value = true;
        }, 800);
        setTimeout(() => {
          showTitleChars();
        }, 1200);
        setTimeout(() => {
          subShow.value = true;
        }, 2400);
        setTimeout(() => {
          waveShow.value = true;
        }, 2600);
        setTimeout(() => {
          progressGo.value = true;
        }, 2800);
        setTimeout(() => {
          splashHide.value = true;
        }, 4800);
        setTimeout(() => {
          loaded.value = true;
        }, 5100);
      }
      async function onLogin() {
        if (!canLogin.value) {
          uni.showToast({ title: "请填写完整信息", icon: "none" });
          return;
        }
        logging.value = true;
        try {
          const res = await login(loginForm.value.email, loginForm.value.password);
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => uni.reLaunch({ url: "/pages/index/index" }), 1e3);
        } catch (e) {
          uni.showToast({ title: e.message || "登录失败", icon: "none" });
        } finally {
          logging.value = false;
        }
      }
      function goRegister() {
        uni.navigateTo({ url: "/pages/register/register" });
      }
      function onForgotPw() {
        uni.navigateTo({ url: "/pages/forgot/forgot" });
      }
      const __returned__ = { get splashPlayed() {
        return splashPlayed;
      }, set splashPlayed(v) {
        splashPlayed = v;
      }, loaded, splashReady, splashHide, textShow, subShow, progressGo, rippleShow, shapeShow, waveShow, showPw, logging, titleChars, showTitleChars, loginForm, canLogin, onLogin, goRegister, onForgotPw, ref: vue.ref, computed: vue.computed, get login() {
        return login;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-page" }, [
      vue.createElementVNode("view", { class: "bg-bubbles" }, [
        vue.createElementVNode("view", { class: "bubble b1" }),
        vue.createElementVNode("view", { class: "bubble b2" }),
        vue.createElementVNode("view", { class: "bubble b3" }),
        vue.createElementVNode("view", { class: "bubble b4" }),
        vue.createElementVNode("view", { class: "bubble b5" })
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["splash", { hide: $setup.splashHide }])
        },
        [
          !$setup.splashHide ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "particles"
          }, [
            vue.createElementVNode("view", { class: "particle p1" }),
            vue.createElementVNode("view", { class: "particle p2" }),
            vue.createElementVNode("view", { class: "particle p3" }),
            vue.createElementVNode("view", { class: "particle p4" }),
            vue.createElementVNode("view", { class: "particle p5" }),
            vue.createElementVNode("view", { class: "particle p6" }),
            vue.createElementVNode("view", { class: "particle p7" }),
            vue.createElementVNode("view", { class: "particle p8" }),
            vue.createElementVNode("view", { class: "particle p9" }),
            vue.createElementVNode("view", { class: "particle p10" }),
            vue.createElementVNode("view", { class: "particle p11" }),
            vue.createElementVNode("view", { class: "particle p12" })
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["ripple r1", { show: $setup.rippleShow }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["ripple r2", { show: $setup.rippleShow }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["ripple r3", { show: $setup.rippleShow }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["ring ring-outer", { show: $setup.splashReady }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["ring ring-inner", { show: $setup.splashReady }])
            },
            null,
            2
            /* CLASS */
          ),
          !$setup.splashHide ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "shapes"
          }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["shape s1", { show: $setup.shapeShow }])
              },
              null,
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["shape s2", { show: $setup.shapeShow }])
              },
              null,
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["shape s3", { show: $setup.shapeShow }])
              },
              null,
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["shape s4", { show: $setup.shapeShow }])
              },
              null,
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["shape s5", { show: $setup.shapeShow }])
              },
              null,
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["shape s6", { show: $setup.shapeShow }])
              },
              null,
              2
              /* CLASS */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["splash-center", { show: $setup.splashReady }])
            },
            [
              vue.createElementVNode("view", { class: "robot-glow" }),
              vue.createElementVNode("view", { class: "robot-glow g2" }),
              vue.createElementVNode("text", {
                class: "splash-robot",
                style: { "font-size": "140rpx" }
              }, "🤖")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode("view", { class: "splash-title-wrap" }, [
            vue.createElementVNode("view", { class: "splash-title" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.titleChars, (item, ci) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: ci,
                      class: vue.normalizeClass(["title-char", { visible: item.show }])
                    },
                    vue.toDisplayString(item.ch),
                    3
                    /* TEXT, CLASS */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["splash-sub-wrap", { show: $setup.subShow }])
            },
            [
              vue.createElementVNode("text", { class: "splash-sub" }, "你的智能成长助手")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["splash-progress", { show: $setup.splashReady }])
            },
            [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["progress-bar", { go: $setup.progressGo }])
                },
                null,
                2
                /* CLASS */
              )
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["wave-wrap", { show: $setup.waveShow }])
            },
            [
              vue.createElementVNode("view", { class: "wave wave1" }),
              vue.createElementVNode("view", { class: "wave wave2" })
            ],
            2
            /* CLASS */
          )
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["content", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", { class: "title-area" }, [
            vue.createElementVNode("text", { class: "title" }, "欢迎回来"),
            vue.createElementVNode("text", { class: "subtitle" }, "登录你的 REDSPIDER 账号")
          ]),
          vue.createElementVNode("view", { class: "form-card" }, [
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "✉")
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.loginForm.email = $event),
                  type: "text",
                  placeholder: "请输入邮箱",
                  "placeholder-class": "ph"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.loginForm.email]
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "🔒")
              ]),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.loginForm.password = $event),
                placeholder: "请输入密码",
                "placeholder-class": "ph",
                password: !$setup.showPw
              }, null, 8, ["password"]), [
                [vue.vModelText, $setup.loginForm.password]
              ]),
              vue.createElementVNode("view", {
                class: "toggle-pw",
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.showPw = !$setup.showPw)
              }, [
                vue.createElementVNode(
                  "text",
                  { style: { "font-size": "24rpx", "color": "#bbb" } },
                  vue.toDisplayString($setup.showPw ? "隐藏" : "显示"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "forgot-link" }, [
              vue.createElementVNode("text", { onClick: $setup.onForgotPw }, "忘记密码？")
            ]),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["btn-login", { active: $setup.canLogin }]),
                onClick: $setup.onLogin
              },
              [
                vue.createElementVNode("text", { class: "btn-text" }, "登 录")
              ],
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "bottom-area" }, [
            vue.createElementVNode("text", { class: "bottom-text" }, "还没有账号？"),
            vue.createElementVNode("text", {
              class: "bottom-link",
              onClick: $setup.goRegister
            }, "去注册")
          ]),
          vue.createElementVNode("view", { class: "agreement" }, [
            vue.createElementVNode("text", null, "登录即代表同意《用户协议》《隐私政策》")
          ])
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-e4e4508d"], ["__file", "E:/HTML/ai_grow/pages/login/login.vue"]]);
  const _sfc_main$5 = {
    __name: "register",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const showPw = vue.ref(false);
      const countdown = vue.ref(0);
      const submitting = vue.ref(false);
      const form = vue.ref({ email: "", code: "", password: "", nickname: "" });
      const canRegister = vue.computed(() => {
        return form.value.email && form.value.code && form.value.password && form.value.nickname && !submitting.value;
      });
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
      });
      async function sendCode() {
        if (!form.value.email) {
          uni.showToast({ title: "请输入邮箱", icon: "none" });
          return;
        }
        try {
          await sendRegisterCode(form.value.email);
          uni.showToast({ title: "验证码已发送", icon: "none" });
          countdown.value = 60;
          const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0)
              clearInterval(timer);
          }, 1e3);
        } catch (e) {
          uni.showToast({ title: e.message || "发送失败", icon: "none" });
        }
      }
      async function onRegister() {
        if (!form.value.email || !form.value.code || !form.value.password || !form.value.nickname) {
          uni.showToast({ title: "请填写必要信息", icon: "none" });
          return;
        }
        submitting.value = true;
        try {
          await register({
            email: form.value.email,
            password: form.value.password,
            nickname: form.value.nickname,
            verificationCode: form.value.code
          });
          uni.showToast({ title: "注册成功", icon: "success" });
          setTimeout(() => {
            uni.reLaunch({ url: "/pages/index/index" });
          }, 1e3);
        } catch (e) {
          uni.showToast({ title: e.message || "注册失败", icon: "none" });
        } finally {
          submitting.value = false;
        }
      }
      function goLogin() {
        uni.navigateBack();
      }
      function goBack() {
        uni.navigateBack();
      }
      const __returned__ = { loaded, showPw, countdown, submitting, form, canRegister, sendCode, onRegister, goLogin, goBack, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, nextTick: vue.nextTick, get sendRegisterCode() {
        return sendRegisterCode;
      }, get register() {
        return register;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-page" }, [
      vue.createElementVNode("view", { class: "bg-bubbles" }, [
        vue.createElementVNode("view", { class: "bubble b1" }),
        vue.createElementVNode("view", { class: "bubble b2" }),
        vue.createElementVNode("view", { class: "bubble b3" }),
        vue.createElementVNode("view", { class: "bubble b4" }),
        vue.createElementVNode("view", { class: "bubble b5" })
      ]),
      vue.createElementVNode("view", {
        class: "back-btn",
        onClick: $setup.goBack
      }, [
        vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#333" } }, "‹")
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["content", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", { class: "title-area" }, [
            vue.createElementVNode("text", { class: "title" }, "创建账号"),
            vue.createElementVNode("text", { class: "subtitle" }, "加入 REDSPIDER，开始高效成长")
          ]),
          vue.createElementVNode("view", { class: "form-card" }, [
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "✉")
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.email = $event),
                  type: "text",
                  placeholder: "请输入邮箱",
                  "placeholder-class": "ph"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.form.email]
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group code-group" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "🛡️")
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.code = $event),
                  type: "number",
                  placeholder: "请输入验证码",
                  "placeholder-class": "ph"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.form.code]
              ]),
              vue.createElementVNode("button", {
                class: vue.normalizeClass(["btn-code", { disabled: $setup.countdown > 0 }]),
                disabled: $setup.countdown > 0,
                onClick: $setup.sendCode
              }, vue.toDisplayString($setup.countdown > 0 ? $setup.countdown + "s" : "获取验证码"), 11, ["disabled"])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "🔒")
              ]),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.password = $event),
                placeholder: "请输入密码",
                "placeholder-class": "ph",
                password: !$setup.showPw
              }, null, 8, ["password"]), [
                [vue.vModelText, $setup.form.password]
              ]),
              vue.createElementVNode("view", {
                class: "toggle-pw",
                onClick: _cache[3] || (_cache[3] = ($event) => $setup.showPw = !$setup.showPw)
              }, [
                vue.createElementVNode(
                  "text",
                  { style: { "font-size": "24rpx", "color": "#bbb" } },
                  vue.toDisplayString($setup.showPw ? "隐藏" : "显示"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "👤")
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.nickname = $event),
                  placeholder: "昵称（非必填）",
                  "placeholder-class": "ph"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.form.nickname]
              ])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["btn-register", { active: $setup.canRegister }]),
                onClick: $setup.onRegister
              },
              [
                vue.createElementVNode("text", { class: "btn-text" }, "注 册")
              ],
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "bottom-area" }, [
            vue.createElementVNode("text", { class: "bottom-text" }, "已有账号？"),
            vue.createElementVNode("text", {
              class: "bottom-link",
              onClick: $setup.goLogin
            }, "去登录")
          ]),
          vue.createElementVNode("view", { class: "agreement" }, [
            vue.createElementVNode("text", null, "注册即代表同意《用户协议》《隐私政策》")
          ])
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-bac4a35d"], ["__file", "E:/HTML/ai_grow/pages/register/register.vue"]]);
  const _sfc_main$4 = {
    __name: "forgot",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const step = vue.ref(1);
      const showPw = vue.ref(false);
      const showPw2 = vue.ref(false);
      const countdown = vue.ref(0);
      const successShow = vue.ref(false);
      const submitting = vue.ref(false);
      const form = vue.ref({
        email: "",
        code: "",
        password: "",
        confirmPassword: ""
      });
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
      });
      const canVerify = vue.computed(() => {
        return form.value.email && form.value.code && !submitting.value;
      });
      const canReset = vue.computed(() => {
        return form.value.password && form.value.confirmPassword && form.value.password === form.value.confirmPassword && !submitting.value;
      });
      const pwStrength = vue.computed(() => {
        const pw = form.value.password;
        if (!pw)
          return "";
        if (pw.length < 8)
          return "weak";
        if (pw.length < 10 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw))
          return "medium";
        return "strong";
      });
      const pwWidth = vue.computed(() => {
        const s = pwStrength.value;
        if (s === "weak")
          return "33%";
        if (s === "medium")
          return "66%";
        if (s === "strong")
          return "100%";
        return "0%";
      });
      const pwText = vue.computed(() => {
        const s = pwStrength.value;
        if (s === "weak")
          return "弱";
        if (s === "medium")
          return "中";
        if (s === "strong")
          return "强";
        return "";
      });
      async function sendCode() {
        if (!form.value.email) {
          uni.showToast({ title: "请输入邮箱", icon: "none" });
          return;
        }
        try {
          await sendResetCode(form.value.email);
          uni.showToast({ title: "验证码已发送", icon: "none" });
          countdown.value = 60;
          const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0)
              clearInterval(timer);
          }, 1e3);
        } catch (e) {
          uni.showToast({ title: e.message || "发送失败", icon: "none" });
        }
      }
      async function verifyCode() {
        if (!form.value.email) {
          uni.showToast({ title: "请输入邮箱", icon: "none" });
          return;
        }
        if (!form.value.code) {
          uni.showToast({ title: "请输入验证码", icon: "none" });
          return;
        }
        step.value = 2;
      }
      async function handleResetPassword() {
        if (!form.value.password || !form.value.confirmPassword) {
          uni.showToast({ title: "请填写完整信息", icon: "none" });
          return;
        }
        if (form.value.password !== form.value.confirmPassword) {
          uni.showToast({ title: "两次密码不一致", icon: "none" });
          return;
        }
        if (form.value.password.length < 8) {
          uni.showToast({ title: "密码至少8位", icon: "none" });
          return;
        }
        submitting.value = true;
        try {
          await resetPassword({
            account: form.value.email,
            verificationCode: form.value.code,
            newPassword: form.value.password
          });
          step.value = 3;
          setTimeout(() => {
            successShow.value = true;
          }, 200);
        } catch (e) {
          uni.showToast({ title: e.message || "重置失败", icon: "none" });
        } finally {
          submitting.value = false;
        }
      }
      function goLogin() {
        uni.navigateBack();
      }
      function goBack() {
        if (step.value > 1 && step.value < 3) {
          step.value--;
        } else {
          uni.navigateBack();
        }
      }
      const __returned__ = { loaded, step, showPw, showPw2, countdown, successShow, submitting, form, canVerify, canReset, pwStrength, pwWidth, pwText, sendCode, verifyCode, handleResetPassword, goLogin, goBack, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, nextTick: vue.nextTick, get sendResetCode() {
        return sendResetCode;
      }, get apiResetPassword() {
        return resetPassword;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "forgot-page" }, [
      vue.createElementVNode("view", { class: "bg-bubbles" }, [
        vue.createElementVNode("view", { class: "bubble b1" }),
        vue.createElementVNode("view", { class: "bubble b2" }),
        vue.createElementVNode("view", { class: "bubble b3" }),
        vue.createElementVNode("view", { class: "bubble b4" }),
        vue.createElementVNode("view", { class: "bubble b5" }),
        vue.createElementVNode("view", { class: "bubble b6" }),
        vue.createElementVNode("view", { class: "bubble b7" })
      ]),
      vue.createElementVNode("view", { class: "particles" }, [
        vue.createElementVNode("view", { class: "particle p1" }),
        vue.createElementVNode("view", { class: "particle p2" }),
        vue.createElementVNode("view", { class: "particle p3" }),
        vue.createElementVNode("view", { class: "particle p4" }),
        vue.createElementVNode("view", { class: "particle p5" }),
        vue.createElementVNode("view", { class: "particle p6" }),
        vue.createElementVNode("view", { class: "particle p7" }),
        vue.createElementVNode("view", { class: "particle p8" })
      ]),
      vue.createElementVNode("view", {
        class: "back-btn",
        onClick: $setup.goBack
      }, [
        vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#333" } }, "‹")
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["lock-area", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", { class: "lock-glow" }),
          vue.createElementVNode("view", { class: "lock-glow g2" }),
          vue.createElementVNode("text", { style: { "font-size": "60rpx", "color": "#7b6df0" } }, "🔒")
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["steps", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["step-item", { active: $setup.step >= 1, done: $setup.step > 1 }])
            },
            [
              vue.createElementVNode("view", { class: "step-dot" }, [
                $setup.step > 1 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "✓")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "1"))
              ]),
              vue.createElementVNode("text", { class: "step-label" }, "验证邮箱")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["step-line", { active: $setup.step > 1 }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["step-item", { active: $setup.step >= 2, done: $setup.step > 2 }])
            },
            [
              vue.createElementVNode("view", { class: "step-dot" }, [
                $setup.step > 2 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "✓")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "2"))
              ]),
              vue.createElementVNode("text", { class: "step-label" }, "重置密码")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["step-line", { active: $setup.step > 2 }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["step-item", { active: $setup.step >= 3 }])
            },
            [
              vue.createElementVNode("view", { class: "step-dot" }, [
                vue.createElementVNode("text", null, "3")
              ]),
              vue.createElementVNode("text", { class: "step-label" }, "完成")
            ],
            2
            /* CLASS */
          )
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["form-card", { show: $setup.loaded }])
        },
        [
          $setup.step === 1 ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 0,
              class: vue.normalizeClass(["step-content", { active: $setup.step === 1 }])
            },
            [
              vue.createElementVNode("view", { class: "step-title" }, [
                vue.createElementVNode("text", { class: "title" }, "验证邮箱"),
                vue.createElementVNode("text", { class: "desc" }, "输入注册邮箱，获取验证码")
              ]),
              vue.createElementVNode("view", { class: "input-group" }, [
                vue.createElementVNode("view", { class: "input-icon" }, [
                  vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "✉")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "form-input",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.email = $event),
                    type: "text",
                    placeholder: "请输入注册邮箱",
                    "placeholder-class": "ph"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.form.email]
                ])
              ]),
              vue.createElementVNode("view", { class: "input-group code-group" }, [
                vue.createElementVNode("view", { class: "input-icon" }, [
                  vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "🛡️")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "form-input",
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.code = $event),
                    type: "number",
                    placeholder: "请输入验证码",
                    "placeholder-class": "ph"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.form.code]
                ]),
                vue.createElementVNode("button", {
                  class: vue.normalizeClass(["btn-code", { disabled: $setup.countdown > 0 }]),
                  disabled: $setup.countdown > 0,
                  onClick: $setup.sendCode
                }, vue.toDisplayString($setup.countdown > 0 ? $setup.countdown + "s" : "获取验证码"), 11, ["disabled"])
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: vue.normalizeClass(["btn-submit", { active: $setup.canVerify }]),
                  onClick: $setup.verifyCode
                },
                [
                  vue.createElementVNode("text", { class: "btn-text" }, "下一步")
                ],
                2
                /* CLASS */
              )
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true),
          $setup.step === 2 ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: vue.normalizeClass(["step-content", { active: $setup.step === 2 }])
            },
            [
              vue.createElementVNode("view", { class: "step-title" }, [
                vue.createElementVNode("text", { class: "title" }, "重置密码"),
                vue.createElementVNode("text", { class: "desc" }, "设置你的新密码")
              ]),
              vue.createElementVNode("view", { class: "input-group" }, [
                vue.createElementVNode("view", { class: "input-icon" }, [
                  vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "🔒")
                ]),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.password = $event),
                  placeholder: "请输入新密码",
                  "placeholder-class": "ph",
                  password: !$setup.showPw
                }, null, 8, ["password"]), [
                  [vue.vModelText, $setup.form.password]
                ]),
                vue.createElementVNode("view", {
                  class: "toggle-pw",
                  onClick: _cache[3] || (_cache[3] = ($event) => $setup.showPw = !$setup.showPw)
                }, [
                  vue.createElementVNode(
                    "text",
                    { style: { "font-size": "24rpx", "color": "#bbb" } },
                    vue.toDisplayString($setup.showPw ? "隐藏" : "显示"),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "input-group" }, [
                vue.createElementVNode("view", { class: "input-icon" }, [
                  vue.createElementVNode("text", { style: { "font-size": "32rpx", "color": "#4facfe" } }, "🔒")
                ]),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.confirmPassword = $event),
                  placeholder: "请再次输入新密码",
                  "placeholder-class": "ph",
                  password: !$setup.showPw2
                }, null, 8, ["password"]), [
                  [vue.vModelText, $setup.form.confirmPassword]
                ]),
                vue.createElementVNode("view", {
                  class: "toggle-pw",
                  onClick: _cache[5] || (_cache[5] = ($event) => $setup.showPw2 = !$setup.showPw2)
                }, [
                  vue.createElementVNode(
                    "text",
                    { style: { "font-size": "24rpx", "color": "#bbb" } },
                    vue.toDisplayString($setup.showPw2 ? "隐藏" : "显示"),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              $setup.form.password ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "strength-bar"
              }, [
                vue.createElementVNode("view", { class: "strength-track" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["strength-fill", $setup.pwStrength]),
                      style: vue.normalizeStyle({ width: $setup.pwWidth })
                    },
                    null,
                    6
                    /* CLASS, STYLE */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["strength-text", $setup.pwStrength])
                  },
                  vue.toDisplayString($setup.pwText),
                  3
                  /* TEXT, CLASS */
                )
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "button",
                {
                  class: vue.normalizeClass(["btn-submit", { active: $setup.canReset }]),
                  onClick: $setup.handleResetPassword
                },
                [
                  vue.createElementVNode("text", { class: "btn-text" }, "重置密码")
                ],
                2
                /* CLASS */
              )
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true),
          $setup.step === 3 ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 2,
              class: vue.normalizeClass(["step-content success-content", { active: $setup.step === 3 }])
            },
            [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["success-icon", { show: $setup.successShow }])
                },
                [
                  vue.createElementVNode("text", { style: { "font-size": "80rpx", "color": "#6bcb77" } }, "✔")
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("text", { class: "success-title" }, "重置成功"),
              vue.createElementVNode("text", { class: "success-desc" }, "密码已重置，请使用新密码登录"),
              vue.createElementVNode("button", {
                class: "btn-submit active",
                onClick: $setup.goLogin
              }, [
                vue.createElementVNode("text", { class: "btn-text" }, "返回登录")
              ])
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true)
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["bottom-area", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("text", { class: "bottom-text" }, "想起密码了？"),
          vue.createElementVNode("text", {
            class: "bottom-link",
            onClick: $setup.goLogin
          }, "去登录")
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const PagesForgotForgot = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-51689b0a"], ["__file", "E:/HTML/ai_grow/pages/forgot/forgot.vue"]]);
  const _sfc_main$3 = {
    __name: "profile",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const uploading = vue.ref(false);
      const editVisible = vue.ref(false);
      const editNickname = vue.ref("");
      const saving = vue.ref(false);
      const avatarKey = vue.ref(0);
      const userInfo = vue.ref({ nickname: "", phone: "", uid: "", avatarUrl: "", weeklyHours: null });
      function fixAvatarUrl(url) {
        if (!url)
          return "";
        return url.replace(/^https?:\/\/[^\/]+/, BASE_URL);
      }
      const stats = vue.ref([
        { key: "hours", value: "-", label: "每周投入", bg: "rgba(79,172,254,0.1)", color: "#4facfe" },
        { key: "plans", value: "-", label: "完成计划", bg: "rgba(107,203,119,0.1)", color: "#6bcb77" },
        { key: "streak", value: "-", label: "连续打卡", bg: "rgba(255,165,0,0.1)", color: "#ffa500" },
        { key: "days", value: "-", label: "活跃天数", bg: "rgba(123,109,240,0.1)", color: "#7b6df0" }
      ]);
      const menus = [
        { key: "plan", label: "我的计划", bg: "rgba(79,172,254,0.1)", color: "#4facfe" },
        { key: "tasks", label: "我的任务", bg: "rgba(123,109,240,0.1)", color: "#7b6df0" },
        { key: "notifications", label: "通知中心", bg: "rgba(255,165,0,0.1)", color: "#ffa500" },
        { key: "stats", label: "数据统计", bg: "rgba(107,203,119,0.1)", color: "#6bcb77" },
        { key: "reminder", label: "提醒设置", bg: "rgba(255,165,0,0.1)", color: "#ffa500" },
        { key: "feedback", label: "意见反馈", bg: "rgba(123,109,240,0.1)", color: "#7b6df0" },
        { key: "theme", label: "主题设置", bg: "rgba(255,107,107,0.1)", color: "#ff6b6b" },
        { key: "about", label: "关于我们", bg: "rgba(0,242,254,0.1)", color: "#00c6fb" },
        { key: "delete", label: "注销账号", bg: "rgba(255,107,107,0.06)", color: "#ff6b6b" }
      ];
      async function loadUserInfo() {
        try {
          const res = await getUserInfo();
          userInfo.value = {
            nickname: res.nickname || "REDSPIDER用户",
            phone: res.phone || "",
            uid: res.uid || "",
            avatarUrl: fixAvatarUrl(res.avatarUrl),
            weeklyHours: res.weeklyHours
          };
          stats.value[0].value = res.weeklyHours != null ? res.weeklyHours + "h" : "-";
          uni.setStorageSync("userInfo", JSON.stringify(userInfo.value));
        } catch (e) {
          const info = uni.getStorageSync("userInfo");
          if (info) {
            try {
              const parsed = typeof info === "string" ? JSON.parse(info) : info;
              userInfo.value = { ...userInfo.value, ...parsed };
            } catch (e2) {
            }
          }
        }
      }
      vue.onMounted(() => {
        loadUserInfo();
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
      });
      function goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      }
      function chooseAvatar() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          crop: { width: 300, height: 300 },
          success: async (res) => {
            const filePath = res.tempFilePaths[0];
            uploading.value = true;
            try {
              const profile = await uploadAvatar(filePath);
              userInfo.value.avatarUrl = fixAvatarUrl(profile.avatarUrl);
              avatarKey.value++;
              uni.showToast({ title: "头像已更新", icon: "success" });
            } catch (e) {
              uni.showToast({ title: e.message || "上传失败", icon: "none" });
            } finally {
              uploading.value = false;
            }
          }
        });
      }
      function editProfile() {
        editNickname.value = userInfo.value.nickname === "REDSPIDER用户" ? "" : userInfo.value.nickname;
        editVisible.value = true;
      }
      async function saveProfile() {
        const nickname = editNickname.value.trim();
        if (!nickname) {
          uni.showToast({ title: "昵称不能为空", icon: "none" });
          return;
        }
        saving.value = true;
        try {
          const res = await updateProfile({ nickname });
          userInfo.value.nickname = res.nickname || nickname;
          editVisible.value = false;
          uni.showToast({ title: "已保存", icon: "success" });
        } catch (e) {
          uni.showToast({ title: e.message || "保存失败", icon: "none" });
        } finally {
          saving.value = false;
        }
      }
      function onMenu(key) {
        if (key === "plan") {
          uni.navigateTo({ url: "/pages/plans/plans" });
        } else if (key === "tasks") {
          uni.navigateTo({ url: "/pages/tasks/tasks" });
        } else if (key === "notifications") {
          uni.navigateTo({ url: "/pages/notifications/notifications" });
        } else if (key === "delete") {
          onDeleteAccount();
        } else {
          const labels = { stats: "数据统计", reminder: "提醒设置", feedback: "意见反馈", theme: "主题设置", about: "关于我们" };
          uni.showToast({ title: labels[key] + "功能开发中", icon: "none" });
        }
      }
      function onLogout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                await logout();
              } catch (e) {
              }
              uni.showToast({ title: "已退出登录", icon: "none" });
              setTimeout(() => {
                uni.reLaunch({ url: "/pages/index/index" });
              }, 800);
            }
          }
        });
      }
      function onDeleteAccount() {
        uni.showModal({
          title: "注销账号",
          content: "注销后账号将无法使用，确定要注销吗？",
          confirmColor: "#ff6b6b",
          success: async (res) => {
            if (res.confirm) {
              try {
                await deleteAccount();
                uni.showToast({ title: "账号已注销", icon: "none" });
                setTimeout(() => {
                  uni.reLaunch({ url: "/pages/index/index" });
                }, 800);
              } catch (e) {
                uni.showToast({ title: e.message || "操作失败", icon: "none" });
              }
            }
          }
        });
      }
      const __returned__ = { loaded, uploading, editVisible, editNickname, saving, avatarKey, userInfo, fixAvatarUrl, stats, menus, loadUserInfo, goBack, chooseAvatar, editProfile, saveProfile, onMenu, onLogout, onDeleteAccount, ref: vue.ref, onMounted: vue.onMounted, nextTick: vue.nextTick, get getUserInfo() {
        return getUserInfo;
      }, get apiLogout() {
        return logout;
      }, get uploadAvatar() {
        return uploadAvatar;
      }, get updateProfile() {
        return updateProfile;
      }, get deleteAccount() {
        return deleteAccount;
      }, get BASE_URL() {
        return BASE_URL;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-page" }, [
      vue.createElementVNode("view", { class: "bg-bubbles" }, [
        vue.createElementVNode("view", { class: "bubble b1" }),
        vue.createElementVNode("view", { class: "bubble b2" }),
        vue.createElementVNode("view", { class: "bubble b3" }),
        vue.createElementVNode("view", { class: "bubble b4" }),
        vue.createElementVNode("view", { class: "bubble b5" }),
        vue.createElementVNode("view", { class: "bubble b6" })
      ]),
      vue.createElementVNode("view", { class: "particles" }, [
        vue.createElementVNode("view", { class: "particle p1" }),
        vue.createElementVNode("view", { class: "particle p2" }),
        vue.createElementVNode("view", { class: "particle p3" }),
        vue.createElementVNode("view", { class: "particle p4" }),
        vue.createElementVNode("view", { class: "particle p5" }),
        vue.createElementVNode("view", { class: "particle p6" }),
        vue.createElementVNode("view", { class: "particle p7" }),
        vue.createElementVNode("view", { class: "particle p8" }),
        vue.createElementVNode("view", { class: "particle p9" })
      ]),
      vue.createElementVNode("view", {
        class: "back-btn",
        onClick: $setup.goBack
      }, [
        vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#333" } }, "‹")
      ]),
      vue.createElementVNode("scroll-view", {
        class: "profile-scroll",
        "scroll-y": "",
        bounces: false,
        "show-scrollbar": false
      }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["hero", { show: $setup.loaded }])
          },
          [
            vue.createElementVNode("view", { class: "hero-bg" }, [
              vue.createElementVNode("view", {
                class: "hero-wave",
                style: { "width": "100%", "height": "100%", "background": "linear-gradient(135deg,rgba(79,172,254,0.08),rgba(0,242,254,0.05))" }
              })
            ]),
            vue.createElementVNode("view", {
              class: "avatar-area",
              onClick: $setup.chooseAvatar
            }, [
              vue.createElementVNode("view", { class: "avatar-ring" }),
              vue.createElementVNode("view", { class: "avatar-ring ring2" }),
              vue.createElementVNode("view", { class: "avatar-box" }, [
                $setup.userInfo.avatarUrl ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  src: $setup.userInfo.avatarUrl + "?t=" + $setup.avatarKey,
                  class: "avatar-img",
                  mode: "aspectFill"
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("text", {
                  key: 1,
                  style: { "font-size": "48rpx", "color": "#4facfe" }
                }, "👤"))
              ]),
              vue.createElementVNode("view", { class: "avatar-edit-hint" }, [
                vue.createElementVNode("text", { style: { "font-size": "24rpx", "color": "#fff" } }, "📷")
              ])
            ]),
            vue.createElementVNode(
              "text",
              { class: "nickname" },
              vue.toDisplayString($setup.userInfo.nickname || "REDSPIDER用户"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "email" },
              vue.toDisplayString($setup.userInfo.phone || "未绑定手机号"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "edit-btn",
              onClick: $setup.editProfile
            }, [
              vue.createElementVNode("text", { style: { "font-size": "24rpx", "color": "#4facfe" } }, "✏️ 编辑资料")
            ])
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["stats-card", { show: $setup.loaded }])
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.stats, (s, i) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    class: vue.normalizeClass(["stat-item", { show: $setup.loaded }]),
                    key: i,
                    style: vue.normalizeStyle({ transitionDelay: i * 0.1 + 0.3 + "s" })
                  },
                  [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "stat-icon",
                        style: vue.normalizeStyle({ background: s.bg })
                      },
                      [
                        s.key === "plans" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          style: { "font-size": "32rpx" }
                        }, "✔")) : s.key === "days" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 1,
                          style: { "font-size": "32rpx" }
                        }, "📅")) : s.key === "streak" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 2,
                          style: { "font-size": "32rpx" }
                        }, "⚡")) : s.key === "hours" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 3,
                          style: { "font-size": "32rpx" }
                        }, "⏰")) : vue.createCommentVNode("v-if", true)
                      ],
                      4
                      /* STYLE */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(s.value),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-label" },
                      vue.toDisplayString(s.label),
                      1
                      /* TEXT */
                    )
                  ],
                  6
                  /* CLASS, STYLE */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["menu-card", { show: $setup.loaded }])
          },
          [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.menus, (m, i) => {
                return vue.createElementVNode("view", {
                  class: vue.normalizeClass(["menu-item", { show: $setup.loaded }]),
                  key: i,
                  style: vue.normalizeStyle({ transitionDelay: i * 0.08 + 0.5 + "s" }),
                  onClick: ($event) => $setup.onMenu(m.key)
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "menu-icon",
                      style: vue.normalizeStyle({ background: m.bg })
                    },
                    null,
                    4
                    /* STYLE */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "menu-label" },
                    vue.toDisplayString(m.label),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "menu-arrow" }, [
                    vue.createElementVNode("text", { style: { "font-size": "24rpx", "color": "#ccc" } }, "›")
                  ])
                ], 14, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["logout-area", { show: $setup.loaded }])
          },
          [
            vue.createElementVNode("button", {
              class: "btn-logout",
              onClick: $setup.onLogout
            }, [
              vue.createElementVNode("text", { style: { "font-size": "28rpx", "color": "#ff6b6b" } }, "🚪 退出登录")
            ])
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", { class: "safe-bottom" })
      ]),
      $setup.editVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-mask",
        onClick: _cache[3] || (_cache[3] = ($event) => $setup.editVisible = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-card",
          onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("text", { class: "modal-title" }, "编辑资料"),
          vue.createElementVNode("view", { class: "modal-input-group" }, [
            vue.createElementVNode("text", { class: "modal-label" }, "昵称"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "modal-input",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.editNickname = $event),
                placeholder: "请输入昵称",
                maxlength: "50",
                "placeholder-class": "modal-ph"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.editNickname]
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-actions" }, [
            vue.createElementVNode("button", {
              class: "modal-btn cancel",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.editVisible = false)
            }, "取消"),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["modal-btn confirm", { loading: $setup.saving }]),
              disabled: $setup.saving,
              onClick: $setup.saveProfile
            }, vue.toDisplayString($setup.saving ? "保存中..." : "保存"), 11, ["disabled"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-dd383ca2"], ["__file", "E:/HTML/ai_grow/pages/profile/profile.vue"]]);
  const _sfc_main$2 = {
    __name: "tasks",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const activeTab = vue.ref("");
      const tasks = vue.ref([]);
      const tabs = [
        { label: "全部", value: "" },
        { label: "进行中", value: "OPEN" },
        { label: "已完成", value: "DONE" },
        { label: "已取消", value: "CANCELLED" }
      ];
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
      });
      vue.onMounted(() => {
        loadTasks();
      });
      async function loadTasks() {
        loading.value = true;
        try {
          const res = await getMyTasks(activeTab.value || void 0);
          tasks.value = res.tasks || [];
        } catch (e) {
          tasks.value = [];
        } finally {
          loading.value = false;
        }
      }
      function switchTab(value) {
        activeTab.value = value;
        loadTasks();
      }
      function onRefresh() {
        refreshing.value = true;
        loadTasks().finally(() => {
          refreshing.value = false;
          uni.stopPullDownRefresh();
        });
      }
      function goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      }
      function onTaskTap(task) {
        uni.showToast({ title: task.title, icon: "none" });
      }
      function statusClass(status) {
        return { OPEN: "open", DONE: "done", CANCELLED: "cancelled" }[status] || "open";
      }
      function statusText(status) {
        return { OPEN: "进行中", DONE: "已完成", CANCELLED: "已取消" }[status] || "进行中";
      }
      const __returned__ = { loaded, loading, refreshing, activeTab, tasks, tabs, loadTasks, switchTab, onRefresh, goBack, onTaskTap, statusClass, statusText, ref: vue.ref, onMounted: vue.onMounted, nextTick: vue.nextTick, get getMyTasks() {
        return getMyTasks;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "tasks-page" }, [
      vue.createElementVNode("view", { class: "bg-bubbles" }, [
        vue.createElementVNode("view", { class: "bubble b1" }),
        vue.createElementVNode("view", { class: "bubble b2" }),
        vue.createElementVNode("view", { class: "bubble b3" }),
        vue.createElementVNode("view", { class: "bubble b4" }),
        vue.createElementVNode("view", { class: "bubble b5" })
      ]),
      vue.createElementVNode("view", {
        class: "back-btn",
        onClick: $setup.goBack
      }, [
        vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#333" } }, "‹")
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["header", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("text", { class: "title" }, "我的任务"),
          vue.createElementVNode("text", { class: "subtitle" }, "管理你的待办事项")
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["tab-bar", { show: $setup.loaded }])
        },
        [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.tabs, (tab) => {
              return vue.createElementVNode("view", {
                class: vue.normalizeClass(["tab-pill", { active: $setup.activeTab === tab.value }]),
                key: tab.value,
                onClick: ($event) => $setup.switchTab(tab.value)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(tab.label),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("scroll-view", {
        class: "task-scroll",
        "scroll-y": "",
        bounces: false,
        "show-scrollbar": false,
        "refresher-enabled": true,
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.onRefresh
      }, [
        $setup.tasks.length === 0 && !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { style: { "font-size": "80rpx", "opacity": "0.3" } }, "📋"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无任务"),
          vue.createElementVNode("text", { class: "empty-sub" }, "与 AI 对话，创建你的第一个任务")
        ])) : vue.createCommentVNode("v-if", true),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tasks, (task, i) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["task-card", { show: $setup.loaded }]),
              key: task.id,
              style: vue.normalizeStyle({ transitionDelay: i * 0.08 + "s" }),
              onClick: ($event) => $setup.onTaskTap(task)
            }, [
              vue.createElementVNode("view", { class: "task-left" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["task-status-dot", $setup.statusClass(task.status)])
                  },
                  null,
                  2
                  /* CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "task-body" }, [
                vue.createElementVNode(
                  "text",
                  { class: "task-title" },
                  vue.toDisplayString(task.title),
                  1
                  /* TEXT */
                ),
                task.description ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "task-desc"
                  },
                  vue.toDisplayString(task.description),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", { class: "task-meta" }, [
                  task.dueDate ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "meta-item"
                  }, [
                    vue.createElementVNode("text", { style: { "font-size": "22rpx" } }, "⏰"),
                    vue.createElementVNode(
                      "text",
                      { class: "meta-text" },
                      vue.toDisplayString(task.dueDate),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["task-tag", $setup.statusClass(task.status)])
                    },
                    vue.toDisplayString($setup.statusText(task.status)),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ])
            ], 14, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesTasksTasks = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-027feebf"], ["__file", "E:/HTML/ai_grow/pages/tasks/tasks.vue"]]);
  const _sfc_main$1 = {
    __name: "notifications",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const notifications = vue.ref([]);
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
      });
      vue.onMounted(() => {
        loadNotifications();
      });
      async function loadNotifications() {
        loading.value = true;
        try {
          const res = await getNotifications();
          notifications.value = res.items || [];
        } catch (e) {
          notifications.value = [];
        } finally {
          loading.value = false;
        }
      }
      function onRefresh() {
        refreshing.value = true;
        loadNotifications().finally(() => {
          refreshing.value = false;
          uni.stopPullDownRefresh();
        });
      }
      async function onReadAll() {
        try {
          await markAllNotificationsRead();
          notifications.value.forEach((n) => {
            if (!n.readAt)
              n.readAt = (/* @__PURE__ */ new Date()).toISOString();
          });
          store.unreadCount = 0;
          uni.showToast({ title: "已全部标记已读", icon: "none" });
        } catch (e) {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      }
      async function onTapNotify(item) {
        if (!item.readAt) {
          try {
            await markNotificationRead(item.id);
            item.readAt = (/* @__PURE__ */ new Date()).toISOString();
            if (store.unreadCount > 0)
              store.unreadCount--;
          } catch (e) {
          }
        }
        if (item.taskId) {
          uni.navigateTo({ url: "/pages/tasks/tasks" });
        }
      }
      function goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      }
      function iconClass(type) {
        return type === "TASK_DUE_REMINDER" ? "icon-task" : "icon-info";
      }
      function formatTime(dateStr) {
        if (!dateStr)
          return "";
        const d = new Date(dateStr);
        const now = /* @__PURE__ */ new Date();
        const diff = now - d;
        if (diff < 6e4)
          return "刚刚";
        if (diff < 36e5)
          return Math.floor(diff / 6e4) + "分钟前";
        if (diff < 864e5)
          return Math.floor(diff / 36e5) + "小时前";
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return month + "月" + day + "日";
      }
      const __returned__ = { loaded, loading, refreshing, notifications, loadNotifications, onRefresh, onReadAll, onTapNotify, goBack, iconClass, formatTime, ref: vue.ref, onMounted: vue.onMounted, nextTick: vue.nextTick, get getNotifications() {
        return getNotifications;
      }, get markNotificationRead() {
        return markNotificationRead;
      }, get markAllNotificationsRead() {
        return markAllNotificationsRead;
      }, get store() {
        return store;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "notify-page" }, [
      vue.createElementVNode("view", { class: "bg-bubbles" }, [
        vue.createElementVNode("view", { class: "bubble b1" }),
        vue.createElementVNode("view", { class: "bubble b2" }),
        vue.createElementVNode("view", { class: "bubble b3" }),
        vue.createElementVNode("view", { class: "bubble b4" }),
        vue.createElementVNode("view", { class: "bubble b5" })
      ]),
      vue.createElementVNode("view", {
        class: "back-btn",
        onClick: $setup.goBack
      }, [
        vue.createElementVNode("text", { style: { "font-size": "36rpx", "color": "#333" } }, "‹")
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["header", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode("view", { class: "header-row" }, [
            vue.createElementVNode("view", { class: "header-texts" }, [
              vue.createElementVNode("text", { class: "title" }, "通知中心"),
              vue.createElementVNode("text", { class: "subtitle" }, "查看所有消息提醒")
            ]),
            $setup.notifications.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "read-all-btn",
              onClick: $setup.onReadAll
            }, [
              vue.createElementVNode("text", { style: { "font-size": "26rpx", "color": "#4facfe" } }, "✔"),
              vue.createElementVNode("text", null, "全部已读")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("scroll-view", {
        class: "notify-scroll",
        "scroll-y": "",
        bounces: false,
        "show-scrollbar": false,
        "refresher-enabled": true,
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.onRefresh
      }, [
        $setup.notifications.length === 0 && !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { style: { "font-size": "80rpx", "opacity": "0.3" } }, "📋"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无通知"),
          vue.createElementVNode("text", { class: "empty-sub" }, "有新消息时会在这里提醒你")
        ])) : vue.createCommentVNode("v-if", true),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.notifications, (item, i) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["notify-card", [{ unread: !item.readAt }, { show: $setup.loaded }]]),
              key: item.id,
              style: vue.normalizeStyle({ transitionDelay: i * 0.06 + "s" }),
              onClick: ($event) => $setup.onTapNotify(item)
            }, [
              !item.readAt ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "notify-dot"
              })) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["notify-icon", $setup.iconClass(item.type)])
                },
                [
                  item.type === "TASK_DUE_REMINDER" ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    style: { "font-size": "32rpx" }
                  }, "🔔")) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    style: { "font-size": "32rpx" }
                  }, "ℹ️"))
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("view", { class: "notify-body" }, [
                vue.createElementVNode(
                  "text",
                  { class: "notify-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "notify-text" },
                  vue.toDisplayString(item.body),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "notify-time" },
                  vue.toDisplayString($setup.formatTime(item.createdAt)),
                  1
                  /* TEXT */
                )
              ])
            ], 14, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesNotificationsNotifications = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-e30a2353"], ["__file", "E:/HTML/ai_grow/pages/notifications/notifications.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/plans/plans", PagesPlansPlans);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/forgot/forgot", PagesForgotForgot);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/tasks/tasks", PagesTasksTasks);
  __definePage("pages/notifications/notifications", PagesNotificationsNotifications);
  let socketTask = null;
  let reconnectTimer = null;
  let listeners = [];
  let isConnected = false;
  function getWsUrl() {
    const token = getAccessToken();
    if (!token)
      return null;
    const wsBase = BASE_URL.replace(/^http/, "ws");
    return wsBase + "/ws/v1/chat?token=" + encodeURIComponent(token);
  }
  function connect() {
    if (isConnected)
      return;
    const url = getWsUrl();
    if (!url)
      return;
    socketTask = uni.connectSocket({ url, complete: () => {
    } });
    socketTask.onOpen(() => {
      isConnected = true;
    });
    socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        listeners.forEach((fn) => fn(data));
      } catch (e) {
      }
    });
    socketTask.onClose(() => {
      isConnected = false;
      scheduleReconnect();
    });
    socketTask.onError(() => {
      isConnected = false;
      scheduleReconnect();
    });
  }
  function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      const token = getAccessToken();
      if (token)
        connect();
    }, 3e3);
  }
  function onMessage(fn) {
    listeners.push(fn);
  }
  const _sfc_main = {
    onLaunch: function() {
      if (getAccessToken()) {
        connect();
        onMessage((data) => {
          if (data.unreadCount !== void 0) {
            store.unreadCount = data.unreadCount;
          }
        });
      }
    },
    onShow: function() {
      if (getAccessToken()) {
        connect();
      }
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/HTML/ai_grow/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
