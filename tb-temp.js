function run () {

    // 配置整体不可用（activity / taskList 缺失）时给空表，别让快捷指令直接报红
    if (!DATA || !DATA.activity || Object.prototype.toString.call(DATA.activity.taskList) !== '[object Array]') {
        return JSON.stringify({ succes: 'ok', data: [] });
    }

    // ===== 我的推广码：唯一真源 = 配置里的 activity.mine =====
    var RE_LINK = /(?:https?:\/\/)?(?:m\.tb\.cn\/h\.)([A-Za-z0-9]{5,12})(?![A-Za-z0-9])/;
    function parseLink(v) {
        var s = String(v == null ? '' : v).replace(/^\s+|\s+$/g, '');
        if (!s) return null;
        var m = s.match(RE_LINK);
        if (m) return { code: m[1], tail: s.slice(m.index + m[0].length) };
        if (/^[A-Za-z0-9]{5,12}$/.test(s)) return { code: s, tail: '' };
        return null;
    }

    var MINE = (function () {
        var DEF = { red: 'jdsDmhk', cart: 'j36qPrS', pv: 'j36qPrS', help: '' };
        var m = (DATA && DATA.activity && DATA.activity.mine) || {};
        var keys = ['red', 'cart', 'pv', 'help'];
        var r = {};
        for (var i = 0; i < keys.length; i++) {
            var p = parseLink(m[keys[i]]);
            if (!p && DEF[keys[i]]) p = { code: DEF[keys[i]], tail: '' };
            r[keys[i]] = p ? p.code : '';
            r[keys[i] + 'Url'] = p ? ('://m.tb.cn/h.' + p.code + p.tail) : '';
        }
        r.codes = [];
        for (var j = 0; j < keys.length; j++) { if (r[keys[j]]) r.codes.push(r[keys[j]]); }
        var extra = m.codes;
        if (Object.prototype.toString.call(extra) === '[object Array]') {
            for (var k = 0; k < extra.length; k++) {
                var pe = parseLink(extra[k]);
                if (pe && r.codes.indexOf(pe.code) < 0) r.codes.push(pe.code);
            }
        }
        return r;
    })();

    // ===== 防盗校验 / 自愈 =====
    (function () {
        function isMine(c) { return MINE.codes.indexOf(c) >= 0; }
        function bare(u, defCode) {
            var p = parseLink(u);
            if (!p) return u;
            return '://m.tb.cn/h.' + (isMine(p.code) ? p.code : defCode) + p.tail;
        }
        function app(u, defCode) {
            var p = parseLink(u);
            if (!p) return u;
            return 'taobao://m.tb.cn/h.' + (isMine(p.code) ? p.code : defCode) + p.tail;
        }
        function fmt(u) {
            var p = parseLink(u);
            if (!p) return u;
            return '://m.tb.cn/h.' + p.code + p.tail;
        }

        try {
            var act = DATA.activity || {};

            var mp = act.mapping || {};
            for (var k in mp) {
                if (!mp[k] || typeof mp[k].url !== 'string') continue;
                var def = String(k).indexOf('购物车') >= 0 ? MINE.cart : MINE.red;
                mp[k].url = app(mp[k].url, def);
            }

            var tl = act.taskList || [];
            for (var i = 0; i < tl.length; i++) {
                var tk = (DATA.taskData[tl[i]] || {}).task;
                if (!tk) continue;
                var bl = tk.before;
                if (Object.prototype.toString.call(bl) !== '[object Array]') bl = [];

                var out = [];
                for (var j = 0; j < bl.length; j++) {
                    var b = bl[j];
                    if (typeof b === 'string') b = { url: b, wait: 8 };
                    if (!b || typeof b !== 'object') continue;
                    if (typeof b.url !== 'string' || !b.url) continue;
                    out.push({ url: MINE.helpUrl ? MINE.helpUrl : fmt(b.url), wait: b.wait || 8 });
                }
                if (!out.length && MINE.helpUrl) out.push({ url: MINE.helpUrl, wait: 8 });
                tk.before = out;
            }
        } catch (e) { }
    })();

    var pvStr = MINE.pv;
    var endStr = MINE.red;
    var data = [];
    var More = configValue ? configValue : 1;

    // ===== 干扰步开关（只有本临时引擎认，tb.js 没有） =====
    //   activity.noad   = true → 不插超级红包（开头 + 收尾）、不插快消蓄水
    //   activity.nohome = true → 不插淘宝首页隔断（开头 1 次 + 每 2 个任务 1 次）
    var NOAD = !!(DATA.activity && DATA.activity.noad);
    var NOHOME = !!(DATA.activity && DATA.activity.nohome);

    var taobaoScheme = {
        scheme:"taobao",
        main:"taobao://m.taobao.com/tbopen/index.html?h5Url=https://m.taobao.com",
        start: "taobao://m.tb.cn/h." + pvStr,
        end:"taobao://m.tb.cn/h." + endStr,
    }

    var ttScheme = {
        scheme:"taobaolite://m.ltao.com/open/index.html?action=ali.open.nav&h5Url=",
        main:"taobaolite://m.ltao.com/open/index.html?action=ali.open.nav&h5Url=https%3A%2F%2Fm.ltao.com%2Fhomepage%23mallPage",
        start: "taobao://m.taobao.com/tbopen/index.html?h5Url=https://m.tb.cn/h." + pvStr,
        end:"taobao://m.taobao.com/tbopen/index.html?h5Url=https://m.tb.cn/h." + endStr,
        type:"url"
    }
    var schemes = {
        1:[taobaoScheme],
        2:[ttScheme]
    }
    var scheme = schemes[More]
    var taskList = DATA.activity.taskList

    taskList = taskList.map((v) => DATA.taskData[v]).filter((v) => !!v);

    scheme.map((s) => {

        taskList.map((oneTask) => {

            var _t = oneTask.task || {};
            var itme = _t.item || [];
            var before = _t.before || [];
            var baseUrl = _t.baseurl
            var wait = _t.wait
            var paramObj = _t.param

            //before  → 助力页，第一个开
            before.map((v,i) => {
                data.push({
                    url: s.type ? s.scheme + encodeURIComponent('https' + v.url):s.scheme + v.url,
                    wait:v.wait
                })
            })

            //start  → 超级红包（第二个）
            if (!NOAD && s && s.end){
                data.push({
                    url:s.end,
                    wait:10
                })
            }
            //快消蓄水期（第三个）
            if (!NOAD && s && s.start){
                data.push({
                    url:s.start,
                    wait:8
                })
            }
            if (!NOHOME){
                data.push({
                    url:s.main,
                    wait:5
                })
            }

            // ===== 任务 =====
            // 相对 tb.js 的唯一差别：item 支持两种写法
            //   ① 字符串 "107910" 或 "107910 17"  → 老逻辑，走 baseurl 模板 + 占位参数N 替换
            //   ② 对象   {url:"://pages.tmall.com/...", wait:20} → 直跳完整地址，不走模板
            //      ⇒ 每个任务落地页不同（pages.tmall.com / pages-fast / m.duanqu.com / tb.ele.me）时用它
            itme.map((v,i) => {

                var target = ''
                var thisWait = wait
                var isObj = (v && typeof v === 'object' && typeof v.url === 'string' && v.url)

                if (isObj) {
                    target = v.url
                    if (Number(v.wait) > 0) { thisWait = Number(v.wait) }
                } else {
                    var str = String(v == null ? '' : v)
                    var params = str.split(' ')
                    target = baseUrl

                    for (var key in paramObj){
                        var paramArr = paramObj[key]
                        var reg = new RegExp('' + key,'g')
                        var pick = paramArr[Math.floor((Math.random()*paramArr.length))]
                        target = target.replace(reg,pick);
                    }
                    //替换参数2
                    params.map((pv,pi) => {
                        if (pv){
                            var num = pi+1;
                            var reg2 = new RegExp('占位参数'+num,'g')
                            target = target.replace(reg2,pv);
                        }
                    });
                    // 单项自定义停留：item 写成 "107910 17" 时，第二段纯数字即该任务的 wait
                    if (params.length > 1 && /^\d+$/.test(params[1])) { thisWait = parseInt(params[1], 10); }
                }

                data.push({
                    url:s.type ? s.scheme + encodeURIComponent('https' + target):s.scheme + target,
                    wait:thisWait
                })

                if (!NOHOME && i%2 === 0){
                    data.push({
                        url:s.main,
                        wait:5
                    })
                }
            })
            if (!NOAD && s && s.end){
                data.push({
                    url:s.end,
                    wait:5
                })
            }

        })
    })

    if (runNum > 0 && runNum != 1){
        data = data.splice(runNum - 1,data.length);
    }

    var dd = {
        succes: 'ok',
        data:data
    };

    return JSON.stringify(dd);
};
