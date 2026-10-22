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

  现状（2026-10-22 17:40）：两边配置逐字节一致
    自有域名  nock 61 条/22 任务、hhle 73 条/17 任务
    GitHub    nock 61 条/22 任务、hhle 73 条/17 任务


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
