# 生肖天机 - 后端 API 设计文档

## 一、API 基础信息

- 基础地址：`https://api.shengxiao.ink`（HTTPS）
- 内容类型：`application/json`
- 认证方式：`player_id` + `token`（登录后返回）
- 限流：同一 IP 每分钟最多 60 次请求

---

## 二、认证流程

### 微信小程序登录

```
前端：wx.login() → 获取 code
    ↓
POST /api/auth/wechat  { code: "xxxxx" }
    ↓
后端：用 code + app_id + app_secret 调用微信接口 → 获取 openid
    ↓
数据库：openid 已存在？→ 返回 player_id + token / → 创建账号 → 返回 player_id + token
    ↓
前端：存储 player_id + token，后续请求带上
```

### 抖音/快手 同理，换各自的 code 换取 openid 接口。

---

## 三、接口列表

### 认证类

| 接口 | 方法 | 说明 | 需认证 |
|------|------|------|--------|
| `/api/auth/wechat` | POST | 微信登录 | ❌ |
| `/api/auth/douyin` | POST | 抖音登录 | ❌ |
| `/api/auth/kuaishou` | POST | 快手登录 | ❌ |
| `/api/auth/web` | POST | Web端登录（手机号）| ❌ |
| `/api/auth/logout` | POST | 登出 | ✅ |
| `/api/auth/refresh` | POST | 刷新 token | ✅ |

### 游戏数据类

| 接口 | 方法 | 说明 | 需认证 |
|------|------|------|--------|
| `/api/game/save` | POST | 保存存档 | ✅ |
| `/api/game/load` | GET | 读取存档 | ✅ |
| `/api/game/quick` | POST | 快速保存（仅 coins/merge，不存完整档）| ✅ |
| `/api/game/reset` | POST | 重置存档（需二次确认）| ✅ |

### 排行类

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/rank/coins` | GET | 金币 Top50 |
| `/api/rank/level` | GET | 灵兽等级 Top50 |
| `/api/rank/merge` | GET | 合成次数 Top50 |
| `/api/rank/me` | GET | 我的排名 |

### 社交类

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/social/share` | POST | 分享战绩到排行榜 |
| `/api/social/invite` | GET | 生成分享链接 |
| `/api/social/friend` | GET | 好友数据 |

### 运营类

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/act/daily_sign` | POST | 每日签到 |
| `/api/act/redeem` | POST | 兑换码兑换 |

### 管理员（内部）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/stats` | GET | 运营数据 |
| `/api/admin/broadcast` | POST | 全服公告 |

---

## 四、请求/响应格式

### 认证接口

**POST /api/auth/wechat**

Request:
```json
{
  "code": "微信 login 返回的 code",
  "nickname": "玩家昵称（首次登录时）",
  "avatar_url": "头像 URL（首次登录时）"
}
```

Response:
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "player_id": 10001,
    "token": "abc123xyz",
    "is_new": true,
    "game_data": { ... }
  }
}
```

### 游戏存档接口

**POST /api/game/save**

Request:
```json
{
  "game_data": {
    "coins": 99999,
    "dragons": [...],
    "mergeCount": 10
  }
}
```

Response:
```json
{
  "code": 0,
  "msg": "保存成功",
  "data_version": 5
}
```

### 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证/token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（如重复注册）|
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

---

## 五、缓存策略

| 数据 | 缓存方式 | TTL |
|------|---------|-----|
| 玩家基础信息 | Redis String | 30分钟 |
| 排行榜数据 | Redis ZSet | 5分钟 |
| 每日 DAU | Redis Counter | 当日有效 |
| 活动配置 | Redis String | 10分钟 |

---

## 六、版本兼容

- 小程序每次发布前，后端保持接口兼容
- 新增字段用 `Optional`，不删除旧字段
- 游戏存档版本号 `game_version` 在 JSON 里，每次大版本更新 +1
