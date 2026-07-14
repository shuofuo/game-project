# 生肖天机 · 架构文档

> 版本：v2（main 分支，暖色国风版）
> 生成：2026-07-12
> 状态：线上活跃开发中

---

## 一、项目整体架构

### 1.1 文件清单

```
docs/
  index.html          ← 唯一页面（HTML + CSS 全部内联，约100KB）
  js/
    config.js         ← 全局常量、灵兽数据、皮肤配置、音频状态（1588行）
    game.v5.js        ← 核心逻辑，3859行（合并召唤/装备/技能/云存档）
    ui.v2.js          ← UI 工具函数，294行（未使用，已被 index.html 内联逻辑替代）
    audio.v2.js       ← Web Audio API 音效，186行
    ui.js             ← 已废弃（v1遗留）
    game.v3.js        ← 旧版（gh-pages 遗留）
    game.v4.js        ← 旧版（gh-pages 遗留）
  css/                ← 空目录
  svgs/               ← 灵兽 SVG 精灵图（按生肖+等级组织）
  audio/              ← BGM/音效资源
  index.html          ← GitHub Pages 入口（仅重定向到 docs/）
```

**加载顺序**：`docs/index.html` → `<script src="js/config.js">` → `<script src="js/game.v5.js">`

### 1.2 模块划分与依赖关系

```
config.js（数据层）
  ├─ LNAME / LICON（灵兽名称/图标）
  ├─ ZOD_ICON（12生肖 × 15等级 = 180种视觉）
  ├─ COIN_S / UPGRADE_COST（经济数值表）
  ├─ DRAGON_SKINS（皮肤系统）
  ├─ FATE_E/C/Q/N（命格系统）
  ├─ RANKS_HUD / RANKS（段位系统）
  ├─ TASKS / SIGN_REWARDS / ACTIVITIES（活动配置）
  └─ playSound()（音效函数）

game.v5.js（逻辑层）
  ├─ 全局对象 G（状态中心）
  │   ├─ coins/qi/dragonPower（资源）
  │   ├─ dragons[]（灵兽数组）
  │   ├─ cultivation（命造5属性）
  │   ├─ forge（装备系统）
  │   ├─ tasks/signRecord/achievements（任务/签到/成就）
  │   ├─ skills/items/_activeEffects（技能/道具）
  │   ├─ towerFloor/towerBest（试炼塔）
  │   ├─ summonLog/maxCombo（统计）
  │   └─ _cloudPlayerId/backendUrl（云端）
  ├─ 核心循环
  │   ├─ startCps() → calcCps() → 每秒发放金币
  │   ├─ calcCultQi() → 每分钟龙气回复
  │   ├─ startQiTimer() → 驱动龙气回复
  │   └─ cpsTimer/qiTimer/bgmTimer
  ├─ 召唤系统：doSummon() / doTenSummon() / summonCoin() / summonQi()
  ├─ 合成系统：handleDragDrop() / doMerge() / _applyMergeBonus()
  ├─ 装备系统：forge.js（内联）
  ├─ 技能系统：SKILLS[] / activateSkill() / renderSkillBar()
  ├─ 试炼塔：openTowerPanel() / enterTower() / towerAttack()
  ├─ 云存档：_initCloudAccount() / cloudSaveToServer() / cloudLoadFromServer()
  └─ 段位/图鉴/成就/签到/任务（各自独立 panel 函数）

audio.v2.js（音频层）
  └─ playFullBgm(zodiac) / stopBgm() / initAudio()

index.html（展示层）
  ├─ CSS 全部内联（约10000行，包括全部 UI 样式）
  ├─ HTML 结构（wrap / loginWrap / gamePage / 各类 panel）
  └─ 内联 JS 片段（少量初始化逻辑，大部委托 game.v5.js）
```

---

## 二、核心数据结构

### 2.1 全局状态对象 G

```javascript
G = {
  zodiac: 0~11,           // 玩家属相（鼠=0,猪=11）
  fate: 1~5,              // 命格（木/火/土/金/水）
  created: true/false,    // 是否已创建角色
  coins: 10000,           // 当前金币
  qi: 0,                  // 龙气
  dragons: [              // 灵兽数组
    { id:'1', level:1~15, idx:0~24, star:1~5, z:0~11, _base:{atk,def,spd} }
  ],
  mergeCount: 0,          // 累计合成次数
  summonCount: 0,         // 累计召唤次数
  currentFate: 1~5,       // 今日运势
  freeLeft: 0~3,          // 今日免费召唤剩余
  lastFreeDate: 'YYYY-MM-DD',
  cultivation: { mu:0~3, huo:0~3, tu:0~3, kin:0~3, shui:0~3 },
  lastQiTime: timestamp,
  towerFloor: 1,          // 试炼塔当前层
  towerBest: 1,           // 试炼塔最高纪录
  forge: {                // 装备锻造
    items: [],
    materials: { iron:0, crystal:0, dragonScale:0, starDust:0 },
    totalCrafts: 0,
    suits: 0
  },
  equippedSlots: {},      // { helmet: itemId, weapon: itemId, ... }
  skills: { s1:{lastUsed}, s2:{}, ... },  // 技能冷却
  items: [ {id, name, icon, count} ],      // 道具背包
  _activeEffects: {},     // { s1: intervalId, i1: timeoutId, ... }
  unlockedSkins: [],      // 解锁皮肤列表
  unlockedAtlas: [z],     // 图鉴已解锁生肖
  signDays: 0,
  signHistory: { 'YYYY-MM-DD': true },
  tasks: { id: { progress, claimed } },
  achievements: [],
  summonLog: [{level, t}],
  maxCombo: 0,
  combo: 0,
  lastMergeTime: 0,
  totalCoins: 0,
  totalCoinsEarned: 0,
  guideDone: false,
  _qiSpentDaily: 0,
  _dragonsBak: [],        // 合成备份（时光倒流用）
  _cloudPlayerId: null,
  backendUrl: null,
  weekly: null,
  lastOnline: null,
  _version: 2,
}
```

### 2.2 灵兽数据结构

```javascript
dragon = {
  id: string,          // 唯一 ID（自增）
  level: 1~15,         // 等级
  idx: 0~24,           // 在 5×5 网格中的位置
  star: 1~5,           // 星阶（满级后解锁）
  z: 0~11,             // 生肖（随机生成，不影响属性）
  _base: { atk, def, spd }  // 装备加成后的最终属性
}
```

### 2.3 关键数值表

```javascript
// 每秒金币产出（基础）
COIN_S = [0,1,2,3,4,8,9,10,11,12,16,17,18,20,24,30]

// 升级消耗（金币）
UPGRADE_COST = [0,200,500,1000,2000,4000,8000,16000,30000,50000,80000,120000,180000,260000,380000]

// 召唤基础消耗（随召唤次数指数增长）
cost = floor(100 × 1.2^(floor(summonCount/10)))
// 十连每张：100 × 1.2^(floor(summonCount/10)) × 5
```

---

## 三、游戏合成逻辑

### 3.1 核心循环

```
每秒 tick (cpsTimer):
  ├─ calcCps() → 金币产出 = sum(COIN_S[lv] × starMult(star)) × 命格倍率 × 运势倍率 × 1.3 × 命造加成 × 活动加成 × 连击加成
  ├─ G.coins += cps
  └─ updateHud()（更新 HUD）

每分钟 tick (qiTimer):
  ├─ calcCultQi() → G.qi += rate × 1分钟
  └─ updateHud()
```

### 3.2 calcCps() 完整倍率链

```javascript
base = dragons.reduce((sum, d) => sum + COIN_S[d.level] × starMult(d.star), 0)
return floor(base × FATE_C[fate] × (1 + YUN_COIN[currentFate]) × 1.3 × (1 + tu_coinBonus) × (1 + actBonus) × (1 + comboBonus))
```

**各倍率因子**：
- `FATE_C`：命格（木=1.5倍，金=1.5倍）
- `YUN_COIN`：运势（极凶=-50%，大吉=+50%）
- `1.3`：基础膨胀系数
- `tu_coinBonus`：土系命造（0/10%/25%/50%）
- `actBonus`：活动加成（周末双倍召唤=+100%，夜间金币=+50%）
- `comboBonus`：连击加成（2连=+50%，5连+=+100%）

### 3.3 召唤概率表

```javascript
// 默认召唤池（普通抽）
getSummonLevel([
  {level:1, weight:100},
  {level:2, weight:80},
  {level:3, weight:50},
])
// → level1=53%, level2=43%, level3=5%（权重归一化）

// 实际召唤：加权随机选择 level
// 木命造 summonLowRate：增加低级概率 10%/25%/50%
```

### 3.4 合成逻辑（handleDragDrop）

```
用户将 A 格灵兽拖入 B 格（B格有灵兽）：
  ├─ A.level === B.level？
  │   ├─ 是（可合成）：
  │   │   ├─ G._dragonsBak = G.dragons.map(d=>({...d}))  ← 时光倒流备份
  │   │   ├─ 计算合成成功率 = 100% + 火命造加成（+5%/+15%/+30%）
  │   │   ├─ rand > 成功率？
  │   │   │   ├─ 合成失败：随机删除一张灵兽
  │   │   │   └─ G.combo = 0
  │   │   └─ 合成成功：
  │   │       ├─ 合并 level+1（上限15）
  │   │       ├─ G.mergeCount++
  │   │       ├─ G.combo++（3秒内再次合成不清零）
  │   │       ├─ playSound('merge_zN')
  │   │       ├─ checkAch()
  │   │       ├─ saveGame()
  │   │       └─ renderGrid()
  │   └─ 否（不可合成）：
  │       ├─ G.combo = 0
  │       └─ 灵兽回到原位
  └─ B格为空：
      └─ 灵兽移动到 B 格
```

### 3.5 星阶系统（满级后解锁）

```
满级 Lv15 + 5星 = 最高灵兽
├─ starMult(1)=1×, starMult(2)=1.2×, starMult(3)=1.5×, starMult(4)=2×, starMult(5)=2.5×
├─ 升星消耗：10000 × star（金币）
└─ 升星后重置为 Lv1，保持星阶
```

---

## 四、所有子系统

### 4.1 命格修炼（5系3层树）

| 属性 | 图标 | 效果 | 层1消耗 | 层2消耗 | 层3消耗 |
|------|------|------|---------|---------|---------|
| 木 | 🪵 | 召唤低级概率 | +10% | +25% | +50% |
| 火 | 🔥 | 合成成功率 | +5% | +15% | +30% |
| 土 | 🟤 | 金币产出 | +10% | +25% | +50% |
| 金 | ⚪ | 高级灵兽概率 | +10% | +25% | +50% |
| 水 | 💧 | 龙气回复/min | +20% | +50% | +100% |

龙气回复速率表：`QI_RATE[sum(cultivation)]`（上限7级时100/min）

### 4.2 主动技能（6个）

| ID | 名称 | 龙气消耗 | 冷却 | 效果 |
|----|------|---------|------|------|
| s1 | 流星火雨 | 300 | 120s | 5秒内每秒+3×产金 |
| s2 | 金光护体 | 200 | 90s | 8秒合成+50%金币 |
| s3 | 龙息吹息 | 400 | 150s | 3次各+3×产金 |
| s4 | 天罚雷击 | 500 | 180s | 随机传说灵兽 |
| s5 | 时光倒流 | 300 | 120s | 撤销最近合成 |
| s6 | 天命召唤 | 800 | 300s | 必得传说+ |

### 4.3 试炼塔（100层）

- 每层有怪物血量，玩家用攻击按钮扣血
- 击败怪物获得材料（iron/crystal/dragonScale/starDust）
- 到达特定层数（20/40/60/80/100）可领取层奖励

### 4.4 装备锻造（4种材料 → 装备）

- 装备有 4 种属性：攻/防/速/综合
- 集齐套装（2件/4件）触发套装效果
- 装备绑定在灵兽上，影响其 _base 属性

### 4.5 皮肤系统

- DRAGON_SKINS[]：定义所有皮肤（id/name/color/filter/border/shadow）
- `getDragonVisual(dragon)` → 返回 `{svgPath, baseColor, border, shadow, skinId, skinName, ...}`
- `_dragonIconHtml(v, size)` → 渲染 SVG 或 emoji fallback
- `equippedSkin` → 当前装备皮肤 ID

### 4.6 成就系统（17个成就）

| 类型 | 成就 | 目标 |
|------|------|------|
| summon | 初出茅庐~龙腾四海 | 召唤1/10/30/60次 |
| merge | 初次融合~融合宗师 | 合成1/15/25次 |
| coin | 日进斗金~宇宙财阀 | 累计产出10K/100K/1M/10M |
| rank | 初窥门径~天师之境 | 拥有3/6/10/14种等级灵兽 |
| level | 灵通初显~天命所归 | 最高灵兽达Lv5/8/10/15 |
| combo | 连击新星~连击达人 | 5连/10连 |

### 4.7 每日任务（6个）

| ID | 名称 | 类型 | 奖励 |
|----|------|------|------|
| summon10 | 灵兽召唤 | static | +1000💰 +20⚡ |
| summon30 | 召唤达人 | static | +3000💰 +60⚡ +1免费 |
| merge10 | 合成进阶 | static | +2000💰 +40⚡ |
| merge30 | 合成大师 | static | +8000💰 +120⚡ +2免费 |
| spendQi | 命格修炼 | spend_qi | +800💰 |
| login | 每日登录 | login | +500💰 +10⚡ |

### 4.8 签到系统（7天循环）

7天累计奖励：33500💰 + 640⚡ + 4免费召唤

### 4.9 云端存档

- `_initCloudAccount()`：静默获取 userId（微信/抖音/快手）
- `cloudSaveToServer()`：每次大操作自动同步
- `cloudLoadFromServer()`：登录时拉取云端存档合并
- Key: `CLOUD_USERID_KEY='dragon_clicker_uid'`, `CLOUD_TOKEN_KEY='dragon_clicker_token'`

### 4.10 限时活动

```javascript
ACTIVITIES = [
  { id:'weekend2x',  icon:'🎁', active:()=>getDay()===0||6, summonBonus:1, tip:'召唤产出×2' },
  { id:'night1_5x',  icon:'🌙', active:()=>h>=20||h<2,      coinBonus:.5,   tip:'金币×1.5'  },
]
```

---

## 五、UI 组件规范

### 5.1 核心容器（id → 功能）

| id | 类型 | 说明 |
|----|------|------|
| `#loginWrap` | div | 登录选角页面 |
| `#modal` | div | 生肖/命格确认弹窗 |
| `#gamePage` | div | 游戏主界面容器 |
| `#topHud` | div | 顶部 HUD（金币/龙气/属相/运势） |
| `#dragonGridInner` | div | 5×5 灵兽网格（25格） |
| `#summonBar` | div | 底部召唤按钮栏 |
| `#heroSection` | div | 主页最强灵兽展示台 |
| `#heroIcon` | div | 灵兽头像（15级专属动画） |
| `#rankPanel` | div | 排行榜（右侧滑入） |
| `#handbookPanel` | div | 灵兽图鉴（全屏） |
| `#cultPanel` | div | 命格修炼（右侧滑入） |
| `#achPanel` | div | 成就（右侧滑入） |
| `#signPanel` | div | 签到（全屏） |
| `#taskPanel` | div | 任务（全屏） |
| `#activityPanel` | div | 限时活动（右侧滑入） |
| `#activeCenterPanel` | div | 活动中心（底部弹出） |
| `#forgeContent` | div | 装备锻造 |
| `#towerContent` | div | 试炼塔 |
| `#skinContent` | div | 皮肤 |
| `#atlasContent` | div | 图鉴 |
| `#summonOverlay` | div | 召唤动画遮罩 |
| `#summonResultAnim` | div | 召唤结果卡片 |

### 5.2 召唤按钮栏结构

```html
<div id="summonBar">
  <button class="sbtn sbtn-coin" id="btnCoin" onclick="summonCoin()">
    💰 金币召唤 · <span id="coinCost">100</span>
  </button>
  <button class="sbtn sbtn-qi" onclick="summonQi()">
    ⚡ 龙气召唤 · <span id="qiCost">500</span>
  </button>
  <button class="sbtn sbtn-free" id="btnFree" style="display:none" onclick="summonFree()">
    🎁 免费召唤 · <span id="freeCount">×3</span>
  </button>
</div>
```

### 5.3 灵兽卡片渲染流程

```
renderGrid() → getDragonVisual(dragon) → _dragonIconHtml(v, 36) → 注入 .d-card DOM
```

`getDragonVisual(dragon)`：
1. 取 `dragon.z`（生肖）+ `dragon.level`（等级）→ `ZOD_ICON[zodiac][level]`
2. 加皮肤滤镜（`DRAGON_SKINS` 中的 `equippedSkin`）
3. 返回 `{ svgPath, emoji, baseColor, border, shadow, bgAlpha, skinId, stage }`

---

## 六、通用工具函数（config.js）

```javascript
// 格式化数字（K/M/B）
fmtNum(n) → '1.5K' / '2.3M' / '1.0B'

// 星级倍率
starMult(star) → [0, 1, 1.2, 1.5, 2.0, 2.5][star]

// 灵兽攻防速
getDragonBaseStats(level, star) → {atk: lv×2×sm, def: lv×3×sm, spd: lv×sm}

// 升星/升级消耗
starUpgradeCost(star) → 10000 × star
upgradeCost(level) → UPGRADE_COST[level]

// 今日日期
today() → 'YYYY-MM-DD'

// 稀有度索引
rarIdx(level) → 0~4（普通/稀有/珍稀/传说/神话）
```

---

## 七、历史踩坑记录

### ⚠️ config.js 解析失败连锁 bug（2026-07-03）

**根因**：`config.js` 末尾残留 `];\n` 导致脚本解析失败
→ `var G` 未执行 → `G is undefined` → `openSkinPanel()` → `getDragonVisual()` 全部报错

**修复**：删除残留 `];\n`，`const DRAGON_SKINS` → `var DRAGON_SKINS`，`let G` → `var G`

**教训**：JS 脚本加载失败会静默产生连锁 bug，每个 .js 文件上线前需 `node --check` 验证

### ⚠️ topHud 缺 `</div>` DOM 嵌套崩溃（2026-06-27）

**根因**：`heroSection` 内 div 提前闭合，导致 `heroSection` 宽度塌陷

**教训**：flex align-items 默认 stretch，设为 center 会压缩 flex item；所有容器标签要成对

### ⚠️ outputs 列表变量顺序不一致（APS 项目经验）

通用教训：outputs 数量对上了还不够，必须验证 return 变量顺序与 outputs 顺序严格一一对应。

### ⚠️ 路径差异（game-project 经验）

游戏仓库本地路径 `/home/21027522_wy/openclaw/workspace/game-project/`
不要和 `openclaw/workspace/` 混用。

---

## 八、已知缺陷与优化方案

| # | 缺陷 | 优先级 | 方案 |
|---|------|--------|------|
| 1 | `heroThumbs` 灵兽缩略图硬编码，非动态读取 G.dragons | P1 | `renderHeroThumbs()` 从 `G.dragons` 动态生成 |
| 2 | DragonGrid 点击灵兽功能未测试 | P1 | 补全 `onclick="showDragonDetail(id)"` |
| 3 | 手机小屏布局未验证 | P2 | 媒体查询断点测试 |
| 4 | 十连召唤结果动画卡顿（5张卡片同时渲染） | P2 | 批量渲染前先 `requestAnimationFrame` 归零 |
| 5 | `_initCloudAccount()` 云存档需完整实现后端 | P3 | 参考 `backendUrl` 接入真实 API |
| 6 | `ui.v2.js` 未使用 | P3 | 删除，减少加载体积 |
| 7 | game.v3.js / game.v4.js 仅在 gh-pages 遗留 | P3 | 清理旧版本文件 |
| 8 | 本地 main 领先 origin/main 11个 commit 未推送 | P1 | 用户手动 `git push origin main` |
| 9 | gh-pages 分支为旧版暗夜主题，需重新同步 | P1 | 推送后 GitHub Actions 自动重建 |

---

## 九、开发规范

### 9.1 新增面板流程

```javascript
// 1. HTML：定义 panel 容器（固定定位，初始 display:none）
// 2. CSS：定义 .panel-name, .panel-name.open（transform 滑入）
// 3. JS：
//    - 打开函数：add .open class，renderPanel()
//    - 关闭函数：remove .open class
//    - 渲染函数：innerHTML 完整填充内容
// 4. 按钮绑定：onclick → openPanel()
// 5. 点击遮罩关闭：panel.onclick = e => { if(e.target===panel) close(); }
```

### 9.2 新增灵兽等级

1. `LNAME[16] = '新名称'`，`LICON[16] = '🐈'`
2. `COIN_S[16]` 填入产金值
3. `UPGRADE_COST[16]` 填入升级消耗
4. `ZOD_ICON` 每行追加第16个图标（共180个）
5. `DRAGON_SKINS` 新增 skin 视觉配置
6. `LV_STAGE_NAMES` / `getLevelStage()` 是否需要新阶段

### 9.3 Git 协作规范

- **main 分支**：开发分支（暖色国风版）
- **gh-pages 分支**：GitHub Pages 部署分支（旧版暗夜主题）
- **CI/CD**：`docs/` 目录推送后 GitHub Actions 自动构建
- **上线流程**：`git push origin main` → GitHub Actions 自动部署

---

## 十、部署信息

| 项目 | 值 |
|------|---|
| 线上地址 | https://shuofuo.github.io/game-project/ |
| GitHub 仓库 | https://github.com/shuofuo/game-project |
| 本地开发 | `python3 -m http.server 7890` |
| 当前本地版本 | 暖色国风（main 分支，领先线上 11 个 commit）|
| GitHub Actions | `docs/` 目录推送触发自动构建 |

---

*文档自动生成，如有疑问参考 `js/config.js` 常量定义 + `js/game.v5.js` 核心逻辑。*