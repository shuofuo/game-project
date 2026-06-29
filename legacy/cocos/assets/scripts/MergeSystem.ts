/**
 * 生肖天机 - 合成系统
 * 核心玩法：两条相同等级的灵兽 → 合成更高一级
 */

import { _decorator } from 'cc';
import { SaveSystem } from './SaveSystem';
import { MAX_LEVEL, LEVEL_NAMES } from './Constants';
import type { DragonData } from './Types';

const { ccclass, property } = _decorator;

@ccclass('MergeSystem')
export class MergeSystem {
    private _save: SaveSystem;

    constructor(save: SaveSystem) {
        this._save = save;
    }

    // ============== 合成判断 ==============

    /**
     * 检查两个灵兽是否可以合成
     * 规则：等级相同 且 等级 < 15
     */
    public canMerge(d1: DragonData, d2: DragonData): boolean {
        return d1.level === d2.level && d1.level < MAX_LEVEL;
    }

    /**
     * 执行合成
     * 返回新等级的灵兽数据，或null（无法合成）
     */
    public doMerge(d1: DragonData, d2: DragonData): DragonData | null {
        if (!this.canMerge(d1, d2)) return null;

        const newLevel = d1.level + 1;

        // 在存档中移除旧的两条
        this._save.removeDragon(d1.id);
        this._save.removeDragon(d2.id);

        // 记录合成次数
        this._save.addMergeCount();

        // 生成新的灵兽（在两者的中间位置）
        const newDragon: DragonData = {
            id: this.generateId(),
            level: newLevel,
            posX: (d1.posX + d2.posX) / 2,
            posY: (d1.posY + d2.posY) / 2
        };

        // 添加新灵兽到存档
        this._save.addDragon(newDragon);

        console.log(`[MergeSystem] 合成成功：Lv${d1.level} + Lv${d2.level} → Lv${newLevel}（${LEVEL_NAMES[newLevel]}）`);

        return newDragon;
    }

    /**
     * 获取最高等级灵兽
     */
    public getMaxLevel(): number {
        const dragons = this._save.getDragons();
        let max = 0;
        for (const d of dragons) {
            if (d.level > max) max = d.level;
        }
        return max;
    }

    // ============== 私有方法 ==============

    private generateId(): string {
        return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }
}