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

🔴🔴 2026-10-24 10:20 新发现：自有域名的 json 会被 CDN 缓存（不是即时生效）
-------------------------------------------------
  现象：deploy 返回 verified:true、GitHub 也推成功了，但裸地址
        https://tb1111-cfg2.app.workbuddy.host/nock.json 仍返回**旧字节**，
        响应头带 `age: 245`（还在涨）、`cache-control` 为空 ⇒ 是边缘节点缓存的。
  但同一路径加个随便的查询串（`?x=1`）就返回**新内容** ⇒ 说明**源站已经更新了**，
  只是裸路径的缓存键还在吐旧副本。
  ⇒ 回读校验必须分两步：
      ① 加 `?t=<毫秒时间戳>` 打源站 → 证明源站是新的
      ② 轮询裸地址 → 等 `age` 归零 / 内容变成新 sha，才算「用户真的能拿到」
  🔴 实测细节（2026-10-24 10:19 deploy，10:41 仍在吐旧）：
       裸地址   EO-Cache-Status: HIT  | Last-Modified: 23 Oct 16:44:24 GMT（=10-24 00:44 那版）
                Age 从 11 一路涨到 1313（≈22 分钟仍未过期）
       ?z=xxx   EO-Cache-Status: MISS | Last-Modified: 24 Oct 02:19:13 GMT（=10:19 新写的）
                Content-Length 4297 ⇒ **源站确实是新文件**
     ⇒ 结论：deploy 换掉了源站文件，但 EdgeOne 边缘节点把**裸路径**旧对象钉住了，
       大约 10:19:40 抓的，TTL 明显长于 20 分钟（可能 1 小时）。deploy 本身**不会清缓存**。
     ⇒ 应对：
       ① 影响小就先等（本例只差 2 个死条目，多跑 30 秒）；
       ② 急着要新配置 → 把快捷指令的配置地址临时加查询串（`…nock.json?v=2`），
          换了 cache key 立刻就是新的；
       ③ 或者干脆切到 GitHub 那条（gh-proxy 60 秒就新，没有这个问题）。
     ⇒ **发完别立刻用手机测**，很可能测到旧配置。

  🔴 2026-10-24 11:04 补一条「缓存逃生口」实测：
       新文件名（如 nock2.json，内容与 nock.json 逐字节相同）
         → 裸地址第一次请求就是 MISS、立刻拿到新内容 ✅
       老文件名 nock.json（已缓存）
         → 连续 5 次 deploy（10:19 / 10:24 / 10:45 / 11:03 / 11:04）全都拉不动，
           Age 涨到 2104 秒（35 分钟）仍是 HIT、仍吐 10-23 16:44 那版
     ⇒ 结论：deploy **不会**清 EdgeOne 缓存，只能等 TTL；想让用户立刻拿到，只能换 URL。
     ⇒ 所以：`nock2.json` 是 nock.json 的**同内容镜像**，专门用来「立刻生效」。
        改了 nock.json 之后如果马上要用，就 `cp nock.json nock2.json` 再 deploy 一次，
        把快捷指令地址临时指到 nock2.json。
     ⚠️ nock2.json 不是长期方案 —— 它自己也会被缓存，下一轮同样会卡。
        **长期正确做法：急用的发布走 GitHub 源（gh-proxy 60 秒就新，不受此影响）。**

  🟢 2026-10-24 11:12 追问「以后改东西也立即生效吗」→ 做了真实内容变更实验：
       · nock2.json 加探针再 deploy：前 20 秒还 HIT 吐旧，**+20 秒 MISS 拿到新内容**
       · 去掉探针再 deploy：立刻变回正确内容
       · 同期 nock.json：Age 2608 秒（43 分钟）仍 HIT 旧 ⇒ **只有它被钉死，不是全站问题**
       · 新建 ttl.txt / ttl.json 写 A→改 B：**1 秒内**就变
     ⇒ **结论：nock2.json 这类路径 TTL 约 30~45 秒，改完发布半分钟内必生效，可以当日常配置源。**
     ⚠️ 但它万一日后被高频请求变"热"，理论上可能重演 nock.json 那种钉死；真遇到就再换个名字。
     ⚠️ **deploy 只加不删**：删掉的 ttl.json 在源站仍取得到（12 B 垃圾）。
        ⇒ 别往站点目录放临时文件，放过的删不掉。

  ✅ 2026-10-24 11:14:58 nock.json **自己翻新了** —— TTL 实测定案：
       旧对象 10:29:39 建立 → 11:14:58 过期重取，**整整 45 分钟**（Age 涨到 2688 才 MISS）
       ⇒ 被钉住的老路径 = **约 45 分钟后自愈**，不是 2 小时，也不是永不更新。
       ⇒ 所以「nock.json 永远不更新」的说法要修正成：**改完要等最多 45 分钟**。
       想立刻生效（≤20 秒）还是用 nock2.json / GitHub 源。

  现状（2026-10-23 14:55）🟢 双源一致，141 步 → **138 步**（剔除 107885/106632）：
    自有域名  ✅ 已 deploy
              tj.json 5663 B / tj.js 8230 B / tj2.js 8230 B / diag.html 5191 B
    GitHub    ✅ tj.json 5663 B / tj.js 8230 B / tj2.js 8230 B（快照 id=49）
    sha256    tj.json ee9c773fa9221f53 ｜ tj.js = tj2.js d1c36f1d4fd580d0 ｜ diag 7aab1f7e71e0abc2
    nock 60 条/21 任务、hhle 71 条/19 任务、tj 136 条/42 任务、138 步

  🔴 2026-10-24 08:15 寻宝 hhle.json 更新（双源已发，两处逐字节一致）
    删 9 个下架任务共 17 条（全 DELIVERY_NOT_EXISTS）：107659 / 107660 / 107661 / 107662
      / 107781 / 107782 / 107783 / 107972 / 98682
    加 8 个新任务共 12 条：108143×2 / 108144×2 / 108147×2 / 108148×2
      / 108149 / 108150 / 108151 / 108164（全 VISIT dur5，落地页还是直播间，wait 照旧 18）
    结果 76 条/20 任务 → 71 条/19 任务；展开 147 步 / 1664 秒（约 28 分钟）
    hhle.json 11425 B  sha256 38bca5dc779aa14a
    自有域名 ✅ / GitHub ✅（快照 id=52），curl 回读两个源都与本地 sha 一致
    ⚠️ 108164 小小疯直播间 deliveryEndTime = 2026-10-24 23:59:59，**今晚就到期**，隔天记得摘
    ⚠️ easy 数组那 12 个 id 已全失效，且 hhle.js 不读 easy，属死数据，暂留未动

  🟢 2026-10-24 08:45 寻宝瘦身（双源已发，两处逐字节一致）
    删掉 task.easy（原 12 个 id：102235 101539 97864 98463 106077 97908 98122 106577
      98157 106079 106080 106078，**全部失效**；且 hhle.js 从头到尾没读过 easy）
    🔴 删前做了对照实验，不是拍脑袋：
      ① 全目录 grep easy（*.js/*.html/*.py）→ 0 处引用
      ② 同配置连跑两次输出逐字节相同（确认脚本无随机性，对照有效）
      ③ A(有 easy) vs B(无 easy) 展开结果 **cmp 逐字节一致**
      ④ 删后真 hhle.js 再展开一次，与删前输出仍逐字节一致
    结果：hhle.json 11425 B → **11252 B**（easy 本体 240 B，备注同步后净省 173 B）
          sha256 4675da898d474b04 ｜ 147 步 / 1664 秒 / 71 个任务页，**全部不变**
    自有域名 ✅ / GitHub ✅（快照 id=53）


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
  nock.json = 配置（60 条 / 21 个任务 + 助力 + 菜单链接）
              2026-10-22 16:59 加回 106595
              2026-10-23 10:26 实测收敛：106369/106370 平台又翻回 ignore=true（assets 被剥空、跑 0/1）
                            ⇒ 已移除；100531 要求浏览 15 秒，原来只给 15 秒卡在临界 ⇒ 改 100531 20
              2026-10-23 11:00 第二轮实测：新增 106736 逛余额宝攒钱节领红包（20 秒）；
                            107860 定 25 秒（15 秒要求，25 秒实测成功）；106595 保持 15 秒
              2026-10-24 10:19 删 101866 / 107544 两个隐藏位（ignore=true、assets 被剥空、无标题无跳转，
                            跑也空跑）⇒ 62 条/23 任务 → 60 条/21 任务；展开 98 步 → 95 步，1132 秒 → 1097 秒
                            nock.json 4297 B  sha256 0c4680b0cb191702
              2026-10-25 10:55 换助力码 jWr2nh3 → **jVVrCGw**（https://m.tb.cn/h.jVVrCGw），
                            只动 3 处：mine.help / task.before[0].url / _mine 备注；字节 4297 不变
                            nock.json 4297 B  sha256 242b15e6cbecf134（nock2.json 同步成同内容）
  🧪 赛车测试配置 temp8917.json（2026-10-25 重建为「11 个隐藏位专测」）
    aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvdGVtcDg5MTcuanNvbg==
    内容：99726/99888/100447/101866/106369/106370/106568/107139/107544/107900/108168
    全是 ignore=true、assets 被剥空的投放位，纯 id 走浮层页，wait=18，11 步约 4 分钟
    ⚠️ 必须把动作 #193 的脚本换成 tb-temp.js（正式配置用 tb.js）
  tb.js     = 脚本
  动作 #2 字典的 URL 和 fuc.url 两处都填同一串，二选一：

  ① 自有域名（更短、无第三方、无缓存延迟）
  aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3Qvbm9jay5qc29u

  ② GitHub（域名万一再出事时的顶替）
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL25vY2suanNvbg==

【B「双十一直播寻宝中国」→ 9647 寻宝中国】
  hhle.json = 配置（74 条 / 20 个任务）    hhle.js = 脚本
  · 2026-10-25 11:40：删 108164 逛一逛小小疯直播间（config_not_exists，10-24 23:59:59 到期）；
    加 107828【限时】逛精品直播间 ×1（到期 10-27）+ 107890【限时】逛精品直播间 ×3（到期 10-31）
    ⇒ 71 条/19 任务 → 74 条/20 任务；hhle.json 12412 B sha 98ef86b495e05e28

  🧪 寻宝测试配置（新建）temp9647.json —— 3 个「站内换量」任务
    aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvdGVtcDk2NDcuanNvbg==
    内容：97864 去农场1分钱领水果 / 101109 双11来淘金币狂享20亿 / 106079 逛逛换量任务
    都是 VISIT + duration=5 + need=1，用各自 jumpUrl 加 tl_sceneId/tl_deliveryId/tl_action=TRAFFIC_EXCHANGE，wait=15
    脚本用同一个 hhle.js（动作176 不用换）
  · 2026-10-23 09:23：删 107969 刘维（已下架）；99323 李佳琦（人群不符）挪到最后一条试
  · 2026-10-24 08:15：删 9 个下架任务（17 条）、加 8 个新任务（12 条）→ 71 条 / 19 任务
    （明细见上面 08:15 那条，以及 tb1111-cfg2-bak/寻宝中国-全量核查-20261024.md）
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
  tj.json = 配置（47 个任务 / 121 条 / 189 步 / 2291 秒）  tj2.js = 脚本
  🔴 10-24 17:20 起是**两组结构**：组1「金矿9623」+ 组2「日常任务」（taskList 顺序即执行顺序）
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

  当前收进配置的 46 个任务 / 94 步任务（2026-10-23 15:30 候选实测通过并入后定稿）
    94049 ×10 15s ｜ 94053 ×10 15s ｜ 92801 ×5 15s ｜ 106046 ×5 10s ｜ 106420 ×5 10s
    94054 ×3 15s ｜ 94055 ×3 15s ｜ 94046 ×3 15s ｜ 95180 ×2 15s
    94052 15s ｜ 44739 15s ｜ 44744 10s ｜ 44755 15s ｜ 65214 10s ｜ 67396 20s
    68042 15s ｜ 79268 15s ｜ 81835 10s ｜ 82177 10s ｜ 85202 10s ｜ 88134 10s
    88969 10s ｜ 89443 10s ｜ 91112 10s ｜ 94026 15s ｜ 94442 20s ｜ 94970 10s
    95175 10s ｜ 95830 10s ｜ 103764 15s ｜ 104787 15s ｜ 105247 10s ｜ 105475 10s
    105890 10s ｜ 107861 20s
    ── 跨场景（完整地址，非 5365）──
    9651/98487 10s ｜ 9651/97729 20s ｜ 9619/98453 20s ｜ 9644/96804 20s
    9619/96219 15s（SIGN 签到）｜ 9651/102741 20s（冷却型，只 1 次）
    9651/101700 45s（冷却型，只 1 次）｜ 9619/98396 ×3 20s ｜ 9644/94356 ×10 20s ｜ 9651/98164 15s
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
  全量 = 189 步 / 约 38.2 分钟（121 步任务 + 64 次首页 + 助力/红包/购物车/收尾）

  🆕 20:25 新增 scene 9741 三个浏览任务（逆向挖到 + 实测 9/9 计满，+270 金币已到账）
    99078 浏览超多好物 ×4 20s ｜ 99075 浏览15秒得奖励 ×3 20s ｜ 99077 浏览心仪好物 ×2 20s
    判据：ACTION_ND + assets.action 有值 + implId 齐全，和 94049 完全同类；status 跑完是 COMPLETE（自动发放）。
    放在 81053 之后、常规区之前，写完整地址（sceneId=9741）。
    🔴 同批挖出的 8572（62 个游戏任务）和 8713 的 82178 全部 `assets.action = null`，
       浮层页没有落地页可开，实测 0/6，**永久排除，别再试**。

  🔴🔴 18:30 删掉 10 个「不给淘金币」的任务（主人令，实测证据如下）
     rewards = null（根本没奖励对象）：94356 好物沉浸看 ×10、98396 搜一搜 ×3、96219 今日签到、
       96302 好物随心逛、96804 去搜一搜感兴趣的商品、98453 玩一玩《逆转回合》
     rewards 给的是**拍拍币**（type=default, unit=拍拍币, 100~2400）：98480、97729、102741、101700
     这 10 个在 10-24 那轮跑了 21 次，余额零贡献 ⇒ 全删，省 21 步 / 约 7 分钟。
     ⚠️ 它们不是无效任务，只是给的不是淘金币；要攒拍拍币可以另开一组。
     ✗ 98487（去红包签到领现金）同样是拍拍币，一并移除，挪到 test-cand.json 单独验。

  🆕 17:20 两组结构（为了把 9623 金矿塞进来又不超体积）：
    组1「金矿9623」64 条：助力 8s → 红包 10s → 购物车 8s → 首页 5s
      → 40 条金矿批次（每 2 条回一次首页）→ 收尾首页 5s
      9623 的条目写纯 id（走本组 baseurl = sceneId=9623），只有 9651/98480 写完整地址。
      🔴 这组如果不拆出来、40 条全写完整地址，整份配置会到 11.2 KB，超 8 KB 安全线。
    组2「日常任务」142 条：81053 ENTRY 15s → 扩展区 → 常规区 → 尾区 4 个人群不符的。
      before 为空（助力已在组1），endpage = 红包 5s。
    ⇒ 81053 现在在第 66 步，紧跟在组1最后一次首页之后（判定只认 hd_from，位置不影响）。

  🔴 金矿批次 38 条（sceneId=9623，全部 VISIT dur15 → 20s，cdTime 都是 -1 无冷却）：
    98688 ×12 ｜ 96831 ×8 ｜ 98972 ×6 ｜ 96830 ×5 ｜ 96828 ×3 ｜ 96826 ×2 ｜ 106557 逛运动清单 ×2
    38 次「逛清单」× 30 金币 = **1140 金币**，10-24 实测 38/38 全中，是整份配置的最大收益源。
  🆕 15:30 优先区（新并入的 6 个候选排最前，越早跑越能看出效果）：
    第 5 步  81053 从首页回访 15s（紧跟开头那次淘宝首页，语义才顺）
    第 7 步  9651/98487 双11寻宝中国 ×1 10s
    第 8 步  9651/97729 去省钱卡领红包 ×1 20s
    第 10 步 9619/98453 玩一玩《逆转回合》 ×1 20s
    第 11 步 9644/96804 去搜一搜感兴趣的商品 ×1 20s
    第 13 步 9619/96219 今日签到（SIGN） ×1 15s
    第 14 步 9651/102741 搜心仪商品后浏览15秒 ×1 20s —— 🔴 **冷却 12868 秒（3h34m）**
    第 16 步 9651/101700 精选好货沉浸看 ×1 45s —— 🔴🔴 **冷却 12094 秒（3h21m）**
    第 17/19/20 步 9619/98396 搜一搜心仪宝贝 ×3 20s
    第 22~35 步 9644/94356 好物沉浸看 ×10 20s
    第 37 步 9651/98164 去看淘宝视频 ×1（注意：这个**不是**「逛短视频领现金」，名字不同）
    ⇒ 常规任务从第 98 步（94049）才开始
    🔴 两个冷却型（102741 / 101700）都必须单轮只配 1 次：配多次第 2 次起必然白跑。

  🔴 10-24 17:00 尾区扩到 4 个（主人令：人群不符的全部放最后）
    81835 芭芭农场 ｜ 82177 玩消消乐 ｜ 68042 养小羊（10-24 起人群不符）
    ｜ 98164 去看淘宝视频（10-24 起人群不符）
    ⚠️ 98164 属 9651，尾区也必须写完整地址；写成纯 id 会被 baseurl 套成 5365 ⇒ 必然查不到。
    🔴 这四个当初都是能做的，人群过滤每天会变，只挪位置不删，明天可能又好了。

  ❌ 14:48 已剔除：107885 / 106632（主人实测「拍完了，完不成」）
     两个都是 ignore=true、initTitle=浏览5秒。浮层页倒计时给足 15 秒仍然不计进度，
     和「看看#服饰券 / 逛逛金币加抵好货」同一类 —— 入口白名单锁死，不是时长问题。
     **别再试任何格式，别再往回加。** verify_final3.js 里有断言专门防它被加回来。

  🆕 15:22 候选实测结果（test-cand.json 那一轮，共 8 个）
    ✅ 并入正式配置 6 个（全部 1/1 COMPLETE，15:20~15:22）：
       98487 双11寻宝中国抢4999元   dur5  10s
       97729 去省钱卡领红包         dur15 20s
       98453 玩一玩《逆转回合》       dur15 20s
       96804 去搜一搜感兴趣的商品     dur15 20s   ← 之前从没做过，照 98396 的 20s 一次过
       96219 今日签到 SIGN         dur空 15s   ← 🎉 签到类（SIGN / task_sign）其实能做，推翻旧判断
       102741 搜心仪商品后浏览15秒    dur15 20s   ← 只成 1/3：cdTime=12868 冷却，配 1 次
    ❌ 没进配置 2 个：
       106453 双11来淘金币狂享20亿    dur5 10s  → 实测 0/1 不计（同批 98487 同样 10s 却过了，
                                                 所以不是时长问题，任务本身没走通）
       105372 逛精选好物领优惠        dur空 15s → 查不到：错误码在 CROWD_FILTER_NOT_HIT 和
                                                 DELIVERY_NOT_EXISTS 之间反复，投放不稳，测不了
    🔴 关键教训：**102741 配 3 次只计 1 次，第一反应都会怀疑"时长不够"，其实是 cdTime 冷却。**
       判据：queryItem 里 progress.cdTime 明显大于 0（102741=12868、101700=12094）就是冷却型，
       这类任务 maxTimes 再大，单轮也只能配 1 次。

  🆕 14:15 扩展场景（「今日速赚140」面板那批的真身，各自 sceneId，浮层页完整地址写法）：
    9619 / 98396 搜一搜心仪宝贝 ×3 20s
    9644 / 94356 好物沉浸看 ×10 20s
    9651 / 101700 精选好货沉浸看 ×3（dur30）—— ⚠️ 实际单轮只配 1 次，冷却 12094 秒，见上
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
    65214 充话费0元起 ｜ 105890 逛88VIP会员甄选 ｜ 107861 你关注的商品都可抵

  🔴 停留秒数 = 账本里「成功那次」实际用的 wait_used，不是 duration+5 公式、更不是拍脑袋。
     改完必跑 _daily/verify_duration.py（拿账本反查全部任务）+ _daily/race_vs_tj.js（和赛车逐条对骨架）。

  怎么重新生成：cd _daily && python build_final3.py（满次数 + tj2.js 紧凑格式，原子写 tj.json）


【D「候选任务测试」→ test-cand.json】（2026-10-24 18:30 重写）
  ⚠️ 独立文件，**线上 tj.json 不受影响**。跑完换回 tj.json 即可。
  本轮只测 4 个「没有落地页」的任务：79268 / 94026 / 91112 / 95175（全是 5365）。
  🔴 18:45 按主人要求剔除 98487 去红包签到领现金 —— 它给拍拍币不给淘金币，正式配置已删，测试里也不留。

  🔴 为什么换思路：这 5 个在正式配置里走浮层页全部 0/5，而且
     · assets.action = null、actionType = 空 → 没有落地页可开
     · taskParams 里没有 implId → 直接调 scene.trigger 返回 FAIL_SYS_BIZPARAM_MISSED
     · initTitle 是「浏览10秒 / 浏览5秒」→ 像「停留在当前页 N 秒」类
   ⇒ 新假设：**停在金币小镇首页就等于上报**，不依赖浮层页。

  跑什么（6 步 / 115 秒 ≈ 2 分钟）：
    1) 30s  town/home?sceneId=5365 纯首页 —— 验「停在小镇页面自动上报」
    2) 20s  town/home?sceneId=5365&deliveryId=79268
    3) 20s  同上 94026
    4) 20s  同上 91112
    5) 20s  同上 95175
    6) 5s   收尾红包
  判读：跑完看这 4 个 times 是否从 0/1 变 1/1。
    全变 → 两种机制都行，下轮拆单变量确认；部分变 → 看是哪几个；全不变 → 换「点任务卡片」的真实路径。

  🔴 切换只改一处：**动作 #2 字典里的 URL + 同字典的 fuc.url**（两处填同一串）
     源① 自有域名  https://tb1111-cfg2.app.workbuddy.host/test-cand.json
       aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3QvdGVzdC1jYW5kLmpzb24=
     源② GitHub   https://gh-proxy.com/https://raw.githubusercontent.com/2604237845/tb1111-cfg/main/test-cand.json
       aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL3Rlc3QtY2FuZC5qc29u
     #25（empty.txt）和 #193（tj2.js）**都不用动**。

  生成：cd _daily && python build_test_cand.py


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
