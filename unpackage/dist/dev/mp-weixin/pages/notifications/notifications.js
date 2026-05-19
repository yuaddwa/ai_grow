"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const utils_store = require("../../utils/store.js");
const _sfc_main = {
  __name: "notifications",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const notifications = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(() => {
        setTimeout(() => {
          loaded.value = true;
        }, 50);
      });
    });
    common_vendor.onMounted(() => {
      loadNotifications();
    });
    async function loadNotifications() {
      loading.value = true;
      try {
        const res = await utils_api.getNotifications();
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
        common_vendor.index.stopPullDownRefresh();
      });
    }
    async function onReadAll() {
      try {
        await utils_api.markAllNotificationsRead();
        notifications.value.forEach((n) => {
          if (!n.readAt)
            n.readAt = (/* @__PURE__ */ new Date()).toISOString();
        });
        utils_store.store.unreadCount = 0;
        common_vendor.index.showToast({ title: "已全部标记已读", icon: "none" });
      } catch (e) {
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    }
    async function onTapNotify(item) {
      if (!item.readAt) {
        try {
          await utils_api.markNotificationRead(item.id);
          item.readAt = (/* @__PURE__ */ new Date()).toISOString();
          if (utils_store.store.unreadCount > 0)
            utils_store.store.unreadCount--;
        } catch (e) {
        }
      }
      if (item.taskId) {
        common_vendor.index.navigateTo({ url: "/pages/tasks/tasks" });
      }
    }
    function goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: notifications.value.length > 0
      }, notifications.value.length > 0 ? {
        c: common_vendor.o(onReadAll)
      } : {}, {
        d: loaded.value ? 1 : "",
        e: notifications.value.length === 0 && !loading.value
      }, notifications.value.length === 0 && !loading.value ? {} : {}, {
        f: common_vendor.f(notifications.value, (item, i, i0) => {
          return common_vendor.e({
            a: !item.readAt
          }, !item.readAt ? {} : {}, {
            b: item.type === "TASK_DUE_REMINDER"
          }, item.type === "TASK_DUE_REMINDER" ? {} : {}, {
            c: common_vendor.n(iconClass(item.type)),
            d: common_vendor.t(item.title),
            e: common_vendor.t(item.body),
            f: common_vendor.t(formatTime(item.createdAt)),
            g: item.id,
            h: common_vendor.n({
              unread: !item.readAt
            }),
            i: i * 0.06 + "s",
            j: common_vendor.o(($event) => onTapNotify(item), item.id)
          });
        }),
        g: common_vendor.n({
          show: loaded.value
        }),
        h: refreshing.value,
        i: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e30a2353"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notifications/notifications.js.map
