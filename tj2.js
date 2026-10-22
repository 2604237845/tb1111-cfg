/**
 * tj2.js —— 淘宝「日常版」淘金币（sceneId=5365）任务跳转脚本
 *
 * 与 tj.js 的关系：tj.js 的**全部能力都在**（完整地址 / 对象写法 / tbopen 容器 /
 * 断点续跑 / 结构完全一致），只多一样东西 —— baseurl 模板支持。
 *
 * 为什么要有它：
 *   tj.js 要求 item 每条都写完整 URL，30 个任务跑满 56 步时配置会到 7.6 KB，
 *   逼近历史上「快捷指令秒退」的 13.6 KB 红线。改用 tb.js 那种 baseurl +
 *   纯 id 的紧凑写法后，同一份配置只有 2.x KB，比赛车（3.7 KB）还小。
 *
 * ❗ 为什么是【新文件】而不是改 tj.js：
 *   gh-proxy 有 1~2 分钟缓存，改 tj.js 会有一段时间线上还是旧脚本，
 *   旧脚本不认纯 id，会把 "94049" 当 URL 打开 —— 又弹出「呼叫号码」。
 *   新文件是全新 CDN 路径，不存在旧缓存，线上拿到的必然是带 baseurl 的版本。
 *
 * item 写法（两种都认，可混用）：
 *   1) 纯 id（走 baseurl 模板，占位参数1 会被替换）：
 *          "94049"          → 默认停留（task.wait）
 *          "67396 20"       → 该条停留 20 秒（空格分隔，和 tb.js 一致）
 *   2) 完整地址（原 tj.js 写法，竖线后面是停留秒数）：
 *          "://m.taobao.com|5"
 *          "taobao://m.tb.cn/h.jdsDmhk|10"
 *   3) 对象：{"u":"完整地址","w":15,"n":"任务名"}
 *
 * 入参（由快捷指令注入）：DATA / runNum / configValue
 * 出参：{"succes":"ok","data":[{"url":"...","wait":12}, ...]}
 *
 * 🔴 断点续跑：runNum 是快捷指令里的「从第几条开始」，1 / 0 / 空 都表示从头。
 */
function run() {
    var OUT = [];
    try {
        if (!DATA || !DATA.activity || !DATA.taskData) {
            return JSON.stringify({ succes: 'ok', data: [] });
        }

        // tbopen 容器：h5Url 必须整体 encode，否则目标地址里的 & 会被外层吃掉
        var TBOPEN = 'taobao://m.taobao.com/tbopen/index.html?h5Url=';

        function wrap(u) {
            u = String(u == null ? '' : u).replace(/^\s+|\s+$/g, '');
            if (!u) return '';
            // 已经是 App scheme 的，原样放行
            if (/^(taobao|taobaolite|tmall|alipays|alipay):\/\//i.test(u)) return u;
            if (/^https?:\/\//i.test(u)) return TBOPEN + encodeURIComponent(u);
            // 配置里统一写成 ://host/path（省掉 https 五个字符）
            if (u.indexOf('://') === 0) return TBOPEN + encodeURIComponent('https' + u);
            return u;
        }

        // 拆 "url|秒数" / "url 秒数" 两种写法的停留时间
        function splitWait(s) {
            var w = null;
            var p = String(s).split('|');
            if (p.length > 1 && /^\d+$/.test(p[1])) {
                return { u: p[0], w: parseInt(p[1], 10) };
            }
            var q = String(s).split(' ');
            if (q.length > 1 && /^\d+$/.test(q[q.length - 1])) {
                return { u: q.slice(0, q.length - 1).join(' '), w: parseInt(q[q.length - 1], 10) };
            }
            return { u: s, w: w };
        }

        var list = DATA.activity.taskList || [];
        for (var li = 0; li < list.length; li++) {
            var group = DATA.taskData[list[li]];
            if (!group || !group.task) continue;

            var tk = group.task;
            var channel = tk.channel || 'browse';
            var defWait = Number(tk.wait) || 12;
            // 🆕 baseurl 模板：item 写成纯 id 时用它拼地址
            var baseUrl = tk.baseurl || '';

            // ---- 1. 开场（留空则跳过，保持和 tj.js 一致） ----
            if (group.main) {
                OUT.push({ url: wrap(group.main), wait: Number(tk.mainWait) || 8, tag: 'main' });
            }

            // ---- 2. before（助力位） ----
            var before = tk.before || [];
            for (var bi = 0; bi < before.length; bi++) {
                var b = before[bi];
                if (!b) continue;
                if (typeof b === 'string') OUT.push({ url: wrap(b), wait: 8, tag: 'before' });
                else if (b.url) OUT.push({ url: wrap(b.url), wait: Number(b.wait) || 8, tag: 'before' });
            }

            // ---- 3. 任务本体 ----
            var items = tk.item || [];
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                var u = '', w = defWait, name = '';

                if (typeof it === 'string') {
                    var s = String(it).replace(/^\s+|\s+$/g, '');
                    // 🆕 纯数字 id（可带 "id 秒数"）→ 走 baseurl 模板
                    if (baseUrl && /^\d{4,}( \d+)?$/.test(s)) {
                        var sp = s.split(' ');
                        u = baseUrl.replace(/占位参数1/g, sp[0]);
                        if (sp.length > 1) w = parseInt(sp[1], 10);
                    } else {
                        var sw = splitWait(s);
                        u = sw.u;
                        if (sw.w != null) w = sw.w;
                    }
                } else if (it && typeof it === 'object') {
                    u = it.u || it.url || '';
                    w = Number(it.w || it.wait) || defWait;
                    name = it.n || it.name || '';
                }
                if (!u) continue;
                if (!(w > 0)) w = defWait;

                // entry 通道：让落地页自己调 scene.trigger（从任务入口回访那套）
                if (channel === 'entry' && it && it.asac) {
                    u += (u.indexOf('?') >= 0 ? '&' : '?') + 'isFromTask=true&taskAsac=' + it.asac;
                    w = Math.min(w, 6);
                }
                OUT.push({ url: wrap(u), wait: w, tag: name || ('task' + i) });

                // both 通道：先入口触发，再正常浏览兜底
                if (channel === 'both' && it && typeof it === 'object' && it.bare) {
                    OUT.push({ url: wrap(it.bare), wait: w, tag: (name || 'task') + '-browse' });
                }
            }

            // ---- 4. 收尾 ----
            if (group.endpage) {
                OUT.push({ url: wrap(group.endpage), wait: Number(group.endWait || tk.endWait) || 6, tag: 'end' });
            }
        }
    } catch (e) {
        return JSON.stringify({ succes: 'ok', data: [] });
    }

    // 断点续跑：runNum=1 / 0 / 空 都从头；>1 从第 runNum 条开始
    var n = Number(runNum) || 1;
    if (n > 1) OUT = OUT.slice(n - 1);

    return JSON.stringify({ succes: 'ok', data: OUT });
}
