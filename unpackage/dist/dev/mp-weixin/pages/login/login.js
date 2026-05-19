"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    let splashPlayed = false;
    const loaded = common_vendor.ref(false);
    const splashReady = common_vendor.ref(false);
    const splashHide = common_vendor.ref(false);
    common_vendor.ref(false);
    const subShow = common_vendor.ref(false);
    const progressGo = common_vendor.ref(false);
    const rippleShow = common_vendor.ref(false);
    const shapeShow = common_vendor.ref(false);
    const waveShow = common_vendor.ref(false);
    const showPw = common_vendor.ref(false);
    const logging = common_vendor.ref(false);
    const titleChars = common_vendor.ref([
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
    const loginForm = common_vendor.ref({ email: "", password: "" });
    const canLogin = common_vendor.computed(() => {
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
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      logging.value = true;
      try {
        const res = await utils_api.login(loginForm.value.email, loginForm.value.password);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => common_vendor.index.reLaunch({ url: "/pages/index/index" }), 1e3);
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "登录失败", icon: "none" });
      } finally {
        logging.value = false;
      }
    }
    function goRegister() {
      common_vendor.index.navigateTo({ url: "/pages/register/register" });
    }
    function onForgotPw() {
      common_vendor.index.navigateTo({ url: "/pages/forgot/forgot" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !splashHide.value
      }, !splashHide.value ? {} : {}, {
        b: rippleShow.value ? 1 : "",
        c: rippleShow.value ? 1 : "",
        d: rippleShow.value ? 1 : "",
        e: splashReady.value ? 1 : "",
        f: splashReady.value ? 1 : "",
        g: !splashHide.value
      }, !splashHide.value ? {
        h: shapeShow.value ? 1 : "",
        i: shapeShow.value ? 1 : "",
        j: shapeShow.value ? 1 : "",
        k: shapeShow.value ? 1 : "",
        l: shapeShow.value ? 1 : "",
        m: shapeShow.value ? 1 : ""
      } : {}, {
        n: splashReady.value ? 1 : "",
        o: common_vendor.f(titleChars.value, (item, ci, i0) => {
          return {
            a: common_vendor.t(item.ch),
            b: ci,
            c: item.show ? 1 : ""
          };
        }),
        p: subShow.value ? 1 : "",
        q: progressGo.value ? 1 : "",
        r: splashReady.value ? 1 : "",
        s: waveShow.value ? 1 : "",
        t: splashHide.value ? 1 : "",
        v: loginForm.value.email,
        w: common_vendor.o(($event) => loginForm.value.email = $event.detail.value),
        x: !showPw.value,
        y: loginForm.value.password,
        z: common_vendor.o(($event) => loginForm.value.password = $event.detail.value),
        A: common_vendor.t(showPw.value ? "隐藏" : "显示"),
        B: common_vendor.o(($event) => showPw.value = !showPw.value),
        C: common_vendor.o(onForgotPw),
        D: canLogin.value ? 1 : "",
        E: common_vendor.o(onLogin),
        F: common_vendor.o(goRegister),
        G: loaded.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
