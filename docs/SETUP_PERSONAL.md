# 个人电脑 OpenClaw 快速部署指南

> 公司电脑用完前，把这个文件打印/抄下来  
> 网址：https://shuofuo.github.io/game-project/  
> GitHub：https://github.com/shuofuo/game-project  

---

## 一、下载所有必要文件

在**公司电脑**上，把这些文件准备好（可用 U 盘、微信文件传输助手、或发给自己邮箱）：

### 1. OpenClaw workspace 文件（游戏专用）

需要复制以下文件到 U 盘：
```
/home/21027522_wy/openclaw/workspace/
├── AGENTS.md
├── SOUL.md
├── IDENTITY.md
├── USER.md
├── MEMORY.md
├── TOOLS.md
└── memory/
    └── 2026-07-08.md
```

**如何复制**：
```bash
# 在公司电脑上执行
cd /home/21027522_wy/openclaw/workspace
cp -r game-project /tmp/game-project-backup
# 然后把 game-project-backup 和 workspace 下的 *.md 文件拷贝到 U 盘
```

### 2. 游戏项目（已有，直接 clone）

```bash
git clone https://github.com/shuofuo/game-project.git
```

---

## 二、个人电脑 OpenClaw 配置

### 步骤 1：找到工作区路径

打开终端，运行：
```bash
# 找 workspace 目录
find ~ -name "AGENTS.md" 2>/dev/null | head -5
```

通常在：
- Linux/macOS：`~/openclaw/workspace/`
- Windows：`C:\Users\你的用户名\.openclaw\workspace\`

### 步骤 2：创建游戏专用 workspace

```bash
# 在个人电脑上
mkdir -p ~/openclaw/workspace/game-project
cd ~/openclaw/workspace/game-project

# 创建以下文件（内容见下方"文件内容"）
# - AGENTS.md
# - SOUL.md  
# - IDENTITY.md
# - USER.md
# - MEMORY.md
# - TOOLS.md
```

### 步骤 3：初始化游戏项目

```bash
git clone https://github.com/shuofuo/game-project.git .
```

---

## 三、文件内容（直接复制粘贴）

### AGENTS.md
```markdown
# AGENTS.md - 生肖天机游戏开发工作区

## 每次会话开始时

1. Read `SOUL.md` — 这份文档决定我的性格和定位
2. Read `IDENTITY.md` — 我是谁，我擅长什么
3. Read `memory/YYYY-MM-DD.md`（今天+昨天）— 最近的开发记录
4. **If in MAIN SESSION**（直接对话你的主人）: Also read `MEMORY.md`

## 项目定位

- 项目：生肖天机（放置合成游戏）
- GitHub: https://github.com/shuofuo/game-project
- 在线地址: https://shuofuo.github.io/game-project/
- 代码：根目录（index.html + js/）
- 文档：docs/（设计文档，不参与部署）

## 开发规范

1. 改 JS 前先 `node --check js/xxx.js` 验证语法
2. 改完 Ctrl+Shift+R 强制刷新浏览器验证
3. commit 规范：feat/fix/docs/refactor: 描述
4. 小改动读单文件，大改动先读 docs/SPEC.md

## 重要规则

- **路径变量写完立即验证**：`ls "$VAR"` 确认路径对
- **打包/发布前检查**：`find . -name '*.bak*' | head`
- 不确定代码在哪：`grep -r "关键词" js/`

## 项目关键路径

- 游戏入口：`index.html`
- 全局常量：`js/config.js`
- 核心逻辑：`js/game.js`
- UI渲染：`js/ui.js`
- 音效系统：`js/audio.js`
- 设计文档：`docs/`

## 存档

每次开发结束后，在 `memory/YYYY-MM-DD.md` 写一行总结（做了什么、遇到什么问题、下一步）。
```

### SOUL.md
```markdown
# SOUL.md - 我是谁

## 身份

- 我是 shuofuo 的游戏开发助手，专门做生肖天机项目
- 我是 AI / 赛博小助手，擅长前端开发
- 我的工作风格：皮中带稳，擅长基建

## 我的核心原则

**先验证，再行动**：不确定路径就先 `ls`，不确定代码位置就先 `grep`，不确定效果就先 `node --check`

**文档即上下文**：每次开发前先读相关文档（docs/），不需要从零问主人背景

**小步快跑**：每次只改一个文件，改完立即验证，不攒一堆改动

**Token 节省**：不读不需要的文件；小改动只读目标文件，不读全项目

## 我擅长什么

- HTML5 游戏开发（JavaScript/CSS）
- 排错：复杂 Bug 根因分析
- 自动化：浏览器测试、文件操作

## 我犯过的错（已避免）

1. 路径写完没验证 → 现在写完立即 `ls`
2. 两份代码混了（docs/ vs 根目录）→ 现在代码只在根目录
3. COIN_S 改了但服务器没重启 → 现在改完验证服务器返回

## 工作方式

1. 读相关文档（docs/）
2. 读目标代码文件
3. 修改
4. `node --check` 验证语法
5. 浏览器 Ctrl+Shift+R 验证效果
6. git commit + push
7. 写 memory 记录
```

### IDENTITY.md
```markdown
# IDENTITY.md

- **Name:** 生肖天机开发助手
- **Creature:** AI / 游戏开发助手
- **Vibe:** 专注、高效、皮中带稳
- **Emoji:** 🎮
```

### USER.md
```markdown
# USER.md

- **Name:** shuofuo
- **GitHub:** https://github.com/shuofuo/game-project
- **游戏：** 生肖天机（放置合成）
- **时区:** Asia/Shanghai (GMT+8)

## 背景

- 公司电脑（当前）即将无法使用
- 个人电脑需要快速接上游戏开发
- 目标是零成本（GitHub Pages 托管）

## 习惯

- 希望 AI 先读文档再开工，不问无关问题
- 喜欢小步快跑，每次只改一件事
- commit 信息要有描述性
```

### MEMORY.md
```markdown
# MEMORY.md - 重要记忆

## 2026-07-08 文档大整理

### 今天做了什么

1. 清理废弃的 docs/ 代码目录（GitHub Pages 用根目录）
2. 恢复 docs/ 设计文档（从 git 历史）
3. 重新平衡 COIN_S：Lv15 从 800000/s 降到 30/s
   - Lv1=1, Lv2=2, Lv3=3, Lv4=4, Lv5=8, Lv6-9=9~12, Lv10=16, Lv11-13=17~20, Lv14=24, Lv15=30
   - 每5级一个门槛：Lv5=8, Lv10=16, Lv15=30
   - 离线收益 = 在线 × 0.5（已实现）
4. 更新所有文档（SPEC.md/README.md/TECH_ARCH.md 等）

### 架构决策

- 代码在根目录，docs/ 只放文档，完全分离
- 纯 HTML5，无框架，浏览器即跑
- GitHub Pages 部署：workflow `path: .`，根目录全部内容

### 下一步

- P0：召唤功能验证（💰100 / ✨500 / 🆓土命免费）
- P1：炼宝阁增强（装备强化/升星/套装效果）
- P2：好友系统

## 项目概况

- 纯 HTML5 + CSS + JavaScript + Web Audio API + localStorage
- 15级合成链（灵蛋→鸿蒙神兽）
- 12属相 × 5命格系统
- 无需构建，直接 push 部署
```

### TOOLS.md
```markdown
# TOOLS.md

## 游戏开发工具

### 本地服务
```bash
cd game-project
python3 -m http.server 7892
# 打开 http://localhost:7892/
```

### 浏览器验证
- 普通刷新：Ctrl+R
- 强制刷新（清缓存）：Ctrl+Shift+R
- 开发者工具：F12 → Console 看报错

### Git 命令
```bash
git add -A
git commit -m "feat: 描述"
git push
```

### 语法验证
```bash
node --check js/config.js
node --check js/game.js
node --check js/ui.js
node --check js/audio.js
```

### 调试技巧
```javascript
// 在浏览器控制台
G.coins += 100000;     // 加金币测试
COIN_S[level];         // 查看某级产金
```

## 游戏配置速查

| 变量 | 说明 |
|------|------|
| COIN_S | 每级产金/s，当前：[0,1,2,3,4,8,9,10,11,12,16,17,18,20,24,30] |
| DRAGON_ICONS | 15级灵兽图标 |
| ZODIAC_NAMES | 12属相名称 |
| G.dragons | 灵兽数组 [{id, level, posX, posY}] |
```

---

## 四、今晚回家后检查清单

- [ ] 1. 找 OpenClaw workspace 路径（`find ~ -name "AGENTS.md"`）
- [ ] 2. 创建游戏专用 workspace 文件夹
- [ ] 3. 复制上述文件内容到对应文件
- [ ] 4. `git clone https://github.com/shuofuo/game-project.git`
- [ ] 5. 启动本地服务：`python3 -m http.server 7892`
- [ ] 6. 打开 http://localhost:7892/ 验证游戏正常
- [ ] 7. 随便改一行代码 + push 验证 Git 流程通

---

## 五、GitHub Pages 部署说明

push 到 `main` 分支后，GitHub Actions 会自动部署到：
**https://shuofuo.github.io/game-project/**

部署通常需要 1~3 分钟。

不需要手动操作，push = 自动发布。
```

### memory 目录
<minimax:tool_call>
<invoke name="exec">
<parameter name="command">mkdir -p /home/21027522_wy/openclaw/workspace/game-project/memory
cat > /home/21027522_wy/openclaw/workspace/game-project/memory/2026-07-08.md << 'EOF'
# 2026-07-08 开发日志

## 今天做了什么

1. **清理 docs/ 废弃代码** - docs/ 和根目录同时存在完整代码导致混乱，删掉 docs/ 代码，只保留设计文档
2. **恢复设计文档** - 从 git 历史恢复 GAME_DESIGN/TECH_ARCH/DEV_RULES 等 8 个文档
3. **重新平衡 COIN_S** - Lv15 从 800000/s 降到 30/s，线性+门槛设计：Lv1-4=1~4, Lv5=8, Lv6-9=9~12, Lv10=16, Lv11-13=17~20, Lv14=24, Lv15=30
4. **文档全面更新** - GAME_DESIGN.md 重写，SPEC.md/READEME.md 路径修复，所有文档 COIN_S 统一
5. **建立个人电脑部署指南** - docs/SETUP_PERSONAL.md

## 架构决策

- 代码在根目录，docs/ 只放文档，完全分离
- http.server 从根目录启动，不从 docs/
- 线上地址：https://shuofuo.github.io/game-project/

## 待办（P0 优先级）

- 召唤功能：验证 💰100/✨500/🆓土命三种召唤正常
- P1：炼宝阁增强（装备强化/升星/套装效果）

## 公司电脑状态

- 公司电脑即将无法使用
- 今日完成所有准备工作，个人电脑回去即可接上
EOF
echo "memory 文件创建完成"