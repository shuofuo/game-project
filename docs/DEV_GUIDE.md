# 🛠️ 开发指南 - 水果合成家

> 适用于：Ubuntu开发机 → Windows新电脑  
> 更新：2026-06-26

---

## 一、环境要求

### 1.1 开发机器（Ubuntu当前 / Windows新电脑）

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10/11 或 macOS 10.14+ |
| 内存 | 8GB（推荐16GB）|
| 硬盘 | 10GB可用空间 |
| 显卡 | 无要求（集成显卡即可）|
| 网络 | 需要（下载工具 + API调用）|

### 1.2 软件安装清单

```bash
# Windows 新电脑安装顺序

# 1. GitHub Desktop（代码管理，图形界面）
#    下载：https://desktop.github.com/

# 2. Node.js（LTS版，Cocos依赖）
#    下载：https://nodejs.org/
#    验证：node --version && npm --version

# 3. Python 3.10+（辅助脚本）
#    下载：https://www.python.org/downloads/

# 4. VS Code（代码编辑器）
#    下载：https://code.visualstudio.com/

# 5. Cocos Creator 3.x（游戏引擎）
#    下载：https://www.cocos.com/creator
#    选择：Windows版本，免费注册账号

# 6. Chrome（调试浏览器）
#    下载：https://www.google.com/chrome/
```

### 1.3 AI编程助手配置（硅基流动）

```bash
# 1. 注册硅基流动
#    网址：https://siliconflow.cn
#    注册送约 ¥15~30 免费额度

# 2. 获取 API Key
#    个人中心 → API密钥 → 创建新密钥
#    格式：sk-xxxxxxxxxxxxxxxx

# 3. 配置 VS Code 插件（推荐 Cherry Studio）
#    下载：https://cherry-ai.com/
#    配置：设置 → 模型 → 添加硅基流动API

# 4. 或直接用命令行调用
curl -X POST https://api.siliconflow.cn/v1/chat/completions \
  -H "Authorization: Bearer sk-你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{"model":"Qwen/Qwen2.5-7B-Instruct","messages":[{"role":"user","content":"你好"}]}'
```

### 1.4 本地模型（可选，完全免费）

```bash
# 安装 Ollama（零成本兜底）
# 官网：https://ollama.com
# 下载 Windows 版，安装后：

ollama pull qwen2.5:3b      # 3GB内存可跑，速度较慢
ollama pull qwen2.5:7b      # 7GB内存可跑，推荐

# 使用：
ollama run qwen2.5:7b

# 注意：Windows版Ollama需要 WSL2 或 Docker
# Mac直接支持，Linux用原生
```

---

## 二、项目初始化

### 2.1 克隆代码仓库

```bash
# 在 Windows 终端（PowerShell 或 Git Bash）执行

# 1. 打开文件夹（例如：D:\GameDev）
mkdir D:\GameDev
cd D:\GameDev

# 2. 克隆仓库
git clone git@github.com:你的用户名/game-project.git

# 3. 进入项目目录
cd game-project

# 4. 验证
ls -la
# 应该看到 README.md, docs/, src/ 等文件夹
```

### 2.2 Cocos Creator 项目结构

```bash
# Cocos Creator 项目结构（注意和 docs/ 目录区分）

# 用 Cocos Creator 打开项目时，选择 game-project/ 目录
# Cocos Creator 会自动生成以下文件夹：

game-project/
├── assets/              # ⚠️ Cocos资源目录（引擎使用）
│   ├── scenes/
│   ├── scripts/
│   ├── textures/
│   └── audio/
├── local/               # 本地配置
├── library/             # 引擎缓存（不要提交）
├── temp/                # 临时文件（不要提交）
├── build/               # 构建输出（不要提交）
├── .vscode/             # VS Code 配置
├── settings/             # 项目设置
├── assets.meta          # 资源索引（不要手动修改）
├── project.json         # Cocos项目配置
└── README.md            # 项目说明
```

### 2.3 Git 忽略文件

```bash
# .gitignore 文件（已配置好）

# Cocos 忽略
library/
temp/
build/
local/
*.meta

# 系统忽略
.DS_Store
Thumbs.db

# IDE忽略
.vscode/
.idea/
*.suo
```

---

## 三、日常开发流程

### 3.1 每天开始开发

```bash
# 1. 打开 GitHub Desktop，拉取最新代码
#    点击 "Fetch origin" → "Pull origin"

# 2. 打开 Cocos Creator，加载项目
#    File → Open Project → 选择 game-project 目录

# 3. 开始今天的任务
```

### 3.2 提交代码

```bash
# 1. 在 GitHub Desktop 查看改动
#    确认只改了你想要的文件

# 2. 填写提交信息
#    格式：feat: 新增合成逻辑
#    格式：fix: 修复拖拽水果重叠问题

# 3. 点击 "Commit to main"

# 4. 点击 "Push origin" 推送到云端
```

### 3.3 Git 分支策略（进阶）

```bash
# 如果要尝试新功能，用分支
git checkout -b feature/new-feature    # 创建并切换分支
# ... 开发 ...
git add .
git commit -m "feat: 新功能描述"
git checkout main                       # 切回主分支
git merge feature/new-feature           # 合并
git branch -d feature/new-feature       # 删除分支
```

---

## 四、代码规范

### 4.1 TypeScript 规范

```typescript
// ✅ 推荐：清晰的命名和注释
const COIN_PER_SECOND = 1;  // 每秒基础金币产出
const MAX_OFFLINE_HOURS = 8; // 最大离线收益时长

// ❌ 避免：模糊的命名
const a = 1;
const data = getData();

// ✅ 推荐：类型注解
interface FruitData {
  id: string;
  level: number;       // 1~10
  position: Vec2;
}

class GameManager {
  private coins: number = 0;
  private fruits: FruitData[] = [];
  
  // ✅ 推荐：async/await 风格
  async saveGame(): Promise<void> {
    try {
      const data = this.getSaveData();
      await SaveManager.save(data);
      console.log('存档成功');
    } catch (e) {
      console.error('存档失败', e);
    }
  }
}
```

### 4.2 注释规范

```typescript
/**
 * 合成两个水果
 * @param f1 水果1
 * @param f2 水果2
 * @returns 合成后的新水果，null表示不能合成
 */
doMerge(f1: Fruit, f2: Fruit): Fruit | null {
  // 同级才能合成
  if (f1.level !== f2.level) {
    return null;
  }
  
  // 最高级不能再合成
  if (f1.level >= 10) {
    return null;
  }
  
  // 合成逻辑
  return new Fruit(f1.level + 1);
}
```

---

## 五、调试技巧

### 5.1 Cocos Creator 调试

```typescript
// 在代码里加调试日志
console.log('当前金币：', this.coins);

// 浏览器调试
// Cocos Creator 内置 Chrome DevTools
// 快捷键：F12 打开浏览器开发者工具

// 断点调试
// 在 VS Code 里安装 Cocos Creator 插件
// 然后在 .ts 文件里打断点
```

### 5.2 快速测试技巧

```typescript
// 测试时，快速给金币
// 在 GameManager 里加一个测试方法
testAddCoins(amount: number): void {
  this.coins += amount;
  console.log('测试：增加金币', amount, '总计', this.coins);
}

// 测试时，直接解锁最高级水果
testUnlockAllFruits(): void {
  for (let i = 1; i <= 10; i++) {
    this.fruits.push({ id: uuid(), level: i });
  }
}
```

### 5.3 常见问题

| 问题 | 解决方法 |
|------|---------|
| 拖拽不灵敏 | 检查节点是否设置了 input 组件 |
| 水果重叠 | 碰撞分组设置错误，检查碰撞组件 |
| 存档丢失 | 检查 localStorage 是否正常 |
| 构建报错 | 看报错信息，常见是资源路径问题 |

---

## 六、Cocos Creator 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + S | 保存场景 |
| Ctrl + Z | 撤销 |
| Ctrl + C/V | 复制/粘贴节点 |
| F11 | 全屏预览 |
| F12 | 打开 Chrome DevTools |
| Ctrl + P | 快速打开文件 |
| Ctrl + Shift + B | 编译 TypeScript |

---

## 七、AI辅助开发技巧

### 7.1 有效提问方式

```typescript
// ✅ 好的问题
"我想让水果在拖拽时放大1.2倍，松开时恢复，怎么写？"
"这个碰撞检测的代码逻辑对不对？"
"帮我写一个合成特效的粒子系统参数"

// ❌ 不好的问题
"帮我写一个游戏"（太笼统）
"为什么我的代码不工作"（没有给代码）
```

### 7.2 提问模板

```
我正在做水果合成游戏，遇到一个问题：

【背景】
游戏引擎：Cocos Creator 3.x
语言：TypeScript
问题类型：拖拽交互

【问题描述】
我想让两个相同等级的水果拖到一起时，自动合成为一个更高等级的水果。

【我已经尝试的】
// 我的当前代码
doMerge(f1: Fruit, f2: Fruit) {
  if (f1.level === f2.level) {
    // 不知道接下来怎么写
  }
}

【错误信息】
无

【我想要的效果】
拖拽黄瓜A和黄瓜B到合成区域 → 释放后自动消失 → 产生一个番茄
```

### 7.3 获取代码后

```bash
# 让AI写的代码，一定要：
# 1. 先理解逻辑（读注释）
# 2. 小范围测试（不要一次全部替换）
# 3. 确认能跑，再继续
```

---

## 八、代码备份策略

```
每日自动同步：
- 每天开发结束，push 到 GitHub
- 即使只有一点点进展，也要 commit

重要节点备份：
- 每个里程碑完成后，打 tag
- 例：git tag -a v0.1 -m "第一个可运行版本"
- 例：git tag -a v1.0 -m "提交审核版本"

紧急情况：
- 如果本地代码损坏
- git clone 重新拉取即可
```

---

## 九、联系方式与资源

### 9.1 开发文档

- Cocos Creator 文档：https://docs.cocos.com/creator/manual/zh/
- TypeScript 中文网：https://www.tslang.cn/
- 硅基流动 API：https://siliconflow.cn/docs

### 9.2 遇到问题

```bash
# 优先自检顺序：
# 1. 看报错信息（不要忽略红色的字）
# 2. 搜索报错信息（CSDN / 知乎 / Cocos论坛）
# 3. 问 AI（我）→ 把完整的报错信息发给我
# 4. 最后再搜索论坛/群
```

---

> 持续更新中...  
> 最后更新：2026-06-26  
> 负责人：基建带师 🛠️ + 21027522_wy