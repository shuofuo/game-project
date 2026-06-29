/**
 * 生肖天机 - 金币系统
 * 计算所有灵兽的产金速度，处理离线收益
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import { COIN_PER_SECOND, FATE_COIN_MULT, ZODIAC_DAILY_COIN_BONUS, OFFLINE_COIN_RATE, OFFLINE_QI_PER_HOUR, FATE_QI_MULT, FATE_OFFLINE_MULT } from './Constants';

const { ccclass, property } = _decorator;

@ccclass('CoinSystem')
export class CoinSystem {
    private _save: SaveSystem;
    private _lastUpdateTime: number = 0;

    constructor(save: SaveSystem) {
        this._save = save;
    }

    /**
     * 每帧调用，更新金币
     * @param dt 距离上一帧的秒数
     */
    public tick(dt: number): void {
        const coinsPerSecond = this.calcCoinPerSecond();
        const earned = Math.floor(coinsPerSecond * dt);
        if (earned > 0) {
            this._save.addCoins(earned);
        }
        this._lastUpdateTime = Date.now();
    }

    /**
     * 计算当前每秒产金速度
     * 基础产金 × 命格加成 × 今日属相加成 × 天机事件加成
     */
    public calcCoinPerSecond(): number {
        const dragons = this._save.getDragons();
        if (dragons.length === 0) return 0;

        // 累加所有灵兽的基础产金
        let base = 0;
        for (const d of dragons) {
            base += COIN_PER_SECOND[d.level] || 0;
        }

        // 命格加成（火命+50%）
        const fate = this._save.getFate();
        const fateMult = FATE_COIN_MULT[fate] || 1.0;

        // 今日属相加成
        const todayZodiac = this.getTodayZodiac();
        const playerZodiac = this._save.getZodiac();
        const zodiacMult = todayZodiac === playerZodiac ? (1 + ZODIAC_DAILY_COIN_BONUS) : 1.0;

        // 运势加成
        const fateBonus = this.getFateCoinBonus();

        const total = base * fateMult * zodiacMult * (1 + fateBonus);
        return total;
    }

    /**
     * 计算离线收益
     * @param offlineTimeMs 离线毫秒数
     */
    public calcOfflineEarnings(offlineTimeMs: number): { coins: number; qi: number } {
        const maxOfflineMs = 12 * 60 * 60 * 1000; // 最多12小时
        const actualMs = Math.min(offlineTimeMs, maxOfflineMs);
        const offlineHours = actualMs / (1000 * 60 * 60);

        // 基础产金速度
        const coinsPerSecond = this.calcCoinPerSecond();

        // 离线金币 = 在线速度 × 0.6 × 小时数
        const coins = Math.floor(coinsPerSecond * OFFLINE_COIN_RATE * offlineHours * 3600);

        // 离线龙气 = 每小时10 × 小时数（水命+50%）
        const fate = this._save.getFate();
        const qiPerHour = OFFLINE_QI_PER_HOUR * (FATE_QI_MULT[fate] || 1.0) * (FATE_OFFLINE_MULT[fate] || 1.0);
        const qi = Math.floor(qiPerHour * offlineHours);

        console.log(`[CoinSystem] 离线${offlineHours.toFixed(1)}小时，获得${coins}金币 + ${qi}龙气`);

        return { coins, qi };
    }

    /**
     * 领取离线收益
     */
    public claimOfflineEarnings(offlineTimeMs: number): { coins: number; qi: number } {
        const earnings = this.calcOfflineEarnings(offlineTimeMs);
        this._save.addCoins(earnings.coins);
        this._save.addDragonQi(earnings.qi);
        return earnings;
    }

    /**
     * 获取运势金币加成（小数）
     */
    public getFateCoinBonus(): number {
        const fate = this._save.getCurrentFate();
        const bonusMap: { [key: number]: number } = {
            5: 0.5,   // +50%
            4: 0.3,   // +30%
            3: 0,     // 正常
            2: -0.2,  // -20%
            1: -0.5   // -50%
        };
        return bonusMap[fate] || 0;
    }

    /**
     * 获取今日属相（根据地支轮换）
     * 子日=鼠，丑日=牛...亥日=猪，每12天一循环
     */
    private getTodayZodiac(): number {
        const dizhi = this._save.getDiZhi();
        return dizhi; // 地支0=子=鼠，地支1=丑=牛...
    }

    /**
     * 获取当前显示的每秒产金（格式化）
     */
    public getFormattedCoinRate(): string {
        const cps = this.calcCoinPerSecond();
        return this.formatNumber(cps) + '/s';
    }

    /**
     * 格式化数字（K/M/B）
     */
    public formatNumber(n: number): string {
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return Math.floor(n).toString();
    }
}