// Quantumult X Script: 南方医科大学皮肤病医院 (微健康 mp.mhealth100.com) 智能挂号与准点抢号
let body = $response.body;

if (body && typeof body === "string" && body.indexOf("</body>") !== -1) {
    const injectedCode = `
<!-- 抢号悬浮窗：默认右下角，可随意拖拽与折叠 -->
<div id="smud-snatcher-bar" style="position: fixed; bottom: 20px; right: 12px; left: 12px; z-index: 999999; background: rgba(15, 23, 42, 0.96); color: #f8fafc; padding: 12px 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; max-width: 360px; margin: 0 auto; border: 1px solid #38bdf8; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-sizing: border-box; touch-action: none; user-select: none;">
    <!-- 头部栏 (拖拽把手) -->
    <div id="smud-drag-handle" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; cursor: move; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span style="font-weight: bold; color: #38bdf8; font-size: 13px; display: flex; align-items: center; gap: 4px; pointer-events: none;">⚡ 南皮 抢号助手</span>
        <div style="display: flex; align-items: center; gap: 6px;">
            <span id="smud-status-badge" style="background: #0284c7; color: #fff; padding: 2px 7px; border-radius: 9999px; font-size: 11px; font-weight: bold;">就绪</span>
            <button id="smud-toggle-btn" style="background: transparent; border: 1px solid #475569; color: #cbd5e1; border-radius: 4px; font-size: 10px; padding: 1px 5px; cursor: pointer;">折叠</button>
        </div>
    </div>

    <!-- 详细内容面板 (支持折叠) -->
    <div id="smud-content-body">
        <div style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 8px; background: rgba(0,0,0,0.35); padding: 8px 10px; border-radius: 6px;">
            <div id="smud-doc-info" style="color: #38bdf8; font-weight: bold;">👨‍⚕️ 医生: <span style="color:#fbbf24;">请点击医生主页</span></div>
            <div id="smud-dept-info" style="color: #cbd5e1;">🏥 科室: 识别中...</div>
            <div id="smud-patient-info" style="color: #f8fafc;">👤 就诊人: <b style="color: #4ade80;">自动跟随</b></div>
            
            <!-- 日期控制：支持微调与自动计算 -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 3px;">
                <span style="color: #cbd5e1;">📅 目标日期:</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <button id="smud-date-prev" style="background: #1e293b; border: 1px solid #475569; color: #38bdf8; border-radius: 3px; font-size: 10px; padding: 1px 5px; cursor: pointer;">-1天</button>
                    <b id="smud-date-text" style="color: #fbbf24; font-size: 12px; min-width: 78px; text-align: center;">计算中...</b>
                    <button id="smud-date-next" style="background: #1e293b; border: 1px solid #475569; color: #38bdf8; border-radius: 3px; font-size: 10px; padding: 1px 5px; cursor: pointer;">+1天</button>
                </div>
            </div>
            
            <!-- 首选时段设置 (过滤10点前，支持向后递延) -->
            <div style="margin-top: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span style="color: #cbd5e1;">⏱️ 首选时段:</span>
                <select id="smud-time-pref" style="background: #1e293b; color: #38bdf8; border: 1px solid #475569; border-radius: 4px; font-size: 11px; padding: 3px 6px; outline: none; max-width: 200px;">
                    <option value="10:00" selected>10:00 - 10:30 (首选)</option>
                    <option value="10:30">10:30 - 11:00</option>
                    <option value="11:00">11:00 - 11:30</option>
                    <option value="11:30">11:30 - 12:00</option>
                    <option value="14:00">14:00 - 14:30 (下午)</option>
                    <option value="14:30">14:30 - 15:00 (下午)</option>
                    <option value="15:00">15:00 - 15:30 (下午)</option>
                    <option value="15:30">15:30 - 16:00 (下午)</option>
                    <option value="16:00">16:00 - 16:30 (下午)</option>
                    <option value="16:30">16:30 - 17:00 (下午)</option>
                    <option value="17:00">17:00 - 17:30 (下午)</option>
                    <option value="ANY_AFTER_10">10:00后任意有号时段</option>
                </select>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">* 自动排除10点前班次；首选无号时按时间顺序向后递延</div>

            <div id="smud-countdown" style="color: #f43f5e; font-weight: bold; margin-top: 4px;">⏰ 状态: 等待操作</div>
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <button id="smud-test-btn" style="flex: 1; background: #10b981; color: #fff; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; box-shadow: 0 2px 6px rgba(16,185,129,0.3);">🚀 立即锁号测试</button>
            <button id="smud-rush-btn" style="flex: 1.2; background: #e11d48; color: #fff; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; box-shadow: 0 2px 6px rgba(225,29,72,0.3);">⏰ 开启20:00突击</button>
        </div>
        <div id="smud-log" style="font-size: 11px; color: #94a3b8; word-break: break-all; min-height: 14px; max-height: 50px; overflow-y: auto;"></div>
    </div>
</div>

<script>
(function() {
    if (window.__SMUD_SNATCHER_INIT__) return;
    window.__SMUD_SNATCHER_INIT__ = true;

    let isLockedSuccess = false;
    let rushInterval = null;
    let countdownInterval = null;
    let isCollapsed = false;
    let customTargetDate = null;
    const barEl = document.getElementById("smud-snatcher-bar");

    setInterval(() => {
        if (!document.getElementById("smud-snatcher-bar") && barEl) {
            document.body.appendChild(barEl);
        }
        syncPageInfo();
    }, 600);

    makeDraggable(barEl, document.getElementById("smud-drag-handle"));

    function makeDraggable(element, handle) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onPointerDown = (e) => {
            if (e.target && e.target.tagName === 'BUTTON') return;
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX;
            startY = clientY;

            const rect = element.getBoundingClientRect();
            element.style.bottom = "auto";
            element.style.right = "auto";
            element.style.left = rect.left + "px";
            element.style.top = rect.top + "px";
            initialLeft = rect.left;
            initialTop = rect.top;

            document.addEventListener(e.touches ? "touchmove" : "mousemove", onPointerMove);
            document.addEventListener(e.touches ? "touchend" : "mouseup", onPointerUp);
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const dx = clientX - startX;
            const dy = clientY - startY;
            element.style.left = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, initialLeft + dx)) + "px";
            element.style.top = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, initialTop + dy)) + "px";
        };

        const onPointerUp = () => {
            isDragging = false;
            document.removeEventListener("touchmove", onPointerMove);
            document.removeEventListener("mousemove", onPointerMove);
            document.removeEventListener("touchend", onPointerUp);
            document.removeEventListener("mouseup", onPointerUp);
        };

        handle.addEventListener("mousedown", onPointerDown);
        handle.addEventListener("touchstart", onPointerDown, { passive: false });
    }

    function log(msg, color = '#38bdf8') {
        const logEl = document.getElementById("smud-log");
        if (logEl) {
            logEl.innerHTML = '<span style="color:' + color + '">' + msg + '</span>';
        }
        console.log("[SMUD-Snatcher]", msg);
    }

    function setBadge(text, bg) {
        const b = document.getElementById("smud-status-badge");
        if (b) {
            b.innerText = text;
            b.style.background = bg;
        }
    }

    function findVueComponent() {
        const all = document.querySelectorAll('*');
        for (let i = 0; i < all.length; i++) {
            const v = all[i].__vue__;
            if (v && v.$http) {
                if (v.patientList || v.currentDeptDocDateInfo || v.regTimeList || v.doctorInfo || v.regInfos || v.doctorList) {
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

    function getReleaseDateString(offsetDays = 15) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function getActiveTargetDate() {
        if (customTargetDate) return customTargetDate;
        const v = findVueComponent();
        if (v && v.currentDeptDocDateInfo && v.currentDeptDocDateInfo.scheduleInfo && v.currentDeptDocDateInfo.scheduleInfo.regDate) {
            return v.currentDeptDocDateInfo.scheduleInfo.regDate;
        }
        return getReleaseDateString(15);
    }

    function syncPageInfo() {
        const v = findVueComponent();
        const docEl = document.getElementById("smud-doc-info");
        const deptEl = document.getElementById("smud-dept-info");
        const patientEl = document.getElementById("smud-patient-info");
        const dateTextEl = document.getElementById("smud-date-text");

        let docName = "";
        let docId = "";
        let deptName = "";
        let deptId = "";

        if (v) {
            if (v.currentDeptDocDateInfo) {
                docName = v.currentDeptDocDateInfo.doctorName || "";
                docId = v.currentDeptDocDateInfo.doctorId || "";
                deptName = decodeURIComponent(v.currentDeptDocDateInfo.scheduleInfo?.deptName || v.currentDeptDocDateInfo.deptName || "");
                deptId = v.currentDeptDocDateInfo.deptId || "";
            }
            if (!docName && v.doctorInfo) {
                docName = v.doctorInfo.doctorName || "";
                docId = v.doctorInfo.doctorId || "";
            }
            if (!deptName && v.deptName) {
                deptName = decodeURIComponent(v.deptName);
            }
            if (!deptId && v.deptId) {
                deptId = v.deptId;
            }
        }

        if (!docId) {
            const m = (window.location.search + "&" + window.location.hash).match(/doctorId=([a-zA-Z0-9]+)/);
            if (m && m[1]) docId = m[1];
        }
        if (!docName) {
            const m = (window.location.search + "&" + window.location.hash).match(/doctorName=([^&]+)/);
            if (m && m[1]) {
                try { docName = decodeURIComponent(decodeURIComponent(m[1])); } catch(e) { docName = m[1]; }
            }
        }
        if (!deptId) {
            const m = (window.location.search + "&" + window.location.hash).match(/deptId=([a-zA-Z0-9]+)/);
            if (m && m[1]) deptId = m[1];
        }
        if (!deptName) {
            const m = (window.location.search + "&" + window.location.hash).match(/deptName=([^&]+)/);
            if (m && m[1]) {
                try { deptName = decodeURIComponent(decodeURIComponent(m[1])); } catch(e) { deptName = m[1]; }
            }
        }

        if (docEl) {
            if (docName || docId) {
                docEl.innerHTML = '👨‍⚕️ 医生: <b style="color:#38bdf8;">' + (docName || "目标医生") + '</b>' + (docId ? ' (' + docId + ')' : '');
            } else {
                docEl.innerHTML = '👨‍⚕️ 医生: <b style="color:#fbbf24;">请点击医生主页</b>';
            }
        }
        if (deptEl) {
            deptEl.innerHTML = '🏥 科室: <b style="color:#cbd5e1;">' + (deptName || "皮肤科/检测就绪") + '</b>' + (deptId ? ' (' + deptId + ')' : '');
        }

        if (patientEl && v && v.patientList && v.patientList.length > 0) {
            const idx = v.currentPatientIndex !== undefined ? v.currentPatientIndex : 0;
            const p = v.patientList[idx];
            if (p) {
                patientEl.innerHTML = '👤 就诊人: <b style="color:#4ade80;">' + (p.patName || p.name || "已选定") + '</b> (' + (p.patIdno_original ? p.patIdno_original.slice(-4) : '已绑定') + ')';
            }
        }

        if (dateTextEl) {
            dateTextEl.innerText = getActiveTargetDate();
        }
    }

    async function pickBestTimeSlot(branchCode, deptId, deptName, doctorId, regDate, scheduleInfo, preferredStartTime) {
        const sId = scheduleInfo.scheduleId;
        const timeFlag = scheduleInfo.timeFlag || "1";
        
        try {
            const tUrl = '/gateway/registration/doctor/time/find?branchCode=' + branchCode + 
                         '&deptName=' + encodeURIComponent(deptName) + 
                         '&deptId=' + deptId + 
                         '&doctorId=' + doctorId + 
                         '&regDate=' + regDate + 
                         '&scheduleId=' + sId + 
                         '&timeFlag=' + timeFlag + 
                         '&ajaxConfig=true';
            const tRes = await fetch(tUrl, { credentials: 'include' });
            const tData = await tRes.json();
            
            if (tData && tData.data && Array.isArray(tData.data) && tData.data.length > 0) {
                const list = tData.data;

                const validSlots = list.filter(item => {
                    if (!item.startTime) return false;
                    const parts = item.startTime.split(':');
                    const hour = parseInt(parts[0], 10);
                    return hour >= 10;
                });

                if (validSlots.length === 0) {
                    return list[0];
                }

                if (preferredStartTime && preferredStartTime !== "ANY_AFTER_10") {
                    const prefItem = validSlots.find(x => x.startTime === preferredStartTime);
                    if (prefItem) {
                        const leave = parseInt(prefItem.regLeaveCount || "0", 10);
                        if (leave > 0 || isNaN(leave)) {
                            return prefItem;
                        }
                    }
                }

                const availableSlots = validSlots.filter(item => {
                    const leave = parseInt(item.regLeaveCount || "0", 10);
                    return leave > 0 || isNaN(leave);
                });

                if (availableSlots.length > 0) {
                    if (preferredStartTime && preferredStartTime !== "ANY_AFTER_10") {
                        const laterSlots = availableSlots.filter(x => x.startTime >= preferredStartTime);
                        if (laterSlots.length > 0) return laterSlots[0];
                    }
                    return availableSlots[0];
                }

                if (preferredStartTime && preferredStartTime !== "ANY_AFTER_10") {
                    const prefItem = validSlots.find(x => x.startTime === preferredStartTime);
                    if (prefItem) return prefItem;
                }
                return validSlots[0];
            }
        } catch (e) {
            console.warn("[SMUD] 获取分时段异常", e);
        }
        return null;
    }

    async function doLock(isRush = false) {
        if (isLockedSuccess) return;
        const v = findVueComponent();
        if (!window.App || !window.App.secret) {
            log("❌ 未检测到 window.App 加密栈", "#f43f5e");
            return;
        }

        let patient = null;
        if (v && v.patientList && v.patientList.length > 0) {
            const idx = v.currentPatientIndex !== undefined ? v.currentPatientIndex : 0;
            patient = v.patientList[idx];
        }

        if (!patient || !patient.bindingId) {
            log("❌ 请先在页面中添加/选择就诊人", "#f43f5e");
            return;
        }

        let doctorId = v?.currentDeptDocDateInfo?.doctorId || v?.doctorInfo?.doctorId || "";
        let doctorName = v?.currentDeptDocDateInfo?.doctorName || v?.doctorInfo?.doctorName || "";
        let doctorTitle = v?.currentDeptDocDateInfo?.doctorTitle || v?.doctorInfo?.doctorTitle || "医师";
        let deptId = v?.currentDeptDocDateInfo?.deptId || v?.deptId || "70";
        let deptName = v?.currentDeptDocDateInfo?.scheduleInfo?.deptName || v?.deptName || "瘢痕与创面修复";
        let branchCode = v?.tempBranchCode || "1052";
        let branchName = v?.tempBranchName || "南方医科大学皮肤病医院";
        let regDate = getActiveTargetDate();

        if (!doctorId) {
            const m = (window.location.search + "&" + window.location.hash).match(/doctorId=([a-zA-Z0-9]+)/);
            if (m && m[1]) doctorId = m[1];
        }
        if (!doctorName) {
            const m = (window.location.search + "&" + window.location.hash).match(/doctorName=([^&]+)/);
            if (m && m[1]) {
                try { doctorName = decodeURIComponent(decodeURIComponent(m[1])); } catch(e) { doctorName = m[1]; }
            }
        }

        if (!doctorId) {
            log("⚠️ 请先在页面上点击进入目标医生的【医生主页】！", "#f43f5e");
            return;
        }

        const prefEl = document.getElementById("smud-time-pref");
        const preferredStartTime = prefEl ? prefEl.value : "10:00";

        let scheduleId = "";
        let queueSn = "";
        let periodId = "";
        let startTime = "10:00";
        let endTime = "10:30";
        let timeFlag = "1";
        let treatFee = "25.0";

        if (v?.regTimeList && v.regTimeList.length > 0) {
            const timeIdx = v.currentRegTimeIndex !== undefined ? v.currentRegTimeIndex : 0;
            const tItem = v.regTimeList[timeIdx];
            scheduleId = tItem.scheduleId || v?.currentDeptDocDateInfo?.scheduleInfo?.scheduleId || "";
            periodId = tItem.periodId || "";
            queueSn = tItem.periodId || "";
            startTime = tItem.startTime || "10:00";
            endTime = tItem.endTime || "10:30";
            timeFlag = v?.currentDeptDocDateInfo?.scheduleInfo?.timeFlag || "1";
            treatFee = v?.currentDeptDocDateInfo?.scheduleInfo?.treatFee || "25.0";
        } else {
            let targetSchedule = null;
            if (v?.currentDeptDocDateInfo?.scheduleInfo) {
                targetSchedule = v.currentDeptDocDateInfo.scheduleInfo;
            }

            if (!targetSchedule || !targetSchedule.scheduleId) {
                try {
                    const sUrl = '/gateway/registration/appointment/scheduleNew/find?branchCode=' + branchCode + '&deptId=' + deptId + '&deptName=' + encodeURIComponent(deptName) + '&deptType=2&startDate=' + regDate + '&endDate=' + regDate + '&ajaxConfig=true';
                    const sRes = await fetch(sUrl, { credentials: 'include' });
                    const sData = await sRes.json();
                    if (sData && sData.data && sData.data.regInfos) {
                        for (const doc of sData.data.regInfos) {
                            if (String(doc.doctorId) === String(doctorId)) {
                                if (doc.scheduleInfos && doc.scheduleInfos.length > 0) {
                                    targetSchedule = doc.scheduleInfos[0];
                                    if (preferredStartTime >= "14:00" && doc.scheduleInfos.length > 1) {
                                        const pm = doc.scheduleInfos.find(x => x.timeFlag === "2");
                                        if (pm) targetSchedule = pm;
                                    }
                                    if (doc.doctorName) doctorName = doc.doctorName;
                                    if (doc.doctorTitle) doctorTitle = doc.doctorTitle;
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn("[SMUD] 获取排班异常", e);
                }
            }

            if (targetSchedule && targetSchedule.scheduleId) {
                scheduleId = targetSchedule.scheduleId;
                timeFlag = targetSchedule.timeFlag || "1";
                treatFee = targetSchedule.treatFee || "25.0";
                
                const bestSlot = await pickBestTimeSlot(branchCode, deptId, deptName, doctorId, regDate, targetSchedule, preferredStartTime);
                if (bestSlot) {
                    periodId = bestSlot.periodId || "";
                    queueSn = bestSlot.periodId || "";
                    startTime = bestSlot.startTime || "10:00";
                    endTime = bestSlot.endTime || "10:30";
                }
            }
        }

        if (!scheduleId) {
            log("⏳ 正在等待 " + regDate + " 放号排班...", "#fbbf24");
            return;
        }

        const nonceStr = Math.random().toString().slice(2);
        const timestamp = Date.now();
        const signObj = {
            bindingId: patient.bindingId,
            deptId: String(deptId),
            doctorId: String(doctorId),
            nonceStr: nonceStr,
            scheduleId: String(scheduleId),
            timestamp: timestamp
        };
        const signature = window.App.secret.sign(signObj);

        const payload = {
            applyId: "",
            affiliatedHospital: "",
            bindingId: patient.bindingId,
            branchCode: branchCode,
            branchName: branchName,
            countDeptId: String(deptId),
            clinicUnitId: String(deptId),
            deptId: String(deptId),
            deptName: encodeURIComponent(deptName),
            diseaseId: null,
            diseaseName: null,
            doctorId: String(doctorId),
            doctorName: doctorName || "医生",
            doctorTitle: doctorTitle || "主治医师",
            doctorLevelCode: "",
            scheduleId: String(scheduleId),
            queueSn: queueSn,
            periodId: periodId,
            serviceItemId: "",
            timeFlag: timeFlag,
            svObjectId: "1",
            svObjectName: "普通病人",
            svMode: "",
            cashFee: "0",
            treatFee: treatFee,
            regFee: "0",
            yhFee: "0.0",
            insuranFee: "",
            medicareSettleLogId: "",
            patientId: patient.patId || patient.patientId,
            idCardNo: patient.patIdno_original || patient.idCardNo,
            phone: patient.phoneNo_original || patient.phone,
            orderType: "",
            registerTypeId: "",
            startTime: startTime,
            endTime: endTime,
            regDate: regDate,
            shiftName: timeFlag === "2" ? "下午班" : "上午班",
            remark: "",
            roomAddress: "",
            connect_redirect: 1,
            guidanceCallback: "",
            ajaxConfig: true,
            isTencentHealth: "",
            tencentHealthId: "",
            alipayHealthId: "",
            nonceStr: nonceStr,
            timestamp: timestamp,
            signature: signature,
            insuranceCreditPay: "0",
            beforeDiagnosisExtend: JSON.stringify({ eventId: "gongxiangType", btnValue: "1" })
        };

        const encryptedData = window.App.secret.getAesString(JSON.stringify(payload));
        log("🚀 锁号 [" + (doctorName || doctorId) + " " + regDate + " " + startTime + "-" + endTime + "] 中...", "#38bdf8");

        try {
            const resp = await fetch("/gateway/registration/appointment/order/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                },
                body: JSON.stringify(encryptedData),
                credentials: "include"
            });
            const resJson = await resp.json();
            
            if (resJson.resultCode === "0" && resJson.data && resJson.data.orderId) {
                isLockedSuccess = true;
                if (rushInterval) clearInterval(rushInterval);
                if (countdownInterval) clearInterval(countdownInterval);
                setBadge("锁号成功!", "#10b981");
                log("🎉 抢号成功！订单号: " + resJson.data.orderId + "，时段: " + startTime + "-" + endTime + "，正在前往收银台...", "#10b981");
                setTimeout(() => {
                    window.location.href = "/pay/?orderId=" + resJson.data.orderId;
                }, 800);
            } else {
                const errMsg = resJson.resultDesc || resJson.msg || "锁号未完成";
                log("⚠️ " + errMsg, "#f43f5e");
            }
        } catch (err) {
            log("❌ 网络异常: " + err.message, "#f43f5e");
        }
    }

    function startRushMode() {
        if (rushInterval) clearInterval(rushInterval);
        if (countdownInterval) clearInterval(countdownInterval);

        setBadge("突击待命", "#f59e0b");
        log("⏰ 已进入 20:00 准点突击待命状态 (目标: " + getActiveTargetDate() + ")！", "#fbbf24");

        const cdEl = document.getElementById("smud-countdown");

        countdownInterval = setInterval(() => {
            if (isLockedSuccess) {
                clearInterval(countdownInterval);
                return;
            }
            const now = new Date();
            const target = new Date();
            target.setHours(20, 0, 0, 0);

            let diff = target.getTime() - now.getTime();

            if (diff <= -300000) {
                target.setDate(target.getDate() + 1);
                diff = target.getTime() - now.getTime();
            }

            if (diff <= 150 && diff >= -180000) {
                if (cdEl) cdEl.innerHTML = '<span style="color:#10b981;">🚀 准点放号中！极速锁号突击...</span>';
                setBadge("极速突击中", "#e11d48");
                doLock(true);
                if (!rushInterval) {
                    rushInterval = setInterval(() => {
                        if (isLockedSuccess) {
                            clearInterval(rushInterval);
                            return;
                        }
                        doLock(true);
                    }, 180);
                }
            } else if (diff > 150) {
                const totalSec = Math.floor(diff / 1000);
                const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
                const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
                const s = String(totalSec % 60).padStart(2, '0');
                const ms = String(diff % 1000).padStart(3, '0');
                if (cdEl) {
                    cdEl.innerHTML = '⏰ 倒计时: <b style="color:#f43f5e;">' + h + ':' + m + ':' + s + '.' + ms + '</b>';
                }
            }
        }, 50);
    }

    document.addEventListener("click", function(e) {
        if (e.target && e.target.id === "smud-test-btn") {
            doLock(false);
        } else if (e.target && e.target.id === "smud-rush-btn") {
            startRushMode();
        } else if (e.target && e.target.id === "smud-toggle-btn") {
            const body = document.getElementById("smud-content-body");
            const btn = document.getElementById("smud-toggle-btn");
            if (body && btn) {
                isCollapsed = !isCollapsed;
                body.style.display = isCollapsed ? "none" : "block";
                btn.innerText = isCollapsed ? "展开" : "折叠";
            }
        } else if (e.target && (e.target.id === "smud-date-prev" || e.target.id === "smud-date-next")) {
            const curDateStr = getActiveTargetDate();
            const curD = new Date(curDateStr);
            const delta = e.target.id === "smud-date-next" ? 1 : -1;
            curD.setDate(curD.getDate() + delta);
            const y = curD.getFullYear();
            const m = String(curD.getMonth() + 1).padStart(2, '0');
            const d = String(curD.getDate()).padStart(2, '0');
            customTargetDate = y + '-' + m + '-' + d;
            syncPageInfo();
            log("📅 目标日期已调整为: " + customTargetDate, "#38bdf8");
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
