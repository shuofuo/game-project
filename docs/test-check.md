# 神兽联盟 · 测试验证文档

> 版本：v9-fix-tower — 2026-07-03  
> 源码：`js/config.js`(1574行) / `js/game.v5.js`(3851行) / `js/ui.v2.js`(294行)  
> 启动：`python -m http.server 7892` → http://localhost:7892  
> 清理缓存：
> ```js
> localStorage.removeItem('sxgame_v2');
> localStorage.removeItem('sxgame_v2_ach');
> localStorage.removeItem('sxgame_v2_rank');
> localStorage.removeItem('sxgame_v2_guide');
> location.reload();
> ```

---

## 清理缓存脚本（快速复制）

```js
localStorage.removeItem('sxgame_v2');localStorage.removeItem('sxgame_v2_ach');localStorage.removeItem('sxgame_v2_rank');localStorage.removeItem('sxgame_v2_guide');location.reload();
```

---

## 模块一：UI 视觉

### 1.1 HUD（顶栏信息栏）

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 金币/龙气显示 | 页面加载后查看顶栏 | 显示 `金币: XXX` 和 `龙气: XXX`，数字非负 | `console.log('金币:', G.coins, '龙气:', G.qi)` |
| 本周挑战进度 | 查看HUD右侧 | 显示本周挑战阶段和进度文字 | `console.log(G.weekly_challenge)` |
| 召唤按钮cost | 点击免费召唤按钮 | 按钮显示消耗数值（金币单抽消耗或龙气单抽消耗） | `document.querySelector('.summon-btn')?.textContent` |
| `updateHud()` 刷新 | 控制台调用 `updateHud()` | HUD立即更新，不闪烁 | `updateHud(); console.log('HUD更新OK')` |

### 1.2 5×5 灵兽网格

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 网格渲染 | 页面加载或 `renderGrid()` | 25个格子（5×5）正确显示，有灵兽的格子显示图片和生肖emoji | `document.querySelectorAll('.d-cell').length` |
| 灵兽属性显示 | 查看每个有灵兽的格子 | 显示 `LNAME[level]` 名称 + `ZOD_E[z]` 生肖 | `G.dragons.map(d => ({name: LNAME[d.level], zodiac: ZOD_E[d.z]}))` |
| 空格显示 | 查看空格格子 | 显示空状态提示（默认空白或占位图） | `document.querySelectorAll('.d-cell').length === 25` |
| 点击灵兽打开详情 | 点击有灵兽的格子 | 弹出 `showDragonDetail(dragonId)` 详情弹窗 | `showDragonDetail(G.dragons[0].id)` |
| 滚动/放大 | 无操作 | 视口内完整显示5×5网格，无裁剪 | `document.querySelector('.grid-container')?.getBoundingClientRect()` |

### 1.3 大灵兽展示区

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 大灵兽动画循环 | 页面加载后观察展示区 | 大灵兽有循环动画播放（`cycleHeroAnim()`相关） | `console.log('大灵兽区是否存在', !!document.querySelector('.hero-section'))` |
| 大灵兽属性 | 召唤高稀有度灵兽后 | 大灵兽区展示当前最高灵兽 | `cycleHeroAnim(); console.log('动画触发')` |

---

## 模块二：抽卡逻辑

### 2.1 单抽

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 免费单抽 | 调用 `summonFree()` | 若今日免费次数未用，产出灵兽，网格刷新 | `summonFree()` |
| 免费次数耗尽 | 再次调用 `summonFree()` | 提示"今日免费次数已用完"（`showNotif`） | `summonFree()` |
| 金币单抽 | 调用 `summonCoin()` | 扣除金币，产出灵兽（根据 `COIN_S` 概率），`updateHud()` 刷新 | `summonCoin()` |
| 金币不足 | 金币归0后调用 `summonCoin()` | 提示"金币不足" | `G.coins = 0; summonCoin()` |
| 龙气单抽 | 调用 `summonQi()` | 扣除龙气，产出灵兽，`updateHud()` 刷新 | `summonQi()` |
| 龙气不足 | 龙气归0后调用 `summonQi()` | 提示"龙气不足" | `G.qi = 0; summonQi()` |
| 十连模式切换 | 调用 `setSummonBatch(10)` | `G._isTenMode = true`，召唤按钮切换为"十连"状态 | `setSummonBatch(10); console.log('_isTenMode:', G._isTenMode)` |
| 十连模式切回单抽 | 调用 `setSummonBatch(1)` | `G._isTenMode = false` | `setSummonBatch(1)` |
| `doSummon(level)` 精确调用 | 控制台 `doSummon(8)` | 手动指定稀有度level抽卡（level为LNAME下标，1-15） | `doSummon(8)` |
| 十连（龙气） | 调用 `doTenSummon('qi')` | 返回10条灵兽结果列表，弹出 `showBatchSummonResult(results)` | `showBatchSummonResult(doTenSummon('qi'))` |
| 十连（金币） | 调用 `doTenSummon('coin')` | 返回10条结果，弹出结果弹窗 | `showBatchSummonResult(doTenSummon('coin'))` |

### 2.2 稀有度验证

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 普通稀有度 | 召唤 level ≤ 2 | `rarIdx(lvl)` 返回普通，网格卡片显示对应样式 | `console.log('rarIdx(2):', rarIdx(2))` |
| 稀有度层级 | 检查各稀有度边界 | rarIdx(≤2)=普通 / ≤4=稀有 / ≤7=史诗 / ≤10=传说 / >10=神话 | `[1,2,3,4,5,7,8,10,11,12,15].forEach(l=>console.log('level',l,'=',rarIdx(l)))` |

---

## 模块三：12生肖灵兽 & 等级 & 皮肤

### 3.1 12生肖收集

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 生肖状态查询 | 调用 `getZodiacStatus(zid)`（zid 0-11） | 返回 `{collected: bool, order: number, total: number}` | `getZodiacStatus(0)` |
| 已收集生肖列表 | 调用 `getCollectedZodiacs()` | 返回已收集属相ID数组（每个灵兽的 `z` 字段去重） | `console.log('已收集:', getCollectedZodiacs())` |
| 12生肖全覆盖 | 通过控制台给 `G.dragons` 补充所有12种z值 | 图鉴应显示全收集状态 | `for(let i=0;i<12;i++)G.dragons.push({id:Date.now()+i,z:i,level:1})` |
| 生肖emoji显示 | 网格内查看灵兽 | 正确显示 `ZOD_E[z]` 对应emoji（🐀~🐖） | `G.dragons.forEach(d=>console.log(ZOD_E[d.z]))` |

### 3.2 灵兽等级名（Lv1-Lv15）

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 等级名数组验证 | 检查 `LNAME` | 下标0=空, 1=灵蛋, 2=幼灵, ... 15=鸿蒙 | `console.log(LNAME.join(','))` |
| 等级名显示 | `showDragonDetail(dragonId)` 查看详情 | 名称显示为 `LNAME[level]`，非原始数字 | `LNAME.slice(1).forEach((n,i)=>console.log('level',i+1,n))` |
| 各等级灵兽召唤 | 控制台 `doSummon(15)` | 召唤出最高级"鸿蒙"灵兽 | `doSummon(15)` |

### 3.3 皮肤系统

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 皮肤列表验证 | 检查skin数组 | 包含 default / gold / azure / flame / jade / purple / silver / dark / crystal / destiny 共10套 | `console.log('皮肤列表:', SKINS)` |
| `openSkinPanel()` 打开 | 调用 `renderSkinPanel()` | 弹出皮肤商店面板，显示所有皮肤及价格 | `renderSkinPanel()` |
| 购买皮肤 | 调用 `buySkin(skinId)`（以未拥有皮肤测试） | 扣除对应货币，皮肤变为已拥有状态 | `buySkin('gold')` |
| 装备皮肤 | 调用 `equipSkin(skinId)` | 皮肤装备成功，灵兽外观变化 | `equipSkin('gold')` |
| 装备默认皮肤 | `equipSkin('default')` | 恢复默认外观 | `equipSkin('default')` |
| `dragon_visual_config.json` 覆盖数据 | 检查JSON | 每条记录有 `skinOverlays` 字段（key=皮肤ID，value=描述字符串） | — |

### 3.4 SVG 文件验证

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| SVG文件存在性 | 检查 `docs/svgs/` 目录 | 应有 180 个文件（12属相 × 15等级 = 180） | 检查目录（手动或外部工具） |
| SVG命名格式 | 查看任意SVG文件 | 命名为 `drag_X_Y.svg`（X=0-11属相，Y=1-15等级） | — |
| SVG加载 | 页面加载后查看网格 | 灵兽图片正常显示，无404 | `new Image().src = 'docs/svgs/drag_0_1.svg'` |

---

## 模块四：装备体系

### 4.1 装备属性

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| `getEquipTotals()` 调用 | 控制台调用 | 返回 `{atk: number, def: number, spd: number}` 含套装加成 | `console.log(getEquipTotals())` |
| 装备显示 | 打开灵兽详情 `showDragonDetail(id)` | 显示攻击/防御/速度属性数值 | `showDragonDetail(G.dragons[0]?.id)` |
| 套装效果 | 调用 `getSuitEffect(items)` | 有套装时返回效果描述字符串，无套装返回null | `getSuitEffect(G.equip_items || [])` |
| 材料种类 | 检查装备材料常量 | 铁 iron / 水晶 crystal / 龙鳞 dragonScale / 星尘 starDust | — |

### 4.2 炼宝阁面板

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 打开炼宝阁 | 调用 `renderForgePanel()` | 展示装备列表、合成、强化界面 | `renderForgePanel()` |

---

## 模块五：云端存档

### 5.1 存档读写

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 本地保存 | 调用 `saveGame()` | 数据写入 `localStorage['sxgame_v2']` | `saveGame(); console.log('存档写入OK，key:', 'sxgame_v2')` |
| 本地读取 | 清空后刷新页面 | 自动从 `localStorage['sxgame_v2']` 恢复状态 | `localStorage.getItem('sxgame_v2') ? console.log('有存档') : console.log('无存档')` |
| 云端保存 | 调用 `cloudSave()` | 静默保存到服务器，若网络异常不中断游戏 | `cloudSave(true)` |
| 云端保存（显式） | 调用 `cloudSaveToServer()` | 强制触发云端保存（quiet=false） | `cloudSaveToServer(false)` |
| 云端加载 | 调用 `cloudLoadFromServer()` | 从服务器拉取存档并覆盖本地（quiet控制提示） | `cloudLoadFromServer(false)` |
| 成就存档 | 触发成就后 | 自动写入 `localStorage['sxgame_v2_ach']` | `localStorage.getItem('sxgame_v2_ach')` |
| 排行存档 | 上传排行后 | 写入 `localStorage['sxgame_v2_rank']` | `localStorage.getItem('sxgame_v2_rank')` |

---

## 模块六：新手引导

### 6.1 引导流程

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 新建角色首次加载 | 清理全部localStorage后加载 | 显示新手引导遮罩或弹窗 | 清理后观察页面 |
| 引导进度保存 | 完成引导步骤后 | 写入 `localStorage['sxgame_v2_guide']` | `localStorage.getItem('sxgame_v2_guide')` |
| 跳过引导 | 控制台手动跳过 | 引导状态标记为已完成 | `localStorage.removeItem('sxgame_v2_guide'); location.reload()` |
| 再次进入无引导 | 跳过引导后刷新 | 不再出现引导遮罩，直接进入游戏 | 刷新后观察 |

---

## 模块七：分享裂变

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 打开分享面板（config） | 调用 `openSharePanel()`（config.js） | 弹出分享面板（分享码/链接等） | `openSharePanel()` |
| 打开分享面板（game） | 调用 `openSharePanel()`（game.v5.js） | 弹出分享面板 | `openSharePanel()` |
| 分享数据生成 | 触发分享后 | 生成有效分享链接/图片 | — |

---

## 附加模块：试炼塔

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 打开试炼塔面板 | 调用 `renderTowerPanel()` | 显示试炼塔关卡列表、层数 | `renderTowerPanel()` |
| 塔攻击 | 调用 `towerAttack()` | 触发攻击逻辑，扣血/结算 | `towerAttack()` |
| 扫荡 | 调用 `towerSweep()` | 快速通关已通关层，获得奖励 | `towerSweep()` |

---

## 附加模块：活跃中心 & 图鉴 & 成就 & 周挑战

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 活跃中心 | 调用 `renderActiveCenter()` | 显示当前活动列表（`getActiveActivities()`） | `renderActiveCenter()` |
| 领取活跃奖励 | 调用 `claimActiveReward()` | 领取后刷新活跃度状态 | `claimActiveReward()` |
| 图鉴面板 | 调用 `renderAtlasPanel()` | 显示已收集灵兽图鉴，可领奖励 | `renderAtlasPanel()` |
| 领取图鉴奖励 | 调用 `claimAtlasReward(count)` | 领取后发放奖励 | `claimAtlasReward(12)` |
| 成就面板 | 无专门函数→检查存档 | `sxgame_v2_ach` 记录成就进度 | `localStorage.getItem('sxgame_v2_ach')` |
| 周挑战状态 | 调用 `getWeeklyChallengeState()` | 返回本周挑战数据 | `console.log(getWeeklyChallengeState())` |
| 领取周挑战奖励 | 调用 `claimWeeklyChallenge(id)` | 领取指定挑战奖励 | `claimWeeklyChallenge(1)` |
| 技能激活 | 调用 `activateSkill(id)` | 激活对应技能 | `activateSkill(1)` |

---

## 模块八：其他面板

| 测试点 | 操作步骤 | 预期结果 | 控制台验证命令 |
|--------|----------|----------|---------------|
| 培养面板 | 调用 `renderCultPanel()` | 显示灵兽培养/升级选项 | `renderCultPanel()` |
| 活动面板（ui.v2.js） | 调用活动相关函数 | 弹窗显示活动内容 | — |

---

## 异常场景测试（全流程回归）

### TC-01：本地存档损坏

**触发条件：** 将 `localStorage['sxgame_v2']` 设为非JSON字符串后刷新

**预期：** 游戏崩溃保护或提示存档异常，不白屏

**控制台：**
```js
localStorage.setItem('sxgame_v2', 'invalid-json-not-parseable');
location.reload();
// 观察控制台是否有报错，游戏是否降级加载
```

**验证：**
```js
try {
  const data = JSON.parse(localStorage.getItem('sxgame_v2'));
  console.log('解析成功', data);
} catch(e) {
  console.log('存档损坏，降级加载:', e.message);
}
```

---

### TC-02：抽卡时金币/龙气刚好耗尽

**触发条件：** 金币/龙气刚好等于消耗值，抽卡后归零

**预期：** 抽卡成功，数值归零但不显示负数，`updateHud()` 正常刷新

**控制台：**
```js
G.coins = 10; // 假设单抽消耗10
summonCoin();
console.log('coin after:', G.coins); // 应为0，不为负
```

---

### TC-03：十连中产出0个结果

**触发条件：** 调用 `doTenSummon('coin')` 后结果数组为空

**预期：** `showBatchSummonResult([])` 处理空数组不报错（弹窗正常关闭或显示空状态）

**控制台：**
```js
showBatchSummonResult([]); // 验证弹窗不crash
```

---

### TC-04：云端存档与本地存档冲突

**触发条件：** 本地有多条灵兽，云端存档也有，调用 `cloudLoadFromServer()` 覆盖

**预期：** 本地数据被云端完整覆盖，`G.dragons` 数组正确刷新

**控制台：**
```js
// 模拟：手动写入本地存档
saveGame();
// 然后加载云端
cloudLoadFromServer(true);
console.log('当前灵兽数:', G.dragons.length);
```

---

### TC-05：灵兽数组越界 / 无效ID查询

**触发条件：** 调用 `showDragonDetail('non-existent-id')` 或空数组

**预期：** 不崩溃，显示"灵兽不存在"提示（`showNotif`）

**控制台：**
```js
showDragonDetail('fake-id-12345');
showDragonDetail(G.dragons[0]?.id); // 正常情况对照
```

---

### TC-06：多皮肤快速切换

**触发条件：** 连续快速调用 `equipSkin()` 切换多套皮肤

**预期：** 最终显示最后一套皮肤，无残留状态

**控制台：**
```js
equipSkin('gold');
equipSkin('azure');
equipSkin('flame');
equipSkin('dark');
// 最终应为dark皮肤
```

---

### TC-07：浏览器无localStorage支持

**触发条件：** 私有模式/禁用存储后操作存档

**预期：** `saveGame()` 不抛错，`cloudSave()` 作为fallback继续工作

**说明：** 此场景需手动在浏览器隐私模式测试，控制台检查无 `QuotaExceededError`

---

## BUG 记录模板

| # | 模块 | 测试点 | 操作步骤 | 预期结果 | 实际结果 | 严重程度 | 复现步骤 | 状态 |
|---|------|--------|----------|----------|----------|----------|----------|------|
| 1 | 抽卡 | 十连结果弹窗 | `doTenSummon('coin')` | 弹出10张卡片 | 弹窗崩溃 | 高 | 见TC-03 | 待修复 |
| 2 | — | — | — | — | — | — | — | — |
| 3 | — | — | — | — | — | — | — | — |

**严重程度定义：**
- **崩溃**：页面报错、功能完全不可用
- **高**：核心功能（抽卡/存档）异常，但可恢复
- **中**：UI显示错误或逻辑不一致，不阻断流程
- **低**：视觉/文案问题，不影响核心功能

---

## 快速测试脚本（控制台一键执行）

```js
// === 一键回归测试脚本 ===
(function() {
  console.log('========== 一键测试开始 ==========');
  
  // 1. HUD
  updateHud();
  console.log('[HUD] updateHud() ✓');
  
  // 2. 网格
  renderGrid();
  console.log('[网格] renderGrid() ✓，格子数:', document.querySelectorAll('.d-cell').length);
  
  // 3. 抽卡
  G.coins = 99999; G.qi = 99999;
  summonCoin();
  summonQi();
  summonFree();
  console.log('[抽卡] 单抽测试完成，当前灵兽数:', G.dragons.length);
  
  // 4. 十连
  setSummonBatch(10);
  G._isTenMode && showBatchSummonResult(doTenSummon('coin'));
  console.log('[十连] 十连测试完成 ✓');
  setSummonBatch(1);
  
  // 5. 详情
  G.dragons[0] && showDragonDetail(G.dragons[0].id);
  console.log('[详情] showDragonDetail() ✓');
  
  // 6. 装备
  console.log('[装备] getEquipTotals():', getEquipTotals());
  console.log('[套装] getSuitEffect():', getSuitEffect(G.equip_items || []));
  
  // 7. 存档
  saveGame();
  console.log('[存档] saveGame() ✓，localStorage长度:', localStorage.getItem('sxgame_v2')?.length);
  
  // 8. 云端
  cloudSave(true);
  console.log('[云端] cloudSave() 已触发 ✓');
  
  // 9. 皮肤
  if (typeof renderSkinPanel === 'function') renderSkinPanel();
  console.log('[皮肤] 面板已打开 ✓');
  
  // 10. 试炼塔
  if (typeof renderTowerPanel === 'function') renderTowerPanel();
  console.log('[试炼塔] 面板已打开 ✓');
  
  // 11. 活跃/图鉴
  if (typeof renderActiveCenter === 'function') renderActiveCenter();
  if (typeof renderAtlasPanel === 'function') renderAtlasPanel();
  console.log('[活跃/图鉴] 已打开 ✓');
  
  // 12. 生肖
  console.log('[生肖] 已收集:', getCollectedZodiacs().join(',') || '无');
  console.log('[生肖] 各状态:', Array.from({length:12},(_,i)=>i+':'+getZodiacStatus(i).collected).join(' | '));
  
  // 13. 周挑战
  console.log('[周挑战]', getWeeklyChallengeState());
  
  // 14. 稀有度
  console.log('[稀有度]', [1,2,4,7,10,11,15].map(l=>`level${l}=${rarIdx(l)}`).join(', '));
  
  // 15. LNAME
  console.log('[等级名]', LNAME.join('/'));
  
  // 16. 分享
  openSharePanel();
  console.log('[分享] openSharePanel() ✓');
  
  console.log('========== 一键测试完成 ==========');
})();
```