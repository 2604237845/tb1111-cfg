/**
 * tj.js —— 淘宝「日常版」淘金币（sceneId=5365）任务跳转脚本
 *
 * 与 tb.js 的区别：
 *   1. item 支持「完整地址」，不再依赖统一 baseurl 模板
 *      （日常版每个任务的落地页域名都不同，没法共用一个模板）
 *   2. item 可以是字符串，也可以是对象，两种写法都认：
 *        字符串： "https://xxx/yyy?z=1|15"      竖线后面是停留秒数
 *        对象：   {"u":"https://xxx","w":15,"n":"任务名"}
 *   3. 全部走 taobao:// tbopen 容器 + encodeURIComponent，
 *      不会出现 & 被外层参数截断的问题
 *
 * 入参（由快捷指令注入）：DATA / runNum / configValue
 * 出参：{"succes":"ok","data":[{"url":"...","wait":12}, ...]}
 *
 * 🔴 断点续跑：runNum 是快捷指令里的「从第几条开始」，1 表示从头。
 *    这里统一做 slice(runNum-1)，与 tb.js 行为一致。
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
            // 已经是 App scheme 的，原样放行（支付宝类在配置里已被剔除）
            if (/^(taobao|taobaolite|tmall|alipays|alipay):\/\//i.test(u)) return u;
            if (/^https?:\/\//i.test(u)) return TBOPEN + encodeURIComponent(u);
            // 配置里统一写成 ://host/path（省掉 https 五个字符）
            if (u.indexOf('://') === 0) return TBOPEN + encodeURIComponent('https' + u);
            return u;
        }

        var list = DATA.activity.taskList || [];
        for (var li = 0; li < list.length; li++) {
            var group = DATA.taskData[list[li]];
            if (!group || !group.task) continue;

            var tk = group.task;
            var channel = tk.channel || 'browse';
            var defWait = Number(tk.wait) || 12;

            // ---- 1. 开场：日常版首页（签到 / 领金币 / 任务面板） ----
            if (group.main) {
                OUT.push({ url: wrap(group.main), wait: Number(tk.mainWait) || 8, tag: 'main' });
            }

            // ---- 2. before（助力位，日常版默认留空，保持结构兼容） ----
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
                    var p = it.split('|');
                    u = p[0];
                    if (p.length > 1 && /^\d+$/.test(p[1])) w = parseInt(p[1], 10);
                } else if (it && typeof it === 'object') {
                    u = it.u || it.url || '';
                    w = Number(it.w || it.wait) || defWait;
                    name = it.n || it.name || '';
                }
                if (!u) continue;

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

            // ---- 4. 收尾：回日常版首页，让页面刷新任务状态 ----
            if (group.endpage) {
                OUT.push({ url: wrap(group.endpage), wait: Number(tk.endWait) || 6, tag: 'end' });
            }
        }
    } catch (e) {
        return JSON.stringify({ succes: 'ok', data: [] });
    }

    // 断点续跑：runNum=1 从头；>1 从第 runNum 条开始
    var n = Number(runNum) || 1;
    if (n > 1) OUT = OUT.slice(n - 1);

    return JSON.stringify({ succes: 'ok', data: OUT });
}
