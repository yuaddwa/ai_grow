"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("./api.js");
let socketTask = null;
let reconnectTimer = null;
let listeners = [];
let isConnected = false;
function getWsUrl() {
  const token = utils_api.getAccessToken();
  if (!token)
    return null;
  const wsBase = utils_api.BASE_URL.replace(/^http/, "ws");
  return wsBase + "/ws/v1/chat?token=" + encodeURIComponent(token);
}
function connect() {
  if (isConnected)
    return;
  const url = getWsUrl();
  if (!url)
    return;
  socketTask = common_vendor.index.connectSocket({ url, complete: () => {
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
    const token = utils_api.getAccessToken();
    if (token)
      connect();
  }, 3e3);
}
function onMessage(fn) {
  listeners.push(fn);
}
exports.connect = connect;
exports.onMessage = onMessage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/websocket.js.map
