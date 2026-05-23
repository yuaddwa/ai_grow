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
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LOAD = "onLoad";
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
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onHide = /* @__PURE__ */ createLifeCycleHook(
    ON_HIDE,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const scriptRel = "modulepreload";
  const assetsURL = function(dep) {
    return "/" + dep;
  };
  const seen = {};
  const __vitePreload = function preload(baseModule, deps, importerUrl) {
    let promise = Promise.resolve();
    if (false) {
      const links = document.getElementsByTagName("link");
      const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
      const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
      promise = Promise.all(deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen)
          return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        const isBaseRelative = !!importerUrl;
        if (isBaseRelative) {
          for (let i = links.length - 1; i >= 0; i--) {
            const link2 = links[i];
            if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
              return;
            }
          }
        } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
          link.crossOrigin = "";
        }
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
          });
        }
      }));
    }
    return promise.then(() => baseModule()).catch((err) => {
      const e = new Event("vite:preloadError", { cancelable: true });
      e.payload = err;
      window.dispatchEvent(e);
      if (!e.defaultPrevented) {
        throw err;
      }
    });
  };
  const CACHE_KEY = "ai_chat_sessions_cache";
  const CURRENT_KEY = "ai_chat_current_session_id";
  const MAX_CACHED_SESSIONS = 10;
  function readCache() {
    try {
      const raw = uni.getStorageSync(CACHE_KEY);
      return raw && typeof raw === "object" ? raw : {};
    } catch (e) {
      return {};
    }
  }
  function writeCache(map) {
    uni.setStorageSync(CACHE_KEY, map);
  }
  function isSessionCached(sessionId) {
    const map = readCache();
    const data = map[String(sessionId)];
    return !!(data && Array.isArray(data.messages) && data.messages.length > 0);
  }
  function getCachedSession(sessionId) {
    const map = readCache();
    return map[String(sessionId)] || null;
  }
  function setCachedSession(sessionId, data) {
    if (!sessionId || !data)
      return;
    const id = String(sessionId);
    const map = readCache();
    map[id] = {
      sessionId: data.sessionId ?? sessionId,
      sessionTitle: data.sessionTitle || "新对话",
      messages: data.messages || [],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const keys = Object.keys(map);
    if (keys.length > MAX_CACHED_SESSIONS) {
      const sorted = keys.sort((a, b) => {
        const ta = new Date(map[a] && map[a].updatedAt || 0).getTime();
        const tb = new Date(map[b] && map[b].updatedAt || 0).getTime();
        return tb - ta;
      });
      while (Object.keys(map).length > MAX_CACHED_SESSIONS) {
        const removeKey = sorted.pop();
        if (removeKey && removeKey !== id)
          delete map[removeKey];
        else
          break;
      }
    }
    writeCache(map);
  }
  function saveCurrentSessionId(sessionId) {
    if (sessionId)
      uni.setStorageSync(CURRENT_KEY, sessionId);
  }
  function getCurrentSessionId() {
    const v = uni.getStorageSync(CURRENT_KEY);
    return v || null;
  }
  function clearCurrentSessionId() {
    uni.removeStorageSync(CURRENT_KEY);
  }
  function clearAllChatHistory() {
    uni.removeStorageSync(CACHE_KEY);
    uni.removeStorageSync(CURRENT_KEY);
  }
  const STORAGE_KEY = "clientDeviceId";
  function getOrCreateDeviceId() {
    let id = uni.getStorageSync(STORAGE_KEY);
    if (id && typeof id === "string" && id.length <= 64)
      return id;
    id = "d_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
    if (id.length > 64)
      id = id.slice(0, 64);
    uni.setStorageSync(STORAGE_KEY, id);
    return id;
  }
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
    clearAllChatHistory();
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
            __vitePreload(() => Promise.resolve().then(() => websocket), false ? "__VITE_PRELOAD__" : void 0).then((m) => m.reconnect());
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
    const deviceId = getOrCreateDeviceId();
    const pushUrl = allDevices ? "/api/v1/users/me/push-tokens" : "/api/v1/users/me/push-tokens?deviceId=" + encodeURIComponent(deviceId);
    return request({ url: pushUrl, method: "DELETE", auth: true }).catch(() => {
    }).then(() => request({
      url: "/api/v1/auth/logout",
      data: { allDevices },
      auth: true
    })).catch(() => {
    }).finally(() => {
      __vitePreload(() => Promise.resolve().then(() => websocket), false ? "__VITE_PRELOAD__" : void 0).then((m) => m.disconnect());
      clearTokens();
    });
  }
  function registerPushToken({ platform, token, deviceId }) {
    return request({
      url: "/api/v1/users/me/push-tokens",
      method: "PUT",
      data: { platform, token, deviceId },
      auth: true
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
            formatAppLog("error", "at utils/api.js:314", "transcribeAudio upload fail:", msg);
            if (msg.includes("exceed max upload") && tried < 3) {
              tried++;
              formatAppLog("warn", "at utils/api.js:317", "uploadFile retry", tried, "in", tried * 500, "ms");
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
  function getChatSessions(page = 0, size = 20) {
    return request({
      url: "/api/v1/ai/chat/sessions?page=" + page + "&size=" + size,
      method: "GET",
      auth: true
    });
  }
  function getChatMessages(sessionId, page = 0, size = 50) {
    return request({
      url: "/api/v1/ai/chat/sessions/" + sessionId + "/messages?page=" + page + "&size=" + size,
      method: "GET",
      auth: true
    });
  }
  function fetchAllChatMessages(sessionId, size = 50) {
    let page = 0;
    let allMessages = [];
    let sessionTitle = "";
    let sessionIdOut = sessionId;
    let hasNext = true;
    const loadPage = () => {
      return getChatMessages(sessionId, page, size).then((data) => {
        sessionTitle = data.sessionTitle || sessionTitle;
        sessionIdOut = data.sessionId != null ? data.sessionId : sessionIdOut;
        const batch = data.messages || [];
        allMessages = allMessages.concat(batch);
        hasNext = !!data.hasNext;
        if (hasNext) {
          page += 1;
          if (page > 200)
            return { sessionId: sessionIdOut, sessionTitle, messages: allMessages };
          return loadPage();
        }
        return { sessionId: sessionIdOut, sessionTitle, messages: allMessages };
      });
    };
    return loadPage();
  }
  function resolveMediaUrl(url) {
    if (!url)
      return "";
    if (/^(https?:|wxfile:|file:|blob:|data:)/.test(url))
      return url;
    return BASE_URL + (url.startsWith("/") ? url : "/" + url);
  }
  function getPlanProposal(proposalId) {
    return request({
      url: "/api/v1/growth/plan-proposals/" + proposalId,
      method: "GET",
      auth: true
    });
  }
  function getPlanProposalsBySession(sessionId) {
    return request({
      url: "/api/v1/growth/plan-proposals?sessionId=" + sessionId,
      method: "GET",
      auth: true
    });
  }
  function confirmPlanProposal(proposalId) {
    return request({
      url: "/api/v1/growth/plan-proposals/" + proposalId + "/confirm",
      method: "POST",
      data: {},
      auth: true
    });
  }
  function rejectPlanProposal(proposalId) {
    return request({
      url: "/api/v1/growth/plan-proposals/" + proposalId + "/reject",
      method: "POST",
      data: {},
      auth: true
    });
  }
  function getGrowthTasksByDate(date) {
    return request({
      url: "/api/v1/users/me/growth-tasks?date=" + encodeURIComponent(date),
      method: "GET",
      auth: true
    });
  }
  function startGrowthTask(taskId) {
    return request({
      url: "/api/v1/users/me/growth-tasks/" + taskId + "/start",
      method: "POST",
      data: {},
      auth: true
    });
  }
  function completeGrowthTask$1(taskId, data = {}) {
    return request({
      url: "/api/v1/users/me/growth-tasks/" + taskId + "/complete",
      method: "POST",
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
  function getNotifications(unreadOnly = false) {
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
  const growthTaskSession = vue.reactive({
    active: false,
    minimized: false,
    onFocusPage: false,
    task: null,
    tick: 0
  });
  const QUOTES = [
    "专注的每一分钟，都在为更好的自己蓄力。",
    "不必和别人比，今天比昨天更进一步就够了。",
    "行动是治愈焦虑最好的方式，你已经在路上了。",
    "坚持不是不累，而是累了仍然选择继续。",
    "把眼前这一件事做好，就是最好的成长策略。",
    "你比想象中更有力量，再专注一会儿试试。",
    "慢一点没关系，重要的是你没有停下来。",
    "每一次认真完成，都会让你更靠近目标。",
    "此刻的专注，是未来感谢现在的理由。",
    "相信自己，你正在变成更自律、更优秀的人。",
    "完成比完美更重要，先把它做完！",
    "呼吸、专注、行动——这就是进步的节奏。"
  ];
  let tickTimer = null;
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function normalizeGrowthTask(task) {
    if (!task)
      return null;
    return {
      id: task.id,
      title: task.title || task.name || "成长任务",
      description: task.description || "",
      scheduledDate: task.scheduledDate || task.date || "",
      startedAt: task.startedAt || "",
      plannedEndAt: task.plannedEndAt || "",
      estimatedMinutes: task.estimatedMinutes,
      status: task.status || "IN_PROGRESS"
    };
  }
  function formatCountdown(ms) {
    const total = Math.max(0, Math.ceil(ms / 1e3));
    const h = Math.floor(total / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;
    if (h > 0)
      return `${h}:${pad2(m)}:${pad2(s)}`;
    return `${pad2(m)}:${pad2(s)}`;
  }
  function getRemainingMs() {
    void growthTaskSession.tick;
    const task = growthTaskSession.task;
    if (!(task == null ? void 0 : task.plannedEndAt))
      return 0;
    const end = new Date(task.plannedEndAt).getTime();
    if (Number.isNaN(end))
      return 0;
    return Math.max(0, end - Date.now());
  }
  function getElapsedMs() {
    void growthTaskSession.tick;
    const task = growthTaskSession.task;
    if (!(task == null ? void 0 : task.startedAt))
      return 0;
    const start = new Date(task.startedAt).getTime();
    if (Number.isNaN(start))
      return 0;
    return Math.max(0, Date.now() - start);
  }
  function getProgressPercent() {
    void growthTaskSession.tick;
    const task = growthTaskSession.task;
    if (!task)
      return 0;
    const start = task.startedAt ? new Date(task.startedAt).getTime() : NaN;
    const end = task.plannedEndAt ? new Date(task.plannedEndAt).getTime() : NaN;
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start)
      return 0;
    const p = (Date.now() - start) / (end - start) * 100;
    return Math.min(100, Math.max(0, p));
  }
  function getCurrentQuote() {
    void growthTaskSession.tick;
    const idx = Math.floor(Date.now() / 8e3) % QUOTES.length;
    return QUOTES[idx];
  }
  function startTick() {
    stopTick();
    tickTimer = setInterval(() => {
      growthTaskSession.tick += 1;
      if (!growthTaskSession.active)
        return;
      const left = getRemainingMs();
      if (left <= 0 && growthTaskSession.task) {
        refreshActiveGrowthTask().catch(() => {
        });
      }
    }, 1e3);
  }
  function stopTick() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }
  function setActiveGrowthTask(task) {
    const normalized = normalizeGrowthTask(task);
    if (!normalized || normalized.status !== "IN_PROGRESS")
      return false;
    growthTaskSession.task = normalized;
    growthTaskSession.active = true;
    growthTaskSession.minimized = false;
    startTick();
    return true;
  }
  function clearActiveGrowthTask() {
    growthTaskSession.active = false;
    growthTaskSession.minimized = false;
    growthTaskSession.onFocusPage = false;
    growthTaskSession.task = null;
    stopTick();
  }
  function minimizeGrowthTask() {
    growthTaskSession.minimized = true;
    growthTaskSession.onFocusPage = false;
  }
  function showMiniBar() {
    return growthTaskSession.active && growthTaskSession.task && growthTaskSession.task.status === "IN_PROGRESS" && growthTaskSession.minimized && !growthTaskSession.onFocusPage;
  }
  function openGrowthTaskFocusPage(task) {
    if (!setActiveGrowthTask(task))
      return;
    growthTaskSession.minimized = false;
    growthTaskSession.onFocusPage = true;
    uni.navigateTo({ url: "/pages/growth-task-focus/growth-task-focus" });
  }
  function reopenGrowthTaskFocusPage() {
    if (!growthTaskSession.active || !growthTaskSession.task)
      return;
    growthTaskSession.minimized = false;
    growthTaskSession.onFocusPage = true;
    uni.navigateTo({ url: "/pages/growth-task-focus/growth-task-focus" });
  }
  async function refreshActiveGrowthTask() {
    const task = growthTaskSession.task;
    if (!(task == null ? void 0 : task.id) || !task.scheduledDate)
      return null;
    try {
      const res = await getGrowthTasksByDate(task.scheduledDate);
      const found = (res.tasks || []).find((t) => t.id === task.id);
      if (!found) {
        clearActiveGrowthTask();
        return null;
      }
      if (found.status !== "IN_PROGRESS") {
        clearActiveGrowthTask();
        if (found.status === "COMPLETED") {
          uni.showToast({ title: "任务已完成", icon: "success" });
        }
        return found;
      }
      growthTaskSession.task = normalizeGrowthTask(found);
      return found;
    } catch (e) {
      return null;
    }
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$b = {
    __name: "growth-task-mini-bar",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = vue.ref(20);
      vue.onMounted(() => {
        const sys = uni.getSystemInfoSync();
        statusBarHeight.value = sys.statusBarHeight || 20;
      });
      const visible = vue.computed(() => showMiniBar());
      const taskTitle = vue.computed(() => {
        var _a;
        void growthTaskSession.tick;
        const t = ((_a = growthTaskSession.task) == null ? void 0 : _a.title) || "进行中";
        return t.length > 12 ? t.slice(0, 12) + "…" : t;
      });
      const countdown = vue.computed(() => {
        void growthTaskSession.tick;
        return formatCountdown(getRemainingMs());
      });
      const progress = vue.computed(() => {
        void growthTaskSession.tick;
        return getProgressPercent();
      });
      function onTap() {
        reopenGrowthTaskFocusPage();
      }
      const __returned__ = { statusBarHeight, visible, taskTitle, countdown, progress, onTap, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get growthTaskSession() {
        return growthTaskSession;
      }, get showMiniBar() {
        return showMiniBar;
      }, get getRemainingMs() {
        return getRemainingMs;
      }, get getProgressPercent() {
        return getProgressPercent;
      }, get formatCountdown() {
        return formatCountdown;
      }, get reopenGrowthTaskFocusPage() {
        return reopenGrowthTaskFocusPage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return $setup.visible ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: "mini-bar",
        style: vue.normalizeStyle({ paddingTop: $setup.statusBarHeight + "px" }),
        onClick: $setup.onTap
      },
      [
        vue.createElementVNode("view", { class: "mini-inner" }, [
          vue.createElementVNode("view", { class: "mini-pulse" }),
          vue.createElementVNode("view", { class: "mini-texts" }, [
            vue.createElementVNode(
              "text",
              { class: "mini-title" },
              vue.toDisplayString($setup.taskTitle),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "mini-countdown" },
              "剩余 " + vue.toDisplayString($setup.countdown),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "mini-progress-wrap" }, [
            vue.createElementVNode(
              "view",
              {
                class: "mini-progress",
                style: vue.normalizeStyle({ width: $setup.progress + "%" })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          vue.createElementVNode("text", { class: "mini-enter" }, "进入 ›")
        ])
      ],
      4
      /* STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-b052acc1"], ["__file", "E:/HTML/ai_grow/components/growth-task-mini-bar/growth-task-mini-bar.vue"]]);
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
  const _sfc_main$a = {
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
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-00310203"], ["__file", "E:/HTML/ai_grow/components/markdown-content/markdown-content.vue"]]);
  const store = vue.reactive({ unreadCount: 0 });
  function refreshUnreadCount() {
    if (!getAccessToken()) {
      store.unreadCount = 0;
      return Promise.resolve(0);
    }
    return getUnreadCount().then((res) => {
      const n = res.unreadCount ?? res.count;
      store.unreadCount = Number(n) || 0;
      return store.unreadCount;
    }).catch(() => {
      store.unreadCount = 0;
      return 0;
    });
  }
  let audio = null;
  let lastPlayAt = 0;
  const MIN_INTERVAL_MS = 1200;
  function playNotificationSound() {
    const now = Date.now();
    if (now - lastPlayAt < MIN_INTERVAL_MS)
      return;
    lastPlayAt = now;
    try {
      if (!audio) {
        audio = uni.createInnerAudioContext();
        audio.src = "/static/notify.mp3";
        audio.volume = 0.85;
        audio.autoplay = false;
        audio.onError(() => {
          tryBeep();
        });
      }
      try {
        audio.stop();
      } catch (e) {
      }
      audio.seek(0);
      audio.play();
      return;
    } catch (e) {
      tryBeep();
    }
  }
  function tryBeep() {
    try {
      if (typeof plus !== "undefined" && plus.device && plus.device.beep) {
        plus.device.beep(1);
      }
    } catch (e) {
    }
  }
  const chatReplyListeners = [];
  const notifyListeners = [];
  function onChatReply(fn) {
    chatReplyListeners.push(fn);
    return () => {
      const i = chatReplyListeners.indexOf(fn);
      if (i >= 0)
        chatReplyListeners.splice(i, 1);
    };
  }
  function onNotificationsChanged(fn) {
    notifyListeners.push(fn);
    return () => {
      const i = notifyListeners.indexOf(fn);
      if (i >= 0)
        notifyListeners.splice(i, 1);
    };
  }
  function emitNotifyChange() {
    notifyListeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
      }
    });
  }
  function handleRealtimeMessage(data) {
    if (!data)
      return;
    if (data.unreadCount !== void 0 && data.type == null) {
      store.unreadCount = Number(data.unreadCount) || 0;
      return;
    }
    if (!data.type)
      return;
    switch (data.type) {
      case "TASK_DUE_REMINDER":
      case "WEEKLY_COMPANION_DIGEST":
        if (data.unreadCount !== void 0) {
          store.unreadCount = Number(data.unreadCount) || 0;
        } else {
          refreshUnreadCount();
        }
        emitNotifyChange();
        playNotificationSound();
        if (data.title) {
          uni.showToast({ title: data.title, icon: "none", duration: 2500 });
        }
        break;
      case "CHAT_REPLY":
        if (data.unreadCount !== void 0) {
          store.unreadCount = Number(data.unreadCount) || 0;
        }
        playNotificationSound();
        chatReplyListeners.forEach((fn) => {
          try {
            fn(data);
          } catch (e) {
          }
        });
        break;
    }
  }
  const MIN_RECORD_MS = 800;
  const _sfc_main$9 = {
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
      const historyVisible = vue.ref(false);
      const sessionList = vue.ref([]);
      const loadingSession = vue.ref(false);
      const loadingSessions = vue.ref(false);
      const sessionsRefreshing = vue.ref(false);
      const sessionsPage = vue.ref(0);
      const sessionsHasNext = vue.ref(false);
      const playingVoiceKey = vue.ref(null);
      const keyboardHeight = vue.ref(0);
      let keyboardHandler = null;
      let recorderManager = null;
      let innerAudioContext = null;
      let h5MediaRecorder = null;
      let isProcessingVoice = false;
      let touchRecording = false;
      let recordStarting = false;
      const addOptions = [
        { key: "photo", label: "照片", bg: "#ece5ff", color: "#7b6df0" }
      ];
      const WELCOME_MESSAGE = {
        role: "ai",
        type: "text",
        show: true,
        title: "你好！我是你的计划助手 👋",
        content: "你可以告诉我你的计划，我会帮你安排到日程中，让你的每一天都更高效。",
        tip: "比如：明天上午10点开会，下午去健身，晚上学习2小时"
      };
      function getWelcomeMessages() {
        return [{ ...WELCOME_MESSAGE }];
      }
      const messages = vue.ref(getWelcomeMessages());
      function openPendingSessionIfAny() {
        const pending = uni.getStorageSync("pendingOpenSessionId");
        if (!pending || !getAccessToken())
          return;
        uni.removeStorageSync("pendingOpenSessionId");
        loadSession(pending, true);
      }
      onShow(() => {
        if (getAccessToken()) {
          refreshUnreadCount();
          openPendingSessionIfAny();
        }
      });
      vue.onMounted(() => {
        keyboardHandler = (res) => {
          keyboardHeight.value = res.height || 0;
          if (keyboardHeight.value > 0) {
            vue.nextTick(() => setTimeout(scroll, 80));
          }
        };
        uni.onKeyboardHeightChange(keyboardHandler);
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
        if (getAccessToken()) {
          refreshUnreadCount();
          getUserInfo().then((res) => {
            if (res.avatarUrl) {
              userAvatar.value = res.avatarUrl.replace(/^https?:\/\/[^\/]+/, BASE_URL);
            }
          }).catch(() => {
          });
          onChatReply((data) => {
            if (!data.sessionId)
              return;
            if (sessionId.value && String(data.sessionId) === String(sessionId.value)) {
              loadSession(data.sessionId, true);
            }
            if (historyVisible.value)
              refreshSessions();
          });
          const pending = uni.getStorageSync("pendingOpenSessionId");
          if (pending) {
            openPendingSessionIfAny();
          } else {
            const cur = getCurrentSessionId();
            if (cur)
              loadSession(cur, true);
          }
        }
      });
      vue.onUnmounted(() => {
        if (keyboardHandler)
          uni.offKeyboardHeightChange(keyboardHandler);
      });
      function onInputFocus() {
        inputFocus.value = true;
        scroll();
      }
      function onInputBlur() {
        inputFocus.value = false;
      }
      function scroll() {
        vue.nextTick(() => {
          scrollTop.value = Math.random() * 99999;
        });
      }
      function pickVoiceUrl(m) {
        if (!m)
          return "";
        return m.voiceUrl || m.audioUrl || m.voiceUrls && m.voiceUrls[0] || "";
      }
      function pickProposalIdFromMessage(m) {
        if (!m)
          return null;
        if (m.proposalId != null)
          return m.proposalId;
        if (m.planProposalId != null)
          return m.planProposalId;
        if (m.planProposal && m.planProposal.proposalId != null)
          return m.planProposal.proposalId;
        return null;
      }
      function looksLikePlanDraftReply(content) {
        if (!content)
          return false;
        return /草案|确认计划|计划草案/.test(content);
      }
      function createPlanProposalShell({ id, content, proposalId, status, hint }) {
        const st = status || hint && hint.status || "PENDING";
        const resolved = st !== "PENDING";
        return {
          role: "ai",
          type: "planProposal",
          content: content || "",
          proposalId,
          status: st,
          detail: null,
          loading: true,
          resolved,
          resultMessage: resolved ? proposalResultMessage(st, hint) : "",
          acting: false,
          show: true,
          id
        };
      }
      function proposalResultMessage(status, detail) {
        if (status === "CONFIRMED") {
          return detail && detail.planId ? "计划已确认，已写入日程" : "计划已确认";
        }
        if (status === "REJECTED")
          return "已拒绝该计划草案";
        if (status === "EXPIRED")
          return "计划草案已过期";
        return proposalStatusText(status);
      }
      function applyProposalDetail(msg, detail) {
        msg.detail = detail;
        msg.status = detail.status || msg.status;
        if (detail.status === "PENDING") {
          msg.resolved = false;
          msg.resultMessage = "";
        } else {
          msg.resolved = true;
          msg.resultMessage = proposalResultMessage(detail.status, detail);
        }
      }
      function mapApiMessage(m) {
        const role = m.role === "USER" ? "user" : "ai";
        if (role === "ai") {
          const proposalId = pickProposalIdFromMessage(m);
          if (proposalId != null) {
            return createPlanProposalShell({
              id: m.id,
              content: m.content || "",
              proposalId,
              status: m.planProposal && m.planProposal.status || m.proposalStatus,
              hint: m.planProposal
            });
          }
          return { role: "ai", type: "text", title: "", content: m.content || "", tip: "", show: true, id: m.id };
        }
        const voiceUrl = pickVoiceUrl(m);
        const content = m.content || "";
        const isVoice = !!voiceUrl || /^\[语音\]/.test(content);
        return {
          role: "user",
          content,
          voiceUrl,
          isVoice,
          show: true,
          id: m.id
        };
      }
      function mapApiToMessages(apiData) {
        return (apiData.messages || []).map(mapApiMessage);
      }
      function deriveSessionTitle() {
        const userMsg = [...messages.value].reverse().find(
          (m) => m.role === "user" && m.content && !m.content.includes("识别中")
        );
        if (userMsg) {
          const t = userMsg.content.replace(/^\[语音\]\s*/, "").trim();
          if (t)
            return t.slice(0, 40);
        }
        return "新对话";
      }
      function pushAiLoading() {
        removeAiLoading();
        messages.value.push({ role: "ai", type: "loading", show: true });
        scroll();
      }
      function removeAiLoading() {
        for (let i = messages.value.length - 1; i >= 0; i--) {
          if (messages.value[i].type === "loading") {
            messages.value.splice(i, 1);
            break;
          }
        }
      }
      function persistSession() {
        if (!sessionId.value || !getAccessToken())
          return;
        const sid = sessionId.value;
        const title = deriveSessionTitle();
        setCachedSession(sid, {
          sessionId: sid,
          sessionTitle: title,
          messages: messages.value.filter((m) => m.type !== "loading")
        });
        saveCurrentSessionId(sid);
      }
      function mapSessionItem(s) {
        return {
          id: s.sessionId != null ? s.sessionId : s.id,
          title: s.title || s.sessionTitle || "新对话",
          updatedAt: s.updatedAt || s.createdAt,
          provider: s.provider,
          model: s.model
        };
      }
      function applySessionsPage(data, append) {
        const raw = data.items || data.content || data.sessions || [];
        const items = raw.map(mapSessionItem);
        sessionList.value = append ? sessionList.value.concat(items) : items;
        sessionsHasNext.value = !!data.hasNext;
      }
      function onSessionsRefresh() {
        sessionsRefreshing.value = true;
        refreshSessions();
      }
      function refreshSessions() {
        if (!getAccessToken())
          return Promise.resolve();
        loadingSessions.value = true;
        sessionsPage.value = 0;
        return getChatSessions(0, 20).then((data) => {
          applySessionsPage(data, false);
        }).catch(() => {
          uni.showToast({ title: "加载会话列表失败", icon: "none" });
        }).finally(() => {
          loadingSessions.value = false;
          sessionsRefreshing.value = false;
        });
      }
      function loadMoreSessions() {
        if (!sessionsHasNext.value || loadingSessions.value || !getAccessToken())
          return;
        loadingSessions.value = true;
        const page = sessionsPage.value + 1;
        getChatSessions(page, 20).then((data) => {
          applySessionsPage(data, true);
          sessionsPage.value = page;
        }).catch(() => {
          uni.showToast({ title: "加载更多失败", icon: "none" });
        }).finally(() => {
          loadingSessions.value = false;
        });
      }
      function mergeCachedPlanProposals(sid, list) {
        const cached = getCachedSession(sid);
        if (!cached || !cached.messages)
          return list;
        const byMsgId = {};
        cached.messages.forEach((m) => {
          if (m.type === "planProposal" && m.proposalId != null && m.id != null) {
            byMsgId[m.id] = m;
          }
        });
        return list.map((m) => {
          if (m.role !== "ai" || m.type === "planProposal")
            return m;
          const hit = byMsgId[m.id];
          if (hit)
            return { ...hit, show: true, loading: true };
          return m;
        });
      }
      function enrichPlanProposalsForSession(sessionId2, list) {
        return getPlanProposalsBySession(sessionId2).then((res) => {
          const proposals = res.items || res.proposals || res.content || [];
          if (!proposals.length)
            return list;
          const next = list.slice();
          const used = /* @__PURE__ */ new Set();
          proposals.forEach((p) => {
            const pid = p.proposalId != null ? p.proposalId : p.id;
            if (pid == null)
              return;
            let idx = next.findIndex(
              (m, i) => !used.has(i) && m.role === "ai" && (m.id === p.assistantMessageId || m.id === p.messageId)
            );
            if (idx < 0) {
              idx = next.findIndex(
                (m, i) => !used.has(i) && m.role === "ai" && m.type === "text" && looksLikePlanDraftReply(m.content)
              );
            }
            if (idx < 0)
              return;
            used.add(idx);
            next[idx] = createPlanProposalShell({
              id: next[idx].id,
              content: next[idx].content || "",
              proposalId: pid,
              status: p.status,
              hint: p
            });
          });
          return next;
        }).catch(() => list);
      }
      function hydratePlanProposalMessages(list) {
        const jobs = list.map((msg) => {
          if (msg.type !== "planProposal" || msg.proposalId == null)
            return Promise.resolve();
          msg.loading = true;
          return getPlanProposal(msg.proposalId).then((detail) => applyProposalDetail(msg, detail)).catch(() => {
            if (!msg.detail && msg.status && msg.status !== "PENDING") {
              msg.resolved = true;
              msg.resultMessage = proposalResultMessage(msg.status, null);
            }
          }).finally(() => {
            msg.loading = false;
          });
        });
        return Promise.all(jobs).then(() => list);
      }
      function mergeVoiceFromCache(sid, uiMessages) {
        const cached = getCachedSession(sid);
        if (!cached || !cached.messages)
          return uiMessages;
        const voiceById = {};
        const voiceByContent = [];
        cached.messages.forEach((m) => {
          if (!m.voiceUrl)
            return;
          if (m.id != null)
            voiceById[m.id] = m.voiceUrl;
          else if (m.content)
            voiceByContent.push({ content: m.content, voiceUrl: m.voiceUrl });
        });
        return uiMessages.map((m) => {
          if (m.role !== "user" || m.voiceUrl)
            return m;
          let voiceUrl = m.id != null ? voiceById[m.id] : "";
          if (!voiceUrl && m.content) {
            const hit = voiceByContent.find((v) => v.content === m.content);
            if (hit)
              voiceUrl = hit.voiceUrl;
          }
          if (!voiceUrl)
            return m;
          return { ...m, voiceUrl, isVoice: true };
        });
      }
      function formatMinutes(m) {
        if (m == null || m === "")
          return "";
        const n = Number(m);
        if (isNaN(n))
          return "";
        if (n >= 60) {
          const h = Math.floor(n / 60);
          const rest = n % 60;
          return rest ? h + "小时" + rest + "分钟" : h + "小时";
        }
        return n + "分钟";
      }
      function formatPlanDate(iso) {
        if (!iso)
          return "";
        const s = String(iso).slice(0, 10);
        const p = s.split("-");
        if (p.length >= 3)
          return parseInt(p[1], 10) + "月" + parseInt(p[2], 10) + "日";
        return s;
      }
      function formatPlanExpire(iso) {
        if (!iso)
          return "";
        const d = new Date(iso);
        if (isNaN(d.getTime()))
          return iso;
        const pad = (n) => n < 10 ? "0" + n : "" + n;
        return d.getMonth() + 1 + "月" + d.getDate() + "日 " + pad(d.getHours()) + ":" + pad(d.getMinutes());
      }
      function proposalStatusText(status) {
        const map = {
          PENDING: "待确认",
          CONFIRMED: "已确认",
          REJECTED: "已拒绝",
          EXPIRED: "已过期"
        };
        return map[status] || status || "";
      }
      function appendPlanProposalMessage(res) {
        const hint = res.planProposal || {};
        const msg = createPlanProposalShell({
          id: res.assistantMessageId,
          content: res.reply || "",
          proposalId: hint.proposalId,
          status: hint.status,
          hint
        });
        messages.value.push(msg);
        return getPlanProposal(msg.proposalId).then((detail) => {
          applyProposalDetail(msg, detail);
        }).catch(() => {
          msg.detail = {
            goalTitle: hint.goalTitle || "计划草案",
            goalDescription: hint.summary || "",
            summary: hint.summary || "",
            startDate: hint.startDate,
            endDate: hint.endDate,
            dailyReminderTime: hint.dailyReminderTime,
            days: []
          };
          uni.showToast({ title: "加载计划详情失败", icon: "none" });
        }).finally(() => {
          msg.loading = false;
        });
      }
      function onConfirmProposal(msg) {
        if (msg.resolved || msg.acting || msg.status !== "PENDING")
          return;
        msg.acting = "confirm";
        confirmPlanProposal(msg.proposalId).then((res) => {
          return getPlanProposal(msg.proposalId).then((detail) => {
            applyProposalDetail(msg, detail);
            if (res.message)
              msg.resultMessage = res.message;
            uni.showToast({ title: "计划已确认", icon: "success" });
            persistSession();
          });
        }).catch((e) => {
          uni.showToast({ title: e && e.message || "确认失败", icon: "none" });
        }).finally(() => {
          msg.acting = false;
        });
      }
      function onRejectProposal(msg) {
        if (msg.resolved || msg.acting || msg.status !== "PENDING")
          return;
        uni.showModal({
          title: "拒绝计划",
          content: "确定拒绝这份计划草案吗？拒绝后不会创建任务与提醒。",
          success: (r) => {
            if (!r.confirm)
              return;
            msg.acting = "reject";
            rejectPlanProposal(msg.proposalId).then(() => {
              msg.resolved = true;
              msg.status = "REJECTED";
              msg.resultMessage = "已拒绝该计划草案";
              uni.showToast({ title: "已拒绝", icon: "none" });
              persistSession();
            }).catch((e) => {
              uni.showToast({ title: e && e.message || "操作失败", icon: "none" });
            }).finally(() => {
              msg.acting = false;
            });
          }
        });
      }
      function onChatSuccess(res) {
        removeAiLoading();
        sessionId.value = res.sessionId;
        if (res.planProposal && res.planProposal.proposalId != null) {
          appendPlanProposalMessage(res).then(() => {
            persistSession();
            scroll();
          });
        } else {
          messages.value.push({ role: "ai", type: "text", title: "", content: res.reply, tip: "", show: true });
          persistSession();
          scroll();
        }
      }
      function formatSessionTime(iso) {
        if (!iso)
          return "";
        const d = new Date(iso);
        if (isNaN(d.getTime()))
          return "";
        const now = /* @__PURE__ */ new Date();
        const isToday = d.toDateString() === now.toDateString();
        const pad = (n) => n < 10 ? "0" + n : "" + n;
        if (isToday)
          return pad(d.getHours()) + ":" + pad(d.getMinutes());
        return d.getMonth() + 1 + "/" + d.getDate();
      }
      function formatVoiceLabel(msg) {
        const t = (msg.content || "").replace(/^\[语音\]\s*/, "").trim();
        return t || "语音消息";
      }
      function voiceMsgKey(msg) {
        return msg.id != null ? "id-" + msg.id : "url-" + (msg.voiceUrl || "");
      }
      function isPlayingVoice(msg) {
        return playingVoiceKey.value === voiceMsgKey(msg);
      }
      function getInnerAudio() {
        if (!innerAudioContext) {
          innerAudioContext = uni.createInnerAudioContext();
          innerAudioContext.onEnded(() => {
            playingVoiceKey.value = null;
          });
          innerAudioContext.onStop(() => {
            playingVoiceKey.value = null;
          });
          innerAudioContext.onError(() => {
            playingVoiceKey.value = null;
            uni.showToast({ title: "无法播放语音", icon: "none" });
          });
        }
        return innerAudioContext;
      }
      function playVoice(msg) {
        const url = resolveMediaUrl(msg.voiceUrl);
        if (!url) {
          uni.showToast({ title: "语音文件不可用", icon: "none" });
          return;
        }
        const key = voiceMsgKey(msg);
        const audio2 = getInnerAudio();
        if (playingVoiceKey.value === key) {
          audio2.stop();
          playingVoiceKey.value = null;
          return;
        }
        playingVoiceKey.value = key;
        audio2.src = url;
        audio2.play();
      }
      function openHistory() {
        if (!getAccessToken()) {
          uni.showToast({ title: "请先登录", icon: "none" });
          setTimeout(() => {
            uni.navigateTo({ url: "/pages/login/login" });
          }, 800);
          return;
        }
        historyVisible.value = true;
        refreshSessions();
      }
      function createNewSession() {
        if (innerAudioContext)
          innerAudioContext.stop();
        playingVoiceKey.value = null;
        sessionId.value = null;
        clearCurrentSessionId();
        messages.value = getWelcomeMessages();
        historyVisible.value = false;
        scroll();
      }
      function loadSession(sid, silent) {
        if (String(sid) === String(sessionId.value) && !silent) {
          historyVisible.value = false;
          return Promise.resolve();
        }
        if (loadingSession.value)
          return Promise.resolve();
        loadingSession.value = true;
        if (!silent)
          historyVisible.value = false;
        if (innerAudioContext)
          innerAudioContext.stop();
        playingVoiceKey.value = null;
        sessionId.value = sid;
        saveCurrentSessionId(sid);
        return fetchAllChatMessages(sid).then((data) => {
          let list = mapApiToMessages(data);
          list = mergeVoiceFromCache(sid, list);
          list = mergeCachedPlanProposals(sid, list);
          return enrichPlanProposalsForSession(sid, list).then((enriched) => ({ data, list: enriched }));
        }).then(({ data, list }) => hydratePlanProposalMessages(list).then(() => ({ data, list }))).then(({ data, list }) => {
          messages.value = list.map((m) => ({ ...m, show: true }));
          const title = data.sessionTitle || deriveSessionTitle();
          setCachedSession(sid, {
            sessionId: data.sessionId || sid,
            sessionTitle: title,
            messages: messages.value
          });
          scroll();
        }).catch(() => {
          if (!silent)
            uni.showToast({ title: "加载历史失败", icon: "none" });
          messages.value = getWelcomeMessages();
          sessionId.value = null;
          clearCurrentSessionId();
        }).finally(() => {
          loadingSession.value = false;
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
        pushAiLoading();
        sendChatMessage(t, sessionId.value || void 0).then((res) => {
          onChatSuccess(res);
        }).catch((e) => {
          removeAiLoading();
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
      let lastVoiceBlobUrl = null;
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
          formatAppLog("log", "at pages/index/index.vue:1017", "recorderManager onStart");
          isRecording.value = true;
        });
        recorderManager.onStop((res) => {
          formatAppLog("log", "at pages/index/index.vue:1021", "recorderManager onStop:", JSON.stringify(res));
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
          formatAppLog("error", "at pages/index/index.vue:1039", "recorderManager onError:", JSON.stringify(err));
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
        if (lastVoiceBlobUrl)
          URL.revokeObjectURL(lastVoiceBlobUrl);
        lastVoiceBlobUrl = URL.createObjectURL(blob);
        messages.value.push({
          role: "user",
          content: "[语音] 识别中...",
          show: true,
          voiceUrl: lastVoiceBlobUrl,
          isVoice: true
        });
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
        formatAppLog("log", "at pages/index/index.vue:1197", "handleVoiceResult filePath:", filePath);
        messages.value.push({
          role: "user",
          content: "[语音] 识别中...",
          show: true,
          voiceUrl: filePath,
          isVoice: true
        });
        scroll();
        transcribeAudio(filePath).then((res) => {
          const last = messages.value[messages.value.length - 1];
          if (last && last.role === "user" && (res.audioUrl || res.voiceUrl || res.url)) {
            last.voiceUrl = res.audioUrl || res.voiceUrl || res.url;
            last.isVoice = true;
          }
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
          if (!lastUserMsg.voiceUrl && lastVoiceBlobUrl)
            lastUserMsg.voiceUrl = lastVoiceBlobUrl;
          lastUserMsg.isVoice = true;
        }
        scroll();
        sending.value = true;
        pushAiLoading();
        sendChatMessage(text, sessionId.value || void 0).then((res) => {
          onChatSuccess(res);
        }).catch((e) => {
          removeAiLoading();
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
      function showAddMenu() {
        addVisible.value = true;
      }
      function onAdd(key) {
        addVisible.value = false;
        uni.showToast({ title: "已选择照片", icon: "none" });
      }
      const __returned__ = { loaded, scrollTop, inputText, inputMode, inputFocus, isRecording, addVisible, recordTimer, sessionId, sending, userAvatar, composing, historyVisible, sessionList, loadingSession, loadingSessions, sessionsRefreshing, sessionsPage, sessionsHasNext, playingVoiceKey, keyboardHeight, get keyboardHandler() {
        return keyboardHandler;
      }, set keyboardHandler(v) {
        keyboardHandler = v;
      }, get recorderManager() {
        return recorderManager;
      }, set recorderManager(v) {
        recorderManager = v;
      }, get innerAudioContext() {
        return innerAudioContext;
      }, set innerAudioContext(v) {
        innerAudioContext = v;
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
      }, MIN_RECORD_MS, addOptions, WELCOME_MESSAGE, getWelcomeMessages, messages, openPendingSessionIfAny, onInputFocus, onInputBlur, scroll, pickVoiceUrl, pickProposalIdFromMessage, looksLikePlanDraftReply, createPlanProposalShell, proposalResultMessage, applyProposalDetail, mapApiMessage, mapApiToMessages, deriveSessionTitle, pushAiLoading, removeAiLoading, persistSession, mapSessionItem, applySessionsPage, onSessionsRefresh, refreshSessions, loadMoreSessions, mergeCachedPlanProposals, enrichPlanProposalsForSession, hydratePlanProposalMessages, mergeVoiceFromCache, formatMinutes, formatPlanDate, formatPlanExpire, proposalStatusText, appendPlanProposalMessage, onConfirmProposal, onRejectProposal, onChatSuccess, formatSessionTime, formatVoiceLabel, voiceMsgKey, isPlayingVoice, getInnerAudio, playVoice, openHistory, createNewSession, loadSession, goPlans, goNotifications, goTasks, goLogin, toggleMode, onSend, get recordStartTime() {
        return recordStartTime;
      }, set recordStartTime(v) {
        recordStartTime = v;
      }, get lastVoiceBlobUrl() {
        return lastVoiceBlobUrl;
      }, set lastVoiceBlobUrl(v) {
        lastVoiceBlobUrl = v;
      }, ensureRecordPermission, initRecorderManager, onVoiceTouchStart, onVoiceTouchEnd, startRecord, stopRecord, uploadAndTranscribeBlob, handleVoiceResult, onTranscribeSuccess, showAddMenu, onAdd, ref: vue.ref, nextTick: vue.nextTick, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get onShow() {
        return onShow;
      }, get getAccessToken() {
        return getAccessToken;
      }, get sendChatMessage() {
        return sendChatMessage;
      }, get transcribeAudio() {
        return transcribeAudio;
      }, get getUserInfo() {
        return getUserInfo;
      }, get getChatSessions() {
        return getChatSessions;
      }, get fetchAllChatMessages() {
        return fetchAllChatMessages;
      }, get resolveMediaUrl() {
        return resolveMediaUrl;
      }, get BASE_URL() {
        return BASE_URL;
      }, get getPlanProposal() {
        return getPlanProposal;
      }, get getPlanProposalsBySession() {
        return getPlanProposalsBySession;
      }, get confirmPlanProposal() {
        return confirmPlanProposal;
      }, get rejectPlanProposal() {
        return rejectPlanProposal;
      }, get store() {
        return store;
      }, get refreshUnreadCount() {
        return refreshUnreadCount;
      }, get onChatReply() {
        return onChatReply;
      }, get isSessionCached() {
        return isSessionCached;
      }, get getCachedSession() {
        return getCachedSession;
      }, get setCachedSession() {
        return setCachedSession;
      }, get saveCurrentSessionId() {
        return saveCurrentSessionId;
      }, get getCurrentSessionId() {
        return getCurrentSessionId;
      }, get clearCurrentSessionId() {
        return clearCurrentSessionId;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_growth_task_mini_bar = resolveEasycom(vue.resolveDynamicComponent("growth-task-mini-bar"), __easycom_0);
    const _component_markdown_content = resolveEasycom(vue.resolveDynamicComponent("markdown-content"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["page", { "keyboard-open": $setup.keyboardHeight > 0 }])
      },
      [
        vue.createVNode(_component_growth_task_mini_bar),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["top-bar", { show: $setup.loaded }])
          },
          [
            vue.createElementVNode("text", { class: "top-title" }, "AI成长"),
            vue.createElementVNode("view", { class: "top-actions" }, [
              vue.createElementVNode("text", {
                class: "top-link",
                onClick: $setup.openHistory
              }, "历史"),
              vue.createElementVNode("text", {
                class: "top-link",
                onClick: $setup.createNewSession
              }, "新对话"),
              vue.createElementVNode("view", {
                class: "top-link-wrap",
                onClick: $setup.goNotifications
              }, [
                vue.createElementVNode("text", { class: "top-link" }, "通知"),
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
              vue.createElementVNode("text", {
                class: "top-link",
                onClick: $setup.goPlans
              }, "计划"),
              vue.createElementVNode("text", {
                class: "top-link",
                onClick: $setup.goLogin
              }, "我的")
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
                      msg.type === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "ai-loading-wrap"
                      }, [
                        vue.createElementVNode("view", { class: "loader" }, [
                          vue.createElementVNode("view", { class: "loader-ship" }, [
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view", { class: "base" }, [
                              vue.createElementVNode("view")
                            ]),
                            vue.createElementVNode("view", { class: "face" })
                          ]),
                          vue.createElementVNode("view", { class: "longfazers" }, [
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view"),
                            vue.createElementVNode("view")
                          ])
                        ])
                      ])) : msg.type === "text" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
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
                      msg.type === "plan" ? (vue.openBlock(), vue.createElementBlock("view", { key: 2 }, [
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
                      msg.type === "planProposal" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 3,
                        class: "proposal-wrap"
                      }, [
                        msg.content ? (vue.openBlock(), vue.createBlock(_component_markdown_content, {
                          key: 0,
                          class: "ai-bd proposal-intro",
                          content: msg.content
                        }, null, 8, ["content"])) : vue.createCommentVNode("v-if", true),
                        msg.loading ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "proposal-loading"
                        }, [
                          vue.createElementVNode("text", { class: "proposal-loading-txt" }, "正在加载计划详情...")
                        ])) : (vue.openBlock(), vue.createElementBlock(
                          vue.Fragment,
                          { key: 2 },
                          [
                            msg.status ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: 0,
                                class: vue.normalizeClass(["proposal-status-badge", "status-" + String(msg.status).toLowerCase()])
                              },
                              [
                                vue.createElementVNode(
                                  "text",
                                  null,
                                  vue.toDisplayString($setup.proposalStatusText(msg.status)),
                                  1
                                  /* TEXT */
                                )
                              ],
                              2
                              /* CLASS */
                            )) : vue.createCommentVNode("v-if", true),
                            msg.detail ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 1,
                              class: "proposal-body"
                            }, [
                              vue.createElementVNode(
                                "text",
                                { class: "proposal-title" },
                                vue.toDisplayString(msg.detail.goalTitle),
                                1
                                /* TEXT */
                              ),
                              msg.detail.goalDescription ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                {
                                  key: 0,
                                  class: "proposal-desc"
                                },
                                vue.toDisplayString(msg.detail.goalDescription),
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true),
                              vue.createElementVNode(
                                "text",
                                { class: "proposal-summary" },
                                vue.toDisplayString(msg.detail.summary),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode("text", { class: "proposal-meta" }, [
                                vue.createTextVNode(
                                  " 📅 " + vue.toDisplayString($setup.formatPlanDate(msg.detail.startDate || msg.detail.days && msg.detail.days[0] && msg.detail.days[0].scheduledDate)) + " ",
                                  1
                                  /* TEXT */
                                ),
                                msg.detail.endDate ? (vue.openBlock(), vue.createElementBlock(
                                  "text",
                                  { key: 0 },
                                  " — " + vue.toDisplayString($setup.formatPlanDate(msg.detail.endDate)),
                                  1
                                  /* TEXT */
                                )) : vue.createCommentVNode("v-if", true),
                                vue.createTextVNode(
                                  " · ⏰ 每日 " + vue.toDisplayString(msg.detail.dailyReminderTime || "08:00"),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              (vue.openBlock(true), vue.createElementBlock(
                                vue.Fragment,
                                null,
                                vue.renderList(msg.detail.days || [], (d) => {
                                  return vue.openBlock(), vue.createElementBlock("view", {
                                    class: "proposal-day",
                                    key: d.dayIndex
                                  }, [
                                    vue.createElementVNode("view", { class: "day-hd" }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "day-tag" },
                                        "第" + vue.toDisplayString(d.dayIndex) + "天",
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "day-date" },
                                        vue.toDisplayString($setup.formatPlanDate(d.scheduledDate)),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "day-mins" },
                                        vue.toDisplayString($setup.formatMinutes(d.estimatedMinutes)),
                                        1
                                        /* TEXT */
                                      )
                                    ]),
                                    vue.createElementVNode(
                                      "text",
                                      { class: "day-title" },
                                      vue.toDisplayString(d.title),
                                      1
                                      /* TEXT */
                                    ),
                                    d.description ? (vue.openBlock(), vue.createElementBlock(
                                      "text",
                                      {
                                        key: 0,
                                        class: "day-desc"
                                      },
                                      vue.toDisplayString(d.description),
                                      1
                                      /* TEXT */
                                    )) : vue.createCommentVNode("v-if", true)
                                  ]);
                                }),
                                128
                                /* KEYED_FRAGMENT */
                              )),
                              msg.detail.expiresAt ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                {
                                  key: 1,
                                  class: "proposal-expire"
                                },
                                " 草案有效期至 " + vue.toDisplayString($setup.formatPlanExpire(msg.detail.expiresAt)),
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])) : vue.createCommentVNode("v-if", true),
                            !msg.resolved && msg.status === "PENDING" && msg.detail ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 2,
                              class: "proposal-actions"
                            }, [
                              vue.createElementVNode("view", {
                                class: vue.normalizeClass(["btn-proposal-reject", { disabled: msg.acting }]),
                                onClick: ($event) => $setup.onRejectProposal(msg)
                              }, [
                                vue.createElementVNode("text", null, "拒绝")
                              ], 10, ["onClick"]),
                              vue.createElementVNode("view", {
                                class: vue.normalizeClass(["btn-proposal-confirm", { disabled: msg.acting }]),
                                onClick: ($event) => $setup.onConfirmProposal(msg)
                              }, [
                                vue.createElementVNode(
                                  "text",
                                  null,
                                  vue.toDisplayString(msg.acting === "confirm" ? "确认中..." : "确认计划"),
                                  1
                                  /* TEXT */
                                )
                              ], 10, ["onClick"])
                            ])) : msg.resolved ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 3,
                              class: "proposal-done"
                            }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(msg.resultMessage),
                                1
                                /* TEXT */
                              )
                            ])) : vue.createCommentVNode("v-if", true)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ])) : vue.createCommentVNode("v-if", true),
                      msg.type === "recommend" ? (vue.openBlock(), vue.createElementBlock("view", { key: 4 }, [
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
                      msg.type === "stats" ? (vue.openBlock(), vue.createElementBlock("view", { key: 5 }, [
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
                      msg.isVoice && msg.voiceUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "voice-bubble",
                        onClick: ($event) => $setup.playVoice(msg)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "voice-play-icon" },
                          vue.toDisplayString($setup.isPlayingVoice(msg) ? "⏸" : "▶"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "voice-wave" }, [
                          (vue.openBlock(), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList(4, (n) => {
                              return vue.createElementVNode(
                                "view",
                                {
                                  class: vue.normalizeClass(["wave-bar", { active: $setup.isPlayingVoice(msg) }]),
                                  key: n
                                },
                                null,
                                2
                                /* CLASS */
                              );
                            }),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ]),
                        vue.createElementVNode(
                          "text",
                          { class: "voice-text" },
                          vue.toDisplayString($setup.formatVoiceLabel(msg)),
                          1
                          /* TEXT */
                        )
                      ], 8, ["onClick"])) : (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 1,
                          class: "user-txt"
                        },
                        vue.toDisplayString(msg.content),
                        1
                        /* TEXT */
                      ))
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
        vue.createElementVNode("view", { class: "input-card" }, [
          vue.createElementVNode("view", { class: "input-row" }, [
            $setup.inputMode === "text" ? vue.withDirectives((vue.openBlock(), vue.createElementBlock("input", {
              key: 0,
              class: "inp",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.inputText = $event),
              type: "text",
              placeholder: "输入计划...",
              "placeholder-class": "inp-ph",
              "confirm-type": "send",
              "adjust-position": false,
              "cursor-spacing": 24,
              focus: $setup.inputFocus,
              onConfirm: $setup.onSend,
              onFocus: $setup.onInputFocus,
              onBlur: $setup.onInputBlur,
              onCompositionstart: _cache[1] || (_cache[1] = ($event) => $setup.composing = true),
              onCompositionend: _cache[2] || (_cache[2] = ($event) => $setup.composing = false)
            }, null, 40, ["focus"])), [
              [vue.vModelText, $setup.inputText]
            ]) : (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 1,
                class: vue.normalizeClass(["voice-area", { recording: $setup.isRecording }]),
                onTouchstart: vue.withModifiers($setup.onVoiceTouchStart, ["stop"]),
                onTouchend: vue.withModifiers($setup.onVoiceTouchEnd, ["stop"]),
                onTouchcancel: vue.withModifiers($setup.onVoiceTouchEnd, ["stop"]),
                onTouchmove: _cache[3] || (_cache[3] = vue.withModifiers(() => {
                }, ["stop"]))
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
            vue.createElementVNode("view", { class: "input-actions" }, [
              vue.createElementVNode("view", {
                class: "inp-btn",
                onClick: $setup.toggleMode
              }, [
                $setup.inputMode === "text" ? (vue.openBlock(), vue.createElementBlock("text", {
                  key: 0,
                  class: "inp-btn-icon"
                }, "🎤")) : (vue.openBlock(), vue.createElementBlock("text", {
                  key: 1,
                  class: "inp-btn-icon"
                }, "⌨"))
              ]),
              $setup.inputMode === "text" ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: vue.normalizeClass(["inp-send", { active: $setup.inputText.length > 0 }]),
                  onClick: $setup.onSend
                },
                [
                  vue.createElementVNode("text", { class: "inp-send-txt" }, "发送")
                ],
                2
                /* CLASS */
              )) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", {
                class: "inp-btn",
                onClick: $setup.showAddMenu
              }, [
                vue.createElementVNode("text", { class: "inp-btn-icon inp-btn-plus" }, "＋")
              ])
            ])
          ])
        ]),
        $setup.historyVisible ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "history-mask",
          onClick: _cache[5] || (_cache[5] = ($event) => $setup.historyVisible = false)
        }, [
          vue.createElementVNode("view", {
            class: "history-panel",
            onClick: _cache[4] || (_cache[4] = vue.withModifiers(() => {
            }, ["stop"]))
          }, [
            vue.createElementVNode("view", { class: "history-hd" }, [
              vue.createElementVNode("text", { class: "history-title" }, "对话历史"),
              vue.createElementVNode("view", {
                class: "history-new",
                onClick: $setup.createNewSession
              }, [
                vue.createElementVNode("text", { class: "history-new-txt" }, "＋ 新对话")
              ])
            ]),
            vue.createElementVNode("scroll-view", {
              class: "history-scroll",
              "scroll-y": "",
              "show-scrollbar": false,
              "refresher-enabled": true,
              "refresher-triggered": $setup.sessionsRefreshing,
              onRefresherrefresh: $setup.onSessionsRefresh,
              onScrolltolower: $setup.loadMoreSessions
            }, [
              $setup.sessionList.length === 0 && !$setup.loadingSessions ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "history-empty"
              }, [
                vue.createElementVNode("text", { class: "history-empty-txt" }, "暂无历史对话")
              ])) : vue.createCommentVNode("v-if", true),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.sessionList, (s) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: s.id,
                    class: vue.normalizeClass(["history-item", { active: String(s.id) === String($setup.sessionId) }]),
                    onClick: ($event) => $setup.loadSession(s.id)
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "history-item-title" },
                      vue.toDisplayString(s.title || "新对话"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "history-item-meta" }, [
                      vue.createTextVNode(
                        vue.toDisplayString($setup.formatSessionTime(s.updatedAt)) + " ",
                        1
                        /* TEXT */
                      ),
                      $setup.isSessionCached(s.id) ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        class: "history-local"
                      }, " · 本地")) : vue.createCommentVNode("v-if", true)
                    ])
                  ], 10, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.loadingSessions ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "history-loading"
              }, [
                vue.createElementVNode("text", { class: "history-loading-txt" }, "加载中...")
              ])) : !$setup.sessionsHasNext && $setup.sessionList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "history-loading"
              }, [
                vue.createElementVNode("text", { class: "history-loading-txt" }, "没有更多了")
              ])) : vue.createCommentVNode("v-if", true)
            ], 40, ["refresher-triggered"])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.addVisible ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "add-mask",
          onClick: _cache[7] || (_cache[7] = ($event) => $setup.addVisible = false)
        }, [
          vue.createElementVNode("view", {
            class: "add-panel",
            onClick: _cache[6] || (_cache[6] = vue.withModifiers(() => {
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
      ],
      2
      /* CLASS */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/HTML/ai_grow/pages/index/index.vue"]]);
  const _sfc_main$8 = {
    __name: "plans",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const loadingTasks = vue.ref(false);
      const startingTaskId = vue.ref(null);
      let pollTimer = null;
      let endRefreshTimer = null;
      const weeks = ["日", "一", "二", "三", "四", "五", "六"];
      const today = /* @__PURE__ */ new Date();
      const curYear = vue.ref(today.getFullYear());
      const curMonth = vue.ref(today.getMonth() + 1);
      const selectedDate = vue.ref(formatDate(today));
      const dayTasks = vue.ref([]);
      const datesWithTasks = vue.ref({});
      const taskCount = vue.computed(() => dayTasks.value.length);
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
        loadTasksForDate(selectedDate.value);
      });
      onShow(() => {
        if (selectedDate.value)
          loadTasksForDate(selectedDate.value);
      });
      vue.onUnmounted(() => {
        clearTaskTimers();
      });
      vue.watch(selectedDate, (date) => {
        clearTaskTimers();
        loadTasksForDate(date);
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
          const hasPlan = !!datesWithTasks.value[full];
          days.push({ day: d, full, isToday, hasPlan });
        }
        return days;
      });
      const FINAL_STATUS = ["COMPLETED", "SKIPPED", "INCOMPLETE"];
      const STATUS_COLORS = {
        COMPLETED: "#67c23a",
        IN_PROGRESS: "#4facfe",
        PENDING: "#7b6df0",
        SKIPPED: "#c0c4cc",
        INCOMPLETE: "#f56c6c"
      };
      const STATUS_LABELS = {
        PENDING: "待执行",
        IN_PROGRESS: "进行中",
        COMPLETED: "已完成",
        SKIPPED: "已跳过",
        INCOMPLETE: "未完成"
      };
      function formatTimeFromIso(iso) {
        if (!iso)
          return "";
        const m = String(iso).match(/T(\d{2}):(\d{2})/);
        return m ? `${m[1]}:${m[2]}` : "";
      }
      function isPlanActionDay(viewDate, scheduledDate) {
        return viewDate === formatDate(today) && scheduledDate === viewDate;
      }
      function formatRemaining(plannedEndAt) {
        if (!plannedEndAt)
          return "进行中";
        const end = new Date(plannedEndAt).getTime();
        if (Number.isNaN(end))
          return "进行中";
        const min = Math.ceil((end - Date.now()) / 6e4);
        if (min <= 0)
          return "即将结束…";
        return `进行中 · 约 ${min} 分钟后结束`;
      }
      function formatTaskTime(task, status) {
        if (status === "INCOMPLETE")
          return "已过期未完成";
        if (status === "SKIPPED")
          return "已跳过";
        if (status === "IN_PROGRESS")
          return formatRemaining(task.plannedEndAt);
        const start = formatTimeFromIso(task.startedAt);
        const end = formatTimeFromIso(task.plannedEndAt);
        if (start && end)
          return `${start} - ${end}`;
        if (start)
          return start;
        if (task.estimatedMinutes)
          return `约 ${task.estimatedMinutes} 分钟`;
        return "";
      }
      function mapGrowthTask(task, viewDate) {
        const status = task.status || "PENDING";
        const scheduledDate = task.scheduledDate || viewDate;
        const isFinal = FINAL_STATUS.includes(status);
        const canActOnDay = isPlanActionDay(viewDate, scheduledDate);
        const running = status === "IN_PROGRESS";
        const done = status === "COMPLETED";
        const skipped = status === "SKIPPED";
        const incomplete = status === "INCOMPLETE";
        const canStart = status === "PENDING" && canActOnDay;
        const canCompleteEarly = running && canActOnDay;
        const locked = isFinal || !canStart && !canCompleteEarly;
        let metaIcon = "⏰";
        if (running)
          metaIcon = "⏳";
        else if (incomplete)
          metaIcon = "⚠️";
        else if (skipped)
          metaIcon = "⊘";
        return {
          id: task.id,
          name: task.title || "未命名任务",
          time: formatTaskTime(task, status),
          date: scheduledDate,
          color: STATUS_COLORS[status] || "#7b6df0",
          done,
          skipped,
          incomplete,
          running,
          locked,
          canStart,
          canCompleteEarly,
          canActOnDay,
          status,
          metaIcon,
          description: task.description || "",
          plannedEndAt: task.plannedEndAt || "",
          startedAt: task.startedAt || "",
          estimatedMinutes: task.estimatedMinutes
        };
      }
      function toFocusTask(p) {
        return {
          id: p.id,
          title: p.name,
          description: p.description,
          scheduledDate: p.date,
          startedAt: p.startedAt,
          plannedEndAt: p.plannedEndAt,
          estimatedMinutes: p.estimatedMinutes,
          status: "IN_PROGRESS"
        };
      }
      function openFocusSession(p) {
        openGrowthTaskFocusPage(toFocusTask(p));
      }
      function clearTaskTimers() {
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        if (endRefreshTimer) {
          clearTimeout(endRefreshTimer);
          endRefreshTimer = null;
        }
      }
      function scheduleTaskRefresh() {
        clearTaskTimers();
        const running = dayTasks.value.filter((t) => t.running && t.plannedEndAt);
        if (!running.length)
          return;
        pollTimer = setInterval(() => {
          loadTasksForDate(selectedDate.value, { silent: true });
        }, 3e4);
        let nearestEnd = Infinity;
        for (const t of running) {
          const end = new Date(t.plannedEndAt).getTime();
          if (!Number.isNaN(end) && end > Date.now()) {
            nearestEnd = Math.min(nearestEnd, end);
          }
        }
        if (nearestEnd !== Infinity) {
          endRefreshTimer = setTimeout(() => {
            loadTasksForDate(selectedDate.value, { silent: true });
          }, nearestEnd - Date.now() + 800);
        }
      }
      function upsertDayTask(rawTask) {
        if (!rawTask || rawTask.id == null)
          return;
        const mapped = mapGrowthTask(rawTask, selectedDate.value);
        const i = dayTasks.value.findIndex((t) => t.id === mapped.id);
        if (i >= 0) {
          dayTasks.value = dayTasks.value.map((t, idx) => idx === i ? mapped : t);
        } else {
          dayTasks.value = [...dayTasks.value, mapped];
        }
        scheduleTaskRefresh();
      }
      async function loadTasksForDate(date, options = {}) {
        if (!date)
          return;
        const { silent = false } = options;
        if (!silent)
          loadingTasks.value = true;
        try {
          const res = await getGrowthTasksByDate(date);
          const list = (res.tasks || []).map((t) => mapGrowthTask(t, date));
          dayTasks.value = list;
          datesWithTasks.value = {
            ...datesWithTasks.value,
            [date]: (res.count != null ? res.count : list.length) > 0
          };
          scheduleTaskRefresh();
        } catch (e) {
          if (!silent) {
            dayTasks.value = [];
            uni.showToast({ title: e.message || "加载任务失败", icon: "none" });
          }
        } finally {
          if (!silent)
            loadingTasks.value = false;
        }
      }
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
      function lockedToast(p) {
        if (p.incomplete) {
          return "该任务已过期未完成，无法开始或完成";
        }
        if (p.skipped)
          return "该任务已跳过";
        if (p.done)
          return "该任务已完成";
        if (p.status === "PENDING" && !p.canActOnDay) {
          return selectedDate.value === formatDate(today) ? "仅可在计划日当天操作" : "请切换到计划日当天再操作";
        }
        return "当前状态无法操作";
      }
      async function onCheckTap(p) {
        if (p.locked) {
          uni.showToast({ title: lockedToast(p), icon: "none" });
          return;
        }
        if (startingTaskId.value)
          return;
        if (p.canCompleteEarly) {
          openFocusSession(p);
          return;
        }
        if (!p.canStart)
          return;
        startingTaskId.value = p.id;
        try {
          const updated = await startGrowthTask(p.id);
          if (updated && updated.id != null) {
            upsertDayTask(updated);
            if (updated.status === "IN_PROGRESS") {
              openGrowthTaskFocusPage(updated);
              return;
            }
          } else {
            await loadTasksForDate(selectedDate.value, { silent: true });
            const running = dayTasks.value.find((t) => t.id === p.id && t.running);
            if (running)
              openFocusSession(running);
            return;
          }
          uni.showToast({ title: "已开始执行", icon: "success" });
        } catch (e) {
          uni.showToast({ title: e.message || "开始失败", icon: "none" });
        } finally {
          startingTaskId.value = null;
        }
      }
      async function submitComplete(p) {
        if (startingTaskId.value)
          return;
        startingTaskId.value = p.id;
        try {
          const body = {};
          if (p.estimatedMinutes)
            body.actualMinutes = p.estimatedMinutes;
          body.qualityScore = 4;
          const updated = await completeGrowthTask(p.id, body);
          if (updated && updated.id != null) {
            upsertDayTask(updated);
          } else {
            await loadTasksForDate(selectedDate.value, { silent: true });
          }
          uni.showToast({ title: "已完成", icon: "success" });
        } catch (e) {
          const msg = e.code === "CONFLICT" || e.message && e.message.includes("409") ? "该任务无法完成" : e.message || "完成失败";
          uni.showToast({ title: msg, icon: "none" });
        } finally {
          startingTaskId.value = null;
        }
      }
      function onTaskTap(p) {
        if (p.running) {
          openFocusSession(p);
          return;
        }
        const statusLabel = STATUS_LABELS[p.status] || p.status;
        let hint = "";
        if (p.canStart)
          hint = "，点击 ▶ 开始";
        else if (p.incomplete)
          hint = "，已过期不可操作";
        uni.showToast({
          title: p.name + " · " + statusLabel + hint,
          icon: "none",
          duration: 2500
        });
      }
      function goBack() {
        uni.navigateBack();
      }
      function addPlan() {
        uni.showToast({ title: "添加计划功能开发中", icon: "none" });
      }
      const __returned__ = { loaded, loadingTasks, startingTaskId, get pollTimer() {
        return pollTimer;
      }, set pollTimer(v) {
        pollTimer = v;
      }, get endRefreshTimer() {
        return endRefreshTimer;
      }, set endRefreshTimer(v) {
        endRefreshTimer = v;
      }, weeks, today, curYear, curMonth, selectedDate, dayTasks, datesWithTasks, taskCount, formatDate, calendarDays, FINAL_STATUS, STATUS_COLORS, STATUS_LABELS, formatTimeFromIso, isPlanActionDay, formatRemaining, formatTaskTime, mapGrowthTask, toFocusTask, openFocusSession, clearTaskTimers, scheduleTaskRefresh, upsertDayTask, loadTasksForDate, selectedLabel, selectDate, prevMonth, nextMonth, lockedToast, onCheckTap, submitComplete, onTaskTap, goBack, addPlan, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, nextTick: vue.nextTick, watch: vue.watch, get onShow() {
        return onShow;
      }, get getGrowthTasksByDate() {
        return getGrowthTasksByDate;
      }, get startGrowthTask() {
        return startGrowthTask;
      }, get openGrowthTaskFocusPage() {
        return openGrowthTaskFocusPage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_growth_task_mini_bar = resolveEasycom(vue.resolveDynamicComponent("growth-task-mini-bar"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "plans-page" }, [
      vue.createVNode(_component_growth_task_mini_bar),
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
          vue.toDisplayString($setup.taskCount) + " 项任务",
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
          $setup.loadingTasks ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty"
          }, [
            vue.createElementVNode("text", { class: "empty-text" }, "加载中...")
          ])) : (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: 1 },
            [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.dayTasks, (p, pi) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: p.id,
                    class: vue.normalizeClass(["plan-card", { show: $setup.loaded, locked: p.locked }]),
                    style: vue.normalizeStyle({ transitionDelay: pi * 0.08 + "s" }),
                    onClick: ($event) => $setup.onTaskTap(p)
                  }, [
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
                            class: vue.normalizeClass(["plan-name", { done: p.done, incomplete: p.incomplete, skipped: p.skipped }])
                          },
                          vue.toDisplayString(p.name),
                          3
                          /* TEXT, CLASS */
                        ),
                        vue.createElementVNode("view", { class: "plan-meta" }, [
                          vue.createElementVNode(
                            "text",
                            { style: { "font-size": "22rpx" } },
                            vue.toDisplayString(p.metaIcon),
                            1
                            /* TEXT */
                          ),
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
                      class: vue.normalizeClass(["plan-check", {
                        done: p.done,
                        running: p.running,
                        locked: p.locked && !p.done,
                        skipped: p.skipped,
                        incomplete: p.incomplete,
                        starting: $setup.startingTaskId === p.id
                      }]),
                      onClick: vue.withModifiers(($event) => $setup.onCheckTap(p), ["stop"])
                    }, [
                      p.done ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        style: { "font-size": "28rpx", "color": "#fff" }
                      }, "✔")) : p.skipped ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 1,
                        class: "check-label"
                      }, "跳")) : p.incomplete ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 2,
                        class: "check-label muted"
                      }, "—")) : p.running ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 3,
                        class: "check-pulse"
                      })) : p.canStart ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 4,
                        style: { "font-size": "28rpx", "color": "#4facfe" }
                      }, "▶")) : (vue.openBlock(), vue.createElementBlock("text", {
                        key: 5,
                        class: "check-label muted"
                      }, "—"))
                    ], 10, ["onClick"])
                  ], 14, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.dayTasks.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty"
              }, [
                vue.createElementVNode("text", { style: { "font-size": "60rpx", "opacity": "0.3" } }, "📅"),
                vue.createElementVNode("text", { class: "empty-text" }, "这一天还没有任务"),
                vue.createElementVNode("text", { class: "empty-sub" }, "与 AI 对话确认成长计划后自动生成")
              ])) : vue.createCommentVNode("v-if", true)
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesPlansPlans = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-80c07444"], ["__file", "E:/HTML/ai_grow/pages/plans/plans.vue"]]);
  const _sfc_main$7 = {
    __name: "growth-task-focus",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = vue.ref(20);
      const playing = vue.ref(true);
      const completing = vue.ref(false);
      vue.onMounted(() => {
        const sys = uni.getSystemInfoSync();
        statusBarHeight.value = sys.statusBarHeight || 20;
      });
      onShow(() => {
        growthTaskSession.onFocusPage = true;
        growthTaskSession.minimized = false;
        if (growthTaskSession.task) {
          refreshActiveGrowthTask();
        }
      });
      onHide(() => {
        var _a;
        if (growthTaskSession.active && ((_a = growthTaskSession.task) == null ? void 0 : _a.status) === "IN_PROGRESS") {
          growthTaskSession.onFocusPage = false;
          growthTaskSession.minimized = true;
        }
      });
      vue.onUnmounted(() => {
        if (growthTaskSession.active && !growthTaskSession.minimized) {
          growthTaskSession.onFocusPage = false;
        }
      });
      const hasTask = vue.computed(() => growthTaskSession.active && !!growthTaskSession.task);
      const taskTitle = vue.computed(() => {
        var _a;
        return ((_a = growthTaskSession.task) == null ? void 0 : _a.title) || "";
      });
      const taskDesc = vue.computed(() => {
        var _a;
        const d = ((_a = growthTaskSession.task) == null ? void 0 : _a.description) || "";
        return d.length > 60 ? d.slice(0, 60) + "…" : d;
      });
      const countdown = vue.computed(() => {
        void growthTaskSession.tick;
        return formatCountdown(getRemainingMs());
      });
      const progress = vue.computed(() => {
        void growthTaskSession.tick;
        return getProgressPercent();
      });
      const quote = vue.computed(() => getCurrentQuote());
      const elapsedLabel = vue.computed(() => {
        void growthTaskSession.tick;
        return formatCountdown(getElapsedMs());
      });
      const totalLabel = vue.computed(() => {
        void growthTaskSession.tick;
        const task = growthTaskSession.task;
        if (!(task == null ? void 0 : task.startedAt) || !(task == null ? void 0 : task.plannedEndAt)) {
          return (task == null ? void 0 : task.estimatedMinutes) ? `${task.estimatedMinutes}:00` : "--:--";
        }
        const start = new Date(task.startedAt).getTime();
        const end = new Date(task.plannedEndAt).getTime();
        if (Number.isNaN(start) || Number.isNaN(end))
          return "--:--";
        return formatCountdown(end - start);
      });
      function goBack() {
        uni.navigateBack({
          fail: () => uni.reLaunch({ url: "/pages/plans/plans" })
        });
      }
      function onMinimize() {
        minimizeGrowthTask();
        goBack();
      }
      async function onComplete() {
        const task = growthTaskSession.task;
        if (!task || completing.value)
          return;
        uni.showModal({
          title: "提前完成",
          content: "确认现在完成这项任务吗？",
          success: async (res) => {
            if (!res.confirm)
              return;
            completing.value = true;
            try {
              const body = { qualityScore: 4 };
              if (task.estimatedMinutes)
                body.actualMinutes = task.estimatedMinutes;
              await completeGrowthTask$1(task.id, body);
              clearActiveGrowthTask();
              uni.showToast({ title: "已完成", icon: "success" });
              setTimeout(() => goBack(), 400);
            } catch (e) {
              uni.showToast({ title: e.message || "完成失败", icon: "none" });
            } finally {
              completing.value = false;
            }
          }
        });
      }
      const __returned__ = { statusBarHeight, playing, completing, hasTask, taskTitle, taskDesc, countdown, progress, quote, elapsedLabel, totalLabel, goBack, onMinimize, onComplete, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get completeGrowthTask() {
        return completeGrowthTask$1;
      }, get growthTaskSession() {
        return growthTaskSession;
      }, get clearActiveGrowthTask() {
        return clearActiveGrowthTask;
      }, get minimizeGrowthTask() {
        return minimizeGrowthTask;
      }, get getRemainingMs() {
        return getRemainingMs;
      }, get getElapsedMs() {
        return getElapsedMs;
      }, get getProgressPercent() {
        return getProgressPercent;
      }, get formatCountdown() {
        return formatCountdown;
      }, get getCurrentQuote() {
        return getCurrentQuote;
      }, get refreshActiveGrowthTask() {
        return refreshActiveGrowthTask;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "focus-page" }, [
      vue.createElementVNode("view", { class: "bg-glow g1" }),
      vue.createElementVNode("view", { class: "bg-glow g2" }),
      vue.createElementVNode(
        "view",
        {
          class: "top-bar",
          style: vue.normalizeStyle({ paddingTop: $setup.statusBarHeight + "px" })
        },
        [
          vue.createElementVNode("view", {
            class: "top-btn",
            onClick: $setup.onMinimize
          }, [
            vue.createElementVNode("text", { class: "top-btn-icon" }, "⌄"),
            vue.createElementVNode("text", { class: "top-btn-txt" }, "退出")
          ]),
          vue.createElementVNode("text", { class: "top-label" }, "专注进行中"),
          vue.createElementVNode("view", { class: "top-btn ghost" })
        ],
        4
        /* STYLE */
      ),
      $setup.hasTask ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "player-body"
      }, [
        vue.createElementVNode("view", { class: "disc-wrap" }, [
          vue.createElementVNode("view", { class: "disc-glow" }),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["disc", { spinning: $setup.playing }])
            },
            [
              vue.createElementVNode("view", { class: "disc-inner" }, [
                vue.createElementVNode("text", { class: "disc-emoji" }, "🎯")
              ])
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode(
          "text",
          { class: "task-title" },
          vue.toDisplayString($setup.taskTitle),
          1
          /* TEXT */
        ),
        $setup.taskDesc ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "task-desc"
          },
          vue.toDisplayString($setup.taskDesc),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "text",
          { class: "countdown" },
          vue.toDisplayString($setup.countdown),
          1
          /* TEXT */
        ),
        vue.createElementVNode("text", { class: "countdown-label" }, "剩余时间"),
        vue.createElementVNode("view", { class: "progress-block" }, [
          vue.createElementVNode("view", { class: "progress-track" }, [
            vue.createElementVNode(
              "view",
              {
                class: "progress-fill",
                style: vue.normalizeStyle({ width: $setup.progress + "%" })
              },
              null,
              4
              /* STYLE */
            ),
            vue.createElementVNode(
              "view",
              {
                class: "progress-thumb",
                style: vue.normalizeStyle({ left: $setup.progress + "%" })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          vue.createElementVNode("view", { class: "progress-times" }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.elapsedLabel),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.totalLabel),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "quote-card" }, [
          vue.createElementVNode("text", { class: "quote-mark" }, '"'),
          vue.createElementVNode(
            "text",
            { class: "quote-text" },
            vue.toDisplayString($setup.quote),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "actions" }, [
          vue.createElementVNode("view", {
            class: "action-btn secondary",
            onClick: $setup.onMinimize
          }, [
            vue.createElementVNode("text", null, "最小化")
          ]),
          vue.createElementVNode("view", {
            class: "action-btn primary",
            onClick: $setup.onComplete
          }, [
            vue.createElementVNode("text", null, "提前完成")
          ])
        ])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-body"
      }, [
        vue.createElementVNode("text", { class: "empty-txt" }, "暂无进行中的任务"),
        vue.createElementVNode("view", {
          class: "action-btn primary solo",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", null, "返回")
        ])
      ]))
    ]);
  }
  const PagesGrowthTaskFocusGrowthTaskFocus = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-afd4bbba"], ["__file", "E:/HTML/ai_grow/pages/growth-task-focus/growth-task-focus.vue"]]);
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
          await login(loginForm.value.email, loginForm.value.password);
          const { onAuthSuccess: onAuthSuccess2 } = await __vitePreload(() => Promise.resolve().then(() => afterAuth), false ? "__VITE_PRELOAD__" : void 0);
          onAuthSuccess2();
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
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-e4e4508d"], ["__file", "E:/HTML/ai_grow/pages/login/login.vue"]]);
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
          const { onAuthSuccess: onAuthSuccess2 } = await __vitePreload(() => Promise.resolve().then(() => afterAuth), false ? "__VITE_PRELOAD__" : void 0);
          onAuthSuccess2();
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
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-bac4a35d"], ["__file", "E:/HTML/ai_grow/pages/register/register.vue"]]);
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
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesForgotForgot = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-51689b0a"], ["__file", "E:/HTML/ai_grow/pages/forgot/forgot.vue"]]);
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
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-dd383ca2"], ["__file", "E:/HTML/ai_grow/pages/profile/profile.vue"]]);
  const _sfc_main$2 = {
    __name: "tasks",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const activeTab = vue.ref("OPEN");
      const tasks = vue.ref([]);
      const tabs = [
        { label: "进行中", value: "OPEN" },
        { label: "已完成", value: "DONE" },
        { label: "已取消", value: "CANCELLED" },
        { label: "全部", value: "" }
      ];
      const activeTabLabel = vue.computed(() => {
        const t = tabs.find((x) => x.value === activeTab.value);
        return t ? t.label : "";
      });
      onLoad((query) => {
        if (query && query.status) {
          const allowed = ["OPEN", "DONE", "CANCELLED", ""];
          if (allowed.includes(query.status))
            activeTab.value = query.status;
        }
      });
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
        loadTasks();
      });
      function isCompleted(task) {
        return task && task.status === "DONE";
      }
      function isActive(task) {
        return task && task.status === "OPEN";
      }
      async function loadTasks() {
        loading.value = true;
        try {
          const res = await getMyTasks(activeTab.value || void 0);
          tasks.value = res.tasks || res.items || [];
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
        const hint = isCompleted(task) ? "已完成" : task.status === "CANCELLED" ? "已取消" : "进行中，可在对话中让 AI 更新任务状态";
        uni.showToast({ title: task.title + " · " + hint, icon: "none", duration: 2500 });
      }
      function statusClass(status) {
        return { OPEN: "open", DONE: "done", CANCELLED: "cancelled" }[status] || "open";
      }
      function statusText(status) {
        return { OPEN: "进行中", DONE: "已完成", CANCELLED: "已取消" }[status] || "进行中";
      }
      const __returned__ = { loaded, loading, refreshing, activeTab, tasks, tabs, activeTabLabel, isCompleted, isActive, loadTasks, switchTab, onRefresh, goBack, onTaskTap, statusClass, statusText, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, nextTick: vue.nextTick, get onLoad() {
        return onLoad;
      }, get getMyTasks() {
        return getMyTasks;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
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
          vue.createElementVNode("text", { class: "subtitle" }, "列表只读；完成/取消请通过 AI 对话操作")
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
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            "暂无" + vue.toDisplayString($setup.activeTabLabel) + "任务",
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "empty-sub" }, "与 AI 对话创建或更新任务")
        ])) : vue.createCommentVNode("v-if", true),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tasks, (task, i) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["task-card", [{ show: $setup.loaded }, $setup.statusClass(task.status), { completed: $setup.isCompleted(task) }]]),
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
  const PagesTasksTasks = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-027feebf"], ["__file", "E:/HTML/ai_grow/pages/tasks/tasks.vue"]]);
  function toStr(v) {
    if (v == null || v === "")
      return null;
    return String(v);
  }
  function normalizePushPayload(raw) {
    if (!raw)
      return null;
    let data = raw;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    if (data.payload)
      data = data.payload;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        return null;
      }
    }
    const type = data.type || data.msgType;
    if (!type)
      return null;
    return {
      type,
      notificationId: data.notificationId != null ? Number(data.notificationId) : null,
      sessionId: data.sessionId != null ? Number(data.sessionId) : null,
      messageId: data.messageId != null ? Number(data.messageId) : null,
      taskId: data.taskId != null && data.taskId !== "" ? Number(data.taskId) : null,
      title: data.title || "",
      body: data.body || "",
      unreadCount: data.unreadCount != null ? Number(data.unreadCount) : void 0
    };
  }
  function stashPendingSession(sessionId) {
    if (sessionId == null)
      return;
    uni.setStorageSync("pendingOpenSessionId", toStr(sessionId));
  }
  function navigateFromPushPayload(raw) {
    const data = normalizePushPayload(raw);
    if (!data)
      return;
    if (data.unreadCount !== void 0 && !isNaN(data.unreadCount)) {
      store.unreadCount = data.unreadCount;
    }
    if (data.notificationId && getAccessToken()) {
      markNotificationRead(data.notificationId).then(() => refreshUnreadCount()).catch(() => {
      });
    }
    switch (data.type) {
      case "CHAT_REPLY":
      case "WEEKLY_COMPANION_DIGEST":
      case "TASK_DUE_REMINDER":
        if (data.sessionId != null) {
          stashPendingSession(data.sessionId);
          uni.reLaunch({ url: "/pages/index/index" });
          return;
        }
        if (data.taskId != null) {
          uni.navigateTo({ url: "/pages/tasks/tasks?status=OPEN" });
          return;
        }
        if (data.type !== "CHAT_REPLY") {
          uni.navigateTo({ url: "/pages/notifications/notifications" });
        }
        break;
    }
  }
  const _sfc_main$1 = {
    __name: "notifications",
    setup(__props, { expose: __expose }) {
      __expose();
      const loaded = vue.ref(false);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const listMode = vue.ref("unread");
      const notifications = vue.ref([]);
      const hasUnread = vue.computed(() => notifications.value.some((n) => !n.readAt));
      let offNotifyChange = null;
      vue.onMounted(() => {
        vue.nextTick(() => {
          setTimeout(() => {
            loaded.value = true;
          }, 50);
        });
        loadNotifications();
        offNotifyChange = onNotificationsChanged(() => loadNotifications());
      });
      onShow(() => {
        refreshUnreadCount();
        loadNotifications();
      });
      vue.onUnmounted(() => {
        if (offNotifyChange)
          offNotifyChange();
        offNotifyChange = null;
      });
      async function loadNotifications() {
        loading.value = true;
        try {
          const unreadOnly = listMode.value === "unread";
          const res = await getNotifications(unreadOnly);
          notifications.value = res.items || [];
        } catch (e) {
          notifications.value = [];
        } finally {
          loading.value = false;
        }
      }
      function switchMode(mode) {
        if (listMode.value === mode)
          return;
        listMode.value = mode;
        loadNotifications();
      }
      function onRefresh() {
        refreshing.value = true;
        Promise.all([loadNotifications(), refreshUnreadCount()]).finally(() => {
          refreshing.value = false;
        });
      }
      async function onReadAll() {
        try {
          await markAllNotificationsRead();
          await refreshUnreadCount();
          if (listMode.value === "unread") {
            notifications.value = [];
          } else {
            await loadNotifications();
          }
          uni.showToast({ title: "已全部标记已读", icon: "none" });
        } catch (e) {
          uni.showToast({ title: e && e.message || "操作失败", icon: "none" });
        }
      }
      async function onTapNotify(item) {
        if (!item.readAt) {
          try {
            await markNotificationRead(item.id);
            item.readAt = (/* @__PURE__ */ new Date()).toISOString();
            await refreshUnreadCount();
            if (listMode.value === "unread") {
              notifications.value = notifications.value.filter((n) => n.id !== item.id);
            }
          } catch (e) {
            uni.showToast({ title: "标记已读失败", icon: "none" });
            return;
          }
        }
        if (item.sessionId) {
          stashPendingSession(item.sessionId);
          uni.reLaunch({ url: "/pages/index/index" });
          return;
        }
        if (item.taskId) {
          uni.navigateTo({ url: "/pages/tasks/tasks?status=OPEN" });
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
        if (type === "TASK_DUE_REMINDER")
          return "icon-task";
        if (type === "WEEKLY_COMPANION_DIGEST")
          return "icon-weekly";
        return "icon-info";
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
      const __returned__ = { loaded, loading, refreshing, listMode, notifications, hasUnread, get offNotifyChange() {
        return offNotifyChange;
      }, set offNotifyChange(v) {
        offNotifyChange = v;
      }, loadNotifications, switchMode, onRefresh, onReadAll, onTapNotify, goBack, iconClass, formatTime, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, nextTick: vue.nextTick, get onShow() {
        return onShow;
      }, get getNotifications() {
        return getNotifications;
      }, get markNotificationRead() {
        return markNotificationRead;
      }, get markAllNotificationsRead() {
        return markAllNotificationsRead;
      }, get store() {
        return store;
      }, get refreshUnreadCount() {
        return refreshUnreadCount;
      }, get onNotificationsChanged() {
        return onNotificationsChanged;
      }, get stashPendingSession() {
        return stashPendingSession;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
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
              vue.createElementVNode(
                "text",
                { class: "subtitle" },
                vue.toDisplayString($setup.listMode === "unread" ? "未读消息" : "全部通知（含已读）"),
                1
                /* TEXT */
              )
            ]),
            $setup.listMode === "unread" && $setup.hasUnread ? (vue.openBlock(), vue.createElementBlock("view", {
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
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["tab-bar", { show: $setup.loaded }])
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["tab-pill", { active: $setup.listMode === "unread" }]),
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchMode("unread"))
            },
            [
              vue.createElementVNode("text", null, "未读")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["tab-pill", { active: $setup.listMode === "history" }]),
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchMode("history"))
            },
            [
              vue.createElementVNode("text", null, "历史")
            ],
            2
            /* CLASS */
          )
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
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.listMode === "unread" ? "暂无未读通知" : "暂无通知"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "empty-sub" },
            vue.toDisplayString($setup.listMode === "unread" ? "一键已读后这里会为空" : "已读通知也会显示在历史里"),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.notifications, (item, i) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["notify-card", [{ unread: !item.readAt }, { read: !!item.readAt }, { show: $setup.loaded }]]),
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
                  }, "🔔")) : item.type === "WEEKLY_COMPANION_DIGEST" ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    style: { "font-size": "32rpx" }
                  }, "📅")) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 2,
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
  const PagesNotificationsNotifications = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-e30a2353"], ["__file", "E:/HTML/ai_grow/pages/notifications/notifications.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/plans/plans", PagesPlansPlans);
  __definePage("pages/growth-task-focus/growth-task-focus", PagesGrowthTaskFocusGrowthTaskFocus);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/forgot/forgot", PagesForgotForgot);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/tasks/tasks", PagesTasksTasks);
  __definePage("pages/notifications/notifications", PagesNotificationsNotifications);
  const BACKOFF_MS = [1e3, 2e3, 5e3, 1e4, 3e4];
  let socketTask = null;
  let reconnectTimer = null;
  let listeners = [];
  let isConnected = false;
  let backoffIndex = 0;
  function getWsUrl() {
    const token = getAccessToken();
    if (!token)
      return null;
    const wsBase = BASE_URL.replace(/^https?/, "ws");
    return wsBase + "/ws/v1/chat?token=" + encodeURIComponent(token);
  }
  function connect(force = false) {
    if (isConnected && !force)
      return;
    const url = getWsUrl();
    if (!url)
      return;
    if (socketTask) {
      try {
        socketTask.close({});
      } catch (e) {
      }
      socketTask = null;
      isConnected = false;
    }
    socketTask = uni.connectSocket({ url, complete: () => {
    } });
    socketTask.onOpen(() => {
      isConnected = true;
      backoffIndex = 0;
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
    if (!getAccessToken())
      return;
    const delay = BACKOFF_MS[Math.min(backoffIndex, BACKOFF_MS.length - 1)];
    backoffIndex = Math.min(backoffIndex + 1, BACKOFF_MS.length - 1);
    reconnectTimer = setTimeout(() => connect(true), delay);
  }
  function disconnect() {
    clearTimeout(reconnectTimer);
    backoffIndex = 0;
    if (socketTask) {
      try {
        socketTask.close({});
      } catch (e) {
      }
      socketTask = null;
    }
    isConnected = false;
  }
  function reconnect() {
    disconnect();
    connect(true);
  }
  function onMessage(fn) {
    listeners.push(fn);
  }
  function offMessage(fn) {
    listeners = listeners.filter((l) => l !== fn);
  }
  const websocket = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    connect,
    disconnect,
    offMessage,
    onMessage,
    reconnect
  }, Symbol.toStringTag, { value: "Module" }));
  let listenersBound = false;
  function getPushPlatform() {
    const sys = uni.getSystemInfoSync();
    return sys.platform === "ios" ? "IOS" : "ANDROID";
  }
  function requestNotificationPermission() {
    return new Promise((resolve) => {
      if (typeof plus === "undefined") {
        resolve(false);
        return;
      }
      if (plus.os.name === "Android" && plus.android) {
        try {
          const Build = plus.android.importClass("android.os.Build");
          if (Build.VERSION.SDK_INT >= 33) {
            plus.android.requestPermissions(
              ["android.permission.POST_NOTIFICATIONS"],
              (e) => resolve(!!(e.granted && e.granted.length)),
              () => resolve(false)
            );
            return;
          }
        } catch (e) {
        }
        resolve(true);
        return;
      }
      resolve(true);
    });
  }
  function registerPushIfAllowed() {
    if (!getAccessToken())
      return Promise.resolve();
    return requestNotificationPermission().then(() => {
      return new Promise((resolve) => {
        uni.getPushClientId({
          success: async (res) => {
            const token = res && res.cid;
            if (!token) {
              resolve();
              return;
            }
            try {
              await registerPushToken({
                platform: getPushPlatform(),
                token,
                deviceId: getOrCreateDeviceId()
              });
            } catch (e) {
              formatAppLog("warn", "at utils/push.js:63", "[push] register failed", e);
            }
            resolve();
          },
          fail: () => resolve()
        });
      });
    });
  }
  function storePendingPayload(raw) {
    const data = normalizePushPayload(raw);
    if (data)
      uni.setStorageSync("pendingPushPayload", data);
  }
  function handleForegroundPush(raw) {
    if (!getAccessToken()) {
      storePendingPayload(raw);
      return;
    }
    const data = normalizePushPayload(raw);
    if (!data)
      return;
    handleRealtimeMessage(data);
    storePendingPayload(raw);
  }
  function consumePendingPushNavigation() {
    const raw = uni.getStorageSync("pendingPushPayload");
    if (!raw)
      return;
    uni.removeStorageSync("pendingPushPayload");
    if (!getAccessToken()) {
      uni.setStorageSync("pendingPushPayload", raw);
      return;
    }
    navigateFromPushPayload(raw);
  }
  function setupPushListeners() {
    if (listenersBound)
      return;
    listenersBound = true;
    try {
      uni.onPushMessage((res) => {
        const payload = res && res.data || res;
        handleForegroundPush(payload);
      });
    } catch (e) {
    }
    try {
      if (typeof plus !== "undefined" && plus.push) {
        plus.push.addEventListener("click", (msg) => {
          const payload = msg && msg.payload || msg;
          navigateFromPushPayload(payload);
        }, false);
        plus.push.addEventListener("receive", (msg) => {
          const payload = msg && msg.payload || msg;
          handleForegroundPush(payload);
        }, false);
      }
    } catch (e) {
    }
  }
  let realtimeBound = false;
  function bindRealtimeHandler() {
    if (realtimeBound)
      return;
    realtimeBound = true;
    onMessage(handleRealtimeMessage);
  }
  function onAuthSuccess() {
    bindRealtimeHandler();
    refreshUnreadCount();
    connect();
    registerPushIfAllowed();
  }
  const afterAuth = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    bindRealtimeHandler,
    onAuthSuccess
  }, Symbol.toStringTag, { value: "Module" }));
  const _sfc_main = {
    onLaunch: function() {
      setupPushListeners();
      bindRealtimeHandler();
      if (getAccessToken()) {
        onAuthSuccess();
        consumePendingPushNavigation();
      }
    },
    onShow: function() {
      if (getAccessToken()) {
        refreshUnreadCount();
        connect();
        consumePendingPushNavigation();
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_growth_task_mini_bar = resolveEasycom(vue.resolveDynamicComponent("growth-task-mini-bar"), __easycom_0);
    return vue.openBlock(), vue.createBlock(_component_growth_task_mini_bar);
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "E:/HTML/ai_grow/App.vue"]]);
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
