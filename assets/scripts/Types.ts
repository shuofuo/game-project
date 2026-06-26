/**
 * 生肖天机 - 类型定义和接口
 */

/**
 * 灵兽数据结构
 * 注意：zodiac 和 fate 是玩家属性，不是每个灵兽的属性
 * 灵兽只记录等级和位置
 */
export interface DragonData {
    id: string;       // 唯一ID（UUID）
    level: number;    // 1~15
    posX: number;     // 屏幕位置X（像素）
    posY: number;     // 屏幕位置Y（像素）
}

/**
 * 存档数据结构
 * 所有持久化数据都存在这里
 */
export interface GameSaveData {
    version: string;       // 版本号，用于迁移

    // 角色创建
    zodiac: number;        // 0~11（-1=未创建）
    fate: number;          // 0~4（-1=未创建）
    created: boolean;      // 是否已完成角色创建

    // 货币
    coins: number;
    dragonQi: number;

    // 灵兽列表
    dragons: DragonData[];

    // 统计
    totalCoinsEarned: number;   // 历史总产出（用于统计）
    totalQiEarned: number;      // 历史总龙气
    playDays: number;           // 游玩天数
    mergeCount: number;         // 累计合成次数
    totalSummonCount: number;   // 累计召唤次数（通胀用）
    continuousLoginDays: number;// 连续登录天数

    // 召唤次数重置
    summonCountResetAt: number; // 上次重置召唤次数的时间戳（毫秒）
    lastSummonResetDay: number; // 上次重置召唤次数的日期（YYYYMMDD）

    // 离线相关
    lastOnlineTime: number;     // 上次在线时间戳（毫秒）

    // 每日运势
    lastFateDate: string;       // 上次刷新运势的日期 "YYYY-MM-DD"
    currentFate: number;        // 今日运势 1~5

    // 土命免费召唤
    lastFateFreeDate: string;   // 上次使用土命免费召唤的日期
    fateFreeCount: number;      // 今日剩余土命免费次数

    // 广告召唤
    lastAdSummonDate: string;   // 上次广告召唤日期
    adSummonCount: number;      // 今日广告召唤次数

    // 天机时辰
    tiangan: number;            // 0~9
    dizhi: number;              // 0~11

    // 图鉴
    unlockedAtlas: number[];    // 已解锁的属相索引 [0,1,4] = 鼠牛龙已解锁

    // 成就
    achievements: string[];     // 已获得的成就ID列表

    // 时间戳
    savedAt: number;            // 存档时间
}

/**
 * 天机事件数据结构
 */
export interface TianJiEvent {
    id: string;          // 事件ID
    name: string;       // 事件名称
    desc: string;      // 描述
    coinMult: number;   // 金币倍率
    qiMult: number;     // 龙气倍率
    summonMult: number; // 召唤概率倍率
    duration: number;   // 持续时间（毫秒）
    startTime: number;  // 开始时间
    endTime: number;    // 结束时间
}

/**
 * 每日运势数据结构
 */
export interface DailyFate {
    stars: number;       // 1~5星
    coinBonus: number;   // 金币加成（小数，如0.5表示+50%）
    summonBonus: number; // 召唤加成
    name: string;        // 运势名称
    desc: string;        // 运势描述
    tiangan: string;    // 今日天干
    dizhi: string;      // 今日地支
}

/**
 * 成就数据结构
 */
export interface Achievement {
    id: string;          // 成就ID
    name: string;       // 成就名称
    desc: string;        // 成就描述
    reward: number;      // 龙气奖励
    type: 'once' | 'cumulative' | 'weekly'; // 一次性/累计/每周
    condition: (save: GameSaveData) => boolean; // 完成条件
    icon: string;       // 图标
}

/**
 * 游戏状态
 */
export type GameState = 'loading' | 'creating' | 'playing' | 'paused';

/**
 * 创建角色回调
 */
export type OnCharacterCreated = (zodiac: number, fate: number) => void;

/**
 * 合成回调
 */
export type OnMergeResult = (success: boolean, newLevel: number | null) => void;