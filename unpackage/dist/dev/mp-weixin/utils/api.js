"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://192.168.3.3:8080";
function getAccessToken() {
  return common_vendor.index.getStorageSync("accessToken") || "";
}
function getRefreshToken() {
  return common_vendor.index.getStorageSync("refreshToken") || "";
}
function saveTokens(data) {
  if (data.accessToken)
    common_vendor.index.setStorageSync("accessToken", data.accessToken);
  if (data.refreshToken)
    common_vendor.index.setStorageSync("refreshToken", data.refreshToken);
  if (data.uid)
    common_vendor.index.setStorageSync("uid", data.uid);
  common_vendor.index.setStorageSync("isLogin", true);
}
function clearTokens() {
  common_vendor.index.removeStorageSync("accessToken");
  common_vendor.index.removeStorageSync("refreshToken");
  common_vendor.index.removeStorageSync("uid");
  common_vendor.index.removeStorageSync("isLogin");
  common_vendor.index.removeStorageSync("userInfo");
}
function request(options) {
  return new Promise((resolve, reject) => {
    const { url, method = "POST", data = {}, auth = false } = options;
    const header = { "Content-Type": "application/json" };
    if (auth) {
      header["Authorization"] = "Bearer " + getAccessToken();
    }
    common_vendor.index.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 401 && auth) {
          refreshToken().then(() => {
            header["Authorization"] = "Bearer " + getAccessToken();
            common_vendor.index.request({
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
            common_vendor.index.reLaunch({ url: "/pages/login/login" });
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
    common_vendor.index.request({
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
    common_vendor.index.uploadFile({
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
      common_vendor.index.uploadFile({
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
          if (msg.includes("exceed max upload") && tried < 3) {
            tried++;
            common_vendor.index.__f__("warn", "at utils/api.js:281", "uploadFile retry", tried, "in", tried * 500, "ms");
            setTimeout(doUpload, tried * 500);
          } else {
            reject({ code: "NETWORK_ERROR", message: "上传失败" });
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
exports.BASE_URL = BASE_URL;
exports.deleteAccount = deleteAccount;
exports.getAccessToken = getAccessToken;
exports.getMyTasks = getMyTasks;
exports.getNotifications = getNotifications;
exports.getUnreadCount = getUnreadCount;
exports.getUserInfo = getUserInfo;
exports.login = login;
exports.logout = logout;
exports.markAllNotificationsRead = markAllNotificationsRead;
exports.markNotificationRead = markNotificationRead;
exports.register = register;
exports.resetPassword = resetPassword;
exports.sendChatMessage = sendChatMessage;
exports.sendRegisterCode = sendRegisterCode;
exports.sendResetCode = sendResetCode;
exports.transcribeAudio = transcribeAudio;
exports.updateProfile = updateProfile;
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
