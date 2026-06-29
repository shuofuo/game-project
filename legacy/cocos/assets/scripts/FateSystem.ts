/**
 * 生肖天机 - 运势系统
 * 每日0点刷新，随机生成1~5星运势
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import { TIANGAN_NAMES, DIZHI_NAMES, FATE_BONUS } from './Constants';
import type { DailyFate } from './Types';

const { ccclass, property } = _decorator;

@ccclass('FateSystem')
export class FateSystem {
    private _save: SaveSystem;
    private _todayFate: DailyFate | null = null;

    // 运势名称库
    private readonly FATE_NAMES: { [stars: number]: string } = {
        5: '紫微星照',
        4: '吉星高照',
        3: '中平之运',
        2: '小有波折',
        1: '时运不济'
    };

    private readonly FATE_DESCS: { [stars: number]: string } = {
        5: '今日诸事顺遂，金运亨通，天机频现！',
        4: '今日运势上佳，机遇连连，收益颇丰。',
        3: '今日平稳，稳中求进，循序渐进。',
        2: '今日需谨慎，稳扎稳打，避免冒进。',
        1: '今日韬光养晦，静待时机，暗中积势。'
    };

    constructor(save: SaveSystem) {
        this._save = save;
    }

    /** 初始化（启动时调用） */
    public init(): void {
        this.refreshDaily();
    }

    /** 刷新每日运势 */
    public refreshDaily(): void {
        const today = this._save.getTodayString();

        // 如果今天的运势已经生成，直接用缓存
        if (this._save.getLastFateDate() === today && this._save.getCurrentFate() > 0) {
            const stars = this._save.getCurrentFate();
            this._todayFate = this.generateFate(stars);
            console.log(`[FateSystem] 今日运势（缓存）：${stars}星`);
            return;
        }

        // 生成新的运势
        const stars = this.randomFate();
        this._save.setCurrentFate(stars);
        this._save.setLastFateDate(today);
        this._todayFate = this.generateFate(stars);

        console.log(`[FateSystem] 今日运势（刷新）：${stars}星 - ${this.FATE_NAMES[stars]}`);
    }

    /** 获取今日运势 */
    public getTodayFate(): DailyFate {
        if (!this._todayFate) {
            this.refreshDaily();
        }
        return this._todayFate!;
    }

    /** 生成运势对象 */
    private generateFate(stars: number): DailyFate {
        const bonus = FATE_BONUS[stars] || { coin: 0, summon: '正常' };

        return {
            stars,
            coinBonus: bonus.coin,
            summonBonus: bonus.summon,
            name: this.FATE_NAMES[stars] || '中平之运',
            desc: this.FATE_DESCS[stars] || '今日平稳。',
            tiangan: TIANGAN_NAMES[this._save.getTianGan()],
            dizhi: DIZHI_NAMES[this._save.getDiZhi()]
        };
    }

    /** 随机生成运势（加权随机，越高越少） */
    private randomFate(): number {
        // 权重：3星最多，5星和1星最少
        const weights = [5, 10, 40, 30, 15]; // 1~5星的权重
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalWeight;

        for (let i = 0; i < weights.length; i++) {
            rand -= weights[i];
            if (rand <= 0) return i + 1;
        }
        return 3;
    }

    /** 获取运势文字描述（用于分享） */
    public getShareText(): string {
        const fate = this.getTodayFate();
        const zodiac = this._save.getZodiac();
        const ZODIAC_NAMES_CN = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

        return `今日【${fate.tiangan}${fate.dizhi}时辰】，我的生肖是🐉${ZODIAC_NAMES_CN[zodiac]}，${fate.name}！产金${fate.coinBonus >= 0 ? '+' : ''}${Math.round(fate.coinBonus * 100)}%！`;
    }

    /** 获取运势星级对应的星星emoji */
    public getStarsEmoji(): string {
        const stars = this._save.getCurrentFate();
        return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
    }
}