# 🎮 生肖天机 - 项目启动器

> 给 AI 的快速入门包，新会话第一件事读这个文件  
> 目标：看完就能干活，不用问任何背景问题

---

## 一、项目基本信息

| 项目 | 内容 |
|------|------|
| 游戏名称 | 生肖天机 |
| GitHub | https://github.com/shuofuo/game-project |
| 在线地址 | https://shuofuo.github.io/game-project/ |
| 代码位置 | 根目录（`index.html` + `js/`） |
| 文档位置 | `docs/`（设计文档，不参与部署） |
| 部署方式 | GitHub Pages，`main` 分支，`path: .` |
| 技术栈 | 纯 HTML5 + CSS + JavaScript + Web Audio API + localStorage |

**本地运行**：
```bash
git clone https://github.com/shuofuo/game-project.git
cd game-project
python3 -m http.server 7892
# 然后打开 http://localhost:7892/
```

---

## 二、当前开发状态（v1.1）

**已完成 ✅**：
- 召唤系统（3种：金币召唤/龙气召唤/土命免费）
- 合成系统（拖拽合成，Lv1-Lv15，最高"鸿蒙神兽"）
- 经济系统（灵兽产金、离线收益减半）
- 留存系统（每日签到、每日任务、限时活动）
- 五行命格（5命格，各有加成）
- 图鉴系统、成就系统、排行榜
- 音效系统（Web Audio API 合成，无音频文件）
- localStorage 自动存档

**未完成 🔜**：
- 微信/抖音/快手小程序嵌入（需域名+备案+企业资质）
- 广告变现（需企业资质）
- 天机时辰系统（详细时辰事件，见 SPEC.md）

---

## 三、代码架构（极简版）

### 文件职责

| 文件 | 职责 |
|------|------|
| `index.html` | 游戏入口，HTML骨架，CSS样式 |
| `js/config.js` | 全局常量、G状态对象、COIN_S、存档KEY |
| `js/audio.v2.js` | Web Audio API 音效/BGM |
| `js/game.v5.js` | 核心逻辑：召唤/合成/产金/存档/统计/周挑战/试炼塔/皮肤/炼宝 |
| `js/ui.v2.js` | UI渲染：弹窗/图鉴面板/侧边栏 |

### 加载顺序（不可调换）

```
index.html
  → js/config.js        (声明所有全局变量)
  → js/audio.v2.js      (依赖 config.js 的 G/_audioCtx)
  → js/game.v5.js?v=13  (调用 config/audio 的函数)
  → js/ui.v2.js         (渲染依赖 game 函数)
```

> ⚠️ game.v3.js / game.js / game.min.js / audio.js / ui.js 全部是废弃版本，已删除

### 全局关键变量

```javascript
G                    // 游戏主状态（玩家属性、灵兽数组等）
SAVE_KEY            // localStorage 的 key
COIN_S              // 每级灵兽每秒产金币：[0,1,2,3,4,8,9,10,11,12,16,17,18,20,24,30]
DRAGON_ICONS        // 15级灵兽的 emoji 图标
ZODIAC_NAMES        // 12属相名称
nextId              // 生成唯一ID
_audioCtx           // Web Audio 上下文
```

### 存档结构（localStorage）

```javascript
G = {
  zodiac: number,      // 0~11（-1=未选择）
  fate: number,        // 0~4（-1=未选择）
  coins: number,
  dragonQi: number,
  dragons: [{id, level, posX, posY}],  // 灵兽数组
  lastOnlineTime: number,
  signDays: number,
  totalCoinsEarned: number,
  mergeCount: number,
  achievements: string[],
  unlockedAtlas: number[],
  fateFreeCount: number,   // 今日土命免费次数
  currentFate: number,     // 1~5 运势
  lastFateDate: string,   // "2026-07-08"
  version: "v1.1"
}
```

---

## 四、开发规范（必读）

> 违反以下规范会导致 bug 或代码混乱

### 4.1 变量声明位置

| 情况 | 应该在哪里声明 |
|------|------|
| 全局常量（如 COIN_S） | `js/config.js`，用 `const` |
| G 的子属性 | 在 `G.xxx = ...` 时自动创建，不要预声明 |
| 局部临时变量 | 在函数内部 `let xxx` |
| DOM 引用 | 在 `initDrag()` 等初始化函数里缓存 |

### 4.2 函数调用关系

```
用户操作
  ↓
index.html 的 onclick  /  JS事件监听
  ↓
js/ui.js  ←→  js/game.js  ←→  js/config.js
                (状态读写)      (常量/存档)
  ↓
js/ui.js（更新显示）
```

**禁止**：ui.js 直接读写 `G.coins = ...`，应该调用 game.js 的接口函数

### 4.3 快速验证语法

每次改 JS 之前：
```bash
node --check js/config.js
node --check js/game.js
node --check js/ui.js
```

### 4.4 调试技巧

```javascript
// 快速查看 G 状态
console.log(JSON.stringify(G, null, 2));

// 快速加金币测试
G.coins += 100000;

// 查看某个灵兽的产出
COIN_S[level]  // 返回 /s
```

### 4.5 CSS 开发规范

- **禁止**写死 `width: 960px` 等固定值
- 移动优先：`max-width: 500px; width: 90vw`
- 测试宽度：320px（iPhone SE）到 768px（iPad）

---

## 五、产金币系统（当前已平衡值）

```
COIN_S = [0,1,2,3,4,8,9,10,11,12,16,17,18,20,24,30]
索引0=占位，索引1=Lv1，索引15=Lv15

门槛逻辑（每5级一个门槛）：
  Lv1-4:   +1/s 每级
  Lv5:     8/s  （跨门槛，×2）
  Lv6-9:   +1/s 每级
  Lv10:    16/s （跨门槛，×1.33）
  Lv11-14: +1/s 每级
  Lv15:    30/s （最终上限）

离线收益 = 在线收益 × 0.5（减半）
```

---

## 六、Git 工作流

```bash
# 改代码前先 pull
git pull

# 改完后
git add -A
git commit -m "描述：做了什么改动"
git push

# 分支开发（尝试新功能时）
git checkout -b feature/功能名
# ... 开发 ...
git checkout main
git merge feature/功能名
git branch -d feature/功能名
```

**提交信息规范**：
```
feat: 新功能
fix: 修复bug
docs: 文档改动
refactor: 重构（不影响功能）
```

---

## 七、遇到问题怎么办

| 问题 | 快速解决方案 |
|------|------------|
| 页面空白 | 浏览器 Ctrl+Shift+R 强制刷新 |
| 功能没生效 | 检查浏览器控制台（F12）是否有报错 |
| 存档丢失 | 可能是 localStorage 满了，清理浏览器数据 |
| 音效不响 | 浏览器自动播放策略限制，需要用户先点页面 |
| 不确定代码在哪 | `grep -r "关键词" js/` 搜索 |
| 语法不确定 | `node --check js/xxx.js` 验证 |

---

## 八、快速上手任务（第一次开发时做）

1. 打开 `index.html`，熟悉界面
2. 读 `docs/GAME_STATUS.md` 了解功能列表
3. 读 `docs/SPEC.md` 了解设计规格
4. 用 `python3 -m http.server 7892` 启动本地服务
5. 改代码 → Ctrl+Shift+R 刷新 → 验证
6. 改完后 `git add + commit + push`

---

## 九、OpenClaw 个人电脑配置建议

如果你在个人电脑上使用 OpenClaw 开发这个游戏：

**建议工作方式**：
```
1. 每次开发前：读 docs/GAME_BOOTSTRAP.md（就是这个文件）
2. 读 docs/GAME_STATUS.md（了解当前状态）
3. 直接开工，不需要问任何背景问题
4. 改动推送到 GitHub，公司电脑 pull 即可同步
```

**Token 节省技巧**：
- 小改动（改 CSS/文字）：只需要读 `index.html` 和目标文件
- 中等改动（改游戏逻辑）：读 `js/config.js` + `js/game.js`
- 新功能：读 `docs/SPEC.md` + `docs/GAME_DESIGN.md` 后再动手
- 重大改动：先读 `docs/TECH_ARCH.md` 了解架构

---

> 最后更新：2026-07-08  
> 维护者：基建带师 🛠️（公司） + shuofuo（你）