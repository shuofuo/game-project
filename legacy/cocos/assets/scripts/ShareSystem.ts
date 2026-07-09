/**
 * 生肖天机 - 分享系统
 * 生成分享文案和图片
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import { FateSystem } from './FateSystem';
import { ZODIAC_NAMES, LEVEL_NAMES } from './Constants';

const { ccclass, property } = _decorator;

@ccclass('ShareSystem')
export class ShareSystem {
    private _save: SaveSystem;
    private _fate: FateSystem;

    constructor(save: SaveSystem, fate: FateSystem) {
        this._save = save;
        this._fate = fate;
    }

    /**
     * 获取每日运势分享文案
     */
    public getDailyFateShareText(): string {
        return this._fate.getShareText();
    }

    /**
     * 获取合成成就分享文案
     * @param newLevel 合成的等级
     */
    public getMergeShareText(newLevel: number): string {
        const zodiac = this._save.getZodiac();
        const fate = this._save.getFate();
        const fateName = ['', '火', '土', '金', '水'][fate];

        return `我在【生肖天机】合成了Lv${newLevel}的${LEVEL_NAMES[newLevel]}！
用了${this._save.getMergeCount()}次合成，我的${fateName}龙终于觉醒了！`;
    }

    /**
     * 获取今日属相分享文案
     */
    public getZodiacDayShareText(): string {
        const zodiac = this._save.getZodiac();
        const todayZodiac = this._save.getDiZhi();

        if (zodiac === todayZodiac) {
            return `今天是我属相日！🐉${ZODIAC_NAMES[zodiac]}产金+30%！
你也来试试【生肖天机】，看看今天是不是你的属相日！`;
        }

        return `今天属相日是🐉${ZODIAC_NAMES[todayZodiac]}，我是🐀${ZODIAC_NAMES[zodiac]}，我的属相日是哪天？`;
    }

    /**
     * 获取天机降临分享文案
     * @param eventName 事件名称
     * @param bonus 加成描述
     */
    public getTianJiShareText(eventName: string, bonus: string): string {
        return `天机降临！🔥【生肖天机】${eventName}，${bonus}！
你也来沾沾天机！`;
    }

    /**
     * 获取图鉴解锁分享文案
     * @param zodiac 解锁的属相
     */
    public getAtlasShareText(zodiac: number): string {
        const unlocked = this._save.getUnlockedAtlas().length;
        return `我在【生肖天机】解锁了🐉${ZODIAC_NAMES[zodiac]}的图鉴！
已收集${unlocked}/12个属相，你还差几个？`;
    }

    /**
     * 获取排行榜分享文案
     * @param rank 当前排名
     */
    public getRankShareText(rank: number): string {
        return `我在【生肖天机】排行榜排第${rank}名！
你也来挑战，争夺生肖大师的称号！`;
    }

    /**
     * 获取属相对比分享文案
     * @param myZodiac 我的属相
     * @param otherZodiac 对方属相
     * @param myRate 我的产金/s
     * @param otherRate 对方产金/s
     */
    public getVsShareText(myZodiac: number, otherZodiac: number, myRate: number, otherRate: number): string {
        const myZodiacName = ZODIAC_NAMES[myZodiac];
        const otherZodiacName = ZODIAC_NAMES[otherZodiac];

        let result = '';
        if (myRate > otherRate) {
            result = `我赢了！我${myZodiacName}产金更多！`;
        } else if (myRate < otherRate) {
            result = `他${otherZodiacName}更强！不过我会赶上来的！`;
        } else {
            result = `势均力敌！都是${myZodiacName}！`;
        }

        return `🐉${myZodiacName} vs 🐀${otherZodiacName}：我的产金${myRate}/s vs ${otherRate}/s
${result}`;
    }

    /**
     * 获取天机倍率文字（用于显示）
     */
    public getCoinMultText(): string {
        // 这个在UI层面获取更合适，这里只返回格式
        return ''; // 由调用方传入实际倍率
    }
}