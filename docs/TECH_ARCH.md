# 🔧 技术架构文档 · 生肖天机

> 版本：v1.0  
> 日期：2026-06-26  
> 状态：设计阶段

---

## 一、引擎与环境

### 1.1 开发环境

```
开发机（Ubuntu 当前）：
- OS: Ubuntu（公司环境，随时可能不可用）
- 需尽快将所有代码 push 到 GitHub

新电脑（Windows 10 未来）：
- OS: Windows 10
- Cocos Creator 3.x
- GitHub Desktop
- VS Code
- 硅基流动 API（主要编程辅助）
- Ollama + Qwen2.5-7B（备用/离线）
```

### 1.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 游戏引擎 | Cocos Creator 3.8.x | 免费，跨平台，文档完善 |
| 编程语言 | TypeScript | Cocos 官方推荐，强类型 |
| 构建目标 | 抖音/快手/微信小游戏 | WebGL，竖屏 750×1334 |
| 代码版本 | Git + GitHub | SSH 已配置，仓库：shuofuo/game-project |
| AI 辅助 | 硅基流动 API | ¥0.006/千token，每天¥3~15元 |
| 本地模型 | Ollama + Qwen2.5-7B | 免费兜底，无需联网 |
| 广告 | 穿山甲（字节系）/ 快手联盟 | 按收入分成，无需自己接入 |
| 存档 | 平台本地存储 | 无需服务器，完全免费 |

### 1.3 项目初始化命令（Cocos Creator）

```bash
# Cocos Creator 项目创建后，用命令行初始化 Git
cd game-project
git init
git add .
git commit -m "feat: 初始 Cocos Creator 项目"
git remote add origin git@github.com:shuofuo/game-project.git
git push -u origin main
```

---

## 二、核心模块设计

### 2.1 模块依赖关系

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   SaveSystem（存档）                                 │
│        ↑                                            │
│   GameManager（主循环）←──────┐                     │
│        ↑                     ↑                      │
│   ├─ CoinSystem（金币）      │                      │
│   ├─ DragonSystem（灵兽）    │                      │
│   ├─ QiSystem（龙气）        │                      │
│   ├─ MergeSystem（合成）─────┼─────── 核心          │
│   ├─ FateSystem（运势）      │                      │
│   ├─ TianJiSystem（天机）─────┘                      │
│   ├─ AdSystem（广告）                               │
│   └─ ShareSystem（分享）                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 核心类说明

#### GameManager.ts（游戏主循环）

```typescript
// 游戏状态
type GameState = 'creating' | 'playing' | 'paused' | 'offline';

class GameManager extends Component {
  // 状态
  gameState: GameState;
  playerZodiac: number;       // 0~11，对应12属相
  playerFate: number;         // 0~4，对应5命格
  coins: number;
  dragonQi: number;
  lastOnlineTime: number;     // 上次离线时间戳

  // 核心方法
  onLoad(): void;              // 初始化，读取存档
  update(dt: number): void;   // 每帧：产金、更新天机
  onDestroy(): void;           // 退出时自动存档

  // 存档
  saveGame(): void;            // 保存到 PlayerPrefs
  loadGame(): void;            // 读取存档
  getOfflineEarnings(): { coins: number; qi: number; };

  // 创建角色
  createCharacter(zodiac: number, fate: number): void;
}
```

#### MergeSystem.ts（合成逻辑 - 核心）

```typescript
class MergeSystem {
  /**
   * 检查两个灵兽是否可以合成
   * 规则：等级相同 + 等级 < 12
   */
  canMerge(d1: Dragon, d2: Dragon): boolean;

  /**
   * 执行合成
   * 返回合成后的新灵兽，或 null
   */
  doMerge(d1: Dragon, d2: Dragon): Dragon | null;

  /**
   * 检查合成区是否触发了合成
   */
  checkMergeZone(): void;

  /**
   * 获取当前背包中所有灵兽
   */
  getBackpack(): Dragon[];

  /**
   * 向背包添加灵兽
   */
  addToBackpack(dragon: Dragon): void;
}
```

#### DragonSystem.ts（灵兽管理）

```typescript
interface DragonData {
  id: string;           // 唯一ID
  level: number;        // 1~12
  zodiac: number;       // 0~11（生成时随机）
  fate: number;         // 0~4（生成时随机）
  posX: number;         // 屏幕位置
  posY: number;
}

class DragonSystem {
  dragons: DragonData[];

  // 生成新灵兽
  summonByCoins(): DragonData | null;
  summonByQi(qiCost: number): DragonData | null;
  summonByAd(): DragonData | null;
  summonByFate(): DragonData | null;  // 土命免费召唤

  // 产金计算
  calcCoinPerSecond(): number;         // 累加所有灵兽产金

  // 灵兽数据 ↔ Cocos 节点
  createDragonNode(d: DragonData): Node;
  updateAllNodes(): void;
}
```

#### TianJiSystem.ts（天机时辰系统）

```typescript
class TianJiSystem {
  // 天干地支
  currentTianGan: number;    // 0~9（甲乙丙丁戊己庚辛壬癸）
  currentDiZhi: number;      // 0~11（子丑寅卯辰巳午未申酉戌亥）

  // 时辰推进（每小时调用一次）
  advanceHour(): void;

  // 获取当前完整时辰文字
  getCurrentTimeString(): string;  // 返回 "丙午时辰"

  // 检查是否触发天机事件
  checkTianJiEvent(): TianJiEvent | null;

  // 获取产金倍率
  getCoinMultiplier(): number;  // 受天机事件+运势影响
}
```

#### FateSystem.ts（每日运势）

```typescript
interface DailyFate {
  stars: number;           // 1~5星
  coinBonus: number;        // 产金倍率加成
  summonBonus: number;      // 召唤概率加成
  text: string;             // 运势描述文字
  tiangan: string;         // 今日天干（如"甲"）
  dizhi: string;            // 今日地支（如"卯"）
}

class FateSystem {
  todayFate: DailyFate;

  // 每日0点刷新
  refreshDaily(): void;

  // 运势文字生成
  generateFateText(stars: number): string;
}
```

### 2.3 数据存储结构

```typescript
// PlayerPrefs 存储键
const SAVE_KEY = 'shengxiao_tianji_save';

// 存档数据结构
interface GameSaveData {
  version: string;              // "v1.0"，用于版本迁移

  // 角色创建
  zodiac: number;               // 0~11，-1表示未创建
  fate: number;                 // 0~4，-1表示未创建

  // 货币
  coins: number;
  dragonQi: number;

  // 灵兽
  dragons: DragonData[];

  // 统计数据
  totalCoinsEarned: number;
  totalQiEarned: number;
  playDays: number;
  mergeCount: number;

  // 天机系统
  lastOnlineTime: number;       // 上次离线时间戳
  tiangan: number;              // 当前天干
  dizhi: number;                // 当前地支

  // 每日运势
  lastFateDate: string;         // "2026-06-26"
  currentFate: number;          // 1~5

  // 土命召唤CD
  fateFreeCount: number;        // 今日剩余土命免费次数
}
```

---

## 三、UI结构（Cocos Scene）

### 3.1 开始场景（StartScene）

```
StartScene.fire
├── Background（背景图）
├── TitleLabel（"生肖天机"标题）
├── ZodiacPanel（属相选择面板）
│   ├── 12个属相按钮（🐀🐂🐅...）
│   └── SelectedLabel（显示已选）
├── FatePanel（命格选择面板）
│   ├── 5个命格按钮（木🔥土⚪💧）
│   └── DescLabel（显示属性说明）
└── EnterButton（"进入觉醒"按钮）
    → 点击后保存角色，跳转到 MainScene
```

### 3.2 主场景（MainScene）

```
MainScene.fire
├── TopBar（顶部状态栏）
│   ├── TimeLabel（"丙午时辰"）
│   ├── CoinLabel（"💰 12,345"）
│   └── QiLabel（"✨ 2,888"）
│
├── FatePanel（运势条）
│   ├── Stars（⭐⭐⭐⭐☆）
│   └── FateText（"丙午时辰·午马运"）
│
├── MergeZone（合成区域）
│   ├── Background（发光圆形区域）
│   ├── MergeEffect（合成特效节点）
│   ├── DropHint（"拖拽到这"提示）
│   └── 2个Slot（放置灵兽的槽位）
│
├── BackpackPanel（背包/灵兽区域）
│   ├── ScrollView（可滑动区域）
│   └── DragonItem[]（灵兽节点网格）
│
├── BottomBar（底部导航）
│   ├── SummonBtn（⚔️ 召唤）
│   ├── FateBtn（💫 祈福）
│   ├── AtlasBtn（📖 图鉴）
│   ├── RankBtn（📊 排行）
│   └── SettingBtn（⚙️ 设置）
│
└── PopupLayer（弹窗层）
    ├── SummonPopup（召唤弹窗）
    ├── FatePopup（祈福弹窗）
    ├── AtlasPopup（图鉴弹窗）
    ├── TianJiPopup（天机降临弹窗）
    └── OfflinePopup（离线收益弹窗）
```

---

## 四、资源规划

### 4.1 灵兽图片（12等级）

| 等级 | 文件命名 | 说明 |
|------|---------|------|
| Lv1~Lv12 | creature_lv1.png ~ creature_lv12.png | 共12张基础图 |
| 火命特效 | creature_lv{n}_fire.png | 带火焰特效叠加 |
| 水命特效 | creature_lv{n}_water.png | 带水波特效叠加 |
| 木命特效 | creature_lv{n}_wood.png | 带藤蔓特效叠加 |
| 金命特效 | creature_lv{n}_metal.png | 带金光特效叠加 |
| 土命特效 | creature_lv{n}_earth.png | 带山石特效叠加 |

**总计：12 + 12×5 = 72张图**

### 4.2 资源来源

```
购买素材（淘宝）：约 ¥200~500
AI生成（Midjourney/Stable Diffusion）：约 ¥0~100
免费素材（爱给网/kaboompics）：¥0
自绘（如果有设计能力）：¥0

建议：第一版先用免费/便宜素材，后续迭代
```

### 4.3 音效

```
背景音乐：中国风轻音乐（古筝/笛子）
合成音效："叮"（清脆）
升级音效：金光/电闪
按钮音效：短促点击
天机降临：大气磅礴BGM切换
```

---

## 五、Git 工作流

### 5.1 分支策略

```
main          ← 稳定版（可发布的代码）
dev           ← 开发中（日常提交）
feature/xxx   ← 功能分支（每个大功能开一个分支）
```

### 5.2 提交规范

```
feat: 新功能
fix: 修复Bug
docs: 文档更新
refactor: 重构
chore: 杂项（依赖更新等）
```

### 5.3 日常流程

```bash
# 每天开始
git pull origin dev

# 每天结束
git add .
git commit -m "feat: 完成召唤系统"
git push origin dev
```

### 5.4 重要节点

```
每个里程碑完成后打 tag：
git tag -a v0.1 -m "M1完成：合成基础功能"
git push origin v0.1
```

---

## 六、风险清单

| 风险 | 概率 | 应对 |
|------|------|------|
| 公司收回Ubuntu环境 | 高 | 代码已push到GitHub，换电脑可继续 |
| 开发期间会话变长，效果下降 | 高 | 所有重要决策写文件，不依赖对话 |
| Cocos Creator 踩坑 | 中 | 优先用简单方案，不过度设计 |
| 审核不通过 | 低 | 严格按平台规范开发 |
| 广告收入为0 | 中 | 先做留存，再考虑变现 |
| 美术素材不足 | 高 | 第一版用简单素材，降低预期 |

---

## 七、日常开发规范

```
1. 每次开发前先 git pull
2. 每次开发后 git commit + push
3. 重要设计决策必须写文件存档
4. 代码改动后本地测试通过再push
5. 遇到问题先查文档，再问AI，最后再问人
6. 每天结束时确认代码已push到GitHub
```

---

> 本文档为技术架构设计 v1.0  
> 后续更新需记录变更内容到 SPEC.md 的"重要决策记录"章节