/**
 * Shadowrocket / Quantumult X / Loon / Surge 通用响应拦截注入脚本
 * 中山大学肿瘤防治中心 (SYSUCC) 微信挂号移动端抢号助手
 */

let body = $response.body;

if (body && typeof body === "string" && body.indexOf("</body>") !== -1) {
    const injectedCode = `
<div id="snatcher-floating-bar" style="position: fixed; top: 88px; left: 12px; right: 12px; z-index: 999999; background: rgba(15, 23, 42, 0.96); color: #f8fafc; padding: 14px 16px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', Roboto, sans-serif; font-size: 14px; border: 1.5px solid #10b981; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-sizing: border-box;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: bold; color: #34d399; font-size: 15px; display: flex; align-items: center; gap: 6px;">⚡ SYSUCC 智能抢号助手</span>
        <span id="snatcher-status-badge" style="background: #059669; color: #fff; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">就绪</span>
    </div>
    <div style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin-bottom: 10px; background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 8px;">
        <div id="snatcher-current-doc" style="color: #38bdf8; font-weight: bold; font-size: 14px;">👨⚕️ 正在检测医生与排班...</div>
        <div id="snatcher-current-patient" style="font-size: 13px;">👤 就诊人: <b style="color: #f8fafc;">检测就绪...</b></div>
        <div id="snatcher-target-date" style="color: #a7f3d0; font-size: 13px;">📅 目标日期: 智能跟随选中</div>
        <div id="snatcher-countdown-text" style="color: #fbbf24; font-weight: bold; margin-top: 2px; font-size: 13px;">⏰ 状态: 等待操作</div>
    </div>
    <div style="display: flex; gap: 10px;">
        <button id="snatcher-test-btn" style="flex: 1; background: #10b981; color: #fff; border: none; padding: 11px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); touch-action: manipulation; -webkit-tap-highlight-color: transparent;">🚀 锁号此医生</button>
        <button id="snatcher-auto-btn" style="flex: 1; background: #0284c7; color: #fff; border: none; padding: 11px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(2,132,199,0.3); touch-action: manipulation; -webkit-tap-highlight-color: transparent;">⏰ 开启准点突击</button>
    </div>
    <div id="snatcher-log-text" style="font-size: 12px; color: #94a3b8; margin-top: 6px; word-break: break-all; min-height: 16px;"></div>
</div>

<script>
(function() {
    if (window.__SYSUCC_SNATCHER_INIT__) return;
    window.__SYSUCC_SNATCHER_INIT__ = true;
    console.log("[SYSUCC Snatcher] 插件加载就绪");

    let isLockedSuccess = false;
    let autoTimer = null;

    setInterval(() => {
        const barEl = document.getElementById("snatcher-floating-bar");
        if (barEl && !document.body.contains(barEl)) {
            document.body.appendChild(barEl);
        }
        updateDocUI();
    }, 1000);

    function logUI(msg, color = '#34d399') {
        const logEl = document.getElementById("snatcher-log-text");
        if (logEl) {
            logEl.innerHTML = '<span style="color:' + color + '">' + msg + '</span>';
        }
        console.log("[Snatcher]", msg);
    }

    function findVueComponent() {
        const all = document.querySelectorAll('*');
        for (let i = 0; i < all.length; i++) {
            const v = all[i].__vue__;
            if (v && v.$http) {
                if (v.dateList || v.doctorCode || v.doctorInfo || v.selectedScheduleDate) {
                    return v;
                }
            }
        }
        for (let i = 0; i < all.length; i++) {
            const v = all[i].__vue__;
            if (v && v.$http) return v;
        }
        return null;
    }

    function updateDocUI() {
        const v = findVueComponent();
        const docEl = document.getElementById("snatcher-current-doc");
        const dateEl = document.getElementById("snatcher-target-date");
        const patientEl = document.getElementById("snatcher-current-patient");
        
        let docName = "";
        let docCode = "";
        if (v) {
            if (v.doctorInfo) {
                docName = v.doctorInfo.doctorName || v.doctorInfo.docName || "";
                docCode = v.doctorInfo.doctorCode || v.doctorInfo.doctCode || "";
            }
            if (!docCode && v.doctorCode) docCode = v.doctorCode;
        }

        if (!docCode) {
            const m = (window.location.search + "&" + window.location.hash).match(/doctorCode=([a-zA-Z0-9]+)/);
            if (m && m[1]) docCode = m[1];
        }

        if (docEl) {
            if (docName || docCode) {
                docEl.innerHTML = '👨⚕️ 医生: <b style="color:#38bdf8;">' + (docName || "目标医生") + '</b> (' + (docCode || "已识别") + ')';
            } else {
                docEl.innerHTML = '👨⚕️ 医生: 检测就绪';
            }
        }

        let currentPatient = getActivePatient(v);
        if (patientEl && currentPatient) {
            patientEl.innerHTML = '👤 就诊人: <b style="color: #f8fafc;">' + currentPatient.name + '</b> (ID: ' + currentPatient.id + ')';
        }

        if (dateEl && v && v.selectedScheduleDate) {
            const dt = new Date(Number(v.selectedScheduleDate));
            dateEl.innerHTML = '📅 目标日期: <b style="color:#fbbf24;">' + (dt.getMonth() + 1) + '月' + dt.getDate() + '日</b> (已选定)';
        }
    }

    function getActivePatient(v) {
        let pName = "";
        let pId = "";

        if (v) {
            let pObj = v.currentPatient || v.defaultPatient || v.patientInfo || (v.patient && typeof v.patient === 'object' ? v.patient : null);
            if (pObj) {
                pName = pObj.patientName || pObj.name || pObj.userName || "";
                pId = pObj.patientId || pObj.id || pObj.cardId || "";
            }
            if (!pId && v.patientId) pId = String(v.patientId);
            if (!pName && v.patientName) pName = String(v.patientName);

            if ((!pId || !pName) && v.$store && v.$store.state) {
                const s = v.$store.state;
                const sp = s.patient || s.user || s.member || {};
                const cur = sp.currentPatient || sp.defaultPatient || sp.patientInfo || {};
                pName = pName || cur.patientName || cur.name || "";
                pId = pId || cur.patientId || cur.id || "";
            }
        }

        if (!pName) {
            const pDom = document.querySelector(".patient-name, .van-dropdown-menu__title");
            if (pDom && pDom.innerText) {
                const txt = pDom.innerText.trim();
                if (txt && !txt.includes("切换") && !txt.includes("就诊人") && txt.length <= 6) {
                    pName = txt;
                }
            }
        }

        if (!pId) pId = "3495457";
        if (!pName) pName = (pId === "3495457" ? "林喜娇" : "当前就诊人");

        return { id: String(pId), name: String(pName) };
    }

    async function doLock(isRush = false) {
        if (isLockedSuccess) return;

        logUI("正在初始化锁号引擎...", "#38bdf8");
        const v = findVueComponent();
        if (!v || !v.$http) {
            logUI("❌ 未检测到底层通信模块，请点击页面任一处或刷新重试", "#f87171");
            return;
        }

        const currentPatient = getActivePatient(v);
        const patientId = currentPatient.id;
        const patientName = currentPatient.name;
        logUI("🎯 锁定就诊人: " + patientName + " (ID: " + patientId + ")", "#38bdf8");
        const urlParams = new URLSearchParams(window.location.search);
        let doctorCode = (v.doctorInfo && (v.doctorInfo.doctorCode || v.doctorInfo.doctCode)) || v.doctorCode || urlParams.get("doctorCode") || "B00786";
        let orgId = (v.doctorInfo && v.doctorInfo.orgId) || v.orgId || urlParams.get("orgId") || "01";

        let targetDateMs = v.selectedScheduleDate || null;
        if (!targetDateMs && v.dateList && v.dateList.length > 0) {
            let hasPointDate = v.dateList.find(d => d.scheduleTypeCode === 1);
            if (hasPointDate) targetDateMs = hasPointDate.scheduleDate;
            else targetDateMs = v.dateList[v.dateList.length - 1].scheduleDate;
        }

        if (!targetDateMs) {
            logUI("正在拉取医生排班日期...", "#38bdf8");
            let timeRes = await v.$http({
                url: "/register/getScheduleTimeList",
                method: "post",
                data: {
                    id: doctorCode,
                    type: 0,
                    orgId: orgId,
                    newPatientFlag: 0,
                    patientId: patientId,
                    internationalFlag: "0"
                }
            });
            if (timeRes && timeRes.data && timeRes.data.dateList && timeRes.data.dateList.length > 0) {
                let dList = timeRes.data.dateList;
                let available = dList.find(d => d.scheduleTypeCode === 1) || dList[dList.length - 1];
                targetDateMs = available.scheduleDate;
            }
        }

        if (!targetDateMs) {
            logUI("❌ 未找到可预约日期！", "#f87171");
            return;
        }

        const dateObj = new Date(Number(targetDateMs));
        const dateStr = (dateObj.getMonth() + 1) + "月" + dateObj.getDate() + "日";
        logUI("正在扫描 " + dateStr + " 的号源点位...", "#38bdf8");

        try {
            const maxAttempts = isRush ? 35 : 1;
            let available = [];
            let item = null;
            let pointList = [];
            let doctorDto = {};
            let scheduleDto = {};

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                if (isRush && attempt > 1) {
                    logUI("⚡ 正在极速轮询放号 (第 " + attempt + " 次扫描)...", "#fbbf24");
                    await new Promise(r => setTimeout(r, 200));
                }

                let pointRes = await v.$http({
                    url: "/register/getRegPointList",
                    method: "post",
                    data: {
                        doctorCode: doctorCode,
                        scheduleDate: targetDateMs,
                        orgId: orgId,
                        newPatientFlag: 0,
                        patientId: patientId,
                        internationalFlag: "0"
                    }
                });

                if (pointRes && pointRes.data && pointRes.data.length > 0) {
                    item = pointRes.data[0];
                    doctorDto = item.doctorDto || {};
                    scheduleDto = item.scheduleDto || {};
                    pointList = item.regPointList || [];

                    let withStock = pointList.filter(p => Number(p.regRemainder || 0) > 0);
                    if (withStock.length > 0) {
                        available = withStock;
                        break;
                    } else if (!isRush) {
                        available = pointList;
                        break;
                    }
                }
            }

            if (available.length === 0) {
                logUI("❌ " + dateStr + " 暂未扫描到可约余号！", "#f87171");
                return;
            }

            let targetPoint = available[0];
            const preferred = ["09:30-10:00", "09:30–10:00", "10:00-10:30", "10:00–10:30", "14:30-15:00", "15:00-15:30"];
            for (let pref of preferred) {
                let matched = available.find(p => p.pointName.includes(pref));
                if (matched) { targetPoint = matched; break; }
            }

            const regPointId = String(targetPoint.regPointId || "");
            const pointName = targetPoint.pointName;
            const schemaId = String(scheduleDto.schemaId || "");
            const regFee = String(scheduleDto.regFee || doctorDto.regFee || "50");
            const deptName = doctorDto.deptName || (v.doctorInfo && v.doctorInfo.deptName) || "头颈门诊";
            const deptCode = doctorDto.deptCode || (v.doctorInfo && v.doctorInfo.deptCode) || "11C1";
            const docName = doctorDto.doctName || doctorDto.doctorName || (v.doctorInfo && v.doctorInfo.doctorName) || "目标医生";

            logUI("⚡ 正在极速锁号: " + dateStr + " " + pointName + " (¥" + regFee + ")...", "#fbbf24");

            let occupyRes = await v.$http({
                url: "/register/occupyRegPoint",
                method: "post",
                data: {
                    patientId: patientId,
                    regPointId: regPointId,
                    schemaId: schemaId,
                    regFee: regFee,
                    seeDate: String(targetDateMs),
                    appointPeriod: pointName,
                    deptName: deptName,
                    deptCode: deptCode,
                    docCode: doctorCode,
                    docName: docName,
                    regLevel: doctorDto.regLevelName || "专家",
                    roomName: "",
                    agreeAuth: 1
                }
            });

            if (occupyRes && occupyRes.status === 0) {
                isLockedSuccess = true;
                if (autoTimer) {
                    clearInterval(autoTimer);
                    autoTimer = null;
                }
                const testBtnEl = document.getElementById("snatcher-test-btn");
                const autoBtnEl = document.getElementById("snatcher-auto-btn");
                if (testBtnEl) { testBtnEl.disabled = true; testBtnEl.style.opacity = "0.4"; }
                if (autoBtnEl) { autoBtnEl.disabled = true; autoBtnEl.style.opacity = "0.4"; }
                const badgeEl = document.getElementById("snatcher-status-badge");
                if (badgeEl) { badgeEl.innerText = "已锁号成功"; badgeEl.style.background = "#059669"; }

                logUI("🎉 抢号成功！已终止全部提交并唤起收银台...", "#10b981");

                const cacheKey = patientId + "-" + schemaId + "-" + Date.now();
                const payVal = JSON.stringify({
                    typeName: "支付",
                    typeCode: "001",
                    params: {
                        regFee: regFee,
                        orgId: orgId,
                        patientId: patientId,
                        schemaId: schemaId,
                        regPointId: regPointId,
                        dateLimit: 1800000,
                        docName: docName,
                        regLevel: doctorDto.regLevelName || "专家",
                        deptCode: deptCode,
                        deptName: deptName,
                        orgName: "越秀院区",
                        businessType: 0
                    },
                    entrance: "01",
                    cacheKey: cacheKey
                });

                await v.$http({
                    url: "/common/setRedis",
                    method: "post",
                    data: { key: cacheKey, value: payVal }
                });

                setTimeout(() => {
                    if (v.$router) {
                        v.$router.push({
                            path: "/appointment/appointmentPayWait",
                            query: { cacheKey: cacheKey }
                        });
                    } else {
                        window.location.href = "/webappm/appointModule/appointment/appointmentPayWait?cacheKey=" + cacheKey;
                    }
                }, 300);

            } else {
                logUI("⚠️ 锁号反馈: " + (occupyRes ? occupyRes.msg : "请重试"), "#f87171");
            }

        } catch (err) {
            logUI("❌ 异常中断: " + (err.message || err), "#f87171");
        }
    }

    document.addEventListener("click", function(e) {
        if (e.target && e.target.id === "snatcher-test-btn") {
            doLock(false);
        } else if (e.target && e.target.id === "snatcher-auto-btn") {
            const autoBtn = document.getElementById("snatcher-auto-btn");
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
                if (autoBtn) {
                    autoBtn.style.background = "#0284c7";
                    autoBtn.innerText = "⏰ 开启准点突击";
                }
                document.getElementById("snatcher-status-badge").innerText = "已停止";
                logUI("准点突击已取消", "#94a3b8");
                return;
            }

            if (autoBtn) {
                autoBtn.style.background = "#f59e0b";
                autoBtn.innerText = "⚡ 突击待命已就绪 (点击取消)";
            }
            document.getElementById("snatcher-status-badge").innerText = "待命中";
            logUI("已开启 16:00 准点突击待命，请保持此页面打开！", "#38bdf8");

            autoTimer = setInterval(() => {
                const now = new Date();
                const h = now.getHours();
                const m = now.getMinutes();
                const s = now.getSeconds();
                const ms = now.getMilliseconds();

                const cdEl = document.getElementById("snatcher-countdown-text");
                if (cdEl) {
                    cdEl.innerText = "⏰ 系统时钟: " + now.toLocaleTimeString() + "." + String(ms).padStart(3, '0');
                }

                if ((h === 15 && m === 59 && s === 59 && ms >= 850) || (h === 16 && m === 0 && s <= 4)) {
                    clearInterval(autoTimer);
                    autoTimer = null;
                    logUI("⚡ 放号瞬间到达！全速突击抢号中...", "#ef4444");
                    doLock(true);
                }
            }, 80);
        }
    });

})();
</script>
`;
    body = body.replace("</body>", injectedCode + "\n</body>");
    $done({ body: body });
} else {
    $done({});
}
