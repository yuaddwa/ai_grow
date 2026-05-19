"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "profile",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const uploading = common_vendor.ref(false);
    const editVisible = common_vendor.ref(false);
    const editNickname = common_vendor.ref("");
    const saving = common_vendor.ref(false);
    const avatarKey = common_vendor.ref(0);
    const userInfo = common_vendor.ref({ nickname: "", phone: "", uid: "", avatarUrl: "", weeklyHours: null });
    function fixAvatarUrl(url) {
      if (!url)
        return "";
      return url.replace(/^https?:\/\/[^\/]+/, utils_api.BASE_URL);
    }
    const stats = common_vendor.ref([
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
        const res = await utils_api.getUserInfo();
        userInfo.value = {
          nickname: res.nickname || "REDSPIDER用户",
          phone: res.phone || "",
          uid: res.uid || "",
          avatarUrl: fixAvatarUrl(res.avatarUrl),
          weeklyHours: res.weeklyHours
        };
        stats.value[0].value = res.weeklyHours != null ? res.weeklyHours + "h" : "-";
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo.value));
      } catch (e) {
        const info = common_vendor.index.getStorageSync("userInfo");
        if (info) {
          try {
            const parsed = typeof info === "string" ? JSON.parse(info) : info;
            userInfo.value = { ...userInfo.value, ...parsed };
          } catch (e2) {
          }
        }
      }
    }
    common_vendor.onMounted(() => {
      loadUserInfo();
      common_vendor.nextTick$1(() => {
        setTimeout(() => {
          loaded.value = true;
        }, 50);
      });
    });
    function goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
      }
    }
    function chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        crop: { width: 300, height: 300 },
        success: async (res) => {
          const filePath = res.tempFilePaths[0];
          uploading.value = true;
          try {
            const profile = await utils_api.uploadAvatar(filePath);
            userInfo.value.avatarUrl = fixAvatarUrl(profile.avatarUrl);
            avatarKey.value++;
            common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: e.message || "上传失败", icon: "none" });
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
        common_vendor.index.showToast({ title: "昵称不能为空", icon: "none" });
        return;
      }
      saving.value = true;
      try {
        const res = await utils_api.updateProfile({ nickname });
        userInfo.value.nickname = res.nickname || nickname;
        editVisible.value = false;
        common_vendor.index.showToast({ title: "已保存", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "保存失败", icon: "none" });
      } finally {
        saving.value = false;
      }
    }
    function onMenu(key) {
      if (key === "plan") {
        common_vendor.index.navigateTo({ url: "/pages/plans/plans" });
      } else if (key === "tasks") {
        common_vendor.index.navigateTo({ url: "/pages/tasks/tasks" });
      } else if (key === "notifications") {
        common_vendor.index.navigateTo({ url: "/pages/notifications/notifications" });
      } else if (key === "delete") {
        onDeleteAccount();
      } else {
        const labels = { stats: "数据统计", reminder: "提醒设置", feedback: "意见反馈", theme: "主题设置", about: "关于我们" };
        common_vendor.index.showToast({ title: labels[key] + "功能开发中", icon: "none" });
      }
    }
    function onLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await utils_api.logout();
            } catch (e) {
            }
            common_vendor.index.showToast({ title: "已退出登录", icon: "none" });
            setTimeout(() => {
              common_vendor.index.reLaunch({ url: "/pages/index/index" });
            }, 800);
          }
        }
      });
    }
    function onDeleteAccount() {
      common_vendor.index.showModal({
        title: "注销账号",
        content: "注销后账号将无法使用，确定要注销吗？",
        confirmColor: "#ff6b6b",
        success: async (res) => {
          if (res.confirm) {
            try {
              await utils_api.deleteAccount();
              common_vendor.index.showToast({ title: "账号已注销", icon: "none" });
              setTimeout(() => {
                common_vendor.index.reLaunch({ url: "/pages/index/index" });
              }, 800);
            } catch (e) {
              common_vendor.index.showToast({ title: e.message || "操作失败", icon: "none" });
            }
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: userInfo.value.avatarUrl
      }, userInfo.value.avatarUrl ? {
        c: userInfo.value.avatarUrl + "?t=" + avatarKey.value
      } : {}, {
        d: common_vendor.o(chooseAvatar),
        e: common_vendor.t(userInfo.value.nickname || "REDSPIDER用户"),
        f: common_vendor.t(userInfo.value.phone || "未绑定手机号"),
        g: common_vendor.o(editProfile),
        h: loaded.value ? 1 : "",
        i: common_vendor.f(stats.value, (s, i, i0) => {
          return common_vendor.e({
            a: s.key === "plans"
          }, s.key === "plans" ? {} : s.key === "days" ? {} : s.key === "streak" ? {} : s.key === "hours" ? {} : {}, {
            b: s.key === "days",
            c: s.key === "streak",
            d: s.key === "hours",
            e: s.bg,
            f: common_vendor.t(s.value),
            g: common_vendor.t(s.label),
            h: i,
            i: i * 0.1 + 0.3 + "s"
          });
        }),
        j: loaded.value ? 1 : "",
        k: loaded.value ? 1 : "",
        l: common_vendor.f(menus, (m, i, i0) => {
          return {
            a: m.bg,
            b: common_vendor.t(m.label),
            c: i,
            d: i * 0.08 + 0.5 + "s",
            e: common_vendor.o(($event) => onMenu(m.key), i)
          };
        }),
        m: loaded.value ? 1 : "",
        n: loaded.value ? 1 : "",
        o: common_vendor.o(onLogout),
        p: loaded.value ? 1 : "",
        q: editVisible.value
      }, editVisible.value ? {
        r: editNickname.value,
        s: common_vendor.o(($event) => editNickname.value = $event.detail.value),
        t: common_vendor.o(($event) => editVisible.value = false),
        v: common_vendor.t(saving.value ? "保存中..." : "保存"),
        w: saving.value ? 1 : "",
        x: saving.value,
        y: common_vendor.o(saveProfile),
        z: common_vendor.o(() => {
        }),
        A: common_vendor.o(($event) => editVisible.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
