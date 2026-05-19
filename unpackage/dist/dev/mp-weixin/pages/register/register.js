"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "register",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const showPw = common_vendor.ref(false);
    const countdown = common_vendor.ref(0);
    const submitting = common_vendor.ref(false);
    const form = common_vendor.ref({ email: "", code: "", password: "", nickname: "" });
    const canRegister = common_vendor.computed(() => {
      return form.value.email && form.value.code && form.value.password && form.value.nickname && !submitting.value;
    });
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(() => {
        setTimeout(() => {
          loaded.value = true;
        }, 50);
      });
    });
    async function sendCode() {
      if (!form.value.email) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      try {
        await utils_api.sendRegisterCode(form.value.email);
        common_vendor.index.showToast({ title: "验证码已发送", icon: "none" });
        countdown.value = 60;
        const timer = setInterval(() => {
          countdown.value--;
          if (countdown.value <= 0)
            clearInterval(timer);
        }, 1e3);
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "发送失败", icon: "none" });
      }
    }
    async function onRegister() {
      if (!form.value.email || !form.value.code || !form.value.password || !form.value.nickname) {
        common_vendor.index.showToast({ title: "请填写必要信息", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        await utils_api.register({
          email: form.value.email,
          password: form.value.password,
          nickname: form.value.nickname,
          verificationCode: form.value.code
        });
        common_vendor.index.showToast({ title: "注册成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        }, 1e3);
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "注册失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    function goLogin() {
      common_vendor.index.navigateBack();
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: form.value.email,
        c: common_vendor.o(($event) => form.value.email = $event.detail.value),
        d: form.value.code,
        e: common_vendor.o(($event) => form.value.code = $event.detail.value),
        f: common_vendor.t(countdown.value > 0 ? countdown.value + "s" : "获取验证码"),
        g: countdown.value > 0 ? 1 : "",
        h: countdown.value > 0,
        i: common_vendor.o(sendCode),
        j: !showPw.value,
        k: form.value.password,
        l: common_vendor.o(($event) => form.value.password = $event.detail.value),
        m: common_vendor.t(showPw.value ? "隐藏" : "显示"),
        n: common_vendor.o(($event) => showPw.value = !showPw.value),
        o: form.value.nickname,
        p: common_vendor.o(($event) => form.value.nickname = $event.detail.value),
        q: canRegister.value ? 1 : "",
        r: common_vendor.o(onRegister),
        s: common_vendor.o(goLogin),
        t: loaded.value ? 1 : ""
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bac4a35d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
