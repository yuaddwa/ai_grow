"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_api = require("./utils/api.js");
const utils_websocket = require("./utils/websocket.js");
const utils_store = require("./utils/store.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/plans/plans.js";
  "./pages/login/login.js";
  "./pages/register/register.js";
  "./pages/forgot/forgot.js";
  "./pages/profile/profile.js";
  "./pages/tasks/tasks.js";
  "./pages/notifications/notifications.js";
}
const _sfc_main = {
  onLaunch: function() {
    if (utils_api.getAccessToken()) {
      utils_websocket.connect();
      utils_websocket.onMessage((data) => {
        if (data.unreadCount !== void 0) {
          utils_store.store.unreadCount = data.unreadCount;
        }
      });
    }
  },
  onShow: function() {
    if (utils_api.getAccessToken()) {
      utils_websocket.connect();
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
