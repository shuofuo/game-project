/**
 * 生肖天机 - 游戏主管理器
 * 串联所有子系统，驱动游戏主循环
 * 
 * 使用方式（在 Cocos Creator 场景中）：
 * const gm = GameManager.getInstance();
 * gm.init();
 */

import { _decorator, Director, Node, Canvas, find } from 'cc';
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
    private static _instance: GameManager | null = null;
    public static getInstance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance!;
    }

    // ============== 子系统 ==============
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
    public update(dt: number): void {
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

    /** 游戏退出时调用 */
    public onExit(): void {
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

        // 如果是土命，设置免费召唤次数
        if (fate === 2) {
            // 已经是3次，在createDefaultSave中设置好了
        }

        this.save.saveGame();
        this._state = 'playing';

        console.log(`[GameManager] 角色创建成功：属相${zodiac}，命格${fate}，初始3个灵兽`);
    }

    // ============== 合成 ==============

    /**
     * 执行合成
     * @param id1 第一个灵兽ID
     * @param id2 第二个灵兽ID
     * @returns 新合成的灵兽，或null
     */
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

    /** 金币召唤 */
    public summonByCoins(posX: number, posY: number): DragonData | null {
        return this.summon.summonByCoins(posX, posY);
    }

    /** 龙气召唤 */
    public summonByQi(posX: number, posY: number): DragonData | null {
        return this.summon.summonByQi(500, posX, posY);
    }

    /** 天机召唤 */
    public summonByQiHigh(posX: number, posY: number): DragonData | null {
        return this.summon.summonByQiHigh(posX, posY);
    }

    /** 土命免费召唤 */
    public summonByFateFree(posX: number, posY: number): DragonData | null {
        return this.summon.summonByFateFree(posX, posY);
    }

    /** 广告召唤 */
    public summonByAd(posX: number, posY: number): DragonData | null {
        return this.summon.summonByAd(posX, posY);
    }

    /** 获取召唤消耗（金币） */
    public getSummonCost(): number {
        return this.summon.getSummonCost();
    }

    /** 获取土命免费剩余次数 */
    public getFateFreeRemaining(): number {
        return this.summon.getFateFreeRemaining();
    }

    /** 获取广告召唤剩余次数 */
    public getAdSummonRemaining(): number {
        return this.summon.getAdSummonRemaining();
    }

    // ============== 收益 ==============

    /** 获取当前金币 */
    public getCoins(): number {
        return this.save.getCoins();
    }

    /** 获取当前龙气 */
    public getDragonQi(): number {
        return this.save.getDragonQi();
    }

    /** 获取每秒产金 */
    public getCoinPerSecond(): number {
        return this.coin.calcCoinPerSecond();
    }

    /** 获取格式化产金速度 */
    public getFormattedCoinRate(): string {
        return this.coin.getFormattedCoinRate();
    }

    // ============== 离线收益 ==============

    /** 处理离线收益 */
    private processOfflineEarnings(): void {
        const lastTime = this.save.getLastOnlineTime();
        const now = Date.now();
        const offlineMs = now - lastTime;

        // 如果离线超过5分钟，触发离线收益
        if (offlineMs > 5 * 60 * 1000) {
            // 注意：离线收益在UI层面由玩家手动领取
            // 这里只记录离线时间，不自动发放
            console.log(`[GameManager] 检测到离线${Math.round(offlineMs / 60000)}分钟`);
        }
    }

    /** 领取离线收益 */
    public claimOfflineEarnings(): { coins: number; qi: number } {
        const lastTime = this.save.getLastOnlineTime();
        const now = Date.now();
        const offlineMs = now - lastTime;
        return this.coin.claimOfflineEarnings(offlineMs);
    }

    // ============== 每日刷新 ==============

    /** 处理跨天刷新 */
    private processDailyReset(): void {
        const today = this.save.getTodayString();
        const fate = this.save.getFate();

        // 土命免费次数重置
        if (fate === 2) { // 土命
            this.save.setLastFateFreeDate(today);
            // 次数在createDefaultSave中默认是3
        }

        // 广告召唤次数重置（在SummonSystem中处理）

        // 运势已刷新（在FateSystem中处理）
    }

    // ============== 状态查询 ==============

    /** 获取当前游戏状态 */
    public getState(): GameState {
        return this._state;
    }

    /** 是否已完成角色创建 */
    public isCharacterCreated(): boolean {
        return this.save.isCreated();
    }

    /** 获取玩家属相 */
    public getZodiac(): number {
        return this.save.getZodiac();
    }

    /** 获取玩家命格 */
    public getFate(): number {
        return this.save.getFate();
    }

    /** 获取当前运势 */
    public getCurrentFate(): number {
        return this.save.getCurrentFate();
    }

    /** 获取运势文字 */
    public getFateText(): string {
        return this.fate.getTodayFate().name;
    }

    /** 获取运势emoji */
    public getFateEmoji(): string {
        return this.fate.getStarsEmoji();
    }

    /** 获取当前时辰文字 */
    public getTimeString(): string {
        return this.tianJi.getCurrentTimeString();
    }

    /** 获取当前金币倍率 */
    public getCoinMult(): number {
        return this.tianJi.getCoinMult();
    }

    /** 获取最高等级灵兽 */
    public getMaxLevel(): number {
        return this.merge.getMaxLevel();
    }

    /** 获取灵兽列表 */
    public getDragons(): DragonData[] {
        return this.save.getDragons();
    }

    // ============== 私有方法 ==============

    private generateId(): string {
        return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }
}

// 方便其他模块直接引用单例
export const GM = GameManager.getInstance();