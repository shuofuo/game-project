# 开发规范 - 生肖天机

## 目录结构

```
docs/
  index.html       ← HTML骨架，不写JS逻辑
  js/
    config.js      ← 常量/数据/全局状态(G/nextId/计时器)
    audio.js       ← 音频引擎/BGM配置/音效
    game.js        ← 核心游戏逻辑（召唤/合成/命格/修炼/图鉴）
    ui.js          ← UI渲染/弹窗/刷新/图鉴面板
```

## 文件职责

| 文件 | 职责 | 示例 |
|------|------|------|
| `config.js` | 常量定义 + 全局状态变量声明 | `SAVE_KEY`, `G`, `nextId`, `_audioCtx`, `startBgm()` |
| `audio.js` | 音频相关（播放/BGM/音量） | `playSound()`, `playFullBgm()`, `INSTRUMENTS` |
| `game.js` | 游戏核心逻辑 | `startGame()`, `doDrop()`, `summonCoin()`, `reselect()` |
| `ui.js` | 所有弹窗/面板渲染 | `renderAch()`, `openRankPanel()`, `showFateDetail()` |

## 加载顺序

HTML 中按以下顺序加载（不可调换）：

```html
<script src="js/config.js"></script>   ← 第1个（声明所有全局变量）
<script src="js/audio.js"></script>    ← 第2个（依赖 config.js 的 G/_audioCtx）
<script src="js/game.js"></script>     ← 第3个（调用 config/audio 的函数）
<script src="js/ui.js"></script>        ← 第4个（渲染依赖 game 函数）
```

## 变量约定

- **声明位置**：所有 `let/const` 变量在 `config.js` 中声明
- **函数调用**：game.js 可调用 config.js 和 audio.js 的函数；ui.js 依赖 game 函数
- **避免重复**：不在多个文件重复声明同一变量（检查后再声明）

## 开发规则

1. **新增常量/数据** → `config.js`
2. **新增音效/BGM** → `audio.js`
3. **新增游戏逻辑** → `game.js`（新函数 + 触发逻辑）
4. **新增UI面板** → `ui.js`（渲染函数 + 面板HTML/CSS）

## 拆分的教训

- **不要按行数强行分段**：用函数边界分割，不切函数
- **重复函数是隐患**：`startBgm()` / `stopBgm()` 有重复定义，拆分时要过滤
- **边界验证**：每次拆分后立即用 `node --check` 验证语法
- **函数完整性**：用括号计数确保函数首尾完整，不漏body