/**
 * 生肖天机 - 龙气系统
 * 龙气的获取和使用
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import { ATLAS_UNLOCK_COST, ZODIAC_DAILY_QI_BONUS, FATE_QI_MULT } from './Constants';

const { ccclass, property } = _decorator;

@ccclass('QiSystem')
export class QiSystem {
    private _save: SaveSystem;

    constructor(save: SaveSystem) {
        this._save = save;
    }

    // ============== 龙气获取 ==============

    /**
     * 添加龙气
     * @param baseAmount 基础数量
     * @returns 实际添加数量（考虑加成）
     */
    public addQi(baseAmount: number): number {
        // 今日属相加成
        const todayZodiac = this._save.getDiZhi(); // 地支0=子=鼠
        const playerZodiac = this._save.getZodiac();
        const zodiacMult = todayZodiac === playerZodiac ? (1 + ZODIAC_DAILY_QI_BONUS) : 1.0;

        // 命格加成（水命+50%）
        const fate = this._save.getFate();
        const fateMult = FATE_QI_MULT[fate] || 1.0;

        const actual = Math.floor(baseAmount * zodiacMult * fateMult);
        this._save.addDragonQi(actual);

        return actual;
    }

    /**
     * 每日祈福（每天一次，获得龙气）
     */
    public dailyBlessing(): number {
        const baseReward = 100;
        return this.addQi(baseReward);
    }

    /**
     * 观看广告获得龙气
     */
    public addQiFromAd(): number {
        return this.addQi(50);
    }

    // ============== 龙气消耗 ==============

    /**
     * 解锁图鉴
     * @param zodiac 属相索引（0~11）
     * @returns 是否解锁成功
     */
    public unlockAtlas(zodiac: number): boolean {
        // 已经解锁了
        if (this._save.isAtlasUnlocked(zodiac)) {
            console.log('[QiSystem] 该属相图鉴已解锁');
            return false;
        }

        // 龙气不足
        if (!this._save.spendDragonQi(ATLAS_UNLOCK_COST)) {
            console.log(`[QiSystem] 龙气不足，需要${ATLAS_UNLOCK_COST}`);
            return false;
        }

        this._save.unlockAtlas(zodiac);
        console.log(`[QiSystem] 解锁${zodiac}属相图鉴成功`);
        return true;
    }

    /**
     * 转命格（切换命格）
     * @param newFate 新命格索引
     */
    public changeFate(newFate: number): boolean {
        const cost = 5000;
        if (!this._save.spendDragonQi(cost)) {
            console.log(`[QiSystem] 转命格需要${cost}龙气`);
            return false;
        }

        this._save.setFate(newFate);
        console.log(`[QiSystem] 转命格为${newFate}成功`);
        return true;
    }

    // ============== 查询 ==============

    /**
     * 获取当前龙气
     */
    public getQi(): number {
        return this._save.getDragonQi();
    }

    /**
     * 获取已解锁的图鉴数量
     */
    public getUnlockedCount(): number {
        return this._save.getUnlockedAtlas().length;
    }

    /**
     * 获取某个图鉴是否已解锁
     */
    public isAtlasUnlocked(zodiac: number): boolean {
        return this._save.isAtlasUnlocked(zodiac);
    }
}