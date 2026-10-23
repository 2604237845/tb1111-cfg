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
              tj.json 3652 B / tj.js 8230 B / tj2.js 8230 B / diag.html 5191 B
    GitHub    ✅ tj.json 3652 B / tj.js 8230 B / tj2.js 8230 B
    校验      🟢 两源 sha256 都是 02e484dfc697…，用哪个源跑都是 115 步
    nock 61 条/22 任务、hhle 73 条/17 任务、tj 113 条/36 任务


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
  nock.json = 配置（61 条 / 22 个任务 + 助力 + 菜单链接）  2026-10-22 16:59 加回 106595
  tb.js     = 脚本
  动作 #2 字典的 URL 和 fuc.url 两处都填同一串，二选一：

  ① 自有域名（更短、无第三方、无缓存延迟）
  aHR0cHM6Ly90YjExMTEtY2ZnMi5hcHAud29ya2J1ZGR5Lmhvc3Qvbm9jay5qc29u

  ② GitHub（域名万一再出事时的顶替）
  aHR0cHM6Ly9naC1wcm94eS5jb20vaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzI2MDQyMzc4NDUvdGIxMTExLWNmZy9tYWluL25vY2suanNvbg==

【B「双十一直播寻宝中国」→ 9647 寻宝中国】
  hhle.json = 配置（73 条 / 17 个任务）    hhle.js = 脚本
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

  当前收进配置的 36 个任务 / 73 步任务（2026-10-23 03:00 收官审计后定稿）
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
         &hd_from=20260618home&deliveryId=81053&implId=other_1391_2488030_81053_0&hd_from_id=100089
         判定只认 hd_from；浮层页模板里没有这个参数，套上去必然判「未从首页进入」。
         2026-10-22 账本原文就是这么记的：跳的是 m.taobao.com/index.htm，
         判定看 hd_from，我们只给了 hd_from_id，missing=["hd_from"] → 不计进度。
      ✅ 改完整地址后 round3 做成（tj-durations.json：status=COMPLETE，wait_should=15）
      ⚠️ 15s 不是我拍的，是那一轮成功用的秒数；写 12s 会被提前切走导致不计进度。
  全量 = 115 步 / 约 20.1 分钟（73 步任务 + 38 次穿插首页 + 助力/红包/购物车/收尾）

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

⚠️ 脚本地址在哪
  json 里 taskData.<组名>.url 指向脚本（tb.js / hhle.js / tb-temp.js）。
  现在写的是 jsDelivr 地址（fastly.jsdelivr.net/gh/2604237845/tb1111-cfg@main/…），
  因为脚本几乎不改、jsDelivr 有 SLA。
  代价：jsDelivr 对分支引用有 12 小时缓存 —— 真要改 js 逻辑时换文件名（如 hhle2.js）再改 common.url。
  配置 json 走 gh-proxy（60 秒）或自有域名（即时），日常改任务不受影响。

备用反代（gh-proxy.com 万一打不开时，把 URL 前缀换成它）：
  https://ghfast.top/https://raw.githubusercontent.com/2604237845/tb1111-cfg/main/
  https://ghproxy.net/https://raw.githubusercontent.com/2604237845/tb1111-cfg/main/

2026-10-20：CK 模式（ck.json / ck.js / tbck.js）已删除，只保留无 CK 版。
