# 生肖天机 - Cocos Creator 搭建指南

> 版本：v1.0  
> 日期：2026-06-27  
> 作者：基建带师 🛠️

---

## 目录

1. [创建 StartScene 起始场景](#1-startscene-起始场景)
2. [创建 MainScene 主场景](#2-mainscene-主场景)
3. [挂载脚本](#3-挂载脚本)

---

## 准备工作

### 打开 Cocos Creator
1. 双击桌面 Cocos Creator 3.8.8
2. 打开项目：`game-project` 文件夹

### 确认界面区域

```
┌─────────────────────────────────────────────┐
│  菜单栏（文件/编辑/项目...）                  │
├─────────────────────────────────────────────┤
│                                             │
│   资源管理器    │     场景编辑器（中间大片）   │
│   (左侧)        │                           │
│                 │                           │
│                 │     层级管理器              │
│                 │     （场景节点树）          │
│                 │                           │
├─────────────────────────────────────────────┤
│   控件库        │     属性检查器（右侧）       │
│   (底部)        │                           │
└─────────────────────────────────────────────┘
```

---

## 1. StartScene 起始场景

### 1.1 创建场景

1. 左侧**资源管理器** → 右键 `assets/scenes`
2. 选择 **"创建 → 场景"**
3. 命名为 `StartScene`（如果已存在就叫 `StartScene2`）
4. **双击** 打开场景

### 1.2 创建画布（Canvas）

1. 右键场景空白处 → **"创建 → 2D → Canvas"**
2. 节点会自动创建，名为 `Canvas`

### 1.3 添加背景

1. 右键 `Canvas` → **"创建 → 2D → Sprite（精灵）"**
2. 改名为 `Background`
3. 右侧**属性检查器**设置：
   - **颜色**：深蓝紫 `#1a1a2e`（RGB: 26, 26, 46）
   - **ContentSize**：宽度 `750`，高度 `1334`

### 1.4 添加标题

1. 右键 `Canvas` → **"创建 → 2D → Label（标签）"**
2. 改名为 `Title`
3. 在**层级管理器**拖到 `Canvas` 下面
4. 右侧设置：
   - **String**（文字）：`生肖天机`
   - **FontSize**：`64`
   - **Color**：金色 `#FFD700`
   - **ContentSize**：自动
   - **Position**：x=0, y=550, z=0

### 1.5 添加属相选择区域标题

1. 右键 `Canvas` → **"创建 → 2D → Label"**
2. 改名为 `ZodiacTitle`
3. 设置：
   - **String**：`选择你的属相`
   - **FontSize**：`36`
   - **Color**：白色 `#FFFFFF`
   - **Position**：x=0, y=350, z=0

### 1.6 添加属相按钮（12个）

**方法：创建 4×3 网格**

右键 `Canvas` → **"创建 → 2D → Button"** → 改名为 `Zodiac_0`

依次创建 12 个，命名为 `Zodiac_0` 到 `Zodiac_11`

每个按钮设置：
- **ContentSize**：宽 `100`，高 `100`
- **Position**：见下表

| 按钮 | 名称 | x | y | emoji |
|------|------|---|----|------|
| 1 | Zodiac_0（鼠）| -112 | 200 | 🐀 |
| 2 | Zodiac_1（牛）| 0 | 200 | 🐂 |
| 3 | Zodiac_2（虎）| 112 | 200 | 🐅 |
| 4 | Zodiac_3（兔）| -168 | 80 | 🐇 |
| 5 | Zodiac_4（龙）| -56 | 80 | 🐉 |
| 6 | Zodiac_5（蛇）| 56 | 80 | 🐍 |
| 7 | Zodiac_6（马）| 168 | 80 | 🐎 |
| 8 | Zodiac_7（羊）| -112 | -40 | 🐏 |
| 9 | Zodiac_8（猴）| 0 | -40 | 🐒 |
| 10 | Zodiac_9（鸡）| 112 | -40 | 🐓 |
| 11 | Zodiac_10（狗）| -56 | -160 | 🐕 |
| 12 | Zodiac_11（猪）| 56 | -160 | 🐖 |

每个按钮里的 Label：
- **String**：对应的 emoji
- **FontSize**：`50`
- **Color**：白色
- **对齐**：居中

**选中状态颜色**（右侧 Button 属性）：
- **Pressed Color**：`#FFD700`（金色）
- **Duration**：`0.1`
- **ZoomScale**：`1.2`

### 1.7 添加命格选择标题

1. 右键 `Canvas` → **"创建 → 2D → Label"**
2. 改名为 `FateTitle`
3. 设置：
   - **String**：`选择你的命格`
   - **FontSize**：`36`
   - **Color**：白色
   - **Position**：x=0, y=-250, z=0

### 1.8 添加命格按钮（5个）

依次创建 5 个 Button，命名为 `Fate_0` 到 `Fate_4`

| 按钮 | 名称 | x | y | 文字 | 颜色 |
|------|------|-----|-----|------|------|
| 1 | Fate_0（木）| 0 | -350 | 🪵 木命 | 绿色 |
| 2 | Fate_1（火）| 0 | -450 | 🔥 火命 | 红色 |
| 3 | Fate_2（土）| 0 | -550 | 🟤 土命 | 棕色 |
| 4 | Fate_3（金）| 0 | -650 | ⚪ 金命 | 白色 |
| 5 | Fate_4（水）| 0 | -750 | 💧 水命 | 蓝色 |

每个按钮设置：
- **ContentSize**：宽 `300`，高 `80`
- **Label FontSize**：`36`
- **Label Color**：对应命格颜色

### 1.9 添加开始按钮

1. 右键 `Canvas` → **"创建 → 2D → Button"**
2. 改名为 `StartButton`
3. 设置：
   - **ContentSize**：宽 `250`，高 `80`
   - **Position**：x=0, y=-950, z=0
   - **Label String**：`开始游戏`
   - **Label FontSize**：`40`
   - **Background Color**：`#4CAF50`（绿色）
   - **Initial**: 不勾选（开始时禁用，选完属相命格后启用）

---

## 2. MainScene 主场景

### 2.1 创建场景

1. 右键 `assets/scenes`
2. "创建 → 场景"
3. 命名为 `MainScene`
4. **双击** 打开

### 2.2 创建画布

1. 右键场景空白 → **"创建 → 2D → Canvas"**

### 2.3 顶部信息栏（TopBar）

**2.3.1 背景条**

1. 右键 `Canvas` → **"创建 → 2D → Sprite"**
2. 改名为 `TopBar`
3. 设置：
   - **ContentSize**：宽 `750`，高 `100`
   - **Color**：`#16213e`（深蓝）
   - **Position**：x=0, y=617, z=0

**2.3.2 金币显示**

1. 右键 `TopBar` → **"创建 → 2D → Label"**
2. 改名为 `CoinLabel`
3. 设置：
   - **String**：`💰 0`
   - **FontSize**：`32`
   - **Color**：金色 `#FFD700`
   - **Position**：x=-280, y=0, z=0
   - **Anchor**：中点居中

**2.3.3 龙气显示**

1. 右键 `TopBar` → **"创建 → 2D → Label"**
2. 改名为 `QiLabel`
3. 设置：
   - **String**：`✨ 0`
   - **FontSize**：`32`
   - **Color**：`#87CEEB`（天蓝）
   - **Position**：x=0, y=0, z=0

**2.3.4 产金速度**

1. 右键 `TopBar` → **"创建 → 2D → Label"**
2. 改名为 `RateLabel`
3. 设置：
   - **String**：`0/s`
   - **FontSize**：`28`
   - **Color**：白色
   - **Position**：x=220, y=0, z=0

### 2.4 召唤按钮组（底部）

**2.4.1 召唤按钮背景**

1. 右键 `Canvas` → **"创建 → 2D → Sprite"**
2. 改名为 `BottomBar`
3. 设置：
   - **ContentSize**：宽 `750`，高 `250`
   - **Color**：`#0f0f23`
   - **Position**：x=0, y=-542, z=0

**2.4.2 金币召唤按钮**

1. 右键 `BottomBar` → **"创建 → 2D → Button"**
2. 改名为 `SummonBtn`
3. 设置：
   - **ContentSize**：宽 `160`，高 `80`
   - **Position**：x=-200, y=50, z=0
   - **Label String**：`召唤 100💰`
   - **Label FontSize**：`24`
   - **Background Color**：`#2E7D32`（深绿）

**2.4.3 龙气召唤按钮**

1. 右键 `BottomBar` → **"创建 → 2D → Button"**
2. 改名为 `QiSummonBtn`
3. 设置：
   - **ContentSize**：宽 `160`，高 `80`
   - **Position**：x=0, y=50, z=0
   - **Label String**：`龙气召唤`
   - **Label FontSize**：`24`
   - **Label Color**：`#87CEEB`
   - **Background Color**：`#1a237e`（深蓝）

**2.4.4 土命免费按钮**

1. 右键 `BottomBar` → **"创建 → 2D → Button"**
2. 改名为 `FateFreeBtn`
3. 设置：
   - **ContentSize**：宽 `160`，高 `80`
   - **Position**：x=200, y=50, z=0
   - **Label String**：`土命免费 3/3`
   - **Label FontSize**：`24`
   - **Label Color**：`#8D6E63`
   - **Background Color**：`#4E342E`（棕色）

**2.4.5 广告召唤按钮**

1. 右键 `BottomBar` → **"创建 → 2D → Button"**
2. 改名为 `AdBtn`
3. 设置：
   - **ContentSize**：宽 `350`，高 `80`
   - **Position**：x=0, y=-70, z=0
   - **Label String**：`看广告召唤 5/5`
   - **Label FontSize**：`28`
   - **Background Color**：`#F57C00`（橙色）

### 2.5 合成区域（中间）

1. 右键 `Canvas` → **"创建 → 2D → Sprite"**
2. 改名为 `MergeZone`
3. 设置：
   - **ContentSize**：宽 `200`，高 `200`
   - **Color**：`#2a2a4a`（半透明紫）
   - **Position**：x=0, y=200, z=0
   - **Opacity**：150（半透明）
   - **Sprite Type**：`Simple`（四角星形状需要自定义图片，这里先用矩形）

4. 在 `MergeZone` 上添加 Label：
   - 右键 `MergeZone` → **"创建 → 2D → Label"**
   - 改名为 `MergeHint`
   - **String**：`拖拽到此处合成`
   - **FontSize**：`20`
   - **Color**：`#888888`
   - **Position**：x=0, y=0, z=0

### 2.6 灵兽展示区

中间大部分空白区域是**灵兽自由放置区**，不需要额外添加节点。

---

## 3. 挂载脚本

### 3.1 把脚本文件关联到节点

**StartScene 脚本挂载：**

1. 在 Cocos Creator 左侧**资源管理器**，找到 `assets/scripts/StartSceneCtrl.ts`
2. **双击** `StartSceneCtrl.ts` → 会用 VS Code 打开
3. 回到 Cocos Creator，右键 `Canvas` → **"创建 → 空节点"**
4. 改名为 `GameController`
5. 选中 `GameController`，右侧**属性检查器**底部点 **"添加组件"**
6. 搜索 `StartSceneCtrl`，添加
7. 在 **GameController** 的属性里找到脚本暴露的变量，把对应的节点拖进去

**MainScene 脚本挂载：**

1. 双击打开 `MainScene`
2. 创建空节点 `GameController`
3. 添加组件 `MainSceneCtrl`
4. 把对应的按钮节点、Label 节点拖到脚本属性里

### 3.2 脚本属性绑定（参考）

**MainSceneCtrl 需要的绑定：**

| 脚本变量名 | 绑定节点 | 类型 |
|-----------|---------|------|
| coinLabel | TopBar/CoinLabel | Label |
| qiLabel | TopBar/QiLabel | Label |
| rateLabel | TopBar/RateLabel | Label |
| summonBtn | BottomBar/SummonBtn | Button |
| qiBtn | BottomBar/QiSummonBtn | Button |
| fateFreeBtn | BottomBar/FateFreeBtn | Button |
| adBtn | BottomBar/AdBtn | Button |
| mergeZone | MergeZone | Node |

**StartSceneCtrl 需要的绑定：**

| 脚本变量名 | 绑定节点 |
|-----------|---------|
| startButton | StartButton |

---

## 4. 运行测试

### 4.1 运行 StartScene

1. 菜单 **项目** → **运行预览**
2. 或者按 **`Ctrl + Shift + R`**

### 4.2 常见问题

**问题1：界面显示空白**
→ 检查 Canvas 是否在场景里，节点是否正确创建

**问题2：按钮点不了**
→ 检查脚本是否正确挂载，事件是否绑定

**问题3：报错 "Cannot find module"**
→ 检查 `Constants.ts` 是否在 `assets/scripts/` 下

---

## 5. 快速检查清单

完成 StartScene 后确认：
- [ ] 标题"生肖天机"显示在顶部
- [ ] 12个属相按钮整齐排列（4列3行）
- [ ] 5个命格按钮垂直排列
- [ ] 点击属相按钮会变金色
- [ ] 点击命格按钮会高亮
- [ ] 两个都选完后"开始游戏"按钮可用

完成 MainScene 后确认：
- [ ] 顶部显示 💰金币、✨龙气、产金速度
- [ ] 底部4个召唤按钮
- [ ] 中间有合成区域（半透明方框）
- [ ] 点击召唤按钮能添加灵兽（代码层面）
- [ ] 拖拽两个相同灵兽到合成区域能触发合成

---

> 如果遇到问题，用方法 A（逐步指导）继续 🚀