# 📅 开发日志

## 2026-06-26（第一天）

### 项目启动

**背景**：
- 用户（shuofuo）即将失业，想用AI辅助开发小游戏
- 技术栈：会Python，普通电脑，无游戏开发经验
- 预算：极低，AI编程费用可控
- 时间：每天4小时

**今日决策**：

1. **确定游戏方向**：放置合成类
   - 理由：开发难度低、变现清晰、留存好
   - 差异化：加入中国传统文化元素

2. **确定游戏名称**：生肖天机
   - 理由：有文化深度、话题性强、海外华人认同感高
   - 核心玩法：选属相（12选1）+ 选命格（5选1）→ 合成进化 → 最终形态独一无二

3. **关键设计**：属相 × 命格双选系统
   - 用户选自己真实属相 → 终身绑定
   - 五行命格（金木水火土）决定不同属性
   - 组合：12属相 × 5命格 = 60种不同最终形态

4. **天机系统**：加入天干地支（60甲子）时辰系统
   - 现实1小时 = 游戏内1个时辰
   - 特定时辰触发"天机降临"限时事件
   - 增强话题性和每日打开理由

5. **确认不做的方向**：
   - 不用阿里云（小游戏平台托管）
   - 不用版号（小游戏免版号）
   - 不是龙（寓意太大，换成十二生肖）

**技术进展**：
- GitHub仓库创建：https://github.com/shuofuo/game-project
- SSH公钥配置完成
- 项目文档初始化：SPEC.md / TECH_ARCH.md / GAME_DESIGN.md / DEV_GUIDE.md / MIGRATION.md
- 所有代码通过Git管理，随时可换电脑

**下一步**：
- 安装Cocos Creator
- 开始写游戏代码（M1：拖拽+合成基础）
- 优先push所有重要设计文档到GitHub存档

**教训**：
- 所有设计决策必须写文件存档，不依赖对话记忆
- 会话轮次多了AI效果下降，保持简洁明确
- 公司环境随时不可用，代码即写即push
## 2026-06-27（第二天凌晨）

### 核心代码完成

**完成内容：**
- 16个TypeScript代码文件（GameManager/SaveSystem/CoinSystem等）
- 设计文档：SPEC.md v1.1（完整版）
- 搭建指南：docs/BUILD_GUIDE.md（Cocos Creator逐步操作文档）

**文件清单：**
- assets/scripts/Constants.ts      游戏常量（属相/命格/等级/产金/召唤配置）
- assets/scripts/Types.ts         类型定义（DragonData/GameSaveData等）
- assets/scripts/SaveSystem.ts     存档系统
- assets/scripts/GameManager.ts     主管理器
- assets/scripts/MergeSystem.ts     合成逻辑
- assets/scripts/SummonSystem.ts    召唤系统
- assets/scripts/CoinSystem.ts      产金系统
- assets/scripts/TianJiSystem.ts    天机时辰
- assets/scripts/FateSystem.ts      每日运势
- assets/scripts/QiSystem.ts        龙气系统
- assets/scripts/ShareSystem.ts     分享系统
- assets/scripts/MainSceneCtrl.ts   主场景UI控制
- assets/scripts/StartSceneCtrl.ts  起始场景UI控制

**待完成：**
- Cocos Creator可视化界面搭建（StartScene + MainScene）
- 拖拽事件实现
- 广告接入
- 发布审核

**环境信息：**
- Ubuntu开发机：Cocos Creator无法安装（无GPU/Linux版）
- Windows电脑：Cocos Creator 3.8.8已安装，用户正在搭建界面
- GitHub：shuofuo/game-project，所有代码已同步

**下一步：**
用户按 docs/BUILD_GUIDE.md 搭建界面，然后测试运行

---

## 2026-06-29 功能完善日

### 今日完成

| 功能 | 文件 | 状态 |
|------|------|------|
| **每日签到** | config.js+game.js+index.html | ✅ 完成 |
| **每日任务** | config.js+game.js+index.html | ✅ 完成 |
| **限时活动** | config.js+game.js+index.html | ✅ 完成 |
| **金币飘字动画** | config.js+index.html | ✅ 完成 |
| **成就弹窗升级** | game.js+index.html | ✅ 完成 |
| **README 重写** | README.md | ✅ 完成 |
| **功能状态表** | docs/GAME_STATUS.md | ✅ 完成 |
| **Cocos 废弃文件清理** | legacy/cocos/ | ✅ 移动完成 |

### 架构调整
- 删除 `html/` `assets/` `cocos-project.json` `v1.0.0.zip` `package.json`（移至 legacy/cocos/）
- 游戏引擎：纯 HTML5 + Web Audio API
- 托管：GitHub Pages（docs/ 即部署目录）
- 开发进度：Phase 1~3 全部完成，Phase 4 下一步（微信小程序）

### 下一步
1. 微信小程序 A2 嵌入（需域名 + 备案）
2. 合成连击特效
3. 游戏统计面板
4. 抖音/快手小程序（需企业资质）

---

## 2026-07-02 技能条修复 + 目录重构日

### 今日完成

| 功能 | 文件 | 状态 |
|------|------|------|
| **6个灵兽技能按钮** | game.v3.js renderSkillBar×7 | ✅ 完成 |
| **技能按钮点击特效** | game.v3.js skillClick() | ✅ 完成 |
| **手机模拟器入口** | phone-sim.html | ✅ 完成 |
| **GitHub Pages 部署修复** | gh-pages 根目录同步 | ✅ 完成 |
| **目录结构清理** | 删除 docs/废弃游戏副本+旧版本js | ✅ 完成 |

### 重要教训

| 问题 | 根因 | 修复 |
|------|------|------|
| 技能条不显示 | audio.js 无 startBgm 函数导致 startGame 静默失败 | 内联 playFullBgm 到 game.js，不依赖 audio.js |
| GitHub Pages 看不到更新 | Pages 部署的是 gh-pages 分支，不是 main 分支 | 统一往 gh-pages push |
| CDN 顽固缓存 | game.js / game.min.js 被缓存 | 改名 game.v3.js / audio.v2.js / ui.v2.js |
| docs/ 游戏副本混乱 | 早期 README 说游戏在 docs/，后来改到根目录 | 删除 docs/ 下的游戏代码，只留文档 |

### 最终目录结构

```
game-project/
├── index.html          ← 游戏主入口（gh-pages 分支根目录，GitHub Pages 部署）
├── phone-sim.html      ← 手机模拟器
├── js/
│   ├── config.js       被 index.html 引用
│   ├── audio.v2.js     被 index.html 引用（含 startBgm）
│   ├── game.v3.js      被 index.html 引用（含 7次 renderSkillBar）
│   └── ui.v2.js        被 index.html 引用（含内联 playFullBgm）
├── docs/               纯文档，Pages 不读取
└── legacy/             废弃的 Cocos 代码
```

### 下一步
1. 技能条 UI 美化（图标、颜色、动画）
2. 各技能实际效果落地
3. 手机模拟器完善
