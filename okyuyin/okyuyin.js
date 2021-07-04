/*
OK语音
10W分兑换100K币,可提现
每日任务具体多少没算,反正都是挂着脚本,10w分可兑换100K币
打开任务界面抓包 auth
提现必须人脸实名,玩不玩随意阿。
export okAuth=""
export oksource ="android" //或ios
也可以邀请人 ,A邀请B,A得三块,B邀请C,B得三块,(一个号一次),都发红包转给A然后凑100提现
https://t.me/wenmou_car
[task_local]
#OK语音
0-59/6 8-14 * * * https://raw.githubusercontent.com/Wenmoux/scripts/wen/other/okyuyin.js, tag=OK语音, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true 
#loon
[Script]
http-request api.new.okyuyin.com.* script-path=https://raw.githubusercontent.com/Wenmoux/scripts/wen/other/okyuyin.js, requires-body=true, timeout=10, tag=OK语
cron "0-59/6 8-14 * * *" script-path=https://raw.githubusercontent.com/Wenmoux/scripts/wen/other/okyuyin.js
[MITM]
hostname = api.new.okyuyin.com
*/
const $ = new Env('OK语音');
const notify = $.isNode() ? require('./sendNotify') : '';
const okSource = $.isNode() ? (process.env.oksource ? process.env.oksource : "android") : ($.getdata('oksource') ? $.getdata('oksource') : "ios")
const okAuth = $.isNode() ? (process.env.okAuth ? process.env.okAuth : "") : ($.getdata('okAuth') ? $.getdata('okAuth') : "")
let okauthArr = []
if (okAuth.match("&")) {
    okauthArr = okAuth.split("&")
} else {
    okauthArr = [okAuth]
}
message = ""
!(async () => {
        if (typeof $request !== "undefined") {
             await getauth()
        }
        if (!okauthArr[0]) {
            $.msg($.name, '【提示】请先获取cookie', '自行应用商店下载ok语音app抓包请求头里authorization', {
                "open-url": ""
            });
            return;
        }
        console.log(`共${okauthArr.length}个账号`)
        for (let k = 0; k < okauthArr.length; k++) {
            $.canRead = true
            $.isLogin = true
            $.message = ""
            auth = okauthArr[k];
            console.log(`--------账号 ${k+1} 任务执行中--------\n`)
            await sign()
            await getInfo()
            if ($.isLogin) {
                await ao()
                await getaskList()
                for (p = 0; p < $.taskList.length; p++) {
                    let task = $.taskList[p]
                    console.log(`去做任务：${task.title}  ${task.finishNums}/${task.dayFinishToplimit} ${task.taskStatus} `)
                    await receivetask(task.taskType)
                }
                await getInfo()
                if ($.message.length != 0) {
                    message +=  "账号" +(k+1)+ "：  " + $.message + " \n"
                }
            } else {
                $.msg($.name, "", `OK 账号${k+1}auth已失效`)
                
            }
            console.log("\n\n")
        }

         date = new Date()
        if ($.isNode() &&date.getHours() == 11 && date.getMinutes()<10) {
            if (message.length != 0) {
                   await notify.sendNotify("OK语音", `${message}\n\n吹水群：https://t.me/xiubuye`);
            }
        } else {
            $.msg($.name, "",  message)
        }

    })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
//获取活动信息


function getauth() {
    if ($request.url.indexOf("api.new.okyuyin.com") > -1) {
    if($request.headers){
         if ($request.headers.authorization || $request.headers.Authorization) $.setdata($request.headers.authorization?$request.headers.authorization:$request.headers.Authorization, "okAuth")
        if($.getdata("okAuth")){$.msg($.name, "", 'OK语音 获取数据获取成功！')}
        if ($request.headers.source) $.setdata($request.headers.source, "oksource")     
        $.setdata($request.headers["User-Agent"], "okUA")                              
        }
    }
}


function getaskList() {
    return new Promise(async (resolve) => {
        let options = taskUrl("kcircle/task/detail")
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {
                        let info = JSON.parse(data)
                        if (info.code == 200 && info.data) {
                            $.taskList = info.data.filter(x => x.taskStatus != 4 && x.taskType != 130 && x.taskType != 27 && x.taskType != 24 && x.taskType != 23)
                            console.log("任务列表：")
                            for (p = 0; p < info.data.length; p++) {
                                let task = info.data[p]
                            console.log(`    ${task.title}  ${task.finishNums}/${task.dayFinishToplimit} ${task.taskStatus} `)         
                            }
                        } else {
                            console.log(data)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function getInfo() {
    return new Promise(async (resolve) => {
        let options = taskUrl("app/summary/getMyKfraction")
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {
                        let info = JSON.parse(data)
                        if (info.code == 200) {
                            $.message = `当前${info.data.totalKfraction}K分 已提 ${info.data.converted}K币 `
                            console.log($.message)
                        } else {
                            console.log(data)
                            $.isLogin = false
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function ao() {
    return new Promise(async (resolve) => {
        let options = taskUrl("app/kcircle/answer/subjectInfo")
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {

                        let info = JSON.parse(data)
                        if (info.code == 200) {
                            console.log(info.msg)
                        } else {
                            console.log(data)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function receivetask(id) {
    return new Promise(async (resolve) => {
        let options = taskUrl("kcircle/task/receive", `taskType=${id}`)
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {
                        let info = JSON.parse(data)
                        if (info.code == 200) {
                            console.log(`    领取任务：操作成功`)
                            if (id == 25) {
                                await $.wait(60 * 1000)
                            }
                            await completetask(id)
                            await $.wait(500)
                        } else {
                            console.log("    " + info.msg)
                            if ((/奖励未领取/).test(info.msg)) {
                                await receive(id)
                            }
                        }
                        resolve(info.code)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function completetask(id) {
    return new Promise(async (resolve) => {
        options = taskPostUrl("kcircle/task/completed", {
            "commentId": "",
            "source": "",
            "taskType": id
        })
        if (id == 30) {
            options = taskPostUrl("app/kcircle/answer/complete", {})
        }
        if (id == "answervideo") {
            options = taskPostUrl("app/kcircle/answer/answerVideo", {
                "detailId": "350533068672712705",
                "recordId": "350533068672712704",
                "source": "9",
                "summaryId": "350533068672712706"
            })
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {
                        let info = JSON.parse(data)
                        if (info.code == 200) {
                            if (info.data.taskStatus == 4) {
                                console.log("    " + info.msg)
                            } else {
                                if (id == 30) {
                                    console.log(`    答题成功,活动K分${info.data.reward} 共奖励 ${info.data.rewardTotal}`)
                                    await $.wait(500);
                                    await receivetask(30)
                                    await completetask("answervideo")                                    
                                }     else   if (id == "answervideo") {
                                    console.log(`    答题激励 获得K分：${info.data.reward}`)
                                } else {
                                    console.log("    " + info.data.msg)
                                    await receive(id)
                                }
                            }
                        } else {
                            console.log("    " + info.msg)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function receive(id) {
    return new Promise(async (resolve) => {
        let options = taskUrl("kcircle/task/receiveKFraction", `taskType=${id}`)
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {
                        let info = JSON.parse(data)
                        if (info.code == 200) {
                            console.log("    " + info.data.finishVideoButton + " ：" + info.data.kfraction)
                            await receivetask(id)
                            await $.wait(800);
                        } else {
                            console.log("    " + info.msg)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function sign() {
    return new Promise(async (resolve) => {
        let options = taskUrl("kcircle/task/signIn","")
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (data) {
                        let info = JSON.parse(data)
                        if (info.code == 200) {
                            console.log("    签到结果："+info.msg)
                        } else {
                            console.log("    " + info.msg)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
function taskPostUrl(url, body) {
    return {
        url: `http://api.new.okyuyin.com/biz/${url}`,
        json: body,
        headers: {
            'Host': 'api.new.okyuyin.com',
            'user-agent': okSource=="android"? 'okhttp/4.3.1':($.getdata("okUA")?$.getdata("okUA"):"OKVoice/4.2.3 (iPad; iOS 14.5.1; Scale/2.00)"),
            'source': okSource,
            'authorization': auth,
            'content-type': 'application/json; charset=UTF-8',
        }
    }
}

function taskUrl(url, body) {
    return {
        url: `http://api.new.okyuyin.com/biz/${url}${body?("?"+body):""}`,
        headers: {
            'Host': 'api.new.okyuyin.com',
            'user-agent': okSource=="android"? 'okhttp/4.3.1':($.getdata("okUA")?$.getdata("okUA"):"OKVoice/4.2.3 (iPad; iOS 14.5.1; Scale/2.00)"),
            'source': okSource,
            'authorization': auth
        }
    }
}
function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}

function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
