"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "plans",
  setup(__props) {
    const loaded = common_vendor.ref(false);
    const weeks = ["日", "一", "二", "三", "四", "五", "六"];
    const today = /* @__PURE__ */ new Date();
    const curYear = common_vendor.ref(today.getFullYear());
    const curMonth = common_vendor.ref(today.getMonth() + 1);
    const selectedDate = common_vendor.ref(formatDate(today));
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(() => {
        setTimeout(() => {
          loaded.value = true;
        }, 50);
      });
    });
    function formatDate(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    const calendarDays = common_vendor.computed(() => {
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
        const hasPlan = allPlans.value.some((p) => p.date === full);
        days.push({ day: d, full, isToday, hasPlan });
      }
      return days;
    });
    const allPlans = common_vendor.ref([
      { id: 1, name: "晨会", time: "09:00 - 09:30", date: formatDate(today), color: "#7b6df0", done: false },
      { id: 2, name: "开发任务", time: "10:00 - 12:00", date: formatDate(today), color: "#67c23a", done: false },
      { id: 3, name: "午餐", time: "12:00 - 13:00", date: formatDate(today), color: "#e6a23c", done: true },
      { id: 4, name: "项目复盘", time: "15:00 - 16:00", date: formatDate(today), color: "#f56c6c", done: false }
    ]);
    const addDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return formatDate(d);
    };
    allPlans.value.push(
      { id: 5, name: "会议", time: "10:00 - 11:00", date: addDays(1), color: "#7b6df0", done: false },
      { id: 6, name: "健身", time: "14:00 - 15:30", date: addDays(1), color: "#67c23a", done: false },
      { id: 7, name: "学习", time: "20:00 - 22:00", date: addDays(1), color: "#409eff", done: false },
      { id: 8, name: "阅读", time: "08:00 - 09:00", date: addDays(3), color: "#e6a23c", done: false },
      { id: 9, name: "团队周会", time: "10:00 - 11:30", date: addDays(5), color: "#f56c6c", done: false },
      { id: 10, name: "健身", time: "18:00 - 19:30", date: addDays(5), color: "#67c23a", done: false },
      { id: 11, name: "月度总结", time: "14:00 - 16:00", date: addDays(-2), color: "#7b6df0", done: true },
      { id: 12, name: "需求评审", time: "10:00 - 11:00", date: addDays(-2), color: "#e6a23c", done: true }
    );
    const selectedPlans = common_vendor.computed(() => {
      return allPlans.value.filter((p) => p.date === selectedDate.value);
    });
    const selectedLabel = common_vendor.computed(() => {
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
    function toggleDone(p) {
      p.done = !p.done;
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function addPlan() {
      common_vendor.index.showToast({ title: "添加计划功能开发中", icon: "none" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(addPlan),
        c: common_vendor.o(prevMonth),
        d: common_vendor.t(curYear.value),
        e: common_vendor.t(curMonth.value),
        f: common_vendor.o(nextMonth),
        g: common_vendor.f(weeks, (w, k0, i0) => {
          return {
            a: common_vendor.t(w),
            b: w
          };
        }),
        h: common_vendor.f(calendarDays.value, (d, i, i0) => {
          return common_vendor.e({
            a: common_vendor.t(d.day || ""),
            b: d.hasPlan && d.day
          }, d.hasPlan && d.day ? {} : {}, {
            c: i,
            d: !d.day ? 1 : "",
            e: d.isToday ? 1 : "",
            f: d.full === selectedDate.value ? 1 : "",
            g: d.hasPlan ? 1 : "",
            h: common_vendor.o(($event) => d.day && selectDate(d.full), i)
          });
        }),
        i: loaded.value ? 1 : "",
        j: selectedDate.value
      }, selectedDate.value ? {
        k: common_vendor.t(selectedLabel.value),
        l: common_vendor.t(selectedPlans.value.length)
      } : {}, {
        m: common_vendor.f(selectedPlans.value, (p, pi, i0) => {
          return common_vendor.e({
            a: p.color,
            b: common_vendor.t(p.name),
            c: p.done ? 1 : "",
            d: common_vendor.t(p.time),
            e: p.done
          }, p.done ? {} : {}, {
            f: p.done ? 1 : "",
            g: common_vendor.o(($event) => toggleDone(p), p.id),
            h: p.id,
            i: pi * 0.08 + "s"
          });
        }),
        n: loaded.value ? 1 : "",
        o: selectedPlans.value.length === 0
      }, selectedPlans.value.length === 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-80c07444"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/plans/plans.js.map
