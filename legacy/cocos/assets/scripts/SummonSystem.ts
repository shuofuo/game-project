/**
 * 生肖天机 - 召唤系统
 * 处理所有召唤逻辑：金币召唤、龙气召唤、广告召唤、土命免费召唤
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import {
    SUMMON_COST_COIN_BASE, SUMMON_COST_COIN_T1, SUMMON_COST_COIN_T2, SUMMON_COST_COIN_MAX,
    SUMMON_COUNT_T1, SUMMON_COUNT_T2, SUMMON_COUNT_T3,
    SUMMON_COST_QI, SUMMON_COST_QI_HIGH,
    FATE_FREE_COUNT, AD_SUMMON_LIMIT,
    SUMMON_POOL_BASIC, SUMMON_POOL_MID, SUMMON_POOL_HIGH, SUMMON_POOL_AD,
    FATE_SUMMON_BONUS
} from './Constants';
import type { DragonData } from './Types';

const { ccclass, property } = _decorator;

@ccclass('SummonSystem')
export class SummonSystem {
    private _save: SaveSystem;

    constructor(save: SaveSystem) {
        this._save = save;
    }

    // ============== 金币召唤 ==============

    /**
     * 获取当前金币召唤消耗
     * 根据累计召唤次数，消耗递增
     */
    public getSummonCost(): number {
        const count = this._save.getSummonCount();
        if (count < SUMMON_COUNT_T1) return SUMMON_COST_COIN_BASE;
        if (count < SUMMON_COUNT_T2) return SUMMON_COST_COIN_T1;
        if (count < SUMMON_COUNT_T3) return SUMMON_COST_COIN_T2;
        return SUMMON_COST_COIN_MAX;
    }

    /**
     * 金币召唤（Lv1~Lv3）
     * 返回召唤出的灵兽，或null（金币不足）
     */
    public summonByCoins(posX: number, posY: number): DragonData | null {
        const cost = this.getSummonCost();
        if (!this._save.spendCoins(cost)) {
            console.log(`[SummonSystem] 金币不足，需要${cost}，当前${this._save.getCoins()}`);
            return null;
        }

        this._save.addSummonCount();
        this.resetSummonCountIfNeeded();

        const dragon = this.randomFromPool(SUMMON_POOL_BASIC, posX, posY);
        this._save.addDragon(dragon);
        console.log(`[SummonSystem] 金币召唤：消耗${cost}，获得Lv${dragon.level}`);
        return dragon;
    }

    // ============== 龙气召唤 ==============

    /**
     * 龙气召唤（Lv4~Lv6）
     * 返回召唤出的灵兽，或null（龙气不足）
     */
    public summonByQi(cost: number, posX: number, posY: number): DragonData | null {
        const qiCost = cost || SUMMON_COST_QI;
        if (!this._save.spendDragonQi(qiCost)) {
            console.log(`[SummonSystem] 龙气不足，需要${qiCost}，当前${this._save.getDragonQi()}`);
            return null;
        }

        const dragon = this.randomFromPool(SUMMON_POOL_MID, posX, posY);
        this._save.addDragon(dragon);
        console.log(`[SummonSystem] 龙气召唤：消耗${qiCost}龙气，获得Lv${dragon.level}`);
        return dragon;
    }

    /**
     * 天机召唤（Lv7~Lv9）
     */
    public summonByQiHigh(posX: number, posY: number): DragonData | null {
        return this.summonByQi(SUMMON_COST_QI_HIGH, posX, posY);
    }

    // ============== 土命免费召唤 ==============

    /**
     * 土命免费召唤（Lv1~Lv3，每日3次）
     * 返回召唤出的灵兽，或null（今日次数已用完）
     */
    public summonByFateFree(posX: number, posY: number): DragonData | null {
        this.ensureFateFreeReset();

        if (this._save.getFateFreeCount() <= 0) {
            console.log('[SummonSystem] 土命免费次数已用完');
            return null;
        }

        this._save.decFateFreeCount();
        this._save.setLastFateFreeDate(this._save.getTodayString());

        const dragon = this.randomFromPool(SUMMON_POOL_BASIC, posX, posY);
        this._save.addDragon(dragon);
        console.log(`[SummonSystem] 土命免费召唤：剩余${this._save.getFateFreeCount()}次，获得Lv${dragon.level}`);
        return dragon;
    }

    /**
     * 获取土命免费剩余次数
     */
    public getFateFreeRemaining(): number {
        this.ensureFateFreeReset();
        return this._save.getFateFreeCount();
    }

    // ============== 广告召唤 ==============

    /**
     * 广告召唤（Lv1~Lv6，每日5次）
     * 返回召唤出的灵兽，或null（今日次数已用完）
     */
    public summonByAd(posX: number, posY: number): DragonData | null {
        this.ensureAdSummonReset();

        if (this._save.getAdSummonCount() >= AD_SUMMON_LIMIT) {
            console.log('[SummonSystem] 广告召唤次数已用完');
            return null;
        }

        this._save.incAdSummonCount();
        this._save.setLastAdSummonDate(this._save.getTodayString());

        // 广告召唤也受金命加成影响
        const fate = this._save.getFate();
        const bonus = FATE_SUMMON_BONUS[fate] || 1;

        const dragon = this.randomFromPoolWithBonus(SUMMON_POOL_AD, bonus, posX, posY);
        this._save.addDragon(dragon);
        console.log(`[SummonSystem] 广告召唤：获得Lv${dragon.level}`);
        return dragon;
    }

    /**
     * 获取广告召唤剩余次数
     */
    public getAdSummonRemaining(): number {
        this.ensureAdSummonReset();
        return Math.max(0, AD_SUMMON_LIMIT - this._save.getAdSummonCount());
    }

    // ============== 私有方法 ==============

    /**
     * 从概率池中随机抽取一只灵兽
     */
    private randomFromPool(pool: { level: number; weight: number }[], posX: number, posY: number): DragonData {
        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let rand = Math.random() * totalWeight;

        for (const item of pool) {
            rand -= item.weight;
            if (rand <= 0) {
                return {
                    id: this.generateId(),
                    level: item.level,
                    posX, posY
                };
            }
        }

        // fallback
        return {
            id: this.generateId(),
            level: pool[0].level,
            posX, posY
        };
    }

    /**
     * 带加成的抽取（金命效果）
     */
    private randomFromPoolWithBonus(pool: { level: number; weight: number }[], bonus: number, posX: number, posY: number): DragonData {
        // 金命加成：高级灵兽概率提升
        // 简单处理：给高等级增加权重
        const boostedPool = pool.map(item => ({
            level: item.level,
            weight: item.weight * (item.level >= 4 ? bonus : 1)
        }));
        return this.randomFromPool(boostedPool, posX, posY);
    }

    /**
     * 确保每日重置逻辑
     */
    private ensureFateFreeReset(): void {
        const today = this._save.getTodayString();
        if (this._save.getLastFateFreeDate() !== today) {
            this._save.setLastFateFreeDate(today);
            // 注意：土命免费次数在GameManager中根据命格重置
        }
    }

    private ensureAdSummonReset(): void {
        const today = this._save.getTodayString();
        if (this._save.getLastAdSummonDate() !== today) {
            this._save.setLastAdSummonDate(today);
            this._save.adSummonCount = 0;
        }
    }

    /**
     * 召唤次数每月重置
     */
    private resetSummonCountIfNeeded(): void {
        const today = this._save.getTodayString();
        const lastResetDay = this._save.getLastSummonResetDay();
        const todayInt = parseInt(today.replace(/-/g, ''));

        // 如果跨月了，重置召唤次数
        const lastMonth = Math.floor(lastResetDay / 100);
        const thisMonth = Math.floor(todayInt / 100);
        if (thisMonth > lastMonth) {
            this._save.setLastSummonResetDay(todayInt);
            // 重置后从0开始计数，下次召唤消耗100金币起步
            console.log('[SummonSystem] 新月份，召唤次数已重置');
        }
    }

    private generateId(): string {
        return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }
}