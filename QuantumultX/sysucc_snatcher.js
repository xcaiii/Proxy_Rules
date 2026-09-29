// Quantumult X 挂号助手注入脚本
// 中山大学肿瘤防治中心 (SYSUCC) 微信挂号

let body = $response.body;

if (body && typeof body === "string" && body.indexOf("</body>") !== -1) {
    const injectedCode = `
<script>
(function() {
    if (window.__SYSUCC_QX_HOOK__) return;
    window.__SYSUCC_QX_HOOK__ = true;

    function init() {
        if (document.getElementById("snatcher-floating-bar")) return;

        var bar = document.createElement("div");
        bar.id = "snatcher-floating-bar";
        bar.style.cssText = "position: fixed; top: 88px; left: 12px; right: 12px; z-index: 999999; background: rgba(15, 23, 42, 0.96); color: #f8fafc; padding: 14px 16px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; border: 1.5px solid #10b981; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-sizing: border-box;";
        bar.innerHTML = [
            '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">',
            '    <span style="font-weight: bold; color: #34d399; font-size: 15px; display: flex; align-items: center; gap: 6px;">⚡ SYSUCC 智能抢号助手</span>',
            '    <span id="snatcher-status-badge" style="background: #059669; color: #fff; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">就绪</span>',
            '</div>',
            '<div style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin-bottom: 10px; background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 8px;">',
            '    <div id="snatcher-current-doc" style="color: #38bdf8; font-weight: bold; font-size: 14px;">👨⚕️ 正在检测医生与排班...</div>',
            '    <div id="snatcher-current-patient" style="font-size: 13px;">👤 就诊人: <b style="color: #f8fafc;">检测就绪...</b></div>',
            '    <div id="snatcher-target-date" style="color: #a7f3d0; font-size: 13px;">📅 目标日期: 智能跟随选中</div>',
            '    <div id="snatcher-countdown-text" style="color: #fbbf24; font-weight: bold; margin-top: 2px; font-size: 13px;">⏰ 状态: 等待操作</div>',
            '</div>',
            '<div style="display: flex; gap: 10px;">',
            '    <button id="snatcher-test-btn" style="flex: 1; background: #10b981; color: #fff; border: none; padding: 11px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); touch-action: manipulation; -webkit-tap-highlight-color: transparent;">🚀 锁号此医生</button>',
            '    <button id="snatcher-auto-btn" style="flex: 1; background: #0284c7; color: #fff; border: none; padding: 11px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(2,132,199,0.3); touch-action: manipulation; -webkit-tap-highlight-color: transparent;">⏰ 开启准点突击</button>',
            '</div>',
            '<div id="snatcher-log-text" style="font-size: 12px; color: #94a3b8; margin-top: 6px; word-break: break-all; min-height: 16px;"></div>'
        ].join("");
        document.body.appendChild(bar);

        var isLockedSuccess = false;
        var autoTimer = null;

        function logUI(msg, color) {
            color = color || '#34d399';
            var logEl = document.getElementById("snatcher-log-text");
            if (logEl) {
                logEl.innerHTML = '<span style="color:' + color + '">' + msg + '</span>';
            }
        }

        function findVueComponent() {
            var all = document.querySelectorAll('*');
            for (var i = 0; i < all.length; i++) {
                var v = all[i].__vue__;
                if (v && v.$http) {
                    if (v.dateList || v.doctorCode || v.doctorInfo || v.selectedScheduleDate) {
                        return v;
                    }
                }
            }
            for (var i = 0; i < all.length; i++) {
                var v = all[i].__vue__;
                if (v && v.$http) return v;
            }
            return null;
        }

        function updateDocUI() {
            var v = findVueComponent();
            var docEl = document.getElementById("snatcher-current-doc");
            var dateEl = document.getElementById("snatcher-target-date");
            var patientEl = document.getElementById("snatcher-current-patient");
            
            var docName = "";
            var docCode = "";
            if (v) {
                if (v.doctorInfo) {
                    docName = v.doctorInfo.doctorName || v.doctorInfo.docName || "";
                    docCode = v.doctorInfo.doctorCode || v.doctorInfo.doctCode || "";
                }
                if (!docCode && v.doctorCode) docCode = v.doctorCode;
            }

            if (!docCode) {
                var m = (window.location.search + "&" + window.location.hash).match(/doctorCode=([a-zA-Z0-9]+)/);
                if (m && m[1]) docCode = m[1];
            }

            if (docEl) {
                if (docName || docCode) {
                    docEl.innerHTML = '👨⚕️ 医生: <b style="color:#38bdf8;">' + (docName || "目标医生") + '</b> (' + (docCode || "已识别") + ')';
                } else {
                    docEl.innerHTML = '👨⚕️ 医生: 检测就绪';
                }
            }

            var currentPatient = getActivePatient(v);
            if (patientEl && currentPatient) {
                patientEl.innerHTML = '👤 就诊人: <b style="color: #f8fafc;">' + currentPatient.name + '</b> (ID: ' + currentPatient.id + ')';
            }

            if (dateEl && v && v.selectedScheduleDate) {
                var dt = new Date(Number(v.selectedScheduleDate));
                dateEl.innerHTML = '📅 目标日期: <b style="color:#fbbf24;">' + (dt.getMonth() + 1) + '月' + dt.getDate() + '日</b> (已选定)';
            }
        }

        function getActivePatient(v) {
            var pName = "";
            var pId = "";

            if (v) {
                var pObj = v.currentPatient || v.defaultPatient || v.patientInfo || (v.patient && typeof v.patient === 'object' ? v.patient : null);
                if (pObj) {
                    pName = pObj.patientName || pObj.name || pObj.userName || "";
                    pId = pObj.patientId || pObj.id || pObj.cardId || "";
                }
                if (!pId && v.patientId) pId = String(v.patientId);
                if (!pName && v.patientName) pName = String(v.patientName);

                if ((!pId || !pName) && v.$store && v.$store.state) {
                    var s = v.$store.state;
                    var sp = s.patient || s.user || s.member || {};
                    var cur = sp.currentPatient || sp.defaultPatient || sp.patientInfo || {};
                    pName = pName || cur.patientName || cur.name || "";
                    pId = pId || cur.patientId || cur.id || "";
                }
            }

            if (!pName) {
                var pDom = document.querySelector(".patient-name, .van-dropdown-menu__title");
                if (pDom && pDom.innerText) {
                    var txt = pDom.innerText.trim();
                    if (txt && !txt.includes("切换") && !txt.includes("就诊人") && txt.length <= 6) {
                        pName = txt;
                    }
                }
            }

            if (!pId) pId = "3495457";
            if (!pName) pName = (pId === "3495457" ? "林喜娇" : "当前就诊人");

            return { id: String(pId), name: String(pName) };
        }

        async function doLock(isRush) {
            if (isLockedSuccess) return;

            logUI("正在初始化锁号引擎...", "#38bdf8");
            var v = findVueComponent();
            if (!v || !v.$http) {
                logUI("❌ 未检测到底层通信模块，请刷新重试", "#f87171");
                return;
            }

            var currentPatient = getActivePatient(v);
            var patientId = currentPatient.id;
            var patientName = currentPatient.name;
            logUI("🎯 锁定就诊人: " + patientName + " (ID: " + patientId + ")", "#38bdf8");
            var urlParams = new URLSearchParams(window.location.search);
            var doctorCode = (v.doctorInfo && (v.doctorInfo.doctorCode || v.doctorInfo.doctCode)) || v.doctorCode || urlParams.get("doctorCode") || "B00786";
            var orgId = (v.doctorInfo && v.doctorInfo.orgId) || v.orgId || urlParams.get("orgId") || "01";

            var targetDateMs = v.selectedScheduleDate || null;
            if (!targetDateMs && v.dateList && v.dateList.length > 0) {
                var hasPointDate = v.dateList.find(function(d) { return d.scheduleTypeCode === 1; });
                if (hasPointDate) targetDateMs = hasPointDate.scheduleDate;
                else targetDateMs = v.dateList[v.dateList.length - 1].scheduleDate;
            }

            if (!targetDateMs) {
                logUI("正在拉取医生排班日期...", "#38bdf8");
                var timeRes = await v.$http({
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
                    var dList = timeRes.data.dateList;
                    var available = dList.find(function(d) { return d.scheduleTypeCode === 1; }) || dList[dList.length - 1];
                    targetDateMs = available.scheduleDate;
                }
            }

            if (!targetDateMs) {
                logUI("❌ 未找到可预约日期！", "#f87171");
                return;
            }

            var dateObj = new Date(Number(targetDateMs));
            var dateStr = (dateObj.getMonth() + 1) + "月" + dateObj.getDate() + "日";
            logUI("正在扫描 " + dateStr + " 的号源点位...", "#38bdf8");

            try {
                var maxAttempts = isRush ? 35 : 1;
                var available = [];
                var item = null;
                var pointList = [];
                var doctorDto = {};
                var scheduleDto = {};

                for (var attempt = 1; attempt <= maxAttempts; attempt++) {
                    if (isRush && attempt > 1) {
                        logUI("⚡ 正在极速轮询放号 (第 " + attempt + " 次扫描)...", "#fbbf24");
                        await new Promise(function(r) { setTimeout(r, 200); });
                    }

                    var pointRes = await v.$http({
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

                        var withStock = pointList.filter(function(p) { return Number(p.regRemainder || 0) > 0; });
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

                var targetPoint = available[0];
                var preferred = ["09:30-10:00", "09:30–10:00", "10:00-10:30", "10:00–10:30", "14:30-15:00", "15:00-15:30"];
                for (var i = 0; i < preferred.length; i++) {
                    var pref = preferred[i];
                    var matched = available.find(function(p) { return p.pointName.includes(pref); });
                    if (matched) { targetPoint = matched; break; }
                }

                var regPointId = String(targetPoint.regPointId || "");
                var pointName = targetPoint.pointName;
                var schemaId = String(scheduleDto.schemaId || "");
                var regFee = String(scheduleDto.regFee || doctorDto.regFee || "50");
                var deptName = doctorDto.deptName || (v.doctorInfo && v.doctorInfo.deptName) || "头颈门诊";
                var deptCode = doctorDto.deptCode || (v.doctorInfo && v.doctorInfo.deptCode) || "11C1";
                var docName = doctorDto.doctName || doctorDto.doctorName || (v.doctorInfo && v.doctorInfo.doctorName) || "目标医生";

                logUI("⚡ 正在极速锁号: " + dateStr + " " + pointName + " (¥" + regFee + ")...", "#fbbf24");

                var occupyRes = await v.$http({
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
                    var testBtnEl = document.getElementById("snatcher-test-btn");
                    var autoBtnEl = document.getElementById("snatcher-auto-btn");
                    if (testBtnEl) { testBtnEl.disabled = true; testBtnEl.style.opacity = "0.4"; }
                    if (autoBtnEl) { autoBtnEl.disabled = true; autoBtnEl.style.opacity = "0.4"; }
                    var badgeEl = document.getElementById("snatcher-status-badge");
                    if (badgeEl) { badgeEl.innerText = "已锁号成功"; badgeEl.style.background = "#059669"; }

                    logUI("🎉 抢号成功！已终止全部提交并唤起收银台...", "#10b981");

                    var cacheKey = patientId + "-" + schemaId + "-" + Date.now();
                    var payVal = JSON.stringify({
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

                    setTimeout(function() {
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

        document.getElementById("snatcher-test-btn").onclick = function() {
            doLock(false);
        };

        document.getElementById("snatcher-auto-btn").onclick = function() {
            var autoBtn = document.getElementById("snatcher-auto-btn");
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

            autoTimer = setInterval(function() {
                var now = new Date();
                var h = now.getHours();
                var m = now.getMinutes();
                var s = now.getSeconds();
                var ms = now.getMilliseconds();

                var cdEl = document.getElementById("snatcher-countdown-text");
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
        };

        setInterval(updateDocUI, 1000);
        updateDocUI();
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(init, 1200);
    } else {
        window.addEventListener("DOMContentLoaded", function() {
            setTimeout(init, 1200);
        });
    }
})();
</script>
`;
    body = body.replace("</body>", injectedCode + "\n</body>");
    $done({ body: body });
} else {
    $done({});
}
