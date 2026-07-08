# 🔄 迁移指南：Ubuntu → Windows

> 适用场景：从公司Ubuntu迁移到新Windows电脑  
> 预计时间：2~3小时  
> 预估费用：0元

---

## 迁移前（在Ubuntu上做完）

### 1.1 确认代码已同步

```bash
# 在 Ubuntu 终端执行

cd ~/openclaw/workspace/game-project

# 查看状态，确认没有未提交的改动
git status

# 如果有改动，先提交
git add .
git commit -m "chore: 迁移前最后一次提交"
git push origin main
```

### 1.2 整理关键信息

```bash
# 记录项目配置
cat > MIGRATION_INFO.txt << 'EOF'
===== 游戏项目迁移信息 =====

项目名称：水果合成家
代码仓库：https://github.com/你的用户名/game-project
SSH地址：git@github.com:你的用户名/game-project.git

Cocos Creator版本：3.x（Windows版）
推荐版本：Cocos Creator 3.8.0+

AI助手：硅基流动
API地址：https://siliconflow.cn
API文档：https://siliconflow.cn/docs

本地模型：Ollama
模型名称：qwen2.5:7b

游戏配置：
- 分辨率：1920×1080（竖屏）
- 目标平台：抖音/快手/微信小程序
- 存档方式：平台本地存储

关键文件：
- 入口：assets/scenes/MainScene.fire
- 主脚本：assets/scripts/GameManager.ts
- 合成逻辑：assets/scripts/MergeLogic.ts

API Key（迁移后重新配置）：
- 硅基流动：[迁移后重新注册]

===== 迁移清单 =====
[ ] Ubuntu：代码已push到GitHub
[ ] Ubuntu：整理好所有配置
[ ] Windows：安装所有软件
[ ] Windows：克隆代码
[ ] Windows：Cocos Creator打开项目
[ ] Windows：验证能编译运行
[ ] Windows：配置API Key
[ ] 第一天结束前：完成迁移验证
EOF

cat MIGRATION_INFO.txt
```

### 1.3 打包素材文件

```bash
# 如果有自定义素材，打包备用
cd ~/openclaw/workspace/game-project

# 列出所有资源
find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.mp3" -o -name "*.wav" \) | head -20

# 创建素材备份（如果有自定义资源）
# tar -czf assets_backup.tar.gz assets/
```

---

## 迁移当天（Windows新电脑）

### 2.1 安装顺序（约1.5小时）

```
安装顺序：
├── 1. GitHub Desktop（约5分钟）
├── 2. Chrome（约5分钟）
├── 3. Node.js（约5分钟）
├── 4. Python（约10分钟）
├── 5. VS Code（约10分钟）
├── 6. Cocos Creator（约30分钟）
└── 7. 配置环境（约30分钟）

合计：约1.5小时
```

### 2.2 安装详细步骤

#### Step 1: GitHub Desktop

```bash
# 浏览器打开
https://desktop.github.com/

# 下载安装包
# 双击运行，一路下一步

# 登录你的GitHub账号
# File → Options → Sign in
```

#### Step 2: Node.js

```bash
# 浏览器打开
https://nodejs.org/

# 下载 LTS 版本（推荐版本18或20）
# 安装时勾选 "Add to PATH"
# 验证：
node --version
npm --version
```

#### Step 3: Python

```bash
# 浏览器打开
https://www.python.org/downloads/

# 下载 Python 3.10 或 3.11
# 安装时勾选 "Add Python to PATH"
# 验证：
python --version
pip --version
```

#### Step 4: VS Code

```bash
# 浏览器打开
https://code.visualstudio.com/

# 下载 Windows 版
# 安装时勾选：
# ✅ Add to PATH
# ✅ Register Code as an editor for supported file types
# ✅ Add to desktop shortcut

# 推荐安装插件（Extensions）：
# - Chinese (Simplified) 中文语言包
# - Cocos Creator
# - TypeScript
```

#### Step 5: Cocos Creator

```bash
# 浏览器打开
https://www.cocos.com/creator

# 注册账号（免费）
# 下载 Windows 版本（选择最新稳定版）

# 安装：
# 双击运行，安装路径建议 D:\Apps\CocosCreator
# 不要装在 C:\Program Files（有权限问题）
```

### 2.3 克隆代码（5分钟）

```bash
# 方式一：GitHub Desktop（推荐新手）

# 1. 打开 GitHub Desktop
# 2. File → Clone Repository
# 3. 选择 game-project
# 4. Local path 选择 D:\GameDev\game-project
# 5. 点击 Clone

# 方式二：命令行

# 打开 PowerShell
mkdir D:\GameDev
cd D:\GameDev
git clone git@github.com:你的用户名/game-project.git
cd game-project
```

### 2.4 验证开发环境（10分钟）

```bash
# 1. 打开 Cocos Creator

# 2. 打开项目
#    File → Open Project
#    选择 D:\GameDev\game-project

# 3. 如果提示"创建项目"，说明目录选择错误
#    重新选择包含 project.json 的目录

# 4. 等待索引加载完成（约1~2分钟）

# 5. 打开主场景
#    assets → scenes → MainScene.fire
#    应该能看到场景编辑器
```

### 2.5 配置AI助手（10分钟）

#### 方案A：硅基流动（推荐，便宜）

```bash
# 1. 打开 https://siliconflow.cn
# 2. 注册账号（可用微信/手机号）
# 3. 实名认证（API平台要求）
# 4. 个人中心 → API密钥 → 创建新密钥
# 5. 复制密钥（格式：sk-xxxxxxxx）

# 6. 下载 Cherry Studio（图形界面）
#    https://cherry-ai.com/
#    安装后：
#    设置 → 模型 → 添加供应商 → 硅基流动
#    填入 API Key

# 7. 测试：发送一条消息，确认能回复
```

#### 方案B：本地Ollama（零成本）

```bash
# Windows 上 Ollama 需要 WSL2 或 Docker

# 推荐用 Docker（更简单）：
# 1. 下载 Docker Desktop：https://www.docker.com/products/docker-desktop/
# 2. 安装后运行
# 3. 打开 PowerShell：
docker run -d -p 11434:11434 ollama/ollama

# 4. 下载模型：
docker exec ollama ollama pull qwen2.5:7b

# 5. 测试：
curl http://localhost:11434/api/generate -d '{
  "model":"qwen2.5:7b",
  "prompt":"你好"
}'
```

---

## 迁移后验证清单

### 3.1 环境验证

```bash
# 打开 PowerShell，依次执行：

node --version    # 应该显示 v18.x 或 v20.x
npm --version     # 应该显示 9.x 或 10.x
python --version  # 应该显示 3.10.x 或 3.11.x
git --version     # 应该显示 2.x.x
```

### 3.2 Cocos Creator 验证

```
1. 打开 Cocos Creator
2. File → Open Project → 选择 game-project
3. 等索引加载完成（约1分钟）
4. 在场景中随便放一个节点
5. Ctrl + S 保存
6. Build → Web Mobile → Build
7. 等待构建完成（约1分钟）
8. 打开 build/web-mobile/index.html 验证能运行
```

### 3.3 GitHub 验证

```bash
# 在项目目录执行
git status
# 应该显示 "nothing to commit, working tree clean"

# 或者打开 GitHub Desktop
# 确认右上角显示 "Nothing to commit"
```

---

## 迁移后第一天任务

```
早上（1小时）：
├── 打开Cococs Creator，确认能打开项目
├── 打开GitHub Desktop，确认代码同步
└── 打开Cherry Studio，确认AI能对话

下午（3小时）：
├── 继续当天的开发任务
├── 写一行代码，commit + push
├── 在新环境测试编译
└── 确认开发流程正常
```

---

## 常见问题

| 问题 | 解决方法 |
|------|---------|
| GitHub Desktop 登录失败 | 检查网络，换VPN |
| git clone 失败 | 检查SSH key是否添加 |
| Cocos Creator 打开报错 | 可能是路径有中文，改成英文路径 |
| 构建失败 | 看Console报错，常见是缺少资源 |
| AI不回复 | 检查API Key是否正确，网络是否稳定 |

---

## 迁移完成标志

```
✅ 所有软件安装完成
✅ GitHub Desktop 登录并克隆代码
✅ Cocos Creator 能打开并编译项目
✅ AI助手能正常对话
✅ 能commit + push代码
✅ 第一天结束前跑通完整流程
```

---

> 迁移不是终点，是新的起点 🚀  
> 如果遇到问题，随时来找我！