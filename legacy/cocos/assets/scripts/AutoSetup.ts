/**
 * AutoSetup.ts - 启动时自动创建所有 UI 元素
 * 放在 UIRoot 节点上，start() 会自动构建完整界面
 */

import { _decorator, Node, Label, Sprite, Color } from 'cc';
import {
    ZODIAC_EMOJIS, FATE_EMOJIS, FATE_NAMES, FATE_DESCS,
    FATE_COIN_MULT, FATE_QI_MULT, FATE_EXP_MULT,
    FATE_SUMMON_BONUS, FATE_OFFLINE_MULT
} from './Constants';

const { ccclass, property } = _decorator;

@ccclass('AutoSetup')
export class AutoSetup {

    private selectedZodiac: number = -1;
    private selectedFate: number = -1;
    private zodiacNodes: Map<number, Node> = new Map();
    private fateNodes: Map<number, Node> = new Map();
    private zodiacHighlight: Node | null = null;
    private fateHighlight: Node | null = null;
    private startBtn: Node | null = null;

    /** Cocos 启动时调用 */
    start(): void {
        console.log('[AutoSetup] 开始自动创建 UI...');
        this.cleanup();
        this.buildUI();
        console.log('[AutoSetup] UI 创建完成！');
    }

    /** 清理旧的测试节点 */
    private cleanup(): void {
        const canvas = this.findCanvas();
        if (!canvas) return;
        // 删掉旧的乱码节点
        const toRemove: Node[] = [];
        canvas.children.forEach(child => {
            if (['SET','fee)'].includes(child.name) || child.name === 'Label') {
                toRemove.push(child);
            }
        });
        toRemove.forEach(n => n.destroy());
    }

    /** 找 Canvas 节点 */
    private findCanvas(): Node | null {
        const scene = cc.director.getScene();
        if (!scene) return null;
        // 先找 UIRoot
        const uiRoot = scene.getChildByName('UIRoot');
        if (!uiRoot) return null;
        // UIRoot 上如果有 Canvas 组件
        const canvas = uiRoot.getComponent(cc.Canvas);
        if (canvas && canvas.node) return canvas.node;
        // 或者找名为 Canvas 的子节点
        return uiRoot.getChildByName('Canvas') || uiRoot;
    }

    /** 构建完整 UI */
    private buildUI(): void {
        const parent = this.findCanvas();
        if (!parent) { console.error('[AutoSetup] 没找到 Canvas 节点！'); return; }

        // 标题
        const title = new Node('Title');
        title.addComponent(cc.UITransform).setContentSize(400, 60);
        const tl = title.addComponent(Label);
        tl.string = '生肖天机';
        tl.fontSize = 56;
        tl.color = new Color(255, 215, 0);
        tl.horizontalAlign = 1;
        tl.verticalAlign = 1;
        title.setPosition(0, 230);
        title.parent = parent;

        // 副标题
        const sub = new Node('Subtitle');
        const sl = sub.addComponent(Label);
        sl.string = '放置合成 · 天机降临';
        sl.fontSize = 22;
        sl.color = new Color(180, 180, 180);
        sl.horizontalAlign = 1;
        sl.verticalAlign = 1;
        sub.setPosition(0, 185);
        sub.parent = parent;

        // ===== 属相选择区 =====
        const zLabel = new Node('ZodiacLabel');
        const zl = zLabel.addComponent(Label);
        zl.string = '请选择你的属相';
        zl.fontSize = 28;
        zl.color = new Color(200, 200, 200);
        zl.horizontalAlign = 1;
        zl.verticalAlign = 1;
        zLabel.setPosition(0, 120);
        zLabel.parent = parent;

        // 属相网格 (4列×3行)
        const zGrid = new Node('ZodiacGrid');
        zGrid.setPosition(0, -20);
        zGrid.parent = parent;

        for (let i = 0; i < 12; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const node = new Node('Z_' + i);
            node.setPosition(-165 + col * 110, 80 - row * 110, 0);

            const bg = node.addComponent(Sprite);
            bg.color = new Color(50, 50, 75);
            bg.type = 1; // SLICE

            const lbl = node.addComponent(Label);
            lbl.string = ZODIAC_EMOJIS[i];
            lbl.fontSize = 42;
            lbl.horizontalAlign = 1;
            lbl.verticalAlign = 1;

            node.on(Node.EventType.TOUCH_END, () => this.onZodiacTap(i));
            node.on(Node.EventType.TOUCH_HOVERING, () => { if (this.selectedZodiac !== i) bg.color = new Color(70, 70, 100); });

            zGrid.addChild(node);
            this.zodiacNodes.set(i, node);
        }

        // ===== 命格选择区 =====
        const fLabel = new Node('FateLabel');
        const fl = fLabel.addComponent(Label);
        fl.string = '请选择命格（决定你的天赋加成）';
        fl.fontSize = 26;
        fl.color = new Color(200, 200, 200);
        fl.horizontalAlign = 1;
        fl.verticalAlign = 1;
        fLabel.setPosition(0, -230);
        fLabel.parent = parent;

        const fGrid = new Node('FateGrid');
        fGrid.setPosition(0, -310);
        fGrid.parent = parent;

        for (let i = 0; i < 5; i++) {
            const node = new Node('F_' + i);
            node.setPosition(-220 + i * 110, 0, 0);

            const bg = node.addComponent(Sprite);
            bg.color = new Color(40, 40, 65);
            bg.type = 1;

            const fateColorHexes = ['#4CAF50', '#FF5722', '#8D6E63', '#FFC107', '#2196F3'];
            const lbl = node.addComponent(Label);
            lbl.string = FATE_EMOJIS[i] + '\n' + FATE_NAMES[i] + '命';
            lbl.fontSize = 24;
            lbl.color = this.hexToColor(fateColorHexes[i]);
            lbl.horizontalAlign = 1;
            lbl.verticalAlign = 1;
            lbl.lineHeight = 32;

            node.on(Node.EventType.TOUCH_END, () => this.onFateTap(i));

            fGrid.addChild(node);
            this.fateNodes.set(i, node);
        }

        // ===== 开始按钮 =====
        this.startBtn = new Node('StartButton');
        this.startBtn.setPosition(0, -420);
        const sbBg = this.startBtn.addComponent(Sprite);
        sbBg.color = new Color(100, 80, 20);
        sbBg.type = 1;

        const sbLabel = this.startBtn.addComponent(Label);
        sbLabel.string = '开始游戏';
        sbLabel.fontSize = 36;
        sbLabel.color = new Color(255, 215, 0);
        sbLabel.horizontalAlign = 1;
        sbLabel.verticalAlign = 1;

        this.startBtn.on(Node.EventType.TOUCH_END, () => this.onStart());
        this.startBtn.parent = parent;
        this.updateStartButton();
    }

    private onZodiacTap(index: number): void {
        // 恢复上一个
        if (this.selectedZodiac >= 0) {
            const prev = this.zodiacNodes.get(this.selectedZodiac);
            if (prev) prev.getComponent(Sprite).color = new Color(50, 50, 75);
        }
        // 高亮当前
        this.selectedZodiac = index;
        const node = this.zodiacNodes.get(index)!;
        node.getComponent(Sprite).color = new Color(255, 200, 0);
        this.zodiacHighlight = node;
        console.log(`[生肖天机] 选中属相: ${index}`);
        this.updateStartButton();
    }

    private onFateTap(index: number): void {
        if (this.selectedFate >= 0) {
            const prev = this.fateNodes.get(this.selectedFate);
            if (prev) prev.getComponent(Sprite).color = new Color(40, 40, 65);
        }
        this.selectedFate = index;
        const node = this.fateNodes.get(index)!;
        node.getComponent(Sprite).color = new Color(80, 80, 130);
        this.fateHighlight = node;
        console.log(`[生肖天机] 选中命格: ${index}`);
        this.updateStartButton();
    }

    private updateStartButton(): void {
        if (!this.startBtn) return;
        const canStart = this.selectedZodiac >= 0 && this.selectedFate >= 0;
        this.startBtn.getComponent(Sprite).color = canStart
            ? new Color(180, 140, 20)
            : new Color(80, 60, 15);
        this.startBtn.getComponent(Label).string = canStart ? '开始游戏' : '请先选择属相和命格';
    }

    private hexToColor(hex: string): Color {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return new Color(r, g, b, 255);
    }

    private onStart(): void {
        if (this.selectedZodiac < 0 || this.selectedFate < 0) {
            console.log('[生肖天机] 请先选择属相和命格');
            return;
        }
        console.log(`[生肖天机] 属相:${ZODIAC_EMOJIS[this.selectedZodiac]} 命格:${FATE_EMOJIS[this.selectedFate]}${FATE_NAMES[this.selectedFate]}命 开始游戏！`);
        console.log(`  命格加成：产金×${FATE_COIN_MULT[this.selectedFate]} 龙气×${FATE_QI_MULT[this.selectedFate]} 经验×${FATE_EXP_MULT[this.selectedFate]}`);
        alert(`生肖天机\n属相：${ZODIAC_EMOJIS[this.selectedZodiac]} ${this.selectedZodiac}\n命格：${FATE_EMOJIS[this.selectedFate]}${FATE_NAMES[this.selectedFate]}命\n\n开始游戏！`);
    }
}