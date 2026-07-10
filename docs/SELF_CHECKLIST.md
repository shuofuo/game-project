# 十二生肖游戏 — 快速自测清单

**启动**：项目根目录运行 `python -m http.server 7892`，浏览器打开 `http://localhost:7892`

**清理重置**：
```js
localStorage.removeItem('sxgame_v2'); localStorage.removeItem('sxgame_v2_ach'); localStorage.removeItem('sxgame_v2_rank'); localStorage.removeItem('sxgame_v2_guide'); location.reload();
```

---

## 一、配置完整性（4项）

- [ ] **SVG 文件数量**：180个 `docs/svgs/drag_X_Y.svg`（X=0~11，Y=1~15），用终端检查
  ```bash
  ls docs/svgs/ | wc -l
  ls docs/svgs/drag_0_1.svg docs/svgs/drag_11_15.svg | wc -l
  ```
- [ ] **config.js 龙配置条数**：180条龙记录，搜索 `DRAGON_CONFIG` 数组长度
  ```bash
  grep -c "^{" js/config.js
  ```
- [ ] **dragon_visual_config.json 数量**：每生肖15级×12属相=180条记录
  ```bash
  cat dragon_visual_config.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))"
  ```
- [ ] **skinOverlays 数量**：180条 `skinOverlays` 字段（每龙一条）
  ```bash
  grep -c "skinOverlays" dragon_visual_config.json
  ```

---

## 二、存档与云端（5项）

- [ ] **存档写入**：执行一次抽卡，刷新页，`getCollectionCount()` 返回 >0
  ```js
  getCollectionCount()
  ```
- [ ] **存档读取**：刷新页后数据保留，`getCollectedZodiacs()` 长度正确
  ```js
  getCollectedZodiacs().length
  ```
- [ ] **云端上传**：控制台执行，`cloudSave()` 无报错，日志显示 `云端存档已更新`
  ```js
  cloudSave()
  ```
- [ ] **云端下载**：`cloudLoadFromServer()` 无报错，页面数据刷新
  ```js
  cloudLoadFromServer()
  ```
- [ ] **存档覆盖**：本地改数据后云端下载，数据正确覆盖，无字段丢失
  ```js
  // 先本地改一点数据
  G.zodiac[5].level = 99
  cloudLoadFromServer(true)
  // 验证数据是否被云端覆盖回去
  ```

---

## 三、单抽逻辑（5项）

- [ ] **灵石单抽**：`summonQi()` 执行，消耗灵石，有动画/弹窗
  ```js
  summonQi()
  ```
- [ ] **金币单抽**：`summonCoin()` 执行，消耗金币，有动画/弹窗
  ```js
  summonCoin()
  ```
- [ ] **免费单抽**：`summonFree()` 执行，消耗0，免费标记正确
  ```js
  summonFree()
  ```
- [ ] **抽卡消耗扣减**：抽卡前后灵石/金币差值正确（无负值、无多扣）
  ```js
  // 抽卡前
  G.qi; G.coin;
  // 抽卡后
  G.qi; G.coin;
  // 差值应等于单抽消耗
  ```
- [ ] **结果弹窗显示**：`showNotif(type, msg)` 正常弹出，消息包含龙名/等级
  ```js
  // 执行一次 summonFree()，检查弹窗文字是否包含"生肖"或龙名
  ```

---

## 四、十连逻辑（5项）

- [ ] **灵石十连**：`doTenSummon('qi')` 执行，10次结果弹窗
  ```js
  doTenSummon('qi')
  ```
- [ ] **金币十连**：`doTenSummon('coin')` 执行，10次结果弹窗
  ```js
  doTenSummon('coin')
  ```
- [ ] **十连弹窗显示**：`showBatchSummonResult(results)` 弹出10条结果
  ```js
  // 观察弹窗是否出现10条记录，格式正确
  ```
- [ ] **十连消耗正确**：灵石十连扣 150，金币十连扣 1500
  ```js
  G._isTenMode === true  // 十连期间应为 true
  ```
- [ ] **十连状态标志**：`G._isTenMode` 在十连前为 true，十连结束后重置为 false
  ```js
  doTenSummon('coin')
  // 弹窗关闭后
  G._isTenMode
  ```

---

## 五、面板开关（5项）

- [ ] **试炼塔面板**：`openTowerPanel()` 打开，无报错
  ```js
  openTowerPanel()
  ```
- [ ] **活跃中心面板**：`openActiveCenter()` 打开，无报错
  ```js
  openActiveCenter()
  ```
- [ ] **图鉴面板**：`openAtlasPanel()` 打开，显示生肖列表
  ```js
  openAtlasPanel()
  ```
- [ ] **炼宝阁面板**：`openForgePanel()` 打开，无报错
  ```js
  openForgePanel()
  ```
- [ ] **成就/任务面板**：`openTaskPanel()` 打开，无报错
  ```js
  openTaskPanel()
  ```

---

## 六、试炼塔（4项）

- [ ] **塔攻击**：`towerAttack()` 执行，扣体力，层数推进
  ```js
  towerAttack()
  ```
- [ ] **扫荡**：`towerSweep()` 执行，一次扫多关，奖励正确
  ```js
  towerSweep()
  ```
- [ ] **体力消耗**：塔攻击后体力减少，无负值
  ```js
  G.power
  ```
- [ ] **层数记录**：`G.towerFloor` 随攻击推进

---

## 七、属性计算（4项）

- [ ] **equipTotals 返回值**：`getEquipTotals()` 返回 `{atk: number, def: number, spd: number}`
  ```js
  typeof getEquipTotals()
  getEquipTotals()
  ```
- [ ] **suitEffect 有/无套装**：有套装时返回效果描述，无套装时返回 null
  ```js
  getSuitEffect(G.inventory.slice(0,3))
  getSuitEffect([])
  ```
- [ ] **属性加成显示**：穿戴装备后，ATK/DEF/SPD 数值变化与装备加成一致
  ```js
  // 无装备时
  getEquipTotals()
  // 装配装备后
  getEquipTotals()
  ```
- [ ] **HUD 刷新**：`updateHud()` 无报错，HUD 数据实时更新
  ```js
  updateHud()
  ```

---

## 八、皮肤系统（5项）

- [ ] **默认皮肤显示**：`dragon_visual_config.json` 中每条龙有 `default` skinOverlay
  ```bash
  grep '"default"' dragon_visual_config.json | wc -l
  ```
- [ ] **10套皮肤齐全**：皮肤列表 `['default','gold','azure','flame','jade','purple','silver','dark','crystal','destiny']`
  ```js
  ['default','gold','azure','flame','jade','purple','silver','dark','crystal','destiny']
  ```
- [ ] **穿戴皮肤**：`equipSkin(skinId)` 执行，皮肤切换生效
  ```js
  equipSkin('gold')
  ```
- [ ] **购买皮肤**：`buySkin(skinId)` 执行，扣金币，皮肤解锁
  ```js
  buySkin('gold')
  ```
- [ ] **所有皮肤数据存在**：`dragon_visual_config.json` 中每套 skinOverlay 有180条记录
  ```bash
  # 验证 gold 皮肤全部180条存在
  grep '"gold"' dragon_visual_config.json | wc -l
  ```

---

## 九、活跃中心与成就（5项）

- [ ] **活跃中心状态**：`getWeeklyChallengeState()` 返回正确结构
  ```js
  getWeeklyChallengeState()
  ```
- [ ] **周挑战领取**：`claimWeeklyChallenge(id)` 执行，奖励发放，无重复领取
  ```js
  claimWeeklyChallenge(0)
  claimWeeklyChallenge(0)  // 再执行一次应无反应或提示已领取
  ```
- [ ] **生肖收集状态**：`getZodiacStatus(zid)` 对所有0~11返回有效数据
  ```js
  for(let i=0;i<12;i++){console.log(i,getZodiacStatus(i))}
  ```
- [ ] **生肖收集数**：`getCollectedZodiacs()` 返回已收集的生肖数组，长度1~12
  ```js
  getCollectedZodiacs().length
  ```
- [ ] **活跃积分**：完成任务后活跃积分增加，进度条更新
  ```js
  getWeeklyChallengeState().totalScore
  ```

---

## 十、通知与 HUD（4项）

- [ ] **消息通知**：`showNotif('error', '测试消息')` 正常显示
  ```js
  showNotif('error', '测试消息')
  ```
- [ ] **通知自动关闭**：消息弹出后自动消失（3~5秒内）
- [ ] **HUD 显示正确**：`updateHud()` 后灵石/金币/体力/关卡数全部正确
  ```js
  updateHud()
  // 肉眼检查：灵石X，金币X，体力X，关卡X
  ```
- [ ] **Grid 渲染**：`renderGrid()` 无报错，网格正确显示
  ```js
  renderGrid()
  ```

---

## 汇总表

| 模块 | 通过数 | 失败数 | 状态 |
|------|--------|--------|------|
| 配置完整性 | /4 | /4 | |
| 存档与云端 | /5 | /5 | |
| 单抽逻辑 | /5 | /5 | |
| 十连逻辑 | /5 | /5 | |
| 面板开关 | /5 | /5 | |
| 试炼塔 | /4 | /4 | |
| 属性计算 | /4 | /4 | |
| 皮肤系统 | /5 | /5 | |
| 活跃中心与成就 | /5 | /5 | |
| 通知与 HUD | /4 | /4 | |
| **合计** | **/46** | **/46** | |

---

## 结论

> ✅ 全部通过 / ⚠️ 有待修复 / ❌ 严重问题

---

## 备注

- 测试顺序：先「配置完整性」→「清理存档」→ 逐模块测试
- 每次修改代码后，执行清理重置命令，再重新测试
- 云端功能需联网，离线环境跳过云端2项
- 十连测试注意：灵石十连（150）/ 金币十连（1500）消耗不同，检查日志