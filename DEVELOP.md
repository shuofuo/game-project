# 🛠️ 生肖天机 - 开发指南（Windows 11 专用）

---

## 📦 一、环境准备（首次只需做一次）

### 1.1 安装 Git（如果没有）

下载地址：https://git-scm.com/download/win

安装时一路点"Next"，推荐勾选：
- ✅ Add Git to PATH
- ✅ Use Windows' default console window
- ✅ Checkout as-is, commit Unix-style

安装完**重启电脑**（让 PATH 生效）。

验证：打开 cmd，输入 `git --version`，显示版本号即成功。

### 1.2 安装 Python（如果没有）

下载地址：https://www.python.org/downloads/

安装时**务必勾选**：
- ✅ Add Python to PATH（重要！）
- ✅ Install pip

安装完**重启电脑**。

验证：打开 cmd，输入 `python --version`，显示版本号即成功。

### 1.3 安装 VS Code（推荐编辑器）

下载地址：https://code.visualstudio.com/

安装完打开 VS Code，安装一个中文插件：
- 左边竖条点 Extensions（图标是四个方块）
- 搜索 "Chinese" → 安装 "Chinese (Simplified) Language Pack"
- 搜索 "Live Server" → 安装 "Live Server"（改代码自动刷新）

---

## 📥 二、克隆项目（首次只需做一次）

打开**命令提示符**（Win+R → 输入 `cmd` → 回车）：

```bash
cd %USERPROFILE%\Documents
git clone https://github.com/shuofuo/game-project.git
cd game-project
```

> 如果提示输入 GitHub 用户名密码，改用 Token：
> 去 https://github.com/settings/tokens 生成一个，勾选 repo，
> 然后 `git clone` 时用户名输入 `shuofuo`，密码粘贴 Token。

---

## ▶️ 三、启动本地服务器

**每次开发时都要做：**

打开 cmd，进入项目目录：
```bash
cd %USERPROFILE%\Documents\game-project
python -m http.server 7892
```

看到类似输出就是成功了：
```
Serving on http://0.0.0.0:7892
```

**别关这个窗口！** 关了就服务器停了。

然后浏览器打开：**http://localhost:7892/**

### 如果提示"端口被占用"
```bash
# 换个端口启动
python -m http.server 8080
```
浏览器改为打开：http://localhost:8080/

---

## ✏️ 四、修改代码

### 方法 A：用 VS Code 打开（推荐）
```bash
code %USERPROFILE%\Documents\game-project
```

左边文件列表找到 `index.html`，点击打开。

改完后**保存**（Ctrl+S），然后刷新浏览器 `http://localhost:7892/` 看效果。

### 方法 B：用 Live Server 自动刷新（改完自动刷新）
1. 在 VS Code 里右键点 `index.html`
2. 选择 "Open with Live Server"
3. 改代码保存后浏览器自动刷新

---

## 🚀 五、推送代码到线上

改完后，在 cmd 里：
```bash
cd %USERPROFILE%\Documents\game-project
git add .
git commit -m "你的改动描述"
git push
```

> 如果 `git push` 提示登录，在 VS Code 里点左下角账号图标登录 GitHub。

推送成功后等 **1-2 分钟**，线上地址就更新了：
https://shuofuo.github.io/game-project/

---

## 📐 六、当前布局结构（iPhone 12, 390×664）

```
┌─────────────────────────────────────┐
│ topHud (全宽390, h=48)              │ ← 顶部状态栏
├──────┬──────────────────────┬───────┤
│ 左侧 │ featureRow (h=68)    │ 右侧  │ ← 5个功能按钮
│ 按钮 │───────────────────── │ 按钮  │
│ w=52 │ heroCard (h=88)      │ w=52  │ ← 灵兽详情卡 ⚠️在调
│      │ dragonGrid (h=386)  │       │ ← 灵兽网格 5×5
├──────┴──────────────────────┴───────┤
│ skillBarRow (h=22)                 │ ← 技能条
├─────────────────────────────────────┤
│ bottomBar (h=52)                   │ ← 召唤栏
└─────────────────────────────────────┘
```

---

## ⚠️ 七、当前未解决问题

### 灵兽卡（heroCard）右侧属性被裁掉

**现象**：右侧"攻击/防御/速度"三行字显示不全

**根因**：`heroCard` 宽度 263px，右侧 div 超出边界被 `overflow:hidden` 裁掉

**最新数据**：
```
heroCard: leftGap=63, rightGap=64 ✅ 居中没问题
右 div: left=233, w=80 → 超出 50px 被裁掉
```

**待尝试方案**：
1. 去掉 `heroCard` 的 `overflow:hidden`
2. 把右侧 div 改用固定宽度 `max-width:80px` 不让它扩张
3. 把 heroCard 整体宽度从 92% 改固定值

调法：改 `index.html` 里 `#heroCard` 相关样式，保存后刷新看效果。

---

## 🗂️ 八、核心文件

| 文件 | 作用 |
|------|------|
| `index.html` | 游戏主入口，改这里 |
| `js/config.js` | 灵兽/皮肤/成就/试炼塔配置 |
| `js/game.v5.js` | 召唤/合成/战斗逻辑 |
| `js/ui.v2.js` | 面板开关/动画等 |
| `DEVELOP.md` | 本文档 |

---

## 🔧 九、常见问题

### Q: cmd 里输入 python 报错"不是内部命令"
**A**: 重启电脑，让 Python 的 PATH 生效

### Q: `git clone` 很慢
**A**: 用手机开热点试试，或者加代理：
```bash
git config --global http.proxy http://127.0.0.1:7890
git clone https://github.com/shuofuo/game-project.git
```

### Q: 端口 7892 被占用
```cmd
netstat -ano | findstr :7892
taskkill /F /PID <这里填进程ID>
```

### Q: 想恢复到最新线上版本
```bash
cd %USERPROFILE%\Documents\game-project
git fetch origin
git reset --hard origin/gh-pages
```

### Q: VS Code 打开后乱码
**A**: VS Code 右下角点 UTF-8 → "Save with Encoding" → 选择 GBK 或 UTF-8

---

## 📞 十、继续开发步骤

1. `git clone` 项目
2. 打开 VS Code 改 `index.html`
3. `python -m http.server 7892` 预览
4. `git add . && git commit -m "描述" && git push` 推送
5. 等 2 分钟看线上效果

---

> 本文档由 OpenClaw AI 助手生成，最后更新 2026-07-06