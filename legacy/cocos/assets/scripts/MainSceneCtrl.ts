/**
 * 生肖天机 - 主场景控制器
 * 处理主界面所有UI交互和拖拽合成
 */

import { _decorator, Node, Label, Button, Sprite, tween, Vec3, UITransform, EventHandler } from 'cc';
import { GM } from './GameManager';
import { ZODIAC_NAMES, ZODIAC_EMOJIS, FATE_NAMES, FATE_EMOJIS, LEVEL_NAMES } from './Constants';
import type { DragonData } from './Types';

const { ccclass, property } = _decorator;

@ccclass('MainSceneCtrl')
export class MainSceneCtrl {
    // ============== Cocos节点引用 ==============
    // 这些在 Cocos Creator 编辑器中拖拽赋值
    private coinLabel: Label | null = null;
    private qiLabel: Label | null = null;
    private rateLabel: Label | null = null;
    private summonBtn: Button | null = null;
    private qiBtn: Button | null = null;
    private fateFreeBtn: Button | null = null;
    private adBtn: Button | null = null;
    private mergeZone: Node | null = null;
    private playArea: Node | null = null;

    // ============== 状态 ==============
    private _dragonNodes: Map<string, Node> = new Map(); // id -> Node
    private _draggingId: string | null = null;           // 当前拖拽的灵兽ID
    private _mergeCandidates: string[] = [];             // 合成区的灵兽ID

    // ============== 生命周期 ==============

    /** Cocos启动时调用 */
    start(): void {
        // 初始化UI引用（通过节点名查找）
        this.initUIRef();

        // 绑定按钮事件
        this.bindEvents();

        // 渲染初始灵兽
        this.renderDragons();

        // 更新UI
        this.updateUI();

        console.log('[MainSceneCtrl] 主场景初始化完成');
    }

    /** 每帧更新 */
    update(dt: number): void {
        // 产金由 GameManager.update() 处理
        // 这里只更新UI显示（每秒更新一次就够了）
    }

    // ============== UI初始化 ==============

    private initUIRef(): void {
        // 在 Cocos Creator 中，这些节点通过编辑器拖拽赋值
        // 这里用 find() 模拟，实际项目中建议用编辑器引用
        const topBar = find('Canvas/TopBar');
        if (topBar) {
            this.coinLabel = topBar.getChildByName('CoinLabel')?.getComponent(Label) || null;
            this.qiLabel = topBar.getChildByName('QiLabel')?.getComponent(Label) || null;
            this.rateLabel = topBar.getChildByName('RateLabel')?.getComponent(Label) || null;
        }

        const bottomBar = find('Canvas/BottomBar');
        if (bottomBar) {
            this.summonBtn = bottomBar.getChildByName('SummonButton')?.getComponent(Button) || null;
            this.qiBtn = bottomBar.getChildByName('QiButton')?.getComponent(Button) || null;
            this.fateFreeBtn = bottomBar.getChildByName('FateFreeButton')?.getComponent(Button) || null;
            this.adBtn = bottomBar.getChildByName('AdButton')?.getComponent(Button) || null;
        }

        this.mergeZone = find('Canvas/PlayArea/MergeZone');
        this.playArea = find('Canvas/PlayArea');
    }

    private bindEvents(): void {
        // 召唤按钮
        if (this.summonBtn) {
            const handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'MainSceneCtrl';
            handler.handler = 'onSummonClicked';
            this.summonBtn.clickEvents.push(handler);
        }

        // 龙气召唤
        if (this.qiBtn) {
            const handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'MainSceneCtrl';
            handler.handler = 'onQiSummonClicked';
            this.qiBtn.clickEvents.push(handler);
        }

        // 土命免费
        if (this.fateFreeBtn) {
            const handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'MainSceneCtrl';
            handler.handler = 'onFateFreeClicked';
            this.fateFreeBtn.clickEvents.push(handler);
        }

        // 广告召唤
        if (this.adBtn) {
            const handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'MainSceneCtrl';
            handler.handler = 'onAdClicked';
            this.adBtn.clickEvents.push(handler);
        }
    }

    // ============== 按钮事件 ==============

    /** 金币召唤 */
    public onSummonClicked(): void {
        const cost = GM.getSummonCost();
        if (GM.getCoins() < cost) {
            this.showToast(`金币不足，需要${cost}💰`);
            return;
        }

        const pos = this.getRandomSpawnPos();
        const dragon = GM.summonByCoins(pos.x, pos.y);
        if (dragon) {
            this.createDragonNode(dragon);
            this.updateUI();
        }
    }

    /** 龙气召唤 */
    public onQiSummonClicked(): void {
        if (GM.getDragonQi() < 500) {
            this.showToast('龙气不足，需要500✨');
            return;
        }

        const pos = this.getRandomSpawnPos();
        const dragon = GM.summonByQi(pos.x, pos.y);
        if (dragon) {
            this.createDragonNode(dragon);
            this.updateUI();
        }
    }

    /** 土命免费召唤 */
    public onFateFreeClicked(): void {
        if (GM.getFateFreeRemaining() <= 0) {
            this.showToast('今日免费次数已用完');
            return;
        }

        const pos = this.getRandomSpawnPos();
        const dragon = GM.summonByFateFree(pos.x, pos.y);
        if (dragon) {
            this.createDragonNode(dragon);
            this.updateUI();
        }
    }

    /** 广告召唤 */
    public onAdClicked(): void {
        if (GM.getAdSummonRemaining() <= 0) {
            this.showToast('今日广告次数已用完');
            return;
        }

        // TODO: 接入穿山甲/快手广告
        this.showToast('广告接入中...（待实现）');
    }

    // ============== 拖拽合成 ==============

    /** 开始拖拽灵兽 */
    public onDragonTouchStart(dragonId: string): void {
        this._draggingId = dragonId;
        console.log(`[MainSceneCtrl] 开始拖拽 ${dragonId}`);
    }

    /** 拖拽中 */
    public onDragonTouchMove(dragonId: string, x: number, y: number): void {
        if (this._draggingId !== dragonId) return;

        const node = this._dragonNodes.get(dragonId);
        if (node) {
            node.setPosition(x, y, 0);

            // 检查是否进入合成区
            if (this.isInMergeZone(x, y)) {
                this.highlightMergeZone(true);
            } else {
                this.highlightMergeZone(false);
            }
        }
    }

    /** 结束拖拽 */
    public onDragonTouchEnd(dragonId: string, x: number, y: number): void {
        if (this._draggingId !== dragonId) return;
        this._draggingId = null;

        // 检查是否在合成区
        if (this.isInMergeZone(x, y)) {
            this.handleMergeAttempt(dragonId);
        }

        this.highlightMergeZone(false);
    }

    /** 处理合成尝试 */
    private handleMergeAttempt(draggingId: string): void {
        // 找另一个也在合成区的灵兽
        const allDragons = GM.getDragons();
        const draggingNode = this._dragonNodes.get(draggingId);

        if (!draggingNode) return;

        const dragPos = draggingNode.position;
        let nearestId: string | null = null;
        let nearestDist = Infinity;

        for (const d of allDragons) {
            if (d.id === draggingId) continue;

            const node = this._dragonNodes.get(d.id);
            if (!node) continue;

            // 检查是否也在合成区
            if (!this.isInMergeZone(node.position.x, node.position.y)) continue;

            // 找最近的
            const dx = node.position.x - dragPos.x;
            const dy = node.position.y - dragPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearestId = d.id;
            }
        }

        if (nearestId) {
            this.executeMerge(draggingId, nearestId);
        }
    }

    /** 执行合成 */
    private executeMerge(id1: string, id2: string): void {
        const newDragon = GM.doMerge(id1, id2);

        if (newDragon) {
            // 删除旧节点
            const node1 = this._dragonNodes.get(id1);
            const node2 = this._dragonNodes.get(id2);
            if (node1) node1.destroy();
            if (node2) node2.destroy();
            this._dragonNodes.delete(id1);
            this._dragonNodes.delete(id2);

            // 创建新节点
            this.createDragonNode(newDragon);

            // 播放合成特效（待实现）
            this.playMergeEffect(newDragon.posX, newDragon.posY);

            this.updateUI();
            this.showToast(`合成成功！Lv${newDragon.level} ${LEVEL_NAMES[newDragon.level]}！`);
        }
    }

    // ============== 节点管理 ==============

    /** 创建灵兽节点 */
    private createDragonNode(dragon: DragonData): void {
        // TODO: 使用 Cocos Creator 的 Prefab 实例化
        // 这里先打印，实际项目中创建Sprite节点并设置贴图
        console.log(`[MainSceneCtrl] 创建灵兽节点：Lv${dragon.level} at (${dragon.posX}, ${dragon.posY})`);

        // 示例代码（实际使用Prefab）：
        // const node = instantiate(this.dragonPrefab);
        // node.setPosition(dragon.posX, dragon.posY, 0);
        // node.parent = this.playArea;
        // this._dragonNodes.set(dragon.id, node);

        // 临时：用一个占位节点（红色方块，用于测试）
        // const node = new Node('Dragon_' + dragon.id);
        // const sprite = node.addComponent(Sprite);
        // sprite.color = this.getLevelColor(dragon.level);
        // node.setPosition(dragon.posX, dragon.posY, 0);
        // this.playArea?.addChild(node);
        // this._dragonNodes.set(dragon.id, node);
    }

    /** 渲染所有灵兽 */
    private renderDragons(): void {
        const dragons = GM.getDragons();
        for (const d of dragons) {
            this.createDragonNode(d);
        }
    }

    /** 播放合成特效 */
    private playMergeEffect(x: number, y: number): void {
        // TODO: 播放粒子特效或动画
        console.log(`[MainSceneCtrl] 播放合成特效 at (${x}, ${y})`);
    }

    // ============== UI更新 ==============

    /** 更新顶部UI */
    private updateUI(): void {
        if (this.coinLabel) {
            this.coinLabel.string = '💰 ' + this.formatNumber(GM.getCoins());
        }
        if (this.qiLabel) {
            this.qiLabel.string = '✨ ' + this.formatNumber(GM.getDragonQi());
        }
        if (this.rateLabel) {
            this.rateLabel.string = GM.getFormattedCoinRate();
        }

        // 更新按钮状态
        this.updateButtonLabels();
    }

    private updateButtonLabels(): void {
        // 金币召唤
        if (this.summonBtn) {
            const cost = GM.getSummonCost();
            const label = this.summonBtn.getComponentInChildren(Label);
            if (label) label.string = `召唤 ${cost}💰`;
        }

        // 龙气召唤
        if (this.qiBtn) {
            const label = this.qiBtn.getComponentInChildren(Label);
            if (label) label.string = `龙气召唤 500✨`;
        }

        // 土命免费
        if (this.fateFreeBtn) {
            const remaining = GM.getFateFreeRemaining();
            const label = this.fateFreeBtn.getComponentInChildren(Label);
            if (label) label.string = `土命免费 ${remaining}/3`;
        }

        // 广告召唤
        if (this.adBtn) {
            const remaining = GM.getAdSummonRemaining();
            const label = this.adBtn.getComponentInChildren(Label);
            if (label) label.string = `看广告 ${remaining}/5`;
        }
    }

    // ============== 辅助方法 ==============

    private getRandomSpawnPos(): { x: number; y: number } {
        return {
            x: 150 + Math.random() * 450,
            y: 200 + Math.random() * 300
        };
    }

    private isInMergeZone(x: number, y: number): boolean {
        if (!this.mergeZone) return false;
        const transform = this.mergeZone.getComponent(UITransform);
        if (!transform) return false;

        const pos = this.mergeZone.position;
        const hw = transform.width / 2;
        const hh = transform.height / 2;

        return x >= pos.x - hw && x <= pos.x + hw &&
               y >= pos.y - hh && y <= pos.y + hh;
    }

    private highlightMergeZone(highlight: boolean): void {
        if (!this.mergeZone) return;
        const sprite = this.mergeZone.getComponent(Sprite);
        if (sprite) {
            sprite.color = highlight ? new (require('cc').Color)(255, 200, 0, 255) : new (require('cc').Color)(255, 255, 255, 255);
        }
    }

    private showToast(msg: string): void {
        // TODO: 显示提示文字（用 Cocos Label 或 Prefab）
        console.log(`[提示] ${msg}`);
    }

    private formatNumber(n: number): string {
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return Math.floor(n).toString();
    }

    private getLevelColor(level: number): any {
        // 颜色渐变：Lv1浅色 -> Lv15深色
        const colors = [
            [200, 200, 200], // Lv1 灰
            [100, 200, 100], // Lv2 绿
            [100, 180, 255], // Lv3 蓝
            [255, 200, 100], // Lv4 黄
            [255, 150, 100], // Lv5 橙
            [255, 100, 100], // Lv6 红
            [255, 100, 200], // Lv7 粉
            [200, 100, 255], // Lv8 紫
            [100, 100, 255], // Lv9 深蓝
            [255, 255, 100], // Lv10 金黄
            [255, 200, 50],  // Lv11 亮金
            [255, 150, 0],   // Lv12 橙金
            [255, 100, 50],  // Lv13 红金
            [200, 50, 50],   // Lv14 深红
            [255, 215, 0],   // Lv15 金色（鸿蒙）
        ];
        const idx = Math.min(level - 1, colors.length - 1);
        const [r, g, b] = colors[idx];
        return { r, g, b, a: 255 };
    }
}