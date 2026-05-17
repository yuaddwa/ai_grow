"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "forgot",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const step = common_vendor.ref(1);
    const showPw = common_vendor.ref(false);
    const showPw2 = common_vendor.ref(false);
    const countdown = common_vendor.ref(0);
    const successShow = common_vendor.ref(false);
    const submitting = common_vendor.ref(false);
    const form = common_vendor.ref({
      email: "",
      code: "",
      password: "",
      confirmPassword: ""
    });
    setTimeout(() => {
      loaded.value = true;
    }, 80);
    const canVerify = common_vendor.computed(() => {
      return form.value.email && form.value.code && !submitting.value;
    });
    const canReset = common_vendor.computed(() => {
      return form.value.password && form.value.confirmPassword && form.value.password === form.value.confirmPassword && !submitting.value;
    });
    const pwStrength = common_vendor.computed(() => {
      const pw = form.value.password;
      if (!pw)
        return "";
      if (pw.length < 8)
        return "weak";
      if (pw.length < 10 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw))
        return "medium";
      return "strong";
    });
    const pwWidth = common_vendor.computed(() => {
      const s = pwStrength.value;
      if (s === "weak")
        return "33%";
      if (s === "medium")
        return "66%";
      if (s === "strong")
        return "100%";
      return "0%";
    });
    const pwText = common_vendor.computed(() => {
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
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      try {
        await utils_api.sendResetCode(form.value.email);
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
    async function verifyCode() {
      if (!form.value.email) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      if (!form.value.code) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      step.value = 2;
    }
    async function handleResetPassword() {
      if (!form.value.password || !form.value.confirmPassword) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      if (form.value.password !== form.value.confirmPassword) {
        common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
        return;
      }
      if (form.value.password.length < 8) {
        common_vendor.index.showToast({ title: "密码至少8位", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        await utils_api.resetPassword({
          account: form.value.email,
          verificationCode: form.value.code,
          newPassword: form.value.password
        });
        step.value = 3;
        setTimeout(() => {
          successShow.value = true;
        }, 200);
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "重置失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    function goLogin() {
      common_vendor.index.navigateBack();
    }
    function goBack() {
      if (step.value > 1 && step.value < 3) {
        step.value--;
      } else {
        common_vendor.index.navigateBack();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: loaded.value ? 1 : "",
        c: step.value > 1
      }, step.value > 1 ? {} : {}, {
        d: step.value >= 1 ? 1 : "",
        e: step.value > 1 ? 1 : "",
        f: step.value > 1 ? 1 : "",
        g: step.value > 2
      }, step.value > 2 ? {} : {}, {
        h: step.value >= 2 ? 1 : "",
        i: step.value > 2 ? 1 : "",
        j: step.value > 2 ? 1 : "",
        k: step.value >= 3 ? 1 : "",
        l: loaded.value ? 1 : "",
        m: step.value === 1
      }, step.value === 1 ? {
        n: form.value.email,
        o: common_vendor.o(($event) => form.value.email = $event.detail.value),
        p: form.value.code,
        q: common_vendor.o(($event) => form.value.code = $event.detail.value),
        r: common_vendor.t(countdown.value > 0 ? countdown.value + "s" : "获取验证码"),
        s: countdown.value > 0 ? 1 : "",
        t: countdown.value > 0,
        v: common_vendor.o(sendCode),
        w: canVerify.value ? 1 : "",
        x: common_vendor.o(verifyCode),
        y: step.value === 1 ? 1 : ""
      } : {}, {
        z: step.value === 2
      }, step.value === 2 ? common_vendor.e({
        A: !showPw.value,
        B: form.value.password,
        C: common_vendor.o(($event) => form.value.password = $event.detail.value),
        D: common_vendor.t(showPw.value ? "隐藏" : "显示"),
        E: common_vendor.o(($event) => showPw.value = !showPw.value),
        F: !showPw2.value,
        G: form.value.confirmPassword,
        H: common_vendor.o(($event) => form.value.confirmPassword = $event.detail.value),
        I: common_vendor.t(showPw2.value ? "隐藏" : "显示"),
        J: common_vendor.o(($event) => showPw2.value = !showPw2.value),
        K: form.value.password
      }, form.value.password ? {
        L: common_vendor.n(pwStrength.value),
        M: pwWidth.value,
        N: common_vendor.t(pwText.value),
        O: common_vendor.n(pwStrength.value)
      } : {}, {
        P: canReset.value ? 1 : "",
        Q: common_vendor.o(handleResetPassword),
        R: step.value === 2 ? 1 : ""
      }) : {}, {
        S: step.value === 3
      }, step.value === 3 ? {
        T: successShow.value ? 1 : "",
        U: common_vendor.o(goLogin),
        V: step.value === 3 ? 1 : ""
      } : {}, {
        W: loaded.value ? 1 : "",
        X: common_vendor.o(goLogin),
        Y: loaded.value ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-51689b0a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/forgot/forgot.js.map
