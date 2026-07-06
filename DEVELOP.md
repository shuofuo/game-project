# 🛠️ 生肖天机 - 开发指南

## 项目信息
- **GitHub**: https://github.com/shuofuo/game-project
- **线上地址**: https://shuofuo.github.io/game-project/
- **本地端口**: 7892（`python -m http.server 7892`）
- **主文件**: `docs/index.html`

## 本地开发

### 1. 克隆项目
```bash
git clone https://github.com/shuofuo/game-project.git
cd game-project
```

### 2. 启动本地服务器
```bash
python -m http.server 7892
```
浏览器打开：`http://localhost:7892/`

### 3. 编辑代码
用 VS Code / Cursor 打开：
```bash
code .
```

### 4. 推送部署
```bash
git add .
git commit -m "描述改动"
git push
```
推送到 `gh-pages` 分支后，GitHub Pages 约 1-2 分钟自动上线。

---

## 📐 当前布局结构

```
viewport: 390×664 (iPhone 12 模拟)

┌─────────────────────────────────────┐
│ topHud (全宽390, h=48)              │ ← 顶部状态栏（金龙气/金币）
├──────┬──────────────────────┬───────┤
│      │ featureRow (h=68)    │       │ ← 5个功能按钮
│ 左侧 │─────────────────────│ 右侧  │
│ 功能 │ heroCard (h=88)      │ 功能  │ ← 灵兽详情卡（当前在调）
│ 按钮 │                      │ 按钮  │
│ w=52 │ dragonGrid (h=386)  │ w=52  │ ← 灵兽网格 5×5
│      │                      │       │
├──────┴──────────────────────┴───────┤
│ skillBarRow (h=22)                   │ ← 技能条
├─────────────────────────────────────┤
│ bottomBar (h=52)                     │ ← 召唤栏
└─────────────────────────────────────┘
```

## ⚠️ 当前未解决问题

### P0-待修复：灵兽卡（heroCard）显示不完整

**现象**：右侧"攻击/防御/速度"属性被裁掉，显示不全
**根因**：heroCard 内部布局问题，右侧 div 被 overflow:hidden 裁剪
**涉及文件**：`docs/index.html`

**当前 heroCard 状态**（Step73）：
- heroCard 整体在 contentArea 中水平居中了（leftGap≈rightGap）
- 但右侧属性 div 仍有部分被裁掉
- 已尝试：flex / grid / table / position:absolute 四种布局

**最新数据**（2026-07-06）：
```
heroCard: w=263, left=63, leftGap=63, rightGap=64 ✅ 居中
右 div: left=233, w=80 → 被 heroCard 的 overflow:hidden 裁掉约 50px
```

**调布局最快的方式**：
1. 修改 `docs/index.html` 里的 `#heroCard` 样式
2. 重启本地服务器 `python -m http.server 7892`
3. 浏览器 `http://localhost:7892/` 刷新看效果

### 可选：用 CodePen 快速调布局
复制 `docs/index.html` 中的 middleRow 部分到 https://codepen.io/pen 调，调好了告诉我哪个样式改了，我帮你合并回去。

---

## 📁 核心文件说明

| 文件 | 用途 |
|------|------|
| `docs/index.html` | 游戏主入口 + 所有 HTML/CSS/JS |
| `docs/js/config.js` | 灵兽/皮肤/成就/试炼塔配置数据 |
| `docs/js/game.v5.js` | 游戏核心逻辑（召唤/合成/战斗等）|
| `docs/js/ui.v2.js` | 界面逻辑（面板开关/动画等）|
| `docs/js/audio.v2.js` | 音频管理 |

## 🎮 当前已完成功能

- P0-1: 灵兽图鉴 ✅
- P0-2: 灵兽皮肤 + 金龙气 ✅
- P0-3: 成就系统 ✅
- P1-1: 天命试炼塔 ✅
- P1-2: 炼宝阁（基础）⚠️ 待增强

## 🔧 常用调试命令

### 查灵兽卡尺寸
在浏览器控制台（F12）执行：
```js
const hc = document.getElementById('heroCard');
console.log('heroCard:', hc.offsetWidth, hc.offsetHeight, hc.offsetLeft);
console.log('children:', Array.from(hc.children).map(c=>({left:c.offsetLeft,w:c.offsetWidth})));
```

### 重启本地服务器
```bash
# 先停掉旧进程
taskkill /F /IM python.exe 2>nul
# 再启动
python -m http.server 7892
```