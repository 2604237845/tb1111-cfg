⚠️ 这个目录【不要删除】—— 两条快捷指令共用的「云端配置源」
=========================================================

🔴🔴🔴 铁律：以后改任务，两个源必须一起发布
-------------------------------------------------
  源① 自有域名（sites 部署）  https://tb1111-cfg2.app.workbuddy.host/
  源② GitHub（gh-proxy 反代）  2604237845/tb1111-cfg   走 https://gh-proxy.com/… 拉

  两个都保留、都要是最新的。哪个源落后，用那个源的人就拿不到新任务、或者拿到旧任务。

  怎么发：
    · GitHub     →  python _sync-to-github.py [文件名]
    · 自有域名   →  让我 deploy 一次（这是工具调用，python 脚本代替不了）
  最省事：改完直接说「发布」，我一次把两边都发完并回读校验。

  现状（2026-10-23 04:10）🟢 双源已恢复，两处逐字节一致：
    自有域名  ✅ 已重新 deploy（不再是 1677 B 那个探针版）
              tj.json 5799 B / tj.js 8230 B / tj2.js 8230 B / diag.html 5191 B
    GitHub    ✅ tj.json 5799 B / tj.js 8230 B / tj2.js 8230 B
    校验      🟢 两源 sha256 都是 见最新 sha，用哪个源跑都是 144 步
    nock 62 条/23 任务、hhle 76 条/20 任务、tj 142 条/42 任务


🔴🔴🔴 2026-10-22 19:00 发布闸门（主人质问「你没动我赛车配置吧」后加的）
-------------------------------------------------
  `_sync-to-github.py` 现在在 PUT 之前先拉远端内容逐字节比对：
  **相同就 SKIP —— 不提交、不建快照、不写发布记录。**
  实测（19:00）：nock.json / hhle.json 各跑一遍，blob sha 与最新 commit 全都没变。

  ⇒ 推日常版只写 `python _sync-to-github.py tj.json tj.js`，**别不带参数**
    （不带参数会扫 FILES 里 13 个文件，虽然现在闸门挡着，但也别去碰）。

  ⇒ 补充说明：17:46 那条 message 叫「update nock.json」的提交（d336aa4b）是**零改动的空提交**
    —— 看它的 `files[]` 是空的，就是不带参数全量推出来的。
    nock.json 内容最后一次真变化是 **17:00:24（298a6f05，+2/-1，把 106595 加回）**。
    核实命令：`gh api "repos/2604237845/tb1111-cfg/commits?path=nock.json"`


✅ 2026-10-23 02:35：自有域名【已恢复可写】—— 账号问题解决
-------------------------------------------------
  之前（10-22 18:30 ~ 10-23 02:30）deploy 一直返回 SITES_ACCOUNT_MISMATCH：
    应用 wbapp_bwhedCHq8N2jboQQfR1PQi 属于另一个账号，当前账号无权发布。
  主人切回那个账号后，同一条 deploy 一次就过（verified:true，域名没变）。

  历史症状（已消失，留档备查）：
    · https://tb1111-cfg2.app.workbuddy.host/tj.json  曾 404
    · https://tb1111-cfg2.app.workbuddy.host/tj.js    曾 404
    · 域名上一直停在 1677 B 的「任务面板探测版」

  🔴 教训：SITES_ACCOUNT_MISMATCH 是账号归属问题，**换参数/换 appId 都无效**，
     只能主人切回发布那个 app 的账号。别浪费时间重试。


⚠️ 2026-10-22 域名事故（已恢复，留个记录）
-------------------------------------------------
16:20 前后，整个 workbuddy.host 域在 .host 注册局查不到（五家 DNS 全 NXDOMAIN，
权威 SOA 来自 ns.trs-dns.com），iPhone 报「未找到使用指定主机名的服务器」。
当时临时把配置迁到 GitHub + gh-proxy.com 反代顶上。
17:38 域名恢复 —— 两套源现在并存，都可用。


【A「双十一淘金币赛车任务」→ 8917 双11能量】
  nock.json = 配置（62 条 / 23 个任务 + 助力 + 菜单链接）
              2026-10-22 16:59 加回 106595
              2026-10-23 10:26 实测收敛：106369/106370 平台又翻回 ignore=true（assets 被剥空、跑 0/1）
                            ⇒ 已移除；100531 要求浏览 15 秒，原来只给 15 秒卡在临界 ⇒ 改 100531 20
              2026-10-23 11:00 第二轮实测：新增 106736 逛余额宝攒钱节领红包（20 秒）；
                            107860 定 25 秒（15 秒要求，25 秒实测成功）；106595 保持 15 秒
  tb.js     = 脚本
  动作 #2 字典的 URL 和 fuc.url 两处都填同一串，二选一：

  ① 自有域名（更短、无第三方、无缓存延迟）
  aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3Qvbm9jay5qc29u

  ② GitHub（域名万一再出事时的顶替）
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL25vY2suanNvbg==

【B「双十一直播寻宝中国」→ 9647 寻宝中国】
  hhle.json = 配置（76 条 / 20 个任务）    hhle.js = 脚本
  · 2026-10-23 09:23：删 107969 刘维（已下架）；99323 李佳琦（人群不符）挪到最后一条试
  动作 #2 字典的 URL，二选一：

  ① 自有域名
  aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvaGhsZS5qc29u

  ② GitHub
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL2hobGUuanNvbg==

  empty.txt = 0 字节空文件（快捷指令兜底页用，别删）

  ⚠️ 换源时三个地方要一起换，只换一个会半通：
     动作 #2 字典、empty.txt 那个 URL 动作、脚本 js 那个 URL 动作
     赛车：#2 / #25 / #193      寻宝：#2 / #9 / #176

【C「日常版淘金币」→ scene 5365 日常版】
  tj.json = 配置（30 个任务 / 89 条 / 91 步 / 936 秒）  tj2.js = 脚本
  🟢 双源都在（10-23 02:35 恢复），两处 sha256 一致

  tj2.js 是什么：tj.js 的全部能力（完整地址、{u,w,n,bare} 对象、tbopen 包装、断点续跑）
  ＋ baseurl 模板（纯 id 写法）。🔴 common.url 必须指 tj2.js —— 指 tj.js 必弹「呼叫号码」。

  源①自有域名（更短、无第三方、改完立即可测）
  tj.json  https://tb1111-cfg2.app.workbuddy.host/tj.json
           aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvdGouanNvbg==
  tj2.js   https://tb1111-cfg2.app.workbuddy.host/tj2.js
           aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvdGoyLmpz

  源②GitHub（gh-proxy 反代，当前快捷指令用的就是这条）
  tj.json（动作 #2 字典的 URL 和 fuc.url 两处都填这一串）
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL3RqLmpzb24=

  tj2.js（动作 #193 那个 URL 动作）🔴 必须是 tj2.js，写成 tj.js 会弹「呼叫号码」
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL3RqMi5qcw==

  empty.txt（动作 #25）
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL2VtcHR5LnR4dA==

  换源三处（和赛车完全同位置，因为就是用赛车壳改的）：#2 / #25 / #193
  备选源（gh-proxy 打不开时换，注意 jsDelivr 有 12h 缓存，只适合换 js）：
    js → aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doLzI2MDQyMzc4NDUvdGIxMTExLWNmZ0BtYWluL3RqLmpz

  ⚠️ GitHub raw 有约 5 分钟 CDN 缓存：改完 tj.json 别立刻跑，等 5 分钟手机才拉到新的。

  当前收进配置的 42 个任务 / 92 步任务（2026-10-23 14:35 优先区置顶后定稿）
    94049 ×10 15s ｜ 94053 ×10 15s ｜ 92801 ×5 15s ｜ 106046 ×5 10s ｜ 106420 ×5 10s
    94054 ×3 15s ｜ 94055 ×3 15s ｜ 94046 ×3 15s ｜ 95180 ×2 15s
    94052 15s ｜ 44739 15s ｜ 44744 10s ｜ 44755 15s ｜ 65214 10s ｜ 67396 20s
    68042 15s ｜ 79268 15s ｜ 81835 10s ｜ 82177 10s ｜ 85202 10s ｜ 88134 10s
    88969 10s ｜ 89443 10s ｜ 91112 10s ｜ 94026 15s ｜ 94442 20s ｜ 94970 10s
    95175 10s ｜ 95830 10s ｜ 103764 15s ｜ 104787 15s ｜ 105247 10s ｜ 105475 10s
    105890 10s ｜ 107861 20s
    81053 从首页回访 15s（ENTRY_EDU，走 town/home?hd_from=20260618home）
      🔴🔴 这一条必须是【完整地址】，不能写成纯 id、不能套 baseurl 浮层页模板：
         ://pages-fast.m.taobao.com/wow/z/tmtjb/town/home?sceneId=5365
         &hd_from=20260618home&pageType=DAILY&deliveryId=81053&implId=other_1391_2488030_81053_0&hd_from_id=100089
      🔴 2026-10-23 13:40 补 pageType=DAILY：main.js 的 links.coinHomeUrl 官方入口就是
         ...&hd_from=20260618home&pageType=DAILY，前端 ENTRY_EDU 走 showHomeEntryEdu 弹窗，
         taskParams 里补 hd_from_id = activityId(=100089) 后跳这个 URL。之前只有 hd_from 没 pageType，实测 0/1。
         判定只认 hd_from；浮层页模板里没有这个参数，套上去必然判「未从首页进入」。
         2026-10-22 账本原文就是这么记的：跳的是 m.taobao.com/index.htm，
         判定看 hd_from，我们只给了 hd_from_id，missing=["hd_from"] → 不计进度。
      ✅ 改完整地址后 round3 做成（tj-durations.json：status=COMPLETE，wait_should=15）
      ⚠️ 15s 不是我拍的，是那一轮成功用的秒数；写 12s 会被提前切走导致不计进度。
  全量 = 144 步 / 约 28.1 分钟（92 步任务 + 48 次穿插首页 + 助力/红包/购物车/收尾）
  🆕 14:35 优先区置顶（主人要看这些修复的效果，全排最前面，第 5~34 步）：
    第 5 步 81053 从首页回访 15s（紧跟开头那次淘宝首页，语义才顺）
    第 7-10 步 9619/98396 搜一搜心仪宝贝 ×3
    第 11-25 步 9644/94356 好物沉浸看 ×10
    第 7 / 13 / 22 步 9651/101700 精选好货沉浸看 ×3 —— 🔴 **打散跑**，45s
       （14:25 实测：连续跑第 1 次成功、第 2/3 次异常失败 ⇒ 同一 deliveryId 连续 trigger 被拒，必须夹在别的任务中间）
    第 31 步 9651/98164 去看淘宝视频 ×1（注意：这个**不是**「逛短视频领现金」，名字不同）
    第 32 步 107885（无标题，浏览5秒，ignore=true 试跑）
    第 34 步 106632「鲜花园艺爆款超能抵」（浏览5秒，ignore=true 试跑）
    ⇒ 常规任务从第 35 步（94049）才开始；81835/82177 仍在最末（140/142 步）

  🆕 14:15 扩展场景（「今日速赚140」面板那批的真身，各自 sceneId，浮层页完整地址写法）：
    9619 / 98396 搜一搜心仪宝贝 ×3 20s
    9644 / 94356 好物沉浸看 ×10 20s
    9651 / 101700 精选好货沉浸看 ×3 35s（dur30）
    9651 / 98164 去看淘宝视频（原「逛短视频领现金」）×1 15s
    🔴 面板接口 mtop.coingame.task.panel.operate 是硬墙：h5 网关 FAIL_SYS_UNAUTHORIZED_ENTRANCE、
       acs 网关 SESSION_EXPIRED（要 App 登录态）。所以绕到这些独立场景用浮层页跑。
    ⚪ 没找到的：「看看#服饰券」「逛逛金币加抵好货」—— 9600-9860 全扫过，没有对应投放。
    ⚪ 81835 / 82177 保留但永远排最后（TAIL），今天都是人群不符。

  🔴 03:00 补进来的 6 个（之前池子快照 isToday=false 被漏掉，实测同类型都能跑）：
    94053 浏览超多好物 ×10 ｜ 95180 浏览超多好物 ×2 ｜ 65214 充话费0元起
    82177 玩消消乐领金币 ｜ 105890 逛88VIP会员甄选 ｜ 107861 你关注的商品都可抵
    ⚠️ 这 6 个是「按同类型推断可做」加进来的，还没单独实测；跑几天看金币涨没涨。

  故意排除（实测做不通，不是漏了）：
    64890/65151/65274/65773 支付宝系 SYSTEM_SWITCH（必须真跳 App，浮层页无效）
    80330 直播提现（ICE 中间页）｜ 89609 点击商品（要页面内点 3 个）
    103338 / 107542 小游戏容器 ｜ 76279 拉人 ×10（SYSTEM_SHARE）
    95210 下单 ｜ 89233 process 组 ｜ 80920 签到（进页面自动签名，塞任务里空跑）
  今天不在池（isToday=false，回来再补）：
    65214 充话费0元起 ｜ 105890 逛88VIP会员甄选 ｜ 106632 鲜花园艺爆款超能抵 ｜ 107861 你关注的商品都可抵

  🔴 停留秒数 = 账本里「成功那次」实际用的 wait_used，不是 duration+5 公式、更不是拍脑袋。
     改完必跑 _daily/verify_duration.py（拿账本反查全部任务）+ _daily/race_vs_tj.js（和赛车逐条对骨架）。

  怎么重新生成：cd _daily && python build_final3.py（满次数 + tj2.js 紧凑格式，原子写 tj.json）


【临时测试「8917 · 未完成任务」→ temp8917.json】
  temp8917.json = 配置，tb-temp.js = 脚本（tb.js 副本 + 对象 item 支持 + noad/nohome 开关）
  ① 自有域名：aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvdGVtcDg5MTcuanNvbg==
  ② GitHub   ：aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL3RlbXA4OTE3Lmpzb24=
  ⚠️ 动作193（pv 初始化 js）必须跟着换成 tb-temp.js 对应源的地


【云服务（2026-10-22 16:32 开通）】
  applicationId : wbapp_bwhedCHq8N2jboQQfR1PQi
  resourceId    : wbcs_MsSbf080SEeOXqb8EFXupr
  endpoint      : https://tb1111-cfg2.app.workbuddy.host
  billingStatus : normal   provisionStatus : assigned

  index.html = 配置看板（云端数据驱动，不缓存本地）
     · 两个场景各自的配置快照（条数 / 任务数 / sha256 指纹 / 来源）
     · 任务清单，今天实测跑不通的会划掉标红
     · 版本历史（cfg_snapshots）、下发记录（sync_runs）
     打开地址：https://tb1111-cfg2.app.workbuddy.host/index.html（域名已恢复，可正常打开）

  三张表：
    cfg_snapshots  配置快照（scene/item_count/task_count/sha256/items/payload/source/note）
                   payload 存完整配置全文，可直接回滚
    task_checks    任务实测（delivery_id/scene/status/detail/checked_on，同日同任务唯一）
    sync_runs      下发记录（scene/target/sha256/bytes/ok/message）

  权限：三张表都开了 RLS，anon + authenticated 可读写（配置是全局数据，不分用户）
  已验证：真实域名跑页面三条查询 5/29/8 行；写入 sync_runs 201 并立刻读回一致。

  ⚠️ 云服务是旁路，不参与配置分发。它挂了、数据清了，快捷指令照样跑。


改任务 / 换链接的标准流程
-----------------------
  1. 改本目录 json（格式铁律：hhle.json 紧凑单行、nock.json indent=1、都用 LF、结尾不留空行）
  2. 发布 → 两边都要发：
        python _sync-to-github.py [文件名]     推 GitHub
        让我 deploy                            推自有域名
        （脚本同时会自动写云数据库：cfg_snapshots 版本+全文、sync_runs 发布记录；
          指纹没变自动跳过建版本，不堆重复）
  3. 手机重跑快捷指令，配置 URL 不用动（选哪个源就一直用哪个）
  4. 电脑打开看板可查版本历史与任务实测

  ⚠️ 云存储（Storage）不能当快捷指令的配置源：只对登录用户开放、
     没有公开直链、签名 URL 最长 1 小时就过期。配置分发只能走上面两个源。

单项停留时长：item 里写 "107910 17" 表示该任务停 17 秒；
              不写则走 task.wait 的全局值（nock=15 / hhle=18）。

item 两种写法（nock.json / tb.js）
  ① 纯数字 id —— 走 baseurl 模板（浮层页救回计数）
       "100340"            → 用 task.wait=15
       "107860 20"         → 这一条单独停 20 秒
  ② 完整地址型 —— 照淘金币日常版小程序任务的写法，直接当落地页打开
       "://m.duanqu.com?_ariver_appid=22129413&… 12"
       ↑ 第一段是完整地址（:// 开头 = 自动补 https 并套 tbopen），第二段纯数字是秒数
       taobao:// / alipays:// / sinaweibo:// 这类 App scheme 会原样放行不套壳
     什么时候用②：**只有当地址自己就带任务身份**时才用（如 9647 直播页带 tl_sceneId/tl_deliveryId，
     落地页自己会调 scene.trigger/report）。8917 这类的 action 里**没有 deliveryId**，
     落地页拿不到任务身份 ⇒ ②永远不计数，必须用①走浮层页。
  🔴 2026-10-23 源码实证（tao-gold-srp-task-pop 的 index.chunk.js，3412 B）：
     浮层页 = queryItem(sceneId,deliveryId) → 读 assets.duration → **本页倒计时 duration 秒**
     → 调 mtop.taobao.pentaprism.scene.trigger（带 taskParams 的 implId/asac/fromToken）。
     它**根本不打开落地页**，所以小程序、支付宝、小游戏类任务照样走①就能计数。
     页面上的字就是「浏览本页面 N 秒后，可获得奖励」。
  🔴 ②只有新 tb.js 支持；老 tb.js 会把整串塞进 baseurl 的 deliveryId 位，地址就废了。
     所以 tb.js 和 nock.json 必须同版本一起发。纯数字 id 的输出与老 tb.js 逐字节一致（已实测）。

⚠️ 脚本地址在哪（2026-10-23 拆 plist 实测更正）
  A 赛车 / B 寻宝 的脚本地址是**写死在动作里**的，不是 json 的 taskData.common.url：
      A：动作 #192 是「URL」= https://tb1111-cfg2.app.workbuddy.host/tb.js，#193 下载它
      B：同位置换 hhle.js
      #2 字典 URL / fuc.url（base64）= 配置地址 https://…/nock.json
  ⇒ 改 js 逻辑 = 改本地 tb.js → **重新 deploy 自有域名**（CloudStudio 网关无 Cache-Control，发完立刻生效）→
    GitHub 再推一份存档。common.url 里的 jsDelivr 地址对赛车不起作用（只有 12 小时缓存，别指望它）。
  🔴 脚本会被塞进 data:text/html 里执行 ⇒ **js 源码里绝对不能出现井号 # 和百分号 %**。
     现在 tb.js 里的 % 只存在于 ttScheme 那几个字符串字面量（More=2 才用），没影响；新增代码不许带。
  （旧说法留档：jsDelivr 对分支引用有 12 小时缓存，真要改 js 时换文件名 hhle2.js 再改 common.url ——
   这条只对走 common.url 的壳成立，A/B 两个快捷指令不适用，见上一节。）
  配置 json 走 gh-proxy（60 秒）或自有域名（即时），日常改任务不受影响。

备用反代（gh-proxy.com 万一打不开时，把 URL 前缀换成它）：
  https://ghfast.top/https://raw.githubusercontent.com/2604237845/tb1111-cfg/main/
  https://ghproxy.net/https://raw.githubusercontent.com/2604237845/tb1111-cfg/main/

2026-10-20：CK 模式（ck.json / ck.js / tbck.js）已删除，只保留无 CK 版。
