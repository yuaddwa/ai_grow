"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "tasks",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const activeTab = common_vendor.ref("");
    const tasks = common_vendor.ref([]);
    const tabs = [
      { label: "全部", value: "" },
      { label: "进行中", value: "OPEN" },
      { label: "已完成", value: "DONE" },
      { label: "已取消", value: "CANCELLED" }
    ];
    setTimeout(() => {
      loaded.value = true;
    }, 80);
    common_vendor.onMounted(() => {
      loadTasks();
    });
    async function loadTasks() {
      loading.value = true;
      try {
        const res = await utils_api.getMyTasks(activeTab.value || void 0);
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
        common_vendor.index.stopPullDownRefresh();
      });
    }
    function goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
      }
    }
    function onTaskTap(task) {
      common_vendor.index.showToast({ title: task.title, icon: "none" });
    }
    function statusClass(status) {
      return { OPEN: "open", DONE: "done", CANCELLED: "cancelled" }[status] || "open";
    }
    function statusText(status) {
      return { OPEN: "进行中", DONE: "已完成", CANCELLED: "已取消" }[status] || "进行中";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: loaded.value ? 1 : "",
        c: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: tab.value,
            c: activeTab.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => switchTab(tab.value), tab.value)
          };
        }),
        d: loaded.value ? 1 : "",
        e: tasks.value.length === 0 && !loading.value
      }, tasks.value.length === 0 && !loading.value ? {} : {}, {
        f: common_vendor.f(tasks.value, (task, i, i0) => {
          return common_vendor.e({
            a: common_vendor.n(statusClass(task.status)),
            b: common_vendor.t(task.title),
            c: task.description
          }, task.description ? {
            d: common_vendor.t(task.description)
          } : {}, {
            e: task.dueDate
          }, task.dueDate ? {
            f: common_vendor.t(task.dueDate)
          } : {}, {
            g: common_vendor.t(statusText(task.status)),
            h: common_vendor.n(statusClass(task.status)),
            i: task.id,
            j: i * 0.08 + "s",
            k: common_vendor.o(($event) => onTaskTap(task), task.id)
          });
        }),
        g: loaded.value ? 1 : "",
        h: refreshing.value,
        i: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-027feebf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tasks/tasks.js.map
