# 🛠️ 生肖天机 - 开发指南

## 项目信息
- **GitHub**: https://github.com/shuofuo/game-project
- **线上地址**: https://shuofuo.github.io/game-project/
- **本地端口**: 7892（`python -m http.server 7892`）
- **主文件**: `index.html`（游戏入口）
- **配置文件**: `js/config.js`
- **游戏逻辑**: `js/game.v5.js`
- **界面逻辑**: `js/ui.v2.js`

## 本地开发

### 1. 克隆项目
```bash
git clone https://github.com/shuofuo/game-project.git
cd game-project
```

### 2. 启动本地服务器（推荐用 Python）
```bash
# 进入项目目录
cd game-project
# 启动服务器
python -m http.server 7892
```
浏览器打开：`http://localhost:7892/`

> 如果提示端口被占用，换一个端口：
> ```bash
> python -m http.server 8080
> ```

### 3. 编辑代码
用 VS Code（或任何编辑器）打开项目目录：
```bash
code .
```

### 4. 推送部署
```bash
git add .
git commit -m "描述你的改动"
git push
```
推送到 `gh-pages` 分支后，GitHub Pages 约 1-2 分钟自动上线。

---

## 📐 当前布局结构（iPhone 12 模拟, 390×664）

```
viewport: 390×664

┌─────────────────────────────────────┐
│ topHud (全宽390, h=48)              │ ← 顶部状态栏（金龙气/金币）
├──────┬──────────────────────┬───────┤
│ 左侧 │ featureRow (h=68)   │ 右侧  │ ← 5个功能按钮
│ 功能 │───────────────────── │ 功能  │
│ 按钮 │ heroCard (h=88)     │ 按钮  │ ← 灵兽详情卡（当前在调）
│ w=52 │ 居中, 攻防速被裁断   │ w=52  │
│      │ dragonGrid (h=386)  │       │ ← 灵兽网格 5×5
│      │                      │       │
├──────┴──────────────────────┴───────┤
│ skillBarRow (h=22)                   │ ← 技能条
├─────────────────────────────────────┤
│ bottomBar (h=52)                     │ ← 召唤栏
└─────────────────────────────────────┘

内容区 contentArea: left=52, w=286
middleRow = 左侧按钮(52) + 内容区(286) + 右侧按钮(52) = 390
```

## ⚠️ 当前未解决问题

### 灵兽卡（heroCard）显示不完整

**现象**：右侧"攻击/防御/速度"三行字被裁掉，显示不全

**根因**：
- `contentArea` 宽度 286px（固定，因为左右按钮各占 52px）
- `heroCard` 宽度 = 286×92% ≈ 263px
- 右侧 div 用 `position:absolute; right:10px` 定位，实际位置超出 heroCard 边界
- `heroCard` 有 `overflow:hidden` 导致右 div 被裁剪

**最新测量数据**（2026-07-06 Step73）：
```
heroCard: w=263, left=63, leftGap=63, rightGap=64 ✅ 居中
右 div: left=233, w=80 → 被 heroCard overflow:hidden 裁掉 50px
```

**已尝试但未解决的方案**：
- ✅ flex / grid / table / position:absolute（居中都对了，但右 div 仍被裁）
- 待尝试：去掉 overflow:hidden / 改 heroCard 宽度 / 改右 div 定位

**调布局最快方式**：
1. 修改 `index.html` 里 `#heroCard` 的样式
2. 浏览器刷新 `http://localhost:7892/` 看效果

**CodePen 调布局**：
复制 `index.html` 中 middleRow 部分到 https://codepen.io/pen 调，调好了告诉 AI 助手合并。

---

## 🎮 当前已完成功能

| 阶段 | 功能 | 状态 |
|------|------|------|
| P0-1 | 灵兽图鉴 | ✅ |
| P0-2 | 灵兽皮肤 + 金龙气系统 | ✅ |
| P0-3 | 成就系统 | ✅ |
| P1-1 | 天命试炼塔（100层） | ✅ |
| P1-2 | 炼宝阁（基础） | ✅ |
| P1-2 | 炼宝阁增强（装备强化/升星） | 📋 待做 |
| P1-3 | 好友系统 | 📋 待做 |

## 🔧 调试命令

### 查灵兽卡实时尺寸（浏览器控制台 F12）
```js
const hc = document.getElementById('heroCard');
console.log('heroCard宽高:', hc.offsetWidth, hc.offsetHeight);
console.log('children:', Array.from(hc.children).map(c=>({
  left: c.offsetLeft,
  w: c.offsetWidth,
  right: hc.offsetWidth - c.offsetLeft - c.offsetWidth
})));
```

### 停掉占用端口的进程（Windows）
```cmd
netstat -ano | findstr :7892
taskkill /F /PID <进程ID>
```

### 查 git 状态
```bash
git status
git log --oneline -5
```

### 查看改动
```bash
git diff index.html
```