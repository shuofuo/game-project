/**
 * 生肖天机 - 天机时辰系统
 * 实时时辰推进 + 天机事件触发
 * 
 * 天干地支规则：
 * - 12地支（时辰）：子丑寅卯辰巳午未申酉戌亥
 * - 10天干：甲乙丙丁戊己庚辛壬癸
 * - 每小时推进一个地支，10小时推进一个天干
 * - 60天干地支组合，每60小时循环一次
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import { TIANGAN_NAMES, DIZHI_NAMES } from './Constants';
import type { TianJiEvent } from './Types';

const { ccclass, property } = _decorator;

@ccclass('TianJiSystem')
export class TianJiSystem {
    private _save: SaveSystem;
    private _activeEvents: TianJiEvent[] = [];
    private _lastAdvanceTime: number = 0;

    // 天机事件数据库
    private readonly EVENT_DB: Omit<TianJiEvent, 'startTime' | 'endTime'>[] = [
        // 常驻事件
        { id: 'zi_shi', name: '子时祈福', desc: '龙气收益翻倍', coinMult: 1, qiMult: 2, summonMult: 1, duration: 2 * 3600 * 1000 },
        { id: 'wu_shi', name: '午时金光', desc: '金币产出+50%', coinMult: 1.5, qiMult: 1, summonMult: 1, duration: 2 * 3600 * 1000 },
        { id: 'shen_shi', name: '申时召唤', desc: '召唤概率翻倍', coinMult: 1, qiMult: 1, summonMult: 2, duration: 2 * 3600 * 1000 },
    ];

    constructor(save: SaveSystem) {
        this._save = save;
    }

    // ============== 公开方法 ==============

    /** 初始化（启动时调用） */
    public init(): void {
        const now = Date.now();
        const lastTime = this._save.getLastOnlineTime();
        const passed = Math.floor((now - lastTime) / 3600000); // 过了多少小时

        if (passed > 0) {
            for (let i = 0; i < passed; i++) {
                this.advanceHour();
            }
            console.log(`[TianJiSystem] 时辰推进${passed}小时`);
        }

        this.checkActiveEvents();
        this._lastAdvanceTime = now;
    }

    /** 每帧更新（用于检查事件触发） */
    public update(dt: number): void {
        const now = Date.now();
        
        // 每小时推进一次时辰（3600000ms）
        if (now - this._lastAdvanceTime >= 3600000) {
            this.advanceHour();
            this.checkActiveEvents();
            this._lastAdvanceTime = now;
        }
    }

    /** 获取当前时辰文字 */
    public getCurrentTimeString(): string {
        const gan = TIANGAN_NAMES[this._save.getTianGan()];
        const zhi = DIZHI_NAMES[this._save.getDiZhi()];
        return `${gan}${zhi}时辰`;
    }

    /** 获取当前完整天干地支 */
    public getCurrent(): { tianGan: number; diZhi: number } {
        return {
            tianGan: this._save.getTianGan(),
            diZhi: this._save.getDiZhi()
        };
    }

    /** 推进一个时辰（每小时调用） */
    public advanceHour(): void {
        // 推进地支
        let nextDiZhi = this._save.getDiZhi() + 1;
        let nextTianGan = this._save.getTianGan();
        let hoursSinceTianGan = 0;

        if (nextDiZhi >= 12) {
            nextDiZhi = 0;
            hoursSinceTianGan++;
        }

        // 每10小时推进一次天干
        // 这里简化处理：每12个地支循环，天干可能推进0或1
        // 精确的60甲子：每10个时辰天干进1，每12个地支循环
        // 简化：每12小时，天干进1
        const diZhiCount = this._save.getDiZhi();
        const newTianGanByCycles = Math.floor((diZhiCount + 1) / 12);
        nextTianGan = (this._save.getTianGan() + newTianGanByCycles) % 10;

        this._save.setDiZhi(nextDiZhi);
        this._save.setTianGan(nextTianGan);

        console.log(`[TianJiSystem] 时辰推进：${this.getCurrentTimeString()}`);
    }

    /** 检查是否触发天机事件 */
    public checkActiveEvents(): void {
        const now = Date.now();
        const { tianGan, diZhi } = this.getCurrent();
        const today = new Date();

        // 检查常驻事件（简化版）
        // 实际应根据时间自动触发，这里先写死关键时辰
        this._activeEvents = [];

        // 子时（23~01点）
        if (diZhi === 0) {
            this.triggerEvent('zi_shi', now);
        }

        // 午时（11~13点）
        if (diZhi === 6) {
            this.triggerEvent('wu_shi', now);
        }

        // 申时（15~17点，周三）
        if (diZhi === 8 && today.getDay() === 3) {
            this.triggerEvent('shen_shi', now);
        }
    }

    /** 触发事件 */
    private triggerEvent(eventId: string, now: number): void {
        const eventDef = this.EVENT_DB.find(e => e.id === eventId);
        if (!eventDef) return;

        // 检查是否已经存在该事件
        if (this._activeEvents.some(e => e.id === eventId)) return;

        const event: TianJiEvent = {
            ...eventDef,
            startTime: now,
            endTime: now + eventDef.duration
        };

        this._activeEvents.push(event);
        console.log(`[TianJiSystem] 天机降临：${event.name}，持续${eventDef.duration / 3600000}小时`);
    }

    /** 获取当前所有生效的天机事件 */
    public getActiveEvents(): TianJiEvent[] {
        const now = Date.now();
        return this._activeEvents.filter(e => now < e.endTime);
    }

    /** 获取当前金币倍率（所有天机事件叠加） */
    public getCoinMult(): number {
        const active = this.getActiveEvents();
        let mult = 1;
        for (const e of active) {
            mult *= e.coinMult;
        }
        return mult;
    }

    /** 获取当前龙气倍率 */
    public getQiMult(): number {
        const active = this.getActiveEvents();
        let mult = 1;
        for (const e of active) {
            mult *= e.qiMult;
        }
        return mult;
    }

    /** 获取当前召唤倍率 */
    public getSummonMult(): number {
        const active = this.getActiveEvents();
        let mult = 1;
        for (const e of active) {
            mult *= e.summonMult;
        }
        return mult;
    }

    /** 获取下一个天机事件的剩余时间（毫秒） */
    public getNextEventTime(): number {
        const now = Date.now();
        const active = this.getActiveEvents();
        if (active.length === 0) return -1;

        let nearest = Infinity;
        for (const e of active) {
            if (e.endTime > now && e.endTime < nearest) {
                nearest = e.endTime;
            }
        }
        return nearest === Infinity ? -1 : nearest - now;
    }
}