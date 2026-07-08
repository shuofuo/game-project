# 生肖天机 - 数据库设计文档

## 一、概述

- 数据库：MySQL 8.0
- 字符集：utf8mb4（支持 emoji）
- 名称：`shengxiao`

---

## 二、表设计

### 2.1 players（玩家主表）

```sql
CREATE TABLE players (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    
    -- 主登录方式（第一个绑定的平台 openid）
    primary_platform    ENUM("wechat","douyin","kuaishou","web") NOT NULL DEFAULT "web",
    primary_openid      VARCHAR(128) NOT NULL COMMENT "主平台 openid",
    
    -- 各平台 openid（允许为空，先绑定哪个就是主）
    wechat_openid   VARCHAR(128) UNIQUE NULL COMMENT "微信 openid",
    douyin_openid   VARCHAR(128) UNIQUE NULL COMMENT "抖音 openid",
    kuaishou_openid VARCHAR(128) UNIQUE NULL COMMENT "快手 openid",
    
    -- 玩家基本信息
    nickname        VARCHAR(64)  DEFAULT "" COMMENT "昵称",
    avatar_url      VARCHAR(512) DEFAULT "" COMMENT "头像 URL",
    
    -- 账号安全（web 端备用，手机号绑定）
    phone           VARCHAR(20)  UNIQUE NULL COMMENT "绑定手机号",
    
    -- 状态
    status          TINYINT DEFAULT 1 COMMENT "1=正常, 0=封禁",
    
    -- 时间戳
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP NULL,
    
    INDEX idx_wechat  (wechat_openid),
    INDEX idx_douyin  (douyin_openid),
    INDEX idx_kuaishou(kuaishou_openid),
    INDEX idx_phone   (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.2 player_data（游戏存档）

```sql
CREATE TABLE player_data (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    player_id       INT NOT NULL UNIQUE,
    
    -- 完整存档（JSON）
    game_data       JSON NOT NULL COMMENT "完整游戏状态",
    
    -- 冗余字段（方便排行榜查询，不查 JSON）
    total_coins     BIGINT DEFAULT 0 COMMENT "历史总金币",
    max_dragon_level INT DEFAULT 0 COMMENT "最高灵兽等级",
    total_merge     INT DEFAULT 0 COMMENT "总合成次数",
    total_summon    INT DEFAULT 0 COMMENT "总召唤次数",
    total_online_days INT DEFAULT 0 COMMENT "累计在线天数",
    
    -- 数据版本（乐观锁）
    data_version    INT DEFAULT 0,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_coins     (total_coins DESC),
    INDEX idx_level     (max_dragon_level DESC),
    INDEX idx_merge     (total_merge DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.3 platform_bindings（跨平台绑定）

```sql
CREATE TABLE platform_bindings (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    player_id       INT NOT NULL,
    platform        ENUM("wechat","douyin","kuaishou","web") NOT NULL,
    openid          VARCHAR(128) NOT NULL,
    bound_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_platform_openid (platform, openid),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.4 daily_stats（每日数据统计）

```sql
CREATE TABLE daily_stats (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    stat_date       DATE NOT NULL,
    player_id       INT NOT NULL,
    login_count     INT DEFAULT 0 COMMENT "当日登录次数",
    play_seconds    INT DEFAULT 0 COMMENT "当日游戏时长（秒）",
    coins_earned    BIGINT DEFAULT 0 COMMENT "当日获得金币",
    merge_count     INT DEFAULT 0 COMMENT "当日合成次数",
    summon_count    INT DEFAULT 0 COMMENT "当日召唤次数",
    
    UNIQUE INDEX idx_date_player (stat_date, player_id),
    INDEX idx_date        (stat_date),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 每日 DAU 汇总（物化视图替代）
CREATE TABLE daily_active (
    stat_date       DATE PRIMARY KEY,
    dau             INT DEFAULT 0 COMMENT "日活跃用户数",
    new_users       INT DEFAULT 0 COMMENT "当日新增用户",
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 三、索引设计说明

| 索引 | 类型 | 用途 |
|------|------|------|
| `idx_wechat` | 普通索引 | 微信登录快速查找 |
| `idx_douyin` | 普通索引 | 抖音登录快速查找 |
| `idx_phone` | 普通索引 | 手机号登录/绑定 |
| `idx_coins` | 联合索引 | 金币排行榜（不碰 JSON）|
| `idx_level` | 联合索引 | 等级排行榜（不碰 JSON）|
| `idx_date_player` | 唯一索引 | 每日数据去重 |

---

## 四、存档 JSON 结构（game_data 字段）

```json
{
  "coins": 99999,
  "totalCoinsEarned": 99999,
  "dragons": [
    {"id": "1", "level": 5, "idx": 0}
  ],
  "mergeCount": 10,
  "summonCount": 5,
  "zodiac": 0,
  "fate": 3,
  "dragonQi": 1000,
  "achievements": [],
  "unlockedAtlas": [0, 1, 2],
  "signDays": 7,
  "cultivation": {"mu": 10, "huo": 5, "tu": 3, "kin": 0, "shui": 0},
  "weekly": {"totalCoins": 0, "combo": 0, "challenges": {}},
  "settings": {"bgmVolume": 80, "sfxVolume": 100}
}
```

---

## 五、安全说明

- openid 是平台提供的用户唯一标识，不可伪造
- 后端用 code 换 openid 时需要 app_secret（存在服务端，不在前端）
- 每个平台的 app_secret 单独存储，不混用
- 数据库密码存入环境变量，不写在代码里
