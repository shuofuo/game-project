/**
 * 生肖天机 - 游戏主管理器
 * 串联所有子系统，驱动游戏主循环
 *
 * 使用方式：
 * 1. 场景中创建一个节点，挂载 GameManagerCtrl 组件
 * 2. 其他脚本用 GM 或 GameManagerCtrl.instance 访问单例
 */

import { _decorator, Director, Node, find } from 'cc';
import { GAME_VERSION } from './Constants';
import { SaveSystem } from './SaveSystem';
import { MergeSystem } from './MergeSystem';
import { SummonSystem } from './SummonSystem';
import { CoinSystem } from './CoinSystem';
import { TianJiSystem } from './TianJiSystem';
import { FateSystem } from './FateSystem';
import type { GameState, DragonData } from './Types';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager {
    // ============== 单例 ==============
    private static _instance: GameManager | null = null;
    public static getInstance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance!;
    }

    // ============== 子系统（构造时注入） ==============
    public save: SaveSystem;
    public merge: MergeSystem;
    public summon: SummonSystem;
    public coin: CoinSystem;
    public tianJi: TianJiSystem;
    public fate: FateSystem;

    // ============== 游戏状态 ==============
    private _state: GameState = 'loading';
    private _lastTickTime: number = 0;
    private _initialized: boolean = false;

    constructor() {
        this.save = new SaveSystem();
        this.merge = new MergeSystem(this.save);
        this.summon = new SummonSystem(this.save);
        this.coin = new CoinSystem(this.save);
        this.tianJi = new TianJiSystem(this.save);
        this.fate = new FateSystem(this.save);
    }

    // ============== 生命周期 ==============

    /** Cocos 启动时调用 */
    onLoad(): void {
        // 防止重复注册 update
        if (GameManager._instance && GameManager._instance !== this) {
            console.warn('[GameManager] 重复实例已销毁');
            return;
        }
        GameManager._instance = this;
    }

    /** Cocos 启动完成后调用 */
    start(): void {
        this.init();
    }

    /** 初始化游戏（启动时调用一次） */
    public init(): void {
        if (this._initialized) {
            console.warn('[GameManager] 已初始化，跳过');
            return;
        }

        console.log(`[GameManager] 生肖天机 ${GAME_VERSION} 初始化中...`);

        // 1. 加载存档
        this.save.load();

        // 2. 计算离线收益（如果有）
        this.processOfflineEarnings();

        // 3. 重置每日刷新（如果跨天了）
        this.processDailyReset();

        // 4. 初始化天机系统（推进时辰）
        this.tianJi.init();

        // 5. 初始化运势系统
        this.fate.init();

        // 6. 确定游戏状态
        if (this.save.isCreated()) {
            this._state = 'playing';
        } else {
            this._state = 'creating';
        }

        this._initialized = true;
        this._lastTickTime = Date.now();

        console.log(`[GameManager] 初始化完成，状态：${this._state}`);
    }

    /** 每帧更新（Cocos 的 update(dt) 调用） */
    update(dt: number): void {
        if (this._state !== 'playing') return;

        // 1. 产金（每帧累加）
        this.coin.tick(dt);

        // 2. 更新天机时辰
        this.tianJi.update(dt);

        // 3. 每30秒自动存档
        const now = Date.now();
        if (now - this._lastTickTime >= 30000) {
            this.save.saveGame();
            this._lastTickTime = now;
        }
    }

    /** 游戏退出时调用（onDestroy） */
    onDestroy(): void {
        this.save.setLastOnlineTime(Date.now());
        this.save.saveGame();
        console.log('[GameManager] 游戏已保存并退出');
    }

    // ============== 角色创建 ==============

    /** 创建角色（选完属相和命格后调用） */
    public createCharacter(zodiac: number, fate: number): void {
        this.save.setZodiac(zodiac);
        this.save.setFate(fate);
        this.save.setCreated(true);

        // 初始灵兽：随机3个Lv1
        for (let i = 0; i < 3; i++) {
            const dragon: DragonData = {
                id: this.generateId(),
                level: 1,
                posX: 200 + Math.random() * 200,
                posY: 400 + Math.random() * 100
            };
            this.save.addDragon(dragon);
        }

        // 解锁自己属相的图鉴
        this.save.unlockAtlas(zodiac);

        this.save.saveGame();
        this._state = 'playing';

        console.log(`[GameManager] 角色创建成功：属相${zodiac}，命格${fate}，初始3个灵兽`);
    }

    // ============== 合成 ==============

    /** 执行合成 */
    public doMerge(id1: string, id2: string): DragonData | null {
        const dragons = this.save.getDragons();
        const d1 = dragons.find(d => d.id === id1);
        const d2 = dragons.find(d => d.id === id2);
        if (!d1 || !d2) {
            console.error('[GameManager] 合成失败：找不到灵兽');
            return null;
        }
        return this.merge.doMerge(d1, d2);
    }

    // ============== 召唤 ==============

    public summonByCoins(posX: number, posY: number): DragonData | null {
        return this.summon.summonByCoins(posX, posY);
    }
    public summonByQi(posX: number, posY: number): DragonData | null {
        return this.summon.summonByQi(500, posX, posY);
    }
    public summonByQiHigh(posX: number, posY: number): DragonData | null {
        return this.summon.summonByQiHigh(posX, posY);
    }
    public summonByFateFree(posX: number, posY: number): DragonData | null {
        return this.summon.summonByFateFree(posX, posY);
    }
    public summonByAd(posX: number, posY: number): DragonData | null {
        return this.summon.summonByAd(posX, posY);
    }
    public getSummonCost(): number {
        return this.summon.getSummonCost();
    }
    public getFateFreeRemaining(): number {
        return this.summon.getFateFreeRemaining();
    }
    public getAdSummonRemaining(): number {
        return this.summon.getAdSummonRemaining();
    }

    // ============== 收益 ==============

    public getCoins(): number { return this.save.getCoins(); }
    public getDragonQi(): number { return this.save.getDragonQi(); }
    public getCoinPerSecond(): number { return this.coin.calcCoinPerSecond(); }
    public getFormattedCoinRate(): string { return this.coin.getFormattedCoinRate(); }

    // ============== 离线收益 ==============

    private processOfflineEarnings(): void {
        const lastTime = this.save.getLastOnlineTime();
        const offlineMs = Date.now() - lastTime;
        if (offlineMs > 5 * 60 * 1000) {
            console.log(`[GameManager] 检测到离线${Math.round(offlineMs / 60000)}分钟`);
        }
    }

    public claimOfflineEarnings(): { coins: number; qi: number } {
        return this.coin.claimOfflineEarnings(Date.now() - this.save.getLastOnlineTime());
    }

    // ============== 每日刷新 ==============

    private processDailyReset(): void {
        // 每日刷新在各个子系统内部处理
    }

    // ============== 状态查询 ==============

    public getState(): GameState { return this._state; }
    public isCharacterCreated(): boolean { return this.save.isCreated(); }
    public getZodiac(): number { return this.save.getZodiac(); }
    public getFate(): number { return this.save.getFate(); }
    public getCurrentFate(): number { return this.save.getCurrentFate(); }
    public getFateText(): string { return this.fate.getTodayFate().name; }
    public getFateEmoji(): string { return this.fate.getStarsEmoji(); }
    public getTimeString(): string { return this.tianJi.getCurrentTimeString(); }
    public getCoinMult(): number { return this.tianJi.getCoinMult(); }
    public getMaxLevel(): number { return this.merge.getMaxLevel(); }
    public getDragons(): DragonData[] { return this.save.getDragons(); }

    // ============== 私有 ==============

    private generateId(): string {
        return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }
}

// 方便其他模块直接引用单例（构造之前访问会创建实例）
export const GM = GameManager.getInstance();