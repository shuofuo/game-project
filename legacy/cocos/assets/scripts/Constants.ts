/**
 * 生肖天机 - 游戏常量定义
 * 所有游戏数值配置集中管理，便于后期调整
 */

// ============== 游戏版本 ==============
export const GAME_VERSION = "v1.0";
export const SAVE_KEY = "shengxiao_save_v1";

// ============== 12属相 ==============
export const ZODIAC_NAMES = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
export const ZODIAC_EMOJIS = ["🐀", "🐂", "🐅", "🐇", "🐉", "🐍", "🐎", "🐏", "🐒", "🐓", "🐕", "🐖"];

// ============== 5命格 ==============
/**
 * 命格索引：0=木 1=火 2=土 3=金 4=水
 */
export const FATE_NAMES = ["木", "火", "土", "金", "水"];
export const FATE_EMOJIS = ["🪵", "🔥", "🟤", "⚪", "💧"];
export const FATE_COLORS = ["#4CAF50", "#FF5722", "#8D6E63", "#FFC107", "#2196F3"];

// 命格效果描述
export const FATE_DESCS = [
    "升级经验+50%，顿悟概率+20%（适合肝帝）",
    "金币产出+50%（追求金币最大化）",
    "每日3次免费召唤（零氪玩家首选）",
    "高级召唤概率+30%（运气型玩家）",
    "龙气+50%，离线收益+50%（上班族/休闲玩家）"
];

// ============== 合成等级（15级） ==============
export const LEVEL_NAMES = [
    "",         // 占位，索引0不用
    "灵蛋",     // Lv1
    "幼灵",     // Lv2
    "化形",     // Lv3
    "灵通",     // Lv4
    "化星",     // Lv5
    "凝神",     // Lv6
    "通灵",     // Lv7
    "灵兽",     // Lv8
    "神兽",     // Lv9
    "天兽",     // Lv10
    "圣兽",     // Lv11
    "天命",     // Lv12
    "天尊",     // Lv13
    "天帝",     // Lv14
    "鸿蒙神兽"  // Lv15（终极）
];
export const MAX_LEVEL = 15;

// ============== 产金表（每秒） ==============
export const COIN_PER_SECOND: number[] = [
    0,          // 索引0不用
    1,          // Lv1 灵蛋
    3,          // Lv2 幼灵
    8,          // Lv3 化形
    20,         // Lv4 灵通
    55,         // Lv5 化星
    150,        // Lv6 凝神
    400,        // Lv7 通灵
    1100,       // Lv8 灵兽
    3000,       // Lv9 神兽
    8000,       // Lv10 天兽
    20000,      // Lv11 圣兽
    50000,      // Lv12 天命
    120000,     // Lv13 天尊
    300000,     // Lv14 天帝
    800000      // Lv15 鸿蒙神兽
];

// ============== 召唤概率（等级权重） ==============
// Lv1~Lv3召唤池
export const SUMMON_POOL_BASIC = [
    { level: 1, weight: 100 },  // 100%
    { level: 2, weight: 80 },
    { level: 3, weight: 50 }
];
// Lv4~Lv6召唤池（龙气）
export const SUMMON_POOL_MID = [
    { level: 4, weight: 30 },
    { level: 5, weight: 18 },
    { level: 6, weight: 10 }
];
// Lv7~Lv9召唤池（天机）
export const SUMMON_POOL_HIGH = [
    { level: 7, weight: 6 },
    { level: 8, weight: 3.5 },
    { level: 9, weight: 2 }
];
// 广告召唤池（Lv1~Lv6）
export const SUMMON_POOL_AD = [
    { level: 1, weight: 100 },
    { level: 2, weight: 80 },
    { level: 3, weight: 50 },
    { level: 4, weight: 30 },
    { level: 5, weight: 18 },
    { level: 6, weight: 10 }
];

// ============== 召唤消耗 ==============
export const SUMMON_COST_COIN_BASE = 100;      // 基础100金币
export const SUMMON_COST_COIN_T1 = 150;        // 101~500次
export const SUMMON_COST_COIN_T2 = 200;        // 501~2000次
export const SUMMON_COST_COIN_MAX = 250;       // 2000次以上封顶
export const SUMMON_COUNT_T1 = 100;            // 第一档上限
export const SUMMON_COUNT_T2 = 500;            // 第二档上限
export const SUMMON_COUNT_T3 = 2000;           // 第三档上限

export const SUMMON_COST_QI = 500;             // 龙气召唤
export const SUMMON_COST_QI_HIGH = 2000;       // 天机召唤

export const FATE_FREE_COUNT = 3;              // 土命每日免费次数
export const AD_SUMMON_LIMIT = 5;              // 广告召唤每日次数

// ============== 运势加成 ==============
export const FATE_BONUS: { [stars: number]: { coin: number; summon: string } } = {
    5: { coin: 0.5, summon: "必出Lv3+" },
    4: { coin: 0.3, summon: "高概率高级" },
    3: { coin: 0, summon: "正常" },
    2: { coin: -0.2, summon: "产金-20%" },
    1: { coin: -0.5, summon: "产金-50%，龙气+100%" }
};

// ============== 天机倍率 ==============
export const TIANGAN_NAMES = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const DIZHI_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// ============== 命格加成 ==============
export const FATE_COIN_MULT: { [fate: number]: number } = {
    0: 1.0,    // 木命不加金币
    1: 1.5,    // 火命+50%
    2: 1.0,    // 土命不加金币
    3: 1.0,    // 金命不加金币
    4: 1.0     // 水命不加金币
};
export const FATE_QI_MULT: { [fate: number]: number } = {
    0: 1.0,
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.5     // 水命+50%
};
export const FATE_EXP_MULT: { [fate: number]: number } = {
    0: 1.5,    // 木命+50%经验
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.0
};
export const FATE_SUMMON_BONUS: { [fate: number]: number } = {
    0: 0,
    1: 0,
    2: 0,
    3: 1.3,    // 金命+30%高级概率
    4: 0
};
export const FATE_OFFLINE_MULT: { [fate: number]: number } = {
    0: 1.0,
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.5     // 水命+50%离线收益
};

// ============== 今日属相加成 ==============
export const ZODIAC_DAILY_COIN_BONUS = 0.3;    // +30%
export const ZODIAC_DAILY_QI_BONUS = 0.2;      // +20%

// ============== 离线收益 ==============
export const OFFLINE_COIN_RATE = 0.6;           // 离线金币=在线60%
export const OFFLINE_QI_PER_HOUR = 10;         // 离线每小时10龙气

// ============== 图鉴 ==============
export const ATLAS_UNLOCK_COST = 10000;         // 解锁一个图鉴需要10000龙气
export const ATLAS_MAX = 12;                   // 12属相

// ============== 合成特效ID ==============
export const MERGE_EFFECT_ID = "merge_1";