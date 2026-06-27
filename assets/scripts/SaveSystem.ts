/**
 * 生肖天机 - 存档系统
 * 负责所有数据的读取、写入、迁移
 */

import { _decorator, sys } from 'cc';
import { SAVE_KEY, FATE_FREE_COUNT, AD_SUMMON_LIMIT } from './Constants';
import type { GameSaveData, DragonData } from './Types';

const { ccclass, property } = _decorator;

@ccclass('SaveSystem')
export class SaveSystem {
    /** 当前存档 */
    private _save: GameSaveData;

    constructor() {
        this._save = this.createDefaultSave();
    }

    // ============== 公开方法 ==============

    /** 获取当前存档（只读） */
    public get save(): GameSaveData {
        return this._save;
    }

    /** 加载存档（启动时调用） */
    public load(): boolean {
        const dataStr = sys.localStorage.getItem(SAVE_KEY);
        if (!dataStr) {
            console.log('[SaveSystem] 没有存档，创建新游戏');
            this._save = this.createDefaultSave();
            return false;
        }

        try {
            const data = JSON.parse(dataStr) as GameSaveData;
            this._save = this.migrate(data);
            console.log('[SaveSystem] 存档加载成功，版本:', this._save.version);
            return true;
        } catch (e) {
            console.error('[SaveSystem] 存档解析失败:', e);
            this._save = this.createDefaultSave();
            return false;
        }
    }

    /** 保存存档（自动调用或手动调用） */
    public saveGame(): void {
        this._save.savedAt = Date.now();
        try {
            const dataStr = JSON.stringify(this._save);
            sys.localStorage.setItem(SAVE_KEY, dataStr);
            console.log('[SaveSystem] 存档已保存');
        } catch (e) {
            console.error('[SaveSystem] 存档保存失败:', e);
        }
    }

    /** 重置存档（调试用） */
    public reset(): void {
        sys.localStorage.removeItem(SAVE_KEY);
        this._save = this.createDefaultSave();
        console.log('[SaveSystem] 存档已重置');
    }

    // ============== 属性读写 ==============

    // 角色属性
    public setZodiac(zodiac: number): void { this._save.zodiac = zodiac; }
    public getZodiac(): number { return this._save.zodiac; }
    public setFate(fate: number): void { this._save.fate = fate; }
    public getFate(): number { return this._save.fate; }
    public setCreated(created: boolean): void { this._save.created = created; }
    public isCreated(): boolean { return this._save.created; }

    // 货币
    public addCoins(amount: number): void {
        this._save.coins += amount;
        this._save.totalCoinsEarned += amount;
    }
    public spendCoins(amount: number): boolean {
        if (this._save.coins >= amount) {
            this._save.coins -= amount;
            return true;
        }
        return false;
    }
    public getCoins(): number { return this._save.coins; }
    public addDragonQi(amount: number): void {
        this._save.dragonQi += amount;
        this._save.totalQiEarned += amount;
    }
    public spendDragonQi(amount: number): boolean {
        if (this._save.dragonQi >= amount) {
            this._save.dragonQi -= amount;
            return true;
        }
        return false;
    }
    public getDragonQi(): number { return this._save.dragonQi; }

    // 灵兽
    public addDragon(dragon: DragonData): void {
        this._save.dragons.push(dragon);
    }
    public removeDragon(id: string): void {
        const idx = this._save.dragons.findIndex(d => d.id === id);
        if (idx !== -1) this._save.dragons.splice(idx, 1);
    }
    public getDragons(): DragonData[] { return this._save.dragons; }

    // 统计
    public addMergeCount(): void { this._save.mergeCount++; }
    public getMergeCount(): number { return this._save.mergeCount; }
    public addSummonCount(): void { this._save.totalSummonCount++; }
    public getSummonCount(): number { return this._save.totalSummonCount; }
    public getLastSummonResetDay(): number { return this._save.lastSummonResetDay; }
    public setLastSummonResetDay(day: number): void { this._save.lastSummonResetDay = day; }

    // 离线
    public getLastOnlineTime(): number { return this._save.lastOnlineTime; }
    public setLastOnlineTime(time: number): void { this._save.lastOnlineTime = time; }

    // 土命免费召唤
    public getFateFreeCount(): number { return this._save.fateFreeCount; }
    public decFateFreeCount(): void {
        if (this._save.fateFreeCount > 0) this._save.fateFreeCount--;
    }
    public getLastFateFreeDate(): string { return this._save.lastFateFreeDate; }
    public setLastFateFreeDate(date: string): void { this._save.lastFateFreeDate = date; }

    // 广告召唤
    public getAdSummonCount(): number { return this._save.adSummonCount; }
    public incAdSummonCount(): void { this._save.adSummonCount++; }
    public getLastAdSummonDate(): string { return this._save.lastAdSummonDate; }
    public setLastAdSummonDate(date: string): void { this._save.lastAdSummonDate = date; }

    // 运势
    public getCurrentFate(): number { return this._save.currentFate; }
    public setCurrentFate(stars: number): void { this._save.currentFate = stars; }
    public getLastFateDate(): string { return this._save.lastFateDate; }
    public setLastFateDate(date: string): void { this._save.lastFateDate = date; }

    // 天机时辰
    public setTianGan(gan: number): void { this._save.tiangan = gan % 10; }
    public getTianGan(): number { return this._save.tiangan; }
    public setDiZhi(zhi: number): void { this._save.dizhi = zhi % 12; }
    public getDiZhi(): number { return this._save.dizhi; }

    // 图鉴
    public unlockAtlas(zodiac: number): boolean {
        if (!this._save.unlockedAtlas.includes(zodiac)) {
            this._save.unlockedAtlas.push(zodiac);
            return true;
        }
        return false;
    }
    public isAtlasUnlocked(zodiac: number): boolean {
        return this._save.unlockedAtlas.includes(zodiac);
    }
    public getUnlockedAtlas(): number[] {
        return [...this._save.unlockedAtlas];
    }

    // 成就
    public addAchievement(id: string): boolean {
        if (!this._save.achievements.includes(id)) {
            this._save.achievements.push(id);
            return true;
        }
        return false;
    }
    public hasAchievement(id: string): boolean {
        return this._save.achievements.includes(id);
    }
    public getAchievements(): string[] {
        return [...this._save.achievements];
    }

    // 连续登录
    public getContinuousLoginDays(): number { return this._save.continuousLoginDays; }
    public setContinuousLoginDays(days: number): void { this._save.continuousLoginDays = days; }

    // ============== 私有方法 ==============

    /** 创建默认存档 */
    private createDefaultSave(): GameSaveData {
        return {
            version: 'v1.1',
            zodiac: -1,
            fate: -1,
            created: false,
            coins: 0,
            dragonQi: 0,
            dragons: [],
            totalCoinsEarned: 0,
            totalQiEarned: 0,
            playDays: 0,
            mergeCount: 0,
            totalSummonCount: 0,
            continuousLoginDays: 0,
            summonCountResetAt: Date.now(),
            lastSummonResetDay: this.getTodayInt(),
            lastOnlineTime: Date.now(),
            lastFateDate: '',
            currentFate: 3,
            lastFateFreeDate: '',
            fateFreeCount: FATE_FREE_COUNT,
            lastAdSummonDate: '',
            adSummonCount: 0,
            tiangan: 0,
            dizhi: 0,
            unlockedAtlas: [],
            achievements: [],
            savedAt: Date.now()
        };
    }

    /** 数据迁移（版本升级时调用） */
    private migrate(data: any): GameSaveData {
        const version = data.version || 'v1.0';

        // v1.0 -> v1.1 迁移（新增字段）
        if (version === 'v1.0') {
            data.version = 'v1.1';
            data.achievements = data.achievements || [];
            data.lastFateFreeDate = data.lastFateFreeDate || '';
            data.fateFreeCount = data.fateFreeCount ?? FATE_FREE_COUNT;
            data.lastAdSummonDate = data.lastAdSummonDate || '';
            data.adSummonCount = data.adSummonCount || 0;
            data.summonCountResetAt = data.summonCountResetAt || data.savedAt;
            data.lastSummonResetDay = data.lastSummonResetDay || this.getTodayInt();
        }

        return data as GameSaveData;
    }

    /** 获取今天日期整数（如20260626） */
    private getTodayInt(): number {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    /** 获取今天日期字符串（如"2026-06-26"） */
    public getTodayString(): string {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}